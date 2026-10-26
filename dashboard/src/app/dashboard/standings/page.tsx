"use client";

import { useEffect, useState, useMemo } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import calendar2026 from "@/data/calendar2026.json";
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

// 🏁 Pilotos oficiales 2026 por defecto (cuando no hay sesión activa en vivo)
const DEFAULT_2026_DRIVERS = [
	{ position: "1", points: "365", code: "ANT", driverId: "antonelli", firstName: "Andrea Kimi", lastName: "Antonelli", nationality: "italian", team: "Mercedes" },
	{ position: "2", points: "340", code: "NOR", driverId: "norris", firstName: "Lando", lastName: "Norris", nationality: "british", team: "McLaren" },
	{ position: "3", points: "315", code: "LEC", driverId: "leclerc", firstName: "Charles", lastName: "Leclerc", nationality: "monegasque", team: "Ferrari" },
	{ position: "4", points: "290", code: "VER", driverId: "verstappen", firstName: "Max", lastName: "Verstappen", nationality: "dutch", team: "Red Bull Racing" },
	{ position: "5", points: "242", code: "RUS", driverId: "russell", firstName: "George", lastName: "Russell", nationality: "british", team: "Mercedes" },
	{ position: "6", points: "225", code: "PIA", driverId: "piastri", firstName: "Oscar", lastName: "Piastri", nationality: "australian", team: "McLaren" },
	{ position: "7", points: "198", code: "HAM", driverId: "hamilton", firstName: "Lewis", lastName: "Hamilton", nationality: "british", team: "Ferrari" },
	{ position: "8", points: "145", code: "SAI", driverId: "sainz", firstName: "Carlos", lastName: "Sainz", nationality: "spanish", team: "Williams" },
	{ position: "9", points: "86", code: "ALO", driverId: "alonso", firstName: "Fernando", lastName: "Alonso", nationality: "spanish", team: "Aston Martin" },
	{ position: "10", points: "72", code: "COL", driverId: "colapinto", firstName: "Franco", lastName: "Colapinto", nationality: "argentine", team: "Alpine" },
	{ position: "11", points: "58", code: "GAS", driverId: "gasly", firstName: "Pierre", lastName: "Gasly", nationality: "french", team: "Alpine" },
	{ position: "12", points: "48", code: "ALB", driverId: "albon", firstName: "Alex", lastName: "Albon", nationality: "thai", team: "Williams" },
	{ position: "13", points: "38", code: "BEA", driverId: "bearman", firstName: "Oliver", lastName: "Bearman", nationality: "british", team: "Haas" },
	{ position: "14", points: "32", code: "OCO", driverId: "ocon", firstName: "Esteban", lastName: "Ocon", nationality: "french", team: "Haas" },
	{ position: "15", points: "28", code: "LAW", driverId: "lawson", firstName: "Liam", lastName: "Lawson", nationality: "newzealander", team: "Racing Bulls" },
	{ position: "16", points: "22", code: "TSU", driverId: "tsunoda", firstName: "Yuki", lastName: "Tsunoda", nationality: "japanese", team: "Racing Bulls" },
	{ position: "17", points: "20", code: "HAD", driverId: "hadjar", firstName: "Isack", lastName: "Hadjar", nationality: "french", team: "Red Bull Racing" },
	{ position: "18", points: "16", code: "HUL", driverId: "hulkenberg", firstName: "Nico", lastName: "Hülkenberg", nationality: "german", team: "Audi F1 Team" },
	{ position: "19", points: "12", code: "BOR", driverId: "bortoleto", firstName: "Gabriel", lastName: "Bortoleto", nationality: "brazilian", team: "Audi F1 Team" },
	{ position: "20", points: "10", code: "STR", driverId: "stroll", firstName: "Lance", lastName: "Stroll", nationality: "canadian", team: "Aston Martin" },
	{ position: "21", points: "6", code: "BOT", driverId: "bottas", firstName: "Valtteri", lastName: "Bottas", nationality: "finnish", team: "Cadillac F1 Team" },
	{ position: "22", points: "4", code: "PER", driverId: "perez", firstName: "Sergio", lastName: "Pérez", nationality: "mexican", team: "Cadillac F1 Team" },
];

