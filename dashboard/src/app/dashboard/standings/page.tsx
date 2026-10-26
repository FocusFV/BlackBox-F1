"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { motion } from "motion/react";
import clsx from "clsx";
import { Trophy, Wrench, ChevronDown, Award } from "lucide-react";

type ExternalDriver = {
	position: string;
	points: string;
	Driver: { givenName: string; familyName: string; code: string; nationality: string; permanentNumber?: string };
	Constructors: Array<{ name: string; constructorId: string }>;
};

type ExternalTeam = {
	position: string;
	points: string;
	Constructor: { name: string; constructorId: string };
};

const nationalityToCountryCode: { [key: string]: string } = {
	argentinian: "ar", argentine: "ar",
	british: "gb", dutch: "nl", monegasque: "mc", spanish: "es",
	australian: "au", thai: "th", french: "fr", german: "de", japanese: "jp",
	finnish: "fi", chinese: "cn", danish: "dk", canadian: "ca", mexican: "mx",
	brazilian: "br", american: "us", italian: "it", austrian: "at", 
	belgian: "be", swiss: "ch", swedish: "se", russian: "ru", polish: "pl", 
	indian: "in", indonesian: "id", venezuelan: "ve", colombian: "co",
	newzealander: "nz", malaysian: "my", czech: "cz", southafrican: "za",
	irish: "ie", hungarian: "hu", portuguese: "pt", danemark: "dk"
};

// 🌟 DICCIONARIO: Para forzar el nombre real del equipo en 2026 usando el código del piloto
const driverToTeamNameMap: { [key: string]: string } = {
	NOR: "McLaren", PIA: "McLaren",
	LEC: "Ferrari", HAM: "Ferrari", 
	VER: "Red Bull Racing", HAD: "Red Bull Racing",
	RUS: "Mercedes", ANT: "Mercedes",
	ALO: "Aston Martin", STR: "Aston Martin",
	GAS: "Alpine", COL: "Alpine", 
	MAG: "Haas", OCO: "Haas", BEA: "Haas",
	LAW: "Racing Bulls", TSU: "Racing Bulls", LIN: "Racing Bulls",
	ALB: "Williams", SAI: "Williams",
	BOT: "Cadillac F1 Team", PER: "Cadillac F1 Team",
	HUL: "Audi F1 Team", BOR: "Audi F1 Team"
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
	aston_martin: "#006f62", audi: "#c0c0c0", cadillac: "#94a3b8"
};

