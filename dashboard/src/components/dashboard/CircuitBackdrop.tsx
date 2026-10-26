"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCircuitDetails, type CircuitDetails, DEFAULT_CIRCUIT } from "@/lib/circuitBackdrops";
import { useEffect, useState, useCallback, useMemo } from "react";
import Flag from "@/components/Flag";
import { motion, AnimatePresence } from "motion/react";
import {
	Timer,
	Gauge,
	RotateCcw,
	Flame,
	Crosshair,
	Activity,
	Eye,
	EyeOff,
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

// Helper para parsear la información del poseedor del récord y su foto con el mono de la época
function getRecordDriverInfo(lapRecord: string): {
	driverName: string;
	team: string;
	year: string;
	time: string;
	photoUrl: string;
} {
	// Parseamos el string ej: "1:36.169 · C. Leclerc (Ferrari, 2019)"
	const match = lapRecord.match(/^([\d:.]+)\s*·\s*([^()]+)\s*(?:\(([^,]+),\s*(\d{4})\))?/);
	const time = match ? match[1].trim() : lapRecord;
	const driverName = match ? match[2].trim() : "FIA";
	const team = match && match[3] ? match[3].trim() : "";
	const year = match && match[4] ? match[4].trim() : "";

	let photoUrl = "/drivers/records/leclerc.jpg";
	const lower = (driverName + " " + lapRecord).toLowerCase();

	if (lower.includes("schumacher")) {
		photoUrl = "/drivers/records/schumacher.jpg";
	} else if (lower.includes("de la rosa") || lower.includes("rosa")) {
		photoUrl = "/drivers/records/delarosa.jpg";
	} else if (lower.includes("barrichello")) {
		photoUrl = "/drivers/records/barrichello.jpg";
	} else if (lower.includes("hamilton")) {
		photoUrl = "/drivers/records/hamilton.jpg";
	} else if (lower.includes("bottas")) {
		photoUrl = "/drivers/records/bottas.jpg";
	} else if (lower.includes("leclerc")) {
		photoUrl = "/drivers/records/leclerc.jpg";
	} else if (lower.includes("verstappen")) {
		photoUrl = "/drivers/records/verstappen.jpg";
	} else if (lower.includes("sainz")) {
		photoUrl = "/drivers/records/sainz.jpg";
	} else if (lower.includes("ricciardo")) {
		photoUrl = "/drivers/records/ricciardo.jpg";
	} else if (lower.includes("norris")) {
		photoUrl = "/drivers/records/norris.jpg";
	} else if (lower.includes("alonso")) {
		photoUrl = "/alonso.png";
	}

	return { driverName, team, year, time, photoUrl };
}

// Helper para calcular la posición de la Línea de Meta y la Flecha de Sentido de Giro
function getStartFinishCoords(svgPath: string): {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	arrowX: number;
	arrowY: number;
	arrowAngleDeg: number;
} | null {
	if (!svgPath) return null;
	const match = svgPath.match(/M\s*([\d.-]+)[,\s]+([\d.-]+)(?:[^\d.-]+([\d.-]+)[,\s]+([\d.-]+))?/);
	if (!match) return null;
	const x0 = parseFloat(match[1]);
	const y0 = parseFloat(match[2]);
	const nextX = match[3] ? parseFloat(match[3]) : x0 + 10;
	const nextY = match[4] ? parseFloat(match[4]) : y0;

	const dx = nextX - x0;
	const dy = nextY - y0;
	const len = Math.hypot(dx, dy) || 1;

	// Vector tangente (dirección de marcha de los monoplazas al largar)
	const tx = dx / len;
	const ty = dy / len;

	// Vector normal perpendicular para la línea de meta
	const nx = -ty;
	const ny = tx;
	const halfWidth = 14;

	// Flecha de sentido posicionada 18px delante de la meta siguiendo el trazado
	const arrowDist = 18;
	const arrowX = x0 + tx * arrowDist;
	const arrowY = y0 + ty * arrowDist;
	const arrowAngleDeg = (Math.atan2(ty, tx) * 180) / Math.PI;

	return {
		x0,
		y0,
		x1: x0 - nx * halfWidth,
		y1: y0 - ny * halfWidth,
		x2: x0 + nx * halfWidth,
		y2: y0 + ny * halfWidth,
		arrowX,
		arrowY,
		arrowAngleDeg,
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
	const [showHud, setShowHud] = useState(true);

	// Reproducir sonido al entrar al modo cinemático (Easter Egg)
	useEffect(() => {
		if (isCinematic) {
			playHudChime();
			setShowHud(true);
		}
	}, [isCinematic]);

	useEffect(() => {
		const details = getCircuitDetails(gpName, country, circuitId);
		if (details.key !== "default") {
			setCircuit(details);
			setImageUrl(details.imageUrl);
			return;
		}

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

	const handleContainerClick = useCallback(
		(e: React.MouseEvent) => {
			// Si hace clic en un botón interactivo dentro del HUD, no cerramos
			if ((e.target as HTMLElement).closest("button")) {
				return;
			}
			if (onToggleCinematic) {
				onToggleCinematic();
			}
		},
		[onToggleCinematic]
	);

	// Coordenadas calculadas para la Línea de Meta 🏁 y Flecha de Sentido
	const finishLine = useMemo(() => {
		return getStartFinishCoords(circuit.svgPath);
	}, [circuit.svgPath]);

	// Información del récord y avatar del piloto
	const recordInfo = useMemo(() => {
		return getRecordDriverInfo(circuit.lapRecord);
	}, [circuit.lapRecord]);

	if (oledMode) {
		return null;
	}

	return (
		<div
			onClick={handleContainerClick}
			className={`fixed inset-0 select-none transition-all duration-700 overflow-hidden ${
				isCinematic
					? "z-40 pointer-events-auto cursor-pointer"
					: "z-0 pointer-events-auto cursor-pointer"
			}`}
		>
			{/* 🏎️ FOTO AÉREA CINEMATOGRÁFICA DEL CIRCUITO (MÁXIMA VISIBILIDAD Y NITIDEZ) */}
			<img
				key={imageUrl}
				src={imageUrl}
				alt={circuit.name}
				onLoad={() => setLoaded(true)}
				onError={() => {
					setImageUrl("/circuits/default.webp");
					setLoaded(true);
				}}
				className={`w-full h-full object-cover object-center filter contrast-[1.08] transition-all duration-700 ${
					isCinematic
						? "opacity-100 scale-100 brightness-[1.04]"
						: loaded
						? "opacity-65 scale-100 brightness-[0.98]"
						: "opacity-50 scale-100 brightness-[0.9]"
				}`}
			/>

			{/* Viñetas ultra sutiles para legibilidad sin tapar la pista */}
			<div
				className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
					isCinematic
						? "bg-gradient-to-t from-black/90 via-transparent to-black/60"
						: "bg-gradient-to-t from-black/80 via-black/35 to-black/15"
				}`}
			/>

			{/* 🎮 EASTER EGG: MODO CIRCUITO Y TELEMETRÍA LIMPIA */}
			<AnimatePresence>
				{isCinematic && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.35 }}
						className="absolute inset-0 flex flex-col justify-between pt-18 sm:pt-20 pb-4 px-4 sm:px-8 overflow-y-auto no-scrollbar pointer-events-none"
					>
						{/* 🏁 BARRA SUPERIOR: ENCABEZADO Y CONTROLES */}
						<motion.div
							initial={{ opacity: 0, y: -15 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full z-10 pointer-events-auto shrink-0"
						>
							<div className="flex flex-col gap-1 drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)]">
								<div className="flex items-center gap-2 flex-wrap">
									<div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-black/65 px-3 py-0.8 backdrop-blur-md">
										<Flag countryCode={circuit.countryCode} className="h-3.5 w-5 rounded object-cover" />
										<span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400">
											{circuit.country}
										</span>
									</div>

									<span className="font-mono text-[11px] font-bold text-zinc-300 flex items-center gap-1 bg-black/65 px-2.5 py-0.5 rounded-full border border-zinc-800/80 backdrop-blur-md">
										<Crosshair className="w-3.5 h-3.5 text-red-500" />
										<span>{circuit.gpsCoordinates}</span>
									</span>

									{/* Botón para alternar telemetría o ver solo la foto limpia */}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setShowHud((prev) => !prev);
										}}
										className="inline-flex items-center gap-1.5 px-3 py-0.8 rounded-full bg-zinc-900/85 border border-zinc-700/80 hover:border-amber-400/80 text-[10px] text-zinc-200 font-mono font-bold uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer shadow-lg"
									>
										{showHud ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
										<span>{showHud ? "Solo Foto Limpia" : "Ver Datos"}</span>
									</button>
								</div>

								<h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight uppercase text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-tight mt-0.5">
									{circuit.name}
								</h1>

								<p className="font-mono text-xs sm:text-sm font-bold text-zinc-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-2 flex-wrap">
									<span className="text-amber-400 font-black">{circuit.gpName}</span>
									<span className="text-zinc-500">·</span>
									<span className="text-zinc-300">Debut F1: {circuit.firstGp}</span>
									<span className="text-zinc-500">·</span>
									<span className="text-zinc-300">Diseñado por {circuit.designer}</span>
								</p>
							</div>
						</motion.div>

						{/* 🗺️ CENTRO: MAPA 2D GRANDE ANIMADO (PROTAGONISTA Y PANORÁMICO) */}
						<div className="flex-1 my-auto py-3 max-w-7xl mx-auto w-full flex items-center justify-center lg:justify-end z-10 pointer-events-auto">
							<AnimatePresence>
								{showHud && (
									<motion.div
										initial={{ opacity: 0, scale: 0.92 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.92 }}
										transition={{ duration: 0.45 }}
										className="relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-black/45 border border-white/15 backdrop-blur-md shadow-2xl w-full max-w-lg lg:max-w-xl"
									>
										{/* Indicador de sentido de giro en la cabecera del mapa */}
										<div className="w-full flex items-center justify-between border-b border-white/10 pb-2 mb-2 font-mono text-xs">
											<div className="flex items-center gap-1.5 text-amber-400 font-black uppercase tracking-wider">
												<span>Sentido de Giro: {circuit.direction}</span>
											</div>
											<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
												Planimetría 2D Oficial
											</span>
										</div>

										{/* Trazado Vectorial Animado (pathLength de 0 a 1) */}
										<svg
											viewBox="0 0 400 300"
											className="w-full h-56 sm:h-72 drop-shadow-[0_0_24px_rgba(245,158,11,0.35)]"
										>
											<defs>
												<filter id="track-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
													<feGaussianBlur stdDeviation="4" result="blur" />
													<feMerge>
														<feMergeNode in="blur" />
														<feMergeNode in="SourceGraphic" />
													</feMerge>
												</filter>
											</defs>

											{/* Base asfáltica */}
											<path
												d={circuit.svgPath}
												fill="none"
												stroke="#09090b"
												strokeWidth="15"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d={circuit.svgPath}
												fill="none"
												stroke="#27272a"
												strokeWidth="8"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>

											{/* Trazado animado que recorre todo el circuito en la entrada */}
											<motion.path
												d={circuit.svgPath}
												fill="none"
												stroke="#f59e0b"
												strokeWidth="4"
												strokeLinecap="round"
												strokeLinejoin="round"
												filter="url(#track-neon-glow)"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ duration: 1.4, ease: "easeInOut" }}
											/>

											{/* 🏁 LÍNEA DE META OFICIAL Y FLECHA DE SENTIDO DE MARCHA */}
											{finishLine && (
												<g>
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

													{/* Punto de largada */}
													<circle
														cx={finishLine.x0}
														cy={finishLine.y0}
														r="3.5"
														fill="#ef4444"
														stroke="#ffffff"
														strokeWidth="1.2"
													/>

													{/* ➔ Flecha de sentido en BLANCO BRILLANTE de alto contraste */}
													<g
														transform={`translate(${finishLine.arrowX}, ${finishLine.arrowY}) rotate(${finishLine.arrowAngleDeg})`}
													>
														<polygon
															points="-7,-6 9,0 -7,6 -4,0"
															fill="#ffffff"
															stroke="#000000"
															strokeWidth="1.2"
														/>
													</g>

													{/* Badge 🏁 META */}
													<g
														transform={`translate(${finishLine.x0 + (finishLine.x0 > 200 ? -48 : 12)}, ${
															finishLine.y0 + (finishLine.y0 > 150 ? -16 : 14)
														})`}
													>
														<rect
															x="0"
															y="0"
															width="44"
															height="16"
															rx="3"
															fill="#000000"
															stroke="#f59e0b"
															strokeWidth="1"
															opacity="0.9"
														/>
														<text
															x="22"
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
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* 📊 BARRA INFERIOR DE TELEMETRÍA (4 BLOQUES AMPLIOS CON CARITA DEL PILOTO RÉCORD) */}
						<AnimatePresence>
							{showHud && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 20 }}
									transition={{ duration: 0.4 }}
									className="w-full max-w-7xl mx-auto z-10 pointer-events-auto mb-2"
								>
									<div className="bg-black/55 backdrop-blur-xl border border-white/15 rounded-2xl p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left font-mono">
										{/* 1. RÉCORD OFICIAL CON LA CARITA DEL PILOTO Y SU MONO DE LA ÉPOCA */}
										<div className="flex items-center gap-3 bg-purple-950/40 p-2.5 sm:p-3 rounded-xl border border-purple-500/40 shadow-inner">
											<div className="relative shrink-0">
												<img
													src={recordInfo.photoUrl}
													alt={recordInfo.driverName}
													className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover object-top border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)] bg-zinc-900"
												/>
												{recordInfo.year && (
													<span className="absolute -bottom-1 -right-1 text-[9px] bg-purple-950 border border-purple-400 text-purple-200 px-1 py-0.2 rounded-full font-bold">
														{recordInfo.year}
													</span>
												)}
											</div>

											<div className="flex flex-col min-w-0">
												<span className="text-[10px] sm:text-xs text-purple-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
													<Timer className="w-3.5 h-3.5 text-purple-400 shrink-0" />
													Récord Oficial
												</span>
												<span className="text-sm sm:text-base md:text-lg font-black text-purple-200 truncate">
													{recordInfo.time}
												</span>
												<span className="text-[10px] sm:text-[11px] text-zinc-300 font-semibold truncate">
													{recordInfo.driverName} {recordInfo.team ? `· ${recordInfo.team}` : ""}
												</span>
											</div>
										</div>

										{/* 2. VELOCIDAD PUNTA (SPEED TRAP) */}
										<div className="flex flex-col justify-center gap-1 bg-zinc-900/60 p-3 sm:p-3.5 rounded-xl border border-white/10">
											<span className="text-[10px] sm:text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
												<Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
												Speed Trap
											</span>
											<span className="text-sm sm:text-base md:text-lg font-black text-cyan-300">
												{circuit.topSpeed}
											</span>
											<span className="text-[10px] text-zinc-400 font-medium">Velocidad Punta Máxima</span>
										</div>

										{/* 3. GEOMETRÍA Y RECTA */}
										<div className="flex flex-col justify-center gap-1 bg-zinc-900/60 p-3 sm:p-3.5 rounded-xl border border-white/10">
											<span className="text-[10px] sm:text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
												<Gauge className="w-3.5 h-3.5 text-amber-400 shrink-0" />
												Trazado & Recta
											</span>
											<span className="text-sm sm:text-base md:text-lg font-black text-amber-300">
												{circuit.length}
											</span>
											<span className="text-[10px] text-zinc-300 font-medium">
												{circuit.turns} · Recta {circuit.longestStraight}
											</span>
										</div>

										{/* 4. EXIGENCIA Y DINÁMICA */}
										<div className="flex flex-col justify-center gap-1 bg-zinc-900/60 p-3 sm:p-3.5 rounded-xl border border-white/10">
											<span className="text-[10px] sm:text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
												<Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
												Fuerza G Lateral
											</span>
											<span className="text-sm sm:text-base md:text-lg font-black text-orange-300">
												{circuit.maxGForce}
											</span>
											<span className="text-[10px] text-zinc-300 font-medium">
												Gas a Fondo: {circuit.fullThrottle}
											</span>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* PIE DE PÁGINA: RETORNO DISCRETO */}
						<div className="flex justify-center w-full max-w-7xl mx-auto z-10 pointer-events-auto">
							<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/65 px-4 py-1.5 font-mono text-[11px] font-bold text-amber-300 shadow-lg backdrop-blur-md">
								<RotateCcw className="w-3.5 h-3.5 text-amber-400" />
								<span>Toca en cualquier parte (o Escape) para volver a los resultados</span>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}