import { connection } from "next/server";
import { utc } from "moment";

import RoundListClient from "@/components/schedule/RoundListClient";
import type { Round as RoundType, Session as SessionType } from "@/types/schedule.type";

export const dynamic = "force-dynamic";

// Mapeo auxiliar para normalizar los nombres de los países de OpenF1 a tu formato
const countryNameMap: Record<string, string> = {
	"Bahrain": "Bahrain", "Saudi Arabia": "Saudi Arabia", "Australia": "Australia",
	"Japan": "Japan", "China": "China", "United States": "United States",
	"Monaco": "Monaco", "Spain": "Spain", "Austria": "Austria", "Great Britain": "Great Britain",
	"Hungary": "Hungary", "Belgium": "Belgium", "Netherlands": "Netherlands", "Italy": "Italy",
	"Azerbaijan": "Azerbaijan", "Singapore": "Singapore", "Mexico": "Mexico", "Brazil": "Brazil",
	"Qatar": "Qatar", "Abu Dhabi": "United Arab Emirates"
};

export const getScheduleFromOpenF1 = async (): Promise<RoundType[] | null> => {
	await connection();

	try {
		// 1. Traemos todos los eventos (meetings) de la temporada de OpenF1
		const meetingsReq = await fetch("https://api.openf1.org/v1/meetings?year=2026", { cache: "no-store" });
		const meetings = await meetingsReq.json();

		// 2. Traemos todas las sesiones para agruparlas
		const sessionsReq = await fetch("https://api.openf1.org/v1/sessions?year=2026", { cache: "no-store" });
		const allSessions = await sessionsReq.json();

		if (!Array.isArray(meetings) || !Array.isArray(allSessions)) return null;

		// 3. Adaptamos la data cruda al formato estricto de tu RoundType
		const adaptedSchedule: RoundType[] = meetings.map((meeting: any) => {
			// Filtramos las sesiones que pertenecen a este GP usando el meeting_key
			const meetingSessions = allSessions.filter((s: any) => s.meeting_key === meeting.meeting_key);

			// Moldeamos las sesiones al formato de tu app
			const sessions: SessionType[] = meetingSessions.map((s: any) => {
				let kind = s.session_name ? s.session_name.toLowerCase() : "";
				
				// Normalizamos los nombres de las sesiones para tu lógica interna
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

			// Buscamos la sesión de carrera
			const raceSession = sessions.find(s => s.kind === "race");
			
			// 🎯 FIX DE HORARIO / VENTANA DE FIN DE SEMANA:
			// Agregamos un margen de 6 horas después del final de la carrera para mantener vivo el GP durante el post-carrera
			const endMoment = raceSession 
				? utc(raceSession.end).add(6, 'hours') 
				: utc(meeting.date_end || meeting.date_start).add(3, 'days');
			
			// Se da por finalizado solo si ya pasó la ventana de post-carrera
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

	} catch (e) {
		console.error("Error adaptando la API de OpenF1:", e);
		return null;
	}
};

export default async function Schedule() {
	const schedule = await getScheduleFromOpenF1();

	if (!schedule || schedule.length === 0) {
		return (
			<div className="flex h-44 items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30 font-mono text-xs">
				<p className="text-zinc-400">// NO SE PUDO CONECTAR CON EL SATÉLITE DE OPENF1</p>
			</div>
		);
	}

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