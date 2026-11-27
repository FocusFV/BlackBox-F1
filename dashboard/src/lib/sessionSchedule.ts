import { translateSessionName, getCountryCodeForGp } from "./f1Translations";
import calendar2026 from "@/data/calendar2026.json";

export interface ScheduleSession {
	name: string;
	start: number; // ms
	end: number;   // ms
}

export interface SessionStatusResult {
	isLiveWindow: boolean;
	activeSessionName: string | null;
	nextSessionName: string | null;
	nextSessionStart: number | null;
}

// 🏎️ Parser seguro de fechas ISO/UTC
export function parseDateToMs(dateStr?: string, timeStr?: string): number | null {
	if (!dateStr) return null;
	const cleanTime = (timeStr || "12:00:00Z").trim();
	const cleanTimeZ = cleanTime.endsWith("Z") ? cleanTime : `${cleanTime}Z`;
	const fullStr = `${dateStr.trim()}T${cleanTimeZ}`;
	const timestamp = new Date(fullStr).getTime();
	return isNaN(timestamp) ? null : timestamp;
}

// 📡 Obtiene todas las sesiones del fin de semana actual/próximo
export async function getUpcomingSessions(): Promise<ScheduleSession[]> {
	try {
		// 1. Intentamos consultar la API interna o Next.js API
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
		if (apiUrl) {
			const res = await fetch(`${apiUrl}/api/schedule`, { next: { revalidate: 600 } }).catch(() => null);
			if (res && res.ok) {
				const rounds = await res.json();
				if (Array.isArray(rounds) && rounds.length > 0) {
					const now = Date.now();
					// Buscamos la ronda que no esté finalizada o la más próxima
					const activeRound = rounds.find((r: any) => new Date(r.end).getTime() >= now - 3600000) || rounds[0];
					if (activeRound && Array.isArray(activeRound.sessions)) {
						return activeRound.sessions
							.map((s: any) => ({
								name: translateSessionName(s.kind || s.name || "Sesión Oficial"),
								start: new Date(s.start).getTime(),
								end: new Date(s.end).getTime(),
							}))
							.filter((s: ScheduleSession) => !isNaN(s.start) && !isNaN(s.end));
					}
				}
			}
		}

		// 2. Fallback resiliente con Jolpica / Ergast
		const ergastRes = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
			next: { revalidate: 3600 },
		}).catch(() => null);

		if (ergastRes && ergastRes.ok) {
			const data = await ergastRes.json();
			const races = data?.MRData?.RaceTable?.Races || [];
			const now = Date.now();

			// Buscamos la carrera que aún no haya terminado (o la más cercana)
			for (const race of races) {
				const raceStart = parseDateToMs(race.date, race.time);
				if (!raceStart) continue;

				const raceEnd = raceStart + 3.5 * 3600 * 1000; // ~3h30m de carrera (con margen de bandera roja y lluvia)

				// Si el fin de semana está en curso o es el próximo
				if (raceEnd >= now - 12 * 3600 * 1000) {
					const sessions: ScheduleSession[] = [];

					const sessionDefs = [
						{ key: "FirstPractice", name: "Práctica 1", dur: 2 },
						{ key: "SecondPractice", name: "Práctica 2", dur: 2 },
						{ key: "ThirdPractice", name: "Práctica 3", dur: 2 },
						{ key: "SprintQualifying", name: "Sprint Shootout", dur: 2 },
						{ key: "Sprint", name: "Carrera Sprint", dur: 2 },
						{ key: "Qualifying", name: "Clasificación", dur: 3 }, // 3 horas para tolerar banderas rojas o lluvia intensa
					];

					for (const def of sessionDefs) {
						if (race[def.key]) {
							const start = parseDateToMs(race[def.key].date, race[def.key].time);
							if (start) {
								sessions.push({
									name: def.name,
									start,
									end: start + def.dur * 3600 * 1000,
								});
							}
						}
					}

					// Carrera principal
					sessions.push({
						name: "Gran Premio (Carrera)",
						start: raceStart,
						end: raceEnd,
					});

					sessions.sort((a, b) => a.start - b.start);
					return sessions;
				}
			}
		}
	} catch (e) {
		console.error("Error obteniendo calendario de sesiones:", e);
	}

	return [];
}

