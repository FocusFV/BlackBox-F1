"use client";

import clsx from "clsx";
import { motion } from "motion/react";

import type { Driver, TimingDataDriver } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";
import { triggerHaptic } from "@/lib/haptics";
import { resolveDriverColor } from "@/lib/teamcolors";

import DriverTag from "./DriverTag";
import DriverDRS from "./DriverDRS";
import DriverGap from "./DriverGap";
import DriverTire from "./DriverTire";
import DriverMiniSectors from "./DriverMiniSectors";
import DriverLapTime from "./DriverLapTime";
import DriverInfo from "./DriverInfo";
import DriverCarMetrics from "./DriverCarMetrics";

type Props = {
	position: number;
	driver: Driver;
	timingDriver: TimingDataDriver;
	teamColor?: string; // 🌟 LE AGREGAMOS EL '?' ACÁ PARA HACERLA OPCIONAL
};

const hasDRS = (drs: number) => drs > 9;

const possibleDRS = (drs: number) => drs === 8;

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

export default function Driver({ driver, timingDriver, position, teamColor }: Props) {
	const session = useDataStore((state) => state.state?.SessionInfo);
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const sessionPart = useDataStore((state) => state.state?.TimingData?.SessionPart);
	const timingStatsDriver = useDataStore((state) => state.state?.TimingStats?.Lines[driver.RacingNumber]);
	const appTimingDriver = useDataStore((state) => state.state?.TimingAppData?.Lines[driver.RacingNumber]);
	const carData = useDataStore((state) => (state?.carsData ? state.carsData[driver.RacingNumber]?.Channels : undefined));

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

	const hasFastest = timingStatsDriver?.PersonalBestLapTime.Position == 1;

	const carMetrics = useSettingsStore((state) => state.carMetrics);
	const gridDensity = useSettingsStore((state) => state.gridDensity);
	const isCompact = gridDensity === "compact";

	const favoriteDriver = useSettingsStore((state) => {
		const list = state.favoriteDrivers || [];
		const num = String(driver?.RacingNumber ?? timingDriver?.RacingNumber ?? "").trim();
		const tla = String(driver?.Tla ?? "").trim().toUpperCase();
		return list.some((fav) => {
			const f = String(fav).trim();
			return f === num || (tla && f.toUpperCase() === tla);
		});
	});

	const speeds = timingDriver?.Speeds as any;
	const trapSpeed = speeds?.ST?.Value || speeds?.St?.Value || speeds?.FL?.Value || speeds?.Fl?.Value || speeds?.I2?.Value || speeds?.I1?.Value;
	const trapLabel = (speeds?.ST?.Value || speeds?.St?.Value) ? "ST" : ((speeds?.FL?.Value || speeds?.Fl?.Value) ? "FL" : (speeds?.I2?.Value ? "I2" : ""));

	return (
		<motion.div
			layout="position"
			whileHover={{ x: 3 }}
			onClick={() => triggerHaptic("light")}
			className={clsx(
				"group/driver flex flex-col gap-1 rounded-lg select-none transition-all duration-200 cursor-pointer border bg-zinc-950/40 border-zinc-900/60 hover:border-zinc-700/70 hover:bg-zinc-900/50",
				isCompact ? "p-1" : "p-1.5",
				{
					"opacity-40 grayscale": isEliminated || timingDriver.Retired || timingDriver.Stopped,
					"bg-violet-950/40 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]": hasFastest,
					"bg-red-950/40 border-red-500/50": isQualy && sessionPart != undefined && inDangerZone(position, sessionPart),
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
					on={carData ? hasDRS(carData[45]) : false}
					possible={carData ? possibleDRS(carData[45]) : false}
					inPit={timingDriver.InPit}
					pitOut={timingDriver.PitOut}
				/>
				<DriverTire stints={appTimingDriver?.Stints} />
				<DriverInfo
					timingDriver={timingDriver}
					gridPos={appTimingDriver?.GridPos ? parseInt(appTimingDriver.GridPos, 10) : undefined}
				/>
				<DriverGap timingDriver={timingDriver} sessionPart={sessionPart} />
				<DriverLapTime last={timingDriver.LastLapTime} best={timingDriver.BestLapTime} hasFastest={hasFastest} />
				<DriverMiniSectors sectors={timingDriver.Sectors} bestSectors={timingStatsDriver?.BestSectors} />

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