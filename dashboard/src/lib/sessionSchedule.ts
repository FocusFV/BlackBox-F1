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

export async function getSmartGpContext(): Promise<SmartGpContext> {
	try {
		const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
			next: { revalidate: 1800 },
		}).catch(() => null);

		if (res && res.ok) {
			const data = await res.json();
			const races: any[] = data?.MRData?.RaceTable?.Races || [];
			const now = Date.now();

			// 1. Buscamos si estamos dentro de un fin de semana de GP (desde el miércoles noche previo hasta fin de domingo / lunes mediodía)
			for (const race of races) {
				const fp1Date = race.FirstPractice?.date || race.date;
				const fp1Start = parseDateToMs(race.FirstPractice?.date, race.FirstPractice?.time) || new Date(`${fp1Date}T12:00:00Z`).getTime();
				// 🌙 El fin de semana inteligente se activa desde el miércoles en la noche previo
				const weekendStart = getWednesdayNightPriorMs(fp1Date, race.FirstPractice?.time);
				const raceStart = parseDateToMs(race.date, race.time || "14:00:00Z");
				// Domingo post-carrera (~14h tras inicio de carrera o lunes mediodía UTC)
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

					// ⏱️ Calculamos las fechas/horas exactas de cada sesión en ms
					const fp2Start = parseDateToMs(race.SecondPractice?.date, race.SecondPractice?.time) || fp1Start + 4 * 3600 * 1000;
					const fp3Start = parseDateToMs(race.ThirdPractice?.date, race.ThirdPractice?.time) || fp2Start + 20 * 3600 * 1000;
					const sqStart = parseDateToMs(race.SprintQualifying?.date, race.SprintQualifying?.time) ||
						parseDateToMs(race.SprintShootout?.date, race.SprintShootout?.time) || fp1Start + 4 * 3600 * 1000;
					const sprintStart = parseDateToMs(race.Sprint?.date, race.Sprint?.time) || fp3Start;
					const qualyStart = parseDateToMs(race.Qualifying?.date, race.Qualifying?.time) || fp3Start + 3.5 * 3600 * 1000;
					const raceStartMs = raceStart || qualyStart + 24 * 3600 * 1000;

					// 🔒 Solo se agregan pestañas de sesiones que YA fueron disputadas
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

					// Si recién arranca el fin de semana (miércoles previo / jueves) y todavía no concluyó FP1, mostramos únicamente FP1
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

					// La pestaña activa por defecto es la última sesión ya corrida
					const defaultTab = availableTabs[availableTabs.length - 1];

					return {
						isWeekendActive: true,
						round: parseInt(race.round, 10),
						raceName: race.raceName,
						country: race.Circuit?.Location?.country || "Mexico",
						countryCode: getCountryCodeForGp(race.raceName, race.Circuit?.Location?.country) || "mex",
						stage,
						defaultTab,
						availableTabs,
						hasSprint,
						raceDate: race.date,
						firstPracticeDate: fp1Date,
					};
				}
			}

			// 2. Si no es fin de semana de GP (lunes a jueves entre carreras), buscamos la última carrera completada
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
					country: lastCompleted.Circuit?.Location?.country || "Mexico",
					countryCode: getCountryCodeForGp(lastCompleted.raceName, lastCompleted.Circuit?.Location?.country) || "mex",
					stage: "OFF_WEEK",
					defaultTab: "RACE",
					availableTabs: allTabs,
					hasSprint: isSprint,
					raceDate: lastCompleted.date,
					firstPracticeDate: lastCompleted.FirstPractice?.date || lastCompleted.date,
				};
			}
		}
	} catch (e) {
		console.error("Error resolviendo SmartGpContext:", e);
	}

	// Fallback por defecto a México
	return {
		isWeekendActive: true,
		round: 19,
		raceName: "Mexico City Grand Prix",
		country: "Mexico",
		countryCode: "mex",
		stage: "POST_RACE",
		defaultTab: "RACE",
		availableTabs: ["FP1", "FP2", "FP3", "QUALY", "RACE"],
		hasSprint: false,
		raceDate: "2026-11-01",
		firstPracticeDate: "2026-10-30",
	};
}
