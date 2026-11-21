"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useDriverModalStore } from "@/stores/useDriverModalStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { isFavoriteDriver, DRIVER_NUMBER_TO_TLA } from "@/lib/favoriteDriver";
import { getCountryCodeForGp } from "@/lib/f1Translations";
import Flag from "@/components/Flag";
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

interface StartingGridBroadcastProps {
	gridResults: DriverResult[];
	gpName?: string;
	countryCode?: string;
}

// 📸 Mapeo de fotos oficiales de pilotos en /drivers/grid/
const driverPhotoMap: Record<string, string> = {
	VER: "verstappen", RUS: "russell", NOR: "norris", HAD: "hadjar",
	LIN: "lindblad", ANT: "antonelli", LAW: "lawson", GAS: "gasly",
	COL: "colapinto", LEC: "leclerc", HAM: "hamilton", HUL: "hulkenberg",
	BOR: "bortoleto", ALB: "albon", CAM: "camara", PER: "perez",
	PIA: "piastri", ALO: "alonso", BOT: "bottas", SAI: "sainz",
	STR: "stroll", BEA: "bearman", TSU: "tsunoda", OCO: "ocon",
	HIR: "hirakawa", DOO: "doohan"
};

function getDriverPhoto(code?: string, name?: string, number?: string): string {
	const c = (code || "").toUpperCase().trim();
	if (driverPhotoMap[c]) return `/drivers/grid/${driverPhotoMap[c]}.jpg`;
	if (number && DRIVER_NUMBER_TO_TLA[number] && driverPhotoMap[DRIVER_NUMBER_TO_TLA[number]]) {
		return `/drivers/grid/${driverPhotoMap[DRIVER_NUMBER_TO_TLA[number]]}.jpg`;
	}
	const n = (name || "").toLowerCase();
	for (const [, slug] of Object.entries(driverPhotoMap)) {
		if (n.includes(slug)) return `/drivers/grid/${slug}.jpg`;
	}
	return "/drivers/grid/verstappen.jpg";
}

// 🎨 Estilos oficiales de barras para la gráfica de TV (F1 Broadcast Theme)
interface BroadcastTheme {
	primary: string;
	bgGradient: string;
	borderColor: string;
	textGlow: string;
}

