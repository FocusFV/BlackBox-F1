"use client";

import { useState, useEffect } from "react";
import { utc } from "moment";
import clsx from "clsx";
import { AnimatePresence } from "motion/react";
import { LayoutDashboard } from "lucide-react";

import type { Round as RoundType } from "@/types/schedule.type";
import { groupSessionByDay } from "@/lib/groupSessionByDay";
import { formatDayRange, formatMonth } from "@/lib/dateFormatter";
import Flag from "@/components/Flag";
import ResultsModal from "@/components/schedule/ResultsModal";

type Props = {
	round: RoundType;
	nextName?: string;
	hideBadge?: boolean; // 🌟 Nueva propiedad añadida
};

const countryCodeMap: Record<string, string> = {
	Australia: "aus", Austria: "aut", Azerbaijan: "aze", Bahrain: "brn",
	Belgium: "bel", Brazil: "bra", Canada: "can", China: "chn", Spain: "esp",
	France: "fra", "Great Britain": "gbr", "United Kingdom": "gbr", Germany: "ger",
	Hungary: "hun", Italy: "ita", Japan: "jpn", "Saudi Arabia": "ksa",
	Mexico: "mex", Monaco: "mon", Netherlands: "ned", Portugal: "por",
	Qatar: "qat", Singapore: "sgp", "United Arab Emirates": "uae", "United States": "usa",
};

const countryTranslation: Record<string, string> = {
	Australia: "Australia", Austria: "Austria", Azerbaijan: "Azerbaiyán", Bahrain: "Bahréin",
	Belgium: "Bélgica", Brazil: "Brasil", Canada: "Canadá", China: "China", Spain: "España",
	France: "Francia", "Great Britain": "Gran Bretaña", "United Kingdom": "Reino Unido",
	Germany: "Alemania", Hungary: "Hungría", Italy: "Italia", Japan: "Japón",
	"Saudi Arabia": "Arabia Saudita", Mexico: "México", Monaco: "Mónaco", Netherlands: "Países Bajos",
	Portugal: "Portugal", Qatar: "Catar", Singapore: "Singapur", "United Arab Emirates": "Emiratos Árabes Unidos",
	"United States": "Estados Unidos",
};

const dayTranslation: Record<string, string> = {
	monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles", thursday: "Jueves",
	friday: "Viernes", saturday: "Sábado", sunday: "Domingo",
};

export default function Round({ round, nextName, hideBadge = false }: Props) {
	const [mounted, setMounted] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	
	const countryCode = countryCodeMap[round.countryName];
	const translatedCountry = countryTranslation[round.countryName] || round.countryName;

	useEffect(() => {
		setMounted(true);
	}, []);

	const raceSession = round.sessions.find((s) => s.kind.toLowerCase() === "race");
	const isRoundOver = raceSession 
		? utc(raceSession.end).isBefore(utc()) 
		: utc(round.end).endOf("day").isBefore(utc());

	const upcomingSession = round.sessions.filter((s) => utc(s.start) > utc())[0];

	return (
		<div 
			className={clsx(
				"bg-gradient-to-b from-zinc-900 via-neutral-950 to-black p-6 rounded-2xl border border-zinc-800/60 transition-all duration-300 shadow-xl h-full select-none font-mono flex flex-col justify-between gap-5",
				"hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)]"
			)}
		>
			{/* Cabecera */}
			<div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2.5">
						<Flag countryCode={countryCode} className="h-5 w-8 rounded-sm object-cover shadow-md brightness-90 border border-zinc-800" />
						<p className="text-sm font-extrabold tracking-tight text-neutral-100 uppercase">{translatedCountry}</p>
					</div>
					
					{/* 🛠️ Bloque de control dinámico: Solo dibuja el badge si hideBadge es false */}
					{round.name === nextName && !hideBadge && (
						<>
							{utc().isBetween(utc(round.start), utc(round.end).endOf("day")) ? (
								<span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20 animate-pulse">
									● En Vivo
								</span>
							) : (
								<span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
									Próximo
								</span>
							)}
						</>
					)}
					{isRoundOver && (
						<span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-800/40">
							Terminado
						</span>
					)}
				</div>

				<div className="flex flex-col items-end gap-0.5">
					<p className="text-xs font-black uppercase tracking-wider text-amber-500">
						{mounted ? formatMonth(round.start, round.end) : "..."}
					</p>
					<p className="text-[11px] font-medium text-zinc-500">
						{mounted ? formatDayRange(round.start, round.end) : "..."}
					</p>
				</div>
			</div>

			{/* Contenido Dinámico */}
			<div className="flex-1 flex flex-col justify-center">
				{!isRoundOver ? (
					<div className="grid grid-cols-3 gap-4">
						{groupSessionByDay(round.sessions).map((day, i) => {
							const dayNameEnglish = utc(day.date).format("dddd").toLowerCase();
							
							return (
								<div className="flex flex-col border-r border-zinc-900/40 last:border-0 pr-2 last:pr-0" key={`round.day.${i}`}>
									<p className="my-1 text-[10px] font-extrabold uppercase tracking-widest text-zinc-600">
										// {mounted ? (dayTranslation[dayNameEnglish] || dayNameEnglish) : "..."}
									</p>

									<div className="flex flex-col gap-3 mt-1.5">
										{day.sessions.map((session, j) => {
											const isNextTarget = upcomingSession && upcomingSession.start === session.start && upcomingSession.kind === session.kind;
											
											return (
												<div
													key={`round.day.${i}.session.${j}`}
													className={clsx(
														"flex flex-col transition-all duration-200 rounded-xl", 
														isNextTarget && "bg-amber-500/5 border border-amber-500/25 p-2 -mx-2 shadow-inner"
													)}
												>
													<p className={clsx(
														"w-24 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] sm:w-auto uppercase tracking-wide",
														isNextTarget ? "font-black text-amber-400" : "font-bold text-neutral-400"
													)}>
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

													<div className="flex items-center justify-between gap-1 mt-0.5">
														<p className="text-[10px] font-mono text-amber-400" suppressHydrationWarning>
															{mounted ? `${utc(session.start).local().format("HH:mm")}` : "--:--"}
														</p>
														{isNextTarget && (
															<span className="text-[8px] font-black tracking-wider text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20 animate-pulse">
																BOX
															</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="py-2">
						<button 
							onClick={() => setModalOpen(true)}
							className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/30 text-xs font-black text-amber-500 uppercase tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer group"
						>
							<LayoutDashboard className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-12 duration-300" />
							// Ver Archivo de Resultados
						</button>
					</div>
				)}
			</div>

			<AnimatePresence>
				{modalOpen && (
					<ResultsModal 
						meetingKey={round.meetingKey} 
						raceName={round.name} 
						onClose={() => setModalOpen(false)} 
					/>
				)}
			</AnimatePresence>
		</div>
	);
}