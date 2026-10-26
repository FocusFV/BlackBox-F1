"use client";

import React, { useEffect, useState, useMemo } from "react";
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

// 🏎️ Componente contador animado a súper velocidad (Odometer / Speedometer)
function AnimatedCounter({
	value,
	duration = 700,
	className = "",
	style,
}: {
	value: number;
	duration?: number;
	className?: string;
	style?: React.CSSProperties;
}) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let startTimestamp: number | null = null;
		const startVal = 0;
		const endVal = isNaN(value) ? 0 : value;

		if (endVal === 0) {
			setCount(0);
			return;
		}

		let frameId: number;
		const step = (timestamp: number) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			// Curva súper rápida al inicio con desaceleración suave (Cubic ease-out)
			const ease = 1 - Math.pow(1 - progress, 3);
			const current = Math.round(startVal + ease * (endVal - startVal));
			setCount(current);

			if (progress < 1) {
				frameId = requestAnimationFrame(step);
			} else {
				setCount(endVal);
			}
		};

		frameId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frameId);
	}, [value, duration]);

	return <span className={className} style={style}>{count}</span>;
}

export type TeamTheme = {
	primary: string;         // Color principal (título, puntos destacados)
	secondary: string;       // Color secundario (puntos de pilotos, contraste)
	bgSubtle: string;        // Fondo de badges
	borderSubtle: string;    // Borde de badges y tarjetas
	barGradient: string;     // Gradiente CSS para la barrita
	glowShadow: string;      // Sombra luminosa
};