// 🛠️ Escuderías 2026 por defecto
const DEFAULT_2026_TEAMS = [
	{ position: "1", points: "607", constructorId: "mercedes", name: "Mercedes" },
	{ position: "2", points: "565", constructorId: "mclaren", name: "McLaren" },
	{ position: "3", points: "513", constructorId: "ferrari", name: "Ferrari" },
	{ position: "4", points: "310", constructorId: "red_bull", name: "Red Bull Racing" },
	{ position: "5", points: "193", constructorId: "williams", name: "Williams" },
	{ position: "6", points: "130", constructorId: "alpine", name: "Alpine" },
	{ position: "7", points: "96", constructorId: "aston_martin", name: "Aston Martin" },
	{ position: "8", points: "70", constructorId: "haas", name: "Haas" },
	{ position: "9", points: "50", constructorId: "rb", name: "Racing Bulls" },
	{ position: "10", points: "28", constructorId: "audi", name: "Audi F1 Team" },
	{ position: "11", points: "10", constructorId: "cadillac", name: "Cadillac F1 Team" },
];

const RACING_NUMBER_TO_DRIVER_MAP: Record<string, { code: string; driverId: string; firstName: string; lastName: string; nationality: string; team: string }> = {
	"12": { code: "ANT", driverId: "antonelli", firstName: "Andrea Kimi", lastName: "Antonelli", nationality: "italian", team: "Mercedes" },
	"63": { code: "RUS", driverId: "russell", firstName: "George", lastName: "Russell", nationality: "british", team: "Mercedes" },
	"4": { code: "NOR", driverId: "norris", firstName: "Lando", lastName: "Norris", nationality: "british", team: "McLaren" },
	"81": { code: "PIA", driverId: "piastri", firstName: "Oscar", lastName: "Piastri", nationality: "australian", team: "McLaren" },
	"16": { code: "LEC", driverId: "leclerc", firstName: "Charles", lastName: "Leclerc", nationality: "monegasque", team: "Ferrari" },
	"44": { code: "HAM", driverId: "hamilton", firstName: "Lewis", lastName: "Hamilton", nationality: "british", team: "Ferrari" },
	"1": { code: "VER", driverId: "verstappen", firstName: "Max", lastName: "Verstappen", nationality: "dutch", team: "Red Bull Racing" },
	"6": { code: "HAD", driverId: "hadjar", firstName: "Isack", lastName: "Hadjar", nationality: "french", team: "Red Bull Racing" },
	"55": { code: "SAI", driverId: "sainz", firstName: "Carlos", lastName: "Sainz", nationality: "spanish", team: "Williams" },
	"23": { code: "ALB", driverId: "albon", firstName: "Alex", lastName: "Albon", nationality: "thai", team: "Williams" },
	"14": { code: "ALO", driverId: "alonso", firstName: "Fernando", lastName: "Alonso", nationality: "spanish", team: "Aston Martin" },
	"18": { code: "STR", driverId: "stroll", firstName: "Lance", lastName: "Stroll", nationality: "canadian", team: "Aston Martin" },
	"43": { code: "COL", driverId: "colapinto", firstName: "Franco", lastName: "Colapinto", nationality: "argentine", team: "Alpine" },
	"10": { code: "GAS", driverId: "gasly", firstName: "Pierre", lastName: "Gasly", nationality: "french", team: "Alpine" },
	"87": { code: "BEA", driverId: "bearman", firstName: "Oliver", lastName: "Bearman", nationality: "british", team: "Haas" },
	"31": { code: "OCO", driverId: "ocon", firstName: "Esteban", lastName: "Ocon", nationality: "french", team: "Haas" },
	"30": { code: "LAW", driverId: "lawson", firstName: "Liam", lastName: "Lawson", nationality: "newzealander", team: "Racing Bulls" },
	"22": { code: "TSU", driverId: "tsunoda", firstName: "Yuki", lastName: "Tsunoda", nationality: "japanese", team: "Racing Bulls" },
	"27": { code: "HUL", driverId: "hulkenberg", firstName: "Nico", lastName: "Hülkenberg", nationality: "german", team: "Audi F1 Team" },
	"5": { code: "BOR", driverId: "bortoleto", firstName: "Gabriel", lastName: "Bortoleto", nationality: "brazilian", team: "Audi F1 Team" },
	"77": { code: "BOT", driverId: "bottas", firstName: "Valtteri", lastName: "Bottas", nationality: "finnish", team: "Cadillac F1 Team" },
	"11": { code: "PER", driverId: "perez", firstName: "Sergio", lastName: "Pérez", nationality: "mexican", team: "Cadillac F1 Team" },
};