const TeamLogo = ({ teamName, className = "w-6 h-6" }: { teamName: string; className?: string }) => {
	const cleanName = (teamName || "").toLowerCase();
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

	const isDarkLogo = cleanName.includes("audi") || cleanName.includes("cadillac") || cleanName.includes("sauber") || cleanName.includes("renault") || cleanName.includes("mclaren");

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className={`${className} object-contain transition-all shrink-0 ${isDarkLogo ? "invert brightness-200 contrast-200" : ""}`}
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

	const availableYears = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => 2026 - i);

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
			queueMicrotask(() => {
				setExtDrivers([]);
				setExtTeams([]);
			});
		}
	}, [year, driverStandingsLive, teamStandingsLive]);

	const driversListSource: any[] = (year === 2026 && driverStandingsLive) 
		? (Array.isArray(driverStandingsLive) ? driverStandingsLive : Object.values(driverStandingsLive)).sort((a: any, b: any) => parseInt(a.position) - parseInt(b.position))
		: extDrivers;

	const teamsListSource: any[] = (year === 2026 && teamStandingsLive) 
		? (Array.isArray(teamStandingsLive) ? teamStandingsLive : Object.values(teamStandingsLive)).sort((a: any, b: any) => parseInt(a.position) - parseInt(b.position))
		: extTeams;

	const leaderDriverPoints = driversListSource && driversListSource.length > 0 ? parseFloat(driversListSource[0].points) : 0;
	const leaderTeamPoints = teamsListSource && teamsListSource.length > 0 ? parseFloat(teamsListSource[0].points) : 0;

	const showDriversSkeleton = loadingBackup && (!driversListSource || driversListSource.length === 0);
	const showTeamsSkeleton = loadingBackup && (!teamsListSource || teamsListSource.length === 0);

	return (
		<div className="flex flex-col gap-5 p-3 sm:p-5 text-white h-full font-mono">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-1 w-full max-w-full">
				
				{/* 🏁 COLUMNA 1: CAMPEONATO DE PILOTOS (WDC) */}
				<div className="flex flex-col h-full bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl overflow-hidden max-w-full">
					{/* Cabecera de Pilotos con selector estilizado de temporada */}
					<div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
								<Trophy className="w-4 h-4" />
							</div>
							<div>
								<h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
									Campeonato de Pilotos
								</h2>
								<p className="text-[10px] text-zinc-400 font-medium">World Drivers&apos; Championship</p>
							</div>
						</div>
						
						{/* Selector de Año estilo píldora de carbono */}
						<div className="relative">
							<select 
								value={year} 
								onChange={(e) => setYear(Number(e.target.value))}
								aria-label="Seleccionar año del campeonato"
								className="appearance-none bg-zinc-900 border border-zinc-700 hover:border-amber-500/60 rounded-xl py-1.5 pl-3 pr-8 text-[11px] font-black uppercase tracking-widest text-amber-400 shadow-md transition-all outline-none cursor-pointer"
							>
								{availableYears.map((y) => (
									<option key={y} value={y} className="bg-zinc-950 text-zinc-300 font-mono">
										TEMPORADA {y}
									</option>
								))}
							</select>
							<ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400" />
						</div>
					</div>

					{/* Lista de Pilotos */}
					<div className="flex flex-col gap-2 overflow-y-auto pr-1 no-scrollbar flex-1 max-w-full">
						{showDriversSkeleton && new Array(12).fill("").map((_, i) => <SkeletonItem key={i} />)}

						{driversListSource && driversListSource.map((driver: any, index: number) => {
							const driverCode = driver.Driver?.code || driver.code || driver.Driver?.familyName?.slice(0, 3).toUpperCase() || "F1";
							
							const driverNationality = (driver.Driver?.nationality || driver.nationality || "").toLowerCase().replace(/\s+/g, "");
							const countryCode = nationalityToCountryCode[driverNationality];

							const historicTeamName = year === 2026 
								? (driverToTeamNameMap[driverCode] || "F1 Team")
								: (driver.Constructors && driver.Constructors[0] ? driver.Constructors[0].name : "F1 Team");

							const badgeColor = driverTeamColorMap[driverCode] || { bg: "#3f3f46", text: "#ffffff" };
							const isFav = year === 2026 && favoriteDrivers?.includes(driverCode);

							const posNum = parseInt(driver.position, 10);
							const isP1 = posNum === 1;
							const isP2 = posNum === 2;
							const isP3 = posNum === 3;

							const ptsNum = parseFloat(driver.points) || 0;
							const gapToLeader = leaderDriverPoints > 0 && !isP1 ? leaderDriverPoints - ptsNum : 0;

							// Estilos de podio premium limpios
							const cardStyle = isP1
								? "bg-gradient-to-r from-amber-500/15 via-zinc-900/60 to-zinc-950/80 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
								: isP2
								? "bg-gradient-to-r from-zinc-400/10 via-zinc-900/50 to-zinc-950/80 border-zinc-500/40"
								: isP3
								? "bg-gradient-to-r from-amber-700/10 via-zinc-900/50 to-zinc-950/80 border-amber-700/40"
								: "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700/80";

							const renderPositionBadge = () => {
								if (isP1) return <span className="text-base">🥇</span>;
								if (isP2) return <span className="text-base">🥈</span>;
								if (isP3) return <span className="text-base">🥉</span>;
								return <span className="font-mono font-bold text-xs text-zinc-400">#{driver.position}</span>;
							};

							const givenName = driver.Driver?.givenName || driver.firstName || "";
							const familyName = driver.Driver?.familyName || driver.lastName || "Piloto";

							return (
								<motion.div
									initial={{ opacity: 0, x: 8 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.012 }}
									key={`${year}-${driverCode}-${index}`}
									className={clsx(
										"relative flex items-center justify-between p-2.5 rounded-xl border transition-all h-12 overflow-hidden",
										cardStyle,
										isFav && "ring-1 ring-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
									)}
								>
									{/* Lado izquierdo: Franja de equipo, Posición, Código, Bandera y Nombre */}
									<div className="flex items-center gap-2.5 min-w-0 truncate flex-1 pr-2 z-10">
										{/* Franja vertical de escudería */}
										<div
											className="w-1 self-stretch rounded-full shrink-0 my-0.5"
											style={{ backgroundColor: badgeColor.bg }}
										/>

										<div className="w-5 flex justify-center items-center shrink-0">
											{renderPositionBadge()}
										</div>

										{/* Código 3 letras del piloto */}
										<span
											className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded shrink-0 shadow-xs"
											style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}
										>
											{driverCode}
										</span>
										
										{countryCode && (
											<img
												src={`https://flagcdn.com/w20/${countryCode}.png`}
												alt=""
												className="w-4 h-auto rounded-xs opacity-90 shadow-xs shrink-0"
											/>
										)}

										<div className="flex items-center gap-2 truncate min-w-0">
											<p className={clsx("text-xs sm:text-sm font-bold truncate uppercase", isP1 ? "text-amber-200" : "text-zinc-100")}>
												{givenName ? givenName[0] + '.' : ''} {familyName}
											</p>
											<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate hidden sm:inline">
												· {historicTeamName}
											</span>
										</div>
									</div>

									{/* Lado derecho: Puntos y diferencia con el líder */}
									<div className="flex items-baseline gap-2 shrink-0 z-10">
										{gapToLeader > 0 && (
											<span className="text-[10px] text-zinc-400 font-semibold hidden md:inline">
												-{gapToLeader}
											</span>
										)}
										<div className="text-right">
											<span className={clsx("font-black text-xs sm:text-sm tracking-tight", isP1 ? "text-amber-300" : "text-white")}>
												{driver.points}
											</span>
											<span className="text-[9px] text-zinc-400 font-medium ml-1">PTS</span>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				</div>

				{/* 🛠️ COLUMNA 2: CAMPEONATO DE CONSTRUCTORES (WCC) */}
				<div className="flex flex-col h-full bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl overflow-hidden max-w-full">
					{/* Cabecera de Constructores */}
					<div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
								<Wrench className="w-4 h-4" />
							</div>
							<div>
								<h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
									Campeonato de Constructores
								</h2>
								<p className="text-[10px] text-zinc-400 font-medium">World Constructors&apos; Championship</p>
							</div>
						</div>
						
						<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-300">
							<span className="size-1.5 rounded-full bg-amber-400" />
							<span>FIA F1 {year}</span>
						</div>
					</div>

					{/* Lista de Constructores */}
					<div className="flex flex-col gap-2.5 overflow-y-auto pr-1 no-scrollbar flex-1 max-w-full">
						{showTeamsSkeleton && new Array(8).fill("").map((_, i) => <SkeletonItem key={i} />)}

						{teamsListSource && teamsListSource.length > 0 && (
							<>
								{/* 🏆 PODIO TOP 3 DE CONSTRUCTORES ELEVADO */}
								<div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 w-full">
									{teamsListSource.slice(0, 3).map((team: any, index: number) => {
										const teamName = team.Constructor?.name || team.name || "Escudería";
										const cId = team.Constructor?.constructorId?.toLowerCase() || team.constructorId?.toLowerCase() || "";
										const teamBorderColor = constructorColorMap[cId] || "#3f3f46";

										const isFirst = index === 0;
										const isSecond = index === 1;
										const isThird = index === 2;

										const podiumStyle = isFirst
											? "bg-gradient-to-b from-amber-500/20 via-zinc-900/80 to-zinc-950/90 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] order-2"
											: isSecond
											? "bg-gradient-to-b from-zinc-400/15 via-zinc-900/80 to-zinc-950/90 border-zinc-500/50 order-1"
											: "bg-gradient-to-b from-amber-700/15 via-zinc-900/80 to-zinc-950/90 border-amber-700/50 order-3";

										return (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												key={`podium-team-${year}-${cId}-${index}`}
												className={clsx(
													"relative flex flex-col items-center justify-between p-3 rounded-2xl border text-center h-36 overflow-hidden transition-all",
													podiumStyle
												)}
											>
												<span className="absolute top-2 left-2.5 text-[10px] font-mono font-black text-zinc-400">
													#{team.position}
												</span>

												<span className="text-xl mt-0.5">
													{isFirst ? "🥇" : isSecond ? "🥈" : "🥉"}
												</span>

												<div className="flex flex-col items-center my-1 w-full truncate">
													<TeamLogo teamName={teamName} className="w-8 h-8" />
													<p className="text-[11px] font-black truncate w-full mt-1.5 text-zinc-100 uppercase px-1">
														{teamName}
													</p>
												</div>

												<div className="w-full pt-1 border-t border-white/5">
													<p className={clsx("text-xs font-black tracking-tight", isFirst ? "text-amber-300" : "text-white")}>
														{team.points} <span className="text-[9px] text-zinc-400 font-normal">PTS</span>
													</p>
												</div>
											</motion.div>
										);
									})}
								</div>

								{/* RESTO DE LA PARRILLA DE CONSTRUCTORES (P4 EN ADELANTE, SIN BARRAS DE PROGRESO) */}
								<div className="flex flex-col gap-2">
									{teamsListSource.slice(3).map((team: any, index: number) => {
										const cId = team.Constructor?.constructorId?.toLowerCase() || team.constructorId?.toLowerCase() || "";
										const teamBorderColor = constructorColorMap[cId] || "#3f3f46";
										const teamName = team.Constructor?.name || team.name || "Escudería";

										const ptsNum = parseFloat(team.points) || 0;
										const gapToLeader = leaderTeamPoints > 0 ? leaderTeamPoints - ptsNum : 0;

										return (
											<motion.div
												initial={{ opacity: 0, x: 8 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.015 }}
												key={`${year}-${cId}-${index}`}
												className="relative flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700/80 transition-all h-12"
											>
												{/* Franja vertical de color, posición y logo */}
												<div className="flex items-center gap-2.5 min-w-0 truncate flex-1 pr-2">
													<div
														className="w-1 self-stretch rounded-full shrink-0 my-0.5"
														style={{ backgroundColor: teamBorderColor }}
													/>

													<span className="font-mono font-bold text-xs text-zinc-400 w-6 text-center shrink-0">
														#{team.position}
													</span>

													<div className="w-5 h-5 flex items-center justify-center shrink-0">
														<TeamLogo teamName={teamName} className="w-5 h-5" />
													</div>

													<p className="text-xs sm:text-sm font-bold text-zinc-100 uppercase truncate">
														{teamName}
													</p>
												</div>

												{/* Puntos y GAP */}
												<div className="flex items-baseline gap-2 shrink-0">
													{gapToLeader > 0 && (
														<span className="text-[10px] text-zinc-400 font-semibold hidden md:inline">
															-{gapToLeader}
														</span>
													)}
													<div className="text-right">
														<span className="font-black text-xs sm:text-sm tracking-tight text-white">
															{team.points}
														</span>
														<span className="text-[9px] text-zinc-400 font-medium ml-1">PTS</span>
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
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
		<div className="h-12 w-full animate-pulse rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
	);
};