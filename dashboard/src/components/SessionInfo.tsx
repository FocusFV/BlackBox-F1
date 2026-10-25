"use client";

import { useState, useEffect } from "react";
import { utc, duration } from "moment";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import Flag from "@/components/Flag";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";

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

const countryCodeMap: Record<string, string> = {
	Australia: "aus", Austria: "aut", Azerbaijan: "aze", Bahrain: "brn",
	Belgium: "bel", Brazil: "bra", Canada: "can", China: "chn", Spain: "esp",
	France: "fra", "Great Britain": "gbr", "United Kingdom": "gbr", Germany: "ger",
	Hungary: "hun", Italy: "ita", Japan: "jpn", "Saudi Arabia": "ksa",
	Mexico: "mex", Monaco: "mon", Netherlands: "ned", Portugal: "por",
	Qatar: "qat", Singapore: "sgp", "United Arab Emirates": "uae", "United States": "usa",
	USA: "usa", UK: "gbr"
};

export default function SessionInfo() {
	const clock = useDataStore((state) => state.state?.ExtrapolatedClock);
	const session = useDataStore((state) => state.state?.SessionInfo);
	const timingData = useDataStore((state) => state.state?.TimingData);
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);
	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);

	const delay = useSettingsStore((state) => state.delay);

	// Detectar si estamos fuera de sesión / parque cerrado
	const isOfflineOrFinished = 
		!session || 
		!trackStatus ||
		sessionStatus === "Ends" || 
		sessionStatus === "Finalised" || 
		(session?.Name === "Race" && !!lapCount && lapCount.CurrentLap > 0 && lapCount.CurrentLap >= lapCount.TotalLaps);

	const [nextGpName, setNextGpName] = useState("Próximo Gran Premio");
	const [nextSessionName, setNextSessionName] = useState("Sesión Oficial");
	const [countdown, setCountdown] = useState("00:00:00");
	const [countryCode, setCountryCode] = useState<string | undefined>("mex");

	// Obtener la próxima carrera y calcular el contador
	useEffect(() => {
		if (!isOfflineOrFinished) return;

		let targetDate: Date | null = null;
		let intervalId: any = null;

		async function fetchNextSchedule() {
			try {
				const res = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json");
				const data = await res.json();

				if (data.MRData?.RaceTable?.Races?.length > 0) {
					const nextRace = data.MRData.RaceTable.Races[0];
					setNextGpName(translateGpName(nextRace.raceName));

					const countryRaw = nextRace.Circuit?.Location?.country || "";
					setCountryCode(getCountryCodeForGp(nextRace.raceName, countryRaw));

					const now = new Date().getTime();
					const sessionsToCheck = [
						{ name: "Práctica 1", date: nextRace.FirstPractice?.date, time: nextRace.FirstPractice?.time },
						{ name: "Clasificación", date: nextRace.Qualifying?.date, time: nextRace.Qualifying?.time },
						{ name: "Sprint", date: nextRace.Sprint?.date, time: nextRace.Sprint?.time },
						{ name: "Gran Premio", date: nextRace.date, time: nextRace.time },
					];

					let closestSession = sessionsToCheck.find((s) => s.date && new Date(`${s.date}T${s.time || "12:00:00Z"}`).getTime() > now);
					if (!closestSession) {
						closestSession = { name: "Gran Premio", date: nextRace.date, time: nextRace.time };
					}

					setNextSessionName(closestSession.name);
					targetDate = new Date(`${closestSession.date}T${closestSession.time || "13:00:00Z"}`);
				}
			} catch {
				const d = new Date();
				d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
				d.setHours(14, 0, 0, 0);
				targetDate = d;
			}

			intervalId = setInterval(() => {
				if (!targetDate) return;
				const difference = targetDate.getTime() - new Date().getTime();

				if (difference <= 0) {
					setCountdown("00:00:00");
					return;
				}

				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);

				const pad = (n: number) => n.toString().padStart(2, "0");
				const formatted = days > 0
					? `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
					: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

				setCountdown(formatted);
			}, 1000);
		}

		fetchNextSchedule();

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [isOfflineOrFinished]);

	// Render fuera de sesión (diseño con bandera oficial y estilo Pit-Wall)
	if (isOfflineOrFinished) {
		return (
			<div className="flex items-center gap-3">
				{/* Banderita del país del próximo GP */}
				<div className="flex items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5 shadow-md shrink-0">
					<Flag countryCode={countryCode || "mex"} className="h-6 w-9 object-cover rounded-md" />
				</div>

				<div className="flex flex-col justify-center">
					<div className="flex items-center gap-2">
						<span className="truncate text-xs leading-none font-bold text-amber-400 uppercase tracking-widest font-mono">
							{nextGpName}
						</span>
						<span className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
							{nextSessionName}
						</span>
					</div>
					<p className="text-xl md:text-2xl leading-none font-black text-zinc-100 font-mono tracking-wider mt-1.5">
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
		<div className="flex items-center gap-2">
			<Flag countryCode={session?.Meeting?.Country?.Code} />

			<div className="flex flex-col justify-center">
				<h1 className="truncate text-sm leading-none font-medium text-white">
					{session.Meeting?.Name}: {session.Name ?? "En Vivo"}
					{timingData?.SessionPart ? ` ${sessionPartPrefix(session.Name)}${timingData.SessionPart}` : ""}
				</h1>

				{timeRemaining !== undefined ? (
					<p className="text-2xl leading-none font-extrabold">{timeRemaining}</p>
				) : (
					<div className="mt-1 h-6 w-[150px] animate-pulse rounded-md bg-zinc-800 font-semibold" />
				)}
			</div>
		</div>
	);
}