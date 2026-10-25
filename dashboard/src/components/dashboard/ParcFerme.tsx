"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Flag from "@/components/Flag";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";

interface DriverResult {
	pos: string;
	number: string;
	code: string;
	name: string;
	team: string;
	constructorId: string;
	points?: string;
	gapTime: string;
	q1?: string;
	q2?: string;
	q3?: string;
	isFastestLap?: boolean;
	fastestLapTime?: string;
	isDNF: boolean;
	dnfReason?: string;
}

type SessionTab = "RACE" | "QUALY" | "SPRINT";

const driverNationalityMap: Record<string, string> = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "us",
	LAW: "nz", ANT: "it"
};

const driverTeamColorMap: Record<string, { bg: string; text: string }> = {
	NOR: { bg: "#ff8700", text: "#ffffff" },
	PIA: { bg: "#ff8700", text: "#ffffff" },
	LEC: { bg: "#e10600", text: "#ffffff" },
	HAM: { bg: "#e10600", text: "#ffffff" },
	VER: { bg: "#061d43", text: "#ffffff" },
	HAD: { bg: "#061d43", text: "#ffffff" },
	LIN: { bg: "#061d43", text: "#ffffff" },
	PER: { bg: "#061d43", text: "#ffffff" },
	RUS: { bg: "#00d2be", text: "#ffffff" },
	ANT: { bg: "#00d2be", text: "#ffffff" },
	ALO: { bg: "#006f62", text: "#ffffff" },
	STR: { bg: "#006f62", text: "#ffffff" },
	GAS: { bg: "#ff00ff", text: "#ffffff" },
	COL: { bg: "#00a0de", text: "#ffffff" },
	BEA: { bg: "#e10600", text: "#ffffff" },
	OCO: { bg: "#b6babd", text: "#ffffff" },
	MAG: { bg: "#373737", text: "#ffffff" },
	LAW: { bg: "#6692ff", text: "#ffffff" },
	TSU: { bg: "#6692ff", text: "#ffffff" },
	ALB: { bg: "#00a0de", text: "#ffffff" },
	SAI: { bg: "#00a0de", text: "#ffffff" },
	BOT: { bg: "#52e252", text: "#ffffff" },
	ZHO: { bg: "#52e252", text: "#ffffff" }
};

const TeamLogo: React.FC<{ teamName: string }> = ({ teamName }) => {
	const [fallbackIndex, setFallbackIndex] = useState(0);
	const cleanName = (teamName || "").toLowerCase().trim();

	const fallbacks: string[] = [];
	if (cleanName.includes("red bull")) {
		fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg");
	} else if (cleanName.includes("alpine")) {
		fallbacks.push("/team-logos/alpine-f1-team.svg", "/team-logos/alpine.svg");
	} else if (cleanName.includes("rb") || cleanName.includes("racing bulls")) {
		fallbacks.push("/team-logos/rb-f1-team.svg", "/team-logos/rb.svg");
	} else if (cleanName.includes("haas")) {
		fallbacks.push("/team-logos/haas-f1-team.svg", "/team-logos/haas.svg");
	} else if (cleanName.includes("audi") || cleanName.includes("sauber")) {
		fallbacks.push("/team-logos/audi.svg", "/team-logos/kick-sauber.svg");
	} else if (cleanName.includes("williams")) {
		fallbacks.push("/team-logos/williams.svg", "/team-logos/williams-racing.svg");
	} else if (cleanName.includes("ferrari")) {
		fallbacks.push("/team-logos/ferrari.svg");
	} else if (cleanName.includes("mercedes")) {
		fallbacks.push("/team-logos/mercedes.svg");
	} else if (cleanName.includes("mclaren")) {
		fallbacks.push("/team-logos/mclaren.svg");
	} else if (cleanName.includes("aston")) {
		fallbacks.push("/team-logos/aston-martin.svg");
	} else {
		fallbacks.push(`/team-logos/${cleanName.replaceAll(" ", "-")}.svg`);
	}
	fallbacks.push(
		"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>"
	);

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className="w-5 h-5 object-contain"
			onError={() => {
				if (fallbackIndex < fallbacks.length - 1) setFallbackIndex(fallbackIndex + 1);
			}}
		/>
	);
};

