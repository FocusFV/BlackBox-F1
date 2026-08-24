import { connection } from "next/server";
import { utc } from "moment";

import Countdown from "@/components/schedule/Countdown";
import Round from "@/components/schedule/Round";

import { env } from "@/env";
import type { Round as RoundType } from "@/types/schedule.type";

export const dynamic = "force-dynamic";

export const getScheduleBackup = async (): Promise<RoundType[] | null> => {
	try {
		// 1. Intento principal contra el backend en Rust
		if (env?.API_URL) {
			const scheduleReq = await fetch(`${env.API_URL}/api/schedule`, {
				cache: "no-store",
			});

			const contentType = scheduleReq.headers.get("content-type") || "";
			if (scheduleReq.ok && contentType.includes("application/json")) {
				const schedule: RoundType[] = await scheduleReq.json();
				if (Array.isArray(schedule) && schedule.length > 0) {
					return schedule;
				}
			}
		}

		// 2. Fallback con Jolpica/Ergast
		const fallbackRes = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
			next: { revalidate: 3600 },
		});

		if (fallbackRes.ok) {
			const data = await fallbackRes.json();
			const races = data?.MRData?.RaceTable?.Races || [];
			const now = utc();

			const mappedSchedule: RoundType[] = races.map((r: any) => {
				const raceStart = utc(`${r.date}T${r.time || "13:00:00Z"}`);
				const raceEnd = raceStart.clone().add(2, "hours");

				const sessions: { kind: string; start: string; end: string }[] = [];
				const isSprintWeekend = Boolean(r.Sprint || r.SprintQualifying || r.SprintShootout);

				if (isSprintWeekend) {
					// === FORMATO SPRINT ===
					// Viernes: Libres 1
					if (r.FirstPractice) {
						const fp1Start = utc(`${r.FirstPractice.date}T${r.FirstPractice.time || "10:30:00Z"}`);
						sessions.push({
							kind: "Practice 1",
							start: fp1Start.toISOString(),
							end: fp1Start.clone().add(1, "hour").toISOString(),
						});
					}

					// Viernes: Clasificación Sprint (Shootout)
					const sqObj = r.SprintQualifying || r.SprintShootout || r.SecondPractice;
					if (sqObj) {
						const sqStart = utc(`${sqObj.date}T${sqObj.time || "14:30:00Z"}`);
						sessions.push({
							kind: "Sprint Shootout", // Nombre único para evitar colisión con Qualifying
							start: sqStart.toISOString(),
							end: sqStart.clone().add(44, "minutes").toISOString(),
						});
					}

					// Sábado: Carrera Sprint
					if (r.Sprint) {
						const sprintStart = utc(`${r.Sprint.date}T${r.Sprint.time || "10:30:00Z"}`);
						sessions.push({
							kind: "Sprint",
							start: sprintStart.toISOString(),
							end: sprintStart.clone().add(1, "hour").toISOString(),
						});
					}

					// Sábado: Clasificación Principal
					if (r.Qualifying) {
						const qualyStart = utc(`${r.Qualifying.date}T${r.Qualifying.time || "14:00:00Z"}`);
						sessions.push({
							kind: "Qualifying",
							start: qualyStart.toISOString(),
							end: qualyStart.clone().add(1, "hour").toISOString(),
						});
					}
				} else {
					// === FORMATO TRADICIONAL ===
					if (r.FirstPractice) {
						const fp1Start = utc(`${r.FirstPractice.date}T${r.FirstPractice.time || "10:30:00Z"}`);
						sessions.push({
							kind: "Practice 1",
							start: fp1Start.toISOString(),
							end: fp1Start.clone().add(1, "hour").toISOString(),
						});
					}

					if (r.SecondPractice) {
						const fp2Start = utc(`${r.SecondPractice.date}T${r.SecondPractice.time || "14:00:00Z"}`);
						sessions.push({
							kind: "Practice 2",
							start: fp2Start.toISOString(),
							end: fp2Start.clone().add(1, "hour").toISOString(),
						});
					}

					if (r.ThirdPractice) {
						const fp3Start = utc(`${r.ThirdPractice.date}T${r.ThirdPractice.time || "10:30:00Z"}`);
						sessions.push({
							kind: "Practice 3",
							start: fp3Start.toISOString(),
							end: fp3Start.clone().add(1, "hour").toISOString(),
						});
					}

					if (r.Qualifying) {
						const qualyStart = utc(`${r.Qualifying.date}T${r.Qualifying.time || "14:00:00Z"}`);
						sessions.push({
							kind: "Qualifying",
							start: qualyStart.toISOString(),
							end: qualyStart.clone().add(1, "hour").toISOString(),
						});
					}
				}

				// Domingo: Carrera
				sessions.push({
					kind: "Race",
					start: raceStart.toISOString(),
					end: raceEnd.toISOString(),
				});

				// Orden cronológico estricto
				sessions.sort((a, b) => utc(a.start).diff(utc(b.start)));

				return {
					name: r.raceName.replace("Grand Prix", "GP").trim(),
					countryName: r.Circuit?.Location?.country || "",
					countryKey: null,
					start: sessions[0]?.start || raceStart.toISOString(),
					end: raceEnd.toISOString(),
					sessions,
					over: raceEnd < now,
				};
			});

			return mappedSchedule;
		}

		return null;
	} catch (e) {
		console.error("Error fetching schedule backup:", e);
		return null;
	}
};

export default async function NextRound() {
	await connection();
	const schedule = await getScheduleBackup();

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
				<p className="text-zinc-500 font-medium tracking-wide">No se encontraron próximas sesiones</p>
			</div>
		);
	}

	const nextSession = next.sessions.find((s) => utc(s.start) > utc() && s.kind.toLowerCase() !== "race");

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