// ⏱️ Evalúa si en este instante hay alguna sesión activa o cuál es la próxima
export function evaluateSessionStatus(
	sessions: ScheduleSession[],
	preWindowMs: number = 15 * 60 * 1000
): SessionStatusResult {
	const now = Date.now();
	const POST_WINDOW = 45 * 60 * 1000; // 45m de margen post-sesión para celebrar y ver entrevistas

	// 🟢 1. ¿Hay alguna sesión cuya ventana esté activa ahora? (desde preWindowMs antes hasta el final + 15m)
	const active = sessions.find((s) => now >= s.start - preWindowMs && now <= s.end + POST_WINDOW);

	if (active) {
		return {
			isLiveWindow: true,
			activeSessionName: translateSessionName(active.name),
			nextSessionName: null,
			nextSessionStart: null,
		};
	}

	// ⏳ 2. Si no hay sesión activa, buscamos la siguiente
	const upcoming = sessions.find((s) => s.start > now);
	if (upcoming) {
		return {
			isLiveWindow: false,
			activeSessionName: null,
			nextSessionName: translateSessionName(upcoming.name),
			nextSessionStart: upcoming.start,
		};
	}

	return {
		isLiveWindow: false,
		activeSessionName: null,
		nextSessionName: null,
		nextSessionStart: null,
	};
}

