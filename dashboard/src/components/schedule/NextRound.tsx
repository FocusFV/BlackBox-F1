import { connection } from "next/server";
import { utc } from "moment";

import Countdown from "@/components/schedule/Countdown";
import Round from "@/components/schedule/Round";
import { getSchedule } from "@/components/schedule/Schedule";
import type { Round as RoundType } from "@/types/schedule.type";

export const dynamic = "force-dynamic";

export default async function NextRound() {
	await connection();
	const schedule = await getSchedule();

	if (!schedule || schedule.length === 0) {
		return (
			<div className="flex h-44 flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
				<p className="text-zinc-500 font-medium tracking-wide">No se encontró ningún próximo evento de F1</p>
			</div>
		);
	}

	const next =
		schedule.find((round) => {
			const raceSession = round.sessions.find((s) => s.kind.toLowerCase() === "race");
			const endTime = raceSession ? utc(raceSession.end) : utc(round.end).endOf("day");
			return endTime > utc();
		}) || schedule.filter((round) => !round.over)[0];

	if (!next) {
		return (
			<div className="flex h-44 flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
				<p className="text-zinc-500 font-medium tracking-wide">No upcoming sessions · Sin próximas sesiones</p>
			</div>
		);
	}

	const nextSession =
		next.sessions.find((s) => utc(s.end) > utc() && s.kind.toLowerCase() !== "race") ||
		next.sessions.find((s) => utc(s.start) > utc() && s.kind.toLowerCase() !== "race");

	const finalRaceSession =
		next.sessions.find((s) => s.kind.toLowerCase() === "race") || {
			start: next.start,
			end: next.end,
			kind: "Race",
		};

	const isRaceOver = utc(finalRaceSession.end) < utc();

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			{!isRaceOver ? (
				<div className="flex flex-col gap-5 justify-center bg-gradient-to-b from-zinc-900 via-neutral-950 to-black p-6 rounded-2xl border border-zinc-800/60 shadow-xl transition-all duration-300 hover:border-amber-500/30">
					{nextSession && <Countdown next={nextSession} type="other" eventName={next.name} />}
					{finalRaceSession && <Countdown next={finalRaceSession} type="race" countryName={next.countryName} eventName={next.name} />}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-6 rounded-2xl border border-zinc-800/60">
					<p className="text-zinc-500 font-medium tracking-wide">No upcoming sessions · Sin próximas sesiones</p>
				</div>
			)}

			<Round round={next} nextName={next.name} />
		</div>
	);
}