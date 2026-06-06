"use client";

import { useState, useEffect } from "react";
import { now, utc } from "moment";
import clsx from "clsx";

import { groupSessionByDay } from "@/lib/groupSessionByDay";
import type { Session } from "@/types/schedule.type";

type Props = {
	sessions: Session[];
};

const dayTranslation: Record<string, string> = {
	monday: "Lunes",
	tuesday: "Martes",
	wednesday: "Miércoles",
	thursday: "Jueves",
	friday: "Viernes",
	saturday: "Sábado",
	sunday: "Domingo",
};

export default function WeekendSchedule({ sessions }: Props) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="grid grid-cols-3 gap-6 pt-4">
			{groupSessionByDay(sessions).map((day, i) => {
				const dayNameEnglish = utc(day.date).format("dddd").toLowerCase();

				return (
					<div className="flex flex-col border-r border-zinc-900/60 last:border-0 pr-2 last:pr-0" key={`next.round.day.${i}`}>
						{/* Nombre del Día */}
						<p className="text-xs font-black uppercase tracking-widest text-zinc-500">
							{mounted ? (dayTranslation[dayNameEnglish] || dayNameEnglish) : "..."}
						</p>

						{/* Lista de Sesiones */}
						<div className="flex flex-col gap-3.5 mt-2.5">
							{day.sessions.map((session, j) => {
								const isPast = utc(session.end).isBefore(now());

								return (
									<div
										className={clsx("flex flex-col transition-opacity duration-200", isPast && "opacity-30")}
										key={`next.round.day.${i}.session.${j}`}
									>
										{/* Tipo de Sesión */}
										<p className="w-28 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold text-neutral-300 sm:w-auto uppercase tracking-wide">
											{(() => {
												const kind = session.kind.toLowerCase();
												if (kind === "race") return "Carrera";
												if (kind === "qualifying") return "Clasificación";
												if (kind === "sprint" || kind === "sprint race") return "Carrera Sprint";
												if (kind === "sprint qualification" || kind === "sprint shootout") return "Clasif. Sprint";
												if (kind === "practice 1") return "Libres 1";
												if (kind === "practice 2") return "Libres 2";
												if (kind === "practice 3") return "Libres 3";
												return session.kind;
											})()}
										</p>

										{/* Horario */}
										<p className="text-[11px] text-amber-400/80 font-mono mt-0.5" suppressHydrationWarning>
											{mounted 
												? `${utc(session.start).local().format("HH:mm")} - ${utc(session.end).local().format("HH:mm")}`
												: "--:-- - --:--"
											}
										</p>
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}