export const ParcFerme: React.FC = () => {
	const [activeTab, setActiveTab] = useState<SessionTab>("RACE");
	const [results, setResults] = useState<DriverResult[]>([]);
	const [gpName, setGpName] = useState("Gran Premio");
	const [countryCode, setCountryCode] = useState<string>("usa");
	const [loading, setLoading] = useState(true);
	const [hasSprint, setHasSprint] = useState(false);

	useEffect(() => {
		async function fetchSessionData() {
			setLoading(true);
			try {
				let subpath = "results.json";
				if (activeTab === "QUALY") subpath = "qualifying.json";
				else if (activeTab === "SPRINT") subpath = "sprint.json";

				const endpoints = [
					`https://api.jolpi.ca/ergast/f1/current/last/${subpath}`,
					`https://api.jolpi.ca/ergast/f1/last/${subpath}`,
					`https://ergast.com/api/f1/current/last/${subpath}`,
				];

				let data: any = null;
				for (const url of endpoints) {
					try {
						const res = await fetch(url);
						if (res.ok) {
							data = await res.json();
							if (data?.MRData?.RaceTable?.Races?.length > 0) break;
						}
					} catch {
						// Fallback loop
					}
				}

				if (data?.MRData?.RaceTable?.Races?.length > 0) {
					const race = data.MRData.RaceTable.Races[0];
					setGpName(translateGpName(race.raceName));
					setCountryCode(getCountryCodeForGp(race.raceName, race.Circuit?.Location?.country));

					if (race.Sprint || race.SprintResults) {
						setHasSprint(true);
					}

					let listSource: any[] = [];
					let isTimeBased = false;

					if (activeTab === "RACE") listSource = race.Results || [];
					else if (activeTab === "SPRINT") listSource = race.SprintResults || [];
					else if (activeTab === "QUALY") {
						listSource = race.QualifyingResults || [];
						isTimeBased = true;
					}

					const fetchedResults: DriverResult[] = listSource.map((r: any) => {
						const statusStr = (r.status || "").toLowerCase();
						const isFinished =
							statusStr.includes("finished") ||
							statusStr.includes("+") ||
							statusStr.includes("lap") ||
							statusStr.includes("laps") ||
							isTimeBased;

						const isDNF = !isFinished;
						const isFastestLap = activeTab === "RACE" ? r.FastestLap?.rank === "1" : r.position === "1";
						const flTime = r.FastestLap?.Time?.time;

						let gapTime = "";
						let pointsStr = "";

						if (isTimeBased) {
							gapTime = r.Q3 || r.Q2 || r.Q1 || "S/T";
						} else if (isDNF) {
							gapTime = `DNF · ${r.status?.toUpperCase() || "OUT"}`;
						} else {
							gapTime = r.Time?.time || (statusStr.includes("+") ? r.status : "INTERVAL");
							pointsStr = r.points ? `+${r.points} PTS` : "";
						}

						return {
							pos: String(r.position),
							number: String(r.number || r.Driver?.permanentNumber || "0"),
							code: r.Driver?.code || r.Driver?.familyName?.substring(0, 3).toUpperCase() || "DRV",
							name: `${r.Driver?.givenName || ""} ${r.Driver?.familyName || ""}`.trim(),
							team: r.Constructor?.name || "Equipo",
							constructorId: r.Constructor?.constructorId || "",
							points: pointsStr,
							gapTime,
							q1: r.Q1,
							q2: r.Q2,
							q3: r.Q3,
							isFastestLap,
							fastestLapTime: flTime,
							isDNF,
							dnfReason: r.status,
						};
					});

					setResults(fetchedResults);
				}
			} catch (error) {
				console.error("Error al obtener resultados oficiales:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchSessionData();
	}, [activeTab]);

	const top3 = results.slice(0, 3);
	const restResults = results.slice(3);

	return (
		<div className="flex flex-col gap-5 w-full text-white items-center">
			{/* AVISO ELEGANTE DE ESTADO DE PISTA Y ÚLTIMO GP */}
			<div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:w-8/12 w-full">
				<div className="flex items-center gap-3.5 w-full md:w-auto">
					<div className="flex items-center justify-center overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900 p-0.5 shadow-md shrink-0">
						<Flag countryCode={countryCode} className="h-7 w-11 object-cover rounded-md" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">
								Última Ronda Oficial
							</span>
							<span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono font-bold uppercase">
								Resultados Finales
							</span>
						</div>
						<h2 className="text-sm md:text-base font-black tracking-wide text-zinc-100 font-sans mt-0.5">
							{gpName}
						</h2>
					</div>
				</div>

				<div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 w-full md:w-auto justify-center md:justify-end">
					<span className="relative flex h-2.5 w-2.5">
						<span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
						<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
					</span>
					<div className="text-left font-mono">
						<p className="text-[11px] font-bold text-zinc-200 uppercase tracking-tight leading-none">
							Sin carrera en curso
						</p>
						<p className="text-[9px] text-zinc-400 font-medium tracking-normal leading-tight mt-0.5">
							Telemetría en espera hasta la próxima sesión
						</p>
					</div>
				</div>
			</div>

			{/* GRILLA DE RESULTADOS PRINCIPAL */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full justify-center">
				<div className="lg:col-start-3 lg:col-span-8 flex flex-col bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-xl max-w-full shadow-2xl">
					{/* SELECTOR DE SESIÓN ESTILO F1 BROADCASH */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 border-b border-zinc-900 pb-4">
						<div className="flex items-center gap-2 self-start sm:self-auto">
							<span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
								Sesión:
							</span>
							<div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 select-none gap-1">
								<button
									onClick={() => setActiveTab("RACE")}
									className={`text-[11px] font-mono font-bold py-1.5 px-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
										activeTab === "RACE"
											? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
											: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
									}`}
								>
									🏁 Carrera
								</button>
								<button
									onClick={() => setActiveTab("QUALY")}
									className={`text-[11px] font-mono font-bold py-1.5 px-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
										activeTab === "QUALY"
											? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
											: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
									}`}
								>
									⏱️ Clasificación
								</button>
								{hasSprint && (
									<button
										onClick={() => setActiveTab("SPRINT")}
										className={`text-[11px] font-mono font-bold py-1.5 px-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
											activeTab === "SPRINT"
												? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm"
												: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
										}`}
									>
										⚡ Sprint
									</button>
								)}
							</div>
						</div>

						<span className="text-[10px] font-mono text-zinc-500 self-end sm:self-auto">
							{activeTab === "RACE" ? "Clasificación Final Oficial" : activeTab === "QUALY" ? "Tiempos Oficiales Q1 / Q2 / Q3" : "Puntos Sprint"}
						</span>
					</div>

					{loading ? (
						<div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
							<span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
							Cargando tiempos oficiales...
						</div>
					) : results.length === 0 ? (
						<div className="h-48 flex items-center justify-center text-zinc-500 font-mono text-xs text-center p-4">
							Sin resultados registrados para esta sesión.
						</div>
					) : (
						<div className="flex flex-col gap-4">
							{/* 🏆 MINI-PODIO DESTACADO (TOP 3) */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
								{top3.map((driver) => {
									const driverFlag = driverNationalityMap[driver.code];
									const teamColor = driverTeamColorMap[driver.code]?.bg || "#3f3f46";
									const isP1 = driver.pos === "1";
									const isP2 = driver.pos === "2";

									const cardStyle = isP1
										? "border-amber-500/50 bg-gradient-to-b from-amber-500/15 via-zinc-900/90 to-zinc-950/90 shadow-[0_4px_25px_rgba(245,158,11,0.2)] md:-translate-y-1"
										: isP2
										? "border-zinc-400/30 bg-gradient-to-b from-zinc-400/10 via-zinc-900/90 to-zinc-950/90 shadow-md"
										: "border-amber-700/30 bg-gradient-to-b from-amber-700/10 via-zinc-900/90 to-zinc-950/90 shadow-md";

									const badgeText = isP1
										? activeTab === "QUALY" ? "POLE POSITION" : "1º VICTORIA"
										: isP2
										? "2º LUGAR"
										: "3º LUGAR";

									const medalEmoji = isP1 ? "🥇" : isP2 ? "🥈" : "🥉";

									return (
										<div
											key={`podium-${driver.code}`}
											className={`relative rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-300 ${cardStyle}`}
											style={{ borderLeft: `4px solid ${teamColor}` }}
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-1.5">
													<span className="text-base">{medalEmoji}</span>
													<span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
														{badgeText}
													</span>
												</div>
												<span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
													#{driver.number}
												</span>
											</div>

											<div className="flex items-center gap-2.5 my-1">
												{driverFlag && (
													<img
														src={`https://flagcdn.com/w20/${driverFlag}.png`}
														alt=""
														className="w-4 h-auto rounded-xs opacity-90 shadow-xs"
													/>
												)}
												<TeamLogo teamName={driver.team} />
												<div className="truncate">
													<h4 className="text-sm font-bold text-white truncate leading-tight">
														{driver.name}
													</h4>
													<p className="text-[10px] font-mono text-zinc-400 truncate">
														{driver.team}
													</p>
												</div>
											</div>

											<div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-800/60 font-mono text-xs">
												<span className="text-zinc-400 text-[11px] truncate">{driver.gapTime}</span>
												{driver.points && (
													<span className="text-amber-400 font-bold text-[11px]">
														{driver.points}
													</span>
												)}
												{driver.isFastestLap && (
													<span className="text-purple-400 font-bold text-[10px] px-1 rounded bg-purple-500/10 border border-purple-500/30">
														🟣 {activeTab === "QUALY" ? "POLE" : "FL"}
													</span>
												)}
											</div>
										</div>
									);
								})}
							</div>

							{/* RESTO DE LA PARRILLA (P4 A P20) */}
							<div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
								{restResults.map((row, index) => {
									const driverFlag = driverNationalityMap[row.code];
									const teamColor = driverTeamColorMap[row.code]?.bg || "#3f3f46";
									const posNum = parseInt(row.pos, 10);

									const isCutoffQ2 = activeTab === "QUALY" && posNum === 11;
									const isCutoffQ1 = activeTab === "QUALY" && posNum === 16;

									return (
										<React.Fragment key={`${activeTab}-${row.code}-${row.pos}`}>
											{/* Líneas de Corte Oficiales FIA en Qualy */}
											{isCutoffQ2 && (
												<div className="flex items-center gap-3 my-2 select-none">
													<div className="h-[1px] flex-1 bg-red-500/30" />
													<span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400/90 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
														── Eliminados en Q2 (Línea de Corte Top 10) ──
													</span>
													<div className="h-[1px] flex-1 bg-red-500/30" />
												</div>
											)}
											{isCutoffQ1 && (
												<div className="flex items-center gap-3 my-2 select-none">
													<div className="h-[1px] flex-1 bg-zinc-700/40" />
													<span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/40">
														── Eliminados en Q1 (Línea de Corte Top 15) ──
													</span>
													<div className="h-[1px] flex-1 bg-zinc-700/40" />
												</div>
											)}

											<motion.div
												initial={{ opacity: 0, x: 10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.02 }}
												className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 h-13 overflow-hidden ${
													row.isDNF
														? "bg-zinc-950/30 border-zinc-900/50 opacity-40 saturate-50"
														: "bg-zinc-900/30 border-zinc-900/80 hover:border-zinc-700/80 hover:bg-zinc-900/60"
												}`}
												style={{ borderLeft: `3px solid ${row.isDNF ? "#3f3f46" : teamColor}` }}
											>
												<div className="flex items-center gap-2.5 z-10 truncate flex-1 min-w-0 pr-2">
													<span className="font-mono font-bold text-xs text-zinc-400 w-5 text-center shrink-0">
														{row.pos}
													</span>
													{driverFlag && (
														<img
															src={`https://flagcdn.com/w20/${driverFlag}.png`}
															alt=""
															className="w-4 h-auto rounded-xs opacity-90 shadow-xs shrink-0"
														/>
													)}
													<div className="shrink-0">
														<TeamLogo teamName={row.team} />
													</div>
													<div className="flex items-center gap-2 truncate min-w-0">
														<p className="text-xs md:text-sm truncate font-bold text-zinc-100">
															{row.name}
														</p>
														<span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border bg-zinc-900 text-zinc-400 border-zinc-800 shrink-0">
															#{row.number}
														</span>
													</div>
												</div>

												{/* Datos de la derecha (Tiempos / Puntos / FL) */}
												<div className="flex items-center gap-2 shrink-0 font-mono">
													{row.isFastestLap && (
														<span className="text-purple-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
															🟣 FL {row.fastestLapTime}
														</span>
													)}
													<p
														className={`text-xs font-bold tracking-tight uppercase ${
															row.isDNF ? "text-red-400/80 text-[10px]" : "text-zinc-300"
														}`}
													>
														{row.gapTime}
													</p>
													{row.points && (
														<span className="text-amber-400 font-bold text-xs pl-1">
															{row.points}
														</span>
													)}
												</div>
											</motion.div>
										</React.Fragment>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