function getTeamTheme(nameOrId?: string): TeamTheme {
	const raw = (nameOrId || "").toLowerCase().trim();

	// FERRARI (Rosso Corsa & Giallo Modena)
	if (raw.includes("ferrari")) {
		return {
			primary: "#ff2800",
			secondary: "#ffd700",
			bgSubtle: "rgba(255, 40, 0, 0.15)",
			borderSubtle: "rgba(255, 40, 0, 0.45)",
			barGradient: "linear-gradient(90deg, #b91c1c 0%, #ff2800 65%, #ffd700 100%)",
			glowShadow: "rgba(255, 40, 0, 0.55)",
		};
	}

	// MERCEDES (Petronas Turquoise & Silver)
	if (raw.includes("mercedes")) {
		return {
			primary: "#00d2be",
			secondary: "#f1f5f9",
			bgSubtle: "rgba(0, 210, 190, 0.15)",
			borderSubtle: "rgba(0, 210, 190, 0.45)",
			barGradient: "linear-gradient(90deg, #0f766e 0%, #00d2be 65%, #f1f5f9 100%)",
			glowShadow: "rgba(0, 210, 190, 0.55)",
		};
	}

	// MCLAREN (Papaya Orange & Papaya Yellow)
	if (raw.includes("mclaren")) {
		return {
			primary: "#ff8700",
			secondary: "#ffd000",
			bgSubtle: "rgba(255, 135, 0, 0.15)",
			borderSubtle: "rgba(255, 135, 0, 0.45)",
			barGradient: "linear-gradient(90deg, #c2410c 0%, #ff8700 65%, #ffd000 100%)",
			glowShadow: "rgba(255, 135, 0, 0.55)",
		};
	}

	// RED BULL (Oracle Navy & Bulls Red)
	if (raw.includes("red bull") || raw.includes("red_bull")) {
		return {
			primary: "#3b82f6",
			secondary: "#ef4444",
			bgSubtle: "rgba(59, 130, 246, 0.15)",
			borderSubtle: "rgba(59, 130, 246, 0.45)",
			barGradient: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 65%, #ef4444 100%)",
			glowShadow: "rgba(59, 130, 246, 0.55)",
		};
	}

	// ASTON MARTIN (British Racing Green & Lime)
	if (raw.includes("aston")) {
		return {
			primary: "#00d4aa",
			secondary: "#cedc00",
			bgSubtle: "rgba(0, 111, 98, 0.2)",
			borderSubtle: "rgba(0, 212, 170, 0.45)",
			barGradient: "linear-gradient(90deg, #004d40 0%, #00a887 60%, #cedc00 100%)",
			glowShadow: "rgba(0, 212, 170, 0.5)",
		};
	}

	// ALPINE (Alpine Blue & BWT Pink)
	if (raw.includes("alpine")) {
		return {
			primary: "#0090ff",
			secondary: "#ff40b4",
			bgSubtle: "rgba(0, 144, 255, 0.15)",
			borderSubtle: "rgba(255, 64, 180, 0.45)",
			barGradient: "linear-gradient(90deg, #0284c7 0%, #0090ff 50%, #ff40b4 100%)",
			glowShadow: "rgba(255, 64, 180, 0.55)",
		};
	}

	// WILLIAMS (Williams Electric Blue & Cyan)
	if (raw.includes("williams")) {
		return {
			primary: "#0090ff",
			secondary: "#00e5ff",
			bgSubtle: "rgba(0, 90, 255, 0.15)",
			borderSubtle: "rgba(0, 144, 255, 0.45)",
			barGradient: "linear-gradient(90deg, #1e40af 0%, #0077ff 60%, #00e5ff 100%)",
			glowShadow: "rgba(0, 144, 255, 0.55)",
		};
	}

	// RACING BULLS / RB / TORO ROSSO / ALPHATAURI
	if (raw.includes("rb") || raw.includes("bulls") || raw.includes("toro rosso") || raw.includes("alphatauri")) {
		return {
			primary: "#5c8aff",
			secondary: "#ff3b30",
			bgSubtle: "rgba(92, 138, 255, 0.15)",
			borderSubtle: "rgba(92, 138, 255, 0.45)",
			barGradient: "linear-gradient(90deg, #1e3a8a 0%, #5c8aff 65%, #ff3b30 100%)",
			glowShadow: "rgba(92, 138, 255, 0.55)",
		};
	}

	// HAAS (Haas Red & Bright White)
	if (raw.includes("haas")) {
		return {
			primary: "#e10600",
			secondary: "#ffffff",
			bgSubtle: "rgba(225, 6, 0, 0.15)",
			borderSubtle: "rgba(225, 6, 0, 0.45)",
			barGradient: "linear-gradient(90deg, #7f1d1d 0%, #e10600 65%, #ffffff 100%)",
			glowShadow: "rgba(225, 6, 0, 0.55)",
		};
	}

	// AUDI (Audi Silver & Sport Red)
	if (raw.includes("audi")) {
		return {
			primary: "#f3f4f6",
			secondary: "#e10600",
			bgSubtle: "rgba(243, 244, 246, 0.12)",
			borderSubtle: "rgba(225, 6, 0, 0.45)",
			barGradient: "linear-gradient(90deg, #374151 0%, #9ca3af 50%, #e10600 100%)",
			glowShadow: "rgba(225, 6, 0, 0.5)",
		};
	}

	// CADILLAC (Cadillac Gold & Platinum)
	if (raw.includes("cadillac")) {
		return {
			primary: "#fbbf24",
			secondary: "#ffffff",
			bgSubtle: "rgba(251, 191, 36, 0.15)",
			borderSubtle: "rgba(251, 191, 36, 0.45)",
			barGradient: "linear-gradient(90deg, #b45309 0%, #f59e0b 60%, #ffffff 100%)",
			glowShadow: "rgba(251, 191, 36, 0.5)",
		};
	}

	// RENAULT (Renault Yellow)
	if (raw.includes("renault")) {
		return {
			primary: "#ffe600",
			secondary: "#ffffff",
			bgSubtle: "rgba(255, 230, 0, 0.15)",
			borderSubtle: "rgba(255, 230, 0, 0.45)",
			barGradient: "linear-gradient(90deg, #ca8a04 0%, #ffe600 70%, #ffffff 100%)",
			glowShadow: "rgba(255, 230, 0, 0.5)",
		};
	}

	// BENETTON (United Colors Green & Blue)
	if (raw.includes("benetton")) {
		return {
			primary: "#00a850",
			secondary: "#0090ff",
			bgSubtle: "rgba(0, 168, 80, 0.15)",
			borderSubtle: "rgba(0, 168, 80, 0.45)",
			barGradient: "linear-gradient(90deg, #006b33 0%, #00a850 60%, #0090ff 100%)",
			glowShadow: "rgba(0, 168, 80, 0.5)",
		};
	}

	// BRAWN GP (Fluorescent Neon Yellow)
	if (raw.includes("brawn")) {
		return {
			primary: "#d2f500",
			secondary: "#ffffff",
			bgSubtle: "rgba(210, 245, 0, 0.15)",
			borderSubtle: "rgba(210, 245, 0, 0.45)",
			barGradient: "linear-gradient(90deg, #849c00 0%, #d2f500 70%, #ffffff 100%)",
			glowShadow: "rgba(210, 245, 0, 0.55)",
		};
	}

	// RACING POINT / FORCE INDIA
	if (raw.includes("racing point") || raw.includes("racing_point")) {
		return {
			primary: "#f596c8",
			secondary: "#ffffff",
			bgSubtle: "rgba(245, 150, 200, 0.15)",
			borderSubtle: "rgba(245, 150, 200, 0.45)",
			barGradient: "linear-gradient(90deg, #be185d 0%, #f596c8 70%, #ffffff 100%)",
			glowShadow: "rgba(245, 150, 200, 0.5)",
		};
	}

	if (raw.includes("force india") || raw.includes("force_india")) {
		return {
			primary: "#f58220",
			secondary: "#00a850",
			bgSubtle: "rgba(245, 130, 32, 0.15)",
			borderSubtle: "rgba(245, 130, 32, 0.45)",
			barGradient: "linear-gradient(90deg, #c2410c 0%, #f58220 50%, #00a850 100%)",
			glowShadow: "rgba(245, 130, 32, 0.5)",
		};
	}

	// LOTUS (British Racing Green & Gold)
	if (raw.includes("lotus")) {
		return {
			primary: "#ffd700",
			secondary: "#00d4aa",
			bgSubtle: "rgba(0, 66, 37, 0.3)",
			borderSubtle: "rgba(255, 215, 0, 0.45)",
			barGradient: "linear-gradient(90deg, #00361e 0%, #005a32 50%, #ffd700 100%)",
			glowShadow: "rgba(255, 215, 0, 0.45)",
		};
	}

	// SAUBER / ALFA ROMEO
	if (raw.includes("alfa") || raw.includes("sauber")) {
		return {
			primary: "#c01823",
			secondary: "#ffffff",
			bgSubtle: "rgba(192, 24, 35, 0.15)",
			borderSubtle: "rgba(192, 24, 35, 0.45)",
			barGradient: "linear-gradient(90deg, #7a0c13 0%, #c01823 65%, #ffffff 100%)",
			glowShadow: "rgba(192, 24, 35, 0.5)",
		};
	}

	// DEFAULT
	return {
		primary: "#f59e0b",
		secondary: "#ffffff",
		bgSubtle: "rgba(245, 158, 11, 0.15)",
		borderSubtle: "rgba(245, 158, 11, 0.45)",
		barGradient: "linear-gradient(90deg, #d97706 0%, #f59e0b 65%, #ffffff 100%)",
		glowShadow: "rgba(245, 158, 11, 0.5)",
	};
}

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

