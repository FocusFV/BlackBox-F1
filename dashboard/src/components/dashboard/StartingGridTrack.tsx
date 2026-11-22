"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import F1CarTopDown from "./F1CarTopDown";
import { useDriverModalStore } from "@/stores/useDriverModalStore";
import { triggerHaptic } from "@/lib/haptics";

interface DriverResult {
	pos: string;
	number: string;
	code: string;
	name: string;
	team: string;
	constructorId: string;
	points?: string;
	gapTime: string;
	isDNF: boolean;
	gridPos?: number;
	qualyPos?: number;
	delta?: number;
	penaltyNote?: string | null;
}

interface StartingGridTrackProps {
	gridResults: DriverResult[];
	gpName?: string;
}

// 📸 Mapeo de retratos oficiales de pilotos en /drivers/grid/
const driverPhotoMap: Record<string, string> = {
	VER: "verstappen", RUS: "russell", NOR: "norris", HAD: "hadjar",
	LIN: "lindblad", ANT: "antonelli", LAW: "lawson", GAS: "gasly",
	COL: "colapinto", LEC: "leclerc", HAM: "hamilton", HUL: "hulkenberg",
	BOR: "bortoleto", ALB: "albon", CAM: "camara", PER: "perez",
	PIA: "piastri", ALO: "alonso", BOT: "bottas", SAI: "sainz",
	STR: "stroll", BEA: "bearman", TSU: "tsunoda", OCO: "ocon",
	HIR: "hirakawa", DOO: "doohan"
};

function getDriverPhoto(code?: string, name?: string): string {
	const c = (code || "").toUpperCase().trim();
	if (driverPhotoMap[c]) return `/drivers/grid/${driverPhotoMap[c]}.jpg`;
	const n = (name || "").toLowerCase();
	for (const [key, slug] of Object.entries(driverPhotoMap)) {
		if (n.includes(slug)) return `/drivers/grid/${slug}.jpg`;
	}
	return "/drivers/grid/verstappen.jpg";
}

// 🏁 Banderas de nacionalidad
const driverFlagMap: Record<string, string> = {
	VER: "nl", RUS: "gb", NOR: "gb", HAD: "fr", LIN: "gb",
	ANT: "it", LAW: "nz", GAS: "fr", COL: "ar", LEC: "mc",
	HAM: "gb", HUL: "de", BOR: "br", ALB: "th", CAM: "br",
	PER: "mx", PIA: "au", ALO: "es", BOT: "fi", SAI: "es",
	STR: "ca", BEA: "gb", TSU: "jp", OCO: "fr", HIR: "jp"
};

// 🛡️ Logos de escudería
const TeamLogoMini: React.FC<{ teamName: string }> = ({ teamName }) => {
	const [fallbackIdx, setFallbackIdx] = useState(0);
	const clean = (teamName || "").toLowerCase();
	const fallbacks: string[] = [];

	if (clean.includes("red bull")) fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg");
	else if (clean.includes("mercedes")) fallbacks.push("/team-logos/mercedes.svg");
	else if (clean.includes("mclaren")) fallbacks.push("/team-logos/mclaren.svg");
	else if (clean.includes("ferrari")) fallbacks.push("/team-logos/ferrari.svg");
	else if (clean.includes("alpine")) fallbacks.push("/team-logos/alpine.svg", "/team-logos/alpine-f1-team.svg");
	else if (clean.includes("williams")) fallbacks.push("/team-logos/williams.svg", "/team-logos/williams-racing.svg");
	else if (clean.includes("racing bulls") || clean.includes("rb")) fallbacks.push("/team-logos/rb.svg", "/team-logos/rb-f1-team.svg");
	else if (clean.includes("audi") || clean.includes("sauber")) fallbacks.push("/team-logos/audi.svg", "/team-logos/kick-sauber.svg");
	else if (clean.includes("haas")) fallbacks.push("/team-logos/haas.svg", "/team-logos/haas-f1-team.svg");
	else if (clean.includes("aston")) fallbacks.push("/team-logos/aston-martin.svg");
	else if (clean.includes("cadillac")) fallbacks.push("/team-logos/cadillac.svg", "/team-logos/cadillac-f1-team.svg");
	else fallbacks.push(`/team-logos/${clean.replaceAll(" ", "-")}.svg`);

	fallbacks.push("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='6' fill='%2352525b'/></svg>");

	return (
		<img
			src={fallbacks[fallbackIdx]}
			alt={teamName}
			className="w-4 h-4 object-contain shrink-0 opacity-80"
			onError={() => {
				if (fallbackIdx < fallbacks.length - 1) setFallbackIdx(fallbackIdx + 1);
			}}
		/>
	);
};

