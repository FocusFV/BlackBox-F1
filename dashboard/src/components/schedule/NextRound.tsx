import { connection } from "next/server";
import { utc } from "moment";

import Countdown from "@/components/schedule/Countdown";
import Round from "@/components/schedule/Round";

import { env } from "@/env";
import type { Round as RoundType } from "@/types/schedule.type";

export const getNext = async () => {
	await connection();

	try {
		const nextReq = await fetch(`${env.API_URL}/api/schedule/next`, {
			cache: "no-store",
		});
		const next: RoundType = await nextReq.json();

		return next;
	} catch (e) {
		console.error("error fetching next round", e);
		return null;
	}
};

export default async function NextRound() {
	const next = await getNext();

	if (!next) {
		return (
			<div className="flex h-44 flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
				<p className="text-zinc-500 font-medium tracking-wide">No se encontró ningún próximo evento de F1</p>
			</div>
		);
	}

	// FIX CLAVE: Comparamos en base a UTC estricto para no saltear eventos activos
	const nextSession = next.sessions.filter((s) => utc(s.start) > utc() && s.kind.toLowerCase() !== "race")[0];
	
	// FIX CLAVE: Solo tomamos la carrera si su tiempo de finalización no ha pasado en UTC
	const nextRace = next.sessions.find((s) => s.kind.toLowerCase() === "race" && utc(s.end) > utc());

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			{nextSession || nextRace ? (
				<div className="flex flex-col gap-5 justify-center bg-gradient-to-b from-zinc-900 via-neutral-950 to-black p-6 rounded-2xl border border-zinc-800/60 shadow-xl transition-all duration-300 hover:border-amber-500/30">
					{nextSession && <Countdown next={nextSession} type="other" />}
					{nextRace && <Countdown next={nextRace} type="race" countryName={next.countryName} />}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-6 rounded-2xl border border-zinc-800/60">
					<p className="text-zinc-500 font-medium tracking-wide">No se encontraron próximas sesiones</p>
				</div>
			)}

			<Round round={next} />
		</div>
	);
}