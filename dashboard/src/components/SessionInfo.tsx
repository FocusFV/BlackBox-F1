"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { utc, duration } from "moment";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Flag from "@/components/Flag";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";
import { parseUtcMs, parseFomClockRemaining, formatMsToClock } from "@/lib/clockParser";

const translateSessionName = (name?: string) => {
	if (!name) return "En Vivo";
	const clean = name.toLowerCase().trim();
	if (clean === "race") return "Carrera";
	if (clean === "qualifying") return "Clasificación";
	if (clean === "sprint") return "Carrera Sprint";
	if (clean === "sprint shootout" || clean === "sprint qualifying") return "Clasif. Sprint";
	if (clean === "practice 1") return "Práctica 1";
	if (clean === "practice 2") return "Práctica 2";
	if (clean === "practice 3") return "Práctica 3";
	return name;
};

const sessionPartPrefix = (name: string) => {
	switch (name) {
		case "Sprint Qualifying":
			return "SQ";
		case "Qualifying":
			return "Q";
		default:
			return "";
	}
};

export default function SessionInfo() {
	const clock = useDataStore((state) => state.state?.ExtrapolatedClock);
	const session = useDataStore((state) => state.state?.SessionInfo);
	const timingData = useDataStore((state) => state.state?.TimingData);
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);
	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const raceControlMessages = useDataStore((state) => state.state?.RaceControlMessages?.Messages);

	const delay = useSettingsStore((state) => state.delay);

	// Actualización fluida cada segundo para el reloj de Qualy / Prácticas
	const [currentTime, setCurrentTime] = useState<number>(0);
	useEffect(() => {
		setCurrentTime(Date.now());
		const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	// Una sesión se considera en vivo ÚNICAMENTE si está formalmente iniciada/corriendo y no ha finalizado
	const isSessionTerminated =
		sessionStatus === "Ends" ||
		sessionStatus === "Finalised" ||
		sessionStatus === "Finished" ||
		(session as any)?.SessionStatus === "Finalised" ||
		(session as any)?.SessionStatus === "Ends";

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
		currentTime > 0 &&
		currentTime - sessionEndTime < 15 * 60 * 1000
	);

	// Detecta actividad real de telemetría en pista (tiempos de vuelta o sectores activos)
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

	const isLive = Boolean(
		hasActiveTiming ||
		Boolean(clock?.Remaining) ||
		(session &&
			!isSessionTerminated &&
			(sessionStatus === "Started" ||
				sessionStatus === "Running" ||
				sessionStatus === "PitsOpen" ||
				sessionStatus === "StartedOnTime"))
	);

	const isOfflineOrFinished = !isLive;

	const [nextGpName, setNextGpName] = useState("Próximo Gran Premio");
	const [nextSessionName, setNextSessionName] = useState("Sesión Oficial");
	const [countdown, setCountdown] = useState("Cargando...");
	const [countryCode, setCountryCode] = useState<string | undefined>(undefined);

	const calcCountdown = (target: Date) => {
		const difference = target.getTime() - Date.now();
		if (difference <= 0) return "00:00:00";
		const days = Math.floor(difference / (1000 * 60 * 60 * 24));
		const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((difference % (1000 * 60)) / 1000);
		const pad = (n: number) => n.toString().padStart(2, "0");
		return days > 0
			? `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
			: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	};

	// Obtener la próxima carrera y calcular el contador
	useEffect(() => {
		if (!isOfflineOrFinished) return;

		let targetDate: Date | null = null;
		let intervalId: any = null;

		const parseSessionDate = (dateStr?: string, timeStr?: string): Date | null => {
			if (!dateStr) return null;
			const cleanTime = (timeStr || "12:00:00Z").trim();
			const cleanTimeZ = cleanTime.endsWith("Z") ? cleanTime : `${cleanTime}Z`;
			const dt = new Date(`${dateStr.trim()}T${cleanTimeZ}`);
			return isNaN(dt.getTime()) ? null : dt;
		};

		async function fetchNextSchedule() {
			try {
				const res = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json");
				const data = await res.json();

				if (data.MRData?.RaceTable?.Races?.length > 0) {
					const nextRace = data.MRData.RaceTable.Races[0];
					setNextGpName(translateGpName(nextRace.raceName));

					const countryRaw = nextRace.Circuit?.Location?.country || "";
					setCountryCode(getCountryCodeForGp(nextRace.raceName, countryRaw));

					const now = Date.now();
					const candidateDefs = [
						{ name: "Práctica 1", dt: parseSessionDate(nextRace.FirstPractice?.date, nextRace.FirstPractice?.time) },
						{ name: "Práctica 2", dt: parseSessionDate(nextRace.SecondPractice?.date, nextRace.SecondPractice?.time) },
						{ name: "Práctica 3", dt: parseSessionDate(nextRace.ThirdPractice?.date, nextRace.ThirdPractice?.time) },
						{
							name: "Sprint Shootout",
							dt: parseSessionDate(
								nextRace.SprintQualifying?.date || nextRace.SprintShootout?.date,
								nextRace.SprintQualifying?.time || nextRace.SprintShootout?.time
							),
						},
						{ name: "Carrera Sprint", dt: parseSessionDate(nextRace.Sprint?.date, nextRace.Sprint?.time) },
						{ name: "Clasificación", dt: parseSessionDate(nextRace.Qualifying?.date, nextRace.Qualifying?.time) },
						{ name: "Gran Premio", dt: parseSessionDate(nextRace.date, nextRace.time) },
					];

					const validSessions = candidateDefs
						.filter((s): s is { name: string; dt: Date } => s.dt !== null)
						.sort((a, b) => a.dt.getTime() - b.dt.getTime());

					// Verificamos si hay alguna sesión oficial en curso (iniciada hace menos de 2 horas)
					const ongoingSession = validSessions.find(
						(s) => s.dt.getTime() <= now && now <= s.dt.getTime() + 2 * 3600 * 1000
					);

					if (ongoingSession) {
						setNextSessionName(ongoingSession.name);
						setCountdown("EN PISTA");
					} else {
						const upcomingSession =
							validSessions.find((s) => s.dt.getTime() > now) ||
							validSessions[validSessions.length - 1];

						if (upcomingSession) {
							setNextSessionName(upcomingSession.name);
							targetDate = upcomingSession.dt;
							setCountdown(calcCountdown(targetDate));
						}
					}
				}
			} catch {
				const d = new Date();
				d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
				d.setHours(14, 0, 0, 0);
				targetDate = d;
				setCountdown(calcCountdown(targetDate));
			}

			if (targetDate) {
				setCountdown(calcCountdown(targetDate));
			}

			intervalId = setInterval(() => {
				if (!targetDate) return;
				setCountdown(calcCountdown(targetDate));
			}, 1000);
		}

		fetchNextSchedule();

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [isOfflineOrFinished]);

	// Render post-sesión (15 minutos tras finalizar para revisar resultados con calma)
	if (isPostSession) {
		return (
			<div className="flex items-center gap-3 font-mono">
				<Flag countryCode={session?.Meeting?.Country?.Code} />
				<div className="flex flex-col justify-center">
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
							SESIÓN FINALIZADA
						</span>
						<span className="rounded bg-zinc-900/90 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
							RESULTADOS FINALES
						</span>
					</div>
					<h1 className="text-sm md:text-base leading-none font-black text-white mt-1 uppercase tracking-wide">
						{translateSessionName(session?.Name)} {session?.Meeting?.Country?.Name || session?.Meeting?.Name || ""}
					</h1>
				</div>
			</div>
		);
	}

	// Render fuera de sesión (diseño con bandera oficial y estilo Pit-Wall)
	if (isOfflineOrFinished) {
		return (
			<div className="flex items-center gap-3">
				{/* Banderita del país del próximo GP */}
				<div className="flex items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5 shadow-md shrink-0">
					<Flag countryCode={countryCode} className="h-6 w-9 object-cover rounded-md" />
				</div>

				<div className="flex flex-col justify-center">
					<div className="flex items-center gap-2">
						<span className="truncate text-xs leading-none font-black text-amber-400 uppercase tracking-widest font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
							{nextGpName}
						</span>
						<span className="rounded bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 uppercase tracking-wider">
							{nextSessionName}
						</span>
					</div>
					<p className="text-xl md:text-2xl leading-none font-black text-white font-mono tracking-wider mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
						{countdown}
					</p>
				</div>
			</div>
		);
	}

	// Render en vivo
	const isRaceOrSprint = session?.Name === "Race" || session?.Name === "Sprint";
	const isQualy = session?.Name?.toLowerCase().includes("qual") || Boolean(timingData?.SessionPart);
	const sessionPart = timingData?.SessionPart || 1;
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
	const lastGreen = lastGreenMsg;

	const isRedFlag = trackStatus === "5" || Boolean(
		lastRedMs && (!lastGreenMs || lastRedMs >= lastGreenMs)
	);

	const chequeredMessages = raceControlMessages?.filter(
		(m) => m.Flag === "CHEQUERED" || m.Message?.toUpperCase().includes("CHEQUERED")
	);
	const lastChequered = chequeredMessages && chequeredMessages.length > 0
		? chequeredMessages[chequeredMessages.length - 1]
		: null;
	const breakStartMs = parseUtcMs(lastChequered?.Utc);

	// Solo es pausa oficial entre fases de Qualy si hubo bandera a cuadros real, no hay bandera roja, y la bandera a cuadros es posterior al inicio
	const breakDurationMs = (sessionPart === 1 ? 7 : 8) * 60 * 1000;
	const elapsedSinceChequered = breakStartMs ? Math.max(0, (currentTime || breakStartMs) - breakStartMs) : 0;
	const isChequeredActive = Boolean(
		lastChequered &&
		breakStartMs &&
		(!lastGreenMs || breakStartMs >= lastGreenMs) &&
		elapsedSinceChequered <= breakDurationMs + 60_000
	);

	const isQualyBreak = Boolean(isQualy && sessionPart < 3 && allInPit && !isRedFlag && isChequeredActive);
	const nextPartName = sessionPart === 1 ? "Q2" : "Q3";

	let timeRemaining: string | undefined;

	if (isQualyBreak) {
		// ⏱️ CUENTA REGRESIVA OFICIAL ENTRE SESIONES DE QUALY
		const breakRemainingMs = Math.min(breakDurationMs, Math.max(0, breakDurationMs - elapsedSinceChequered));
		timeRemaining = formatMsToClock(breakRemainingMs, true);
	} else if (!isRaceOrSprint && isLive) {
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
			timeRemaining = formatMsToClock(ms, true);
		} else {
			const partDurationMs = isQualy
				? (sessionPart === 3 ? 12 : sessionPart === 2 ? 15 : 18) * 60 * 1000
				: 60 * 60 * 1000;

			// Si hay bandera roja y no tenemos reloj aún, no calcular contra reloj de pared porque daría negativo y 00:00
			if (isRedFlag) {
				timeRemaining = formatMsToClock(partDurationMs, true);
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
					timeRemaining = formatMsToClock(remainingMs, true);
				} else {
					timeRemaining = formatMsToClock(partDurationMs, true);
				}
			}
		}
	}

	return (
		<div className="flex items-center gap-2.5">
			<Flag countryCode={session?.Meeting?.Country?.Code} />

			<div className="flex flex-col justify-center">
				<h1 className="truncate text-xs md:text-sm leading-none font-bold text-white font-mono uppercase tracking-wide">
					{session?.Meeting?.Name}: {translateSessionName(session?.Name)}
					{isRedFlag ? (
						<span className="text-red-500 font-black ml-1.5 animate-pulse">
							• BANDERA ROJA
						</span>
					) : isQualyBreak ? (
						<span className="text-amber-400 font-black ml-1.5 animate-pulse">
							• PAUSA Q{sessionPart} ➔ Q{sessionPart + 1}
						</span>
					) : (
						timingData?.SessionPart && session?.Name ? ` ${sessionPartPrefix(session.Name)}${timingData.SessionPart}` : ""
					)}
				</h1>

				{timeRemaining !== undefined ? (
					<div className="flex items-center gap-1.5 mt-1">
						{isQualyBreak && (
							<span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
								{nextPartName} EMPIEZA EN:
							</span>
						)}
						<p className={clsx("text-xl md:text-2xl leading-none font-black font-mono", isQualyBreak ? "text-amber-400" : "text-white")}>
							{timeRemaining}
						</p>
					</div>
				) : (
					<p className="text-xs leading-none font-bold text-zinc-400 font-mono mt-1 uppercase tracking-wider">
						{session?.Meeting?.Circuit?.ShortName || session?.Meeting?.Location || "Trazado Oficial"}
					</p>
				)}
			</div>
		</div>
	);
}
