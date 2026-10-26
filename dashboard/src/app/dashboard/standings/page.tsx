"use client";

import { useEffect, useState, useMemo } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import {
	Trophy,
	Wrench,
	ChevronDown,
	X,
	Flag as FlagIcon,
	Medal,
	Flame,
	Calendar,
	Users,
	Sparkles,
} from "lucide-react";

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
	aston_martin: "#006f62", audi: "#c0c0c0", cadillac: "#94a3b8",
	renault: "#fff000", benetton: "#00a850", brawn: "#d2f500", "racing point": "#f596c8",
	"force india": "#f58220", "toro rosso": "#002b80", alphatauri: "#00293f",
	lotus: "#004225", sauber: "#002b49", "alfa romeo": "#8b0000"
};

// Helper para obtener foto del piloto (mono histórico o actual)
function getDriverAvatarUrl(driverCode: string, driverId: string, familyName: string): string {
	const code = (driverCode || "").toUpperCase();
	const id = (driverId || familyName || "").toLowerCase();

	if (code === "ALO" || id.includes("alonso")) return "/alonso.png";
	if (code === "COL" || id.includes("colapinto")) return "/colapinto.png";
	if (code === "HAM" || id.includes("hamilton")) return "/drivers/records/hamilton.jpg";
	if (code === "LEC" || id.includes("leclerc")) return "/drivers/records/leclerc.jpg";
	if (code === "VER" || id.includes("verstappen")) return "/drivers/records/verstappen.jpg";
	if (code === "NOR" || id.includes("norris")) return "/drivers/records/norris.jpg";
	if (code === "SAI" || id.includes("sainz")) return "/drivers/records/sainz.jpg";
	if (code === "PIA" || id.includes("piastri")) return "/piastri.png";
	if (code === "RUS" || id.includes("russell")) return "/george.png";
	if (code === "BOT" || id.includes("bottas")) return "/drivers/records/bottas.jpg";
	if (code === "RIC" || id.includes("ricciardo")) return "/drivers/records/ricciardo.jpg";
	if (id.includes("schumacher")) return "/drivers/records/schumacher.jpg";
	if (id.includes("barrichello")) return "/drivers/records/barrichello.jpg";
	if (id.includes("de_la_rosa") || id.includes("rosa")) return "/drivers/records/delarosa.jpg";

	return "";
}

