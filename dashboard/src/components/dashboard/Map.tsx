"use client";

import { useTranslation } from "@/hooks/useTranslation";
import F1CarTopDown from "./F1CarTopDown";

/* eslint-disable react-hooks/refs */
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import type { PositionCar, TimingDataDriver } from "@/types/state.type";
import type { Map as MapType, TrackPosition } from "@/types/map.type";

import { fetchMap } from "@/lib/fetchMap";

import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";
import { parseUtcMs, parseFomClockRemaining, formatMsToClock, getScheduledSessionStartMs, formatMsToCountdownParts } from "@/lib/clockParser";
import { isFavoriteDriver } from "@/lib/favoriteDriver";
import {
	createSectors,
	findYellowSectors,
	getSectorColor,
	type MapSector,
	prioritizeColoredSectors,
	rad,
	rotate,
	findMinDistance,
} from "@/lib/map";

// 🏎️ DICCIONARIO FocusFV OFICIAL 2026
const TEAM_COLORS_2026: Record<string, { bg: string; text: string }> = {
	VER: { bg: "#00b3ff", text: "#ffffff" },
	HAD: { bg: "#00b3ff", text: "#ffffff" },
	RUS: { bg: "#00ffdf", text: "#ffffff" },
	ANT: { bg: "#00ffdf", text: "#ffffff" },
	VES: { bg: "#00ffdf", text: "#ffffff" },
	LEC: { bg: "#e10600", text: "#ffffff" },
	HAM: { bg: "#e10600", text: "#ffffff" },
	ZHO: { bg: "#e10600", text: "#ffffff" },
	GIO: { bg: "#e10600", text: "#ffffff" },
	NOR: { bg: "#ff8700", text: "#ffffff" },
	PIA: { bg: "#ff8700", text: "#ffffff" },
	OWA: { bg: "#ff8700", text: "#ffffff" },
	FOR: { bg: "#ff8700", text: "#ffffff" },
	ALO: { bg: "#00ffb7", text: "#ffffff" },
	STR: { bg: "#00ffb7", text: "#ffffff" },
	CRA: { bg: "#00ffb7", text: "#ffffff" },
	VAN: { bg: "#00ffb7", text: "#ffffff" },
	GAS: { bg: "#ff00ff", text: "#ffffff" },
	COL: { bg: "#ff00ff", text: "#ffffff" },
	ARO: { bg: "#ff00ff", text: "#ffffff" },
	MAI: { bg: "#ff00ff", text: "#ffffff" },
	MAG: { bg: "#f3f4f6", text: "#ffffff" },
	DOO: { bg: "#f3f4f6", text: "#ffffff" },
	HIR: { bg: "#f3f4f6", text: "#ffffff" },
	SAI: { bg: "#0040ff", text: "#ffffff" },
	ALB: { bg: "#0040ff", text: "#ffffff" },
	BRO: { bg: "#0040ff", text: "#ffffff" },
	HUL: { bg: "#bdff00", text: "#ffffff" },
	BOR: { bg: "#bdff00", text: "#ffffff" },
	PER: { bg: "#94A3B8", text: "#000000" },
	BOT: { bg: "#94A3B8", text: "#000000" },
	HER: { bg: "#ffcc00", text: "#ffffff" },
};

const SPACE = 1000;
const ROTATION_FIX = 90;

type Corner = {
	number: number;
	pos: TrackPosition;
	labelPos: TrackPosition;
};

function smoothAngle(prevAngle: number, newAngle: number): number {
	let diff = (newAngle - prevAngle) % 360;
	if (diff > 180) diff -= 360;
	if (diff < -180) diff += 360;
	return prevAngle + diff;
}

