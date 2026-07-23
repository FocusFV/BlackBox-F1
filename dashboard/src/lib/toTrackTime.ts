export const toTrackTime = (utc: string, offset: string): string => {
	const date = new Date(utc);

	const [hours, minutes, seconds]: (number | undefined)[] = offset
		.split(":")
		.map((unit) => parseInt(unit, 10));

	// 🎯 Verificamos si no es un número real, permitiendo el 0
	if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
		return date.toISOString();
	}

	date.setUTCHours(date.getUTCHours() + (hours || 0));
	date.setUTCMinutes(date.getUTCMinutes() + (minutes || 0));
	date.setUTCSeconds(date.getUTCSeconds() + (seconds || 0));

	return date.toISOString();
};