"use client";

import { useEffect, useState, useRef } from "react";
import LeaderBoard from "@/components/dashboard/LeaderBoard";
import RaceControl from "@/components/dashboard/RaceControl";
import TeamRadios from "@/components/dashboard/TeamRadios";
import TrackViolations from "@/components/dashboard/TrackViolations";
import Map from "@/components/dashboard/Map";
import Footer from "@/components/Footer";
import { ParcFerme } from "@/components/dashboard/ParcFerme";
import { useDataStore } from "@/stores/useDataStore";
import { YouTubeFeed } from "@/components/dashboard/YouTubeFeed";
import { TvSyncControl } from "@/components/dashboard/TvSyncControl";
import { RaceControlAlertBanner } from "@/components/dashboard/RaceControlAlertBanner";
import { TeamRadioAlertPopup } from "@/components/dashboard/TeamRadioAlertPopup";
import { HeadToHeadModal } from "@/components/dashboard/HeadToHeadModal";
import { CircuitBackdrop } from "@/components/dashboard/CircuitBackdrop";
import { Swords, Radio, Flag, AlertTriangle } from "lucide-react";
import { translateSessionName } from "@/lib/f1Translations";
import { triggerHaptic } from "@/lib/haptics";
import {
	getUpcomingSessions,
	evaluateSessionStatus,
	formatCountdown,
	type ScheduleSession,
	type SessionStatusResult,
} from "@/lib/sessionSchedule";

