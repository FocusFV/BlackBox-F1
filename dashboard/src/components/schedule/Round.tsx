"use client";

import { useState, useEffect, useId } from "react";
import { utc } from "moment";
import clsx from "clsx";
import { AnimatePresence } from "motion/react";
import {
	LayoutDashboard,
	Radio,
	Activity,
	Gauge,
	ChevronRight,
	Timer,
	Flame,
} from "lucide-react";

import type { Round as RoundType } from "@/types/schedule.type";
import { groupSessionByDay } from "@/lib/groupSessionByDay";
import { formatDayRange, formatMonth } from "@/lib/dateFormatter";
import Flag from "@/components/Flag";
import ResultsModal from "@/components/schedule/ResultsModal";

type Props = {
	round: RoundType;
	nextName?: string;
	hideBadge?: boolean;
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
	monday: "LUNES", tuesday: "MARTES", wednesday: "MIÉRCOLES", thursday: "JUEVES",
	friday: "VIERNES", saturday: "SÁBADO", sunday: "DOMINGO",
};

export default function Round({ round, nextName, hideBadge = false }: Props) {
	const [mounted, setMounted] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const patternId = useId();

	const countryCode = countryCodeMap[round.countryName];
	const translatedCountry = countryTranslation[round.countryName] || round.countryName;

	useEffect(() => {
		setMounted(true);
	}, []);

	const raceSession = round.sessions.find((s) => s.kind.toLowerCase() === "race");
	const isRoundOver = raceSession
		? utc(raceSession.end).isBefore(utc())
		: utc(round.end).endOf("day").isBefore(utc());

	const isTargetRound = nextName ? round.name === nextName : !hideBadge;
	const isLiveNow = utc().isBetween(utc(round.start), utc(round.end).endOf("day"));

	const upcomingSession = isTargetRound
		? round.sessions.filter((s) => utc(s.start) > utc())[0]
		: undefined;

	const hasSprint = round.sessions.some((s) => s.kind.toLowerCase().includes("sprint"));

	return (
		<div
			className={clsx(
				"group/card relative overflow-hidden rounded-3xl border font-mono select-none flex flex-col justify-between p-5 sm:p-6 transition-all duration-500",
				isTargetRound
					? "border-amber-500/40 bg-zinc-950/95 shadow-[0_0_35px_rgba(245,158,11,0.08)] ring-1 ring-amber-500/20"
					: "border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-black hover:border-zinc-700 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
			)}
		>
			{/* FIBRA DE CARBONO */}
			<div className="pointer-events-none absolute inset-0 opacity-[0.035] group-hover/card:opacity-[0.06] transition-opacity duration-700">
				<svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse">
							<path d="M0 0h6v6H0z" fill="#fff" fillOpacity="0.08" />
							<path d="M6 6h6v6H6z" fill="#fff" fillOpacity="0.08" />
							<path d="M6 0h6v6H6z" fill="#000" fillOpacity="0.4" />
							<path d="M0 6h6v6H0z" fill="#000" fillOpacity="0.4" />
							<line x1="0" y1="0" x2="12" y2="12" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.04" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill={`url(#${patternId})`} />
				</svg>
			</div>

			{/* ESQUINEROS DECORATIVOS */}
			<div className="pointer-events-none absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-3xl group-hover/card:border-amber-400 transition-colors" />
			<div className="pointer-events-none absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-zinc-800 rounded-tr-3xl group-hover/card:border-zinc-600 transition-colors" />
			<div className="pointer-events-none absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-zinc-800 rounded-bl-3xl group-hover/card:border-zinc-600 transition-colors" />
			<div className="pointer-events-none absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-3xl group-hover/card:border-amber-400 transition-colors" />

			{/* HEADER */}
			<div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-4 gap-3">
				<div className="flex items-center gap-3">
					<Flag
						countryCode={countryCode}
						className="h-6 w-9 rounded object-cover shadow-2xl ring-1 ring-zinc-700/80"
					/>

					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<h3 className="text-base font-black tracking-tight text-white uppercase font-sans">
								{translatedCountry}
							</h3>

							{round.name === nextName && !hideBadge && (
								<>
									{isLiveNow ? (
										<span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
											<Radio className="w-2.5 h-2.5" /> LIVE
										</span>
									) : (
										<span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
											<Flame className="w-2.5 h-2.5 text-amber-400 animate-bounce" /> PRÓXIMO
										</span>
									)}
								</>
							)}

							{isRoundOver && (
								<span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded-full border border-zinc-800">
									FINALIZADO
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="text-right flex flex-col items-end">
					<span className="text-xs font-black uppercase tracking-widest text-amber-400">
						{mounted ? formatMonth(round.start, round.end) : "..."}
					</span>
					<span className="text-[10px] font-medium text-zinc-400 tracking-wider">
						{mounted ? formatDayRange(round.start, round.end) : "..."}
					</span>
				</div>
			</div>

			{/* GRILLA DE SESIONES */}
			<div className="relative z-10 flex-1 py-4">
				{!isRoundOver ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
						{groupSessionByDay(round.sessions).map((day, i) => {
							const dayNameEnglish = utc(day.date).format("dddd").toLowerCase();
							const isFridayOrThursday = dayNameEnglish === "friday" || dayNameEnglish === "thursday";

							return (
								<div
									key={`round.day.${i}`}
									className="relative flex flex-col bg-zinc-950/60 rounded-2xl p-3 border border-zinc-900/80 backdrop-blur-sm group/col hover:border-zinc-800 transition-colors"
								>
									{/* ENCABEZADO DEL DÍA */}
									<div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-zinc-900/80 text-center">
										<span className="text-xs font-black tracking-widest uppercase text-white font-sans">
											{mounted ? (dayTranslation[dayNameEnglish] || dayNameEnglish) : "..."}
										</span>
										<span className="text-[11px] font-mono font-bold text-amber-400/90 tracking-wide bg-zinc-900/90 px-2 py-0.5 rounded-md border border-zinc-800">
											{mounted ? utc(day.date).local().format("DD · MMM") : "-- · ---"}
										</span>
									</div>

									{/* LISTA DE SESIONES */}
									<div className="flex flex-col gap-2.5 flex-1 justify-around">
										{day.sessions.map((session, j) => {
											const isNextTarget =
												isTargetRound &&
												upcomingSession &&
												upcomingSession.start === session.start &&
												upcomingSession.kind === session.kind;

											return (
												<div
													key={`round.day.${i}.session.${j}`}
													className={clsx(
														"relative overflow-hidden flex flex-col items-center justify-center text-center p-2.5 rounded-xl transition-all duration-300",
														isNextTarget
															? "bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/60 shadow-[0_0_18px_rgba(245,158,11,0.18)]"
															: "bg-zinc-900/40 border border-zinc-900/80 hover:bg-zinc-900/70 hover:border-zinc-800"
													)}
												>
													{/* Badge de Próximo */}
													{isNextTarget && (
														<span className="absolute top-1.5 right-1.5 flex items-center gap-1 text-[7px] font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-300 to-amber-500 px-1.5 py-0.2 rounded shadow-sm">
															<Activity className="w-2 h-2 animate-spin" /> PRÓX
														</span>
													)}

													{/* Nombre de la Sesión */}
													<span
														className={clsx(
															"uppercase tracking-wide",
															isNextTarget
																? "text-xs font-black text-amber-300 font-sans"
																: "text-[11px] font-bold text-zinc-200"
														)}
													>
														{(() => {
															const kind = session.kind.toLowerCase();
															if (kind === "race") return "Carrera";
															if (kind === "sprint" || kind === "sprint race" || kind === "carrera sprint") return "Sprint";
															if (kind.includes("shootout") || kind.includes("sprint qualifying") || kind.includes("sprint qualification") || kind.includes("clasif. sprint")) {
																return "Clasif. Sprint";
															}
															if (kind.includes("qualifying") || kind.includes("clasificacion") || kind.includes("clasificación")) {
																if (hasSprint && isFridayOrThursday) return "Clasif. Sprint";
																return "Clasificación";
															}
															if (kind.includes("practice 1") || kind === "fp1") return "Libres 1";
															if (kind.includes("practice 2") || kind === "fp2") return "Libres 2";
															if (kind.includes("practice 3") || kind === "fp3") return "Libres 3";
															return session.kind;
														})()}
													</span>

													{/* Horario completo perfectamente centrado */}
													<span
														className={clsx(
															"font-mono tracking-tight text-center mt-1 w-full",
															isNextTarget
																? "text-sm font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
																: "text-xs font-bold text-amber-400/90"
														)}
														suppressHydrationWarning
													>
														{mounted ? utc(session.start).local().format("hh:mm A") : "--:-- --"}
													</span>
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
							className="w-full flex items-center justify-between p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black hover:border-amber-500/40 hover:from-amber-950/20 hover:to-zinc-950 transition-all duration-300 group/btn shadow-lg"
						>
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover/btn:scale-110 transition-transform">
									<Gauge className="w-5 h-5" />
								</div>
								<div className="flex flex-col text-left">
									<span className="text-xs font-black uppercase tracking-widest text-zinc-100 group-hover/btn:text-amber-300 transition-colors">
										Telemetría & Resultados
									</span>
									<span className="text-[9px] text-zinc-500 font-mono">
										Tiempos por sector, vueltas y podio
									</span>
								</div>
							</div>

							<ChevronRight className="w-4 h-4 text-amber-500 group-hover/btn:translate-x-1 transition-transform" />
						</button>
					</div>
				)}
			</div>

			{/* FOOTER */}
			<div className="relative z-10 flex items-center justify-between pt-3 border-t border-zinc-900/90 text-[9px] text-zinc-600 font-mono">
				<span className="flex items-center gap-1.5">
					<Timer className="w-3 h-3 text-zinc-500" />
					ZONA HORARIA LOCAL
				</span>
				<span className="text-zinc-500 font-bold uppercase tracking-wider">
					BLACKBOX // F1
				</span>
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