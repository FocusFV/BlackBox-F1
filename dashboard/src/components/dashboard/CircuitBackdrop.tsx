"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCircuitDetails, type CircuitDetails, DEFAULT_CIRCUIT } from "@/lib/circuitBackdrops";
import { useEffect, useState, useCallback } from "react";
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

	const handleContainerClick = useCallback(
		(e: React.MouseEvent) => {
			if (onToggleCinematic) {
				onToggleCinematic();
			}
		},
		[onToggleCinematic]
	);

	if (oledMode) {
		return null;
	}

	return (
		<div
			onClick={handleContainerClick}
			className={`fixed inset-0 select-none transition-all duration-700 overflow-hidden ${
				isCinematic
					? "z-40 pointer-events-auto cursor-pointer bg-black/60 backdrop-blur-md"
					: "z-0 pointer-events-auto cursor-pointer"
			}`}
			title={isCinematic ? "Toca en cualquier parte para volver al Pit-Wall" : "Toca el fondo para ver el circuito completo"}
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
				className={`w-full h-full object-cover object-center filter contrast-[1.08] transition-all duration-700 ${
					isCinematic
						? "opacity-90 scale-105 brightness-[1.05]"
						: loaded
						? "opacity-65 scale-100 brightness-[1.0]"
						: "opacity-50 scale-100 brightness-[0.9]"
				}`}
			/>

			{/* Viñetas cinematográficas suaves */}
			<div
				className={`absolute inset-0 transition-opacity duration-700 ${
					isCinematic
						? "bg-gradient-to-t from-black/95 via-black/50 to-black/35"
						: "bg-gradient-to-t from-black/80 via-black/35 to-black/15"
				}`}
			/>
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

			{/* 🎮 EASTER EGG: HUD DE TELEMETRÍA CINEMÁTICA CON MAPA 2D (SIN TARJETAS, DISEÑO COCKPIT) */}
			<AnimatePresence>
				{isCinematic && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.35 }}
						className="absolute inset-0 flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-y-auto no-scrollbar pointer-events-none"
					>
						{/* ENCABEZADO SUPERIOR: TELEMETRÍA Y COORDENADAS */}
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45, ease: "easeOut" }}
							className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 max-w-7xl mx-auto w-full"
						>
							<div className="flex flex-col gap-1.5">
								<div className="flex items-center gap-2.5 flex-wrap">
									<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-zinc-950/90 px-3 py-1 shadow-lg backdrop-blur-md">
										<Flag countryCode={circuit.countryCode} className="h-3.5 w-5 rounded object-cover" />
										<span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-400">
											CIRCUITO OFICIAL FIA
										</span>
									</div>

									<span className="font-mono text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
										<Crosshair className="w-3.5 h-3.5 text-red-500 animate-spin" style={{ animationDuration: "12s" }} />
										<span>{circuit.gpsCoordinates}</span>
									</span>
								</div>

								<h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-mono tracking-tighter uppercase text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-none mt-1">
									{circuit.name}
								</h1>

								<p className="font-mono text-xs sm:text-sm font-bold text-zinc-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-2">
									<span className="text-amber-400 font-black">{circuit.gpName}</span>
									<span className="text-zinc-500">·</span>
									<span className="text-zinc-400">{circuit.country}</span>
									<span className="text-zinc-500">·</span>
									<span className="text-zinc-500 font-mono text-xs">Debut en F1: {circuit.firstGp}</span>
								</p>
							</div>

							<div className="hidden lg:flex flex-col items-end text-right font-mono">
								<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
									<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
									ENLACE SATELITAL ACTIVO
								</div>
								<span className="text-[10px] text-zinc-500 font-mono mt-1">SISTEMA BLACKBOX F1 TELEMETRY</span>
							</div>
						</motion.div>

						{/* CENTRO: MAPITA 2D VECTORIAL + TELEMETRÍA DETALLADA (SIN TARJETAS) */}
						<div className="max-w-7xl mx-auto w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
							{/* MAPITA 2D VECTORIAL CON TRAZADO ILUMINADO */}
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
								className="lg:col-span-5 flex flex-col items-center justify-center relative p-6 rounded-3xl bg-black/40 border border-zinc-800/60 backdrop-blur-md shadow-2xl"
							>
								{/* Grilla HUD de fondo */}
								<div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-3xl" />

								{/* Badge de orientación */}
								<div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
									<Compass className="w-3.5 h-3.5 text-amber-400" />
									<span>Sentido: {circuit.direction}</span>
								</div>

								{/* SVG del trazado 2D con animación de dibujo en la entrada */}
								<svg viewBox="0 0 400 300" className="w-full h-56 sm:h-72 drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]">
									<defs>
										<filter id="track-neon" x="-20%" y="-20%" width="140%" height="140%">
											<feGaussianBlur stdDeviation="4" result="blur" />
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
										stroke="#18181b"
										strokeWidth="14"
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

									{/* Trazado neón animado */}
									<motion.path
										d={circuit.svgPath}
										fill="none"
										stroke="#f59e0b"
										strokeWidth="3.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										filter="url(#track-neon)"
										initial={{ pathLength: 0 }}
										animate={{ pathLength: 1 }}
										transition={{ duration: 1.4, ease: "easeInOut" }}
									/>
								</svg>

								<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-2">
									Planimetría Vectorial Oficial 2D
								</span>
							</motion.div>

							{/* PANEL DE DATOS TÉCNICOS INTEGRADO (SIN TARJETAS, LÍNEAS LIMPIAS) */}
							<motion.div
								initial={{ opacity: 0, x: 25 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
								className="lg:col-span-7 flex flex-col justify-center divide-y divide-zinc-800/80 text-white font-mono"
							>
								{/* FILA 1: LONGITUD, VUELTAS Y DISTANCIA TOTAL */}
								<div className="py-3 flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Gauge className="w-4 h-4 text-amber-400 shrink-0" />
										<span className="text-xs text-zinc-400 uppercase tracking-wider">Cuerda & Carrera</span>
									</div>
									<div className="text-right">
										<span className="text-sm sm:text-base font-black text-white">{circuit.length}</span>
										<span className="text-xs text-zinc-400 ml-2">({circuit.raceLaps} vueltas · {circuit.raceDistance})</span>
									</div>
								</div>

								{/* FILA 2: CURVAS Y CONFIGURACIÓN */}
								<div className="py-3 flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<MapPin className="w-4 h-4 text-red-400 shrink-0" />
										<span className="text-xs text-zinc-400 uppercase tracking-wider">Configuración de Curvas</span>
									</div>
									<div className="text-right">
										<span className="text-sm sm:text-base font-black text-white">{circuit.turns}</span>
									</div>
								</div>

								{/* FILA 3: ZONAS DRS */}
								<div className="py-3 flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Zap className="w-4 h-4 text-emerald-400 shrink-0" />
										<span className="text-xs text-zinc-400 uppercase tracking-wider">Zonas de DRS</span>
									</div>
									<div className="text-right">
										<span className="text-sm sm:text-base font-black text-emerald-400">{circuit.drsZones} Zonas habilitadas</span>
									</div>
								</div>

								{/* FILA 4: SPEED TRAP (VELOCIDAD PUNTA) */}
								<div className="py-3 flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Activity className="w-4 h-4 text-cyan-400 shrink-0" />
										<span className="text-xs text-zinc-400 uppercase tracking-wider">Velocidad Punta (Speed Trap)</span>
									</div>
									<div className="text-right">
										<span className="text-sm sm:text-base font-black text-cyan-300">{circuit.topSpeed}</span>
									</div>
								</div>

								{/* FILA 5: ACELERADOR A FONDO Y CAMBIOS */}
								<div className="py-3 flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Flame className="w-4 h-4 text-orange-400 shrink-0" />
										<span className="text-xs text-zinc-400 uppercase tracking-wider">Acelerador a Fondo</span>
									</div>
									<div className="text-right">
										<span className="text-sm sm:text-base font-black text-white">{circuit.fullThrottle} de la vuelta</span>
										<span className="text-xs text-zinc-400 ml-2">({circuit.gearChanges})</span>
									</div>
								</div>

								{/* FILA 6: CARGA AERODINÁMICA Y NEUMÁTICOS */}
								<div className="py-3 flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Cog className="w-4 h-4 text-zinc-400 shrink-0" />
										<span className="text-xs text-zinc-400 uppercase tracking-wider">Downforce & Abrasión</span>
									</div>
									<div className="text-right">
										<span className="text-xs sm:text-sm font-bold text-zinc-200">Carga {circuit.downforce}</span>
										<span className="text-xs text-amber-400/90 ml-2">· {circuit.tireDegradation}</span>
									</div>
								</div>

								{/* FILA 7: RÉCORD DE VUELTA OFICIAL */}
								<div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80">
									<div className="flex items-center gap-2">
										<Timer className="w-4 h-4 text-purple-400 shrink-0" />
										<span className="text-xs text-purple-400 uppercase tracking-wider font-bold">Récord de Vuelta Oficial</span>
									</div>
									<div className="text-right">
										<span className="text-sm sm:text-base font-black text-purple-300">{circuit.lapRecord}</span>
									</div>
								</div>
							</motion.div>
						</div>

						{/* PIE DE PÁGINA: PROMPT DE RETORNO AL PIT-WALL */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
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
