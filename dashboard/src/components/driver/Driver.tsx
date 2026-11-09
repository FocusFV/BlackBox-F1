"use client";
import { useHeadToHeadStore } from "@/stores/useHeadToHeadStore";
import { useDriverModalStore } from "@/stores/useDriverModalStore";

import { useMemo } from "react";
import clsx from "clsx";
import { motion } from "motion/react";

import type { Driver, TimingDataDriver } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";
import { triggerHaptic } from "@/lib/haptics";
import { resolveDriverColor } from "@/lib/teamcolors";
import { parseLapTimeToMs, getFastestLapInSession } from "@/lib/lapTime";
import { isFavoriteDriver } from "@/lib/favoriteDriver";
import { isDriverFinished } from "@/lib/driverFinished";

import DriverTag from "./DriverTag";
import DriverDRS from "./DriverDRS";
import DriverGap from "./DriverGap";
import DriverTire from "./DriverTire";
import DriverMiniSectors from "./DriverMiniSectors";
import DriverLapTime from "./DriverLapTime";
import DriverInfo from "./DriverInfo";
import DriverCarMetrics from "./DriverCarMetrics";
import ChequeredFlagStrip from "./ChequeredFlagStrip";

type Props = {
	position: number;
	driver: Driver;
	timingDriver: TimingDataDriver;
	teamColor?: string; // 🌟 LE AGREGAMOS EL '?' ACÁ PARA HACERLA OPCIONAL
	cumulativeGap?: string;
	intervalGap?: string;
};

const inDangerZone = (position: number, sessionPart: number) => {
	switch (sessionPart) {
		case 1:
			return position > 15;
		case 2:
			return position > 10;
		case 3:
		default:
			return false;
	}
};