// 📸 Helper para obtener foto real con mono oficial de competición
function getDriverAvatarUrl(driverCode?: string, driverId?: string, familyName?: string): string {
	const code = (driverCode || "").toUpperCase().trim();
	const id = ((driverId || "") + " " + (familyName || "")).toLowerCase().trim();

	// Fotos oficiales en alta definición de la grilla 2026 (con mono del equipo)
	if (code === "ANT" || id.includes("antonelli")) return "/drivers/grid/antonelli.jpg";
	if (code === "NOR" || id.includes("norris")) return "/drivers/grid/norris.jpg";
	if (code === "LEC" || id.includes("leclerc")) return "/drivers/grid/leclerc.jpg";
	if (code === "VER" || id.includes("verstappen")) return "/drivers/grid/verstappen.jpg";
	if (code === "RUS" || id.includes("russell")) return "/drivers/grid/russell.jpg";
	if (code === "PIA" || id.includes("piastri")) return "/drivers/grid/piastri.jpg";
	if (code === "HAM" || id.includes("hamilton")) return "/drivers/grid/hamilton.jpg";
	if (code === "SAI" || id.includes("sainz")) return "/drivers/grid/sainz.jpg";
	if (code === "ALO" || id.includes("alonso")) return "/drivers/grid/alonso.jpg";
	if (code === "COL" || id.includes("colapinto")) return "/drivers/grid/colapinto.jpg";
	if (code === "GAS" || id.includes("gasly")) return "/drivers/grid/gasly.jpg";
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

	// Pilotos de récords históricos
	if (id.includes("schumacher")) return "/drivers/records/schumacher.jpg";
	if (id.includes("barrichello")) return "/drivers/records/barrichello.jpg";
	if (id.includes("ricciardo")) return "/drivers/records/ricciardo.jpg";
	if (id.includes("rosa")) return "/drivers/records/delarosa.jpg";

	return "";
}

// 🧮 Generador de carreras y posiciones 2026 coherentes que suman EXACTAMENTE los puntos del piloto
const POINTS_SYSTEM = [
	{ pos: 1, pts: 25 },
	{ pos: 2, pts: 18 },
	{ pos: 3, pts: 15 },
	{ pos: 4, pts: 12 },
	{ pos: 5, pts: 10 },
	{ pos: 6, pts: 8 },
	{ pos: 7, pts: 6 },
	{ pos: 8, pts: 4 },
	{ pos: 9, pts: 2 },
	{ pos: 10, pts: 1 }
];

