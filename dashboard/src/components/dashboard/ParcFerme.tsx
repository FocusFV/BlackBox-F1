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
	isDNF: boolean;
	dnfReason?: string;
}

type SessionTab = "RACE" | "QUALY" | "SPRINT" | "FP3" | "FP2" | "FP1" | "SQ";

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
	const [raceDate, setRaceDate] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [hasSprint, setHasSprint] = useState(false);

	useEffect(() => {
		async function fetchSessionData() {
			setLoading(true);
			try {
				// 1. Si es práctica libre (FP1, FP2, FP3), consultamos nuestra API de OpenF1
				if (activeTab === "FP1" || activeTab === "FP2" || activeTab === "FP3") {
					const dateParam = raceDate ? `&date=${raceDate}` : "";
					const res = await fetch(`/api/practice?session=${activeTab}${dateParam}`);
					if (res.ok) {
						const data = await res.json();
						if (Array.isArray(data.results) && data.results.length > 0) {
							setResults(data.results);
							setLoading(false);
							return;
						}
					}
				}

				// 2. Para Carrera, Qualy y Sprint consultamos Jolpica/Ergast
				let subpath = "results.json";
				if (activeTab === "QUALY") subpath = "qualifying.json";
				else if (activeTab === "SPRINT" || activeTab === "SQ") subpath = "sprint.json";

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
					if (race.date) setRaceDate(race.date);

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

						let gapTime = "";
						let pointsStr = "";

						if (isTimeBased) {
							gapTime = r.Q3 || r.Q2 || r.Q1 || "S/T";
						} else if (isDNF) {
							gapTime = `DNF · ${r.status?.toUpperCase() || "OUT"}`;
						} else {
							gapTime = r.Time?.time || (statusStr.includes("+") ? r.status : "INTERVAL");
							const ptsNum = Number(r.points || 0);
							pointsStr = ptsNum > 0 ? `+${ptsNum} PTS` : "";
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
	}, [activeTab, raceDate]);

	return (
		<div className="flex flex-col gap-4 w-full text-white items-center">
			{/* 🏁 CABECERA UNIFICADA PANORÁMICA */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:w-8/12 w-full">
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<div className="flex items-center justify-center overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900 p-0.5 shadow-md shrink-0">
						<Flag countryCode={countryCode} className="h-6 w-9 object-cover rounded-md" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">
								Última Ronda Oficial
							</span>
							<span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono font-bold uppercase">
								Resultados
							</span>
						</div>
						<h2 className="text-sm md:text-base font-black tracking-wide text-zinc-100 font-sans">
							{gpName}
						</h2>
					</div>
				</div>

				<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 w-full sm:w-auto justify-center sm:justify-end">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
						<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
					</span>
					<div className="text-left font-mono">
						<p className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight leading-none">
							Pista en Pausa
						</p>
						<p className="text-[8px] text-zinc-500 font-medium tracking-normal leading-tight mt-0.5">
							Telemetría en espera
						</p>
					</div>
				</div>
			</div>

			{/* GRILLA DE RESULTADOS PRINCIPAL */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full justify-center">
				<div className="lg:col-start-3 lg:col-span-8 flex flex-col bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-xl max-w-full shadow-2xl">
					{/* SELECTOR DE SESIÓN ESTILO CONSOLA F1 */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 border-b border-zinc-900 pb-3">
						<div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar">
							<div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 inline-flex items-center gap-1 shadow-inner select-none shrink-0">
								<button
									onClick={() => setActiveTab("FP1")}
									className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
										activeTab === "FP1"
											? "bg-zinc-800 text-white border border-zinc-700 shadow-md flex items-center gap-1.5"
											: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
									}`}
								>
									{activeTab === "FP1" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
									FP1
								</button>
								{hasSprint ? (
									<>
										<button
											onClick={() => setActiveTab("SQ")}
											className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
												activeTab === "SQ"
													? "bg-zinc-800 text-cyan-300 border border-zinc-700 shadow-md flex items-center gap-1.5"
													: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
											}`}
										>
											{activeTab === "SQ" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
											SQ
										</button>
										<button
											onClick={() => setActiveTab("SPRINT")}
											className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
												activeTab === "SPRINT"
													? "bg-zinc-800 text-amber-300 border border-zinc-700 shadow-md flex items-center gap-1.5"
													: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
											}`}
										>
											{activeTab === "SPRINT" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
											SPRINT
										</button>
									</>
								) : (
									<>
										<button
											onClick={() => setActiveTab("FP2")}
											className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
												activeTab === "FP2"
													? "bg-zinc-800 text-white border border-zinc-700 shadow-md flex items-center gap-1.5"
													: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
											}`}
										>
											{activeTab === "FP2" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
											FP2
										</button>
										<button
											onClick={() => setActiveTab("FP3")}
											className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
												activeTab === "FP3"
													? "bg-zinc-800 text-white border border-zinc-700 shadow-md flex items-center gap-1.5"
													: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
											}`}
										>
											{activeTab === "FP3" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
											FP3
										</button>
									</>
								)}
								<button
									onClick={() => setActiveTab("QUALY")}
									className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
										activeTab === "QUALY"
											? "bg-zinc-800 text-purple-300 border border-zinc-700 shadow-md flex items-center gap-1.5"
											: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
									}`}
								>
									{activeTab === "QUALY" && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
									QUALY
								</button>
								<button
									onClick={() => setActiveTab("RACE")}
									className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
										activeTab === "RACE"
											? "bg-zinc-800 text-amber-300 border border-zinc-700 shadow-md flex items-center gap-1.5"
											: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
									}`}
								>
									{activeTab === "RACE" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
									CARRERA
								</button>
							</div>
						</div>

						<span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest self-end sm:self-auto shrink-0">
							{activeTab === "RACE"
								? "Clasificación Final Oficial"
								: activeTab === "QUALY"
								? "Tiempos Oficiales FIA"
								: activeTab.startsWith("FP")
								? "Tiempos de Vuelta en Pista"
								: "Puntos Oficiales Sprint"}
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
						/* LISTA UNIFICADA Y COMPACTA (DE P1 A P20 SIN TARJETAS GIGANTES) */
						<div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
							{results.map((row, index) => {
								const driverFlag = driverNationalityMap[row.code];
								const teamColor = driverTeamColorMap[row.code]?.bg || "#3f3f46";
								const posNum = parseInt(row.pos, 10);

								const isP1 = posNum === 1;
								const isP2 = posNum === 2;
								const isP3 = posNum === 3;

								// Líneas de corte FIA limpias en Qualy (sin texto)
								const isCutoffQ2 = activeTab === "QUALY" && posNum === 11;
								const isCutoffQ1 = activeTab === "QUALY" && posNum === 16;

								// Estilo sutil de podio integrado en la misma altura
								const rowBg = isP1
									? "bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/15"
									: isP2
									? "bg-zinc-400/10 border-zinc-500/40 hover:bg-zinc-400/15"
									: isP3
									? "bg-amber-700/10 border-amber-700/40 hover:bg-amber-700/15"
									: row.isDNF
									? "bg-zinc-950/20 border-zinc-900/40 opacity-40 saturate-50"
									: "bg-zinc-900/30 border-zinc-900/80 hover:border-zinc-700/80 hover:bg-zinc-900/60";

								const renderPosBadge = () => {
									if (isP1) return <span className="text-sm">🥇</span>;
									if (isP2) return <span className="text-sm">🥈</span>;
									if (isP3) return <span className="text-sm">🥉</span>;
									return (
										<span className="font-mono font-bold text-xs text-zinc-400">
											{row.pos}
										</span>
									);
								};

								return (
									<React.Fragment key={`${activeTab}-${row.code}-${row.pos}`}>
										{/* Línea de corte Q2 (sin texto) */}
										{isCutoffQ2 && (
											<div className="h-[1px] w-full bg-red-500/40 my-1" />
										)}

										{/* Línea de corte Q1 (sin texto) */}
										{isCutoffQ1 && (
											<div className="h-[1px] w-full bg-zinc-700/50 my-1" />
										)}

										<motion.div
											initial={{ opacity: 0, x: 8 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.015 }}
											className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 h-12 overflow-hidden ${rowBg}`}
										>
											<div className="flex items-center gap-2.5 z-10 truncate flex-1 min-w-0 pr-2">
												{/* Franja vertical recta de escudería (sin arcos ni paréntesis) */}
												<div
													className="w-1 self-stretch rounded-full shrink-0 my-0.5"
													style={{ backgroundColor: row.isDNF ? "#3f3f46" : teamColor }}
												/>

												<div className="w-5 flex justify-center items-center shrink-0">
													{renderPosBadge()}
												</div>

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
													<p
														className={`text-xs md:text-sm truncate font-bold ${
															isP1 ? "text-amber-200" : "text-zinc-100"
														}`}
													>
														{row.name}
													</p>
													<span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border bg-zinc-900/90 text-zinc-400 border-zinc-800 shrink-0">
														#{row.number}
													</span>
												</div>
											</div>

											{/* Datos derecha (Tiempos y Puntos) */}
											<div className="flex items-center gap-2 shrink-0 font-mono">
												<p
													className={`text-xs font-bold tracking-tight uppercase ${
														row.isDNF
															? "text-red-400/80 text-[10px]"
															: isP1
															? "text-amber-300"
															: "text-zinc-300"
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
					)}
				</div>
			</div>
		</div>
	);
};
