"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Flag from "@/components/Flag";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { triggerHaptic } from "@/lib/haptics";

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

interface ParcFermeProps {
	onOpenCircuit?: () => void;
}

export const ParcFerme: React.FC<ParcFermeProps> = ({ onOpenCircuit }) => {
	const gridDensity = useSettingsStore((state) => state.gridDensity);
	const isCompact = gridDensity === "compact";

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
			{/* 🏁 CABECERA UNIFICADA PANORÁMICA (TÁCTIL PARA ACTIVAR MODO CIRCUITO EN MÓVIL Y DESKTOP) */}
			<div
				onClick={onOpenCircuit}
				className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/75 border border-zinc-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:w-8/12 w-full cursor-pointer hover:border-amber-500/50 hover:bg-zinc-900/80 transition-all group"
				title="Toca para ver el circuito completo en alta resolución"
			>
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<div className="flex items-center justify-center overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900 p-0.5 shadow-md shrink-0">
						<Flag countryCode={countryCode} className="h-6 w-9 object-cover rounded-md" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[11px] uppercase font-mono font-bold tracking-wider text-amber-400">
								Última Ronda Oficial
							</span>
							<span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono font-bold uppercase group-hover:border-amber-500/40 group-hover:text-amber-300 transition-colors">
								Ver Circuito 🏁
							</span>
						</div>
						<h2 className="text-sm md:text-base font-black tracking-wide text-zinc-100 font-sans group-hover:text-amber-100 transition-colors">
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
						<p className="text-[11px] font-bold text-zinc-200 uppercase tracking-tight leading-none">
							Pista en Pausa
						</p>
						<p className="text-[10px] text-zinc-400 font-medium tracking-normal leading-tight mt-0.5">
							Telemetría en espera
						</p>
					</div>
				</div>
			</div>

			{/* GRILLA DE RESULTADOS PRINCIPAL */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full justify-center">
				<div className="lg:col-start-3 lg:col-span-8 flex flex-col bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-xl max-w-full shadow-2xl">
					{/* SELECTOR PANORÁMICO DE SESIONES ESTILO PIT-WALL (UNIFICADO EN ORO LÍQUIDO) */}
					<div className="flex flex-col gap-2.5 mb-5 border-b border-zinc-900/80 pb-4">
						<div className="w-full bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-wrap sm:flex-nowrap gap-1.5 select-none relative">
							{(hasSprint
								? [
										{ id: "FP1" as SessionTab, label: "FP1", sub: "Libres 1" },
										{ id: "SQ" as SessionTab, label: "SQ", sub: "Shootout" },
										{ id: "SPRINT" as SessionTab, label: "SPRINT", sub: "Carrera" },
										{ id: "QUALY" as SessionTab, label: "QUALY", sub: "Clasificación" },
										{ id: "RACE" as SessionTab, label: "CARRERA", sub: "Gran Premio" },
								  ]
								: [
										{ id: "FP1" as SessionTab, label: "FP1", sub: "Libres 1" },
										{ id: "FP2" as SessionTab, label: "FP2", sub: "Libres 2" },
										{ id: "FP3" as SessionTab, label: "FP3", sub: "Libres 3" },
										{ id: "QUALY" as SessionTab, label: "QUALY", sub: "Clasificación" },
										{ id: "RACE" as SessionTab, label: "CARRERA", sub: "Gran Premio" },
								  ]
							).map((tab) => {
								const isActive = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										onClick={() => {
											setActiveTab(tab.id);
											triggerHaptic("light");
										}}
										className={`relative flex-1 py-2.5 px-3 min-w-[65px] rounded-xl text-center font-mono transition-colors duration-200 select-none cursor-pointer border ${
											isActive
												? "border-amber-400/80 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)]"
												: "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800/60 hover:border-zinc-700/80"
										}`}
									>
										{isActive && (
											<motion.div
												layoutId="activeSessionPill"
												className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-xl -z-0"
												transition={{ type: "spring", stiffness: 380, damping: 30 }}
											/>
										)}
										<span className={`text-xs font-black tracking-wider block relative z-10 ${isActive ? "text-black" : ""}`}>
											{tab.label}
										</span>
										<span
											className={`text-[9px] uppercase tracking-tight block mt-0.5 relative z-10 ${
												isActive ? "text-black/85 font-bold" : "text-zinc-500 font-medium"
											}`}
										>
											{tab.sub}
										</span>
									</button>
								);
							})}
						</div>

						<div className="flex items-center justify-between px-1">
							<span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
								{activeTab === "RACE"
									? "Clasificación Final Oficial"
									: activeTab === "QUALY"
									? "Tiempos Oficiales FIA"
									: activeTab.startsWith("FP")
									? "Mejores Vueltas en Pista"
									: "Puntos Oficiales Sprint"}
							</span>
							<span className="text-[10px] font-mono text-amber-400/80 font-bold uppercase tracking-wider hidden sm:inline-block">
								Blackbox Timing Console
							</span>
						</div>
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
											whileHover={{ x: 3 }}
											transition={{ delay: index * 0.015 }}
											onClick={() => triggerHaptic("light")}
											className={`group/row relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
												isCompact ? "h-10 py-1.5" : "h-12"
											} overflow-hidden ${rowBg} hover:border-zinc-700/80 cursor-pointer`}
										>
											<div className="flex items-center gap-2.5 z-10 truncate flex-1 min-w-0 pr-2">
												{/* Franja vertical de escudería con ensanchamiento reactivo en hover/touch de 4px a 6px con resplandor */}
												<div
													className="w-1 group-hover/row:w-1.5 self-stretch rounded-full shrink-0 my-0.5 transition-all duration-300"
													style={{ 
														backgroundColor: row.isDNF ? "#3f3f46" : teamColor,
														boxShadow: row.isDNF ? "none" : `0 0 12px ${teamColor}90`
													}}
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
