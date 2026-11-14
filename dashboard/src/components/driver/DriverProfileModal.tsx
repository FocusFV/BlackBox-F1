"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, Trophy, Swords, Calendar, Gauge, Activity, Zap } from "lucide-react";
import { utc } from "moment";
import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useDriverModalStore } from "@/stores/useDriverModalStore";
import { useHeadToHeadStore } from "@/stores/useHeadToHeadStore";
import { translateGpName } from "@/lib/f1Translations";
import calendar2026 from "@/data/calendar2026.json";

function formatUpcomingRaceDate(round: string | number, rawDate: string): string {
	const r = String(round);
	if (r === "21" || rawDate === "2026-11-21" || rawDate === "2026-11-22") return "SÁB 21 NOV";
	if (r === "22" || rawDate === "2026-11-29") return "DOM 29 NOV";
	if (r === "23" || rawDate === "2026-12-06") return "DOM 06 DIC";
	try {
		const m = utc(rawDate);
		return m.isValid() ? m.format("DD · MMM").toUpperCase() : rawDate;
	} catch {
		return rawDate;
	}
}

const DRIVER_STANDINGS_2026: Record<string, { pos: string; points: string; countryCode: string; team: string; name: string }> = {
	ANT: { pos: "1", points: "390", countryCode: "it", team: "Mercedes", name: "Andrea Kimi Antonelli" },
	VER: { pos: "2", points: "279", countryCode: "nl", team: "Red Bull Racing", name: "Max Verstappen" },
	RUS: { pos: "3", points: "262", countryCode: "gb", team: "Mercedes", name: "George Russell" },
	HAM: { pos: "4", points: "261", countryCode: "gb", team: "Ferrari", name: "Lewis Hamilton" },
	LEC: { pos: "5", points: "249", countryCode: "mc", team: "Ferrari", name: "Charles Leclerc" },
	NOR: { pos: "6", points: "246", countryCode: "gb", team: "McLaren", name: "Lando Norris" },
	PIA: { pos: "7", points: "152", countryCode: "au", team: "McLaren", name: "Oscar Piastri" },
	HAD: { pos: "8", points: "122", countryCode: "fr", team: "Red Bull Racing", name: "Isack Hadjar" },
	LAW: { pos: "9", points: "89", countryCode: "nz", team: "RB F1 Team", name: "Liam Lawson" },
	GAS: { pos: "10", points: "42", countryCode: "fr", team: "Alpine F1 Team", name: "Pierre Gasly" },
	LIN: { pos: "11", points: "38", countryCode: "gb", team: "RB F1 Team", name: "Arvid Lindblad" },
	COL: { pos: "12", points: "27", countryCode: "ar", team: "Alpine F1 Team", name: "Franco Colapinto" },
	BEA: { pos: "13", points: "23", countryCode: "gb", team: "Haas F1 Team", name: "Oliver Bearman" },
	BOR: { pos: "14", points: "14", countryCode: "br", team: "Audi F1 Team", name: "Gabriel Bortoleto" },
	HUL: { pos: "15", points: "14", countryCode: "de", team: "Audi F1 Team", name: "Nico Hülkenberg" },
	OCO: { pos: "16", points: "7", countryCode: "fr", team: "Haas F1 Team", name: "Esteban Ocon" },
	ALO: { pos: "17", points: "7", countryCode: "es", team: "Aston Martin", name: "Fernando Alonso" },
	SAI: { pos: "18", points: "7", countryCode: "es", team: "Williams", name: "Carlos Sainz" },
	ALB: { pos: "19", points: "5", countryCode: "th", team: "Williams", name: "Alexander Albon" },
	TSU: { pos: "20", points: "1", countryCode: "jp", team: "RB F1 Team", name: "Yuki Tsunoda" },
	HIR: { pos: "21", points: "1", countryCode: "jp", team: "Haas F1 Team", name: "Ryo Hirakawa" },
	STR: { pos: "22", points: "0", countryCode: "ca", team: "Aston Martin", name: "Lance Stroll" },
	BOT: { pos: "23", points: "0", countryCode: "fi", team: "Cadillac F1 Team", name: "Valtteri Bottas" },
	PER: { pos: "24", points: "0", countryCode: "mx", team: "Cadillac F1 Team", name: "Sergio Pérez" },
	CAM: { pos: "25", points: "0", countryCode: "br", team: "Haas F1 Team", name: "Rafael Camara" },
	DOO: { pos: "21", points: "0", countryCode: "au", team: "Alpine F1 Team", name: "Jack Doohan" },
};

