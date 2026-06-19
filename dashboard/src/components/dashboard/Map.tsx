"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import type { PositionCar, TimingDataDriver } from "@/types/state.type";
import type { Map as MapType, TrackPosition } from "@/types/map.type";

import { fetchMap } from "@/lib/fetchMap";

import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";
import {
	createSectors,
	findYellowSectors,
	getSectorColor,
	type MapSector,
	prioritizeColoredSectors,
	rad,
	rotate,
} from "@/lib/map";

// 🏎️ DICCIONARIO FocusFV COMPLETO 2026 (22 Pilotos Oficiales actualizados)
const TEAM_COLORS_2026: Record<string, { bg: string; text: string }> = {
	NOR: { bg: "#ff8700", text: "#ffffff" },
	PIA: { bg: "#ff8700", text: "#ffffff" },
	LEC: { bg: "#e10600", text: "#ffffff" },
	HAM: { bg: "#e10600", text: "#ffffff" },
	VER: { bg: "#061d43", text: "#ffffff" },
	HAD: { bg: "#061d43", text: "#ffffff" },
	LIN: { bg: "#061d43", text: "#ffffff" },
	PER: { bg: "#061d43", text: "#ffffff" },
	RUS: { bg: "#00d2be", text: "#ffffff" },
	ANT: { bg: "#00d2be", text: "#ffffff" },
	ALO: { bg: "#006f62", text: "#ffffff" },
	STR: { bg: "#006f62", text: "#ffffff" },
	GAS: { bg: "#ff00ff", text: "#ffffff" },
	COL: { bg: "#ff00ff", text: "#ffffff" },
	BEA: { bg: "#e10600", text: "#ffffff" },
	OCO: { bg: "#e10600", text: "#ffffff" },
	MAG: { bg: "#373737", text: "#ffffff" },
	LAW: { bg: "#4b77ff", text: "#ffffff" },
	TSU: { bg: "#4b77ff", text: "#ffffff" },
	ALB: { bg: "#005aff", text: "#ffffff" },
	SAI: { bg: "#005aff", text: "#ffffff" },
	BOT: { bg: "#27272a", text: "#ffffff" },
	HUL: { bg: "#1f1f1f", text: "#ffffff" },
	BOR: { bg: "#1f1f1f", text: "#ffffff" },
};

const SPACE = 1000;
const ROTATION_FIX = 90;

type Corner = {
	number: number;
	pos: TrackPosition;
	labelPos: TrackPosition;
};

function getDriverPositionAndAngle(
	timingDriver: TimingDataDriver | undefined,
	rotatedPoints: { x: number; y: number }[] | null,
	timeOffset: number
): { x: number; y: number; angle: number } | null {
	if (!rotatedPoints || rotatedPoints.length === 0) return null;

	const carSeed = timingDriver ? (parseInt(timingDriver.RacingNumber) || 10) : 10;
	
	// Distribución fina y escalonada de velocidad para simular sobrepasos reales entre los 22 coches
	const speedFactor = 1 + ((carSeed % 7) * 0.025); 
	const progress = ((timeOffset * speedFactor) + (carSeed * 0.045)) % 1;

	const positionIndex = Math.floor(progress * (rotatedPoints.length - 1));
	const safeIndex = Math.min(Math.max(positionIndex, 0), rotatedPoints.length - 1);
	
	const nextIndex = (safeIndex + 3) % rotatedPoints.length;
	
	const currentPoint = rotatedPoints[safeIndex];
	const nextPoint = rotatedPoints[nextIndex];
	
	const angle = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * (180 / Math.PI);

	return { x: currentPoint.x, y: currentPoint.y, angle };
}

