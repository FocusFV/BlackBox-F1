"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { utc, duration } from "moment";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { getTrackStatusMessage } from "@/lib/getTrackStatusMessage";
import { parseUtcMs, parseFomClockRemaining, formatMsToClock } from "@/lib/clockParser";

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
	const [currentTime, setCurrentTime] = useState<number>(0);
	useEffect(() => {
		setCurrentTime(Date.now());
		const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	// Telemetría con heartbeat activo en los últimos 3 minutos (descarta datos viejos o cacheados)
	const isRecentHeartbeat = Boolean(
		heartbeatUtc &&
		currentTime > 0 &&
		Math.abs(currentTime - new Date(heartbeatUtc).getTime()) < 3 * 60 * 1000
	);

	const isSessionStarted = sessionStatus === "Started" || sessionStatus === "Running";

	const isQualy = session?.Name?.toLowerCase().includes("qual") || Boolean(timingData?.SessionPart);
	const sessionPart = timingData?.SessionPart || 1;
	const isQualyEarlyPart = Boolean(
		isQualy &&
		sessionPart < 3 &&
		session?.ArchiveStatus?.Status !== "Complete"
	);

	const isSessionTerminated = Boolean(
		!isQualyEarlyPart &&
		((sessionStatus === "Ends" ||
			sessionStatus === "Finalised" ||
			(sessionStatus === "Finished" && (!isQualy || sessionPart >= 3)) ||
			(session as any)?.SessionStatus === "Finalised" ||
			(session as any)?.SessionStatus === "Ends" ||
			session?.ArchiveStatus?.Status === "Complete") &&
		session?.ArchiveStatus?.Status !== "Generating")
	);

	const isRaceOrSprint = session?.Name === "Race" || session?.Name === "Sprint";
	const hasValidLapCount = Boolean(
		isRaceOrSprint &&
		lapCount &&
		typeof lapCount.CurrentLap === "number" &&
		typeof lapCount.TotalLaps === "number" &&
		lapCount.TotalLaps > 0
	);

	const isRaceFinished = Boolean(
		isSessionTerminated ||
		(hasValidLapCount && !!lapCount && lapCount.CurrentLap >= lapCount.TotalLaps)
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

	// Consideramos la pista activa solo si la sesión NO ha finalizado y hay actividad en pista o reloj
	const isTrackLive = Boolean(
		!isRaceFinished &&
		!isSessionTerminated &&
		(hasActiveTiming ||
			Boolean(clock?.Remaining) ||
			(session && isSessionStarted))
	);

	// Si la carrera o sesión terminó de verdad (no en pausa entre tandas de Qualy)
	if ((isRaceFinished || isSessionTerminated) && !isQualyEarlyPart) {
		return (
			<div className="flex flex-row items-center gap-3 md:justify-self-end font-mono">
				{hasValidLapCount && (
					<p className="text-2xl sm:text-3xl font-extrabold whitespace-nowrap font-mono tracking-wider text-zinc-300">
						{lapCount?.CurrentLap} / {lapCount?.TotalLaps}
					</p>
				)}
				<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-sm font-black tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)]">
					<span>🏁</span>
					<span>FINALIZADA</span>
				</div>
			</div>
		);
	}

	// Si no hay sesión activa en pista ni reloj, no mostramos datos residuales
	if (!isTrackLive) {
		return null;
	}

	const allInPit = Boolean(
		timingData?.Lines &&
		Object.values(timingData.Lines).length > 0 &&
		Object.values(timingData.Lines).every((l: any) => l.InPit)
	);

	// 🔴 DETECCIÓN DE BANDERA ROJA OFICIAL:
	// Una bandera roja solo se cancela cuando Dirección de Carrera muestra BANDERA VERDE o abre el Pit Lane.
	const lastRedMsg = raceControlMessages?.filter(
		(m) => m.Flag === "RED" || m.Message?.toUpperCase().includes("RED FLAG") || m.Message?.toUpperCase().includes("SUSPENDED")
	).slice(-1)[0];
	const lastRedMs = parseUtcMs(lastRedMsg?.Utc);

	const lastGreenMsg = raceControlMessages?.filter(
		(m) => m.Flag === "GREEN" ||
			m.Message?.toUpperCase().includes("GREEN LIGHT") ||
			m.Message?.toUpperCase().includes("PIT LANE OPEN") ||
			m.Message?.toUpperCase().includes("SESSION RESUMED") ||
			m.Message?.toUpperCase().includes("TRACK CLEAR")
	).slice(-1)[0];
	const lastGreenMs = parseUtcMs(lastGreenMsg?.Utc);

	const hasCarsOnTrack = Boolean(
		timingData?.Lines &&
		Object.values(timingData.Lines).some((l: any) => !l.InPit && !l.Stopped)
	);

	const isRedFlag =
		track?.Status === "5" ||
		(!hasCarsOnTrack &&
			allInPit &&
			track?.Status !== "2" &&
			track?.Status !== "4" &&
			track?.Status !== "6" &&
			track?.Status !== "7" &&
			Boolean(lastRedMs && (!lastGreenMs || lastRedMs > lastGreenMs)));

	const chequeredMessages = raceControlMessages?.filter(
		(m) => m.Flag === "CHEQUERED" || m.Message?.toUpperCase().includes("CHEQUERED")
	);
	const lastChequered = chequeredMessages && chequeredMessages.length > 0
		? chequeredMessages[chequeredMessages.length - 1]
		: null;
	const breakStartMs = parseUtcMs(lastChequered?.Utc);
	const lastGreen = lastGreenMsg;

	// Solo es pausa oficial si hubo bandera a cuadros real y no hay bandera roja
	const breakDurationMs = (sessionPart === 1 ? 7 : 8) * 60 * 1000;
	const elapsedSinceChequered = breakStartMs ? Math.max(0, (currentTime || breakStartMs) - breakStartMs) : 0;
	const isChequeredActive = Boolean(
		lastChequered &&
		breakStartMs &&
		(!lastGreenMs || breakStartMs >= lastGreenMs) &&
		elapsedSinceChequered <= breakDurationMs + 60_000
	);

	const isQualyBreak = Boolean(
		isQualy &&
		sessionPart < 3 &&
		!isRedFlag &&
		session?.ArchiveStatus?.Status !== "Complete" &&
		(isChequeredActive || sessionStatus === "Finished" || allInPit)
	);
	const nextPartName = sessionPart === 1 ? "Q2" : "Q3";

	let formattedTime: string | undefined;

	if (isQualyBreak) {
		// ⏱️ PANTALLA OFICIAL ESTILO F1 TV DURANTE LA PAUSA ENTRE TANDAS
		const breakRemainingMs = Math.min(breakDurationMs, Math.max(0, breakDurationMs - elapsedSinceChequered));
		formattedTime = formatMsToClock(breakRemainingMs, true);
	} else if (!isRaceOrSprint && isTrackLive) {
		// ⏱️ RELOJ EN VIVO PARA QUALY O PRÁCTICAS (SIEMPRE EN MINUTOS Y SEGUNDOS MM:SS)
		const parsedClockMs = parseFomClockRemaining(clock?.Remaining, isRaceOrSprint);

		if (parsedClockMs !== null) {
			let ms = parsedClockMs;
			// Bajo bandera roja o cuando FOM congela el reloj (Extrapolating: false), se clava en tiempo real
			const isClockStopped = !clock?.Extrapolating || isRedFlag;
			if (!isClockStopped && clock?.Utc) {
				const clockUtcMs = parseUtcMs(clock.Utc);
				if (clockUtcMs) {
					ms = ms - Math.max(0, (currentTime || clockUtcMs) - clockUtcMs) + (delay ? delay * 1000 : 0);
				}
			}
			formattedTime = formatMsToClock(ms, true);
		} else {
			const partDurationMs = isQualy
				? (sessionPart === 3 ? 12 : sessionPart === 2 ? 15 : 18) * 60 * 1000
				: 60 * 60 * 1000;

			// Si hay bandera roja y no tenemos reloj aún, no calcular contra reloj de pared porque daría negativo y 00:00
			if (isRedFlag) {
				formattedTime = formatMsToClock(partDurationMs, true);
			} else {
				let partStartMs: number | null = null;
				if (lastGreen?.Utc) {
					partStartMs = parseUtcMs(lastGreen.Utc);
				} else if (session?.StartDate) {
					partStartMs = parseUtcMs(session.StartDate);
				}

				if (partStartMs) {
					const elapsed = Math.max(0, (currentTime || partStartMs) - partStartMs);
					const remainingMs = Math.min(partDurationMs, Math.max(0, partDurationMs - elapsed + (delay ? delay * 1000 : 0)));
					formattedTime = formatMsToClock(remainingMs, true);
				} else {
					formattedTime = formatMsToClock(partDurationMs, true);
				}
			}
		}
	}

	let currentTrackStatus = getTrackStatusMessage(track?.Status ? parseInt(track?.Status) : undefined);
	if (isRedFlag) {
		currentTrackStatus = getTrackStatusMessage(5);
	}

	return (
		<div className="flex flex-row items-center gap-4 md:justify-self-end">
			{hasValidLapCount ? (
				<p className="text-3xl font-extrabold whitespace-nowrap font-mono tracking-wider">
					{lapCount?.CurrentLap} / {lapCount?.TotalLaps}
				</p>
			) : isQualyBreak ? (
				/* 🏎️ BADGE ESTILO OFICIAL F1 TV: "Q3 EMPIEZA EN 02:45" */
				<div className="flex flex-col items-end justify-center rounded-xl border border-red-500/40 bg-zinc-950/95 px-3.5 py-1.5 shadow-2xl backdrop-blur-md font-mono">
					<div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400">
						<span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
						<span>F1 CLASIFICACIÓN</span>
					</div>
					<div className="flex items-baseline gap-2 mt-0.5">
						<span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
							{nextPartName} EMPIEZA EN
						</span>
						<span className="text-xl sm:text-2xl font-black text-white tracking-widest tabular-nums">
							{formattedTime}
						</span>
					</div>
				</div>
			) : formattedTime ? (
				<div className="flex items-center gap-2 font-mono">
					<span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline text-zinc-400">
						TIEMPO
					</span>
					<p className="text-2xl sm:text-3xl font-black whitespace-nowrap tracking-wider text-emerald-400">
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