export const StartingGridTrack: React.FC<StartingGridTrackProps> = ({
	gridResults,
	gpName = "Gran Premio de Las Vegas",
}) => {
	const openDriverModal = useDriverModalStore((state) => state.open);

	// Separar en filas de 2 monoplazas (Cajón impar izquierda, Cajón par derecha)
	const rows: { left?: DriverResult; right?: DriverResult; rowNum: number }[] = [];
	const sorted = [...gridResults].sort((a, b) => {
		const posA = a.gridPos ?? parseInt(a.pos, 10) ?? 99;
		const posB = b.gridPos ?? parseInt(b.pos, 10) ?? 99;
		return posA - posB;
	});

	for (let i = 0; i < sorted.length; i += 2) {
		const rowNum = Math.floor(i / 2) + 1;
		rows.push({
			left: sorted[i],
			right: sorted[i + 1],
			rowNum,
		});
	}

	return (
		<div className="w-full flex flex-col items-center select-none font-mono">
			{/* ================= 1. SEMÁFORO DE SALIDA FIA (START GANTRY) ================= */}
			<div className="w-full bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-3.5 sm:p-4 mb-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
				{/* Reflejo metálico superior */}
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
							<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400">
								Parrilla Oficial de Salida · FIA
							</span>
						</div>
						<h3 className="text-xs sm:text-sm font-black text-white tracking-tight mt-0.5">
							{gpName} · Recta Principal
						</h3>
					</div>

					{/* 🚦 Semáforo oficial de 5 luces de largada */}
					<div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1.5 rounded-xl border border-zinc-800 shadow-inner shrink-0">
						{[1, 2, 3, 4, 5].map((light) => (
							<div key={light} className="flex flex-col items-center gap-0.5">
								<div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
								<div className="w-1.5 h-0.5 bg-zinc-700 rounded-full" />
							</div>
						))}
					</div>
				</div>

				{/* Resumen rápido de Pole Position & Primera Fila */}
				{sorted.length >= 2 && (
					<div className="mt-2.5 pt-2.5 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
						<div className="flex items-center gap-2">
							<span className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-xs">
								POLE POSITION
							</span>
							<span className="font-bold text-white text-[11px] sm:text-xs">
								{sorted[0].name} #{sorted[0].number} ({sorted[0].team})
							</span>
						</div>
						<div className="text-[10px] sm:text-[11px] text-zinc-400">
							Primera Fila: <strong className="text-zinc-200">{sorted[0].code}</strong> &{" "}
							<strong className="text-zinc-200">{sorted[1].code}</strong>
						</div>
					</div>
				)}
			</div>

			{/* ================= 2. LA PISTA DE ASFALTO (ASPHALT TRACK) ================= */}
			<div className="w-full relative bg-[#131417] rounded-3xl border-2 border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
				{/* Pianos laterales (Curbings rojo y blanco en los costados de la pista) */}
				<div
					className="absolute top-0 bottom-0 left-0 w-3 border-r border-zinc-800/60 z-20"
					style={{
						background: "repeating-linear-gradient(to bottom, #ef4444 0px, #ef4444 24px, #ffffff 24px, #ffffff 48px)",
					}}
				/>
				<div
					className="absolute top-0 bottom-0 right-0 w-3 border-l border-zinc-800/60 z-20"
					style={{
						background: "repeating-linear-gradient(to bottom, #ef4444 0px, #ef4444 24px, #ffffff 24px, #ffffff 48px)",
					}}
				/>

				{/* Línea central discontinua de la pista */}
				<div
					className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 opacity-25 z-10 pointer-events-none"
					style={{
						background: "repeating-linear-gradient(to bottom, #ffffff 0px, #ffffff 32px, transparent 32px, transparent 64px)",
					}}
				/>

				{/* Textura de asfalto y marcas de goma en la pista */}
				<div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

				{/* ================= LÍNEA DE SALIDA / META (START-FINISH LINE) ================= */}
				<div className="relative z-20 pt-6 pb-4 px-6 flex flex-col items-center">
					<div className="w-full flex items-center justify-center gap-2 py-1.5 px-4 bg-zinc-950/80 border-y-2 border-white/80 shadow-md">
						<span className="text-[10px] font-black tracking-widest text-zinc-300 uppercase">
							🏁 LÍNEA DE SALIDA / STARTING LINE · DIRECCIÓN DE CARRERA 🏁
						</span>
					</div>
				</div>

				{/* ================= LAS FILAS DE LA GRILLA (GRID ROWS) ================= */}
				<div className="px-4 sm:px-8 pb-12 flex flex-col gap-6 relative z-20">
					{rows.map(({ left, right, rowNum }) => (
						<div key={rowNum} className="relative">
							{/* Etiqueta de Fila en el asfalto */}
							<div className="absolute -left-1 sm:-left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] sm:text-[9px] font-black tracking-widest text-zinc-600 uppercase pointer-events-none">
								FILA {rowNum}
							</div>

							<div className="grid grid-cols-2 gap-3 sm:gap-6 items-start">
								{/* Monoplaza Impar (Izquierda - Adelantado) */}
								{left ? (
									<GridSlotCard
										driver={left}
										isPole={left.gridPos === 1 || left.pos === "1"}
										onSelect={() => {
											const posNum = left.gridPos ?? parseInt(left.pos, 10);
											openDriverModal({
												driverCode: left.code,
												code: left.code,
												name: left.name,
												teamName: left.team,
												driverId: left.code?.toLowerCase(),
												position: posNum,
												gridPos: posNum,
												qualyPos: left.qualyPos,
												gapTime: left.gapTime,
												delta: left.delta,
												penaltyNote: left.penaltyNote,
												sessionType: "grid",
												sessionName: "Grilla de Salida",
											});
											triggerHaptic("light");
										}}
									/>
								) : (
									<div />
								)}

								{/* Monoplaza Par (Derecha - Retrasado 20px) */}
								{right ? (
									<div className="mt-4 sm:mt-6">
										<GridSlotCard
											driver={right}
											isPole={false}
											onSelect={() => {
												const posNum = right.gridPos ?? parseInt(right.pos, 10);
												openDriverModal({
													driverCode: right.code,
													code: right.code,
													name: right.name,
													teamName: right.team,
													driverId: right.code?.toLowerCase(),
													position: posNum,
													gridPos: posNum,
													qualyPos: right.qualyPos,
													gapTime: right.gapTime,
													delta: right.delta,
													penaltyNote: right.penaltyNote,
													sessionType: "grid",
													sessionName: "Grilla de Salida",
												});
												triggerHaptic("light");
											}}
										/>
									</div>
								) : (
									<div />
								)}
							</div>
						</div>
					))}
				</div>

				{/* Fin de recta / Entrada a Curva 1 */}
				<div className="w-full py-4 bg-zinc-950/90 border-t border-zinc-800 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest relative z-20">
					⬇️ DIRECCIÓN A CURVA 1 · FORMATION LAP ⬇️
				</div>
			</div>
		</div>
	);
};

