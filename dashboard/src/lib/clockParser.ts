// Parser seguro para tiempos de FOM F1 Clock
// Evita el bug de Moment.js que interpreta "MM:SS" como "HH:MM" (348 min en lugar de 5m 48s)
// y procesa formatos "MM:SS:cc" de Qualy (ej: "05:29:14" -> 5m 29s en lugar de 5 horas 29 minutos)

export function parseFomClockRemaining(remainingStr?: string, isRace: boolean = false): number | null {
	if (!remainingStr) return null;
	const clean = remainingStr.trim();
	const parts = clean.split(":").map((p) => parseInt(p, 10));

	if (parts.some((n) => isNaN(n))) return null;

	if (parts.length === 3) {
		const [p0, p1, p2] = parts;
		// En F1, las tandas de Qualy (Q1: 18m, Q2: 15m, Q3: 12m) y Prácticas (60m) NUNCA duran más de 60 minutos.
		// FOM envía el reloj en Qualy con centésimas: "MM:SS:cc" (ej: "05:29:14").
		// Si no es carrera o si el primer número es > 3, p0 son minutos, p1 segundos y p2 centésimas.
		if (!isRace || p0 > 3) {
			return (p0 * 60 + p1) * 1000 + Math.round(p2 * 10);
		} else {
			// Formato HH:MM:SS en Carrera (ej: "01:15:30")
			return (p0 * 3600 + p1 * 60 + p2) * 1000;
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

export function formatMsToClock(ms: number): string {
	if (ms <= 0) return "00:00";
	const totalSecs = Math.floor(ms / 1000);
	const hours = Math.floor(totalSecs / 3600);
	const minutes = Math.floor((totalSecs % 3600) / 60);
	const seconds = totalSecs % 60;
	const pad = (n: number) => n.toString().padStart(2, "0");

	return hours > 0
		? `${hours}:${pad(minutes)}:${pad(seconds)}`
		: `${pad(minutes)}:${pad(seconds)}`;
}