function getBroadcastTheme(constructorId?: string, teamName?: string): BroadcastTheme {
	const c = (constructorId || "").toLowerCase();
	const t = (teamName || "").toLowerCase();

	if (c.includes("red-bull") || t.includes("red bull")) {
		return {
			primary: "#0040ff",
			bgGradient: "from-[#08152c] via-[#091e42] to-[#040b18]",
			borderColor: "#0055ff",
			textGlow: "rgba(0, 85, 255, 0.4)",
		};
	}
	if (c.includes("mercedes") || t.includes("mercedes")) {
		return {
			primary: "#00d2be",
			bgGradient: "from-[#061d1b] via-[#082a27] to-[#041211]",
			borderColor: "#00d2be",
			textGlow: "rgba(0, 210, 190, 0.4)",
		};
	}
	if (c.includes("mclaren") || t.includes("mclaren")) {
		return {
			primary: "#ff8000",
			bgGradient: "from-[#2b1404] via-[#3a1b05] to-[#170a02]",
			borderColor: "#ff8000",
			textGlow: "rgba(255, 128, 0, 0.4)",
		};
	}
	if (c.includes("ferrari") || t.includes("ferrari")) {
		return {
			primary: "#ef1a24",
			bgGradient: "from-[#290507] via-[#3d080b] to-[#170304]",
			borderColor: "#ef1a24",
			textGlow: "rgba(239, 26, 36, 0.4)",
		};
	}
	if (c.includes("alpine") || t.includes("alpine")) {
		return {
			primary: "#0090ff",
			bgGradient: "from-[#04172f] via-[#06244a] to-[#030e1d]",
			borderColor: "#0090ff",
			textGlow: "rgba(0, 144, 255, 0.4)",
		};
	}
	if (c.includes("williams") || t.includes("williams")) {
		return {
			primary: "#005aff",
			bgGradient: "from-[#03132e] via-[#051e47] to-[#020b1b]",
			borderColor: "#005aff",
			textGlow: "rgba(0, 90, 255, 0.4)",
		};
	}
	if (c.includes("racing-bulls") || c.includes("rb") || t.includes("racing bulls")) {
		return {
			primary: "#1634cb",
			bgGradient: "from-[#07133b] via-[#0b1d5c] to-[#03091f]",
			borderColor: "#1634cb",
			textGlow: "rgba(22, 52, 203, 0.4)",
		};
	}
	if (c.includes("audi") || c.includes("sauber") || t.includes("audi")) {
		return {
			primary: "#00e700",
			bgGradient: "from-[#041c04] via-[#072d07] to-[#021002]",
			borderColor: "#00e700",
			textGlow: "rgba(0, 231, 0, 0.4)",
		};
	}
	if (c.includes("haas") || t.includes("haas")) {
		return {
			primary: "#e6002b",
			bgGradient: "from-[#24060b] via-[#330910] to-[#140306]",
			borderColor: "#e6002b",
			textGlow: "rgba(230, 0, 43, 0.4)",
		};
	}
	if (c.includes("aston") || t.includes("aston")) {
		return {
			primary: "#00594f",
			bgGradient: "from-[#041c19] via-[#062d28] to-[#02110f]",
			borderColor: "#00a390",
			textGlow: "rgba(0, 163, 144, 0.4)",
		};
	}
	if (c.includes("cadillac") || t.includes("cadillac")) {
		return {
			primary: "#d4af37",
			bgGradient: "from-[#1a170b] via-[#2a240f] to-[#0d0c06]",
			borderColor: "#d4af37",
			textGlow: "rgba(212, 175, 55, 0.4)",
		};
	}

	return {
		primary: "#71717a",
		bgGradient: "from-[#18181b] via-[#27272a] to-[#09090b]",
		borderColor: "#52525b",
		textGlow: "rgba(113, 113, 122, 0.4)",
	};
}

// 🛡️ Mini Logo de Escudería
const TeamLogoBroadcast: React.FC<{ teamName: string }> = ({ teamName }) => {
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
	else if (clean.includes("audi") || clean.includes("sauber")) fallbacks.push("/team-logos/audi.svg");
	else if (clean.includes("haas")) fallbacks.push("/team-logos/haas-f1-team.svg", "/team-logos/haas.svg");
	else if (clean.includes("aston")) fallbacks.push("/team-logos/aston-martin.svg");
	else if (clean.includes("cadillac")) fallbacks.push("/team-logos/cadillac.svg", "/team-logos/cadillac-f1-team.svg");
	else fallbacks.push(`/team-logos/${clean.replaceAll(" ", "-")}.svg`);

	fallbacks.push("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='6' fill='%2352525b'/></svg>");

	return (
		<img
			src={fallbacks[fallbackIdx]}
			alt={teamName}
			className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0 drop-shadow-md"
			onError={() => {
				if (fallbackIdx < fallbacks.length - 1) setFallbackIdx(fallbackIdx + 1);
			}}
		/>
	);
};

// 🏁 Textura de fibra de carbono premium con acento oro
const carbonFiberStyle: React.CSSProperties = {
	backgroundColor: "#070709",
	backgroundImage: `
		radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.18) 0%, transparent 65%),
		radial-gradient(ellipse at 50% 100%, rgba(217, 119, 6, 0.10) 0%, transparent 50%),
		repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 2px, transparent 2px, transparent 4px),
		repeating-linear-gradient(-45deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 2px, transparent 2px, transparent 4px),
		linear-gradient(180deg, #0e0e12 0%, #060608 100%)
	`,
	backgroundSize: "100% 100%, 100% 100%, 8px 8px, 8px 8px, 100% 100%",
};