export default function Page() {
	const dataStore = useDataStore();

	const session = dataStore.state?.SessionInfo;
	const lapCount = dataStore.state?.LapCount;
	const sessionStatus = dataStore.state?.SessionStatus?.Status;
	const trackStatus = dataStore.state?.TrackStatus?.Status;

	// 📅 Detección de calendario inteligente
	const [sessions, setSessions] = useState<ScheduleSession[]>([]);
	const [scheduleStatus, setScheduleStatus] = useState<SessionStatusResult>({
		isLiveWindow: false,
		activeSessionName: null,
		nextSessionName: null,
		nextSessionStart: null,
	});
	const [countdownText, setCountdownText] = useState<string>("");

	// ⚔️ Modal Cara a Cara
	const [isH2HOpen, setIsH2HOpen] = useState(false);

	// 🛰️ Modo Cinemático de Circuito Aéreo (pantalla completa sin resultados)
	const [isCinematicTrackMode, setIsCinematicTrackMode] = useState(false);

	// 🎬 Transición cinemática de Parque Cerrado a Telemetría en Vivo
	const [isTransitioningToLive, setIsTransitioningToLive] = useState(false);
	const prevShowTelemetryRef = useRef<boolean | null>(null);

	useEffect(() => {
		let isMounted = true;
		getUpcomingSessions().then((data) => {
			if (isMounted && data.length > 0) {
				setSessions(data);
				// ⏱️ 5 minutos antes para telemetría en vivo
				const status = evaluateSessionStatus(data, 5 * 60 * 1000);
				setScheduleStatus(status);
				if (status.nextSessionStart) {
					setCountdownText(formatCountdown(status.nextSessionStart));
				}
			}
		});

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (sessions.length === 0) return;

		const timer = setInterval(() => {
			// ⏱️ 5 minutos antes para telemetría en vivo
			const status = evaluateSessionStatus(sessions, 5 * 60 * 1000);
			setScheduleStatus(status);
			if (status.nextSessionStart) {
				setCountdownText(formatCountdown(status.nextSessionStart));
			}
		}, 30000);

		return () => clearInterval(timer);
	}, [sessions]);

	// ⌨️ Salir de modo cinemático con tecla Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isCinematicTrackMode) {
				setIsCinematicTrackMode(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isCinematicTrackMode]);

	// 📡 Verificamos flujo de datos reales de telemetría
	const hasTimingData = Boolean(
		dataStore.state?.TimingData?.Lines && Object.keys(dataStore.state.TimingData.Lines).length > 0
	);
	const hasCarData = Boolean(
		dataStore.carsData && Object.keys(dataStore.carsData).length > 0
	);
	const hasPositionData = Boolean(
		dataStore.positions && Object.keys(dataStore.positions).length > 0
	);
	const hasLiveTelemetry = hasTimingData || hasCarData || hasPositionData;

	const isSessionFinished = Boolean(
		sessionStatus === "Ends" ||
		sessionStatus === "Finalised" ||
		sessionStatus === "Finished" ||
		(session as any)?.SessionStatus === "Finalised" ||
		(session as any)?.SessionStatus === "Ends" ||
		session?.ArchiveStatus?.Status === "Complete" ||
		(session?.Name === "Race" && !!lapCount && lapCount.CurrentLap >= lapCount.TotalLaps && lapCount.TotalLaps > 0)
	);

	// Guardamos el timestamp de fin de sesión para mantener la vista de resultados por 15 minutos
	const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);

	useEffect(() => {
		if (isSessionFinished && session?.Name) {
			const storageKey = `f1_session_end_${session?.Key || session?.Name}`;
			const stored = typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;
			if (stored) {
				setSessionEndTime(parseInt(stored, 10));
			} else {
				const now = Date.now();
				if (typeof window !== "undefined") sessionStorage.setItem(storageKey, String(now));
				setSessionEndTime(now);
			}
		} else if (!isSessionFinished) {
			setSessionEndTime(null);
		}
	}, [isSessionFinished, session?.Key, session?.Name]);

	// ¿Estamos en los 15 minutos posteriores al fin de la sesión? (15 min = 900,000 ms)
	const isPostSessionWindow = Boolean(
		isSessionFinished &&
		sessionEndTime &&
		Date.now() - sessionEndTime < 15 * 60 * 1000
	);

	// Telemetría con heartbeat activo en los últimos 3 minutos (descarta datos viejos cacheados)
	const isRecentHeartbeat = Boolean(
		dataStore.state?.Heartbeat?.Utc &&
		Math.abs(Date.now() - new Date(dataStore.state.Heartbeat.Utc).getTime()) < 3 * 60 * 1000
	);

	const isTrackActive = Boolean(
		trackStatus &&
		trackStatus !== "0" &&
		trackStatus !== "3" &&
		isRecentHeartbeat
	);

	const isSessionStarted = sessionStatus === "Started" || sessionStatus === "Running";

	// Sesión activa por calendario (ventana de ±15 minutos)
	const isCalendarLive = scheduleStatus.isLiveWindow;

	// Determinación de modo en vivo automática: Si la sesión terminó pero estamos en los 15 min de resultados, seguimos mostrando telemetría
	const isLiveAuto =
		(!isSessionFinished && (isCalendarLive || (isTrackActive && isSessionStarted))) ||
		isPostSessionWindow;

	// Vista activa (por defecto automático)
	const showTelemetry = isLiveAuto;

	// 🎬 Detectar cambio de Parque Cerrado a Telemetría en Vivo para lanzar la animación
	useEffect(() => {
		if (prevShowTelemetryRef.current === false && showTelemetry === true) {
			setIsTransitioningToLive(true);
			triggerHaptic("heavy");
			const timer = setTimeout(() => {
				setIsTransitioningToLive(false);
			}, 1100);
			return () => clearTimeout(timer);
		}
		prevShowTelemetryRef.current = showTelemetry;
	}, [showTelemetry]);

	return (
		<div className="flex w-full flex-col gap-4 px-4 py-4 text-zinc-100 relative">
			{/* 🎬 OVERLAY DE TRANSICIÓN CINEMÁTICA A TELEMETRÍA EN VIVO */}
			{isTransitioningToLive && (
				<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in font-mono select-none px-4">
					<div className="relative flex flex-col items-center max-w-md w-full text-center">
						<div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-emerald-950/80 to-zinc-950 border border-emerald-400/60 flex items-center justify-center mb-6 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
							<div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/80 animate-ping pointer-events-none" />
							<Radio className="w-10 h-10 animate-pulse text-emerald-300" />
						</div>

						<span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-2">
							<span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
							ENLACE PIT-WALL EN TIEMPO REAL
						</span>

						<h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2">
							SINCRONIZANDO TELEMETRÍA EN VIVO
						</h2>

						<p className="text-xs text-zinc-400 mb-6 font-sans">
							{translateSessionName(scheduleStatus.activeSessionName || session?.Name || "Sesión Oficial")} • {session?.Meeting?.Country?.Name || "FÓRMULA 1"}
						</p>

						<div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
							<div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full w-full animate-pulse" />
						</div>
					</div>
				</div>
			)}
			{showTelemetry && (
				<>
					{/* 🏎️ Barra de estado HUD en Vivo o Resultados Finales */}
					{isPostSessionWindow ? (
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-950 to-zinc-950 px-4 py-2.5 backdrop-blur-md">
							<div className="flex items-center gap-2.5">
								<span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs">
									🏁
								</span>
								<div className="flex flex-col">
									<span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
										SESIÓN FINALIZADA
									</span>
									<span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-mono">
										RESULTADOS FINALES DE {session?.Name ? translateSessionName(session.Name) : "SESIÓN"} {session?.Meeting?.Country?.Name || "MÉXICO"}
									</span>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={() => setIsH2HOpen(true)}
									className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-red-500/50 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
									title="Abrir comparador Cara a Cara entre dos pilotos"
								>
									<Swords className="h-3.5 w-3.5 text-red-500" />
									<span>Cara a Cara</span>
								</button>
							</div>
						</div>
					) : (
						<div className="relative z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 backdrop-blur-md">
							<div className="flex items-center gap-2">
								<span className="relative flex h-3 w-3">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
									<span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
								</span>
								<span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
									{translateSessionName(scheduleStatus.activeSessionName || session?.Name || "Telemetría en Vivo")}
								</span>
							</div>

							{/* Controles de la derecha: Cara a Cara y TV Sync */}
							<div className="flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={() => setIsH2HOpen(true)}
									className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-red-500/50 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
									title="Abrir comparador Cara a Cara entre dos pilotos"
								>
									<Swords className="h-3.5 w-3.5 text-red-500" />
									<span>Cara a Cara</span>
								</button>

								<TvSyncControl />
							</div>
						</div>
					)}

					{/* Alertas dinámicas de Dirección de Carrera (SC, VSC, Banderas, Sanciones) */}
					<RaceControlAlertBanner />

					{/* Popup flotante de Team Radios en vivo */}
					<TeamRadioAlertPopup />
				</>
			)}

			{/* Contenido principal */}
			{!showTelemetry ? (
				<div
					onClick={(e) => {
						if (e.target === e.currentTarget && !isCinematicTrackMode) {
							setIsCinematicTrackMode(true);
						}
					}}
					className="flex flex-col gap-6 w-full relative min-h-screen"
				>
					{/* 🏎️ Fondo inteligente del circuito aéreo y Easter Egg de telemetría */}
					<CircuitBackdrop
						gpName={scheduleStatus.nextSessionName || session?.Name}
						country={session?.Meeting?.Country?.Name}
						isCinematic={isCinematicTrackMode}
						onToggleCinematic={() => setIsCinematicTrackMode((prev) => !prev)}
					/>

					{/* Contenedor de resultados que se oculta suavemente en Modo Cinemático */}
					<div
						className={`flex flex-col gap-6 w-full relative z-10 transition-all duration-500 ${
							isCinematicTrackMode
								? "opacity-0 pointer-events-none scale-95 translate-y-6"
								: "opacity-100 scale-100"
						}`}
					>
						{/* Historial y resultados del último GP (con laterales táctiles restringidos solo a esta altura) */}
						<div className="relative w-full">
							<ParcFerme onOpenCircuit={() => setIsCinematicTrackMode(true)} />

							{/* 🏎️ Franjas laterales táctiles que terminan exactamente donde termina Parque Cerrado (no tocan YouTube) */}
							{!isCinematicTrackMode && (
								<>
									<div
										onClick={() => setIsCinematicTrackMode(true)}
										className="hidden lg:block absolute left-0 top-0 bottom-0 w-[18%] z-20 cursor-pointer"
										title="Toca el margen para ver el circuito completo"
									/>
									<div
										onClick={() => setIsCinematicTrackMode(true)}
										className="hidden lg:block absolute right-0 top-0 bottom-0 w-[18%] z-20 cursor-pointer"
										title="Toca el margen para ver el circuito completo"
									/>
								</>
							)}
						</div>

						{/* Feed oficial de YouTube (100% libre para interactuar, scrollear y ver videos) */}
						<YouTubeFeed />
					</div>
				</div>
			) : (
				<>
					{/* HUD de comando en vivo */}
					<div className="flex w-full flex-col gap-2 2xl:flex-row">
						<div className="overflow-x-auto">
							<LeaderBoard />
						</div>
						<div className="flex-1 2xl:max-h-[50rem]">
							<Map />
						</div>
					</div>

					{/* 🏎️ Paneles Pit-Wall: Mensajes FIA, Radios oficiales e Infracciones */}
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-3 font-mono">
						{/* Panel 1: Dirección de Carrera */}
						<div className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 shadow-xl backdrop-blur-md">
							<div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
								<div className="flex items-center gap-2">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
										<Flag className="h-3.5 w-3.5" />
									</div>
									<div>
										<h3 className="text-xs font-black uppercase tracking-wider text-zinc-100">
											Dirección de Carrera
										</h3>
										<p className="text-[10px] text-zinc-500 font-sans">Avisos y banderas FIA</p>
									</div>
								</div>
								<span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
									OFICIAL
								</span>
							</div>
							<div className="flex-1 overflow-y-auto max-h-[30rem] no-scrollbar">
								<RaceControl />
							</div>
						</div>

						{/* Panel 2: Radios de Equipo */}
						<div className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 shadow-xl backdrop-blur-md">
							<div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
								<div className="flex items-center gap-2">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
										<Radio className="h-3.5 w-3.5" />
									</div>
									<div>
										<h3 className="text-xs font-black uppercase tracking-wider text-zinc-100">
											Radios de Equipo
										</h3>
										<p className="text-[10px] text-zinc-500 font-sans">Comunicaciones de boxes</p>
									</div>
								</div>
								<span className="flex items-center gap-1.5 rounded bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black text-emerald-400">
									<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
									EN VIVO
								</span>
							</div>
							<div className="flex-1 overflow-y-auto max-h-[30rem] no-scrollbar">
								<TeamRadios />
							</div>
						</div>

						{/* Panel 3: Límites de Pista */}
						<div className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 shadow-xl backdrop-blur-md">
							<div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
								<div className="flex items-center gap-2">
									<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
										<AlertTriangle className="h-3.5 w-3.5" />
									</div>
									<div>
										<h3 className="text-xs font-black uppercase tracking-wider text-zinc-100">
											Límites de Pista
										</h3>
										<p className="text-[10px] text-zinc-500 font-sans">Infracciones y sanciones</p>
									</div>
								</div>
								<span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
									TABLA
								</span>
							</div>
							<div className="flex-1 overflow-y-auto max-h-[30rem] no-scrollbar">
								<TrackViolations />
							</div>
						</div>
					</div>
				</>
			)}

			{/* ⚔️ Modal Comparador Cara a Cara */}
			<HeadToHeadModal isOpen={isH2HOpen} onClose={() => setIsH2HOpen(false)} />

			<Footer />
		</div>
	);
}
