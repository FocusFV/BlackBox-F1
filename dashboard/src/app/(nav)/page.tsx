"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { motion } from "motion/react";
import clsx from "clsx";
import YearSelector from "@/app/dashboard/standings/YearSelector"; // 🌟 Conectado perfecto a tu carpeta components

type ExternalDriver = {
	position: string;
	points: string;
	Driver: { givenName: string; familyName: string; code: string; permanentNumber?: string };
	Constructor: { name: string; constructorId: string };
};

type ExternalTeam = {
	position: string;
	points: string;
	Constructor: { name: string; constructorId: string };
};

const driverNationalityMap: { [key: string]: string } = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "us",
	LAW: "nz", ANT: "it"
};

const driverTeamColorMap: { [key: string]: { bg: string; text: string } } = {
	NOR: { bg: "#ff8700", text: "#ffffff" }, PIA: { bg: "#ff8700", text: "#ffffff" },
	LEC: { bg: "#e10600", text: "#ffffff" }, HAM: { bg: "#e10600", text: "#ffffff" },
	VER: { bg: "#061d43", text: "#ffffff" }, HAD: { bg: "#061d43", text: "#ffffff" },
	LIN: { bg: "#061d43", text: "#ffffff" }, PER: { bg: "#061d43", text: "#ffffff" },
	RUS: { bg: "#00d2be", text: "#ffffff" }, ANT: { bg: "#00d2be", text: "#ffffff" },
	ALO: { bg: "#006f62", text: "#ffffff" }, STR: { bg: "#006f62", text: "#ffffff" },
	GAS: { bg: "#ff00ff", text: "#ffffff" }, COL: { bg: "#ff00ff", text: "#ffffff" },
	BEA: { bg: "#e10600", text: "#ffffff" }, OCO: { bg: "#e10600", text: "#ffffff" },
	MAG: { bg: "#373737", text: "#ffffff" }, LAW: { bg: "#4b77ff", text: "#ffffff" },
	TSU: { bg: "#4b77ff", text: "#ffffff" }, ALB: { bg: "#005aff", text: "#ffffff" },
	SAI: { bg: "#005aff", text: "#ffffff" }, BOT: { bg: "#27272a", text: "#ffffff" },
	HUL: { bg: "#1f1f1f", text: "#ffffff" }, BOR: { bg: "#1f1f1f", text: "#ffffff" },
};