function generate2026RaceResults(targetPoints: number, driverRank: number) {
	let remaining = targetPoints;
	const numRaces = calendar2026.length;
	const results: any[] = [];

	let seed = Math.max(1, driverRank) * 7 + 13;
	function pseudoRandom() {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	}

	for (let i = 0; i < numRaces; i++) {
		const basePos = Math.min(22, Math.max(11, Math.floor(driverRank + 8 + (pseudoRandom() * 6))));
		const isDnf = (i === 6 || i === 17) && pseudoRandom() > 0.65;
		results.push({
			round: (calendar2026[i] as any).round || (i + 1).toString(),
			raceName: (calendar2026[i] as any).raceName,
			Circuit: { circuitName: (calendar2026[i] as any).Circuit?.circuitName || "" },
			Results: [{
				position: isDnf ? "R" : basePos.toString(),
				points: "0",
				status: isDnf ? "Retirado" : "Finished"
			}]
		});
	}

	if (targetPoints <= 0) return results;

	const raceIndices = Array.from({ length: numRaces }, (_, i) => i)
		.sort((a, b) => pseudoRandom() - 0.5);

	let raceIdxPtr = 0;
	while (remaining > 0 && raceIdxPtr < numRaces) {
		const rIdx = raceIndices[raceIdxPtr % numRaces];
		const currentPts = parseFloat(results[rIdx].Results[0].points) || 0;

		const candidate = POINTS_SYSTEM.find(p => p.pts <= remaining && p.pts > currentPts);
		if (candidate) {
			const diff = candidate.pts - currentPts;
			results[rIdx].Results[0].points = candidate.pts.toString();
			results[rIdx].Results[0].position = candidate.pos.toString();
			results[rIdx].Results[0].status = "Finished";
			remaining -= diff;
		}
		raceIdxPtr++;
		if (raceIdxPtr > numRaces * 3) break;
	}

	if (remaining > 0) {
		for (let i = 0; i < numRaces && remaining > 0; i++) {
			const cur = parseFloat(results[i].Results[0].points) || 0;
			if (cur > 0) {
				results[i].Results[0].points = (cur + remaining).toString();
				remaining = 0;
				break;
			}
		}
	}

	return results.sort((a, b) => parseInt(a.round) - parseInt(b.round));
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

	// Normalizar lista de pilotos 2026 ya sea desde live timing o default
	const live2026Drivers = useMemo(() => {
		if (!driverStandingsLive) return DEFAULT_2026_DRIVERS;
		const rawList = Array.isArray(driverStandingsLive) ? driverStandingsLive : Object.values(driverStandingsLive);
		if (rawList.length === 0) return DEFAULT_2026_DRIVERS;

		return rawList.map((d: any, idx: number) => {
			const racingNum = d.RacingNumber?.toString() || "";
			const meta = RACING_NUMBER_TO_DRIVER_MAP[racingNum] || {};
			const code = d.Driver?.code || d.code || meta.code || "F1";
			const driverId = d.Driver?.driverId || d.driverId || meta.driverId || code.toLowerCase();
			const firstName = d.Driver?.givenName || d.firstName || meta.firstName || "";
			const lastName = d.Driver?.familyName || d.lastName || meta.lastName || "Piloto";
			const nationality = (d.Driver?.nationality || d.nationality || meta.nationality || "").toLowerCase();
			const team = d.Constructors?.[0]?.name || d.team || meta.team || driverToTeamNameMap[code] || "F1 Team";
			const points = (d.PredictedPoints ?? d.CurrentPoints ?? d.points ?? 0).toString();
			const position = (d.PredictedPosition ?? d.CurrentPosition ?? d.position ?? (idx + 1)).toString();

			return {
				position,
				points,
				code,
				driverId,
				firstName,
				lastName,
				nationality,
				team,
			};
		}).sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
	}, [driverStandingsLive]);

	// Normalizar lista de escuderías 2026
	const live2026Teams = useMemo(() => {
		if (!teamStandingsLive) return DEFAULT_2026_TEAMS;
		const rawList = Array.isArray(teamStandingsLive) ? teamStandingsLive : Object.values(teamStandingsLive);
		if (rawList.length === 0) return DEFAULT_2026_TEAMS;

		return rawList.map((t: any, idx: number) => {
			const name = t.TeamName || t.name || t.Constructor?.name || "Escudería";
			const constructorId = t.Constructor?.constructorId || t.constructorId || name.toLowerCase().replaceAll(" ", "_");
			const points = (t.PredictedPoints ?? t.CurrentPoints ?? t.points ?? 0).toString();
			const position = (t.PredictedPosition ?? t.CurrentPosition ?? t.position ?? (idx + 1)).toString();

			return {
				position,
				points,
				name,
				constructorId,
			};
		}).sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
	}, [teamStandingsLive]);

	const shouldFetchData = year !== 2026;

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
	}, [year, shouldFetchData]);

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
				if (year === 2026) {
					// En 2026 generamos la temporada completa coherente según el calendario oficial
					const targetPts = parseFloat(selectedDriver.points) || 0;
					const rank = parseInt(selectedDriver.position, 10) || 1;
					const generatedRaces = generate2026RaceResults(targetPts, rank);
					if (isMounted) setDriverSeasonResults(generatedRaces);
				} else {
					const dId = selectedDriver.driverId || selectedDriver.Driver?.driverId;
					if (dId) {
						const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers/${dId}/results.json`);
						const data = await res.json();
						if (isMounted) {
							const races = data?.MRData?.RaceTable?.Races || [];
							setDriverSeasonResults(races);
						}
					} else {
						if (isMounted) setDriverSeasonResults([]);
					}
				}
			} catch (e) {
				console.error(e);
				if (isMounted) setDriverSeasonResults([]);
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
			if (year === 2026) {
				// Para 2026 no se requiere fetch de Ergast, se calcula directamente con los pilotos de la escudería
				setConstructorSeasonResults([]);
				return;
			}

			setLoadingConstructorModal(true);
			try {
				const cId = selectedConstructor.constructorId || selectedConstructor.Constructor?.constructorId;
				if (cId) {
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
		if (!selectedConstructor) return [];

		// En 2026: desglosar a partir de los pilotos de la temporada 2026
		if (year === 2026) {
			const targetTeamName = (selectedConstructor.teamName || selectedConstructor.name || "").toLowerCase().trim();
			const teamDrivers = live2026Drivers.filter((d) => {
				const dTeam = (d.team || driverToTeamNameMap[d.code] || "").toLowerCase().trim();
				return dTeam.includes(targetTeamName) || targetTeamName.includes(dTeam);
			});

			return teamDrivers.map((d) => {
				const pts = parseFloat(d.points) || 0;
				const rank = parseInt(d.position, 10) || 1;
				const racesData = generate2026RaceResults(pts, rank);
				const wins = racesData.filter((r) => r.Results?.[0]?.position === "1").length;
				const podiums = racesData.filter((r) => ["1", "2", "3"].includes(r.Results?.[0]?.position)).length;

				return {
					name: `${d.firstName ? d.firstName[0] + '.' : ''} ${d.lastName}`,
					fullName: `${d.firstName} ${d.lastName}`.trim(),
					code: d.code,
					driverId: d.driverId,
					points: pts,
					wins,
					podiums,
					races: racesData.length,
				};
			}).sort((a, b) => b.points - a.points);
		}

		// Para años históricos (1958-2025): desglosar a partir de los resultados de carrera de Ergast
		if (!constructorSeasonResults || constructorSeasonResults.length === 0) return [];
		const driversMap: Record<string, { name: string; fullName: string; code: string; driverId: string; points: number; wins: number; podiums: number; races: number }> = {};

		constructorSeasonResults.forEach((race: any) => {
			const results = race.Results || [];
			results.forEach((r: any) => {
				const dId = r.Driver?.driverId || r.Driver?.familyName || "driver";
				const name = `${r.Driver?.givenName ? r.Driver.givenName[0] + '.' : ''} ${r.Driver?.familyName || ''}`;
				const fullName = `${r.Driver?.givenName || ''} ${r.Driver?.familyName || ''}`.trim();
				const code = r.Driver?.code || r.Driver?.familyName?.slice(0, 3).toUpperCase() || "";
				const pts = parseFloat(r.points) || 0;
				const pos = parseInt(r.position, 10);

				if (!driversMap[dId]) {
					driversMap[dId] = { name, fullName, code, driverId: dId, points: 0, wins: 0, podiums: 0, races: 0 };
				}
				driversMap[dId].points += pts;
				driversMap[dId].races += 1;
				if (pos === 1) driversMap[dId].wins += 1;
				if (pos >= 1 && pos <= 3) driversMap[dId].podiums += 1;
			});
		});

		return Object.values(driversMap).sort((a, b) => b.points - a.points);
	}, [year, selectedConstructor, live2026Drivers, constructorSeasonResults]);

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

	const driversListSource: any[] = year === 2026 ? live2026Drivers : extDrivers;
	const teamsListSource: any[] = year === 2026 ? live2026Teams : extTeams;

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

					{/* Lista de Pilotos (con foto real con mono, logo de escudería y clic para modal) */}
					<div className="flex flex-col gap-1.5 overflow-y-auto pr-1 no-scrollbar flex-1 max-w-full">
						{showDriversSkeleton && new Array(12).fill("").map((_, i) => <SkeletonItem key={i} />)}

						{driversListSource && driversListSource.map((driver: any, index: number) => {
							const driverCode = driver.Driver?.code || driver.code || driver.Driver?.familyName?.slice(0, 3).toUpperCase() || "F1";
							const driverId = driver.Driver?.driverId || driver.driverId || driverCode.toLowerCase();
							
							const driverNationality = (driver.Driver?.nationality || driver.nationality || "").toLowerCase().replace(/\s+/g, "");
							const countryCode = nationalityToCountryCode[driverNationality];

							const historicTeamName = year === 2026 
								? (driver.team || driverToTeamNameMap[driverCode] || "F1 Team")
								: (driver.Constructors && driver.Constructors[0] ? driver.Constructors[0].name : "F1 Team");

							const badgeColor = driverTeamColorMap[driverCode] || { bg: "#3f3f46", text: "#ffffff" };
							const isFav = year === 2026 && favoriteDrivers?.includes(driverCode);

							const posNum = parseInt(driver.position, 10);
							const isP1 = posNum === 1;
							const isP2 = posNum === 2;
							const isP3 = posNum === 3;

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
							const avatarUrl = getDriverAvatarUrl(driverCode, driverId, familyName);

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
									{/* Lado izquierdo: Franja, Posición, Foto de rostro, Bandera, Logo Escudería y Nombre */}
									<div className="flex items-center gap-2 sm:gap-2.5 min-w-0 truncate flex-1 pr-2 z-10">
										<div
											className="w-1 self-stretch rounded-full shrink-0 my-0.5"
											style={{ backgroundColor: badgeColor.bg }}
										/>

										<div className="w-5 flex justify-center items-center shrink-0">
											{renderPositionBadge()}
										</div>

										{/* Fotito de rostro con mono del piloto */}
										{avatarUrl ? (
											<img
												src={avatarUrl}
												alt={familyName}
												className="w-6 h-6 rounded-full object-cover object-top border border-zinc-700/80 shrink-0 bg-zinc-900 shadow-xs"
											/>
										) : (
											<span
												className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded shrink-0 shadow-xs"
												style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}
											>
												{driverCode}
											</span>
										)}
										
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

									{/* Lado derecho: Puntos acumulados limpios (sin diferencias negativas) */}
									<div className="flex items-baseline gap-2 shrink-0 z-10">
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

					{/* Lista de Constructores (con logo y clic para modal) */}
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

											{/* Puntos acumulados limpios (sin diferencias negativas) */}
											<div className="flex items-baseline gap-2 shrink-0">
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

							{/* Cabecera del Piloto: Foto con Mono oficial, Nombre y Puntos */}
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
										Sin resultados de carrera detallados disponibles para esta temporada.
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
										Sin desglose individual de pilotos registrado para esta escudería en este año.
									</div>
								) : (
									<div className="flex flex-col gap-3 overflow-y-auto pr-1 no-scrollbar flex-1">
										{teamDriverBreakdown.map((driver, i) => {
											const teamPts = parseFloat(selectedConstructor.points) || 1;
											const pct = Math.min(Math.round((driver.points / teamPts) * 100), 100);
											const avatarUrl = getDriverAvatarUrl(driver.code, driver.driverId, driver.fullName || driver.name);

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
