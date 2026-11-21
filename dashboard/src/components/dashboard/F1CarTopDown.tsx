"use client";

import React from "react";

export interface F1CarTheme {
	primary: string;       // Color principal del chasis
	secondary: string;     // Color secundario (alerones, pontones)
	accent: string;        // Detalle / línea aerodinámica
	halo: string;          // Color del Halo
	helmet: string;        // Color casco del piloto
	tireStripe?: string;   // Compuesto Pirelli (rojo = soft, amarillo = med, blanco = hard)
	numberColor?: string;  // Color del dorsal
}

// 🎨 Paletas oficiales de libreas 2026 para cada constructor
export const teamCarThemes: Record<string, F1CarTheme> = {
	"red-bull": {
		primary: "#06132b",
		secondary: "#dc0000",
		accent: "#fcd300",
		halo: "#06132b",
		helmet: "#fcd300",
		tireStripe: "#ef4444",
		numberColor: "#fcd300",
	},
	"red-bull-racing": {
		primary: "#06132b",
		secondary: "#dc0000",
		accent: "#fcd300",
		halo: "#06132b",
		helmet: "#fcd300",
		tireStripe: "#ef4444",
		numberColor: "#fcd300",
	},
	"mercedes": {
		primary: "#1b2126",
		secondary: "#00d2be",
		accent: "#e5e7eb",
		halo: "#00d2be",
		helmet: "#00d2be",
		tireStripe: "#eab308",
		numberColor: "#00d2be",
	},
	"mclaren": {
		primary: "#ff8000",
		secondary: "#141414",
		accent: "#47c7fc",
		halo: "#ff8000",
		helmet: "#ff8000",
		tireStripe: "#ef4444",
		numberColor: "#ffffff",
	},
	"ferrari": {
		primary: "#ef1a24",
		secondary: "#141414",
		accent: "#fff200",
		halo: "#ef1a24",
		helmet: "#fff200",
		tireStripe: "#ef4444",
		numberColor: "#ffffff",
	},
	"alpine": {
		primary: "#0090ff",
		secondary: "#ff589b",
		accent: "#ffffff",
		halo: "#0090ff",
		helmet: "#0090ff",
		tireStripe: "#ef4444",
		numberColor: "#ffffff",
	},
	"williams": {
		primary: "#005aff",
		secondary: "#041e42",
		accent: "#00a0de",
		halo: "#005aff",
		helmet: "#00a0de",
		tireStripe: "#eab308",
		numberColor: "#ffffff",
	},
	"racing-bulls": {
		primary: "#1634cb",
		secondary: "#ffffff",
		accent: "#eb1a3c",
		halo: "#1634cb",
		helmet: "#ffffff",
		tireStripe: "#ef4444",
		numberColor: "#eb1a3c",
	},
	"rb": {
		primary: "#1634cb",
		secondary: "#ffffff",
		accent: "#eb1a3c",
		halo: "#1634cb",
		helmet: "#ffffff",
		tireStripe: "#ef4444",
		numberColor: "#eb1a3c",
	},
	"audi": {
		primary: "#181a1c",
		secondary: "#00e700",
		accent: "#a1a1aa",
		halo: "#00e700",
		helmet: "#00e700",
		tireStripe: "#ef4444",
		numberColor: "#00e700",
	},
	"kick-sauber": {
		primary: "#181a1c",
		secondary: "#00e700",
		accent: "#a1a1aa",
		halo: "#00e700",
		helmet: "#00e700",
		tireStripe: "#ef4444",
		numberColor: "#00e700",
	},
	"haas": {
		primary: "#f4f4f5",
		secondary: "#18181b",
		accent: "#e6002b",
		halo: "#18181b",
		helmet: "#e6002b",
		tireStripe: "#eab308",
		numberColor: "#e6002b",
	},
	"haas-f1-team": {
		primary: "#f4f4f5",
		secondary: "#18181b",
		accent: "#e6002b",
		halo: "#18181b",
		helmet: "#e6002b",
		tireStripe: "#eab308",
		numberColor: "#e6002b",
	},
	"aston-martin": {
		primary: "#00594f",
		secondary: "#111827",
		accent: "#cedc00",
		halo: "#00594f",
		helmet: "#cedc00",
		tireStripe: "#ef4444",
		numberColor: "#cedc00",
	},
	"cadillac": {
		primary: "#0d0e12",
		secondary: "#374151",
		accent: "#d4af37",
		halo: "#d4af37",
		helmet: "#d4af37",
		tireStripe: "#eab308",
		numberColor: "#d4af37",
	},
	"cadillac-f1-team": {
		primary: "#0d0e12",
		secondary: "#374151",
		accent: "#d4af37",
		halo: "#d4af37",
		helmet: "#d4af37",
		tireStripe: "#eab308",
		numberColor: "#d4af37",
	},
};

