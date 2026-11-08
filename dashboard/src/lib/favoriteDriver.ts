/**
 * Helper unificado para detección de Pilotos Favoritos en toda la aplicación.
 * Permite comparar tanto números (ej: "43", 43) como siglas TLA (ej: "COL")
 * sin importar cómo se guardaron en Zustand o cómo los emite la API de F1.
 */

export const DRIVER_NUMBER_TO_TLA: Record<string, string> = {
	"1": "VER",
	"6": "HAD",
	"4": "NOR",
	"81": "PIA",
	"16": "LEC",
	"44": "HAM",
	"63": "RUS",
	"12": "ANT",
	"43": "COL",
	"10": "GAS",
	"11": "PER",
	"77": "BOT",
	"55": "SAI",
	"23": "ALB",
	"14": "ALO",
	"18": "STR",
	"30": "LAW",
	"22": "TSU",
	"41": "LIN",
	"27": "HUL",
	"5": "BOR",
	"31": "OCO",
	"87": "BEA",
};

export const DRIVER_TLA_TO_NUMBER: Record<string, string> = {
	VER: "1",
	HAD: "6",
	NOR: "4",
	PIA: "81",
	LEC: "16",
	HAM: "44",
	RUS: "63",
	ANT: "12",
	COL: "43",
	GAS: "10",
	PER: "11",
	BOT: "77",
	SAI: "55",
	ALB: "23",
	ALO: "14",
	STR: "18",
	LAW: "30",
	TSU: "22",
	LIN: "41",
	HUL: "27",
	BOR: "5",
	OCO: "31",
	BEA: "87",
};

export function isFavoriteDriver(
	driver: { RacingNumber?: string | number; Tla?: string; number?: string | number; tla?: string; code?: string } | string | number | undefined | null,
	favoriteDrivers: string[] | undefined | null
): boolean {
	if (!favoriteDrivers || favoriteDrivers.length === 0 || !driver) return false;

	let num = "";
	let tla = "";

	if (typeof driver === "string" || typeof driver === "number") {
		const str = String(driver).trim().toUpperCase();
		if (/^\d+$/.test(str)) {
			num = str;
			tla = DRIVER_NUMBER_TO_TLA[str] || "";
		} else {
			tla = str;
			num = DRIVER_TLA_TO_NUMBER[str] || "";
		}
	} else {
		num = String(driver.RacingNumber ?? driver.number ?? "").trim();
		tla = String(driver.Tla ?? driver.tla ?? driver.code ?? "").trim().toUpperCase();
		if (!tla && num && DRIVER_NUMBER_TO_TLA[num]) {
			tla = DRIVER_NUMBER_TO_TLA[num];
		}
		if (!num && tla && DRIVER_TLA_TO_NUMBER[tla]) {
			num = DRIVER_TLA_TO_NUMBER[tla];
		}
	}

	return favoriteDrivers.some((fav) => {
		const f = String(fav).trim().toUpperCase();
		if (!f) return false;
		if (num && f === num) return true;
		if (tla && f === tla) return true;
		if (DRIVER_NUMBER_TO_TLA[f] && (DRIVER_NUMBER_TO_TLA[f] === tla || f === num)) return true;
		if (DRIVER_TLA_TO_NUMBER[f] && (DRIVER_TLA_TO_NUMBER[f] === num || f === tla)) return true;
		return false;
	});
}
