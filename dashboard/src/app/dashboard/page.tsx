"use client";

import { useEffect, useState } from "react";
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
import { Swords } from "lucide-react";
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

	useEffect(() => {
		let isMounted = true;
		getUpcomingSessions().then((data) => {
			if (isMounted && data.length > 0) {
				setSessions(data);
				const status = evaluateSessionStatus(data);
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
			const status = evaluateSessionStatus(sessions);
			setScheduleStatus(status);
			if (status.nextSessionStart) {
				setCountdownText(formatCountdown(status.nextSessionStart));
			}
		}, 30000);

		return () => clearInterval(timer);
	}, [sessions]);

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

	const isTrackActive = Boolean(trackStatus && trackStatus !== "0" && trackStatus !== "");
	const isSessionStarted = sessionStatus === "Started" || sessionStatus === "Running";
	const isSessionFinished =
		sessionStatus === "Ends" ||
		sessionStatus === "Finalised" ||
		(session?.Name === "Race" && !!lapCount && lapCount.CurrentLap >= lapCount.TotalLaps && lapCount.TotalLaps > 0);

	// Sesión activa por calendario
	const isCalendarLive = scheduleStatus.isLiveWindow;

	// Determinación de modo en vivo automática
	const isLiveAuto =
		hasLiveTelemetry ||
		isTrackActive ||
		isSessionStarted ||
		(isCalendarLive && !isSessionFinished);

	// Vista activa (por defecto automático)
	const showTelemetry = isLiveAuto;

	return (
		<div className="flex w-full flex-col gap-4 px-4 py-4 text-zinc-100">
			{/* 🏎️ Barra de estado HUD */}
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 backdrop-blur-md">
				<div className="flex items-center gap-3">
					{showTelemetry ? (
						<div className="flex items-center gap-2">
							<span className="relative flex h-3 w-3">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
							</span>
							<span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
								{scheduleStatus.activeSessionName || session?.Name || "Telemetría en Vivo"}
							</span>
							{hasLiveTelemetry && (
								<span className="hidden rounded bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-800/50 sm:inline-block">
									DATALINK ACTIVO
								</span>
							)}
						</div>
					) : (
						<div className="flex items-center gap-2">
							<span className="text-base">🏁</span>
							<span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
								Parque Cerrado (Fuera de Sesión)
							</span>
							{scheduleStatus.nextSessionName && countdownText && (
								<span className="hidden rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 md:inline-block">
									Próxima: <strong className="text-zinc-200">{scheduleStatus.nextSessionName}</strong> ({countdownText})
								</span>
							)}
						</div>
					)}
				</div>

				{/* Controles de la derecha: Cara a Cara y TV Sync */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Botón Cara a Cara */}
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

			{/* ⚠️ Alertas dinámicas oficiales de Dirección de Carrera (SC, VSC, Banderas, Sanciones) */}
			<RaceControlAlertBanner />

			{/* 🎙️ Popup interactivo flotante de Team Radios en vivo */}
			<TeamRadioAlertPopup />

			{/* Contenido principal */}
			{!showTelemetry ? (
				<div className="flex flex-col gap-6 w-full">
					{/* Historial y resultados del último GP */}
					<ParcFerme />

					{/* Feed oficial de YouTube */}
					<YouTubeFeed />
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

					<div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
						<div>
							<RaceControl />
						</div>
						<div>
							<TeamRadios />
						</div>
						<div>
							<TrackViolations />
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