export default function Map({ filter, circuitKey: propCircuitKey }: { filter?: string[]; circuitKey?: number }) {
	const { t, language } = useTranslation();
	const showCornerNumbers = useSettingsStore((state) => state.showCornerNumbers);
	const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);

	// 🛡️ Compatible con TypeScript estricto y seguro ante objetos incompletos
	const storeCircuitKey = useDataStore((state) => 
		state?.state?.SessionInfo?.Meeting?.Circuit?.Key ?? 
		(state?.state?.SessionInfo as any)?.Circuit?.Key
	);
	const circuitKey = propCircuitKey ?? storeCircuitKey ?? 152;

	const rawDrivers = useDataStore((state) => state?.state?.DriverList);
	const rawTiming = useDataStore((state) => state?.state?.TimingData);

	const mockDrivers = useMemo(() => {
		const tlas = Object.keys(TEAM_COLORS_2026);
		const list: any = {};
		tlas.forEach((tla, i) => {
			const num = String(10 + i);
			list[num] = { RacingNumber: num, Tla: tla, TeamName: tla, TeamColour: TEAM_COLORS_2026[tla].bg };
		});
		return list;
	}, []);

	const mockTiming = useMemo(() => {
		const list = Object.keys(mockDrivers);
		const lines: any = {};
		list.forEach((num, i) => {
			lines[num] = { RacingNumber: num, Position: String(i + 1), Sectors: [] };
		});
		return { Lines: lines };
	}, [mockDrivers]);

	// 🏁 SWITCH EN VIVO: Si no hay datos reales en pista, no renderiza la simulación mock
	const drivers = rawDrivers && Object.keys(rawDrivers).length > 0 ? rawDrivers : null;
	const timingDrivers = rawTiming && Object.keys(rawTiming.Lines || {}).length > 0 ? rawTiming : null;

	const trackStatus = useDataStore((state) => state?.state?.TrackStatus);
	const raceControlMessages = useDataStore((state) => state?.state?.RaceControlMessages?.Messages ?? undefined);
	const sessionInfo = useDataStore((state) => state?.state?.SessionInfo);
	const sessionStatus = useDataStore((state) => state?.state?.SessionStatus?.Status);
	const lapCount = useDataStore((state) => state?.state?.LapCount);
	const clock = useDataStore((state) => state?.state?.ExtrapolatedClock);
	const positions = useDataStore((state) => state.positions);
	const prevCarsRef = useRef<Record<string, { x: number; y: number; angle: number }>>({});
	const driverProgressRef = useRef<Record<string, { lastSegment: number; lastChangeTime: number; baseRatio: number }>>({});
	const [currentTime, setCurrentTime] = useState<number>(0);

	useEffect(() => {
		setCurrentTime(Date.now());
		let animId: number;
		const loop = () => {
			setCurrentTime(Date.now());
			animId = requestAnimationFrame(loop);
		};
		animId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animId);
	}, []);

	const isRaceOrSprint = Boolean(
		sessionInfo?.Name === "Race" ||
		sessionInfo?.Name === "Sprint" ||
		sessionInfo?.Type === "Race" ||
		(lapCount?.TotalLaps && lapCount.TotalLaps > 0)
	);

	const isQualy = !isRaceOrSprint && Boolean(
		sessionInfo?.Name?.toLowerCase().includes("qual") ||
		sessionInfo?.Type?.toLowerCase().includes("qual") ||
		sessionInfo?.Name?.toLowerCase().includes("shootout") ||
		rawTiming?.SessionPart
	);

	const sessionPart = rawTiming?.SessionPart || 1;
	const isQualyEarlyPart = Boolean(
		isQualy &&
		sessionPart < 3 &&
		sessionInfo?.ArchiveStatus?.Status !== "Complete"
	);

	const isSessionTerminated = Boolean(
		!isQualyEarlyPart &&
		(sessionStatus === "Ends" ||
			sessionStatus === "Finalised" ||
			(sessionStatus === "Finished" && (!isQualy || sessionPart >= 3)) ||
			(sessionInfo as any)?.SessionStatus === "Finalised" ||
			(sessionInfo as any)?.SessionStatus === "Ends" ||
			sessionInfo?.ArchiveStatus?.Status === "Complete" ||
			(isRaceOrSprint && !!lapCount && lapCount.CurrentLap > 0 && lapCount.CurrentLap >= lapCount.TotalLaps))
	);

	const hasCarsRunning = Boolean(
		rawTiming?.Lines &&
		Object.values(rawTiming.Lines).some((l: any) => !l.InPit && !(isQualy && l.KnockedOut) && !l.Retired && !l.Stopped)
	);

	const isTrackActive = !isSessionTerminated && (trackStatus?.Status === "1" || hasCarsRunning);
	const isEnded = isSessionTerminated;

	// Detectar si todos los monoplazas están en boxes o en pausa entre fases de Qualy
	const allInPit = Boolean(
		rawTiming?.Lines &&
		Object.values(rawTiming.Lines).length > 0 &&
		Object.values(rawTiming.Lines).every((l: any) => l.InPit)
	);

	// 🔴 DETECCIÓN DE BANDERA ROJA OFICIAL:
	const lastRedMsg = raceControlMessages?.filter(
		(m) => m.Flag === "RED" || m.Message?.toUpperCase().includes("RED FLAG") || m.Message?.toUpperCase().includes("SUSPENDED")
	).slice(-1)[0];
	const lastRedMs = parseUtcMs(lastRedMsg?.Utc);

	const lastGreenMsg = raceControlMessages?.filter(
		(m) => m.Flag === "GREEN" ||
			m.Message?.toUpperCase().includes("GREEN LIGHT") ||
			m.Message?.toUpperCase().includes("PIT LANE OPEN") ||
			m.Message?.toUpperCase().includes("SESSION RESUMED") ||
			m.Message?.toUpperCase().includes("TRACK CLEAR")
	).slice(-1)[0];
	const lastGreenMs = parseUtcMs(lastGreenMsg?.Utc);

	const chequeredMessages = raceControlMessages?.filter(
		(m) => m.Flag === "CHEQUERED" || m.Message?.toUpperCase().includes("CHEQUERED")
	);
	const lastChequered = chequeredMessages && chequeredMessages.length > 0
		? chequeredMessages[chequeredMessages.length - 1]
		: null;
	const breakStartMs = parseUtcMs(lastChequered?.Utc);
	const lastChequeredMs = breakStartMs;

	const isRedFlag =
		trackStatus?.Status === "5" ||
		(lastRedMs !== null &&
			(!lastGreenMs || lastRedMs > lastGreenMs) &&
			(!lastChequeredMs || lastRedMs > lastChequeredMs) &&
			trackStatus?.Status !== "1" &&
			trackStatus?.Status !== "2" &&
			trackStatus?.Status !== "4" &&
			trackStatus?.Status !== "6" &&
			trackStatus?.Status !== "7");

	const breakDurationMs = (sessionPart === 1 ? 7 : 8) * 60 * 1000;
	const elapsedSinceChequered = breakStartMs ? Math.max(0, (currentTime || breakStartMs) - breakStartMs) : 0;
	const isChequeredActive = Boolean(
		lastChequered &&
		breakStartMs &&
		(!lastGreenMs || breakStartMs >= lastGreenMs) &&
		elapsedSinceChequered <= breakDurationMs + 60_000
	);

	const scheduledStartMs = getScheduledSessionStartMs(sessionInfo);

	const hasActiveTiming = Boolean(
		!isSessionTerminated &&
		rawTiming?.Lines &&
		Object.values(rawTiming.Lines).some((line: any) =>
			Boolean(
				line?.LastLapTime?.Value ||
				line?.BestLapTime?.Value ||
				line?.Sectors?.some((s: any) => Boolean(s?.Value))
			)
		)
	);

	const hasCarsOnTrack = Boolean(
		rawTiming?.Lines &&
		Object.values(rawTiming.Lines).some((l: any) => !l.InPit && !(isQualy && l.KnockedOut) && !l.Retired && !l.Stopped)
	);

	const hasPartStarted = Boolean(
		hasActiveTiming ||
		hasCarsOnTrack ||
		(lastGreenMs && (!scheduledStartMs || lastGreenMs >= scheduledStartMs - 10 * 60 * 1000))
	);

	const isQualyBreak = Boolean(isQualy && sessionPart < 3 && allInPit && !isEnded && !isRedFlag && isChequeredActive);
	const nextPartName = sessionPart === 1 ? "Q2" : "Q3";

	// ⏳ Previa de Clasificación
	const isPreQualy = Boolean(
		isQualy &&
		sessionPart === 1 &&
		!isQualyBreak &&
		!hasPartStarted &&
		!isEnded
	);

	const preRemainingMs = scheduledStartMs ? Math.max(0, scheduledStartMs - (currentTime || scheduledStartMs)) : 0;
	const preParts = formatMsToCountdownParts(preRemainingMs);

	let breakTimeFormatted: string | null = null;
	if (isQualyBreak) {
		const breakRemainingMs = Math.min(breakDurationMs, Math.max(0, breakDurationMs - elapsedSinceChequered));
		breakTimeFormatted = formatMsToClock(breakRemainingMs, true);
	}

	const hasLivePositions = useMemo(() => {
		if (!positions) return false;
		return Object.values(positions).some(
			(p) => p && typeof p.X === "number" && (p.X !== 0 || p.Y !== 0)
		);
	}, [positions]);

	const [[minX, minY, widthX, widthY], setBounds] = useState<(null | number)[]>([null, null, null, null]);
	const [[centerX, centerY], setCenter] = useState<(null | number)[]>([null, null]);

	const [points, setPoints] = useState<null | { x: number; y: number }[]>(null);
	const [sectors, setSectors] = useState<MapSector[]>([]);
	const [corners, setCorners] = useState<Corner[]>([]);
	const [rotation, setRotation] = useState<number>(0);
	const [finishLine, setFinishLine] = useState<null | { x: number; y: number; startAngle: number }>(null);



	useEffect(() => {
		(async () => {
			if (!circuitKey) return;
			const mapJson = await fetchMap(circuitKey);
			if (!mapJson) return;

			const cX = (Math.max(...mapJson.x) - Math.min(...mapJson.x)) / 2;
			const cY = (Math.max(...mapJson.y) - Math.min(...mapJson.y)) / 2;
			const fixedRotation = mapJson.rotation + ROTATION_FIX;

			const sectors = createSectors(mapJson).map((s) => ({
				...s,
				start: rotate(s.start.x, s.start.y, fixedRotation, cX, cY),
				end: rotate(s.end.x, s.end.y, fixedRotation, cX, cY),
				points: s.points.map((p) => rotate(p.x, p.y, fixedRotation, cX, cY)),
			}));

			const cornerPositions: any[] = (mapJson.corners || []).map((corner) => ({
				number: corner.number,
				pos: rotate(corner.trackPosition.x, corner.trackPosition.y, fixedRotation, cX, cY),
				labelPos: rotate(corner.trackPosition.x + 640 * Math.cos(rad(corner.angle)), corner.trackPosition.y + 640 * Math.sin(rad(corner.angle)), fixedRotation, cX, cY),
			}));

			const rotatedPoints = mapJson.x.map((x, index) => rotate(x, mapJson.y[index], fixedRotation, cX, cY));
			const pointsX = rotatedPoints.map((item) => item.x);
			const pointsY = rotatedPoints.map((item) => item.y);

			const cMinX = Math.min(...pointsX) - SPACE;
			const cMinY = Math.min(...pointsY) - SPACE;
			const cWidthX = Math.max(...pointsX) - cMinX + SPACE * 2;
			const cWidthY = Math.max(...pointsY) - cMinY + SPACE * 2;

			const rotatedFinishLine = rotate(mapJson.x[0], mapJson.y[0], fixedRotation, cX, cY);
			const startAngle = Math.atan2(rotatedPoints[3].y - rotatedPoints[0].y, rotatedPoints[3].x - rotatedPoints[0].x) * (180 / Math.PI);

			setCenter([cX, cY]); setBounds([cMinX, cMinY, cWidthX, cWidthY]); setSectors(sectors);
			setPoints(rotatedPoints); setRotation(fixedRotation); setCorners(cornerPositions);
			setFinishLine({ x: rotatedFinishLine.x, y: rotatedFinishLine.y, startAngle });
		})();
	}, [circuitKey]);

	const yellowSectors = useMemo(() => findYellowSectors(raceControlMessages), [raceControlMessages]);

	const renderedSectors = useMemo(() => {
		const status = isRedFlag ? getTrackStatusMessage(5, language) : getTrackStatusMessage(trackStatus?.Status ? parseInt(trackStatus.Status) : undefined, language);
		return sectors.map((sector) => {
			const color = getSectorColor(sector, status?.bySector, status?.trackColor, yellowSectors);
			return {
				color, pulse: status?.pulse, number: sector.number, strokeWidth: color === "stroke-white" ? 80 : 140,
				d: `M${sector.points[0].x},${sector.points[0].y} ${sector.points.map((point) => `L${point.x},${point.y}`).join(" ")}`,
			};
		}).sort(prioritizeColoredSectors);
	}, [trackStatus, sectors, yellowSectors, isRedFlag]);

	if (!points || !minX || !minY || !widthX || !widthY) {
		return (
			<div className="h-full w-full p-2" style={{ minHeight: "35rem" }}>
				<div className="h-full w-full animate-pulse rounded-lg bg-zinc-900 border border-zinc-800" />
			</div>
		);
	}

	return (
		<div className="relative h-full w-full flex items-center justify-center overflow-hidden">
			<svg viewBox={`${minX} ${minY} ${widthX} ${widthY}`} className="h-full w-full xl:max-h-screen" xmlns="http://www.w3.org/2000/svg">
			
			<defs>
				{/* 🏁 TEXTURA 1: Bandera a cuadros */}
				<pattern id="checkered" width="40" height="40" patternUnits="userSpaceOnUse">
					<rect width="20" height="20" fill="#000" />
					<rect x="20" width="20" height="20" fill="#fff" />
					<rect y="20" width="20" height="20" fill="#fff" />
					<rect x="20" y="20" width="20" height="20" fill="#000" />
				</pattern>

				{/* 🌐 TEXTURA 2: Grilla HUD digital de fondo de plano técnico */}
				<pattern id="hud-grid" width="400" height="400" patternUnits="userSpaceOnUse">
					<path d="M 400 0 L 0 0 0 400" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.015" />
				</pattern>

				{/* 💥 FILTRO: Efecto de brillo de luz neón satelital */}
				<filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="35" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			{/* CAPA DE FONDO: Cuadrícula HUD técnica */}
			<rect x={minX} y={minY} width={widthX} height={widthY} fill="url(#hud-grid)" />

			<path className="stroke-zinc-950" strokeWidth={340} strokeLinejoin="round" fill="transparent" d={`M${points[0].x},${points[0].y} ${points.map((point) => `L${point.x},${point.y}`).join(" ")}`} />
			
			{/* CAPA DE PISTA: Renderizada con filtro neón para darle volumen de energía */}
			<g filter="url(#neon-glow)">
				{renderedSectors.map((sector) => (
					<path key={`map.sector.${sector.number}`} className={sector.color} strokeWidth={sector.strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="transparent" d={sector.d} style={sector.pulse ? { animation: `${sector.pulse * 100}ms linear infinite pulse` } : {}} />
				))}
			</g>
			
			{finishLine && (
				<rect
					x={finishLine.x - 160}
					y={finishLine.y - 40}
					width={480}
					height={80}
					fill="url(#checkered)"
					stroke="#ffffff"
					strokeWidth={30}
					transform={`rotate(${finishLine.startAngle + 90}, ${finishLine.x + 80}, ${finishLine.y})`}
				/>
			)}

			{showCornerNumbers && corners.map((corner: any) => (
				<g key={`corner.${corner.number}`} className="select-none pointer-events-none">
					<circle
						cx={corner.labelPos.x}
						cy={corner.labelPos.y}
						r={200}
						className="fill-zinc-950/90 stroke-zinc-700/80"
						strokeWidth={25}
					/>
					<text
						x={corner.labelPos.x}
						y={corner.labelPos.y}
						textAnchor="middle"
						dominantBaseline="central"
						className="fill-zinc-100 font-mono font-black"
						fontSize={220}
					>
						{corner.number}
					</text>
				</g>
			))}

			{centerX !== null && centerY !== null && rotation !== null && drivers && timingDrivers && Object.keys(drivers).length > 0 && (
				<>
					{Object.values(drivers)
						.filter((driver: any) => (filter ? filter.includes(driver.RacingNumber) : true))
						// 🌟 Prioridad Z-Order: los pilotos favoritos se renderizan al final para que siempre queden por encima en el mapa
						.sort((a: any, b: any) => {
							const aFav = isFavoriteDriver(a, favoriteDrivers) ? 1 : 0;
							const bFav = isFavoriteDriver(b, favoriteDrivers) ? 1 : 0;
							return aFav - bFav;
						})
						.map((driver: any) => {
						const timingDriver = timingDrivers?.Lines?.[driver.RacingNumber];
						const rawPos = positions?.[driver.RacingNumber];
						const isInPit = Boolean(timingDriver?.InPit);
						const isOut = Boolean((isQualy && timingDriver?.KnockedOut) || timingDriver?.Stopped || timingDriver?.Retired);

						// 🛑 Si el piloto está en boxes, retirado, eliminado o la sesión terminó, NO se dibuja en el trazado
						if (isEnded || isInPit || isOut || !timingDriver) {
							return null;
						}

						const hasCarGps = Boolean(
							rawPos &&
							typeof rawPos.X === "number" &&
							typeof rawPos.Y === "number" &&
							(rawPos.X !== 0 || rawPos.Y !== 0) &&
							rawPos.Status !== "InPit"
						);

						let carX: number;
						let carY: number;
						let carAngle: number;

						if (hasCarGps && rawPos) {
							// 🏎️ TELEMETRÍA 1: Coordenadas GPS satelitales en vivo (Position.z)
							const rotated = rotate(rawPos.X, rawPos.Y, rotation, centerX, centerY);
							carX = rotated.x;
							carY = rotated.y;

							const prev = prevCarsRef.current[driver.RacingNumber];
							if (prev) {
								const dx = carX - prev.x;
								const dy = carY - prev.y;
								const dist = Math.hypot(dx, dy);
								if (dist > 3) {
									const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
									carAngle = smoothAngle(prev.angle, targetAngle);
								} else {
									carAngle = prev.angle;
								}
							} else if (points && points.length > 0) {
								const closestIdx = findMinDistance({ x: carX, y: carY }, points);
								if (closestIdx !== -1) {
									const nextIdx = (closestIdx + 3) % points.length;
									carAngle = Math.atan2(
										points[nextIdx].y - points[closestIdx].y,
										points[nextIdx].x - points[closestIdx].x
									) * (180 / Math.PI);
								} else {
									carAngle = 0;
								}
							} else {
								carAngle = 0;
							}
						} else if (points && points.length > 0) {
							// 🏎️ TELEMETRÍA 2 (OFICIAL FIA): Posición real en trazado basada en mini-sectores (Segments) oficiales
							const allSegments = (timingDriver.Sectors || []).flatMap((s: any) => s.Segments || []);
							let completedSegments = 0;
							for (let i = 0; i < allSegments.length; i++) {
								const s = allSegments[i]?.Status;
								if (s !== undefined && s > 0) {
									completedSegments = i + 1;
								}
							}

							const totalSegments = allSegments.length || 23;
							const now = currentTime || Date.now();
							const prevTracking = driverProgressRef.current[driver.RacingNumber];

							if (!prevTracking || prevTracking.lastSegment !== completedSegments) {
								driverProgressRef.current[driver.RacingNumber] = {
									lastSegment: completedSegments,
									lastChangeTime: now,
									baseRatio: totalSegments > 0 ? (completedSegments / totalSegments) : 0,
								};
							}

							const tracking = driverProgressRef.current[driver.RacingNumber];
							const elapsedMs = Math.max(0, now - tracking.lastChangeTime);

							// Duración estimada de cada mini-sector para avance suave continuo
							const estimatedSegmentMs = Math.max(2500, (100 * 1000) / totalSegments);
							const segmentFraction = Math.min(elapsedMs / estimatedSegmentMs, 0.95);
							const segmentWidth = 1 / totalSegments;

							const baseProgress = tracking.baseRatio;
							const currentProgress = (baseProgress + (segmentFraction * segmentWidth)) % 1;
							const safeRatio = Math.max(0, Math.min(0.999, ((currentProgress % 1) + 1) % 1));

							const numPts = points.length;
							const exactFloatIndex = safeRatio * (numPts - 1);
							const i0 = Math.floor(exactFloatIndex);
							const i1 = (i0 + 1) % numPts;
							const frac = exactFloatIndex - i0;

							const p0 = points[i0];
							const p1 = points[i1];

							if (!p0 || !p1) {
								return null;
							}

							// 🏎️ INTERPOLACIÓN SUB-PÍXEL CONTINUA A 60 FPS REALES (sin escalonamientos de puntos)
							carX = p0.x + (p1.x - p0.x) * frac;
							carY = p0.y + (p1.y - p0.y) * frac;

							const nextIdx = (i0 + 3) % numPts;
							const nextPt = points[nextIdx] || p1;
							const targetAngle = Math.atan2(nextPt.y - carY, nextPt.x - carX) * (180 / Math.PI);
							carAngle = smoothAngle(prevCarsRef.current[driver.RacingNumber]?.angle ?? targetAngle, targetAngle);
						} else {
							return null;
						}

						prevCarsRef.current[driver.RacingNumber] = { x: carX, y: carY, angle: carAngle };

						const colorConfig = TEAM_COLORS_2026[driver.Tla] || { bg: "#ffffff", text: "#ffffff" };
						const isFav = isFavoriteDriver(driver, favoriteDrivers);

						return (
							<CarObject
								key={`map.driver.${driver.RacingNumber}`}
								name={driver.Tla}
								driverNumber={driver.RacingNumber}
								teamName={driver.TeamName}
								colors={colorConfig}
								x={carX}
								y={carY}
								angle={carAngle}
								favorite={isFav}
								pit={false}
								hidden={false}
							/>
						);
					})}
				</>
			)}
		</svg>

		{/* 🏎️ TV BADGE OFICIAL F1: "Q3 EMPIEZA EN 02:45" */}
		{isQualyBreak ? (
			<div className="absolute top-4 right-4 pointer-events-none z-10 flex flex-col font-mono">
				<div className="rounded-xl border border-red-600/50 bg-zinc-950/95 p-3.5 shadow-2xl backdrop-blur-md min-w-[13rem]">
					<div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5 mb-2">
						<span className="text-[10px] font-black tracking-widest text-red-500 uppercase flex items-center gap-1.5">
							<span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
							{t("map.f1_qualy", "F1 CLASIFICACIÓN")}
						</span>
						<span className="text-[9px] font-bold text-zinc-500 uppercase">{t("map.official", "OFICIAL")}</span>
					</div>
					<p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
						{nextPartName} {t("map.starts_in", "EMPIEZA EN")}
					</p>
					<p className="text-3xl font-black text-white font-mono tracking-wider tabular-nums mt-0.5">
						{breakTimeFormatted || "02:00"}
					</p>
				</div>
			</div>
		) : isPreQualy ? (
			/* 📺 WIDGET OFICIAL ESTILO F1 TV BROADCAST (Attachment 2): Q1 · LAS VEGAS / CLASIFICACIÓN EMPIEZA EN / 10 MIN 59 SEG */
			<div className="absolute top-4 right-4 pointer-events-none z-10 flex flex-col font-mono">
				<div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md min-w-[14.5rem] text-center">
					{/* Header: Q1 · LAS VEGAS */}
					<div className="flex items-center justify-between text-xs font-black tracking-wider text-white uppercase pb-1">
						<span>Q1 · {sessionInfo?.Meeting?.Location || sessionInfo?.Meeting?.Name?.replace("Grand Prix", "").trim() || "F1"}</span>
						<span className="flex h-2 w-2 relative">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
						</span>
					</div>
					{/* Red horizontal accent bar */}
					<div className="h-[2px] w-full bg-red-600 my-1.5 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />

					{/* CLASIFICACIÓN (Yellow / Gold) */}
					<div className="text-amber-400 font-black tracking-wider text-base uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
						{language === "en" ? "QUALIFYING" : language === "pt" ? "CLASSIFICAÇÃO" : "CLASIFICACIÓN"}
					</div>

					{/* EMPIEZA EN: */}
					<div className="text-[11px] font-extrabold tracking-widest text-zinc-300 uppercase mt-0.5">
						{preRemainingMs > 0 ? (language === "en" ? "STARTS IN:" : language === "pt" ? "COMEÇA EM:" : "EMPIEZA EN:") : (language === "en" ? "STARTING SHORTLY" : language === "pt" ? "COMEÇANDO EM BREVE" : "INICIANDO EN BREVE")}
					</div>

					{/* Big Digital Countdown: MIN & SEG underneath */}
					<div className="flex items-center justify-center gap-3 mt-2.5 bg-zinc-900/70 rounded-xl py-2 px-3 border border-zinc-800/80">
						<div className="flex flex-col items-center min-w-[2.75rem]">
							<span className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums leading-none drop-shadow">
								{preParts.totalMinutes}
							</span>
							<span className="text-[9px] font-bold text-zinc-400 tracking-widest mt-1 uppercase">
								{language === "en" ? "MIN" : "MIN"}
							</span>
						</div>
						<span className="text-2xl font-black text-zinc-600 pb-3">:</span>
						<div className="flex flex-col items-center min-w-[2.75rem]">
							<span className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums leading-none drop-shadow">
								{preParts.seconds}
							</span>
							<span className="text-[9px] font-bold text-zinc-400 tracking-widest mt-1 uppercase">
								{language === "en" ? "SEC" : "SEG"}
							</span>
						</div>
					</div>

					{/* Sub-label: Monoplazas en boxes */}
					<div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
						<span>{t("map.cars_in_pits", "Monoplazas en Boxes")}</span>
					</div>
				</div>
			</div>
		) : allInPit && !isEnded && (
			<div className="absolute top-4 right-4 pointer-events-none z-10 flex flex-col items-end gap-1.5 font-mono">
				<div className={clsx("flex items-center gap-2 rounded-lg px-3.5 py-2 shadow-2xl backdrop-blur-md", isRedFlag ? "bg-red-950/95 border border-red-500/60" : "bg-zinc-950/95 border border-amber-500/40")}>
					<span className={clsx("h-2 w-2 rounded-full animate-ping", isRedFlag ? "bg-red-500" : "bg-amber-400")} />
					<span className={clsx("text-xs font-black uppercase tracking-wider", isRedFlag ? "text-red-400" : "text-amber-400")}>
						{isRedFlag ? t("map.red_flag_pits", "Bandera Roja - En Boxes") : t("map.cars_in_pits", "Monoplazas en Boxes")}
					</span>
				</div>
				<span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-800 shadow-sm backdrop-blur-sm">
					{isRedFlag ? t("map.session_stopped", "Sesión detenida por dirección de carrera") : t("map.no_cars_on_track", "Sin monoplazas rodando en circuito")}
				</span>
			</div>
		)}

		{/* 🛰️ BADGE TRANSPARENTE: Informa con total honestidad el estado del GPS FOM */}
		{!isEnded && isTrackActive && (
			<div className="absolute bottom-4 left-4 pointer-events-none z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-md shadow-lg select-none">
				<span className="relative flex h-2 w-2">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
				</span>
				<div className="flex flex-col">
					<span className="text-[10px] font-mono font-bold text-zinc-300 tracking-wide uppercase">{hasLivePositions ? t("map.official_gps_live", "GPS SATELITAL EN VIVO") : t("map.official_track_live", "TELEMETRÍA EN PISTA EN VIVO")}</span>
					<span className="text-[8px] font-mono text-zinc-500">{hasLivePositions ? t("map.gps_active", "Coordenadas satelitales de alta precisión") : t("map.sectors_synced", "Monoplazas sincronizados con mini-sectores oficiales FIA")}</span>
				</div>
			</div>
		)}
	</div>
	);
}

