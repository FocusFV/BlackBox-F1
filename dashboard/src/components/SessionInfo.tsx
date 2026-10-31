"use client";

import { useState, useEffect } from "react";
import { utc, duration } from "moment";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Flag from "@/components/Flag";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";

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

	const delay = useSettingsStore((state) => state.delay);

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
		Date.now() - sessionEndTime < 15 * 60 * 1000
	);

	// Detecta actividad real de telemetría en pista
	const hasActiveTiming = Boolean(
		timingData?.Lines &&
		Object.values(timingData.Lines).some((line: any) => Boolean(line?.LastLapTime?.Value || line?.BestLapTime?.Value))
	);

	const isLive = Boolean(
		session &&
		!isSessionTerminated &&
		(
			sessionStatus === "Started" ||
			sessionStatus === "Running" ||
			sessionStatus === "PitsOpen" ||
			sessionStatus === "StartedOnTime" ||
			(clock && Boolean(clock.Remaining)) ||
			(hasActiveTiming && sessionStatus !== "Ends" && sessionStatus !== "Finalised")
		) &&
		!(session?.Name === "Race" && !!lapCount && lapCount.CurrentLap > 0 && lapCount.CurrentLap >= lapCount.TotalLaps)
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

					const closestSession =
						validSessions.find((s) => s.dt.getTime() > now) ||
						validSessions[validSessions.length - 1];

					if (closestSession) {
						setNextSessionName(closestSession.name);
						targetDate = closestSession.dt;
						setCountdown(calcCountdown(targetDate));
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
	const timeRemaining =
		!!clock && !!clock.Remaining
			? clock.Extrapolating
				? utc(
						duration(clock.Remaining)
							.subtract(utc().diff(utc(clock.Utc)))
							.asMilliseconds() + (delay ? delay * 1000 : 0),
					).format("HH:mm:ss")
				: clock.Remaining
			: undefined;

	return (
		<div className="flex items-center gap-2.5">
			<Flag countryCode={session?.Meeting?.Country?.Code} />

			<div className="flex flex-col justify-center">
				<h1 className="truncate text-xs md:text-sm leading-none font-bold text-white font-mono uppercase tracking-wide">
					{session?.Meeting?.Name}: {translateSessionName(session?.Name)}
					{timingData?.SessionPart && session?.Name ? ` ${sessionPartPrefix(session.Name)}${timingData.SessionPart}` : ""}
				</h1>

				{timeRemaining !== undefined ? (
					<p className="text-xl md:text-2xl leading-none font-black text-white font-mono mt-1">{timeRemaining}</p>
				) : (
					<p className="text-xs leading-none font-bold text-zinc-400 font-mono mt-1 uppercase tracking-wider">
						{session?.Meeting?.Circuit?.ShortName || session?.Meeting?.Location || "Trazado Oficial"}
					</p>
				)}
			</div>
		</div>
	);
}
