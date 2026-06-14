import { connection } from "next/server";
import { utc } from "moment";

import Round from "@/components/schedule/Round";
import type { Round as RoundType } from "@/types/schedule.type";
import { env } from "@/env";

export const getSchedule = async () => {
	await connection();

	try {
		const scheduleReq = await fetch(`${env.API_URL}/api/schedule`, {
			cache: "no-store",
		});
		const schedule: RoundType[] = await scheduleReq.json();

		return schedule;
	} catch (e) {
		console.error("error fetching schedule", e);
		return null;
	}
};

export default async function Schedule() {
	const schedule = await getSchedule();

	if (!schedule) {
		return (
			<div className="flex h-44 items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
				<p className="text-zinc-400">No se pudo cargar el calendario de carreras</p>
			</div>
		);
	}

	// FIX DEFINITIVO: Buscamos el próximo basándonos en la fecha real de la carrera en UTC, no en el flag "over" de la API
	const next = schedule.find((round) => {
		const raceSession = round.sessions.find((s) => s.kind.toLowerCase() === "race");
		return raceSession ? utc(raceSession.end) > utc() : !round.over;
	}) || schedule.filter((round) => !round.over)[0];

	return (
		<div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2">
			{schedule.map((round, roundI) => (
				<Round nextName={next?.name} round={round} key={`round.${roundI}`} />
			))}
		</div>
	);
}