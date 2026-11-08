/**
 * Helper unificado para determinar en tiempo real si un piloto ha tomado la bandera a cuadros
 * de forma individual conforme cruza la línea de meta, idéntico a la transmisión de F1 TV.
 */

export function isDriverFinished({
	timingDriver,
	position,
	sessionName = "",
	sessionType = "",
	sessionStatus = "",
	totalLaps = 0,
	currentLap = 0,
	raceControlMessages = [],
}: {
	timingDriver?: any;
	position?: number;
	sessionName?: string;
	sessionType?: string;
	sessionStatus?: string;
	totalLaps?: number;
	currentLap?: number;
	raceControlMessages?: any[];
}): boolean {
	if (!timingDriver) return false;

	// Si abandonó, se detuvo en pista o fue eliminado, no recibe bandera a cuadros
	if (timingDriver.Retired || timingDriver.Stopped || timingDriver.KnockedOut) {
		return false;
	}

	const isRaceOrSprint =
		sessionName === "Race" ||
		sessionName === "Sprint" ||
		sessionType === "Race" ||
		totalLaps > 0;

	const isSessionTerminated =
		sessionStatus === "Finished" ||
		sessionStatus === "Finalised" ||
		sessionStatus === "Ends";

	// 1. Si la sesión ya finalizó por completo según FOM:
	if (isSessionTerminated) {
		return true;
	}

	const driverLaps = typeof timingDriver.NumberOfLaps === "number" ? timingDriver.NumberOfLaps : 0;

	// 2. En Carrera o Sprint con total de vueltas conocido (ej: 71 vueltas):
	if (isRaceOrSprint && totalLaps > 0) {
		// A) Si el piloto completó el 100% de la distancia de carrera (ej: 71/71 vueltas)
		if (driverLaps >= totalLaps) {
			return true;
		}

		// B) Detectar si Dirección de Carrera (FIA) ya mostró la bandera a cuadros oficial
		const hasChequeredMessage = raceControlMessages.some(
			(m) => m?.Flag === "CHEQUERED" || m?.Message?.toUpperCase().includes("CHEQUERED")
		);

		// ¿El líder ya llegó a la última vuelta o superó el total?
		const leaderCompleted = currentLap >= totalLaps;

		if (hasChequeredMessage || leaderCompleted) {
			// El ganador (P1) toma la bandera en cuanto cruza la meta para ganar
			if (position === 1 && driverLaps >= totalLaps - 1) {
				return true;
			}

			// Para autos que entraron al Pit Lane tras la bandera a cuadros (in-lap finalizada)
			if (timingDriver.InPit) {
				return true;
			}

			// Para autos rezagados (a 1 o más vueltas, ej: +1 L o +2 L):
			// En F1, al ondear la bandera a cuadros, la carrera finaliza para el rezagado
			// la siguiente vez que cruza la meta.
			const gap = String(timingDriver.GapToLeader || timingDriver.IntervalToPositionAhead?.Value || "").toUpperCase();
			const isLapped = gap.includes("L") || gap.includes("LAP");
			if (isLapped && driverLaps >= totalLaps - 3) {
				// Si ya tiene tiempo en el último sector o la bandera ya fue emitida
				if (hasChequeredMessage || driverLaps >= currentLap) {
					return true;
				}
			}
		}
	} else {
		// 3. En Prácticas Libres (FP1, FP2, FP3) o Clasificación (Q1, Q2, Q3):
		const hasChequeredMessage = raceControlMessages.some(
			(m) => m?.Flag === "CHEQUERED" || m?.Message?.toUpperCase().includes("CHEQUERED")
		);

		if (hasChequeredMessage && timingDriver.InPit) {
			return true;
		}
	}

	return false;
}