// 🗺️ Mapeo estricto del código TLA hacia el ID oficial de la API de Ergast/Jolpica
const DRIVER_CODE_TO_ERGAST_ID: Record<string, string> = {
	ANT: "antonelli",
	VER: "max_verstappen",
	RUS: "russell",
	HAM: "hamilton",
	LEC: "leclerc",
	NOR: "norris",
	PIA: "piastri",
	HAD: "hadjar",
	LAW: "lawson",
	GAS: "gasly",
	LIN: "arvid_lindblad",
	COL: "colapinto",
	BEA: "bearman",
	BOR: "bortoleto",
	HUL: "hulkenberg",
	OCO: "ocon",
	ALO: "alonso",
	SAI: "sainz",
	ALB: "albon",
	TSU: "tsunoda",
	HIR: "ryo_hirakawa",
	STR: "stroll",
	BOT: "bottas",
	PER: "perez",
	CAM: "rafael_camara",
	DOO: "doohan",
};

// 🏆 Respaldo fidedigno de estadísticas de temporada 2026 (0ms)
const DRIVER_2026_STATS: Record<string, { wins: number; podiums: number; gpPoints: number; sprintPoints: number }> = {
	ANT: { wins: 9, podiums: 17, gpPoints: 359, sprintPoints: 31 },
	VER: { wins: 4, podiums: 11, gpPoints: 261, sprintPoints: 18 },
	RUS: { wins: 3, podiums: 8, gpPoints: 247, sprintPoints: 15 },
	HAM: { wins: 2, podiums: 9, gpPoints: 249, sprintPoints: 12 },
	LEC: { wins: 2, podiums: 8, gpPoints: 239, sprintPoints: 10 },
	NOR: { wins: 3, podiums: 10, gpPoints: 236, sprintPoints: 10 },
	PIA: { wins: 1, podiums: 5, gpPoints: 147, sprintPoints: 5 },
	HAD: { wins: 1, podiums: 3, gpPoints: 119, sprintPoints: 3 },
	LAW: { wins: 0, podiums: 1, gpPoints: 89, sprintPoints: 0 },
	GAS: { wins: 0, podiums: 0, gpPoints: 42, sprintPoints: 0 },
	LIN: { wins: 0, podiums: 0, gpPoints: 38, sprintPoints: 0 },
	COL: { wins: 0, podiums: 0, gpPoints: 27, sprintPoints: 0 },
	BEA: { wins: 0, podiums: 0, gpPoints: 23, sprintPoints: 0 },
	BOR: { wins: 0, podiums: 0, gpPoints: 14, sprintPoints: 0 },
	HUL: { wins: 0, podiums: 0, gpPoints: 14, sprintPoints: 0 },
	OCO: { wins: 0, podiums: 0, gpPoints: 7, sprintPoints: 0 },
	ALO: { wins: 0, podiums: 0, gpPoints: 7, sprintPoints: 0 },
	SAI: { wins: 0, podiums: 0, gpPoints: 7, sprintPoints: 0 },
	ALB: { wins: 0, podiums: 0, gpPoints: 5, sprintPoints: 0 },
	TSU: { wins: 0, podiums: 0, gpPoints: 1, sprintPoints: 0 },
	HIR: { wins: 0, podiums: 0, gpPoints: 1, sprintPoints: 0 },
	STR: { wins: 0, podiums: 0, gpPoints: 0, sprintPoints: 0 },
	BOT: { wins: 0, podiums: 0, gpPoints: 0, sprintPoints: 0 },
	PER: { wins: 0, podiums: 0, gpPoints: 0, sprintPoints: 0 },
	CAM: { wins: 0, podiums: 0, gpPoints: 0, sprintPoints: 0 },
};