export const StartingGridBroadcast: React.FC<StartingGridBroadcastProps> = ({
	gridResults,
	gpName = "Gran Premio de Las Vegas",
	countryCode,
}) => {
	const openDriverModal = useDriverModalStore((state) => state.open);

	const sorted = [...gridResults].sort((a, b) => {
		const posA = a.gridPos ?? parseInt(a.pos, 10) ?? 99;
		const posB = b.gridPos ?? parseInt(b.pos, 10) ?? 99;
		return posA - posB;
	});

	// Separar en 2 columnas estilo transmisión F1 (Izquierda impares: 1, 3, 5... Derecha pares: 2, 4, 6...)
	const leftColumn = sorted.filter((_, idx) => idx % 2 === 0);
	const rightColumn = sorted.filter((_, idx) => idx % 2 === 1);

	const resolvedCountry = countryCode || getCountryCodeForGp(gpName) || "usa";

	return (
		<div className="w-full flex gap-3 sm:gap-4 lg:gap-5 items-stretch select-none font-mono">
			{/* ================= BANNER LATERAL VERTICAL F1 GRID (FIBRA DE CARBONO + ORO + LOGO GRANDE) ================= */}
			<div
				style={carbonFiberStyle}
				className="hidden md:flex flex-col items-center justify-between w-18 lg:w-22 shrink-0 rounded-2xl border border-amber-500/40 p-3 py-6 relative overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.2)] select-none"
			>
				{/* Resplandor superior oro */}
				<div className="absolute top-0 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/25 via-transparent to-transparent pointer-events-none" />

				{/* Favicon de la App destacado y grande arriba de GRID (Branding para capturas / redes) */}
				<div className="flex flex-col items-center relative z-10 pt-1 group">
					<div className="relative p-1.5 rounded-2xl bg-black/60 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-transform duration-300 group-hover:scale-105">
						<img
							src="/favicon.webp"
							alt="Blackbox"
							className="w-11 h-11 lg:w-14 lg:h-14 object-contain drop-shadow-[0_0_16px_rgba(245,158,11,0.6)] select-none"
						/>
					</div>
					<span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-amber-400/90 mt-1.5">
						BLACKBOX
					</span>
				</div>

				{/* Letras verticales G - R - I - D en oro metálico líquido */}
				<div className="flex flex-col items-center justify-center gap-6 lg:gap-8 my-auto relative z-10 font-black text-2xl lg:text-3xl tracking-widest select-none">
					<span className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(245,158,11,0.6)]">
						G
					</span>
					<span className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(245,158,11,0.6)]">
						R
					</span>
					<span className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(245,158,11,0.6)]">
						I
					</span>
					<span className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(245,158,11,0.6)]">
						D
					</span>
				</div>

				{/* Detalle inferior oro */}
				<div className="w-8 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 rounded-full relative z-10 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
			</div>

			{/* ================= CONTENEDOR PRINCIPAL DE GRILLA ================= */}
			<div className="flex-1 min-w-0 flex flex-col">
				{/* ================= CABECERA ESTILO F1 TV BROADCAST (CON BANDERA DEL PAÍS) ================= */}
				<div
					style={carbonFiberStyle}
					className="w-full border border-zinc-800/90 border-t-amber-500/50 rounded-2xl p-3 sm:p-3.5 mb-3.5 shadow-xl relative overflow-hidden"
				>
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							{/* Bandera del país en curso */}
							<div className="flex items-center justify-center overflow-hidden rounded-xl border border-amber-500/40 bg-zinc-900/90 shadow-[0_0_14px_rgba(245,158,11,0.25)] shrink-0 p-1">
								<Flag
									countryCode={resolvedCountry}
									className="h-7 w-11 sm:h-8 sm:w-12 object-cover rounded-lg shadow-sm"
								/>
							</div>
							<div>
								<h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-wide uppercase leading-tight">
									{gpName}
								</h3>
								<p className="text-[9.5px] sm:text-[11px] font-bold text-amber-400 tracking-widest uppercase leading-tight mt-0.5">
									PARRILLA OFICIAL DE SALIDA · STARTING GRID
								</p>
							</div>
						</div>

						{/* Lado derecho completamente limpio (sin FIA Homologated) */}
						<div />
					</div>
				</div>

				{/* ================= 2 COLUMNAS ESCALONADAS (FORMATO F1 GRID) ================= */}
				<div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 md:gap-4 items-start">
					{/* COLUMNA IZQUIERDA (P1, P3, P5, P7, P9, P11, P13, P15, P17, P19, P21) */}
					<div className="flex flex-col gap-2.5 sm:gap-3">
						{leftColumn.map((driver) => (
							<BroadcastCard
								key={`left-${driver.number}-${driver.pos}`}
								driver={driver}
								onSelect={() => {
									openDriverModal({
										driverCode: driver.code,
										code: driver.code,
										name: driver.name,
										teamName: driver.team,
										driverId: driver.code?.toLowerCase(),
									});
									triggerHaptic("light");
								}}
							/>
						))}
					</div>

					{/* COLUMNA DERECHA (P2, P4, P6, P8, P10, P12, P14, P16, P18, P20, P22) CON ESCALÓN MEDIO PUESTO */}
					<div className="flex flex-col gap-2.5 sm:gap-3 sm:mt-7 md:mt-8">
						{rightColumn.map((driver) => (
							<BroadcastCard
								key={`right-${driver.number}-${driver.pos}`}
								driver={driver}
								onSelect={() => {
									openDriverModal({
										driverCode: driver.code,
										code: driver.code,
										name: driver.name,
										teamName: driver.team,
										driverId: driver.code?.toLowerCase(),
									});
									triggerHaptic("light");
								}}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

// ================= TARJETA INDIVIDUAL COMPACTA (ESTILO F1 TV GRAPHIC) =================
interface BroadcastCardProps {
	driver: DriverResult;
	onSelect: () => void;
}

const BroadcastCard: React.FC<BroadcastCardProps> = ({ driver, onSelect }) => {
	const posNum = driver.gridPos ?? parseInt(driver.pos, 10);
	const isP1 = posNum === 1;
	const theme = getBroadcastTheme(driver.constructorId, driver.team);
	const photoUrl = getDriverPhoto(driver.code, driver.name, driver.number);
	const delta = driver.delta ?? 0;
	const hasPenalty = Boolean(driver.penaltyNote);

	// Piloto favorito de Zustand
	const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);

	// Por defecto si la lista de favoritos está vacía, destacamos a Franco Colapinto (#43 / COL)
	const isFav =
		isFavoriteDriver(driver, favoriteDrivers) ||
		(favoriteDrivers.length === 0 &&
			(driver.code === "COL" ||
				driver.number === "43" ||
				(driver.name || "").toLowerCase().includes("colapinto")));

	// Extraer número de sanción (ej: "PEN +10p" -> "10", "PEN +5" -> "5")
	const getPenaltyNumber = (note?: string | null) => {
		if (!note) return "10";
		const match = note.match(/\d+/);
		return match ? match[0] : "10";
	};

	// 💎 Estilos 3D Glassmorphic Capsule (Concept B)
	const glassPenaltyStyle: React.CSSProperties = {
		background: "radial-gradient(ellipse at 50% 20%, #ef4444 0%, #b91c1c 55%, #450a0a 100%)",
		boxShadow:
			"inset 0 1.5px 1.5px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.6), 0 0 14px rgba(239, 68, 68, 0.45), 0 2px 5px rgba(0, 0, 0, 0.6)",
		border: "1px solid rgba(254, 202, 202, 0.5)",
	};

	const glassGainStyle: React.CSSProperties = {
		background: "radial-gradient(ellipse at 50% 20%, #10b981 0%, #047857 55%, #022c22 100%)",
		boxShadow:
			"inset 0 1.5px 1.5px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.6), 0 0 14px rgba(16, 185, 129, 0.45), 0 2px 5px rgba(0, 0, 0, 0.6)",
		border: "1px solid rgba(167, 243, 208, 0.5)",
	};

	const glassDropStyle: React.CSSProperties = {
		background: "radial-gradient(ellipse at 50% 20%, #f43f5e 0%, #be123c 55%, #4c0519 100%)",
		boxShadow:
			"inset 0 1.5px 1.5px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.6), 0 0 14px rgba(244, 63, 94, 0.45), 0 2px 5px rgba(0, 0, 0, 0.6)",
		border: "1px solid rgba(254, 205, 211, 0.5)",
	};

	// Obtener solo el apellido en mayúsculas estilo transmisión de TV
	const getLastName = (fullName: string) => {
		const parts = fullName.trim().split(" ");
		return parts[parts.length - 1].toUpperCase();
	};

	const lastName = getLastName(driver.name);

	return (
		<motion.div
			whileHover={{ scale: 1.015, x: 2 }}
			whileTap={{ scale: 0.99 }}
			onClick={onSelect}
			className={`relative group cursor-pointer flex items-center h-11 sm:h-12 md:h-12 rounded-xl border transition-all duration-200 overflow-hidden shadow-lg hover:shadow-2xl bg-gradient-to-r ${theme.bgGradient} ${
				isFav ? "ring-1.5 ring-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.35)]" : ""
			}`}
			style={{
				borderColor: isFav
					? "#ec4899"
					: isP1
					? "#fbbf24"
					: `${theme.borderColor}70`,
				boxShadow: isFav
					? "0 0 22px rgba(236,72,153,0.35)"
					: isP1
					? "0 0 20px rgba(251,191,36,0.3)"
					: "0 4px 15px rgba(0,0,0,0.5)",
			}}
		>
			{/* Franja vertical izquierda con el color primario (o rosa si es favorito) */}
			<div
				className="w-1.5 self-stretch shrink-0 group-hover:w-2 transition-all duration-200"
				style={{ backgroundColor: isFav ? "#ec4899" : isP1 ? "#fbbf24" : theme.primary }}
			/>

			{/* ================= 1. CAJA DE POSICIÓN ================= */}
			<div
				className={`w-8 sm:w-9 md:w-9.5 self-stretch flex flex-col items-center justify-center font-black shrink-0 select-none ${
					isP1
						? "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.6)]"
						: isFav
						? "bg-gradient-to-b from-pink-600 to-rose-700 text-white shadow-xs"
						: "bg-red-600 text-white shadow-xs"
				}`}
			>
				<span className="text-sm sm:text-base leading-none font-black">{posNum}</span>
				{isP1 && (
					<span className="text-[7px] sm:text-[7.5px] font-black uppercase tracking-tighter text-black/90 mt-0.5 leading-none">
						POLE
					</span>
				)}
			</div>

			{/* ================= 2. LOGO DE ESCUDERÍA ================= */}
			<div className="w-7 sm:w-8 flex items-center justify-center shrink-0 pl-1">
				<TeamLogoBroadcast teamName={driver.team} />
			</div>

			{/* ================= 3. FOTO OFICIAL RECORTADA ================= */}
			<div
				className={`w-8.5 h-8.5 sm:w-9 sm:h-9 shrink-0 relative flex items-center justify-center overflow-hidden rounded-lg border bg-zinc-950/80 mx-1 shadow-md ${
					isFav ? "border-pink-500/60" : "border-white/20"
				}`}
			>
				<img
					src={photoUrl}
					alt={driver.name}
					className="w-full h-full object-cover"
					onError={(e) => {
						(e.target as HTMLElement).style.display = "none";
					}}
				/>
			</div>

			{/* ================= 4. APELLIDO DEL PILOTO Y BADGES ================= */}
			<div className="flex-1 min-w-0 flex items-center justify-between gap-1.5 px-1.5 sm:px-2">
				{/* Apellido del piloto: 100% visible, NUNCA truncado + sutil corazón para el favorito */}
				<div className="flex items-center gap-1.5 min-w-0 shrink-0">
					<span
						className={`text-xs sm:text-sm md:text-base font-black tracking-wide uppercase whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
							isFav
								? "text-pink-200 group-hover:text-pink-100"
								: isP1
								? "text-amber-200"
								: "text-white group-hover:text-amber-300"
						}`}
					>
						{lastName}
					</span>
					{isFav && (
						<svg
							className="w-3.5 h-3.5 fill-pink-500 text-pink-500 shrink-0 drop-shadow-[0_0_8px_rgba(236,72,153,0.9)] animate-pulse"
							viewBox="0 0 24 24"
							aria-label="Piloto Favorito"
						>
							<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
						</svg>
					)}
				</div>

				{/* ================= BADGES ESTILO 3D GLASSMORPHIC PILL (CONCEPT B) ================= */}
				<div className="flex items-center gap-1.5 shrink-0 ml-auto">
					{/* 1. Sanción FIA 3D Glass Pill (Concept B): cápsula de cristal rojo con bisel superior y número grande */}
					{hasPenalty && (
						<div
							style={glassPenaltyStyle}
							className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full select-none shrink-0"
						>
							<span className="text-red-200 text-xs sm:text-sm font-black leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
								▼
							</span>
							<span className="text-xs sm:text-sm md:text-base font-black text-white leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
								{getPenaltyNumber(driver.penaltyNote)}
							</span>
							<div className="flex flex-col items-start justify-center leading-none">
								<div className="flex items-center gap-0.5 text-[8px] sm:text-[8.5px] font-black text-white uppercase tracking-wider">
									<span>POS</span>
									<span className="text-[7.5px] text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.8)]">⚠</span>
								</div>
								<span className="text-[6.5px] sm:text-[7px] font-black tracking-widest text-red-200 uppercase mt-0.5">
									PEN
								</span>
							</div>
						</div>
					)}

					{/* 2. Ganancia natural 3D Glass Pill (Concept B): cápsula de cristal esmeralda con ▲ y número grande */}
					{!hasPenalty && delta > 0 && (
						<div
							style={glassGainStyle}
							className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full select-none shrink-0"
						>
							<span className="text-emerald-200 text-xs sm:text-sm font-black leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
								▲
							</span>
							<span className="text-xs sm:text-sm md:text-base font-black text-white leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
								{delta}
							</span>
							<div className="flex flex-col items-start justify-center leading-none">
								<span className="text-[8px] sm:text-[8.5px] font-black text-white uppercase tracking-wider">
									POS
								</span>
								<span className="text-[6.5px] sm:text-[7px] font-black tracking-widest text-emerald-200 uppercase mt-0.5">
									GAIN
								</span>
							</div>
						</div>
					)}

					{/* 3. Pérdida natural 3D Glass Pill (Concept B): cápsula de cristal rose con ▼ y número grande */}
					{!hasPenalty && delta < 0 && (
						<div
							style={glassDropStyle}
							className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full select-none shrink-0"
						>
							<span className="text-rose-200 text-xs sm:text-sm font-black leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
								▼
							</span>
							<span className="text-xs sm:text-sm md:text-base font-black text-white leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
								{Math.abs(delta)}
							</span>
							<div className="flex flex-col items-start justify-center leading-none">
								<span className="text-[8px] sm:text-[8.5px] font-black text-white uppercase tracking-wider">
									POS
								</span>
								<span className="text-[6.5px] sm:text-[7px] font-black tracking-widest text-rose-200 uppercase mt-0.5">
									DROP
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default StartingGridBroadcast;
