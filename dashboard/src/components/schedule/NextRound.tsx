import { connection } from "next/server";
import { utc } from "moment";

import Countdown from "@/components/schedule/Countdown";
import Round from "@/components/schedule/Round";

import { env } from "@/env";
import type { Round as RoundType } from "@/types/schedule.type";

// LINEA MÁGICA DE CONTROL: Obliga a Vercel a ejecutar este archivo en vivo en cada visita
export const dynamic = "force-dynamic";

// Traemos el calendario completo para rescatar la carrera real
export const getScheduleBackup = async () => {
	try {
		const scheduleReq = await fetch(`${env.API_URL}/api/schedule`, {
			cache: "no-store", // Evita la caché a nivel fetch
		});
		const schedule: RoundType[] = await scheduleReq.json();
		return schedule;
	} catch (e) {
		console.error("error fetching schedule backup", e);
		return null;
	}
};

export default async function NextRound() {
	await connection();
	const schedule = await getScheduleBackup();

	if (!schedule) {
		return (
			<div className="flex h-44 flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
				<p className="text-zinc-500 font-medium tracking-wide">No se encontró ningún próximo evento de F1</p>
			</div>
		);
	}

	// BYPASS: Buscamos en el calendario completo cuál es la primera ronda activa
	const next = schedule.find((round) => {
		const raceSession = round.sessions.find((s) => s.kind.toLowerCase() === "race");
		const endTime = raceSession ? utc(raceSession.end) : utc(round.end).endOf("day");
		return endTime > utc();
	}) || schedule.filter((round) => !round.over)[0];

	if (!next) {
		return (
			<div className="flex h-44 flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
				<p className="text-zinc-500 font-medium tracking-wide">No se encontraron próximas sesiones</p>
			</div>
		);
	}

	const nextSession = next.sessions.filter((s) => utc(s.start) > utc() && s.kind.toLowerCase() !== "race")[0];

	const nextRace = next.sessions.find((s) => s.kind.toLowerCase() === "race") || 
					 { start: next.end, end: next.end, kind: "race" };

	const finalRaceSession = next.sessions.find((s) => s.kind.toLowerCase() === "race") 
		? next.sessions.find((s) => s.kind.toLowerCase() === "race")!
		: { start: next.start, end: next.end, kind: "race" };

	const isRaceOver = utc(finalRaceSession.end) < utc();

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			{!isRaceOver ? (
				<div className="flex flex-col gap-5 justify-center bg-gradient-to-b from-zinc-900 via-neutral-950 to-black p-6 rounded-2xl border border-zinc-800/60 shadow-xl transition-all duration-300 hover:border-amber-500/30">
					{nextSession && <Countdown next={nextSession} type="other" />}
					{finalRaceSession && <Countdown next={finalRaceSession} type="race" countryName={next.countryName} />}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-6 rounded-2xl border border-zinc-800/60">
					<p className="text-zinc-500 font-medium tracking-wide">No se encontraron próximas sesiones</p>
				</div>
			)}

			<Round round={next} nextName={next.name} />
		</div>
	);
}