export function getCarTheme(constructorId?: string, teamName?: string): F1CarTheme {
	const cId = (constructorId || "").toLowerCase().trim();
	if (teamCarThemes[cId]) return teamCarThemes[cId];

	const tName = (teamName || "").toLowerCase().trim();
	for (const [key, theme] of Object.entries(teamCarThemes)) {
		if (tName.includes(key)) return theme;
	}

	if (tName.includes("red bull")) return teamCarThemes["red-bull"];
	if (tName.includes("mercedes")) return teamCarThemes["mercedes"];
	if (tName.includes("ferrari")) return teamCarThemes["ferrari"];
	if (tName.includes("mclaren")) return teamCarThemes["mclaren"];
	if (tName.includes("alpine")) return teamCarThemes["alpine"];
	if (tName.includes("williams")) return teamCarThemes["williams"];
	if (tName.includes("audi") || tName.includes("sauber")) return teamCarThemes["audi"];
	if (tName.includes("haas")) return teamCarThemes["haas"];
	if (tName.includes("aston")) return teamCarThemes["aston-martin"];
	if (tName.includes("cadillac")) return teamCarThemes["cadillac"];
	if (tName.includes("rb") || tName.includes("racing bulls")) return teamCarThemes["racing-bulls"];

	// Fallback genérico de carreras
	return {
		primary: "#3f3f46",
		secondary: "#18181b",
		accent: "#fbbf24",
		halo: "#fbbf24",
		helmet: "#fbbf24",
		tireStripe: "#ef4444",
		numberColor: "#ffffff",
	};
}

interface F1CarTopDownProps {
	constructorId?: string;
	teamName?: string;
	driverNumber?: string | number;
	className?: string;
	themeOverride?: Partial<F1CarTheme>;
	showNumber?: boolean;
	x?: number | string;
	y?: number | string;
	width?: number | string;
	height?: number | string;
}

