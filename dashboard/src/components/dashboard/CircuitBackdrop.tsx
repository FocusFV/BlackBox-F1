"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCircuitDetails, type CircuitDetails, DEFAULT_CIRCUIT } from "@/lib/circuitBackdrops";
import { useEffect, useState, useCallback, useMemo } from "react";
import Flag from "@/components/Flag";
import { motion, AnimatePresence } from "motion/react";
import {
	MapPin,
	Timer,
	Gauge,
	Zap,
	RotateCcw,
	Compass,
	Flame,
	Cog,
	Crosshair,
	Activity,
	Milestone,
	MoveVertical,
	ShieldAlert,
} from "lucide-react";

interface Props {
	gpName?: string;
	country?: string;
	circuitId?: string;
	isCinematic?: boolean;
	onToggleCinematic?: () => void;
}

// 🔊 Sonido sutil sintetizado de telemetría HUD (cero archivos externos, Web Audio API nativo)
function playHudChime() {
	try {
		const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioCtx) return;
		const ctx = new AudioCtx();
		if (ctx.state === "suspended") ctx.resume();

		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = "sine";
		osc.frequency.setValueAtTime(587.33, now); // D5
		osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

		gain.gain.setValueAtTime(0.06, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(now);
		osc.stop(now + 0.2);
	} catch {}
}

// Helper para calcular la posición y ángulo de la Línea de Meta a partir del trazado SVG
function getStartFinishCoords(svgPath: string): {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	angleDeg: number;
} | null {
	if (!svgPath) return null;
	// Extraemos los primeros dos puntos (M x0 y0 L x1 y1)
	const match = svgPath.match(/M\s*([\d.-]+)[,\s]+([\d.-]+)(?:[^\d.-]+([\d.-]+)[,\s]+([\d.-]+))?/);
	if (!match) return null;
	const x0 = parseFloat(match[1]);
	const y0 = parseFloat(match[2]);
	const nextX = match[3] ? parseFloat(match[3]) : x0 + 10;
	const nextY = match[4] ? parseFloat(match[4]) : y0;

	// Vector tangente al trazado
	const dx = nextX - x0;
	const dy = nextY - y0;
	const len = Math.hypot(dx, dy) || 1;

	// Vector normal perpendicular para la línea de meta (longitud 14px a cada lado)
	const nx = -dy / len;
	const ny = dx / len;
	const halfWidth = 14;

	return {
		x0,
		y0,
		x1: x0 - nx * halfWidth,
		y1: y0 - ny * halfWidth,
		x2: x0 + nx * halfWidth,
		y2: y0 + ny * halfWidth,
		angleDeg: (Math.atan2(ny, nx) * 180) / Math.PI,
	};
}