// 🏁 Pilotos oficiales reales de la temporada 2026 (datos oficiales de la FIA)
const DEFAULT_2026_DRIVERS = [
	{ position: "1", points: "365", Driver: { driverId: "antonelli", code: "ANT", givenName: "Andrea Kimi", familyName: "Antonelli", nationality: "Italian" }, Constructors: [{ name: "Mercedes" }] },
	{ position: "2", points: "242", Driver: { driverId: "russell", code: "RUS", givenName: "George", familyName: "Russell", nationality: "British" }, Constructors: [{ name: "Mercedes" }] },
	{ position: "3", points: "241", Driver: { driverId: "hamilton", code: "HAM", givenName: "Lewis", familyName: "Hamilton", nationality: "British" }, Constructors: [{ name: "Ferrari" }] },
	{ position: "4", points: "236", Driver: { driverId: "max_verstappen", code: "VER", givenName: "Max", familyName: "Verstappen", nationality: "Dutch" }, Constructors: [{ name: "Red Bull" }] },
	{ position: "5", points: "233", Driver: { driverId: "leclerc", code: "LEC", givenName: "Charles", familyName: "Leclerc", nationality: "Monegasque" }, Constructors: [{ name: "Ferrari" }] },
	{ position: "6", points: "211", Driver: { driverId: "norris", code: "NOR", givenName: "Lando", familyName: "Norris", nationality: "British" }, Constructors: [{ name: "McLaren" }] },
	{ position: "7", points: "144", Driver: { driverId: "piastri", code: "PIA", givenName: "Oscar", familyName: "Piastri", nationality: "Australian" }, Constructors: [{ name: "McLaren" }] },
	{ position: "8", points: "105", Driver: { driverId: "hadjar", code: "HAD", givenName: "Isack", familyName: "Hadjar", nationality: "French" }, Constructors: [{ name: "Red Bull" }] },
	{ position: "9", points: "77", Driver: { driverId: "lawson", code: "LAW", givenName: "Liam", familyName: "Lawson", nationality: "New Zealander" }, Constructors: [{ name: "RB F1 Team" }] },
	{ position: "10", points: "42", Driver: { driverId: "gasly", code: "GAS", givenName: "Pierre", familyName: "Gasly", nationality: "French" }, Constructors: [{ name: "Alpine F1 Team" }] },
	{ position: "11", points: "38", Driver: { driverId: "arvid_lindblad", code: "LIN", givenName: "Arvid", familyName: "Lindblad", nationality: "British" }, Constructors: [{ name: "RB F1 Team" }] },
	{ position: "12", points: "27", Driver: { driverId: "colapinto", code: "COL", givenName: "Franco", familyName: "Colapinto", nationality: "Argentine" }, Constructors: [{ name: "Alpine F1 Team" }] },
	{ position: "13", points: "23", Driver: { driverId: "bearman", code: "BEA", givenName: "Oliver", familyName: "Bearman", nationality: "British" }, Constructors: [{ name: "Haas F1 Team" }] },
	{ position: "14", points: "13", Driver: { driverId: "hulkenberg", code: "HUL", givenName: "Nico", familyName: "Hülkenberg", nationality: "German" }, Constructors: [{ name: "Audi" }] },
	{ position: "15", points: "10", Driver: { driverId: "bortoleto", code: "BOR", givenName: "Gabriel", familyName: "Bortoleto", nationality: "Brazilian" }, Constructors: [{ name: "Audi" }] },
	{ position: "16", points: "7", Driver: { driverId: "ocon", code: "OCO", givenName: "Esteban", familyName: "Ocon", nationality: "French" }, Constructors: [{ name: "Haas F1 Team" }] },
	{ position: "17", points: "7", Driver: { driverId: "alonso", code: "ALO", givenName: "Fernando", familyName: "Alonso", nationality: "Spanish" }, Constructors: [{ name: "Aston Martin" }] },
	{ position: "18", points: "7", Driver: { driverId: "sainz", code: "SAI", givenName: "Carlos", familyName: "Sainz", nationality: "Spanish" }, Constructors: [{ name: "Williams" }] },
	{ position: "19", points: "5", Driver: { driverId: "albon", code: "ALB", givenName: "Alexander", familyName: "Albon", nationality: "Thai" }, Constructors: [{ name: "Williams" }] },
	{ position: "20", points: "1", Driver: { driverId: "tsunoda", code: "TSU", givenName: "Yuki", familyName: "Tsunoda", nationality: "Japanese" }, Constructors: [{ name: "RB F1 Team" }] },
	{ position: "21", points: "0", Driver: { driverId: "stroll", code: "STR", givenName: "Lance", familyName: "Stroll", nationality: "Canadian" }, Constructors: [{ name: "Aston Martin" }] },
	{ position: "22", points: "0", Driver: { driverId: "bottas", code: "BOT", givenName: "Valtteri", familyName: "Bottas", nationality: "Finnish" }, Constructors: [{ name: "Cadillac F1 Team" }] },
	{ position: "23", points: "0", Driver: { driverId: "perez", code: "PER", givenName: "Sergio", familyName: "Pérez", nationality: "Mexican" }, Constructors: [{ name: "Cadillac F1 Team" }] },
];