const TeamLogo = ({ teamName, className = "w-5 h-5" }: { teamName: string; className?: string }) => {
	const cleanName = (teamName || "").toLowerCase().trim();
	const [fallbackIndex, setFallbackIndex] = useState(0);

	const fallbacks: string[] = [];
	if (cleanName.includes("red bull")) {
		fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg");
	} else if (cleanName.includes("alpine")) {
		fallbacks.push("/team-logos/alpine-f1-team.svg", "/team-logos/alpine.svg");
	} else if (cleanName.includes("rb f1") || cleanName === "rb" || cleanName.includes("bulls") || cleanName.includes("racing bulls")) {
		fallbacks.push("/team-logos/rb-f1-team.svg", "/team-logos/rb.svg");
	} else if (cleanName.includes("haas")) {
		fallbacks.push("/team-logos/haas-f1-team.svg", "/team-logos/haas.svg");
	} else if (cleanName.includes("audi")) {
		fallbacks.push("/team-logos/audi.svg");
	} else if (cleanName.includes("cadillac")) {
		fallbacks.push("/team-logos/cadillac-f1-team.svg", "/team-logos/cadillac.svg");
	} else if (cleanName.includes("aston")) {
		fallbacks.push("/team-logos/aston-martin.svg");
	} else if (cleanName.includes("mclaren")) {
		fallbacks.push("/team-logos/mclaren.svg");
	} else if (cleanName.includes("ferrari")) {
		fallbacks.push("/team-logos/ferrari.svg");
	} else if (cleanName.includes("mercedes")) {
		fallbacks.push("/team-logos/mercedes.svg");
	} else if (cleanName.includes("williams")) {
		fallbacks.push("/team-logos/williams.svg");
	} else if (cleanName.includes("renault")) {
		fallbacks.push("/team-logos/renault.svg");
	} else if (cleanName.includes("benetton")) {
		fallbacks.push("/team-logos/benetton.svg");
	} else if (cleanName.includes("brawn")) {
		fallbacks.push("/team-logos/brawn.svg");
	} else if (cleanName.includes("racing point") || cleanName.includes("racing_point")) {
		fallbacks.push("/team-logos/racing-point.svg");
	} else if (cleanName.includes("force india") || cleanName.includes("force_india")) {
		fallbacks.push("/team-logos/force-india.svg");
	} else if (cleanName.includes("toro rosso") || cleanName.includes("toro_rosso")) {
		fallbacks.push("/team-logos/toro-rosso.svg");
	} else if (cleanName.includes("alphatauri")) {
		fallbacks.push("/team-logos/alphatauri.svg");
	} else if (cleanName.includes("lotus")) {
		fallbacks.push("/team-logos/lotus.svg");
	} else if (cleanName.includes("bmw")) {
		fallbacks.push("/team-logos/bmw-sauber.svg");
	} else if (cleanName.includes("toyota")) {
		fallbacks.push("/team-logos/toyota.svg");
	} else if (cleanName.includes("jordan")) {
		fallbacks.push("/team-logos/jordan.svg");
	} else if (cleanName.includes("jaguar")) {
		fallbacks.push("/team-logos/jaguar.svg");
	} else if (cleanName.includes("alfa romeo") || cleanName.includes("alfa")) {
		fallbacks.push("/team-logos/alfa-romeo.svg");
	} else if (cleanName.includes("sauber")) {
		fallbacks.push("/team-logos/sauber.svg");
	} else {
		fallbacks.push(`/team-logos/${cleanName.replaceAll(" ", "-")}.svg`);
	}
	fallbacks.push("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>");

	// Solo invertimos logos oscuros/negros monócromos. ¡McLaren NO se invierte para preservar el naranja papaya #ff8000!
	const isDarkLogo = cleanName.includes("audi") || cleanName.includes("cadillac");

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

	// Modales interactivos
	const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
	const [driverSeasonResults, setDriverSeasonResults] = useState<any[]>([]);
	const [loadingDriverModal, setLoadingDriverModal] = useState(false);

	const [selectedConstructor, setSelectedConstructor] = useState<any | null>(null);
	const [constructorSeasonResults, setConstructorSeasonResults] = useState<any[]>([]);
	const [loadingConstructorModal, setLoadingConstructorModal] = useState(false);

	// 📜 Selector histórico desde 1950 (origen de la F1) hasta 2026
	const availableYears = useMemo(() => {
		return Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 2026 - i);
	}, []);

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

					if (year >= 1958) {
						const resTeams = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`);
						const dataTeams = await resTeams.json();
						const tList = dataTeams?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings;
						setExtTeams(tList || []);
					} else {
						setExtTeams([]);
					}
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
	}, [year, driverStandingsLive, teamStandingsLive, shouldFetchData]);

	// Fetch de resultados carrera por carrera al abrir modal de piloto
	useEffect(() => {
		if (!selectedDriver) {
			setDriverSeasonResults([]);
			return;
		}

		let isMounted = true;
		async function fetchDriverResults() {
			setLoadingDriverModal(true);
			try {
				const dId = selectedDriver.driverId || selectedDriver.Driver?.driverId;
				if (dId && year !== 2026) {
					const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers/${dId}/results.json`);
					const data = await res.json();
					if (isMounted) {
						const races = data?.MRData?.RaceTable?.Races || [];
						setDriverSeasonResults(races);
					}
				} else {
					setDriverSeasonResults([]);
				}
			} catch (e) {
				console.error(e);
			} finally {
				if (isMounted) setLoadingDriverModal(false);
			}
		}

		fetchDriverResults();

		return () => {
			isMounted = false;
		};
	}, [selectedDriver, year]);

	// Fetch de resultados del constructor al abrir modal de escudería
	useEffect(() => {
		if (!selectedConstructor) {
			setConstructorSeasonResults([]);
			return;
		}

		let isMounted = true;
		async function fetchConstructorResults() {
			setLoadingConstructorModal(true);
			try {
				const cId = selectedConstructor.constructorId || selectedConstructor.Constructor?.constructorId;
				if (cId && year !== 2026) {
					const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructors/${cId}/results.json`);
					const data = await res.json();
					if (isMounted) {
						const races = data?.MRData?.RaceTable?.Races || [];
						setConstructorSeasonResults(races);
					}
				} else {
					setConstructorSeasonResults([]);
				}
			} catch (e) {
				console.error(e);
			} finally {
				if (isMounted) setLoadingConstructorModal(false);
			}
		}

		fetchConstructorResults();

		return () => {
			isMounted = false;
		};
	}, [selectedConstructor, year]);

	// Desglose de puntos por piloto para la escudería seleccionada
	const teamDriverBreakdown = useMemo(() => {
		if (!constructorSeasonResults || constructorSeasonResults.length === 0) return [];
		const driversMap: Record<string, { name: string; code: string; points: number; wins: number; podiums: number; races: number }> = {};

		constructorSeasonResults.forEach((race: any) => {
			const results = race.Results || [];
			results.forEach((r: any) => {
				const dId = r.Driver?.driverId || r.Driver?.familyName || "driver";
				const name = `${r.Driver?.givenName ? r.Driver.givenName[0] + '.' : ''} ${r.Driver?.familyName || ''}`;
				const code = r.Driver?.code || r.Driver?.familyName?.slice(0, 3).toUpperCase() || "";
				const pts = parseFloat(r.points) || 0;
				const pos = parseInt(r.position, 10);

				if (!driversMap[dId]) {
					driversMap[dId] = { name, code, points: 0, wins: 0, podiums: 0, races: 0 };
				}
				driversMap[dId].points += pts;
				driversMap[dId].races += 1;
				if (pos === 1) driversMap[dId].wins += 1;
				if (pos >= 1 && pos <= 3) driversMap[dId].podiums += 1;
			});
		});

		return Object.values(driversMap).sort((a, b) => b.points - a.points);
	}, [constructorSeasonResults]);

	// Bloquear scroll de fondo si hay un modal abierto
	useEffect(() => {
		if (selectedDriver || selectedConstructor) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [selectedDriver, selectedConstructor]);

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
					{/* Cabecera con selector histórico unificado */}
					<div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
								<Trophy className="w-4 h-4" />
							</div>
							<div>
								<h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
									Campeonato de Pilotos
								</h2>
								<p className="text-[10px] text-zinc-400 font-medium">Toca un piloto para ver su desglose</p>
							</div>
						</div>
						
						{/* Selector histórico desde 1950 */}
						<div className="relative">
							<select 
								value={year} 
								onChange={(e) => setYear(Number(e.target.value))}
								aria-label="Seleccionar temporada del campeonato"
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

					{/* Lista de Pilotos (con logo de escudería y clic para modal) */}
					<div className="flex flex-col gap-1.5 overflow-y-auto pr-1 no-scrollbar flex-1 max-w-full">
						{showDriversSkeleton && new Array(12).fill("").map((_, i) => <SkeletonItem key={i} />)}

						{driversListSource && driversListSource.map((driver: any, index: number) => {
							const driverCode = driver.Driver?.code || driver.code || driver.Driver?.familyName?.slice(0, 3).toUpperCase() || "F1";
							const driverId = driver.Driver?.driverId || driver.driverId || driverCode.toLowerCase();
							
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
									transition={{ delay: Math.min(index * 0.012, 0.3) }}
									key={`${year}-${driverCode}-${index}`}
									onClick={() => setSelectedDriver({ ...driver, driverId, driverCode, historicTeamName, countryCode, givenName, familyName })}
									className={clsx(
										"relative flex items-center justify-between p-2.5 rounded-xl border transition-all h-12 cursor-pointer group select-none",
										cardStyle,
										isFav && "ring-1 ring-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
									)}
								>
									{/* Lado izquierdo: Franja, Posición, Bandera, Logo Escudería y Nombre */}
									<div className="flex items-center gap-2.5 min-w-0 truncate flex-1 pr-2 z-10">
										<div
											className="w-1 self-stretch rounded-full shrink-0 my-0.5"
											style={{ backgroundColor: badgeColor.bg }}
										/>

										<div className="w-5 flex justify-center items-center shrink-0">
											{renderPositionBadge()}
										</div>

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

										{/* Logo de la Escudería al lado del piloto */}
										<TeamLogo teamName={historicTeamName} className="w-4 h-4" />

										<div className="flex items-center gap-2 truncate min-w-0">
											<p className={clsx("text-xs sm:text-sm font-bold truncate uppercase group-hover:text-amber-300 transition-colors", isP1 ? "text-amber-200" : "text-zinc-100")}>
												{givenName ? givenName[0] + '.' : ''} {familyName}
											</p>
											<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate hidden sm:inline">
												· {historicTeamName}
											</span>
										</div>
									</div>

									{/* Lado derecho: Puntos y GAP */}
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
					{/* Cabecera de Constructores sincronizada */}
					<div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
								<Wrench className="w-4 h-4" />
							</div>
							<div>
								<h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
									Campeonato de Constructores
								</h2>
								<p className="text-[10px] text-zinc-400 font-medium">Toca un equipo para ver sus pilotos</p>
							</div>
						</div>
						
						<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-300">
							<span className="size-1.5 rounded-full bg-amber-400" />
							<span>F1 {year}</span>
						</div>
					</div>

					{/* Lista de Constructores (sin barras de progreso, con clic para modal) */}
					<div className="flex flex-col gap-1.5 overflow-y-auto pr-1 no-scrollbar flex-1 max-w-full">
						{year < 1958 ? (
							<div className="h-64 flex flex-col items-center justify-center p-6 text-center rounded-xl bg-zinc-900/20 border border-zinc-800">
								<Wrench className="w-8 h-8 text-zinc-500 mb-2" />
								<p className="text-sm font-bold text-zinc-300">Sin Campeonato de Constructores</p>
								<p className="text-xs text-zinc-500 max-w-xs mt-1">
									El Campeonato Mundial de Constructores de la FIA fue instaurado oficialmente a partir de la temporada 1958.
								</p>
							</div>
						) : (
							<>
								{showTeamsSkeleton && new Array(8).fill("").map((_, i) => <SkeletonItem key={i} />)}

								{teamsListSource && teamsListSource.map((team: any, index: number) => {
									const cId = team.Constructor?.constructorId?.toLowerCase() || team.constructorId?.toLowerCase() || "";
									const teamBorderColor = constructorColorMap[cId] || "#3f3f46";
									const teamName = team.Constructor?.name || team.name || "Escudería";

									const posNum = parseInt(team.position, 10);
									const isP1 = posNum === 1;
									const isP2 = posNum === 2;
									const isP3 = posNum === 3;

									const ptsNum = parseFloat(team.points) || 0;
									const gapToLeader = leaderTeamPoints > 0 && !isP1 ? leaderTeamPoints - ptsNum : 0;

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
										return <span className="font-mono font-bold text-xs text-zinc-400">#{team.position}</span>;
									};

									return (
										<motion.div
											initial={{ opacity: 0, x: 8 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: Math.min(index * 0.015, 0.3) }}
											key={`${year}-${cId}-${index}`}
											onClick={() => setSelectedConstructor({ ...team, constructorId: cId, teamName, teamBorderColor })}
											className={clsx(
												"relative flex items-center justify-between p-2.5 rounded-xl border transition-all h-12 cursor-pointer group select-none",
												cardStyle
											)}
										>
											<div className="flex items-center gap-2.5 min-w-0 truncate flex-1 pr-2">
												<div
													className="w-1 self-stretch rounded-full shrink-0 my-0.5"
													style={{ backgroundColor: teamBorderColor }}
												/>

												<div className="w-5 flex justify-center items-center shrink-0">
													{renderPositionBadge()}
												</div>

												<div className="w-5 h-5 flex items-center justify-center shrink-0">
													<TeamLogo teamName={teamName} className="w-5 h-5" />
												</div>

												<p className="text-xs sm:text-sm font-bold text-zinc-100 uppercase truncate group-hover:text-amber-300 transition-colors">
													{teamName}
												</p>
											</div>

											<div className="flex items-baseline gap-2 shrink-0">
												{gapToLeader > 0 && (
													<span className="text-[10px] text-zinc-400 font-semibold hidden md:inline">
														-{gapToLeader}
													</span>
												)}
												<div className="text-right">
													<span className={clsx("font-black text-xs sm:text-sm tracking-tight", isP1 ? "text-amber-300" : "text-white")}>
														{team.points}
													</span>
													<span className="text-[9px] text-zinc-400 font-medium ml-1">PTS</span>
												</div>
											</div>
										</motion.div>
									);
								})}
							</>
						)}
					</div>
				</div>
			</div>

			{/* 🏎️ MODAL 1: DESGLOSE DE TEMPORADA DEL PILOTO (CLICK EN PILOTO) */}
			<AnimatePresence>
				{selectedDriver && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md"
						onClick={() => setSelectedDriver(null)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{ duration: 0.25 }}
							onClick={(e) => e.stopPropagation()}
							className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
						>
							{/* Botón de cierre */}
							<button
								onClick={() => setSelectedDriver(null)}
								className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-10"
							>
								<X className="w-4 h-4" />
							</button>

							{/* Cabecera del Piloto: Avatar con Mono, Nombre y Puntos */}
							<div className="flex items-center gap-4 pb-4 border-b border-zinc-800/80">
								{(() => {
									const avatarUrl = getDriverAvatarUrl(
										selectedDriver.driverCode,
										selectedDriver.driverId,
										selectedDriver.familyName
									);
									return avatarUrl ? (
										<img
											src={avatarUrl}
											alt={selectedDriver.familyName}
											className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-top border-2 border-amber-500/60 shadow-lg bg-zinc-900 shrink-0"
										/>
									) : (
										<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-zinc-900 border border-amber-500/40 flex items-center justify-center text-xl font-black text-amber-400 shrink-0">
											{selectedDriver.driverCode || "F1"}
										</div>
									);
								})()}

								<div className="flex flex-col min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
											{year} · Posición #{selectedDriver.position}
										</span>
										{selectedDriver.countryCode && (
											<img
												src={`https://flagcdn.com/w20/${selectedDriver.countryCode}.png`}
												alt=""
												className="w-4 h-auto rounded-xs shadow-xs"
											/>
										)}
									</div>

									<h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight truncate mt-1">
										{selectedDriver.givenName} {selectedDriver.familyName}
									</h3>

									<div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-300 font-bold uppercase truncate">
										<TeamLogo teamName={selectedDriver.historicTeamName} className="w-4 h-4" />
										<span>{selectedDriver.historicTeamName}</span>
									</div>
								</div>

								{/* Puntos acumulados en grande */}
								<div className="text-right shrink-0">
									<span className="text-2xl sm:text-3xl font-black text-amber-400">
										{selectedDriver.points}
									</span>
									<span className="text-[10px] text-zinc-400 block font-bold uppercase">Puntos Totales</span>
								</div>
							</div>

							{/* Tabla de carreras disputadas (Desglose de cómo llegó a esos puntos) */}
							<div className="flex flex-col flex-1 overflow-hidden mt-4">
								<div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
									<span>Desglose de Carreras en {year}</span>
									<span>Posición & Puntos</span>
								</div>

								{loadingDriverModal ? (
									<div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">
										Cargando telemetría oficial de la temporada...
									</div>
								) : driverSeasonResults.length === 0 ? (
									<div className="h-48 flex items-center justify-center text-zinc-500 text-xs text-center p-4">
										{year === 2026
											? "Temporada 2026 en curso. Los puntos corresponden a la predicción oficial en vivo."
											: "Sin resultados de carrera detallados disponibles para esta temporada."}
									</div>
								) : (
									<div className="flex flex-col gap-1.5 overflow-y-auto pr-1 no-scrollbar flex-1">
										{driverSeasonResults.map((race: any, i: number) => {
											const res = race.Results?.[0];
											const pos = res ? res.position : "-";
											const pts = res ? parseFloat(res.points) : 0;
											const status = res?.status || "Finalizado";
											const isDNF = status !== "Finished" && !status.startsWith("+");
											const isWin = pos === "1";
											const isPodium = pos === "2" || pos === "3";

											return (
												<div
													key={i}
													className={clsx(
														"flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all",
														isWin
															? "bg-amber-500/10 border-amber-500/40 text-amber-200"
															: isPodium
															? "bg-zinc-800/40 border-zinc-700/60 text-zinc-200"
															: isDNF
															? "bg-red-950/20 border-red-900/30 text-zinc-400"
															: "bg-zinc-900/30 border-zinc-800/60 text-zinc-300"
													)}
												>
													<div className="flex items-center gap-2.5 min-w-0 truncate">
														<span className="font-mono text-[10px] text-zinc-400 font-bold w-6 shrink-0">
															R{race.round}
														</span>
														<p className="font-bold truncate text-white uppercase">
															{race.raceName}
														</p>
														<span className="text-[10px] text-zinc-400 truncate hidden sm:inline">
															({race.Circuit?.circuitName || ""})
														</span>
													</div>

													<div className="flex items-center gap-3 shrink-0 font-mono">
														<span
															className={clsx(
																"font-black px-1.5 py-0.5 rounded text-[10px]",
																isWin
																	? "bg-amber-500 text-black"
																	: isPodium
																	? "bg-zinc-300 text-black"
																	: isDNF
																	? "bg-red-900/60 text-red-300"
																	: "bg-zinc-800 text-zinc-300"
															)}
														>
															{isDNF ? "DNF" : `P${pos}`}
														</span>

														<span className={clsx("font-black text-xs min-w-10 text-right", pts > 0 ? "text-amber-400" : "text-zinc-400")}>
															{pts > 0 ? `+${pts}` : "0"} <span className="text-[9px] font-normal text-zinc-400">PTS</span>
														</span>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* 🛠️ MODAL 2: DESGLOSE DE ESCUDERÍA Y APORTE DE SUS PILOTOS (CLICK EN CONSTRUCTOR) */}
			<AnimatePresence>
				{selectedConstructor && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md"
						onClick={() => setSelectedConstructor(null)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 15 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 15 }}
							transition={{ duration: 0.25 }}
							onClick={(e) => e.stopPropagation()}
							className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
						>
							{/* Botón de cierre */}
							<button
								onClick={() => setSelectedConstructor(null)}
								className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-10"
							>
								<X className="w-4 h-4" />
							</button>

							{/* Cabecera de la Escudería */}
							<div className="flex items-center gap-4 pb-4 border-b border-zinc-800/80">
								<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border border-zinc-800 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
									<TeamLogo teamName={selectedConstructor.teamName} className="w-12 h-12" />
								</div>

								<div className="flex flex-col min-w-0 flex-1">
									<span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase w-fit">
										{year} · Posición #{selectedConstructor.position}
									</span>

									<h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight truncate mt-1">
										{selectedConstructor.teamName}
									</h3>

									<p className="text-xs text-zinc-400 font-medium">
										Desglose de puntos conseguidos por cada piloto
									</p>
								</div>

								<div className="text-right shrink-0">
									<span className="text-2xl sm:text-3xl font-black text-emerald-400">
										{selectedConstructor.points}
									</span>
									<span className="text-[10px] text-zinc-400 block font-bold uppercase">Puntos del Equipo</span>
								</div>
							</div>

							{/* Desglose de los pilotos que sumaron esos puntos */}
							<div className="flex flex-col flex-1 overflow-hidden mt-4">
								<div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
									<span>Pilotos de la Escudería en {year}</span>
									<span>Aporte al Equipo</span>
								</div>

								{loadingConstructorModal ? (
									<div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">
										Calculando aporte de los pilotos de la escudería...
									</div>
								) : teamDriverBreakdown.length === 0 ? (
									<div className="h-48 flex items-center justify-center text-zinc-500 text-xs text-center p-4">
										{year === 2026
											? "Temporada 2026 en curso. Los puntos del constructor corresponden a la suma de sus pilotos oficiales."
											: "Sin desglose individual de pilotos registrado para esta escudería en este año."}
									</div>
								) : (
									<div className="flex flex-col gap-3 overflow-y-auto pr-1 no-scrollbar flex-1">
										{teamDriverBreakdown.map((driver, i) => {
											const teamPts = parseFloat(selectedConstructor.points) || 1;
											const pct = Math.min(Math.round((driver.points / teamPts) * 100), 100);
											const avatarUrl = getDriverAvatarUrl(driver.code, "", driver.name);

											return (
												<div
													key={i}
													className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80"
												>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															{avatarUrl ? (
																<img
																	src={avatarUrl}
																	alt={driver.name}
																	className="w-10 h-10 rounded-xl object-cover object-top border border-zinc-700 bg-zinc-900 shrink-0"
																/>
															) : (
																<div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
																	{driver.code || "F1"}
																</div>
															)}

															<div>
																<p className="text-sm font-bold text-white uppercase">
																	{driver.name}
																</p>
																<p className="text-[10px] text-zinc-400 font-medium">
																	{driver.races} Carreras · {driver.wins} Victorias · {driver.podiums} Podios
																</p>
															</div>
														</div>

														<div className="text-right font-mono">
															<span className="text-base font-black text-amber-300">
																{driver.points} <span className="text-xs text-zinc-400 font-normal">PTS</span>
															</span>
															<span className="text-[10px] text-emerald-400 block font-bold">
																{pct}% del equipo
															</span>
														</div>
													</div>

													{/* Barrita comparativa de aporte porcentual */}
													<div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
														<div
															className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-700"
															style={{ width: `${pct}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}

const SkeletonItem = () => {
	return (
		<div className="h-12 w-full animate-pulse rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
	);
};