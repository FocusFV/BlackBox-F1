/**
 * Convierte un tiempo de vuelta en formato "M:SS.mmm" o "SS.mmm" a milisegundos numéricos.
 * Retorna null si el formato no es válido o está vacío.
 */
export function parseLapTimeToMs(timeStr?: string | null): number | null {
	if (!timeStr) return null;
	const clean = String(timeStr).trim();
	if (!clean || clean.includes("LAP") || clean === "--:--.---" || clean === "-") return null;

	const parts = clean.split(":");
	if (parts.length === 2) {
		const mins = parseInt(parts[0], 10);
		const secs = parseFloat(parts[1]);
		if (!isNaN(mins) && !isNaN(secs)) {
			return mins * 60 * 1000 + Math.round(secs * 1000);
		}
	} else if (parts.length === 1) {
		const secs = parseFloat(parts[0]);
		if (!isNaN(secs)) {
			return Math.round(secs * 1000);
		}
	}
	return null;
}

/**
 * Busca y calcula la vuelta más rápida real y verificada de toda la sesión entre todos los pilotos.
 */
export function getFastestLapInSession(timingLines?: Record<string, any> | null): number | null {
	if (!timingLines) return null;

	let minMs: number | null = null;

	for (const d of Object.values(timingLines)) {
		const bestStr = d?.BestLapTime?.Value;
		const ms = parseLapTimeToMs(bestStr);
		// Una vuelta de F1 válida ronda entre 45s (Spielberg) y 150s (Spa/Las Vegas)
		if (ms !== null && ms > 45000 && ms < 300000) {
			if (minMs === null || ms < minMs) {
				minMs = ms;
			}
		}
	}

	return minMs;
}
