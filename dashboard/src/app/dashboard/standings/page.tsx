"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { motion } from "motion/react";
import NumberDiff from "@/components/NumberDiff";
import Image from "next/image";

type ExternalDriver = {
	position: string;
	points: string;
	Driver: { givenName: string; familyName: string; code: string };
	Constructor: { name: string; constructorId: string };
};

type ExternalTeam = {
	position: string;
	points: string;
	Constructor: { name: string; constructorId: string };
};

// 1. Diccionario de banderas de los países
const driverNationalityMap: { [key: string]: string } = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "us",
	LAW: "nz", ANT: "it"
};

// 2. Colores EXACTOS vinculados a las escuderías oficiales de tu captura image_c4935e.jpg
const driverTeamColorMap: { [key: string]: { bg: string; text: string } } = {
	// McLaren (Naranja)
	NOR: { bg: "#ff8700", text: "#ffffff" },
	PIA: { bg: "#ff8700", text: "#ffffff" },
	
	// Ferrari (Rojo)
	LEC: { bg: "#e10600", text: "#ffffff" },
	HAM: { bg: "#e10600", text: "#ffffff" },
	
	// Red Bull (Azul Oscuro)
	VER: { bg: "#061d43", text: "#ffffff" },
	HAD: { bg: "#061d43", text: "#ffffff" },
	
	// Mercedes (Turquesa/Celeste)
	RUS: { bg: "#00d2be", text: "#ffffff" },
	ANT: { bg: "#00d2be", text: "#ffffff" },
	
	// Aston Martin (Verde)
	ALO: { bg: "#006f62", text: "#ffffff" },
	STR: { bg: "#006f62", text: "#ffffff" },
	
	// Alpine (Fucsia/Rosa) -> ¡Franco a Alpine! 🇦🇷
	GAS: { bg: "#ff00ff", text: "#ffffff" },
	COL: { bg: "#ff00ff", text: "#ffffff" },
	
	// Haas (Rojo de la lona/Gris oscuro)
	BEA: { bg: "#e10600", text: "#ffffff" },
	OCO: { bg: "#e10600", text: "#ffffff" },
	
	// RB F1 Team (Azul brillante)
	LAW: { bg: "#4b77ff", text: "#ffffff" },
	LIN: { bg: "#4b77ff", text: "#ffffff" },
	
	// Williams (Azul Eléctrico)
	ALB: { bg: "#005aff", text: "#ffffff" },
	SAI: { bg: "#005aff", text: "#ffffff" },
	
	// Cadillac (Negro de fondo de la lona / Blanco)
	PER: { bg: "#27272a", text: "#ffffff" },
	BOT: { bg: "#27272a", text: "#ffffff" },
	
	// Audi (Gris oscuro / Negro)
	HUL: { bg: "#1f1f1f", text: "#ffffff" },
	BOR: { bg: "#1f1f1f", text: "#ffffff" },
};

