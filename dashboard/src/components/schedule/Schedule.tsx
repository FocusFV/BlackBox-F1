import { connection } from "next/server";
import { utc } from "moment";

import RoundListClient from "@/components/schedule/RoundListClient";
import type { Round as RoundType, Session as SessionType } from "@/types/schedule.type";
import localCalendar from "@/data/calendar2026.json";

export const dynamic = "force-dynamic";

// Mapeo auxiliar para normalizar los nombres de los países a tu formato
const countryNameMap: Record<string, string> = {
	"Bahrain": "Bahrain", "Saudi Arabia": "Saudi Arabia", "Australia": "Australia",
	"Japan": "Japan", "China": "China", "United States": "United States", "USA": "United States",
	"Monaco": "Monaco", "Spain": "Spain", "Austria": "Austria", "Great Britain": "Great Britain", "UK": "Great Britain",
	"Hungary": "Hungary", "Belgium": "Belgium", "Netherlands": "Netherlands", "Italy": "Italy",
	"Azerbaijan": "Azerbaijan", "Singapore": "Singapore", "Mexico": "Mexico", "Brazil": "Brazil",
	"Qatar": "Qatar", "Abu Dhabi": "United Arab Emirates", "UAE": "United Arab Emirates",
	"United Arab Emirates": "United Arab Emirates", "Malaysia": "Malaysia"
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

		const isMalaysia = String(race.round) === "16" || race.Circuit?.circuitId === "sepang" || (race.raceName || "").toLowerCase().includes("malaysia");
		const cleanName = isMalaysia ? "Malaysian Grand Prix" : race.raceName;
		const cleanCountry = isMalaysia ? "Malaysia" : countryNormalized;

		return {
			name: cleanName,
			countryName: cleanCountry,
			countryKey: null,
			roundNumber: parseInt(race.round, 10) || 1,
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

	// 🏁 Calendario oficial definitivo de la temporada 2026: 23 Grandes Premios homologados
	// R1 a R20 completadas (incluye Sepang R16 e Interlagos R20) · 3 por disputar (Las Vegas R21, Qatar R22, Abu Dabi R23)
	return adaptJolpicaRaces(localCalendar as any[]);
};

export default async function Schedule() {
	const schedule = await getSchedule();

	// 🧠 Buscamos la ronda activa comparando con el endMoment corregido (+6 horas)
	const next = schedule.find((round) => {
		return utc(round.end) > utc();
	}) || schedule[schedule.length - 1];

	// Mostramos todas las rondas oficiales del campeonato (23 rondas completas)
	const cleanSchedule = schedule;

	return (
		<div className="space-y-6 mb-20">
			<RoundListClient schedule={cleanSchedule} nextName={next?.name} />
		</div>
	);
}