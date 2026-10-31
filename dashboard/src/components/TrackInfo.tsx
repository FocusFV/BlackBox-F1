"use client";

import clsx from "clsx";
import { useDataStore } from "@/stores/useDataStore";
import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";

export default function TrackInfo() {
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const track = useDataStore((state) => state.state?.TrackStatus);
	const session = useDataStore((state) => state.state?.SessionInfo);
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);
	const heartbeatUtc = useDataStore((state) => state.state?.Heartbeat?.Utc);

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

	// Solo consideramos la pista verdaderamente activa si la sesión fue iniciada, no está terminada, y hay heartbeat reciente
	const isTrackLive = Boolean(
		session &&
		isSessionStarted &&
		!isSessionTerminated &&
		isRecentHeartbeat &&
		!(session?.Name === "Race" && !!lapCount && lapCount.CurrentLap > 0 && lapCount.CurrentLap >= lapCount.TotalLaps)
	);

	// Si no hay sesión activa en pista (ej: entre sesiones o antes de una práctica), no mostramos datos residuales
	if (!isTrackLive) {
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

	return (
		<div className="flex flex-row items-center gap-4 md:justify-self-end">
			{hasValidLapCount && (
				<p className="text-3xl font-extrabold whitespace-nowrap">
					{lapCount?.CurrentLap} / {lapCount?.TotalLaps}
				</p>
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