// 🛠️ Escuderías oficiales reales de la temporada 2026
const DEFAULT_2026_TEAMS = [
	{ position: "1", points: "607", Constructor: { constructorId: "mercedes", name: "Mercedes" } },
	{ position: "2", points: "474", Constructor: { constructorId: "ferrari", name: "Ferrari" } },
	{ position: "3", points: "355", Constructor: { constructorId: "red_bull", name: "Red Bull" } },
	{ position: "4", points: "355", Constructor: { constructorId: "mclaren", name: "McLaren" } },
	{ position: "5", points: "102", Constructor: { constructorId: "rb", name: "RB F1 Team" } },
	{ position: "6", points: "69", Constructor: { constructorId: "alpine", name: "Alpine F1 Team" } },
	{ position: "7", points: "30", Constructor: { constructorId: "haas", name: "Haas F1 Team" } },
	{ position: "8", points: "23", Constructor: { constructorId: "audi", name: "Audi" } },
	{ position: "9", points: "12", Constructor: { constructorId: "williams", name: "Williams" } },
	{ position: "10", points: "7", Constructor: { constructorId: "aston_martin", name: "Aston Martin" } },
	{ position: "11", points: "0", Constructor: { constructorId: "cadillac", name: "Cadillac F1 Team" } },
];