export default function Driver({ driver, timingDriver, position, teamColor, cumulativeGap, intervalGap }: Props) {
	const session = useDataStore((state) => state.state?.SessionInfo);
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const sessionPart = useDataStore((state) => state.state?.TimingData?.SessionPart);
	const timingStatsDriver = useDataStore((state) => state.state?.TimingStats?.Lines[driver.RacingNumber]);
	const appTimingDriver = useDataStore((state) => state.state?.TimingAppData?.Lines[driver.RacingNumber]);
	const carData = useDataStore((state) => (state?.carsData ? state.carsData[driver.RacingNumber]?.Channels : undefined));
	const raceControlMessages = useDataStore((state) => state.state?.RaceControlMessages?.Messages);
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);

	const isRaceOrSprint = Boolean(
		session?.Name === "Race" ||
		session?.Name === "Sprint" ||
		session?.Type === "Race" ||
		(lapCount?.TotalLaps && lapCount.TotalLaps > 0)
	);

	const isQualy = !isRaceOrSprint && Boolean(
		session?.Name?.toLowerCase().includes("qual") ||
		session?.Type?.toLowerCase().includes("qual") ||
		session?.Name?.toLowerCase().includes("shootout") ||
		sessionPart
	);

	const isEliminated = isQualy && Boolean(timingDriver.KnockedOut);

	// 🏁 Detección en tiempo real: ¿Ya tomó la bandera a cuadros este monoplaza individualmente?
	const isFinished = isDriverFinished({
		timingDriver,
		position,
		sessionName: session?.Name,
		sessionType: session?.Type,
		sessionStatus,
		totalLaps: lapCount?.TotalLaps,
		currentLap: lapCount?.CurrentLap,
		raceControlMessages,
	});

	// 🟣 VUELTA RÁPIDA REAL Y VERIFICADA DE LA SESIÓN:
	// Buscamos el mejor tiempo absoluto de la sesión en toda la grilla para evitar que deltas residuales pinten de lila a pilotos lentos
	const allTimingLines = useDataStore((state) => state.state?.TimingData?.Lines);
	const sessionFastestMs = useMemo(() => getFastestLapInSession(allTimingLines), [allTimingLines]);

	const driverBestMs = parseLapTimeToMs(timingDriver.BestLapTime?.Value);
	const hasFastest = Boolean(
		driverBestMs !== null &&
		sessionFastestMs !== null &&
		driverBestMs <= sessionFastestMs &&
		driverBestMs > 45000
	);

	const driverLastMs = parseLapTimeToMs(timingDriver.LastLapTime?.Value);

	// La última vuelta solo es púrpura si coincide exactamente con el récord de la sesión
	const isLastOverallFastest = Boolean(
		driverLastMs !== null &&
		sessionFastestMs !== null &&
		driverLastMs <= sessionFastestMs &&
		driverLastMs > 45000
	);

	// La última vuelta es verde (personal best) solo si coincide con su propio mejor tiempo
	const isLastPersonalFastest = Boolean(
		!isLastOverallFastest &&
		driverLastMs !== null &&
		driverBestMs !== null &&
		driverLastMs <= driverBestMs &&
		timingDriver.LastLapTime?.PersonalFastest
	);

	const carMetrics = useSettingsStore((state) => state.carMetrics);
	const gridDensity = useSettingsStore((state) => state.gridDensity);
	const isCompact = gridDensity === "compact";

	const favoriteDriver = useSettingsStore((state) =>
		isFavoriteDriver(driver ?? timingDriver, state.favoriteDrivers)
	);

	const speeds = timingDriver?.Speeds as any;
	const trapSpeed = speeds?.ST?.Value || speeds?.St?.Value || speeds?.FL?.Value || speeds?.Fl?.Value || speeds?.I2?.Value || speeds?.I1?.Value;
	const trapLabel = (speeds?.ST?.Value || speeds?.St?.Value) ? "ST" : ((speeds?.FL?.Value || speeds?.Fl?.Value) ? "FL" : (speeds?.I2?.Value ? "I2" : ""));

	// ⚡ LÓGICA INTELIGENTE DE BOOST / DRS (Manual Override 2026 & FIA Timing)
	const trackStatusCode = useDataStore((state) => state.state?.TrackStatus?.Status);
	// DRS / Boost deshabilitado bajo Safety Car (4), Red Flag (5) o VSC (6, 7)
	const isDrsDisabledByRaceControl =
		trackStatusCode === "4" || trackStatusCode === "5" || trackStatusCode === "6" || trackStatusCode === "7";

	const parseInterval = (val?: string): number | null => {
		if (!val) return null;
		const clean = String(val).replace("+", "").trim();
		if (clean.includes("LAP") || clean.includes("L") || clean.includes("-")) return null;
		const num = parseFloat(clean);
		return isNaN(num) ? null : num;
	};

	const gapToFrontStr =
		timingDriver.IntervalToPositionAhead?.Value ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0]?.TimeDifftoPositionAhead : undefined) ??
		timingDriver.TimeDiffToPositionAhead;

	const intervalSeconds = parseInterval(gapToFrontStr);
	// Elegible para Boost / DRS si está a 1.0s o menos del auto de adelante en carrera
	const isEligibleByGap = position > 1 && intervalSeconds !== null && intervalSeconds > 0 && intervalSeconds <= 1.0;

	// Telemetría directa ECU canal 45
	const rawDrs = carData ? Number(carData[45]) : undefined;
	const isTelemetryDrsOn = rawDrs !== undefined && rawDrs >= 10;
	const isTelemetryDrsPossible = rawDrs === 8;

	// Detección de aceleración a fondo en recta: acelerador > 85% y alta velocidad / marchas altas
	const isFullThrottleStraight = Boolean(
		carData &&
		carData[4] >= 85 && // Acelerador > 85%
		(carData[2] >= 250 || carData[3] >= 6) // Velocidad > 250 km/h o marcha 6, 7 u 8
	);

	let isBoostOn = false;
	let isBoostPossible = false;

	if (!isDrsDisabledByRaceControl && !timingDriver.InPit && !timingDriver.PitOut && !timingDriver.Retired && !timingDriver.Stopped) {
		if (isTelemetryDrsOn) {
			isBoostOn = true;
		} else if (isRaceOrSprint) {
			if (isEligibleByGap) {
				if (isFullThrottleStraight) {
					isBoostOn = true;
				} else {
					isBoostPossible = true;
				}
			} else if (isTelemetryDrsPossible) {
				isBoostPossible = true;
			}
		} else if (isQualy) {
			// En clasificación todos tienen DRS/Boost en zonas activas
			if (isFullThrottleStraight) {
				isBoostOn = true;
			} else {
				isBoostPossible = true;
			}
		}
	}

	return (
		<motion.div
			layout="position"
			whileHover={{ x: 3 }}
			onClick={() => {
				triggerHaptic("medium");
				useDriverModalStore.getState().open({
					driverCode: driver?.Tla,
					code: driver?.Tla,
					name: driver?.FullName || driver?.BroadcastName,
					teamName: driver?.TeamName,
					driverId: driver?.Tla?.toLowerCase(),
				});
			}}
			className={clsx(
				"group/driver flex flex-col gap-1 rounded-lg select-none transition-all duration-200 cursor-pointer border bg-zinc-950/40 border-zinc-900/60 hover:border-zinc-700/70 hover:bg-zinc-900/50",
				isCompact ? "p-1" : "p-1.5",
				{
					"opacity-40 grayscale": isEliminated || timingDriver.Retired || timingDriver.Stopped,
					"border-amber-400/50 bg-amber-950/20 shadow-[0_0_14px_rgba(245,158,11,0.15)]": isFinished && position === 1,
					"bg-violet-950/40 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]": hasFastest && (!isFinished || position !== 1),
					"bg-red-950/40 border-red-500/50": isQualy && sessionPart != undefined && inDangerZone(position, sessionPart),
					"border-amber-500/70! bg-gradient-to-r! from-amber-500/15 via-zinc-950/90 to-zinc-950/40 border-l-4! border-l-amber-400! shadow-[0_0_16px_rgba(245,158,11,0.18)]": Boolean(timingDriver.InPit),
					"border-cyan-500/60! bg-gradient-to-r! from-cyan-500/10 via-zinc-950/90 to-zinc-950/40 border-l-4! border-l-cyan-400! shadow-[0_0_14px_rgba(6,182,212,0.15)]": Boolean(timingDriver.PitOut && !timingDriver.InPit),
				}
			)}
		>
			<div
				className="grid items-center gap-2"
				style={{
					gridTemplateColumns: carMetrics
						? "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto 13rem"
						: "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto",
				}}
			>
				{/* 🌟 Color oficial normalizado (ej. Alpine Rosa BWT, Ferrari Rojo, Williams Azul) */}
				<DriverTag
					className="min-w-full!"
					short={driver?.Tla || ""}
					teamColor={teamColor || resolveDriverColor(driver?.Tla, driver?.TeamName, driver?.TeamColour)}
					position={position}
					isFavorite={favoriteDriver}
				/>
				<DriverDRS
					on={isBoostOn}
					possible={isBoostPossible}
					inPit={timingDriver.InPit}
					pitOut={timingDriver.PitOut}
				/>
				<DriverTire stints={appTimingDriver?.Stints} />
				<DriverInfo
					timingDriver={timingDriver}
					gridPos={appTimingDriver?.GridPos ? parseInt(appTimingDriver.GridPos, 10) : undefined}
				/>
				<DriverGap
					timingDriver={timingDriver}
					sessionPart={sessionPart}
					cumulativeGap={cumulativeGap}
					intervalGap={intervalGap}
					position={position}
				/>
				<DriverLapTime
					last={timingDriver.LastLapTime}
					best={timingDriver.BestLapTime}
					hasFastest={hasFastest}
					isLastOverallFastest={isLastOverallFastest}
					isLastPersonalFastest={isLastPersonalFastest}
					inPit={timingDriver.InPit}
					pitOut={timingDriver.PitOut}
				/>
				<div className="flex items-center gap-2">
					<DriverMiniSectors sectors={timingDriver.Sectors} bestSectors={timingStatsDriver?.BestSectors} />
					{isFinished && <ChequeredFlagStrip />}
				</div>

				{carMetrics && (
					carData ? (
						<DriverCarMetrics carData={carData} />
					) : (
						<div className="flex items-center gap-2 place-self-start font-mono select-none">
							<div
								className={clsx(
									"flex h-7 w-8 items-center justify-center rounded-md border text-[10px] font-black transition-all",
									timingDriver?.InPit
										? "border-amber-500/50 bg-amber-950/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
										: "border-emerald-500/40 bg-emerald-950/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
								)}
								title={timingDriver?.InPit ? "Monoplaza en Boxes" : "Monoplaza en Pista"}
							>
								{timingDriver?.InPit ? "BOX" : "PISTA"}
							</div>
							<div className="min-w-[3.4rem]">
								<p className="text-right text-sm font-black text-zinc-300 tabular-nums leading-none tracking-tight">
									{timingDriver?.InPit ? "0" : (trapSpeed || "--")}
								</p>
								<p className="text-right text-[8px] font-bold text-zinc-500 uppercase leading-none mt-0.5">
									{timingDriver?.InPit ? "km/h" : (trapSpeed ? `${trapLabel || ""} km/h`.trim() : "km/h")}
								</p>
							</div>
							<div 
								className="flex flex-col gap-1 text-[8px] font-bold opacity-50 cursor-help"
								title="Telemetría de pedales y RPM: Señal de ECU en espera (requiere transmisión oficial F1 TV Pro)"
							>
								<div className="flex items-center gap-1">
									<span className="w-4 text-right text-[7px] text-zinc-500 font-bold leading-none">FRE</span>
									<div className="h-1.5 w-14 rounded-full bg-zinc-900 border border-zinc-800/80" />
								</div>
								<div className="flex items-center gap-1">
									<span className="w-4 text-right text-[7px] text-zinc-500 font-bold leading-none">ACE</span>
									<div className="h-1.5 w-14 rounded-full bg-zinc-900 border border-zinc-800/80" />
								</div>
								<div className="flex items-center gap-1">
									<span className="w-4 text-right text-[7px] text-zinc-500 font-bold leading-none">RPM</span>
									<div className="h-1.5 w-14 rounded-full bg-zinc-900 border border-zinc-800/80" />
								</div>
							</div>
						</div>
					)
				)}
			</div>
		</motion.div>
	);
}