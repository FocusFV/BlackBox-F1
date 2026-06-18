"use client";

import React, { useState, useEffect } from 'react';
import { useDataStore } from "@/stores/useDataStore";
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

type SessionTab = "RACE" | "QUALY" | "SPRINT_QUALY" | "SPRINT";

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
	COL: { bg: "#ff00ff", text: "#ffffff" },
	BEA: { bg: "#e10600", text: "#ffffff" },
	OCO: { bg: "#e10600", text: "#ffffff" },
	MAG: { bg: "#373737", text: "#ffffff" },
	LAW: { bg: "#4b77ff", text: "#ffffff" },
	TSU: { bg: "#4b77ff", text: "#ffffff" },
	ALB: { bg: "#005aff", text: "#ffffff" },
	SAI: { bg: "#005aff", text: "#ffffff" },
	BOT: { bg: "#27272a", text: "#ffffff" },
	HUL: { bg: "#1f1f1f", text: "#ffffff" },
	BOR: { bg: "#1f1f1f", text: "#ffffff" },
};

const TeamLogo = ({ teamName }: { teamName: string }) => {
	const cleanName = teamName.toLowerCase();
	const [fallbackIndex, setFallbackIndex] = useState(0);

	const fallbacks: string[] = [];
	if (cleanName.includes("red bull")) {
		fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg");
	} else if (cleanName.includes("alpine")) {
		fallbacks.push("/team-logos/alpine-f1-team.svg", "/team-logos/alpine.svg");
	} else if (cleanName.includes("rb h1") || cleanName === "rb" || cleanName.includes("bulls") || cleanName.includes("rb f1")) {
		fallbacks.push("/team-logos/rb-f1-team.svg", "/team-logos/rb.svg");
	} else if (cleanName.includes("haas")) {
		fallbacks.push("/team-logos/haas-f1-team.svg", "/team-logos/haas.svg");
	} else if (cleanName.includes("audi") || cleanName.includes("sauber")) {
		fallbacks.push("/team-logos/audi.svg", "/team-logos/kick-sauber.svg");
	} else if (cleanName.includes("cadillac")) {
		fallbacks.push("/team-logos/cadillac-f1-team.svg", "/team-logos/cadillac.svg");
	} else if (cleanName.includes("aston")) {
		fallbacks.push("/team-logos/aston-martin.svg");
	} else {
		fallbacks.push(`/team-logos/${cleanName.replaceAll(" ", "-")}.svg`);
	}
	fallbacks.push("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>");

	const isDarkLogo = cleanName.includes("audi") || cleanName.includes("cadillac") || cleanName.includes("sauber");

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className={`w-6 h-6 object-contain transition-all ${isDarkLogo ? "invert brightness-200 contrast-200" : ""}`}
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

	// 1. TELEMETRÍA OFICIAL
	useEffect(() => {
		async function fetchSessionData() {
			setLoading(true);
			try {
				let endpoint = 'https://api.jolpi.ca/ergast/f1/current/last/results.json';
				
				if (activeTab === "QUALY") {
					endpoint = 'https://api.jolpi.ca/ergast/f1/current/last/qualifying.json';
				} else if (activeTab === "SPRINT") {
					endpoint = 'https://api.jolpi.ca/ergast/f1/current/last/sprint.json';
				} else if (activeTab === "SPRINT_QUALY") {
					endpoint = 'https://api.jolpi.ca/ergast/f1/current/last/sprint/qualifying.json';
				}

				const res = await fetch(endpoint);
				const data = await res.json();
				
				let currentGp = "Desconocido";

				if (data.MRData?.RaceTable?.Races?.length > 0) {
					const race = data.MRData.RaceTable.Races[0];
					currentGp = race.raceName || "Desconocido";
					setGpName(currentGp);

					if (race.Sprint || race.SprintResults || race.SprintQualifyingResults) {
						setHasSprint(true);
					}

					let listSource: any[] = [];
					let isTimeBased = false;

					if (activeTab === "RACE") listSource = race.Results || [];
					else if (activeTab === "SPRINT") listSource = race.SprintResults || [];
					else if (activeTab === "QUALY") { listSource = race.QualifyingResults || []; isTimeBased = true; }
					else if (activeTab === "SPRINT_QUALY") { listSource = race.SprintQualifyingResults || race.SprintShootoutResults || []; isTimeBased = true; }

					const fetchedResults = listSource.map((r: any) => {
						const statusStr = r.status || "";
						const isFinished = statusStr.includes("Finished") || statusStr.includes("Lap") || isTimeBased;
						const isDNF = !isFinished;

						return {
							pos: r.position,
							number: r.number || r.Driver.permanentNumber || "0",
							code: r.Driver.code || "F1",
							name: `${r.Driver.givenName} ${r.Driver.familyName}`,
							team: r.Constructor.name,
							constructorId: r.Constructor.constructorId,
							isDNF: isDNF,
							rightData: isTimeBased ? (r.Q3 || r.Q2 || r.Q1 || "S/T") : (isDNF ? `DNF / ${statusStr.toUpperCase()}` : `${r.points} pts`)
						};
					});
					setResults(fetchedResults);
				}
			} catch (error) {
				console.error("Error en el mapeo de sesiones:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchSessionData();
	}, [activeTab]);

	return (
		<div className="flex flex-col gap-6 p-4 text-white w-full items-center">
			
			{/* 🏆 PÍLDORA CENTRAL */}
			<div className="flex justify-center w-full select-none">
				<div className="flex items-center gap-4 px-6 py-4 bg-zinc-950/60 border border-zinc-900 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.6)] lg:w-6/12 w-full justify-center">
					<span className="text-xl animate-pulse flex-shrink-0 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">🔒</span>
					<div className="font-mono text-center">
						<h2 className="text-sm md:text-base font-black uppercase tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-transparent bg-clip-text">
							Régimen de Parque Cerrado
						</h2>
						<p className="text-[11px] md:text-xs text-zinc-400 font-medium uppercase tracking-wide mt-1 leading-normal max-w-md">
							Telemetría en tiempo real bloqueada. Acceso disponible al inicio de la próxima sesión oficial.
						</p>
					</div>
				</div>
			</div>

			{/* GRILLA DE CONTENIDO CENTRADA */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full justify-center">
				
				{/* TU TABLA ORIGINAL CON EL ANCHO DE SIEMPRE (COL-SPAN-6) PERO CENTRADA */}
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
								<>
									<button onClick={() => setActiveTab("SPRINT_QUALY")} className={`flex-1 text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg uppercase tracking-wider transition ${activeTab === "SPRINT_QUALY" ? "bg-zinc-800 text-white border border-zinc-700/80 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}>S-Qualy</button>
									<button onClick={() => setActiveTab("SPRINT")} className={`flex-1 text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg uppercase tracking-wider transition ${activeTab === "SPRINT" ? "bg-zinc-800 text-white border border-zinc-700/80 shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}>Sprint</button>
								</>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar font-sans">
						{loading ? (
							<div className="h-48 flex items-center justify-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
								Cargando datos...
							</div>
						) : (
							results.map((row) => {
								const countryCode = driverNationalityMap[row.code];
								const badgeColor = driverTeamColorMap[row.code] || { bg: "#27272a", text: "#ffffff" };
								const renderPosition = () => {
									if (row.pos === "1") return <span className="text-base select-none">🥇</span>;
									if (row.pos === "2") return <span className="text-base select-none">🥈</span>;
									if (row.pos === "3") return <span className="text-base select-none">🥉</span>;
									return <p className={`font-mono font-bold text-xs text-center ${row.isDNF ? "text-zinc-600" : "text-zinc-500"}`}>{row.pos}</p>;
								};

								return (
									<motion.div
										initial={{ opacity: 0, x: 15 }}
										animate={{ opacity: 1, x: 0 }}
										className={`relative flex items-center justify-between p-3 rounded-xl border transition-all w-full overflow-hidden h-14 ${row.isDNF ? "bg-zinc-950/20 border-zinc-900/60 opacity-45 saturate-50 brightness-75" : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-800/80"}`}
										style={{ borderLeft: `4px solid ${row.isDNF ? "#27272a" : badgeColor.bg}` }}
										key={`${activeTab}-${row.code}`}
									>
										<div className="flex items-center gap-3 z-10 truncate flex-1 min-w-0 pr-2">
											<div className="w-6 flex justify-center items-center flex-shrink-0">{renderPosition()}</div>
											{countryCode && <img src={`https://flagcdn.com/w20/${countryCode}.png`} alt="" className="w-5 h-auto rounded-sm opacity-90 shadow-sm flex-shrink-0" />}
											<div className="flex-shrink-0 w-6 h-6 flex items-center justify-center"><TeamLogo teamName={row.team} /></div>
											<div className="flex items-center gap-2 truncate min-w-0">
												<p className={`text-sm truncate ${row.isDNF ? "font-bold text-zinc-500" : "font-bold text-zinc-200"}`}>{row.name}</p>
												<span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${row.isDNF ? "bg-zinc-950 text-zinc-600 border-zinc-900" : "bg-zinc-900/80 text-zinc-400 border-zinc-800"}`}>#{row.number}</span>
											</div>
										</div>
										<p className={`font-bold text-right tracking-tight z-10 font-mono flex-shrink-0 pl-1 uppercase ${row.isDNF ? "text-[10px] text-zinc-600" : "text-xs text-zinc-100"}`}>{row.rightData}</p>
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