// 📸 Helper para obtener foto real con mono oficial de competición
function getDriverAvatarUrl(driverCode?: string, driverId?: string, familyName?: string): string {
	const code = (driverCode || "").toUpperCase().trim();
	const id = ((driverId || "") + " " + (familyName || "")).toLowerCase().trim();

	// Fotos oficiales en alta definición de la grilla 2026 (con mono de carrera)
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
	const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);

	const [extDrivers, setExtDrivers] = useState<any[]>(DEFAULT_2026_DRIVERS);
	const [extTeams, setExtTeams] = useState<any[]>(DEFAULT_2026_TEAMS);
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

	// Fetch oficial de la temporada (funciona para 2026 y todos los años históricos)
	useEffect(() => {
		let isMounted = true;
		const fetchStandings = async () => {
			setLoadingBackup(true);
			try {
				const resDrivers = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`);
				const dataDrivers = await resDrivers.json();
				const dList = dataDrivers?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings;
				if (isMounted) {
					if (dList && dList.length > 0) {
						setExtDrivers(dList);
					} else if (year === 2026) {
						setExtDrivers(DEFAULT_2026_DRIVERS);
					} else {
						setExtDrivers([]);
					}
				}

				if (year >= 1958) {
					const resTeams = await fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`);
					const dataTeams = await resTeams.json();
					const tList = dataTeams?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings;
					if (isMounted) {
						if (tList && tList.length > 0) {
							setExtTeams(tList);
						} else if (year === 2026) {
							setExtTeams(DEFAULT_2026_TEAMS);
						} else {
							setExtTeams([]);
						}
					}
				} else {
					if (isMounted) setExtTeams([]);
				}
			} catch (err) {
				console.error(err);
				if (isMounted) {
					if (year === 2026) {
						setExtDrivers(DEFAULT_2026_DRIVERS);
						setExtTeams(DEFAULT_2026_TEAMS);
					} else {
						setExtDrivers([]);
						setExtTeams([]);
					}
				}
			} finally {
				if (isMounted) setLoadingBackup(false);
			}
		};

		fetchStandings();

		return () => {
			isMounted = false;
		};
	}, [year]);

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
					if (isMounted) setConstructorSeasonResults([]);
				}
			} catch (e) {
				console.error(e);
				if (isMounted) setConstructorSeasonResults([]);
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
	}, [constructorSeasonResults]);

	// Carreras restantes aún no disputadas de la temporada 2026
	const upcoming2026Races = useMemo(() => {
		if (year !== 2026 || driverSeasonResults.length === 0) return [];
		const maxCompletedRound = Math.max(...driverSeasonResults.map((r: any) => parseInt(r.round, 10) || 0));
		return calendar2026.filter((c: any) => parseInt(c.round, 10) > maxCompletedRound);
	}, [year, driverSeasonResults]);

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

	const driversListSource: any[] = extDrivers;
	const teamsListSource: any[] = extTeams;

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

							const historicTeamName = driver.Constructors && driver.Constructors[0]
								? driver.Constructors[0].name
								: (driverToTeamNameMap[driverCode] || "F1 Team");

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

										{/* Foto real con mono oficial del piloto */}
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

									{/* Lado derecho: Puntos oficiales acumulados (sin diferencias negativas) */}
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

											{/* Puntos oficiales limpios (sin diferencias negativas) */}
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
				{selectedDriver && (() => {
					const pTheme = getTeamTheme(selectedDriver.historicTeamName);

					return (
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
								className="relative w-full max-w-2xl bg-zinc-950 border rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
								style={{ borderColor: pTheme.borderSubtle }}
							>
								{/* Botón de cierre */}
								<button
									onClick={() => setSelectedDriver(null)}
									className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-10"
								>
									<X className="w-4 h-4" />
								</button>

								{/* Cabecera del Piloto con mono oficial y colores de su escudería */}
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
												className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-top border-2 shadow-lg bg-zinc-900 shrink-0"
												style={{ borderColor: pTheme.primary }}
											/>
										) : (
											<div
												className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center text-xl font-black shrink-0"
												style={{
													backgroundColor: pTheme.bgSubtle,
													borderColor: pTheme.borderSubtle,
													color: pTheme.primary,
												}}
											>
												{selectedDriver.driverCode || "F1"}
											</div>
										);
									})()}

									<div className="flex flex-col min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span
												className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border shadow-xs"
												style={{
													backgroundColor: pTheme.bgSubtle,
													borderColor: pTheme.borderSubtle,
													color: pTheme.primary,
												}}
											>
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
											<span style={{ color: pTheme.primary }}>{selectedDriver.historicTeamName}</span>
										</div>
									</div>

									{/* Puntos acumulados en grande a súper velocidad con brillo temático */}
									<div className="text-right shrink-0">
										<AnimatedCounter
											value={parseFloat(selectedDriver.points) || 0}
											duration={750}
											className="text-2xl sm:text-4xl font-black tracking-tight"
											style={{
												color: pTheme.primary,
												textShadow: `0 0 25px ${pTheme.glowShadow}`,
											}}
										/>
										<span className="text-[10px] text-zinc-400 block font-bold uppercase">Puntos Totales</span>
									</div>
								</div>

								{/* Tabla de carreras disputadas (Desglose oficial de la temporada) */}
								<div className="flex flex-col flex-1 overflow-hidden mt-4">
									<div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
										<span>Carreras Disputadas en {year} ({driverSeasonResults.length})</span>
										<span>Posición & Puntos</span>
									</div>

									{loadingDriverModal ? (
										<div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">
											Cargando telemetría oficial de la temporada...
										</div>
									) : driverSeasonResults.length === 0 ? (
										<div className="h-48 flex items-center justify-center text-zinc-500 text-xs text-center p-4">
											Sin resultados de carrera registrados para este piloto en esta temporada.
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
													<motion.div
														key={i}
														initial={{ opacity: 0, y: 6 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: Math.min(i * 0.02, 0.4) }}
														className={clsx(
															"flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all",
															isWin
																? "bg-zinc-900/60 text-white"
																: isPodium
																? "bg-zinc-800/40 border-zinc-700/60 text-zinc-200"
																: isDNF
																? "bg-red-950/20 border-red-900/30 text-zinc-400"
																: "bg-zinc-900/30 border-zinc-800/60 text-zinc-300"
														)}
														style={isWin ? { borderColor: pTheme.borderSubtle } : undefined}
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
																		? "text-black font-extrabold"
																		: isPodium
																		? "bg-zinc-300 text-black"
																		: isDNF
																		? "bg-red-900/60 text-red-300"
																		: "bg-zinc-800 text-zinc-300"
																)}
																style={
																	isWin
																		? {
																				backgroundColor: pTheme.secondary || pTheme.primary,
																				boxShadow: `0 0 10px ${pTheme.glowShadow}`,
																		  }
																		: undefined
																}
															>
																{isDNF ? "DNF" : `P${pos}`}
															</span>

															<span
																className="font-black text-xs min-w-10 text-right"
																style={pts > 0 ? { color: pTheme.primary } : { color: "#71717a" }}
															>
																{pts > 0 ? `+${pts}` : "0"} <span className="text-[9px] font-normal text-zinc-400">PTS</span>
															</span>
														</div>
													</motion.div>
												);
											})}

											{/* Sección sutil con las carreras que AÚN NO SE CORRIERON en la temporada actual */}
											{upcoming2026Races.length > 0 && (
												<div className="mt-4 pt-3 border-t border-zinc-800/80">
													<p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
														<Calendar className="w-3 h-3 text-amber-500" />
														<span>Próximas carreras de la temporada 2026 (Aún no disputadas)</span>
													</p>
													<div className="flex flex-col gap-1.5 opacity-65">
														{upcoming2026Races.map((ur: any, idx: number) => (
															<div
																key={idx}
																className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800 text-xs"
															>
																<div className="flex items-center gap-2 min-w-0 truncate">
																	<span className="font-mono text-[10px] text-zinc-500 font-bold w-6 shrink-0">
																		R{ur.round}
																	</span>
																	<p className="font-semibold truncate text-zinc-400 uppercase">
																		{ur.raceName}
																	</p>
																</div>
																<span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800/80 text-amber-400/90 border border-zinc-700/60 shrink-0">
																	{ur.date} · POR DISPUTAR
																</span>
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</motion.div>
						</div>
					);
				})()}
			</AnimatePresence>

			{/* 🛠️ MODAL 2: DESGLOSE DE ESCUDERÍA Y APORTE DE SUS PILOTOS (CLICK EN CONSTRUCTOR) */}
			<AnimatePresence>
				{selectedConstructor && (() => {
					const cTheme = getTeamTheme(selectedConstructor.teamName || selectedConstructor.constructorId);

					return (
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
								className="relative w-full max-w-2xl bg-zinc-950 border rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
								style={{ borderColor: cTheme.borderSubtle }}
							>
								{/* Botón de cierre */}
								<button
									onClick={() => setSelectedConstructor(null)}
									className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-10"
								>
									<X className="w-4 h-4" />
								</button>

								{/* Cabecera de la Escudería con identidad cromática oficial */}
								<div className="flex items-center gap-4 pb-4 border-b border-zinc-800/80">
									<div
										className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border p-2.5 flex items-center justify-center shrink-0 shadow-lg"
										style={{ borderColor: cTheme.borderSubtle }}
									>
										<TeamLogo teamName={selectedConstructor.teamName} className="w-12 h-12" />
									</div>

									<div className="flex flex-col min-w-0 flex-1">
										<span
											className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase w-fit border shadow-xs"
											style={{
												backgroundColor: cTheme.bgSubtle,
												borderColor: cTheme.borderSubtle,
												color: cTheme.primary,
											}}
										>
											{year} · Posición #{selectedConstructor.position}
										</span>

										<h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight truncate mt-1">
											{selectedConstructor.teamName}
										</h3>

										<p className="text-xs text-zinc-400 font-medium">
											Aporte oficial de los pilotos a la escudería
										</p>
									</div>

									{/* Puntos totales de la escudería a súper velocidad con color oficial */}
									<div className="text-right shrink-0">
										<AnimatedCounter
											value={parseFloat(selectedConstructor.points) || 0}
											duration={750}
											className="text-2xl sm:text-4xl font-black tracking-tight"
											style={{
												color: cTheme.primary,
												textShadow: `0 0 25px ${cTheme.glowShadow}`,
											}}
										/>
										<span className="text-[10px] text-zinc-400 block font-bold uppercase">Puntos del Equipo</span>
									</div>
								</div>

								{/* Desglose de los pilotos que sumaron esos puntos con animación en barritas y súper velocidad */}
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
											Sin resultados registrados para esta escudería en este año.
										</div>
									) : (
										<div className="flex flex-col gap-3 overflow-y-auto pr-1 no-scrollbar flex-1">
											{teamDriverBreakdown.map((driver, i) => {
												const teamPts = parseFloat(selectedConstructor.points) || 1;
												const pct = Math.min(Math.round((driver.points / teamPts) * 100), 100);
												const avatarUrl = getDriverAvatarUrl(driver.code, driver.driverId, driver.fullName || driver.name);

												return (
													<motion.div
														key={i}
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: i * 0.1, duration: 0.3 }}
														className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-zinc-900/50 border transition-all shadow-md"
														style={{ borderColor: cTheme.borderSubtle }}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																{avatarUrl ? (
																	<img
																		src={avatarUrl}
																		alt={driver.name}
																		className="w-11 h-11 rounded-xl object-cover object-top border-2 bg-zinc-900 shrink-0 shadow-md"
																		style={{ borderColor: cTheme.primary }}
																	/>
																) : (
																	<div
																		className="w-11 h-11 rounded-xl bg-zinc-800 border flex items-center justify-center text-xs font-black shrink-0"
																		style={{ borderColor: cTheme.primary, color: cTheme.primary }}
																	>
																		{driver.code || "F1"}
																	</div>
																)}

																<div>
																	<p className="text-sm font-bold text-white uppercase tracking-tight">
																		{driver.name}
																	</p>
																	<p className="text-[10px] text-zinc-400 font-medium">
																		{driver.races} Carreras · {driver.wins} {driver.wins === 1 ? "Victoria" : "Victorias"} · {driver.podiums} Podios
																	</p>
																</div>
															</div>

															<div className="text-right font-mono">
																<span
																	className="text-lg font-black"
																	style={{
																		color: cTheme.secondary,
																		textShadow: `0 0 15px ${cTheme.glowShadow}`,
																	}}
																>
																	<AnimatedCounter value={driver.points} duration={700} />{" "}
																	<span className="text-xs text-zinc-400 font-normal">PTS</span>
																</span>
																<span
																	className="text-[10px] block font-bold"
																	style={{ color: cTheme.primary }}
																>
																	<AnimatedCounter value={pct} duration={700} />% del equipo
																</span>
															</div>
														</div>

														{/* 🚀 Barrita animada con el gradiente y resplandor oficial de la escudería */}
														<div
															className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border"
															style={{ borderColor: cTheme.borderSubtle }}
														>
															<motion.div
																initial={{ width: 0 }}
																animate={{ width: `${pct}%` }}
																transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
																className="h-full rounded-full"
																style={{
																	background: cTheme.barGradient,
																	boxShadow: `0 0 14px ${cTheme.glowShadow}`,
																}}
															/>
														</div>
													</motion.div>
												);
											})}
										</div>
									)}
								</div>
							</motion.div>
						</div>
					);
				})()}
			</AnimatePresence>
		</div>
	);
}

const SkeletonItem = () => {
	return (
		<div className="h-12 w-full animate-pulse rounded-xl bg-zinc-900/40 border border-zinc-800/60" />
	);
};
