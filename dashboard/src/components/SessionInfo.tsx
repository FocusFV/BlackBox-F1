"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { utc, duration } from "moment";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Flag from "@/components/Flag";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";
import { parseUtcMs, parseFomClockRemaining, formatMsToClock, getScheduledSessionStartMs } from "@/lib/clockParser";
import { simulator } from "@/lib/simulatorFeed";
import { useTranslation } from "@/hooks/useTranslation";
import { useCircuitStore } from "@/stores/useCircuitStore";

const translateSessionName = (name?: string, lang: string = "es") => {
	if (!name) {
		return lang === "en" ? "Live" : lang === "pt" ? "Ao Vivo" : "En Vivo";
	}
	const clean = name.toLowerCase().trim();
	if (lang === "en") {
		if (clean === "race") return "Race";
		if (clean === "qualifying") return "Qualifying";
		if (clean === "sprint") return "Sprint Race";
		if (clean === "sprint shootout" || clean === "sprint qualifying") return "Sprint Qualy";
		if (clean === "practice 1" || clean === "práctica 1") return "Practice 1";
		if (clean === "practice 2" || clean === "práctica 2") return "Practice 2";
		if (clean === "practice 3" || clean === "práctica 3") return "Practice 3";
		return name;
	}
	if (lang === "pt") {
		if (clean === "race") return "Corrida";
		if (clean === "qualifying") return "Classificação";
		if (clean === "sprint") return "Corrida Sprint";
		if (clean === "sprint shootout" || clean === "sprint qualifying") return "Classif. Sprint";
		if (clean === "practice 1" || clean === "práctica 1") return "Treino Livre 1";
		if (clean === "practice 2" || clean === "práctica 2") return "Treino Livre 2";
		if (clean === "practice 3" || clean === "práctica 3") return "Treino Livre 3";
		return name;
	}
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
	const { t, language } = useTranslation();
	const openCircuit = useCircuitStore((state) => state.openCircuit);

	// Actualización fluida cada segundo para el reloj de Qualy / Prácticas
	const [currentTime, setCurrentTime] = useState<number>(0);
	useEffect(() => {
		setCurrentTime(Date.now());
		const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	const isRaceOrSprint = session?.Name === "Race" || session?.Name === "Sprint";
	const isQualy = session?.Name?.toLowerCase().includes("qual") || Boolean(timingData?.SessionPart);
	const sessionPart = timingData?.SessionPart || 1;

	// En Clasificación (Qualy), 'Finished' solo significa que terminó Q1 o Q2.
	// La sesión solo termina de verdad si es Q3 o si F1 marca ArchiveStatus como 'Complete'.
	const isQualyEarlyPart = Boolean(
		isQualy &&
		sessionPart < 3 &&
		session?.ArchiveStatus?.Status !== "Complete"
	);

	const isSessionTerminated = Boolean(
		!isQualyEarlyPart &&
		(sessionStatus === "Ends" ||
			sessionStatus === "Finalised" ||
			(sessionStatus === "Finished" && (!isQualy || sessionPart >= 3)) ||
			(session as any)?.SessionStatus === "Finalised" ||
			(session as any)?.SessionStatus === "Ends" ||
			session?.ArchiveStatus?.Status === "Complete")
	);

	const chequeredMessages = raceControlMessages?.filter(
		(m) => m.Flag === "CHEQUERED" || m.Message?.toUpperCase().includes("CHEQUERED")
	);
	const lastChequered = chequeredMessages && chequeredMessages.length > 0
		? chequeredMessages[chequeredMessages.length - 1]
		: null;
	const lastChequeredMs = parseUtcMs(lastChequered?.Utc);
	const effectiveSessionEndMs = lastChequeredMs || (session?.EndDate ? parseUtcMs(session.EndDate) : null);

	// Detectar ventana de 15 minutos post-sesión tras la bandera a cuadros real
	const isPostSession = Boolean(
		isSessionTerminated &&
		effectiveSessionEndMs &&
		currentTime > 0 &&
		currentTime - effectiveSessionEndMs < 15 * 60 * 1000 &&
		currentTime >= effectiveSessionEndMs
	);

	// Detecta actividad real de telemetría en pista SOLO si la sesión no ha finalizado
	const hasActiveTiming = Boolean(
		!isSessionTerminated &&
		timingData?.Lines &&
		Object.values(timingData.Lines).some((line: any) =>
			Boolean(
				line?.LastLapTime?.Value ||
				line?.BestLapTime?.Value ||
				line?.Sectors?.some((s: any) => Boolean(s?.Value))
			)
		)
	);

	const isSimActive = typeof window !== "undefined" && (
		sessionStorage.getItem("f1_pitwall_sim") === "active" || simulator.getActive()
	);

	const [isSimMounted, setIsSimMounted] = useState<boolean>(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const active = sessionStorage.getItem("f1_pitwall_sim") === "active" || simulator.getActive();
			setIsSimMounted(active);
			if (active) {
				setNextGpName("Gran Premio de la Ciudad de México");
				setCountryCode("mex");
				setNextSessionName("Carrera en Vivo");
				setCountdown("EN PISTA");
			}
		}
	}, []);

	const effectiveSimActive = isSimActive || isSimMounted;

	const isLive = Boolean(
		effectiveSimActive ||
		(!isSessionTerminated &&
		(hasActiveTiming ||
			Boolean(clock?.Remaining) ||
			(session &&
				(sessionStatus === "Started" ||
					sessionStatus === "Running" ||
					sessionStatus === "PitsOpen" ||
					sessionStatus === "StartedOnTime"))))
	);

	const isOfflineOrFinished = !isLive && !effectiveSimActive;

	const [nextGpName, setNextGpName] = useState("Gran Premio de Las Vegas");
	const [nextSessionName, setNextSessionName] = useState("Práctica 1");
	const [countdown, setCountdown] = useState(() => {
		const target = new Date("2026-11-20T00:30:00Z");
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
	});
	const [countryCode, setCountryCode] = useState<string | undefined>("usa");

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
		const isSimActiveSync = typeof window !== "undefined" && (
			sessionStorage.getItem("f1_pitwall_sim") === "active" || simulator.getActive()
		);
		if (!isOfflineOrFinished || isSimActive || isSimActiveSync) return;

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

					const sessionDurations: Record<string, number> = {
						"Práctica 1": 60 * 60 * 1000,
						"Práctica 2": 60 * 60 * 1000,
						"Práctica 3": 60 * 60 * 1000,
						"Sprint Shootout": 45 * 60 * 1000,
						"Carrera Sprint": 60 * 60 * 1000,
						"Clasificación": 60 * 60 * 1000,
						"Gran Premio": 120 * 60 * 1000,
					};

					const POST_SESSION_WINDOW = 20 * 60 * 1000; // 20 min post-bandera a cuadros para ver resultados

					// 1. ¿Hay alguna sesión que acaba de terminar hace menos de 20 minutos?
					const recentlyFinishedSession = validSessions.find((s) => {
						const dur = sessionDurations[s.name] || 60 * 60 * 1000;
						const end = s.dt.getTime() + dur;
						return now >= end && now <= end + POST_SESSION_WINDOW;
					});

					// 2. Buscamos la siguiente sesión programada en el futuro
					const upcomingSession = validSessions.find((s) => s.dt.getTime() > now);

					if (recentlyFinishedSession) {
						// Opción 3: Durante los primeros 20 minutos muestra SESIÓN FINALIZADA
						setNextSessionName(recentlyFinishedSession.name);
						setCountdown(t("sessions.finished", "SESIÓN FINALIZADA"));
					} else if (upcomingSession) {
						// Luego pasa de inmediato a la cuenta regresiva oficial hacia la siguiente sesión (ej. Clasificación)
						const displaySessionName =
							upcomingSession.name === "Gran Premio"
								? "Gran Premio (Carrera)"
								: upcomingSession.name;
						setNextSessionName(displaySessionName);
						targetDate = upcomingSession.dt;
						setCountdown(calcCountdown(targetDate));
					} else {
						setCountdown(t("sessions.finished", "SESIÓN FINALIZADA"));
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
	if (isPostSession && !isQualyEarlyPart) {
		return (
			<div className="flex items-center gap-3 font-mono">
				<Flag countryCode={session?.Meeting?.Country?.Code} />
				<div className="flex flex-col justify-center">
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
							{t("sessions.finished", "SESIÓN FINALIZADA")}
						</span>
						<span className="rounded bg-zinc-900/90 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
							{t("parc_ferme.official_results", "RESULTADOS FINALES")}
						</span>
					</div>
					<h1 className="text-sm md:text-base leading-none font-black text-white mt-1 uppercase tracking-wide">
						{translateSessionName(session?.Name, language)} {session?.Meeting?.Country?.Name || session?.Meeting?.Name || ""}
					</h1>
				</div>
			</div>
		);
	}

	// Render fuera de sesión (diseño con bandera oficial y estilo Pit-Wall)
	if (isOfflineOrFinished) {
		return (
			<div className="flex items-center gap-2.5 sm:gap-3 max-w-full overflow-hidden pr-2 sm:pr-0">
				{/* Banderita del país del próximo GP */}
				<div className="flex items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5 shadow-md shrink-0">
					<Flag countryCode={effectiveSimActive ? "mex" : countryCode} className="h-6 w-9 object-cover rounded-md" />
				</div>

				<div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden pr-2 sm:pr-1">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 max-w-full">
						<span className="text-[11px] sm:text-xs leading-none font-black text-amber-400 uppercase tracking-tight sm:tracking-widest font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
							{translateGpName(effectiveSimActive ? "mexico city" : nextGpName, language)}
						</span>
						<span className="rounded bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 uppercase tracking-wider shrink-0 whitespace-nowrap mr-1 sm:mr-0">
							{effectiveSimActive ? t("sessions.live", "Carrera en Vivo") : translateSessionName(nextSessionName, language)}
						</span>

						{/* 🏁 BOTÓN INTELIGENTE: INFO CIRCUITO */}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								const targetGp = effectiveSimActive ? "Gran Premio de la Ciudad de México" : nextGpName;
								const targetCountry = effectiveSimActive ? "mex" : countryCode;
								openCircuit(targetGp, targetCountry);
							}}
							className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:border-amber-500/50 hover:text-amber-300 hover:bg-zinc-800 transition-all font-mono font-bold uppercase shrink-0 shadow-sm active:scale-95 cursor-pointer"
							title={t("parc_ferme.tap_to_view_circuit", "Toca para ver el circuito completo en alta resolución")}
						>
							<span>{t("sessions.circuit_info", "INFO CIRCUITO")}</span>
							<span className="text-[9px]">🏁</span>
						</button>
					</div>
					<p className="text-xl md:text-2xl leading-none font-black text-white font-mono tracking-wider mt-1 sm:mt-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
						{effectiveSimActive ? t("sessions.on_track", "EN PISTA") : countdown === "EN PISTA" ? t("sessions.on_track", "EN PISTA") : countdown}
					</p>
				</div>
			</div>
		);
	}

	// Render en vivo
	const allInPit = Boolean(
		timingData?.Lines &&
		Object.values(timingData.Lines).length > 0 &&
		Object.values(timingData.Lines).every((l: any) => l.InPit)
	);

	// 🔴 DETECCIÓN DE BANDERA ROJA OFICIAL:
	// Solo es bandera roja si trackStatus es '5', o si el último mensaje de bandera es ROJA y no ha sido superado por verde o bandera a cuadros, y la pista no está en verde ("1").
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

	const breakStartMs = lastChequeredMs;

	const isRedFlag =
		trackStatus === "5" ||
		(lastRedMs !== null &&
			(!lastGreenMs || lastRedMs > lastGreenMs) &&
			(!lastChequeredMs || lastRedMs > lastChequeredMs) &&
			trackStatus !== "1" &&
			trackStatus !== "2" &&
			trackStatus !== "4" &&
			trackStatus !== "6" &&
			trackStatus !== "7");

	// Solo es pausa oficial entre fases de Qualy si hubo bandera a cuadros real, no hay bandera roja, y la bandera a cuadros es posterior al inicio
	const breakDurationMs = (sessionPart === 1 ? 7 : 8) * 60 * 1000;
	const elapsedSinceChequered = breakStartMs ? Math.max(0, (currentTime || breakStartMs) - breakStartMs) : 0;
	const isChequeredActive = Boolean(
		lastChequered &&
		breakStartMs &&
		(!lastGreenMs || breakStartMs >= lastGreenMs) &&
		elapsedSinceChequered <= breakDurationMs + 60_000
	);

	const scheduledStartMs = getScheduledSessionStartMs(session);

	const hasCarsOnTrack = Boolean(
		timingData?.Lines &&
		Object.values(timingData.Lines).some((l: any) => !l.InPit && !l.Retired && !l.Stopped)
	);

	const hasPartStarted = Boolean(
		hasActiveTiming ||
		hasCarsOnTrack ||
		(lastGreenMs && (!scheduledStartMs || lastGreenMs >= scheduledStartMs - 10 * 60 * 1000))
	);

	// 🛑 Pausa entre tandas de clasificación (Q1 a Q2 o Q2 a Q3)
	// REGLA: Solo ocurre si hubo bandera a cuadros real de la tanda anterior. NUNCA por allInPit antes de comenzar Q1.
	const isQualyBreak = Boolean(
		isQualy &&
		sessionPart < 3 &&
		!isRedFlag &&
		session?.ArchiveStatus?.Status !== "Complete" &&
		isChequeredActive
	);
	const nextPartName = sessionPart === 1 ? "Q2" : "Q3";

	// ⏳ Previa de Clasificación o de Sesión Oficial (esperando inicio de tanda)
	const isPreQualy = Boolean(
		isQualy &&
		sessionPart === 1 &&
		!isQualyBreak &&
		!hasPartStarted &&
		!isSessionTerminated
	);

	const isPreSession = Boolean(
		!isQualy &&
		!hasPartStarted &&
		!isSessionTerminated &&
		scheduledStartMs &&
		currentTime > 0 &&
		currentTime < scheduledStartMs &&
		!hasCarsOnTrack
	);

	let timeRemaining: string | undefined;

	if (isPreQualy || isPreSession) {
		const preRemainingMs = scheduledStartMs ? Math.max(0, scheduledStartMs - (currentTime || scheduledStartMs)) : 0;
		if (preRemainingMs > 0) {
			timeRemaining = formatMsToClock(preRemainingMs, true);
		} else {
			timeRemaining = "00:00";
		}
	} else if (isQualyBreak) {
		// ⏱️ CUENTA REGRESIVA OFICIAL ENTRE SESIONES DE QUALY
		const breakRemainingMs = Math.min(breakDurationMs, Math.max(0, breakDurationMs - elapsedSinceChequered));
		timeRemaining = formatMsToClock(breakRemainingMs, true);
	} else if (!isRaceOrSprint && isLive) {
		const partDurationMs = isQualy
			? (sessionPart === 3 ? 12 : sessionPart === 2 ? 15 : 18) * 60 * 1000
			: 60 * 60 * 1000;

		const parsedClockMs = parseFomClockRemaining(clock?.Remaining, isRaceOrSprint);

		if (isRedFlag) {
			// 🔴 BAJO BANDERA ROJA: El reloj oficial se detiene en el momento exacto en que Dirección de Carrera sacó la bandera roja
			let redMsRemaining: number | null = null;

			// 1. Si tenemos reloj oficial de FOM con tiempo restante válido (> 0):
			if (parsedClockMs !== null && parsedClockMs > 0 && clock?.Utc) {
				const clockUtcMs = parseUtcMs(clock.Utc);
				if (clockUtcMs && lastRedMs && lastRedMs >= clockUtcMs) {
					const elapsedBeforeRed = lastRedMs - clockUtcMs;
					redMsRemaining = Math.max(0, parsedClockMs - elapsedBeforeRed);
				} else {
					redMsRemaining = parsedClockMs;
				}
			}

			// 2. Si no o si dio 0 (reloj congelado en 00:00 al suspender), calcular duración de la tanda menos tiempo corrido hasta la bandera roja:
			if (redMsRemaining === null || redMsRemaining <= 0) {
				let partStartMs: number | null = null;
				if (lastGreen?.Utc) {
					partStartMs = parseUtcMs(lastGreen.Utc);
				} else if (session?.StartDate) {
					partStartMs = parseUtcMs(session.StartDate);
				}

				if (partStartMs && lastRedMs && lastRedMs > partStartMs) {
					const elapsedBeforeRed = lastRedMs - partStartMs;
					redMsRemaining = Math.max(0, partDurationMs - elapsedBeforeRed);
				} else {
					redMsRemaining = partDurationMs;
				}
			}

			timeRemaining = formatMsToClock(redMsRemaining, true);
		} else if (parsedClockMs !== null) {
			let ms = parsedClockMs;
			// Cuando FOM extrapola el reloj, restamos el tiempo transcurrido desde el último timestamp
			if (clock?.Extrapolating && clock?.Utc) {
				const clockUtcMs = parseUtcMs(clock.Utc);
				if (clockUtcMs) {
					ms = ms - Math.max(0, (currentTime || clockUtcMs) - clockUtcMs) + (delay ? delay * 1000 : 0);
				}
			}
			timeRemaining = formatMsToClock(ms, true);
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

	return (
		<div className="flex items-center gap-2.5">
			<Flag countryCode={effectiveSimActive ? "mex" : session?.Meeting?.Country?.Code} />

			<div className="flex flex-col justify-center">
				<div className="flex items-center gap-2 flex-wrap">
					<h1 className="truncate text-xs md:text-sm leading-none font-bold text-white font-mono uppercase tracking-wide">
						{effectiveSimActive ? `${translateGpName("Mexico City Grand Prix", language)} 2026` : translateGpName(session?.Meeting?.Name, language)}: {effectiveSimActive ? (language === "en" ? "Race" : language === "pt" ? "Corrida" : "Carrera") : translateSessionName(session?.Name, language)}
						{timingData?.SessionPart && session?.Name
							? ` ${sessionPartPrefix(session.Name)}${timingData.SessionPart}`
							: (isQualy ? ` Q${sessionPart}` : "")}
						{isRedFlag ? (
							<span className="text-red-500 font-black ml-1.5 animate-pulse">
								• {t("race_control.red_flag", "BANDERA ROJA")}
							</span>
						) : isQualyBreak ? (
							<span className="text-amber-400 font-black ml-1.5 animate-pulse">
								• {language === "en" ? "BREAK" : language === "pt" ? "INTERVALO" : "PAUSA"} Q{sessionPart} ➔ Q{sessionPart + 1}
							</span>
						) : isPreQualy || isPreSession ? (
							<span className="text-amber-400 font-black ml-1.5 animate-pulse">
								• {language === "en" ? "PRE-SESSION" : language === "pt" ? "PRÉ-SESSÃO" : "PREVIA"}
							</span>
						) : null}
					</h1>

					{/* 🏁 BOTÓN INTELIGENTE: INFO CIRCUITO */}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							const targetGp = effectiveSimActive ? "Gran Premio de la Ciudad de México" : (session?.Meeting?.Name || "Gran Premio");
							const targetCountry = effectiveSimActive ? "mex" : (session?.Meeting?.Country?.Code || "usa");
							openCircuit(targetGp, targetCountry);
						}}
						className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:border-amber-500/50 hover:text-amber-300 hover:bg-zinc-800 transition-all font-mono font-bold uppercase shrink-0 shadow-sm active:scale-95 cursor-pointer"
						title={t("parc_ferme.tap_to_view_circuit", "Toca para ver el circuito completo en alta resolución")}
					>
						<span>{t("sessions.circuit_info", "INFO CIRCUITO")}</span>
						<span className="text-[9px]">🏁</span>
					</button>
				</div>

				{timeRemaining !== undefined ? (
					<div className="flex items-center gap-1.5 mt-1">
						{isQualyBreak ? (
							<span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
								{nextPartName} {language === "en" ? "STARTS IN:" : language === "pt" ? "COMEÇA EM:" : "EMPIEZA EN:"}
							</span>
						) : isPreQualy ? (
							<span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
								{language === "en" ? "QUALIFYING STARTS IN:" : language === "pt" ? "CLASSIFICAÇÃO COMEÇA EM:" : "CLASIFICACIÓN EMPIEZA EN:"}
							</span>
						) : isPreSession ? (
							<span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
								{translateSessionName(session?.Name, language).toUpperCase()} {language === "en" ? "STARTS IN:" : language === "pt" ? "COMEÇA EM:" : "EMPIEZA EN:"}
							</span>
						) : null}
						<p className={clsx("text-xl md:text-2xl leading-none font-black font-mono", (isQualyBreak || isPreQualy || isPreSession) ? "text-amber-400" : "text-white")}>
							{timeRemaining}
						</p>
					</div>
				) : (
					<p className="text-xs leading-none font-bold text-zinc-400 font-mono mt-1 uppercase tracking-wider">
						{effectiveSimActive ? "Autódromo Hermanos Rodríguez" : (session?.Meeting?.Circuit?.ShortName || session?.Meeting?.Location || t("common.circuit", "Trazado Oficial"))}
					</p>
				)}
			</div>
		</div>
	);
}