export default function Map({ filter }: { filter?: string[] }) {
	const showCornerNumbers = useSettingsStore((state) => state.showCornerNumbers);
	const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);

	const circuitKey = useDataStore((state) => state?.state?.SessionInfo?.Meeting.Circuit.Key) || 2;
	const rawDrivers = useDataStore((state) => state?.state?.DriverList);
	const rawTiming = useDataStore((state) => state?.state?.TimingData);

	// 🌟 GRILLA COMPLETA COMPATIBLE DE 22 PILOTOS
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

	const drivers = rawDrivers && Object.keys(rawDrivers).length > 0 ? rawDrivers : mockDrivers;
	const timingDrivers = rawTiming && Object.keys(rawTiming.Lines || {}).length > 0 ? rawTiming : mockTiming;

	const trackStatus = useDataStore((state) => state?.state?.TrackStatus);
	const raceControlMessages = useDataStore((state) => state?.state?.RaceControlMessages?.Messages ?? undefined);

	const [[minX, minY, widthX, widthY], setBounds] = useState<(null | number)[]>([null, null, null, null]);
	const [[centerX, centerY], setCenter] = useState<(null | number)[]>([null, null]);

	const [points, setPoints] = useState<null | { x: number; y: number }[]>(null);
	const [sectors, setSectors] = useState<MapSector[]>([]);
	const [corners, setCorners] = useState<Corner[]>([]);
	const [rotation, setRotation] = useState<number>(0);
	const [finishLine, setFinishLine] = useState<null | { x: number; y: number; startAngle: number }>(null);

	const [timeOffset, setTimeOffset] = useState(0);
	useEffect(() => {
		let frameId: number;
		const updateFrame = () => {
			setTimeOffset((Date.now() / 24000) % 1);
			frameId = requestAnimationFrame(updateFrame);
		};
		frameId = requestAnimationFrame(updateFrame);
		return () => cancelAnimationFrame(frameId);
	}, []);

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

			const cornerPositions: any[] = mapJson.corners.map((corner) => ({
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
		const status = getTrackStatusMessage(trackStatus?.Status ? parseInt(trackStatus.Status) : undefined);
		return sectors.map((sector) => {
			const color = getSectorColor(sector, status?.bySector, status?.trackColor, yellowSectors);
			return {
				color, pulse: status?.pulse, number: sector.number, strokeWidth: color === "stroke-white" ? 80 : 140,
				d: `M${sector.points[0].x},${sector.points[0].y} ${sector.points.map((point) => `L${point.x},${point.y}`).join(" ")}`,
			};
		}).sort(prioritizeColoredSectors);
	}, [trackStatus, sectors, yellowSectors]);

	if (!points || !minX || !minY || !widthX || !widthY) {
		return (
			<div className="h-full w-full p-2" style={{ minHeight: "35rem" }}>
				<div className="h-full w-full animate-pulse rounded-lg bg-zinc-900 border border-zinc-800" />
			</div>
		);
	}

	return (
		<svg viewBox={`${minX} ${minY} ${widthX} ${widthY}`} className="h-full w-full xl:max-h-screen" xmlns="http://www.w3.org/2000/svg">
			
			<defs>
				<pattern id="checkered" width="40" height="40" patternUnits="userSpaceOnUse">
					<rect width="20" height="20" fill="#000" />
					<rect x="20" width="20" height="20" fill="#fff" />
					<rect y="20" width="20" height="20" fill="#fff" />
					<rect x="20" y="20" width="20" height="20" fill="#000" />
				</pattern>
			</defs>

			<path className="stroke-zinc-950" strokeWidth={340} strokeLinejoin="round" fill="transparent" d={`M${points[0].x},${points[0].y} ${points.map((point) => `L${point.x},${point.y}`).join(" ")}`} />
			
			{renderedSectors.map((sector) => (
				<path key={`map.sector.${sector.number}`} className={sector.color} strokeWidth={sector.strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="transparent" d={sector.d} style={sector.pulse ? { animation: `${sector.pulse * 100}ms linear infinite pulse` } : {}} />
			))}
			
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
				<text key={`corner.${corner.number}`} x={corner.labelPos.x} y={corner.labelPos.y} className="fill-zinc-600 font-mono font-black select-none" fontSize={240}>{corner.number}</text>
			))}

			{centerX && centerY && drivers && timingDrivers && (
				<>
					{Object.values(drivers).reverse().filter((driver: any) => (filter ? filter.includes(driver.RacingNumber) : true)).map((driver: any) => {
						const timingDriver = timingDrivers?.Lines[driver.RacingNumber];
						
						const data = getDriverPositionAndAngle(timingDriver, points, timeOffset);
						if (!data) return null;

						// Le inyectamos la paleta de tu mapeo de objetos de forma segura
						const colorConfig = TEAM_COLORS_2026[driver.Tla] || { bg: "#ffffff", text: "#ffffff" };
						const isFav = favoriteDrivers.includes(driver.RacingNumber);

						return (
							<CarObject
								key={`map.driver.${driver.RacingNumber}`}
								name={driver.Tla}
								colors={colorConfig}
								x={data.x}
								y={data.y}
								angle={data.angle}
								favorite={isFav}
								pit={timingDriver ? timingDriver.InPit : false}
								hidden={timingDriver ? (timingDriver.KnockedOut || timingDriver.Stopped || timingDriver.Retired) : false}
							/>
						);
					})}
				</>
			)}
		</svg>
	);
}

const CarObject = ({ x, y, name, colors, angle, favorite, pit, hidden }: any) => {
	return (
		<g 
			className={clsx("transition-transform duration-150 ease-linear", { "opacity-40": pit }, { "opacity-0!": hidden })} 
			style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
		>
			{favorite && <circle r={320} fill="none" stroke="#22d3ee" strokeWidth={35} className="animate-pulse" />}

			{/* 🏎️ AUTO VECTORIAL ORIENTADO (Escalado un 25% más grande para mayor presencia) */}
			<g transform={`rotate(${angle + 90})`} style={{ transition: "transform 0.16s linear", scale: "1.25" }}>
				<rect x="-80" y="80" width="160" height="30" fill="#111" rx="5" />
				<path d="M -50 80 L -40 -20 L -20 -60 L 20 -60 L 40 -20 L 50 80 Z" fill="#18181b" />
				<path d="M -30 60 L -25 -40 L 0 -90 L 25 -40 L 30 60 Z" fill={colors.bg} stroke="#111" strokeWidth={10} />
				<rect x="-90" y="-85" width="180" height="20" fill="#111" rx="4" />
				<rect x="-115" y="-80" width="30" height="55" fill="#000" rx="6" />
				<rect x="85" y="-80" width="30" height="55" fill="#000" rx="6" />
				<rect x="-120" y="30" width="40" height="65" fill="#000" rx="8" />
				<rect x="80" y="30" width="40" height="65" fill="#000" rx="8" />
				<rect x="-10" y="10" width="20" height="15" fill="#facc15" />
			</g>

			{/* 🏷️ PANEL HUD FLOTANTE CALIBRADO (Fondo oscuro, texto chico con el color de la escudería) */}
			<g transform="translate(140, -110)">
				{/* Volvemos al fondo oscuro translúcido con borde del equipo para contraste absoluto */}
				<rect x="-20" y="-55" width="150" height="70" fill="#09090b" rx="10" stroke={colors.bg} strokeWidth={15} opacity="0.95" />
				
				{/* 🌟 CAMBIO PREMIUM: Nombre un poco más chico (fontSize 340) teñido con el color de la escudería (colors.bg) */}
				<text x="55" y="-6" fontWeight="900" fontSize={340} fill={colors.bg} textAnchor="middle" className="font-mono tracking-tighter">
					{name}
				</text>
			</g>
		</g>
	);
};