// Parser seguro para tiempos de FOM F1 Clock
// Evita el bug de Moment.js que interpreta "MM:SS" como "HH:MM" (348 min en lugar de 5m 48s)
// y procesa formatos "MM:SS:cc" de Qualy (ej: "05:29:14" -> 5m 29s en lugar de 5 horas 29 minutos)

export function parseUtcMs(utcStr?: string): number | null {
	if (!utcStr) return null;
	const clean = utcStr.trim();
	if (clean.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(clean)) {
		const ms = new Date(clean).getTime();
		return isNaN(ms) ? null : ms;
	}
	const ms = new Date(`${clean}Z`).getTime();
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