const CarObject = ({ x, y, name, driverNumber, teamName, colors, angle, favorite, pit, hidden }: any) => {
	const constructorId = (teamName || "").toLowerCase().replaceAll(" ", "-");

	return (
		<g 
			className={clsx({ "opacity-40": pit }, { "!opacity-0": hidden })}
			transform={`translate(${x}, ${y})`}
		>
			{/* 🌟 BALIZA RADAR VIP DE PILOTO FAVORITO */}
			{favorite && (
				<g className="pointer-events-none select-none">
					{/* Onda expansiva de radar continua */}
					<circle
						cx="0"
						cy="0"
						r="340"
						fill="none"
						stroke="#fbbf24"
						strokeWidth="28"
						opacity="0.4"
						className="animate-ping origin-center"
					/>
					{/* Anillo de baliza dorada exterior con trazo segmentado */}
					<circle
						cx="0"
						cy="0"
						r="360"
						fill="rgba(245, 158, 11, 0.14)"
						stroke="#fbbf24"
						strokeWidth="28"
						strokeDasharray="60 30"
						opacity="0.9"
					/>
					{/* Halo interior con el color oficial de la escudería */}
					<circle
						cx="0"
						cy="0"
						r="240"
						fill={colors.bg}
						fillOpacity="0.22"
						stroke={colors.bg}
						strokeWidth="18"
						opacity="0.9"
					/>
				</g>
			)}

			{/* 🏎️ MONOPLAZA 2026 TOP-DOWN DE ALTA PRECISIÓN (F1CarTopDown) */}
			<g transform={`rotate(${angle + 90})`} style={{ transition: "transform 0.3s linear" }}>
				<F1CarTopDown
					x="-125"
					y="-300"
					width="250"
					height="600"
					className=""
					constructorId={constructorId}
					teamName={teamName}
					driverNumber={driverNumber}
					showNumber={false}
				/>
			</g>

			{/* 🏷️ PANEL HUD DE PILOTO COMPACTO */}
			<g transform="translate(150, -180)">
				<rect 
					x="-20" 
					y="-55" 
					width="160" 
					height="70" 
					fill="#000000" 
					rx="10" 
					stroke={favorite ? "#fbbf24" : colors.bg} 
					strokeWidth={favorite ? 20 : 14} 
					opacity="0.95" 
				/>
				
				<text 
					x="60" 
					y="2" 
					fontWeight="950" 
					fontSize={320} 
					fill={colors.bg} 
					stroke="#000000"
					strokeWidth="20px"
					paintOrder="stroke"
					textAnchor="middle" 
					className="font-mono tracking-tighter"
				>
					{name}
				</text>

				{/* ⭐ DETALLE PREMIUM: Insignia de Estrella Dorada HUD visible sobre el nombre */}
				{favorite && (
					<g transform="translate(60, -145)" className="animate-pulse">
						{/* Círculo de fondo oscuro para el badge */}
						<circle cx="0" cy="0" r="110" fill="#09090b" stroke="#f59e0b" strokeWidth="20" />
						{/* Estrella Dorada HUD grande y nítida */}
						<path 
							d="M 0,-65 L 19,-20 L 68,-15 L 30,16 L 41,65 L 0,38 L -41,65 L -30,16 L -68,-15 L -19,-20 Z" 
							fill="#fbbf24" 
							stroke="#d97706" 
							strokeWidth="8"
						/>
					</g>
				)}
			</g>
		</g>
	);
};