"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { utc, duration } from "moment";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";

export default function TrackInfo() {
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const track = useDataStore((state) => state.state?.TrackStatus);
	const session = useDataStore((state) => state.state?.SessionInfo);
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);
	const heartbeatUtc = useDataStore((state) => state.state?.Heartbeat?.Utc);
	const timingData = useDataStore((state) => state.state?.TimingData);
	const clock = useDataStore((state) => state.state?.ExtrapolatedClock);
	const delay = useSettingsStore((state) => state.delay);

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
		Object.values(timingData.Lines).some((line: any) => Boolean(line?.LastLapTime?.Value || line?.BestLapTime?.Value))
	);

	// Solo consideramos la pista verdaderamente activa si la sesión fue iniciada, no está terminada, y hay heartbeat reciente
	const isTrackLive = Boolean(
		session &&
		(isSessionStarted || hasActiveTiming || Boolean(clock?.Remaining)) &&
		!isSessionTerminated &&
		isRecentHeartbeat &&
		!(session?.Name === "Race" && !!lapCount && lapCount.CurrentLap > 0 && lapCount.CurrentLap >= lapCount.TotalLaps)
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
	if (clock?.Remaining) {
		let ms = duration(clock.Remaining).asMilliseconds();
		if (clock.Extrapolating && clock.Utc) {
			ms = ms - utc().diff(utc(clock.Utc)) + (delay ? delay * 1000 : 0);
		}
		if (ms > 0) {
			const d = duration(ms);
			const hours = d.hours();
			const minutes = d.minutes();
			const seconds = d.seconds();
			const pad = (n: number) => n.toString().padStart(2, "0");
			formattedTime = hours > 0
				? `${hours}:${pad(minutes)}:${pad(seconds)}`
				: `${pad(minutes)}:${pad(seconds)}`;
		} else {
			formattedTime = "00:00";
		}
	}

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
					<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hidden sm:inline">
						TIEMPO
					</span>
					<p className="text-2xl sm:text-3xl font-black whitespace-nowrap text-emerald-400 tracking-wider">
						{formattedTime}
					</p>
				</div>
			) : null}

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