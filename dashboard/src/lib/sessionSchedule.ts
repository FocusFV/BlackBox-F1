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
								name: s.kind || "Sesión Oficial",
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

				const raceEnd = raceStart + 2.5 * 3600 * 1000; // ~2h30m de carrera

				// Si el fin de semana está en curso o es el próximo
				if (raceEnd >= now - 12 * 3600 * 1000) {
					const sessions: ScheduleSession[] = [];

					const sessionDefs = [
						{ key: "FirstPractice", name: "Práctica 1", dur: 1 },
						{ key: "SecondPractice", name: "Práctica 2", dur: 1 },
						{ key: "ThirdPractice", name: "Práctica 3", dur: 1 },
						{ key: "SprintQualifying", name: "Sprint Shootout", dur: 0.75 },
						{ key: "Sprint", name: "Carrera Sprint", dur: 1 },
						{ key: "Qualifying", name: "Clasificación", dur: 1 },
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
export function evaluateSessionStatus(sessions: ScheduleSession[]): SessionStatusResult {
	const now = Date.now();
	const THIRTY_MINUTES = 30 * 60 * 1000;

	// 🟢 1. ¿Hay alguna sesión cuya ventana esté activa ahora? (desde 30m antes hasta el final + 15m)
	const active = sessions.find((s) => now >= s.start - THIRTY_MINUTES && now <= s.end + 15 * 60 * 1000);

	if (active) {
		return {
			isLiveWindow: true,
			activeSessionName: active.name,
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
			nextSessionName: upcoming.name,
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
