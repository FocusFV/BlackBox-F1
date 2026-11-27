// Parser seguro para tiempos de FOM F1 Clock
// Evita el bug de Moment.js que interpreta "MM:SS" como "HH:MM" (348 min en lugar de 5m 48s)
// y procesa formatos "MM:SS:cc" de Qualy (ej: "05:29:14" -> 5m 29s en lugar de 5 horas 29 minutos)

import calendar2026 from "@/data/calendar2026.json";

export function normalizeGmtOffset(gmtOffset?: string): string | null {
	if (!gmtOffset) return null;
	const clean = gmtOffset.trim();
	const match = clean.match(/^([+-]?)(\d{1,2}):(\d{2})(?::\d{2})?$/);
	if (!match) return null;
	const sign = match[1] || "+";
	const hours = match[2].padStart(2, "0");
	const mins = match[3];
	return `${sign}${hours}:${mins}`;
}

export function parseUtcMs(utcStr?: string, gmtOffset?: string): number | null {
	if (!utcStr) return null;
	const clean = utcStr.trim();
	if (clean.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(clean)) {
		const ms = new Date(clean).getTime();
		return isNaN(ms) ? null : ms;
	}
	const offset = normalizeGmtOffset(gmtOffset);
	const ms = new Date(`${clean}${offset || "Z"}`).getTime();
	return isNaN(ms) ? null : ms;
}

export function parseFomClockRemaining(remainingStr?: string, isRace: boolean = false): number | null {
	if (!remainingStr) return null;
	const clean = remainingStr.trim();
	const parts = clean.split(":").map((p) => parseInt(p, 10));

	if (parts.some((n) => isNaN(n))) return null;

	if (parts.length === 3) {
		const [p0, p1, p2] = parts;
		// ⏱️ Formato oficial estándar FOM: "HH:MM:SS" (ej: "00:15:37" en Q1, "00:18:00", "01:00:00" en FP1, "02:00:00" en Carrera)
		// Si p0 <= 3, p0 son HORAS (en F1 ninguna sesión reglamentaria dura más de 3 horas), p1 son MINUTOS y p2 son SEGUNDOS.
		// Solo si p0 > 3 (ej: "15:37:20") p0 son minutos, p1 segundos y p2 centésimas.
		if (p0 <= 3) {
			return (p0 * 3600 + p1 * 60 + p2) * 1000;
		} else {
			return (p0 * 60 + p1) * 1000 + Math.round(p2 * 10);
		}
	} else if (parts.length === 2) {
		// Formato MM:SS (ej: "05:48" o "18:00")
		const [minutes, seconds] = parts;
		return (minutes * 60 + seconds) * 1000;
	} else if (parts.length === 1) {
		return parts[0] * 1000;
	}
	return null;
}

export function formatMsToClock(ms: number, forceNoHours: boolean = false): string {
	if (ms <= 0) return "00:00";
	const totalSecs = Math.floor(ms / 1000);
	const hours = Math.floor(totalSecs / 3600);
	const minutes = Math.floor((totalSecs % 3600) / 60);
	const seconds = totalSecs % 60;
	const pad = (n: number) => n.toString().padStart(2, "0");

	if (forceNoHours || hours === 0) {
		const totalMinutes = Math.floor(totalSecs / 60);
		return `${pad(totalMinutes)}:${pad(seconds)}`;
	}

	return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatMsToCountdownParts(ms: number): {
	hours: string;
	minutes: string;
	seconds: string;
	totalMinutes: string;
} {
	if (ms <= 0) {
		return { hours: "00", minutes: "00", seconds: "00", totalMinutes: "00" };
	}
	const totalSecs = Math.floor(ms / 1000);
	const hours = Math.floor(totalSecs / 3600);
	const minutes = Math.floor((totalSecs % 3600) / 60);
	const seconds = totalSecs % 60;
	const totalMinutes = Math.floor(totalSecs / 60);
	const pad = (n: number) => n.toString().padStart(2, "0");

	return {
		hours: pad(hours),
		minutes: pad(minutes),
		seconds: pad(seconds),
		totalMinutes: pad(totalMinutes),
	};
}

export function getScheduledSessionStartMs(session?: any): number | null {
	if (session?.StartDate) {
		const ms = parseUtcMs(session.StartDate, session.GmtOffset);
		if (ms && !isNaN(ms)) return ms;
	}
	if (session?.Name) {
		const sName = session.Name.toLowerCase();
		const now = Date.now();
		const races = calendar2026 as any[];
		const race = races.find((r: any) => {
			if (session.Meeting?.Name && r.raceName?.toLowerCase().includes(session.Meeting.Name.toLowerCase())) return true;
			if (session.Meeting?.Country?.Name && r.Circuit?.Location?.country?.toLowerCase() === session.Meeting.Country.Name.toLowerCase()) return true;
			if (session.Meeting?.Circuit?.ShortName && r.Circuit?.circuitName?.toLowerCase().includes(session.Meeting.Circuit.ShortName.toLowerCase())) return true;
			if (session.Meeting?.Location && r.Circuit?.Location?.locality?.toLowerCase().includes(session.Meeting.Location.toLowerCase())) return true;
			const rDate = new Date(`${r.date}T23:59:59Z`).getTime();
			return Math.abs(now - rDate) < 5 * 24 * 3600 * 1000;
		});

		if (race) {
			let sDate: string | undefined;
			let sTime: string | undefined;
			if (sName.includes("qual")) {
				sDate = race.Qualifying?.date;
				sTime = race.Qualifying?.time;
			} else if (sName === "practice 1" || sName === "práctica 1") {
				sDate = race.FirstPractice?.date;
				sTime = race.FirstPractice?.time;
			} else if (sName === "practice 2" || sName === "práctica 2") {
				sDate = race.SecondPractice?.date;
				sTime = race.SecondPractice?.time;
			} else if (sName === "practice 3" || sName === "práctica 3") {
				sDate = race.ThirdPractice?.date;
				sTime = race.ThirdPractice?.time;
			} else if (sName.includes("sprint shootout") || sName.includes("sprint qual")) {
				sDate = race.SprintQualifying?.date;
				sTime = race.SprintQualifying?.time;
			} else if (sName === "sprint") {
				sDate = race.Sprint?.date;
				sTime = race.Sprint?.time;
			} else if (sName === "race" || sName === "carrera") {
				sDate = race.date;
				sTime = race.time;
			}
			if (sDate) {
				const cleanTime = (sTime || "12:00:00Z").trim();
				const cleanTimeZ = cleanTime.endsWith("Z") ? cleanTime : `${cleanTime}Z`;
				const ms = new Date(`${sDate.trim()}T${cleanTimeZ}`).getTime();
				if (!isNaN(ms)) return ms;
			}
		}
	}
	return null;
}