const getDriverAvatarUrl = (driverCode: string, driverId: string) => {
	const code = (driverCode || "").toUpperCase();
	const id = (driverId || "").toLowerCase();

	if (code === "COL" || id.includes("colapinto")) return "/drivers/grid/colapinto.jpg";
	if (code === "VER" || id.includes("verstappen")) return "/drivers/grid/verstappen.jpg";
	if (code === "NOR" || id.includes("norris")) return "/drivers/grid/norris.jpg";
	if (code === "LEC" || id.includes("leclerc")) return "/drivers/grid/leclerc.jpg";
	if (code === "HAM" || id.includes("hamilton")) return "/drivers/grid/hamilton.jpg";
	if (code === "RUS" || id.includes("russell")) return "/drivers/grid/russell.jpg";
	if (code === "PIA" || id.includes("piastri")) return "/drivers/grid/piastri.jpg";
	if (code === "SAI" || id.includes("sainz")) return "/drivers/grid/sainz.jpg";
	if (code === "ALO" || id.includes("alonso")) return "/drivers/grid/alonso.jpg";
	if (code === "GAS" || id.includes("gasly")) return "/drivers/grid/gasly.jpg";
	if (code === "ANT" || id.includes("antonelli")) return "/drivers/grid/antonelli.jpg";
	if (code === "ALB" || id.includes("albon")) return "/drivers/grid/albon.jpg";
	if (code === "BEA" || id.includes("bearman")) return "/drivers/grid/bearman.jpg";
	if (code === "OCO" || id.includes("ocon")) return "/drivers/grid/ocon.jpg";
	if (code === "LAW" || id.includes("lawson")) return "/drivers/grid/lawson.jpg";
	if (code === "TSU" || id.includes("tsunoda")) return "/drivers/grid/tsunoda.jpg";
	if (code === "HAD" || id.includes("hadjar")) return "/drivers/grid/hadjar.jpg";
	if (code === "HUL" || id.includes("hulkenberg") || id.includes("hülkenberg")) return "/drivers/grid/hulkenberg.jpg";
	if (code === "BOR" || id.includes("bortoleto")) return "/drivers/grid/bortoleto.jpg";
	if (code === "STR" || id.includes("stroll")) return "/drivers/grid/stroll.jpg";
	if (code === "BOT" || id.includes("bottas")) return "/drivers/grid/bottas.jpg";
	if (code === "PER" || id.includes("perez") || id.includes("pérez")) return "/drivers/grid/perez.jpg";
	if (code === "LIN" || id.includes("lindblad")) return "/drivers/grid/lindblad.jpg";
	if (code === "CAM" || id.includes("camara") || id.includes("câmara")) return "/drivers/grid/camara.jpg";
	if (code === "HIR" || id.includes("hirakawa")) return "/drivers/grid/hirakawa.jpg";
	if (code === "DOO" || id.includes("doohan")) return "/drivers/grid/doohan.jpg";

	return "";
};

const TeamLogo = ({ teamName }: { teamName: string }) => {
	const cleanName = (teamName || "").toLowerCase().trim();
	const [fallbackIndex, setFallbackIndex] = useState(0);

	const fallbacks: string[] = [];
	if (cleanName.includes("red bull")) fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg");
	else if (cleanName.includes("alpine")) fallbacks.push("/team-logos/alpine-f1-team.svg", "/team-logos/alpine.svg");
	else if (cleanName.includes("rb") || cleanName.includes("bulls")) fallbacks.push("/team-logos/rb-f1-team.svg", "/team-logos/rb.svg");
	else if (cleanName.includes("haas")) fallbacks.push("/team-logos/haas-f1-team.svg", "/team-logos/haas.svg");
	else if (cleanName.includes("audi")) fallbacks.push("/team-logos/audi.svg");
	else if (cleanName.includes("cadillac")) fallbacks.push("/team-logos/cadillac-f1-team.svg", "/team-logos/cadillac.svg");
	else if (cleanName.includes("ferrari")) fallbacks.push("/team-logos/ferrari.svg");
	else if (cleanName.includes("mercedes")) fallbacks.push("/team-logos/mercedes.svg");
	else if (cleanName.includes("mclaren")) fallbacks.push("/team-logos/mclaren.svg");
	else if (cleanName.includes("aston")) fallbacks.push("/team-logos/aston-martin.svg");
	else if (cleanName.includes("williams")) fallbacks.push("/team-logos/williams.svg");
	else fallbacks.push(`/team-logos/${cleanName.replaceAll(" ", "-")}.svg`);

	fallbacks.push("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>");

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className="w-5 h-5 object-contain shrink-0"
			onError={() => setFallbackIndex((prev) => Math.min(prev + 1, fallbacks.length - 1))}
		/>
	);
};