export function CircuitBackdrop({
	gpName,
	country,
	circuitId,
	isCinematic = false,
	onToggleCinematic,
}: Props) {
	const oledMode = useSettingsStore((state) => state.oledMode);
	const [circuit, setCircuit] = useState<CircuitDetails>(DEFAULT_CIRCUIT);
	const [imageUrl, setImageUrl] = useState<string>("/circuits/default.webp");
	const [loaded, setLoaded] = useState(true);

	// Reproducir sonido al entrar al modo cinemático (Easter Egg)
	useEffect(() => {
		if (isCinematic) {
			playHudChime();
		}
	}, [isCinematic]);

	useEffect(() => {
		// 1. Intentar resolver mediante props
		const details = getCircuitDetails(gpName, country, circuitId);
		if (details.key !== "default") {
			setCircuit(details);
			setImageUrl(details.imageUrl);
			return;
		}

		// 2. Si no hay props específicas, consultar la próxima o última carrera de la API
		let isMounted = true;
		async function autoResolveCircuit() {
			try {
				const resNext = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json");
				const dataNext = await resNext.json();
				if (isMounted && dataNext?.MRData?.RaceTable?.Races?.length > 0) {
					const race = dataNext.MRData.RaceTable.Races[0];
					const d = getCircuitDetails(
						race.raceName,
						race.Circuit?.Location?.country,
						race.Circuit?.circuitId
					);
					setCircuit(d);
					setImageUrl(d.imageUrl);
					return;
				}
			} catch {}

			try {
				const resLast = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json");
				const dataLast = await resLast.json();
				if (isMounted && dataLast?.MRData?.RaceTable?.Races?.length > 0) {
					const race = dataLast.MRData.RaceTable.Races[0];
					const d = getCircuitDetails(
						race.raceName,
						race.Circuit?.Location?.country,
						race.Circuit?.circuitId
					);
					setCircuit(d);
					setImageUrl(d.imageUrl);
					return;
				}
			} catch {}
		}

		autoResolveCircuit();

		return () => {
			isMounted = false;
		};
	}, [gpName, country, circuitId]);

	const handleContainerClick = useCallback(() => {
		if (onToggleCinematic) {
			onToggleCinematic();
		}
	}, [onToggleCinematic]);

	// Coordenadas calculadas para la Línea de Meta 🏁
	const finishLine = useMemo(() => {
		return getStartFinishCoords(circuit.svgPath);
	}, [circuit.svgPath]);

	if (oledMode) {
		return null;
	}

	return (
		<div
			onClick={handleContainerClick}
			className={`fixed inset-0 select-none transition-all duration-700 overflow-hidden ${
				isCinematic
					? "z-40 pointer-events-auto cursor-pointer bg-black/65 backdrop-blur-md"
					: "z-0 pointer-events-auto cursor-pointer"
			}`}
		>
			{/* 🏎️ IMAGEN AÉREA CINEMATOGRÁFICA DEL CIRCUITO */}
			<img
				key={imageUrl}
				src={imageUrl}
				alt={circuit.name}
				onLoad={() => setLoaded(true)}
				onError={() => {
					setImageUrl("/circuits/default.webp");
					setLoaded(true);
				}}
				className={`w-full h-full object-cover object-center filter contrast-[1.10] transition-all duration-700 ${
					isCinematic
						? "opacity-90 scale-105 brightness-[1.05]"
						: loaded
						? "opacity-65 scale-100 brightness-[1.0]"
						: "opacity-50 scale-100 brightness-[0.9]"
				}`}
			/>

			{/* Viñetas cinematográficas suaves para enriquecer el contraste */}
			<div
				className={`absolute inset-0 transition-opacity duration-700 ${
					isCinematic
						? "bg-gradient-to-t from-black/95 via-black/55 to-black/45"
						: "bg-gradient-to-t from-black/80 via-black/35 to-black/15"
				}`}
			/>
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />

			{/* 🎮 EASTER EGG: HUD DE TELEMETRÍA CINEMÁTICA CON MAPA 2D Y ALTO CONTRASTE */}
			<AnimatePresence>
				{isCinematic && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.35 }}
						className="absolute inset-0 flex flex-col justify-between p-3 sm:p-6 md:p-8 overflow-y-auto no-scrollbar pointer-events-none"
					>
						{/* 🏁 ENCABEZADO SUPERIOR: DATOS GENERALES Y ENLACE OFICIAL */}
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45, ease: "easeOut" }}
							className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/90 pb-3 max-w-7xl mx-auto w-full"
						>
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center gap-2.5 flex-wrap">
									<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-zinc-950/90 px-3 py-1 shadow-lg backdrop-blur-md">
										<Flag countryCode={circuit.countryCode} className="h-3.5 w-5 rounded object-cover" />
										<span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-400">
											CIRCUITO OFICIAL FIA
										</span>
									</div>

									<span className="font-mono text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-zinc-800">
										<Crosshair className="w-3.5 h-3.5 text-red-500 animate-spin" style={{ animationDuration: "12s" }} />
										<span>{circuit.gpsCoordinates}</span>
									</span>
								</div>

								<h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-tighter uppercase text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-tight mt-1">
									{circuit.name}
								</h1>

								<p className="font-mono text-xs sm:text-sm font-bold text-zinc-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-2 flex-wrap">
									<span className="text-amber-400 font-black">{circuit.gpName}</span>
									<span className="text-zinc-500">·</span>
									<span className="text-zinc-200">{circuit.country}</span>
									<span className="text-zinc-500">·</span>
									<span className="text-zinc-300 font-mono text-xs">Debut F1: {circuit.firstGp}</span>
								</p>
							</div>

							<div className="hidden lg:flex flex-col items-end text-right font-mono shrink-0">
								<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[11px] text-emerald-400 font-bold uppercase tracking-wider shadow-lg">
									<span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
									TELEMETRÍA BLACKBOX ACTIVA
								</div>
								<span className="text-[10px] text-zinc-400 font-mono mt-1 font-semibold">Cuerda Oficial FIA: {circuit.length}</span>
							</div>
						</motion.div>

						{/* 🎯 CENTRO: 3 COLUMNAS DE CRISTAL AHUMADO DE ALTO CONTRASTE */}
						<div className="max-w-7xl mx-auto w-full my-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
							{/* COLUMNA 1: FICHA TÉCNICA Y GEOMETRÍA */}
							<motion.div
								initial={{ opacity: 0, x: -25 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
								className="lg:col-span-3 flex flex-col justify-between gap-3 bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl"
							>
								<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
									<Milestone className="w-4 h-4 text-amber-400 shrink-0" />
									<h2 className="text-xs font-mono font-black tracking-widest text-amber-400 uppercase">
										Ficha Técnica
									</h2>
								</div>

								<div className="flex flex-col divide-y divide-zinc-800/70 font-mono text-xs">
									{/* Diseñador */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
											Diseñador
										</span>
										<span className="text-sm font-black text-white drop-shadow">
											{circuit.designer}
										</span>
									</div>

									{/* Longitud de Vuelta */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
											Longitud del Trazado
										</span>
										<div className="flex items-baseline gap-1.5">
											<span className="text-lg font-black text-amber-300">
												{circuit.length}
											</span>
											<span className="text-[11px] text-zinc-300 font-bold">por vuelta</span>
										</div>
									</div>

									{/* Vueltas y Distancia Total */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
											Distancia de Carrera
										</span>
										<span className="text-sm font-black text-white">
											{circuit.raceLaps} vueltas · {circuit.raceDistance}
										</span>
									</div>

									{/* Desnivel / Elevación */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
											Desnivel de Pista
										</span>
										<span className="text-sm font-black text-zinc-100 flex items-center gap-1.5">
											<MoveVertical className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
											{circuit.elevation}
										</span>
									</div>

									{/* Récord Oficial de Vuelta */}
									<div className="pt-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
											<Timer className="w-3.5 h-3.5 text-purple-400" />
											Récord de Vuelta Oficial
										</span>
										<span className="text-sm sm:text-base font-black text-purple-200 drop-shadow">
											{circuit.lapRecord}
										</span>
									</div>
								</div>
							</motion.div>

							{/* COLUMNA 2 (CENTRAL): PLANIMETRÍA 2D CON LÍNEA DE META Y BRÚJULA */}
							<motion.div
								initial={{ opacity: 0, scale: 0.94 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
								className="lg:col-span-6 flex flex-col justify-between items-center relative p-4 sm:p-6 rounded-2xl bg-zinc-950/85 border border-zinc-800/90 backdrop-blur-xl shadow-2xl overflow-hidden"
							>
								{/* Grilla técnica de fondo */}
								<div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none rounded-2xl" />

								{/* Barra superior del mapa: Brújula y Sentido de Giro */}
								<div className="w-full flex items-center justify-between border-b border-zinc-800/80 pb-2.5 z-10 font-mono">
									<div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
										<Compass className="w-4 h-4 text-amber-400" />
										<span>Sentido: {circuit.direction}</span>
									</div>
									<div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-200 font-bold uppercase tracking-wider">
										<span className="text-red-400 font-black">N</span>
										<span>NORTE ↑</span>
									</div>
								</div>

								{/* SVG VECTORIAL DEL TRAZADO CON LÍNEA DE META 🏁 */}
								<div className="relative w-full my-2 flex items-center justify-center z-10">
									<svg
										viewBox="0 0 400 300"
										className="w-full h-56 sm:h-72 drop-shadow-[0_0_24px_rgba(245,158,11,0.25)]"
									>
										<defs>
											{/* Halo Neón Dorado */}
											<filter id="track-neon" x="-30%" y="-30%" width="160%" height="160%">
												<feGaussianBlur stdDeviation="5" result="blur" />
												<feMerge>
													<feMergeNode in="blur" />
													<feMergeNode in="SourceGraphic" />
												</feMerge>
											</filter>
										</defs>

										{/* Sombra base del asfalto */}
										<path
											d={circuit.svgPath}
											fill="none"
											stroke="#09090b"
											strokeWidth="16"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d={circuit.svgPath}
											fill="none"
											stroke="#27272a"
											strokeWidth="9"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>

										{/* Trazado neón animado al entrar */}
										<motion.path
											d={circuit.svgPath}
											fill="none"
											stroke="#f59e0b"
											strokeWidth="4"
											strokeLinecap="round"
											strokeLinejoin="round"
											filter="url(#track-neon)"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 1.3, ease: "easeInOut" }}
										/>

										{/* 🏁 LÍNEA DE META OFICIAL FIA (START / FINISH LINE) */}
										{finishLine && (
											<g>
												{/* Halo de pulso en la meta */}
												<circle
													cx={finishLine.x0}
													cy={finishLine.y0}
													r="10"
													fill="#f59e0b"
													opacity="0.3"
													className="animate-ping"
												/>

												{/* Barra transversal de meta */}
												<line
													x1={finishLine.x1}
													y1={finishLine.y1}
													x2={finishLine.x2}
													y2={finishLine.y2}
													stroke="#ffffff"
													strokeWidth="5"
													strokeLinecap="butt"
												/>
												<line
													x1={finishLine.x1}
													y1={finishLine.y1}
													x2={finishLine.x2}
													y2={finishLine.y2}
													stroke="#000000"
													strokeWidth="4"
													strokeDasharray="2.5 2.5"
													strokeLinecap="butt"
												/>

												{/* Indicador de Largada/Meta */}
												<circle
													cx={finishLine.x0}
													cy={finishLine.y0}
													r="3.5"
													fill="#ef4444"
													stroke="#ffffff"
													strokeWidth="1.5"
												/>

												{/* Etiqueta flotante 🏁 META */}
												<g
													transform={`translate(${finishLine.x0 + (finishLine.x0 > 200 ? -48 : 12)}, ${
														finishLine.y0 + (finishLine.y0 > 150 ? -16 : 18)
													})`}
												>
													<rect
														x="0"
														y="0"
														width="42"
														height="16"
														rx="3"
														fill="#09090b"
														stroke="#f59e0b"
														strokeWidth="1"
														opacity="0.95"
													/>
													<text
														x="21"
														y="11.5"
														textAnchor="middle"
														fontSize="9"
														fontWeight="bold"
														fill="#ffffff"
														fontFamily="monospace"
													>
														🏁 META
													</text>
												</g>
											</g>
										)}
									</svg>
								</div>

								{/* Mini-ticker inferior: Recta más larga, Curvas y Planimetría */}
								<div className="w-full pt-2.5 border-t border-zinc-800/80 z-10 grid grid-cols-2 gap-2 text-center font-mono">
									<div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
										<span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider block">
											Recta Más Larga
										</span>
										<span className="text-xs sm:text-sm font-black text-amber-400 mt-0.5 block">
											{circuit.longestStraight}
										</span>
									</div>
									<div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
										<span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider block">
											Configuración
										</span>
										<span className="text-xs sm:text-sm font-black text-white mt-0.5 block truncate">
											{circuit.turns}
										</span>
									</div>
								</div>
							</motion.div>

							{/* COLUMNA 3: RENDIMIENTO, DINÁMICA DE COCHE Y TELEMETRÍA */}
							<motion.div
								initial={{ opacity: 0, x: 25 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
								className="lg:col-span-3 flex flex-col justify-between gap-3 bg-zinc-950/85 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl"
							>
								<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
									<Activity className="w-4 h-4 text-cyan-400 shrink-0" />
									<h2 className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
										Telemetría & Setup
									</h2>
								</div>

								<div className="flex flex-col divide-y divide-zinc-800/70 font-mono text-xs">
									{/* Speed Trap / Velocidad Punta */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
											<span>Speed Trap (Punta)</span>
											<Gauge className="w-3.5 h-3.5 text-cyan-400" />
										</span>
										<span className="text-base sm:text-lg font-black text-cyan-300 drop-shadow">
											{circuit.topSpeed}
										</span>
									</div>

									{/* Zonas DRS */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
											<span>Zonas DRS Habilitadas</span>
											<Zap className="w-3.5 h-3.5 text-emerald-400" />
										</span>
										<span className="text-sm font-black text-emerald-400">
											{circuit.drsZones} Zonas DRS oficiales
										</span>
									</div>

									{/* Máxima Fuerza G Lateral */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
											<span>Fuerza G Lateral Máx.</span>
											<Flame className="w-3.5 h-3.5 text-orange-400" />
										</span>
										<span className="text-sm font-black text-orange-300">
											{circuit.maxGForce}
										</span>
									</div>

									{/* Exigencia en Frenos */}
									<div className="py-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
											<span>Carga de Frenos</span>
											<ShieldAlert className="w-3.5 h-3.5 text-red-400" />
										</span>
										<span className="text-xs sm:text-sm font-black text-zinc-100">
											{circuit.brakeLoad}
										</span>
									</div>

									{/* Acelerador a Fondo y Cambios */}
									<div className="pt-2.5 flex flex-col gap-0.5">
										<span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
											<span>Gas a Fondo & Cambios</span>
											<Cog className="w-3.5 h-3.5 text-zinc-400" />
										</span>
										<span className="text-xs sm:text-sm font-black text-white">
											{circuit.fullThrottle} vuelta · {circuit.gearChanges}
										</span>
										<span className="text-[10px] text-amber-400/90 font-bold mt-0.5">
											Carga {circuit.downforce} · {circuit.tireDegradation}
										</span>
									</div>
								</div>
							</motion.div>
						</div>

						{/* 🔄 PIE DE PÁGINA: PROMPT DE RETORNO AL PIT-WALL */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
							className="flex justify-center w-full max-w-7xl mx-auto pt-2"
						>
							<div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/50 bg-zinc-950/90 px-5 py-2 font-mono text-xs font-bold text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl animate-pulse">
								<RotateCcw className="w-4 h-4 text-amber-400" />
								<span>Toca en cualquier parte (o pulsa Escape) para volver a los resultados</span>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}