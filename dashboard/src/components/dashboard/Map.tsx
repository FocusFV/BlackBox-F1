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
	PER: { bg: "#ffcc00", text: "#ffffff" },
	BOT: { bg: "#ffcc00", text: "#ffffff" },
	HER: { bg: "#ffcc00", text: "#ffffff" },
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

	// 🛡️ Compatible con TypeScript estricto y seguro ante objetos incompletos
	const circuitKey = useDataStore((state) => 
		state?.state?.SessionInfo?.Meeting?.Circuit?.Key ?? 
		(state?.state?.SessionInfo as any)?.Circuit?.Key ?? 
		2
	);

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
				<text key={`corner.${corner.number}`} x={corner.labelPos.x} y={corner.labelPos.y} className="fill-zinc-600 font-mono font-black select-none" fontSize={240}>{corner.number}</text>
			))}

			{centerX && centerY && drivers && timingDrivers && Object.keys(drivers).length > 0 && (
				<>
					{Object.values(drivers).reverse().filter((driver: any) => (filter ? filter.includes(driver.RacingNumber) : true)).map((driver: any) => {
						const timingDriver = timingDrivers?.Lines?.[driver.RacingNumber];
						
						const data = getDriverPositionAndAngle(timingDriver, points, timeOffset);
						if (!data) return null;

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
			{/* 🏎️ MONOPLAZA 2026 PREMIUM (Silueta con Curvas Orgánicas Redondeadas) */}
			<g transform={`rotate(${angle + 90})`} style={{ transition: "transform 0.16s linear" }}>
				{/* Ejes de suspensión delantera y trasera estilizados */}
				<rect x="-120" y="-175" width="240" height="10" fill="#444" rx="2" />
				<rect x="-130" y="145" width="260" height="12" fill="#444" rx="2" />

				{/* Alerón Trasero Masivo */}
				<rect x="-140" y="215" width="280" height="50" fill="#222" rx="4" stroke="#111" strokeWidth={8} />
				<rect x="-110" y="225" width="220" height="22" fill={colors.bg} rx="2" />

				{/* Pontones y Carrocería Base REDONDEADOS */}
				<path 
					d="M -45 190 
					   Q -75 60 -65 -40 
					   Q -55 -160 -20 -160 
					   L 20 -160 
					   Q 55 -160 65 -40 
					   Q 75 60 45 190 Z" 
					fill="#222" 
					stroke="#111" 
					strokeWidth={10} 
				/>

				{/* Chasis Central Afilado (Color oficial de la escudería) */}
				<path d="M -25 180 L -22 -60 L -10 -270 L 10 -270 L 22 -60 L 25 180 Z" fill={colors.bg} stroke="#111" strokeWidth={12} />

				{/* Alerón Delantero Estilizado en Flecha */}
				<path d="M -110 -220 L 0 -290 L 110 -220 L 110 -195 L 0 -245 L -110 -195 Z" fill={colors.bg} stroke="#111" strokeWidth={10} />

				{/* Cockpit Redondeado en forma de Gota */}
				<path 
					d="M -15 45 
					   Q -22 15 -20 -20 
					   Q -18 -55 0 -55 
					   Q 18 -55 20 -20 
					   Q 22 15 15 45 Z" 
					fill="#111" 
					stroke="#333" 
					strokeWidth={6} 
				/>
				
				{/* Casco y Protección del Piloto Integrada */}
				<circle cx="0" cy="-10" r="10" fill="#444" />
				<rect x="-4" y="10" width="8" height="25" fill="#111" rx="3" />

				{/* Gomas Delanteras con contorno gris claro */}
				<rect x="-205" y="-220" width="55" height="110" fill="#18181b" rx="18" stroke="#555555" strokeWidth={10} />
				<rect x="150" y="-220" width="55" height="110" fill="#18181b" rx="18" stroke="#555555" strokeWidth={10} />

				{/* Gomas Traseras de Competición con contorno gris claro */}
				<rect x="-215" y="95" width="65" height="135" fill="#18181b" rx="20" stroke="#555555" strokeWidth={10} />
				<rect x="150" y="95" width="65" height="135" fill="#18181b" rx="20" stroke="#555555" strokeWidth={10} />
			</g>

			{/* 🏷️ PANEL HUD DE PILOTO COMPACTO */}
			<g transform="translate(150, -180)">
				<rect x="-20" y="-55" width="160" height="70" fill="#000000" rx="10" stroke={colors.bg} strokeWidth={14} opacity="0.95" />
				
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

				{/* ⭐ DETALLE PREMIUM: Estrellita dorada flotante animada si es piloto favorito */}
				{favorite && (
					<g transform="translate(115, -60)" className="animate-pulse">
						{/* Sombra negra de fondo para la estrella */}
						<path 
							d="M 0,-25 L 7,-7 L 25,-6 L 11,6 L 15,24 L 0,14 L -15,24 L -11,6 L -25,-6 L -7,-7 Z" 
							fill="#000000" 
							stroke="#000000" 
							strokeWidth="8"
						/>
						{/* Estrella Dorada HUD */}
						<path 
							d="M 0,-25 L 7,-7 L 25,-6 L 11,6 L 15,24 L 0,14 L -15,24 L -11,6 L -25,-6 L -7,-7 Z" 
							fill="#ffd700" 
							stroke="#ff9900" 
							strokeWidth="3"
						/>
					</g>
				)}
			</g>
		</g>
	);
};