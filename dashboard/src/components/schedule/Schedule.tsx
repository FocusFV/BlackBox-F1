import { connection } from "next/server";
import { utc } from "moment";

import RoundListClient from "@/components/schedule/RoundListClient";
import type { Round as RoundType, Session as SessionType } from "@/types/schedule.type";
import localCalendar from "@/data/calendar2026.json";

export const dynamic = "force-dynamic";

// Mapeo auxiliar para normalizar los nombres de los países a tu formato
const countryNameMap: Record<string, string> = {
	"Bahrain": "Bahrain", "Saudi Arabia": "Saudi Arabia", "Australia": "Australia",
	"Japan": "Japan", "China": "China", "United States": "United States",
	"Monaco": "Monaco", "Spain": "Spain", "Austria": "Austria", "Great Britain": "Great Britain",
	"Hungary": "Hungary", "Belgium": "Belgium", "Netherlands": "Netherlands", "Italy": "Italy",
	"Azerbaijan": "Azerbaijan", "Singapore": "Singapore", "Mexico": "Mexico", "Brazil": "Brazil",
	"Qatar": "Qatar", "Abu Dhabi": "United Arab Emirates"
};

function adaptJolpicaRaces(races: any[]): RoundType[] {
	return races.map((race: any) => {
		const sessions: SessionType[] = [];

		const addSession = (name: string, obj?: { date?: string; time?: string }, durationHours: number = 1) => {
			if (!obj || !obj.date) return;
			const time = obj.time || "12:00:00Z";
			const cleanTime = time.endsWith("Z") ? time : `${time}Z`;
			const startIso = `${obj.date}T${cleanTime}`;
			const startMs = new Date(startIso).getTime();
			const endMs = startMs + durationHours * 3600 * 1000;
			sessions.push({
				kind: name,
				start: new Date(startMs).toISOString(),
				end: new Date(endMs).toISOString(),
			});
		};

		addSession("practice 1", race.FirstPractice, 1);
		addSession("practice 2", race.SecondPractice, 1);
		addSession("practice 3", race.ThirdPractice, 1);
		addSession("sprint qualification", race.SprintQualifying, 0.75);
		addSession("sprint", race.Sprint, 1);
		addSession("qualifying", race.Qualifying, 1);

		// Carrera Principal
		const raceTime = race.time || "14:00:00Z";
		const cleanRaceTime = raceTime.endsWith("Z") ? raceTime : `${raceTime}Z`;
		const raceStartIso = `${race.date}T${cleanRaceTime}`;
		const raceStartMs = new Date(raceStartIso).getTime();
		const raceEndMs = raceStartMs + 2.5 * 3600 * 1000;
		sessions.push({
			kind: "race",
			start: new Date(raceStartMs).toISOString(),
			end: new Date(raceEndMs).toISOString(),
		});

		sessions.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

		const firstStart = sessions[0]?.start || raceStartIso;
		const raceSession = sessions.find((s) => s.kind === "race");
		const endMoment = raceSession
			? utc(raceSession.end).add(6, "hours")
			: utc(firstStart).add(3, "days");
		const isOver = endMoment.isBefore(utc());

		const countryRaw = race.Circuit?.Location?.country || "F1";
		const countryNormalized = countryNameMap[countryRaw] || countryRaw;

		return {
			name: race.raceName,
			countryName: countryNormalized,
			countryKey: null,
			meetingKey: parseInt(race.round, 10) || 1,
			start: firstStart,
			end: endMoment.toISOString(),
			sessions,
			over: isOver,
		};
	}).sort((a, b) => utc(a.start).diff(utc(b.start)));
}

export const getSchedule = async (): Promise<RoundType[]> => {
	await connection();

	// 1. Intentamos traer datos de OpenF1
	try {
		const meetingsReq = await fetch("https://api.openf1.org/v1/meetings?year=2026", { 
			cache: "no-store",
			signal: AbortSignal.timeout(3000),
		}).catch(() => null);

		if (meetingsReq && meetingsReq.ok) {
			const meetings = await meetingsReq.json().catch(() => null);
			if (Array.isArray(meetings) && meetings.length > 0) {
				const sessionsReq = await fetch("https://api.openf1.org/v1/sessions?year=2026", { 
					cache: "no-store",
					signal: AbortSignal.timeout(3000),
				}).catch(() => null);

				if (sessionsReq && sessionsReq.ok) {
					const allSessions = await sessionsReq.json().catch(() => null);
					if (Array.isArray(allSessions)) {
						const adaptedSchedule: RoundType[] = meetings.map((meeting: any) => {
							const meetingSessions = allSessions.filter((s: any) => s.meeting_key === meeting.meeting_key);
							const sessions: SessionType[] = meetingSessions.map((s: any) => {
								let kind = s.session_name ? s.session_name.toLowerCase() : "";
								if (kind.includes("race") || kind === "grand prix") kind = "race";
								else if (kind.includes("qualifying")) kind = "qualifying";
								else if (kind.includes("sprint shootout") || kind.includes("sprint qual")) kind = "sprint qualification";
								else if (kind.includes("sprint")) kind = "sprint";
								else if (kind.includes("practice 1")) kind = "practice 1";
								else if (kind.includes("practice 2")) kind = "practice 2";
								else if (kind.includes("practice 3")) kind = "practice 3";

								return {
									kind,
									start: s.date_start,
									end: s.date_end
								};
							});

							const raceSession = sessions.find(s => s.kind === "race");
							const endMoment = raceSession 
								? utc(raceSession.end).add(6, 'hours') 
								: utc(meeting.date_end || meeting.date_start).add(3, 'days');
							const isOver = endMoment.isBefore(utc());

							return {
								name: meeting.official_name || meeting.meeting_name,
								countryName: countryNameMap[meeting.country_name] || meeting.country_name,
								countryKey: null,
								meetingKey: meeting.meeting_key,
								start: meeting.date_start,
								end: endMoment.toISOString(),
								sessions: sessions,
								over: isOver
							};
						});

						return adaptedSchedule.sort((a, b) => utc(a.start).diff(utc(b.start)));
					}
				}
			}
		}
	} catch (e) {
		console.warn("OpenF1 no disponible o bloqueado en sesión en vivo. Pasando a servidor secundario:", e);
	}

	// 2. Servidor secundario resiliente: Jolpica F1 / Ergast API (Sin bloqueos durante carreras)
	try {
		const jolpicaReq = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
			next: { revalidate: 3600 },
			signal: AbortSignal.timeout(4000),
		}).catch(() => null);

		if (jolpicaReq && jolpicaReq.ok) {
			const data = await jolpicaReq.json().catch(() => null);
			const races = data?.MRData?.RaceTable?.Races;
			if (Array.isArray(races) && races.length > 0) {
				return adaptJolpicaRaces(races);
			}
		}
	} catch (e) {
		console.warn("Jolpica API no respondió. Pasando a copia local offline:", e);
	}

	// 3. Respaldo definitivo offline integrado en la app: Nunca queda la pantalla en blanco
	return adaptJolpicaRaces(localCalendar as any[]);
};

export default async function Schedule() {
	const schedule = await getSchedule();

	// 🧠 Buscamos la ronda activa comparando con el endMoment corregido (+6 horas)
	const next = schedule.find((round) => {
		return utc(round.end) > utc();
	}) || schedule[schedule.length - 1];

	// Excluimos el GP destacado de la grilla de abajo
	const cleanSchedule = schedule.filter((round) => round.name !== next?.name);

	return (
		<div className="space-y-6 mb-20">
			<RoundListClient schedule={cleanSchedule} nextName={next?.name} />
		</div>
	);
}