import type { TimingData } from "@/types/state.type";
import { sortPos } from "@/lib/sorting";

export const calculatePosition = (seconds: number, driverNr: string, timingData: TimingData): number | null => {
	const driverTiming = timingData.Lines[driverNr];

	if (!driverTiming) {
		return null;
	}

	const currentPos = parseInt(driverTiming.Position);

	// Filtramos a todos los pilotos por detrás
	const drivers = Object.values(timingData.Lines)
		.filter((driver) => parseInt(driver.Position) > currentPos)
		.sort(sortPos);

	let accGap = 0;
	let pos = currentPos;

	for (const driver of drivers) {
		const rawGap = driver.IntervalToPositionAhead?.Value || driver.TimeDiffToPositionAhead || "0";
		
		// Si el auto de atrás perdió vuelta, parseamos seguro
		const gap = parseFloat(rawGap.replace(/[^0-9.]/g, "")) || 0;
		accGap += gap;

		if (accGap > seconds) {
			break;
		}

		pos++;
	}

	return pos;
};