export const F1CarTopDown: React.FC<F1CarTopDownProps> = ({
	constructorId,
	teamName,
	driverNumber,
	className = "w-20 h-44",
	themeOverride,
	showNumber = true,
	x,
	y,
	width,
	height,
}) => {
	const baseTheme = getCarTheme(constructorId, teamName);
	const theme: F1CarTheme = { ...baseTheme, ...themeOverride };
	const tireColor = theme.tireStripe || "#ef4444"; // Soft por defecto

	return (
		<svg
			viewBox="0 0 100 240"
			x={x}
			y={y}
			width={width}
			height={height}
			className={`${className} drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] filter transition-transform duration-300 select-none`}
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				{/* Sombras de neumáticos y suelo */}
				<radialGradient id="tireShadow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
					<stop offset="100%" stopColor="#000000" stopOpacity="0" />
				</radialGradient>

				{/* Gradiente de brillo del chasis */}
				<linearGradient id={`carShine-${constructorId}`} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
					<stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
					<stop offset="50%" stopColor="#000000" stopOpacity="0.2" />
					<stop offset="65%" stopColor="#ffffff" stopOpacity="0.05" />
					<stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
				</linearGradient>

				{/* Gradiente de fibra de carbono para difusor y piso */}
				<linearGradient id="carbonFiber" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor="#18181b" />
					<stop offset="100%" stopColor="#09090b" />
				</linearGradient>
			</defs>

			{/* ================= 1. SOMBRA DEL SUELO / EFECTO VENTURI ================= */}
			<ellipse cx="50" cy="130" rx="42" ry="95" fill="url(#tireShadow)" opacity="0.6" />

			{/* ================= 2. PISO DEL MONOPLAZA (UNDERFLOOR / DIFUSOR) ================= */}
			{/* Suelo plano ensanchado bajo pontones */}
			<path
				d="M 28 85 L 72 85 L 75 165 L 70 205 L 30 205 L 25 165 Z"
				fill="url(#carbonFiber)"
				stroke="#27272a"
				strokeWidth="0.8"
			/>
			{/* Aletas de difusor trasero */}
			<rect x="36" y="215" width="28" height="18" rx="2" fill="#09090b" stroke="#18181b" strokeWidth="0.6" />
			<line x1="43" y1="216" x2="43" y2="232" stroke="#27272a" strokeWidth="1" />
			<line x1="50" y1="216" x2="50" y2="232" stroke="#27272a" strokeWidth="1" />
			<line x1="57" y1="216" x2="57" y2="232" stroke="#27272a" strokeWidth="1" />

			{/* Luz trasera de lluvia FIA (LED parpadeante en el centro del difusor) */}
			<rect x="47.5" y="231" width="5" height="3" rx="1" fill="#ef4444" />
			<circle cx="50" cy="232.5" r="3.5" fill="#ef4444" opacity="0.5" />

			{/* ================= 3. BRAZOS DE SUSPENSIÓN (CARBON FIBER WISHBONES) ================= */}
			{/* Delantera */}
			<line x1="18" y1="62" x2="42" y2="58" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" />
			<line x1="18" y1="74" x2="42" y2="76" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" />
			<line x1="82" y1="62" x2="58" y2="58" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" />
			<line x1="82" y1="74" x2="58" y2="76" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" />
			{/* Trasera */}
			<line x1="20" y1="172" x2="35" y2="182" stroke="#18181b" strokeWidth="2.4" strokeLinecap="round" />
			<line x1="20" y1="192" x2="35" y2="198" stroke="#18181b" strokeWidth="2.4" strokeLinecap="round" />
			<line x1="80" y1="172" x2="65" y2="182" stroke="#18181b" strokeWidth="2.4" strokeLinecap="round" />
			<line x1="80" y1="192" x2="65" y2="198" stroke="#18181b" strokeWidth="2.4" strokeLinecap="round" />

			{/* ================= 4. NEUMÁTICOS PIRELLI (18 PULGADAS) ================= */}
			{/* Delantero Izquierdo */}
			<g>
				<rect x="4" y="50" width="15" height="36" rx="4" fill="#18181b" stroke="#09090b" strokeWidth="1" />
				<line x1="11.5" y1="52" x2="11.5" y2="84" stroke={tireColor} strokeWidth="1.6" strokeDasharray="6 3" />
				<rect x="6.5" y="60" width="10" height="16" rx="2" fill="#27272a" opacity="0.6" />
			</g>
			{/* Delantero Derecho */}
			<g>
				<rect x="81" y="50" width="15" height="36" rx="4" fill="#18181b" stroke="#09090b" strokeWidth="1" />
				<line x1="88.5" y1="52" x2="88.5" y2="84" stroke={tireColor} strokeWidth="1.6" strokeDasharray="6 3" />
				<rect x="83.5" y="60" width="10" height="16" rx="2" fill="#27272a" opacity="0.6" />
			</g>
			{/* Trasero Izquierdo (Más ancho) */}
			<g>
				<rect x="1" y="165" width="19" height="42" rx="5" fill="#18181b" stroke="#09090b" strokeWidth="1" />
				<line x1="10.5" y1="168" x2="10.5" y2="204" stroke={tireColor} strokeWidth="2" strokeDasharray="7 3.5" />
				<rect x="3.5" y="177" width="14" height="18" rx="2" fill="#27272a" opacity="0.6" />
			</g>
			{/* Trasero Derecho (Más ancho) */}
			<g>
				<rect x="80" y="165" width="19" height="42" rx="5" fill="#18181b" stroke="#09090b" strokeWidth="1" />
				<line x1="89.5" y1="168" x2="89.5" y2="204" stroke={tireColor} strokeWidth="2" strokeDasharray="7 3.5" />
				<rect x="82.5" y="177" width="14" height="18" rx="2" fill="#27272a" opacity="0.6" />
			</g>

			{/* ================= 5. ALERÓN DELANTERO (FRONT WING) ================= */}
			{/* Mainplane curvado */}
			<path
				d="M 8 26 C 28 21, 72 21, 92 26 L 93 37 C 72 32, 28 32, 7 37 Z"
				fill={theme.secondary}
				stroke="#09090b"
				strokeWidth="1"
			/>
			{/* Flap superior con color de detalle */}
			<path
				d="M 12 28 C 30 24, 70 24, 88 28 L 87 33 C 70 29, 30 29, 13 33 Z"
				fill={theme.accent}
				opacity="0.9"
			/>
			{/* Endplates exteriores */}
			<rect x="6.5" y="20" width="3" height="19" rx="1.5" fill="#09090b" />
			<rect x="90.5" y="20" width="3" height="19" rx="1.5" fill="#09090b" />

			{/* ================= 6. CUERPO PRINCIPAL DEL CHASIS (MONOCOQUE & NOSE) ================= */}
			{/* Morro y cuerpo central */}
			<path
				d="M 46 22 
				   C 47 20, 53 20, 54 22 
				   L 56 60 
				   C 58 72, 67 85, 71 100 
				   C 74 112, 74 140, 71 160 
				   C 68 178, 62 195, 59 212 
				   L 41 212 
				   C 38 195, 32 178, 29 160 
				   C 26 140, 26 112, 29 100 
				   C 33 85, 42 72, 44 60 Z"
				fill={theme.primary}
				stroke="#09090b"
				strokeWidth="1.2"
			/>
			{/* Brillo 3D del chasis */}
			<path
				d="M 46 22 C 47 20, 53 20, 54 22 L 56 60 C 58 72, 67 85, 71 100 C 74 112, 74 140, 71 160 C 68 178, 62 195, 59 212 L 41 212 C 38 195, 32 178, 29 160 C 26 140, 26 112, 29 100 C 33 85, 42 72, 44 60 Z"
				fill={`url(#carShine-${constructorId})`}
			/>

			{/* Franja aerodinámica de librea / Acentos laterales */}
			<path
				d="M 48 30 L 52 30 L 54 75 C 57 95, 66 110, 68 140 L 63 140 C 61 115, 53 100, 50 78 Z"
				fill={theme.accent}
				opacity="0.85"
			/>
			<path
				d="M 52 30 L 48 30 L 46 75 C 43 95, 34 110, 32 140 L 37 140 C 39 115, 47 100, 50 78 Z"
				fill={theme.accent}
				opacity="0.85"
			/>

			{/* ================= 7. PONTONES LATERALES (SIDEPODS & AIR INTAKES) ================= */}
			{/* Entrada de aire radiador izquierda */}
			<path d="M 31 102 C 28 108, 27 122, 28 132 L 32 130 C 31 122, 32 110, 35 104 Z" fill="#09090b" />
			{/* Entrada de aire radiador derecha */}
			<path d="M 69 102 C 72 108, 73 122, 72 132 L 68 130 C 69 122, 68 110, 65 104 Z" fill="#09090b" />

			{/* ================= 8. COCKPIT, CASCO DEL PILOTO Y HALO ================= */}
			{/* Hueco del habitáculo (cockpit) */}
			<ellipse cx="50" cy="112" rx="8" ry="17" fill="#09090b" stroke="#18181b" strokeWidth="1" />

			{/* Casco del piloto */}
			<ellipse cx="50" cy="116" rx="5.5" ry="6.5" fill={theme.helmet} stroke="#09090b" strokeWidth="0.8" />
			{/* Visera del casco (negro brillante/iridiscente) */}
			<path d="M 45.5 113.5 C 47.5 111.5, 52.5 111.5, 54.5 113.5 L 53.5 116 C 51.5 114.5, 48.5 114.5, 46.5 116 Z" fill="#18181b" />

			{/* HALO DE TITANIO (Estructura de seguridad sobre el habitáculo) */}
			<path
				d="M 50 96 
				   C 47 98, 43 104, 43 118 
				   L 45.5 118 
				   C 45.5 106, 48 101, 50 99 
				   C 52 101, 54.5 106, 54.5 118 
				   L 57 118 
				   C 57 104, 53 98, 50 96 Z"
				fill={theme.halo}
				stroke="#09090b"
				strokeWidth="0.8"
			/>
			{/* Pilar central del Halo */}
			<rect x="49" y="88" width="2" height="9" fill={theme.halo} rx="1" />

			{/* Cámara T-Cam de la FIA sobre la toma de aire (Airbox) */}
			<rect x="48" y="123" width="4" height="6" rx="1.5" fill="#facc15" stroke="#09090b" strokeWidth="0.6" />

			{/* Dorsal de competición en el morro */}
			{showNumber && driverNumber && (
				<g>
					<text
						x="50"
						y="49"
						textAnchor="middle"
						fill={theme.numberColor || "#ffffff"}
						fontSize="10"
						fontWeight="900"
						fontFamily="monospace"
						letterSpacing="-0.5"
						style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.9))" }}
					>
						{driverNumber}
					</text>
				</g>
			)}

			{/* Aleta dorsal (Shark fin / Engine spine) */}
			<line x1="50" y1="131" x2="50" y2="198" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />

			{/* ================= 9. ALERÓN TRASERO & DRS (REAR WING) ================= */}
			{/* Plano principal del alerón trasero */}
			<rect x="15" y="212" width="70" height="13" rx="2" fill={theme.secondary} stroke="#09090b" strokeWidth="1" />
			{/* Flap móvil de DRS */}
			<rect x="22" y="214" width="56" height="4" rx="1" fill={theme.accent} opacity="0.9" />
			{/* Actuador central del DRS */}
			<rect x="48.5" y="210" width="3" height="7" rx="1" fill="#f43f5e" />
			{/* Endplates exteriores de carbono */}
			<rect x="13.5" y="206" width="3.5" height="21" rx="1.5" fill="#09090b" stroke="#18181b" strokeWidth="0.6" />
			<rect x="83" y="206" width="3.5" height="21" rx="1.5" fill="#09090b" stroke="#09090b" strokeWidth="0.6" />
		</svg>
	);
};

export default F1CarTopDown;