export default function DriverProfileModal() {
	const { t, language } = useTranslation();
	const isOpen = useDriverModalStore((s) => s.isOpen);
	const driver = useDriverModalStore((s) => s.driver);
	const close = useDriverModalStore((s) => s.close);

	const [seasonResults, setSeasonResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const rawCode = (driver?.code || driver?.driverCode || driver?.Driver?.code || "").toUpperCase();
	const driverId = driver?.driverId || driver?.Driver?.driverId || rawCode.toLowerCase();

	// Cotejar con la tabla oficial 2026
	const officialData = DRIVER_STANDINGS_2026[rawCode] || Object.values(DRIVER_STANDINGS_2026).find(d => driverId.includes(d.name.toLowerCase().split(" ").pop() || "___"));
	const driverCode = rawCode || (officialData ? Object.keys(DRIVER_STANDINGS_2026).find(k => DRIVER_STANDINGS_2026[k] === officialData) || "F1" : "F1");
	const fullName = (driver as any)?.fullName || driver?.name || officialData?.name || `${driver?.Driver?.givenName || driver?.givenName || ""} ${driver?.Driver?.familyName || driver?.familyName || ""}`.trim() || "Piloto F1";
	const teamName = driver?.teamName || driver?.historicTeamName || driver?.Constructors?.[0]?.name || officialData?.team || "F1 Team";
	const countryCode = officialData?.countryCode || driver?.countryCode || "br";
	const avatarUrl = getDriverAvatarUrl(driverCode, driverId);

	const standingPos = driver?.position || officialData?.pos || "1";
	const standingPoints = officialData?.points || driver?.points || "0";

	const [activeTab, setActiveTab] = useState<"telemetry" | "season">("telemetry");

	const driversList = useDataStore((state) => state.state?.DriverList);
	const timingLines = useDataStore((state) => state.state?.TimingData?.Lines);
	const appTimingLines = useDataStore((state) => state.state?.TimingAppData?.Lines);
	const carsDataStore = useDataStore((state) => state.carsData);

	// Buscar el número de carrera oficial del piloto por su código TLA
	const resolvedRacingNumber = useMemo(() => {
		if (!driversList) return null;
		const match = Object.entries(driversList).find(
			([_, d]) => d?.Tla?.toUpperCase() === driverCode?.toUpperCase()
		);
		return match ? match[0] : null;
	}, [driversList, driverCode]);

	const timingDriver = resolvedRacingNumber && timingLines ? timingLines[resolvedRacingNumber] : null;
	const appTiming = resolvedRacingNumber && appTimingLines ? appTimingLines[resolvedRacingNumber] : null;
	const carChannels = resolvedRacingNumber && carsDataStore ? carsDataStore[resolvedRacingNumber]?.Channels : null;

	const hasLiveTelemetry = Boolean(timingDriver || carChannels);

	useEffect(() => {
		if (isOpen) {
			setActiveTab(hasLiveTelemetry ? "telemetry" : "season");
		}
	}, [isOpen, hasLiveTelemetry]);

	useEffect(() => {
		if (!isOpen || !driver) {
			setSeasonResults([]);
			return;
		}

		let isMounted = true;
		async function fetchResults() {
			setLoading(true);
			try {
				const dId = DRIVER_CODE_TO_ERGAST_ID[driverCode] || driverId || driverCode.toLowerCase();
				if (dId) {
					const res = await fetch(`https://api.jolpi.ca/ergast/f1/2026/drivers/${dId}/results.json?limit=100`);
					if (res.ok) {
						const data = await res.json();
						const races = data?.MRData?.RaceTable?.Races || [];
						if (isMounted) setSeasonResults(races);
					}
				}
			} catch (e) {
				console.warn("[DriverProfileModal] Error fetching results:", e);
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		fetchResults();
		return () => { isMounted = false; };
	}, [isOpen, driver, driverId, driverCode]);

	// Cierre accesible con tecla Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [close]);

	if (!isOpen || !driver) return null;

	const officialTotalPoints = parseFloat(String(standingPoints).replace(/[^0-9.]/g, "")) || 0;
	const racePointsSum = seasonResults.reduce((acc: number, r: any) => {
		const p = parseFloat(r.Results?.[0]?.points);
		return acc + (!isNaN(p) ? p : 0);
	}, 0);

	const fallbackStats = DRIVER_2026_STATS[driverCode] || { wins: 0, podiums: 0, gpPoints: 0, sprintPoints: 0 };
	const wins = seasonResults.length > 0
		? seasonResults.filter((r) => r.Results?.[0]?.position === "1").length
		: fallbackStats.wins;
	const podiums = seasonResults.length > 0
		? seasonResults.filter((r) => {
				const pos = parseInt(r.Results?.[0]?.position, 10);
				return pos >= 1 && pos <= 3;
		  }).length
		: fallbackStats.podiums;
	const sprintPoints = seasonResults.length > 0
		? Math.max(0, Math.round(officialTotalPoints - racePointsSum))
		: fallbackStats.sprintPoints;

	const totalRaces = seasonResults.length > 0 ? seasonResults.length : 20;

	// Carreras restantes por disputar de la temporada 2026
	const upcoming = (calendar2026 as any[]).filter((c: any) => parseInt(c.round, 10) > 20);

	const modalContent = (
		<div
			className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none font-mono"
			onClick={close}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 15 }}
				transition={{ duration: 0.25 }}
				onClick={(e) => e.stopPropagation()}
				className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
			>
				{/* BOTÓN CERRAR - Con z-index y posición libre para no tapar los números */}
				<button
					onClick={close}
					className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-20"
				>
					<X className="w-4 h-4" />
				</button>

				{/* CABECERA: FOTO, NOMBRE, EQUIPO Y PUNTOS */}
				<div className="flex items-center gap-3 sm:gap-4 pb-4 border-b border-zinc-800/80 pr-10 sm:pr-14">
					<div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border border-zinc-700/80 p-1 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
						{avatarUrl ? (
							<img src={avatarUrl} alt={fullName} className="w-full h-full object-cover object-top rounded-xl" />
						) : (
							<span className="font-black text-amber-400 text-base sm:text-lg">{driverCode}</span>
						)}
					</div>

					<div className="flex flex-col min-w-0 flex-1">
						<div className="flex items-center gap-1.5 sm:gap-2">
							{countryCode && (
								<img
									src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
									alt=""
									className="w-3.5 sm:w-4 h-auto rounded-xs opacity-90 shadow-xs shrink-0"
								/>
							)}
							<span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase w-fit bg-zinc-900 border border-zinc-800 text-amber-400">
								2026 · #{standingPos}
							</span>
						</div>

						<h3 className="text-base sm:text-2xl font-black text-white uppercase tracking-tight leading-tight mt-0.5 line-clamp-2 sm:truncate">
							{fullName}
						</h3>

						<div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 min-w-0">
							<TeamLogo teamName={teamName} />
							<span className="text-xs text-zinc-400 font-bold uppercase truncate">{teamName}</span>
						</div>
					</div>

					<div className="text-right shrink-0">
						<span className="text-xl sm:text-3xl font-black text-amber-400 tracking-tight font-mono">
							{officialTotalPoints}
						</span>
						<span className="text-[9px] sm:text-[10px] text-zinc-400 block font-bold uppercase whitespace-nowrap">
							<span className="sm:hidden">PTS</span>
							<span className="hidden sm:inline">{t("standings_page.total_points", "Puntos Totales")}</span>
						</span>
					</div>
				</div>

				{/* SELECTOR DE PESTAÑAS: TELEMETRÍA EN VIVO / TRAYECTORIA TEMPORADA */}
				<div className="flex items-center gap-2 pt-3 pb-2 border-b border-zinc-900">
					{hasLiveTelemetry && (
						<button
							type="button"
							onClick={() => setActiveTab("telemetry")}
							className={clsx(
								"flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
								activeTab === "telemetry"
									? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
									: "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800"
							)}
						>
							<Gauge className="w-3.5 h-3.5 text-amber-400" />
							<span>Telemetría en Vivo</span>
						</button>
					)}
					<button
						type="button"
						onClick={() => setActiveTab("season")}
						className={clsx(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
							activeTab === "season" || !hasLiveTelemetry
								? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
								: "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800"
						)}
					>
						<Trophy className="w-3.5 h-3.5 text-amber-400" />
						<span>Trayectoria 2026</span>
					</button>
				</div>

				{/* VISTA 1: TELEMETRÍA EN VIVO */}
				{activeTab === "telemetry" && hasLiveTelemetry && (
					<div className="flex flex-col gap-3 py-3 overflow-y-auto flex-1 custom-scrollbar">
						{/* POSICIÓN Y BRECHAS EN PISTA */}
						<div className="grid grid-cols-3 gap-2 text-center font-mono">
							<div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
								<span className="text-[10px] text-zinc-500 font-bold uppercase block">{t("telemetry.current_position", "Posición Actual")}</span>
								<span className="text-xl font-black text-amber-400">P{timingDriver?.Position || "-"}</span>
							</div>
							<div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
								<span className="text-[10px] text-zinc-500 font-bold uppercase block">{t("telemetry.gap_to_leader", "Brecha Líder")}</span>
								<span className="text-sm font-black text-white">{timingDriver?.GapToLeader || "LÍDER"}</span>
							</div>
							<div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
								<span className="text-[10px] text-zinc-500 font-bold uppercase block">{t("telemetry.interval_ahead", "Intervalo Auto Del.")}</span>
								<span className="text-sm font-black text-emerald-400">{timingDriver?.IntervalToPositionAhead?.Value || "-"}</span>
							</div>
						</div>

						{/* TELEMETRÍA DE MOTOR ECU */}
						{carChannels && (
							<div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-2.5">
								<div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
									<span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
										<Activity className="w-3 h-3 text-emerald-400" />
										{t("telemetry.live_ecu_telemetry", "TELEMETRÍA ECU EN VIVO")}
									</span>
									<span className="text-[10px] font-bold text-amber-400 font-mono">
										{t("telemetry.pu_reg_2026", "PU REGULACIÓN 2026")}
									</span>
								</div>

								<div className="grid grid-cols-3 gap-2 text-center font-mono">
									<div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 font-bold uppercase block">{t("telemetry.speed", "Velocidad")}</span>
										<span className="text-lg font-black text-white">{carChannels[2] || 0} <span className="text-xs text-zinc-500">km/h</span></span>
									</div>
									<div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 font-bold uppercase block">{t("telemetry.gear", "Marcha")}</span>
										<span className="text-lg font-black text-amber-400">M{carChannels[3] || "N"}</span>
									</div>
									<div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 font-bold uppercase block">{t("telemetry.rpm_regime", "Régimen RPM")}</span>
										<span className="text-lg font-black text-cyan-400">{carChannels[0] || 0}</span>
									</div>
								</div>

								{/* Barras de Acelerador y Freno */}
								<div className="grid grid-cols-2 gap-3 pt-1">
									<div className="flex flex-col gap-1">
										<div className="flex justify-between text-[10px] font-mono">
											<span className="text-emerald-400 font-bold">{t("modals.car_throttle", "ACELERADOR")}</span>
											<span className="text-white font-black">{carChannels[4] || 0}%</span>
										</div>
										<div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
											<div className="h-full bg-emerald-400 transition-all duration-150" style={{ width: `${carChannels[4] || 0}%` }} />
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<div className="flex justify-between text-[10px] font-mono">
											<span className="text-red-400 font-bold">{t("modals.car_brake", "FRENO")}</span>
											<span className="text-white font-black">{carChannels[5] ? "100%" : "0%"}</span>
										</div>
										<div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
											<div className="h-full bg-red-500 transition-all duration-150" style={{ width: carChannels[5] ? "100%" : "0%" }} />
										</div>
									</div>
								</div>
							</div>
						)}

						{/* TIEMPOS DE VUELTA Y SECTORES */}
						{timingDriver && (
							<div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col gap-2 font-mono">
								<span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800/60 pb-1.5">
									SECTORES & VUELTAS
								</span>
								<div className="grid grid-cols-3 gap-2 text-center text-xs">
									<div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 block">SECTOR 1</span>
										<span className="font-bold text-white">{timingDriver.Sectors?.[0]?.Value || "-"}</span>
									</div>
									<div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 block">SECTOR 2</span>
										<span className="font-bold text-white">{timingDriver.Sectors?.[1]?.Value || "-"}</span>
									</div>
									<div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 block">SECTOR 3</span>
										<span className="font-bold text-white">{timingDriver.Sectors?.[2]?.Value || "-"}</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-2 text-center pt-1">
									<div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 block uppercase">Última Vuelta</span>
										<span className="text-sm font-black text-zinc-200">{timingDriver.LastLapTime?.Value || "-"}</span>
									</div>
									<div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-900">
										<span className="text-[9px] text-zinc-500 block uppercase">Mejor Vuelta</span>
										<span className="text-sm font-black text-purple-400">{timingDriver.BestLapTime?.Value || "-"}</span>
									</div>
								</div>
							</div>
						)}

						{/* NEUMÁTICOS Y STINT */}
						{appTiming?.Stints && (
							<div className="p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between font-mono text-xs">
								<div className="flex items-center gap-2">
									<span className="text-[9px] font-black px-2 py-1 rounded bg-zinc-800 text-amber-400 border border-zinc-700 uppercase">
										{appTiming.Stints[appTiming.Stints.length - 1]?.Compound || "MEDIO"}
									</span>
									<span className="text-zinc-300 text-xs font-bold">
										Stint Actual: {appTiming.Stints[appTiming.Stints.length - 1]?.TotalLaps || 1} Vueltas
									</span>
								</div>
								<span className="text-[10px] text-zinc-500 font-bold uppercase">
									{appTiming.Stints.length} {appTiming.Stints.length === 1 ? "STINT" : "STINTS"}
								</span>
							</div>
						)}
					</div>
				)}

				{/* VISTA 2: TRAYECTORIA 2026 */}
				{(!hasLiveTelemetry || activeTab === "season") && (
					<>
						{/* MÉTRICAS RÁPIDAS */}
						<div className="grid grid-cols-3 gap-2 py-3 border-b border-zinc-900 text-center">
							<div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-900">
								<span className="text-base font-black text-white">{totalRaces}</span>
								<span className="text-[9px] block text-zinc-500 font-bold uppercase">Carreras</span>
							</div>
							<div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-900">
								<span className="text-base font-black text-amber-400">{wins}</span>
								<span className="text-[9px] block text-zinc-500 font-bold uppercase">Victorias</span>
							</div>
							<div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-900">
								<span className="text-base font-black text-emerald-400">{podiums}</span>
								<span className="text-[9px] block text-zinc-500 font-bold uppercase">Podios</span>
							</div>
						</div>

						{/* BOTÓN PARA COMPARAR CARA A CARA */}
						<div className="pt-3 pb-1">
							<button
								type="button"
								onClick={() => {
									close();
									useHeadToHeadStore.getState().open(driverCode || driverId);
								}}
								className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-98"
							>
								<Swords className="w-4 h-4" />
								<span>Comparar en Cara a Cara</span>
							</button>
						</div>

						{/* HISTORIAL CARRERA POR CARRERA */}
						<div className="flex flex-col flex-1 overflow-hidden mt-2">
							<div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
								<span>Resultados Temporada 2026</span>
								<span>Posición & Puntos</span>
							</div>

							{/* Banner Sprint */}
							{sprintPoints > 0 && (
								<div className="flex items-center justify-between p-2.5 px-3 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-xs shadow-xs">
									<div className="flex items-center gap-2">
										<span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
											{t("standings_page.driver_modal_sprint_points", "PUNTOS SPRINT")}
										</span>
										<span className="text-zinc-300 text-[11px] font-medium">
											Carreras Sprint oficiales de la temporada
										</span>
									</div>
									<div className="text-right">
										<span className="text-amber-400 font-black">+{sprintPoints} PTS</span>
										<span className="text-[9px] text-zinc-500 ml-1.5 hidden sm:inline">
											({racePointsSum} en GP + {sprintPoints} Sprint = {officialTotalPoints} PTS)
										</span>
									</div>
								</div>
							)}

							{loading ? (
								<div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">
									Cargando telemetría oficial de la temporada...
								</div>
							) : (
								<div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
									{seasonResults.map((race: any, i: number) => {
										const res = race.Results?.[0];
										const pos = res?.position || "-";
										const pts = res?.points ? `+${res.points} PTS` : "0 PTS";
										const isP1 = pos === "1";
										const isPodium = pos === "2" || pos === "3";

										return (
											<div
												key={i}
												className={clsx(
													"flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs transition-colors gap-2",
													isP1
														? "bg-amber-500/10 border-amber-500/40 text-amber-200"
														: isPodium
														? "bg-zinc-900/60 border-zinc-700/60 text-zinc-200"
														: "bg-zinc-900/30 border-zinc-800/60 text-zinc-400"
												)}
											>
												<div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
													<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40 shrink-0">
														R{race.round}
													</span>
													<p className="font-bold text-white uppercase text-[11px] sm:text-xs leading-snug break-words">
														{translateGpName(race.raceName)}
													</p>
													<span className="text-[10px] text-zinc-500 truncate hidden sm:inline shrink-0">
														({race.Circuit?.circuitName || ""})
													</span>
												</div>

												<div className="flex items-center gap-2 sm:gap-3 shrink-0">
													<span className={clsx("font-black font-mono text-xs sm:text-sm", isP1 ? "text-amber-400" : isPodium ? "text-white" : "text-zinc-400")}>
														P{pos}
													</span>
													<span className="font-mono text-[10px] sm:text-[11px] text-zinc-500 font-semibold text-right whitespace-nowrap">
														<span className="sm:hidden">+{res?.points || 0}</span>
														<span className="hidden sm:inline">{pts}</span>
													</span>
												</div>
											</div>
										);
									})}

									{/* Próximas carreras */}
									{upcoming.length > 0 && (
										<div className="pt-2">
											<div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500/80 uppercase tracking-widest px-1 py-1">
												<Calendar className="w-3 h-3" />
												<span>Próximos Grandes Premios (3 Rondas Pendientes)</span>
											</div>
											<div className="space-y-1.5 mt-1">
												{upcoming.map((ur: any, i: number) => (
													<div
														key={`up-${i}`}
														className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/40 text-xs gap-2"
													>
														<div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
															<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-600 border border-zinc-800 shrink-0">
																R{ur.round}
															</span>
															<p className="font-semibold text-zinc-300 uppercase text-[11px] sm:text-xs leading-snug break-words">
																{translateGpName(ur.raceName)}
															</p>
														</div>
														<span className="text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-zinc-800/80 text-amber-400/90 border border-zinc-700/60 shrink-0 whitespace-nowrap">
															<span className="sm:hidden">{formatUpcomingRaceDate(ur.round, ur.date)}</span>
															<span className="hidden sm:inline">{formatUpcomingRaceDate(ur.round, ur.date)} · POR DISPUTAR</span>
														</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</>
				)}
			</motion.div>
		</div>
	);

	if (typeof document === "undefined") return null;
	return createPortal(modalContent, document.body);
}