// 3. Componente buscador inteligente para tus logos locales de la carpeta public/team-logos/
const TeamLogo = ({ teamName }: { teamName: string }) => {
	const cleanName = teamName.toLowerCase();
	const [fallbackIndex, setFallbackIndex] = useState(0);

	const fallbacks: string[] = [];
	if (cleanName.includes("red bull")) {
		fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg");
	} else if (cleanName.includes("alpine")) {
		fallbacks.push("/team-logos/alpine-f1-team.svg", "/team-logos/alpine.svg");
	} else if (cleanName.includes("rb f1") || cleanName === "rb" || cleanName.includes("bulls")) {
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

export default function Standings() {
	const driverStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Drivers);
	const teamStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Teams);
	const driversLive = useDataStore((state) => state.state?.DriverList);
	const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);

	const [extDrivers, setExtDrivers] = useState<ExternalDriver[] | null>(null);
	const [extTeams, setExtTeams] = useState<ExternalTeam[] | null>(null);
	const [loadingBackup, setLoadingBackup] = useState(false);

	useEffect(() => {
		if (!driverStandingsLive || !teamStandingsLive) {
			const fetchBackupStandings = async () => {
				setLoadingBackup(true);
				try {
					const resDrivers = await fetch("https://api.jolpi.ca/ergast/f1/2026/driverStandings.json");
					const dataDrivers = await resDrivers.json();
					const dList = dataDrivers?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings;
					if (dList) setExtDrivers(dList);

					const resTeams = await fetch("https://api.jolpi.ca/ergast/f1/2026/constructorStandings.json");
					const dataTeams = await resTeams.json();
					const tList = dataTeams?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings;
					if (tList) setExtTeams(tList);
				} catch (err) {
					console.error(err);
				} finally {
					// Corregido acá de "final" a "finally"
					setLoadingBackup(false);
				}
			};
			fetchBackupStandings();
		}
	}, [driverStandingsLive, teamStandingsLive]);

	const maxDriverPoints = extDrivers && extDrivers.length > 0 ? parseFloat(extDrivers[0].points) : 300;
	const maxTeamPoints = extTeams && extTeams.length > 0 ? parseFloat(extTeams[0].points) : 500;

	const showDriversSkeleton = !driverStandingsLive && loadingBackup && !extDrivers;
	const showTeamsSkeleton = !teamStandingsLive && loadingBackup && !extTeams;

	return (
		<div className="grid h-full grid-cols-1 gap-6 p-4 lg:grid-cols-2 bg-black text-white">
			{/* SECCIÓN CAMPEONATO DE PILOTOS */}
			<div className="flex flex-col h-full bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl">
				<h2 className="text-xl font-bold tracking-wide mb-6 uppercase text-zinc-400 border-b border-zinc-900 pb-3">
					🏁 Campeonato de Pilotos
				</h2>

				<div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
					{showDriversSkeleton && new Array(10).fill("").map((_, i) => <SkeletonItem key={i} />)}

					{!driverStandingsLive && extDrivers && (
						<>
							{/* TOP 3 DE PILOTOS */}
							<div className="grid grid-cols-3 gap-3 mb-4">
								{extDrivers.slice(0, 3).map((driver, index) => {
									const badgeColor = driverTeamColorMap[driver.Driver.code] || { bg: "#27272a" };
									const isFav = favoriteDrivers.includes(driver.Driver.code);
									return (
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 }}
											key={`podium-${driver.Driver.code}`}
											className={`relative flex flex-col items-center justify-between p-4 rounded-xl border border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md text-center h-40 ${
												isFav ? "shadow-[0_0_20px_rgba(255,0,255,0.15)] border-pink-500/30" : ""
											}`}
										>
											<span className="absolute top-2 left-3 text-xs font-black opacity-30 text-zinc-400">#0{driver.position}</span>
											<span className="text-2xl mt-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
											<div className="flex flex-col items-center mt-1">
												<span className="text-xs font-black tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: badgeColor.bg }}>
													{driver.Driver.code || "F1"}
												</span>
												<p className="text-xs font-medium truncate max-w-[95px] mt-1.5 text-zinc-200">
													{driver.Driver.familyName}
												</p>
											</div>
											<p className="text-sm font-bold tracking-tight text-white">{driver.points} <span className="text-[10px] text-zinc-500">PTS</span></p>
										</motion.div>
									);
								})}
							</div>

							{/* RESTO DE LA PARRILLA DE PILOTOS (4° al 20°) */}
							{extDrivers.slice(3).map((driver, index) => {
								const driverCode = driver.Driver.code || "F1";
								const countryCode = driverNationalityMap[driverCode];
								const badgeColor = driverTeamColorMap[driverCode] || { bg: "#27272a" };
								const ptsPercent = (parseFloat(driver.points) / maxDriverPoints) * 100;
								const isFav = favoriteDrivers.includes(driverCode);

								return (
									<motion.div
										initial={{ opacity: 0, x: 15 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.03 + 0.3 }}
										className={`relative grid items-center p-3 rounded-xl bg-zinc-900/20 backdrop-blur-md border border-zinc-900 hover:border-zinc-800/80 transition-all ${
											isFav ? "shadow-[0_0_15px_rgba(255,0,255,0.1)] border-pink-500/20 bg-zinc-900/40" : ""
										}`}
										style={{
											gridTemplateColumns: "2.5rem auto 5rem",
											borderLeft: `4px solid ${badgeColor.bg}`
										}}
										key={driver.Driver.code || driver.Driver.familyName}
									>
										<div className="absolute inset-0 bg-zinc-800/5 rounded-r-xl pointer-events-none overflow-hidden">
											<div className="h-full opacity-10 transition-all duration-500" style={{ width: `${ptsPercent}%`, backgroundColor: badgeColor.bg }} />
										</div>

										<p className="font-black text-sm text-zinc-500 text-center">#{driver.position}</p>
										
										<div className="flex items-center gap-3 z-10">
											<span className="text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded text-center min-w-9" style={{ backgroundColor: badgeColor.bg }}>
												{driverCode}
											</span>
											{countryCode && (
												<img src={`https://flagcdn.com/w20/${countryCode}.png`} alt="Bandera" className="w-4.5 h-auto rounded-sm opacity-90 shadow-sm" />
											)}
											<p className="text-sm font-medium text-zinc-200">{driver.Driver.givenName} {driver.Driver.familyName}</p>
										</div>

										<p className="font-bold text-right text-sm tracking-tight text-zinc-100 z-10">
											{driver.points} <span className="text-[10px] text-zinc-500 font-normal">pts</span>
										</p>
									</motion.div>
								);
							})}
						</>
					)}
				</div>
			</div>

			{/* SECCIÓN CAMPEONATO DE CONSTRUCTORES */}
			<div className="flex flex-col h-full bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl">
				<h2 className="text-xl font-bold tracking-wide mb-6 uppercase text-zinc-400 border-b border-zinc-900 pb-3">
					🛠️ Campeonato de Constructores
				</h2>

				<div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
					{showTeamsSkeleton && new Array(5).fill("").map((_, i) => <SkeletonItem key={i} />)}

					{!teamStandingsLive && extTeams && (
						<>
							{/* TOP 3 CONSTRUCTORES */}
							<div className="grid grid-cols-3 gap-3 mb-4">
								{extTeams.slice(0, 3).map((team, index) => (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										key={`podium-team-${team.Constructor.constructorId}`}
										className="relative flex flex-col items-center justify-between p-4 rounded-xl border border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md text-center h-40"
									>
										<span className="absolute top-2 left-3 text-xs font-black opacity-30 text-zinc-400">#0{team.position}</span>
										<span className="text-2xl mt-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
										<div className="flex flex-col items-center mt-1">
											<TeamLogo teamName={team.Constructor.name} />
											<p className="text-xs font-bold truncate max-w-[95px] mt-2 text-zinc-200">
												{team.Constructor.name}
											</p>
										</div>
										<p className="text-sm font-bold tracking-tight text-white">{team.points} <span className="text-[10px] text-zinc-500">PTS</span></p>
									</motion.div>
								))}
							</div>

							{/* RESTO DE LA PARRILLA DE CONSTRUCTORES (4° al 11°) */}
							{extTeams.slice(3).map((team, index) => {
								const ptsPercent = (parseFloat(team.points) / maxTeamPoints) * 100;

								return (
									<motion.div
										initial={{ opacity: 0, x: 15 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.04 + 0.3 }}
										className="relative grid items-center p-3 rounded-xl bg-zinc-900/20 backdrop-blur-md border border-zinc-900 hover:border-zinc-800/80 transition-all border-l-4 border-l-zinc-700"
										style={{
											gridTemplateColumns: "2.5rem 2.5rem auto 5rem",
										}}
										key={team.Constructor.constructorId}
									>
										<div className="absolute inset-0 bg-zinc-800/5 rounded-r-xl pointer-events-none overflow-hidden">
											<div className="h-full opacity-5 transition-all duration-500 bg-white" style={{ width: `${ptsPercent}%` }} />
										</div>

										<p className="font-black text-sm text-zinc-500 text-center">#{team.position}</p>
										
										<div className="w-6 h-6 relative flex items-center justify-center z-10">
											<TeamLogo teamName={team.Constructor.name} />
										</div>

										<p className="text-sm font-medium text-zinc-200 z-10 pl-1">{team.Constructor.name}</p>

										<p className="font-bold text-right text-sm tracking-tight text-zinc-100 z-10">
											{team.points} <span className="text-[10px] text-zinc-500 font-normal">pts</span>
										</p>
									</motion.div>
								);
							})}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

const SkeletonItem = () => {
	return (
		<div className="h-11 w-full animate-pulse rounded-xl bg-zinc-900/50 border border-zinc-900" />
	);
};