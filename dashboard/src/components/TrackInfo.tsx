"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { utc, duration } from "moment";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";
import { parseFomClockRemaining, formatMsToClock } from "@/lib/clockParser";

export default function TrackInfo() {
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const track = useDataStore((state) => state.state?.TrackStatus);
	const session = useDataStore((state) => state.state?.SessionInfo);
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);
	const heartbeatUtc = useDataStore((state) => state.state?.Heartbeat?.Utc);
	const timingData = useDataStore((state) => state.state?.TimingData);
	const clock = useDataStore((state) => state.state?.ExtrapolatedClock);
	const raceControlMessages = useDataStore((state) => state.state?.RaceControlMessages?.Messages);
	const delay = useSettingsStore((state) => state.delay);

	// Actualización suave cada segundo para cuenta regresiva en vivo
	const [, setTick] = useState(0);
	useEffect(() => {
		const timer = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(timer);
	}, []);

	// Telemetría con heartbeat activo en los últimos 3 minutos (descarta datos viejos o cacheados)
	const isRecentHeartbeat = Boolean(
		heartbeatUtc &&
		Math.abs(Date.now() - new Date(heartbeatUtc).getTime()) < 3 * 60 * 1000
	);

	const isSessionStarted = sessionStatus === "Started" || sessionStatus === "Running";

	const isSessionTerminated =
		sessionStatus === "Ends" ||
		sessionStatus === "Finalised" ||
		sessionStatus === "Finished" ||
		(session as any)?.SessionStatus === "Finalised" ||
		(session as any)?.SessionStatus === "Ends" ||
		session?.ArchiveStatus?.Status === "Complete";

	// Detectar ventana de 15 minutos post-sesión
	const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);

	useEffect(() => {
		if (isSessionTerminated && session?.Name) {
			const storageKey = `f1_session_end_${session?.Key || session?.Name}`;
			const stored = typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;
			if (stored) {
				setSessionEndTime(parseInt(stored, 10));
			} else {
				const now = Date.now();
				if (typeof window !== "undefined") sessionStorage.setItem(storageKey, String(now));
				setSessionEndTime(now);
			}
		} else if (!isSessionTerminated) {
			setSessionEndTime(null);
		}
	}, [isSessionTerminated, session?.Key, session?.Name]);

	const isPostSession = Boolean(
		isSessionTerminated &&
		sessionEndTime &&
		Date.now() - sessionEndTime < 15 * 60 * 1000
	);

	const hasActiveTiming = Boolean(
		timingData?.Lines &&
		Object.values(timingData.Lines).some((line: any) =>
			Boolean(
				line?.LastLapTime?.Value ||
				line?.BestLapTime?.Value ||
				line?.Sectors?.some((s: any) => Boolean(s?.Value))
			)
		)
	);

	// Consideramos la pista activa si hay tiempos, reloj oficial, o sesión iniciada
	const isTrackLive = Boolean(
		hasActiveTiming ||
		Boolean(clock?.Remaining) ||
		(session &&
			isSessionStarted &&
			!isSessionTerminated)
	);

	// Si no hay sesión activa en pista ni estamos en post-sesión, no mostramos datos residuales
	if (!isTrackLive && !isPostSession) {
		return null;
	}

	const currentTrackStatus = getTrackStatusMessage(track?.Status ? parseInt(track?.Status) : undefined);

	// Solo las carreras principales o sprint tienen contador total de vueltas fijas (ej: 3 / 56)
	const isRaceOrSprint = session?.Name === "Race" || session?.Name === "Sprint";
	const hasValidLapCount = Boolean(
		isRaceOrSprint &&
		lapCount &&
		typeof lapCount.CurrentLap === "number" &&
		typeof lapCount.TotalLaps === "number" &&
		lapCount.TotalLaps > 0
	);

	// En prácticas o qualy, calculamos el tiempo restante oficial para sincronizar con la TV
	let formattedTime: string | undefined;
	const parsedClockMs = parseFomClockRemaining(clock?.Remaining, isRaceOrSprint);

	if (parsedClockMs !== null) {
		let ms = parsedClockMs;
		if (clock?.Extrapolating && clock.Utc) {
			ms = ms - utc().diff(utc(clock.Utc)) + (delay ? delay * 1000 : 0);
		}
		formattedTime = formatMsToClock(ms);
	} else if (!isRaceOrSprint && isTrackLive) {
		// ⏱️ Fallback inteligente para Qualy (Q1: 18m, Q2: 15m, Q3: 12m) y Prácticas (60m)
		const sessionPart = timingData?.SessionPart || 1;
		const isQualy = session?.Name?.toLowerCase().includes("qual") || Boolean(timingData?.SessionPart);

		const partDurationMs = isQualy
			? (sessionPart === 2 ? 15 : sessionPart === 3 ? 12 : 18) * 60 * 1000
			: 60 * 60 * 1000;

		const greenMessages = raceControlMessages?.filter(
			(m) => m.Flag === "GREEN" || m.Message?.includes("GREEN LIGHT") || m.Message?.includes("PIT LANE OPEN")
		);
		const lastGreen = greenMessages && greenMessages.length > 0 ? greenMessages[greenMessages.length - 1] : null;

		let partStartMs: number | null = null;
		if (lastGreen?.Utc) {
			partStartMs = new Date(lastGreen.Utc).getTime();
		} else if (session?.StartDate) {
			partStartMs = new Date(session.StartDate).getTime();
		}

		if (!partStartMs) {
			const now = Date.now();
			const topOfHour = new Date(now);
			topOfHour.setMinutes(0, 0, 0);
			const halfHour = new Date(now);
			halfHour.setMinutes(30, 0, 0);
			partStartMs = (now - halfHour.getTime() < now - topOfHour.getTime() && halfHour.getTime() <= now)
				? halfHour.getTime()
				: topOfHour.getTime();
		}

		if (partStartMs) {
			const elapsed = Date.now() - partStartMs;
			const remainingMs = Math.max(0, partDurationMs - elapsed + (delay ? delay * 1000 : 0));
			formattedTime = formatMsToClock(remainingMs);
		}
	}

	// Detectar si estamos en pausa/intermedio entre segmentos de Qualy (todos en boxes)
	const isQualy = session?.Name?.toLowerCase().includes("qual") || Boolean(timingData?.SessionPart);
	const allInPit = Boolean(
		timingData?.Lines &&
		Object.values(timingData.Lines).length > 0 &&
		Object.values(timingData.Lines).every((l: any) => l.InPit)
	);
	const sessionPart = timingData?.SessionPart || 1;
	const isQualyBreak = isQualy && sessionPart < 3 && allInPit && (parsedClockMs !== null || hasActiveTiming);
	const nextPartLabel = sessionPart === 1 ? "INICIO Q2" : sessionPart === 2 ? "INICIO Q3" : "TIEMPO";

	if (isPostSession) {
		return (
			<div className="flex flex-row items-center gap-3 md:justify-self-end font-mono">
				<span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/90 border border-amber-500/30 text-amber-400 text-sm font-black tracking-wider shadow-sm">
					🏁 FINAL
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-row items-center gap-4 md:justify-self-end">
			{hasValidLapCount ? (
				<p className="text-3xl font-extrabold whitespace-nowrap font-mono tracking-wider">
					{lapCount?.CurrentLap} / {lapCount?.TotalLaps}
				</p>
			) : formattedTime ? (
				<div className="flex items-center gap-2 font-mono">
					<span className={clsx("text-[10px] font-bold uppercase tracking-widest hidden sm:inline", isQualyBreak ? "text-amber-400 animate-pulse font-black" : "text-zinc-400")}>
						{isQualyBreak ? nextPartLabel : "TIEMPO"}
					</span>
					<p className={clsx("text-2xl sm:text-3xl font-black whitespace-nowrap tracking-wider", isQualyBreak ? "text-amber-400" : "text-emerald-400")}>
						{formattedTime}
					</p>
				</div>
			) : (
				<div className="flex items-center gap-2 font-mono">
					<span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
					<span className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-widest">
						EN VIVO
					</span>
				</div>
			)}

			{!!currentTrackStatus && (
				<div
					className={clsx("flex h-8 items-center truncate rounded-md px-2", currentTrackStatus.color)}
					style={{
						boxShadow: `0 0 60px 10px ${currentTrackStatus.hex}`,
					}}
				>
					<p className="text-lg font-medium">{currentTrackStatus.message}</p>
				</div>
			)}
		</div>
	);
}