// ================= TARJETA INDIVIDUAL DE CAJÓN DE SALIDA =================
interface GridSlotCardProps {
	driver: DriverResult;
	isPole: boolean;
	onSelect: () => void;
}

const GridSlotCard: React.FC<GridSlotCardProps> = ({ driver, isPole, onSelect }) => {
	const posNumber = driver.gridPos ?? parseInt(driver.pos, 10);
	const photoUrl = getDriverPhoto(driver.code, driver.name);
	const flagCode = driverFlagMap[driver.code?.toUpperCase()] || "";
	const hasPenalty = Boolean(driver.penaltyNote);
	const delta = driver.delta ?? 0;

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={onSelect}
			className={`relative group cursor-pointer rounded-2xl p-2.5 sm:p-3.5 transition-all duration-300 border ${
				isPole
					? "bg-gradient-to-b from-amber-950/40 via-zinc-900/90 to-zinc-950/95 border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.2)]"
					: "bg-zinc-900/80 hover:bg-zinc-900/95 border-zinc-800 hover:border-zinc-700 shadow-xl"
			}`}
		>
			{/* Marcas de Cajón FIA en el suelo (Brackets esquineros amarillos/blancos) */}
			<div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400/80 pointer-events-none rounded-tl-xs" />
			<div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400/80 pointer-events-none rounded-tr-xs" />
			<div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400/80 pointer-events-none rounded-bl-xs" />
			<div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400/80 pointer-events-none rounded-br-xs" />

			{/* Cabecera del Cajón: Puesto + Insignia Pole + Dorsal */}
			<div className="flex items-center justify-between gap-1.5 mb-2 relative z-10">
				<div className="flex items-center gap-1.5">
					<div
						className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-md ${
							isPole
								? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
								: "bg-zinc-800 text-white border border-zinc-700"
						}`}
					>
						P{posNumber}
					</div>
					{isPole && (
						<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/50 text-amber-300 animate-pulse">
							🏆 POLE
						</span>
					)}
				</div>

				<div className="flex items-center gap-1.5">
					{/* Variación de posición respecto a Clasificación */}
					{delta !== 0 && (
						<span
							className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
								delta > 0
									? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
									: "bg-red-500/20 border-red-500/40 text-red-400"
							}`}
						>
							{delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
						</span>
					)}
					{driver.qualyPos && delta !== 0 && (
						<span className="text-[9px] text-zinc-500 font-bold hidden sm:inline-block">
							(Q: P{driver.qualyPos})
						</span>
					)}
					<span className="text-[10px] font-bold text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-950/70 border border-zinc-800">
						#{driver.number}
					</span>
				</div>
			</div>

			{/* ================= CONTENIDO CENTRAL: AUTO CENITAL + FICHA PILOTO ================= */}
			<div className="flex items-center gap-2.5 sm:gap-3.5 my-1">
				{/* MONOPLAZA VISTO DESDE ARRIBA (TOP-DOWN CAR) */}
				<div className="relative shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
					<F1CarTopDown
						constructorId={driver.constructorId}
						teamName={driver.team}
						driverNumber={driver.number}
						className="w-14 h-32 sm:w-16 sm:h-36"
					/>
				</div>

				{/* DATOS DEL PILOTO Y ESCUDERÍA */}
				<div className="flex-1 min-w-0 flex flex-col justify-center">
					{/* Foto circular del piloto */}
					<div className="flex items-center gap-2 mb-1.5">
						<div className="relative">
							<img
								src={photoUrl}
								alt={driver.name}
								className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-zinc-700 bg-zinc-950 shadow-md group-hover:border-amber-400 transition-colors duration-300"
								onError={(e) => {
									(e.target as HTMLElement).style.display = "none";
								}}
							/>
							{flagCode && (
								<img
									src={`https://flagcdn.com/w20/${flagCode}.png`}
									alt=""
									className="w-3.5 h-auto rounded-xs absolute -bottom-0.5 -right-0.5 shadow-xs border border-zinc-950"
								/>
							)}
						</div>

						<div className="truncate min-w-0">
							<p className="text-xs sm:text-sm font-black text-white truncate leading-tight group-hover:text-amber-300 transition-colors">
								{driver.name}
							</p>
							<div className="flex items-center gap-1.5 mt-0.5">
								<TeamLogoMini teamName={driver.team} />
								<span className="text-[10px] sm:text-[11px] text-zinc-400 truncate font-semibold">
									{driver.team}
								</span>
							</div>
						</div>
					</div>

					{/* Badge de Penalización de la FIA si aplica */}
					{hasPenalty && (
						<div className="mt-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-xs">
							<span className="text-[9px] font-black tracking-wide">
								⚠️ {driver.penaltyNote}
							</span>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default StartingGridTrack;
