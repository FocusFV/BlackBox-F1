"use client";

import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";

interface DriverResult {
	pos: string;
	number: string;
	code: string;
	name: string;
	team: string;
	constructorId: string;
	rightData: string;
	isDNF: boolean;
	dnfReason?: string;
}

type SessionTab = "RACE" | "QUALY" | "SPRINT";

const driverNationalityMap: { [key: string]: string } = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "us",
	LAW: "nz", ANT: "it"
};

const driverTeamColorMap: { [key: string]: { bg: string; text: string } } = {
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
	HUL: { bg: "#52e252", text: "#ffffff" },
	BOR: { bg: "#52e252", text: "#ffffff" },
};

const TeamLogo = ({ teamName }: { teamName: string }) => {
	const cleanName = (teamName || "").toLowerCase();
	const [fallbackIndex, setFallbackIndex] = useState(0);

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
	fallbacks.push("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>");

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className="w-6 h-6 object-contain"
			onError={() => {
				if (fallbackIndex < fallbacks.length - 1) setFallbackIndex(fallbackIndex + 1);
			}}
		/>
	);
};

export const ParcFerme: React.FC = () => {
	const [activeTab, setActiveTab] = useState<SessionTab>("RACE");
	const [results, setResults] = useState<DriverResult[]>([]);
	const [gpName, setGpName] = useState("Cargando...");
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
					`https://ergast.com/api/f1/current/last/${subpath}`
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
					setGpName(race.raceName || "Gran Premio");

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
						const rawTime = r.Q3 || r.Q2 || r.Q1 || r.Time?.time || "S/T";
						
						let displayRight = "";
						if (isTimeBased) {
							displayRight = rawTime;
						} else if (isDNF) {
							displayRight = `DNF / ${r.status?.toUpperCase() || "OUT"}`;
						} else {
							const pts = r.points ? `${r.points} PTS` : "";
							const timeDiff = r.Time?.time || (statusStr.includes("+") ? r.status : "");
							displayRight = pts ? (timeDiff ? `${pts}` : pts) : (timeDiff || "0 PTS");
						}

						return {
							pos: String(r.position),
							number: String(r.number || r.Driver?.permanentNumber || "0"),
							code: r.Driver?.code || r.Driver?.familyName?.substring(0, 3).toUpperCase() || "DRV",
							name: `${r.Driver?.givenName || ""} ${r.Driver?.familyName || ""}`.trim(),
							team: r.Constructor?.name || "Equipo",
							constructorId: r.Constructor?.constructorId || "",
							isDNF: isDNF,
							rightData: displayRight
						};
					});
					setResults(fetchedResults);
				}
			} catch (error) {
				console.error("Error al obtener resultados:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchSessionData();
	}, [activeTab]);

	return (
		<div className="flex flex-col gap-6 w-full text-white items-center">
			{/* PÍLDORA CENTRAL INFORMATIVA */}
			<div className="flex justify-center w-full select-none">
				<div className="flex items-center gap-4 px-6 py-4 bg-zinc-950/60 border border-zinc-900 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.6)] lg:w-6/12 w-full justify-center">
					<div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
						<span className="text-base">🔒</span>
					</div>
					<div className="font-mono text-center">
						<h2 className="text-sm md:text-base font-black uppercase tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-transparent bg-clip-text">
							RÉGIMEN DE PARQUE CERRADO
						</h2>
						<p className="text-[11px] md:text-xs text-zinc-400 font-medium uppercase tracking-wide mt-1 leading-normal max-w-md">
							Telemetría en tiempo real bloqueada. Mostrando resultados de la última sesión oficial.
						</p>
					</div>
				</div>
			</div>

			{/* GRILLA DE RESULTADOS */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full justify-center">
				<div className="lg:col-start-4 lg:col-span-6 flex flex-col bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 backdrop-blur-xl max-w-full">
					<div className="flex flex-col gap-3 mb-4 border-b border-zinc-900 pb-3">
						<div className="flex items-center justify-between">
							<h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
								Resultados Oficiales
							</h3>
							<p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
								Último GP: {gpName}
							</p>
						</div>

						<div className="flex bg-zinc-900/40 p-1 rounded-xl border border-zinc-800/50 select-none gap-1">
							<button onClick={() => setActiveTab("RACE")} className={`flex-1 text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg uppercase tracking-wider transition ${activeTab === "RACE" ? "bg-zinc-800 text-white border border-zinc-700/80 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}>Carrera</button>
							<button onClick={() => setActiveTab("QUALY")} className={`flex-1 text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg uppercase tracking-wider transition ${activeTab === "QUALY" ? "bg-zinc-800 text-white border border-zinc-700/80 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}>Qualy</button>
							{hasSprint && (
								<button onClick={() => setActiveTab("SPRINT")} className={`flex-1 text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg uppercase tracking-wider transition ${activeTab === "SPRINT" ? "bg-zinc-800 text-white border border-zinc-700/80 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}>Sprint</button>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2.5 max-h-[440px] overflow-y-auto pr-1 no-scrollbar font-sans">
						{loading ? (
							<div className="h-48 flex items-center justify-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
								Cargando datos...
							</div>
						) : results.length === 0 ? (
							<div className="h-48 flex items-center justify-center text-zinc-500 font-mono text-xs text-center p-4">
								Sin resultados registrados para esta sesión.
							</div>
						) : (
							results.map((row) => {
								const countryCode = driverNationalityMap[row.code];
								const badgeColor = driverTeamColorMap[row.code] || { bg: "#27272a", text: "#ffffff" };
								const renderPosition = () => {
									if (row.pos === "1") return <span className="text-base select-none">🥇</span>;
									if (row.pos === "2") return <span className="text-base select-none">🥈</span>;
									if (row.pos === "3") return <span className="text-base select-none">🥉</span>;
									return <p className={`font-mono font-bold text-xs text-center ${row.isDNF ? "text-zinc-600" : "text-zinc-400"}`}>{row.pos}</p>;
								};

								return (
									<motion.div
										initial={{ opacity: 0, x: 15 }}
										animate={{ opacity: 1, x: 0 }}
										className={`relative flex items-center justify-between p-3 rounded-xl border transition-all w-full overflow-hidden h-14 ${row.isDNF ? "bg-zinc-950/20 border-zinc-900/40 opacity-40 saturate-50" : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800/80"}`}
										style={{ borderLeft: `4px solid ${row.isDNF ? "#3f3f46" : badgeColor.bg}` }}
										key={`${activeTab}-${row.code}-${row.pos}`}
									>
										<div className="flex items-center gap-3 z-10 truncate flex-1 min-w-0 pr-2">
											<div className="w-6 flex justify-center items-center flex-shrink-0">{renderPosition()}</div>
											{countryCode && <img src={`https://flagcdn.com/w20/${countryCode}.png`} alt="" className="w-5 h-auto rounded-sm opacity-90 shadow-sm flex-shrink-0" />}
											<div className="flex-shrink-0 w-6 h-6 flex items-center justify-center"><TeamLogo teamName={row.team} /></div>
											<div className="flex items-center gap-2 truncate min-w-0">
												<p className={`text-sm truncate font-bold ${row.isDNF ? "text-zinc-500" : "text-zinc-100"}`}>{row.name}</p>
												<span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${row.isDNF ? "bg-zinc-950 text-zinc-600 border-zinc-900" : "bg-zinc-900/80 text-zinc-400 border-zinc-800"}`}>#{row.number}</span>
											</div>
										</div>
										<p className={`font-bold text-right tracking-tight z-10 font-mono flex-shrink-0 pl-1 uppercase ${row.isDNF ? "text-[10px] text-zinc-600" : "text-xs text-zinc-200"}`}>{row.rightData}</p>
									</motion.div>
								);
							})
						)}
					</div>
				</div>
			</div>
		</div>
	);
};