const constructorColorMap: { [key: string]: string } = {
	mercedes: "#00d2be", ferrari: "#e10600", mclaren: "#ff8700", red_bull: "#061d43",
	alpine: "#ff00ff", rb: "#4b77ff", haas: "#e10600", williams: "#005aff",
	aston_martin: "#006f62", audi: "#1f1f1f", cadillac: "#27272a"
};

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
	const [year, setYear] = useState(2026);

	const driverStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Drivers);
	const teamStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Teams);
	const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);

	const [extDrivers, setExtDrivers] = useState<any[]>([]);
	const [extTeams, setExtTeams] = useState<any[]>([]);
	const [loadingBackup, setLoadingBackup] = useState(false);

	const shouldFetchData = year !== 2026 || !driverStandingsLive || !teamStandingsLive;

	useEffect(() => {
		if (shouldFetchData) {
			const fetchBackupStandings = async () => {
				setLoadingBackup(true);
				try {
					const resDrivers = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`);
					const dataDrivers = await resDrivers.json();
					const dList = dataDrivers?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings;
					setExtDrivers(dList || []);

					const resTeams = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`);
					const dataTeams = await resTeams.json();
					const tList = dataTeams?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings;
					setExtTeams(tList || []);
				} catch (err) {
					console.error(err);
					setExtDrivers([]);
					setExtTeams([]);
				} finally {
					setLoadingBackup(false);
				}
			};
			fetchBackupStandings();
		} else {
			setExtDrivers([]);
			setExtTeams([]);
		}
	}, [year, driverStandingsLive, teamStandingsLive]);

	const driversListSource: any[] = (year === 2026 && driverStandingsLive) 
		? (Array.isArray(driverStandingsLive) ? driverStandingsLive : Object.values(driverStandingsLive)).sort((a: any, b: any) => parseInt(a.position) - parseInt(b.position))
		: extDrivers;

	const teamsListSource: any[] = (year === 2026 && teamStandingsLive) 
		? (Array.isArray(teamStandingsLive) ? teamStandingsLive : Object.values(teamStandingsLive)).sort((a: any, b: any) => parseInt(a.position) - parseInt(b.position))
		: extTeams;

	const maxDriverPoints = driversListSource && driversListSource.length > 0 ? parseFloat(driversListSource[0].points) : 300;
	const maxTeamPoints = teamsListSource && teamsListSource.length > 0 ? parseFloat(teamsListSource[0].points) : 500;

	const showDriversSkeleton = loadingBackup && (!driversListSource || driversListSource.length === 0);
	const showTeamsSkeleton = loadingBackup && (!teamsListSource || teamsListSource.length === 0);

	return (
		<div className="flex flex-col gap-4 p-4 bg-black text-white h-full font-mono">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-1 w-full max-w-full overflow-hidden">
				
				{/* CAMPEONATO DE PILOTOS UNIFICADO */}
				<div className="flex flex-col h-full bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl overflow-hidden max-w-full">
					<h2 className="text-sm font-bold tracking-widest mb-6 uppercase text-zinc-400 border-b border-zinc-900 pb-3 flex justify-between items-center w-full">
						<span>🏁 Campeonato de Pilotos</span>
						{/* 🌟 AQUÍ ENTRA TU SELECTOR HISTÓRICO PREMIUM */}
						<YearSelector selectedYear={year} onYearChange={setYear} />
					</h2>

					<div className="flex flex-col gap-2.5 overflow-y-auto pr-1 no-scrollbar flex-1 max-w-full">
						{showDriversSkeleton && new Array(12).fill("").map((_, i) => <SkeletonItem key={i} />)}

						{driversListSource && driversListSource.map((driver: any, index: number) => {
							const driverCode = driver.Driver?.code || driver.code || "F1";
							const countryCode = driverNationalityMap[driverCode];
							const badgeColor = driverTeamColorMap[driverCode] || { bg: "#27272a", text: "#fff" };
							const ptsPercent = (parseFloat(driver.points) / maxDriverPoints) * 100;
							const isFav = year === 2026 && favoriteDrivers?.includes(driverCode);

							const renderPosition = () => {
								if (String(driver.position) === "1") return <span className="text-xl">🥇</span>;
								if (String(driver.position) === "2") return <span className="text-xl">🥈</span>;
								if (String(driver.position) === "3") return <span className="text-xl">🥉</span>;
								return <p className="font-black text-xs text-zinc-500 text-center w-5">#{driver.position}</p>;
							};

							const givenName = driver.Driver?.givenName || driver.firstName || "";
							const familyName = driver.Driver?.familyName || driver.lastName || "Piloto";

							return (
								<motion.div
									initial={{ opacity: 0, x: 12 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.15 }}
									className={clsx(
										"relative grid items-center p-3 rounded-xl bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800/80 transition-all h-14 max-w-full",
										isFav && "shadow-[0_0_20px_rgba(255,0,255,0.15)] border-pink-500/40 bg-zinc-900/40"
									)}
									style={{
										gridTemplateColumns: "2.5rem auto 5rem",
										borderLeft: `4px solid ${badgeColor.bg}`
									}}
									key={`${year}-${driverCode}-${index}`}
								>
									<div className="absolute inset-0 bg-zinc-800/5 rounded-r-xl pointer-events-none overflow-hidden">
										<div className={clsx("h-full transition-all duration-500", isFav ? 'opacity-20' : 'opacity-10')} style={{ width: `${ptsPercent}%`, backgroundColor: badgeColor.bg }} />
									</div>

									<div className="flex justify-center items-center">{renderPosition()}</div>
									
									<div className="flex items-center gap-3 z-10 min-w-0 truncate">
										<span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded text-center min-w-9" style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}>
											{driverCode}
										</span>
										{countryCode && (
											<img src={`https://flagcdn.com/w20/${countryCode}.png`} alt="" className="w-5 h-auto rounded-sm opacity-90 shadow-sm flex-shrink-0" />
										)}
										<p className="text-xs font-bold text-zinc-200 truncate uppercase">
											{givenName ? givenName[0] + '.' : ''} {familyName}
										</p>
									</div>

									<p className="font-black text-right text-xs tracking-tight text-zinc-100 z-10 uppercase">
										{driver.points} <span className="text-[9px] text-zinc-500 font-normal">pts</span>
									</p>
								</motion.div>
							);
						})}
					</div>
				</div>

				{/* CAMPEONATO DE CONSTRUCTORES */}
				<div className="flex flex-col h-full bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 backdrop-blur-xl overflow-hidden max-w-full">
					<h2 className="text-sm font-bold tracking-widest mb-6 uppercase text-zinc-400 border-b border-zinc-900 pb-3 flex justify-between items-center w-full">
						<span>🛠️ Campeonato de Constructores</span>
						<span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-amber-500/40 rounded border border-zinc-800/60">TEMPORADA {year}</span>
					</h2>

					<div className="flex flex-col gap-2.5 overflow-y-auto pr-1 no-scrollbar flex-1 max-w-full">
						{showTeamsSkeleton && new Array(8).fill("").map((_, i) => <SkeletonItem key={i} />)}

						{teamsListSource && teamsListSource.length > 0 && (
							<>
								{/* PODIO ULTRA-FLEXIBLE SIN DESBORDES DE ANCHO */}
								<div className="flex gap-2 mb-2 w-full justify-between items-center min-w-0">
									{teamsListSource.slice(0, 3).map((team: any, index: number) => {
										const shadowStyles = 
											index === 0 ? "shadow-[0_0_20px_rgba(234,179,8,0.05)] border-yellow-500/20" : 
											index === 1 ? "shadow-[0_0_20px_rgba(226,232,240,0.03)] border-slate-400/10" : 
											"shadow-[0_0_20px_rgba(180,83,9,0.02)] border-amber-700/10";

										const teamName = team.Constructor?.name || team.name || "Escudería";

										return (
											<motion.div
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												key={`podium-team-${year}-${team.Constructor?.constructorId || index}-${index}`}
												className={clsx("relative flex-1 flex flex-col items-center justify-between p-2 rounded-xl border bg-zinc-900/10 backdrop-blur-md text-center h-36 min-w-0 overflow-hidden", shadowStyles)}
											>
												<span className="absolute top-2 left-3 text-[9px] font-black text-zinc-500">#0{team.position}</span>
												<span className="text-xl mt-1">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
												<div className="flex flex-col items-center mt-1 min-w-0 w-full">
													<TeamLogo teamName={teamName} />
													<p className="text-[9px] font-black truncate w-full mt-2 text-zinc-300 uppercase px-1">
														{teamName}
													</p>
												</div>
												<p className="text-[11px] font-black tracking-tight text-white uppercase">{team.points} <span className="text-[8px] text-zinc-500 font-normal">PTS</span></p>
											</motion.div>
										);
									})}
								</div>

								{/* RESTO DE LA PARRILLA DE CONSTRUCTORES */}
								{teamsListSource.slice(3).map((team: any, index: number) => {
									const ptsPercent = (parseFloat(team.points) / maxTeamPoints) * 100;
									const cId = team.Constructor?.constructorId?.toLowerCase() || team.constructorId?.toLowerCase() || "";
									const teamBorderColor = constructorColorMap[cId] || "#3f3f46";
									const teamName = team.Constructor?.name || team.name || "Escudería";

									return (
										<motion.div
											initial={{ opacity: 0, x: 12 }}
											animate={{ opacity: 1, x: 0 }}
											className="relative grid items-center p-3 rounded-xl bg-zinc-900/20 backdrop-blur-md border border-zinc-900 hover:border-zinc-800/80 transition-all h-14 max-w-full"
											style={{
												gridTemplateColumns: "2.5rem 2.5rem auto 5rem",
												borderLeft: `4px solid ${teamBorderColor}`
											}}
											key={`${year}-${cId}-${index}`}
										>
											<div className="absolute inset-0 bg-zinc-800/5 rounded-r-xl pointer-events-none overflow-hidden">
												<div className="h-full opacity-10 transition-all duration-500" style={{ width: `${ptsPercent}%`, backgroundColor: teamBorderColor }} />
											</div>

											<p className="font-black text-xs text-zinc-500 text-center">#{team.position}</p>
											
											<div className="w-6 h-6 relative flex items-center justify-center z-10 flex-shrink-0">
												<TeamLogo teamName={teamName} />
											</div>

											<p className="text-xs font-black text-zinc-200 z-10 pl-2 uppercase truncate">{teamName}</p>

											<p className="font-black text-right text-xs tracking-tight text-zinc-100 z-10 uppercase">
												{team.points} <span className="text-[9px] text-zinc-500 font-normal">pts</span>
											</p>
										</motion.div>
									);
								})}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const SkeletonItem = () => {
	return (
		<div className="h-14 w-full animate-pulse rounded-xl bg-zinc-900/50 border border-zinc-900" />
	);
};