// ⏳ Da formato amigable a la cuenta regresiva hasta un timestamp en ms
export function formatCountdown(targetMs: number | null): string {
	if (!targetMs) return "";
	const diff = targetMs - Date.now();
	if (diff <= 0) return "¡Iniciando ahora!";

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const days = Math.floor(hours / 24);

	if (days > 1) {
		return `${days}d ${hours % 24}h`;
	}
	if (hours > 0) {
		return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
	}
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);
	return `${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
}

// 🧠 Contexto inteligente de Fin de Semana vs Entre Semana para ParcFerme y YouTube
export interface SmartGpContext {
	isWeekendActive: boolean; // ¿Estamos entre viernes mañana y domingo/lunes madrugada del GP?
	round: number;            // Número de ronda activa o última completada
	raceName: string;         // Nombre del GP (ej: "Mexico City Grand Prix")
	country: string;          // País (ej: "Mexico")
	countryCode: string;      // Código para bandera (ej: "mex")
	stage: "PRE_WEEKEND" | "FRIDAY" | "SATURDAY" | "SUNDAY" | "POST_RACE" | "OFF_WEEK";
	defaultTab: "FP1" | "FP2" | "FP3" | "QUALY" | "SPRINT" | "SQ" | "RACE";
	availableTabs: ("FP1" | "FP2" | "FP3" | "QUALY" | "SPRINT" | "SQ" | "RACE")[];
	hasSprint: boolean;
	raceDate: string;         // YYYY-MM-DD
	firstPracticeDate: string;// YYYY-MM-DD
}

function getWednesdayNightPriorMs(fp1DateStr: string, fp1TimeStr?: string): number {
	const fp1Ms = parseDateToMs(fp1DateStr, fp1TimeStr) || new Date(`${fp1DateStr}T12:00:00Z`).getTime();
	const d = new Date(fp1Ms);
	const day = d.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
	const daysBack = day >= 3 ? day - 3 : day + 4;
	const wedMs = fp1Ms - daysBack * 86400000;
	const wedDate = new Date(wedMs);
	const y = wedDate.getUTCFullYear();
	const m = String(wedDate.getUTCMonth() + 1).padStart(2, "0");
	const dt = String(wedDate.getUTCDate()).padStart(2, "0");
	// Miércoles 20:00 UTC (noche en Europa / tarde en América)
	return new Date(`${y}-${m}-${dt}T20:00:00Z`).getTime();
}

function resolveSmartGpContextFromRaces(races: any[], now: number = Date.now()): SmartGpContext | null {
	if (!Array.isArray(races) || races.length === 0) return null;

	// 1. Buscamos si estamos dentro de un fin de semana de GP (desde el miércoles noche previo hasta fin de domingo / lunes mediodía)
	for (const race of races) {
		const fp1Date = race.FirstPractice?.date || race.date;
		const fp1Start = parseDateToMs(race.FirstPractice?.date, race.FirstPractice?.time) || new Date(`${fp1Date}T12:00:00Z`).getTime();
		const weekendStart = getWednesdayNightPriorMs(fp1Date, race.FirstPractice?.time);
		const raceStart = parseDateToMs(race.date, race.time || "14:00:00Z");
		const weekendEnd = (raceStart || new Date(`${race.date}T23:59:59Z`).getTime()) + 14 * 3600 * 1000;

		if (now >= weekendStart && now <= weekendEnd) {
			const satSession = race.ThirdPractice || race.Sprint || race.Qualifying;
			const satDate = satSession?.date || race.date;
			const satStart = new Date(`${satDate}T00:00:00Z`).getTime();
			const sunStart = new Date(`${race.date}T00:00:00Z`).getTime();

			const calMatch = (calendar2026 as any[]).find((c: any) => String(c.round) === String(race.round));
			const hasSprint = Boolean(
				race.Sprint ||
				race.SprintQualifying ||
				race.SprintShootout ||
				(Array.isArray(race.SprintResults) && race.SprintResults.length > 0) ||
				calMatch?.Sprint ||
				calMatch?.SprintQualifying
			);

			const fp2Start = parseDateToMs(race.SecondPractice?.date, race.SecondPractice?.time) || fp1Start + 4 * 3600 * 1000;
			const fp3Start = parseDateToMs(race.ThirdPractice?.date, race.ThirdPractice?.time) || fp2Start + 20 * 3600 * 1000;
			const sqStart = parseDateToMs(race.SprintQualifying?.date, race.SprintQualifying?.time) ||
				parseDateToMs(race.SprintShootout?.date, race.SprintShootout?.time) || fp1Start + 4 * 3600 * 1000;
			const sprintStart = parseDateToMs(race.Sprint?.date, race.Sprint?.time) || fp3Start;
			const qualyStart = parseDateToMs(race.Qualifying?.date, race.Qualifying?.time) || fp3Start + 3.5 * 3600 * 1000;
			const raceStartMs = raceStart || qualyStart + 24 * 3600 * 1000;

			const availableTabs: ("FP1" | "FP2" | "FP3" | "QUALY" | "SPRINT" | "SQ" | "RACE")[] = [];

			if (now >= fp1Start + 55 * 60 * 1000) availableTabs.push("FP1");

			if (hasSprint) {
				if (now >= sqStart + 44 * 60 * 1000) availableTabs.push("SQ");
				if (now >= sprintStart + 40 * 60 * 1000) availableTabs.push("SPRINT");
			} else {
				if (now >= fp2Start + 55 * 60 * 1000) availableTabs.push("FP2");
				if (now >= fp3Start + 55 * 60 * 1000) availableTabs.push("FP3");
			}

			if (now >= qualyStart + 55 * 60 * 1000) availableTabs.push("QUALY");
			if (now >= raceStartMs + 90 * 60 * 1000) availableTabs.push("RACE");

			if (availableTabs.length === 0) {
				availableTabs.push("FP1");
			}

			let stage: "PRE_WEEKEND" | "FRIDAY" | "SATURDAY" | "SUNDAY" | "POST_RACE" = "SUNDAY";
			if (now < fp1Start) {
				stage = "PRE_WEEKEND";
			} else if (now < satStart) {
				stage = "FRIDAY";
			} else if (now < sunStart) {
				stage = "SATURDAY";
			} else if (now < raceStartMs + 90 * 60 * 1000) {
				stage = "SUNDAY";
			} else {
				stage = "POST_RACE";
			}

			const defaultTab = availableTabs[availableTabs.length - 1];

			return {
				isWeekendActive: true,
				round: parseInt(race.round, 10),
				raceName: race.raceName,
				country: race.Circuit?.Location?.country || "",
				countryCode: getCountryCodeForGp(race.raceName, race.Circuit?.Location?.country) || "",
				stage,
				defaultTab,
				availableTabs,
				hasSprint,
				raceDate: race.date,
				firstPracticeDate: fp1Date,
			};
		}
	}

	// 2. Si no es fin de semana de GP (lunes a miércoles entre carreras), buscamos la última carrera completada
	let lastCompleted = races[0];
	for (const race of races) {
		const raceStart = parseDateToMs(race.date, race.time || "14:00:00Z");
		if (raceStart && raceStart <= now) {
			lastCompleted = race;
		}
	}

	if (lastCompleted) {
		const calMatch = (calendar2026 as any[]).find((c: any) => String(c.round) === String(lastCompleted.round));
		const isSprint = Boolean(
			lastCompleted.Sprint ||
			lastCompleted.SprintQualifying ||
			(Array.isArray(lastCompleted.SprintResults) && lastCompleted.SprintResults.length > 0) ||
			calMatch?.Sprint ||
			calMatch?.SprintQualifying
		);
		const allTabs: ("FP1" | "FP2" | "FP3" | "QUALY" | "SPRINT" | "SQ" | "RACE")[] = isSprint
			? ["FP1", "SQ", "SPRINT", "QUALY", "RACE"]
			: ["FP1", "FP2", "FP3", "QUALY", "RACE"];

		return {
			isWeekendActive: false,
			round: parseInt(lastCompleted.round, 10),
			raceName: lastCompleted.raceName,
			country: lastCompleted.Circuit?.Location?.country || "",
			countryCode: getCountryCodeForGp(lastCompleted.raceName, lastCompleted.Circuit?.Location?.country) || "",
			stage: "OFF_WEEK",
			defaultTab: "RACE",
			availableTabs: allTabs,
			hasSprint: isSprint,
			raceDate: lastCompleted.date,
			firstPracticeDate: lastCompleted.FirstPractice?.date || lastCompleted.date,
		};
	}

	return null;
}

export function getCalendarGpContextSync(now: number = Date.now()): SmartGpContext {
	const resolved = resolveSmartGpContextFromRaces(calendar2026 as any[], now);
	if (resolved) return resolved;

	const firstRace = (calendar2026 as any[])[0];
	return {
		isWeekendActive: false,
		round: parseInt(firstRace?.round || "1", 10),
		raceName: firstRace?.raceName || "Formula 1 Grand Prix",
		country: firstRace?.Circuit?.Location?.country || "",
		countryCode: getCountryCodeForGp(firstRace?.raceName, firstRace?.Circuit?.Location?.country) || "",
		stage: "OFF_WEEK",
		defaultTab: "RACE",
		availableTabs: ["FP1", "FP2", "FP3", "QUALY", "RACE"],
		hasSprint: false,
		raceDate: firstRace?.date || "",
		firstPracticeDate: firstRace?.FirstPractice?.date || firstRace?.date || "",
	};
}

export function getNextCalendarSessionSync(now: number = Date.now()): {
	raceName: string;
	country: string;
	countryCode: string;
	sessionName: string;
	targetDate: Date | null;
} {
	const races = calendar2026 as any[];
	for (const race of races) {
		const raceStart = parseDateToMs(race.date, race.time || "14:00:00Z");
		if (!raceStart) continue;
		const raceEnd = raceStart + 3 * 3600 * 1000;
		if (raceEnd < now) continue;

		const candidateDefs = [
			{ name: "Práctica 1", ms: parseDateToMs(race.FirstPractice?.date, race.FirstPractice?.time) },
			{ name: "Práctica 2", ms: parseDateToMs(race.SecondPractice?.date, race.SecondPractice?.time) },
			{ name: "Práctica 3", ms: parseDateToMs(race.ThirdPractice?.date, race.ThirdPractice?.time) },
			{
				name: "Sprint Shootout",
				ms: parseDateToMs(
					race.SprintQualifying?.date || race.SprintShootout?.date,
					race.SprintQualifying?.time || race.SprintShootout?.time
				),
			},
			{ name: "Carrera Sprint", ms: parseDateToMs(race.Sprint?.date, race.Sprint?.time) },
			{ name: "Clasificación", ms: parseDateToMs(race.Qualifying?.date, race.Qualifying?.time) },
			{ name: "Gran Premio (Carrera)", ms: raceStart },
		]
			.filter((s): s is { name: string; ms: number } => s.ms !== null)
			.sort((a, b) => a.ms - b.ms);

		const upcoming = candidateDefs.find((s) => s.ms > now) || candidateDefs[candidateDefs.length - 1];
		const country = race.Circuit?.Location?.country || "";
		return {
			raceName: race.raceName,
			country,
			countryCode: getCountryCodeForGp(race.raceName, country) || "",
			sessionName: upcoming?.name || "Práctica 1",
			targetDate: upcoming ? new Date(upcoming.ms) : null,
		};
	}

	const lastRace = races[races.length - 1];
	const country = lastRace?.Circuit?.Location?.country || "";
	return {
		raceName: lastRace?.raceName || "Formula 1 Grand Prix",
		country,
		countryCode: getCountryCodeForGp(lastRace?.raceName, country) || "",
		sessionName: "Gran Premio (Carrera)",
		targetDate: null,
	};
}

export async function getSmartGpContext(): Promise<SmartGpContext> {
	if (typeof window !== "undefined" && (
		sessionStorage.getItem("f1_pitwall_sim") === "active"
	)) {
		return {
			isWeekendActive: true,
			round: 20,
			raceName: "Mexico City Grand Prix",
			country: "Mexico",
			countryCode: "mex",
			stage: "SUNDAY",
			defaultTab: "RACE",
			availableTabs: ["FP1", "FP2", "FP3", "QUALY", "RACE"],
			hasSprint: false,
			raceDate: "2026-10-25",
			firstPracticeDate: "2026-10-23",
		};
	}

	try {
		const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
			next: { revalidate: 1800 },
		}).catch(() => null);

		if (res && res.ok) {
			const data = await res.json();
			const races: any[] = data?.MRData?.RaceTable?.Races || [];
			const resolved = resolveSmartGpContextFromRaces(races, Date.now());
			if (resolved) return resolved;
		}
	} catch (e) {
		console.error("Error resolviendo SmartGpContext:", e);
	}

	// Resolución automática desde el calendario oficial de la temporada
	return getCalendarGpContextSync(Date.now());
}
