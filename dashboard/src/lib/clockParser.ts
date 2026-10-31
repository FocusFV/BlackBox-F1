// Parser seguro para tiempos de FOM F1 Clock
// Evita el bug histórico de Moment.js que interpreta "MM:SS" como "HH:MM" (348 min en lugar de 5m 48s)

export function parseFomClockRemaining(remainingStr?: string): number | null {
	if (!remainingStr) return null;
	const clean = remainingStr.trim();
	const parts = clean.split(":").map((p) => parseInt(p, 10));

	if (parts.some((n) => isNaN(n))) return null;

	if (parts.length === 3) {
		// Formato HH:MM:SS (ej: "01:15:30")
		const [hours, minutes, seconds] = parts;
		return (hours * 3600 + minutes * 60 + seconds) * 1000;
	} else if (parts.length === 2) {
		// Formato MM:SS (ej: "05:48" o "18:00"). ¡En F1 son minutos y segundos!
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
