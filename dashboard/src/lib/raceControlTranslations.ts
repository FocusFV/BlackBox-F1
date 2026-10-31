// Diccionario oficial de pilotos de F1 por código de 3 letras (TLA)
export const DRIVER_TLA_TO_NAME: Record<string, string> = {
	GAS: "Gasly",
	HAM: "Hamilton",
	COL: "Colapinto",
	VER: "Verstappen",
	LEC: "Leclerc",
	NOR: "Norris",
	PIA: "Piastri",
	RUS: "Russell",
	ANT: "Antonelli",
	SAI: "Sainz",
	ALB: "Albon",
	ALO: "Alonso",
	STR: "Stroll",
	HUL: "Hülkenberg",
	BOR: "Bortoleto",
	LAW: "Lawson",
	TSU: "Tsunoda",
	OCO: "Ocon",
	BEA: "Bearman",
	HAD: "Hadjar",
	PER: "Pérez",
	BOT: "Bottas",
	ZHO: "Zhou",
	MAG: "Magnussen",
	DOO: "Doohan",
	RIC: "Ricciardo",
	SAR: "Sargeant",
	DEV: "De Vries",
	MSC: "Schumacher",
	LAT: "Latifi",
	VET: "Vettel",
	RAI: "Räikkönen",
	GIO: "Giovinazzi",
	KVI: "Kvyat",
	MAZ: "Mazepin",
	POU: "Pourchaire",
	FRO: "Fittipaldi",
	DRU: "Drugovich",
	SHW: "Shwartzman",
	HIR: "Hirakawa",
	LIN: "Lindblad",
	ARO: "Aron",
	MAI: "Maini",
	CRA: "Crawford",
	VAN: "Van Hoepen",
	OWA: "O'Ward",
	FOR: "Fornaroli",
	MIN: "Mini",
	BRO: "Browning",
};

/**
 * Pre-procesa el mensaje de la FIA antes de enviarlo al traductor:
 * Reemplaza (GAS) por (Gasly), (HAM) por (Hamilton), etc., para evitar
 * traducciones erróneas como GAS -> Gasolina o HAM -> Jamón.
 */
export function prepareFiaMessageForTranslation(msg: string): string {
	if (!msg) return "";
	return msg.replace(/\(([A-Z]{3})\)/g, (match, tla) => {
		const name = DRIVER_TLA_TO_NAME[tla.toUpperCase()];
		return name ? `(${name})` : match;
	});
}

/**
 * Post-procesa la traducción devuelta por la API para corregir
 * cualquier caso residual o nombres mal traducidos.
 */
export function postProcessFiaTranslation(translated: string): string {
	if (!translated) return "";
	let clean = translated;

	// Limpieza de palabras que Google Translate suele traducir erróneamente en F1
	clean = clean
		.replace(/\(GASOLINA\)/gi, "(Gasly)")
		.replace(/\(JAM[OÓ]N\)/gi, "(Hamilton)")
		.replace(/\(ROBOT\)/gi, "(Bottas)")
		.replace(/\(POR\)/gi, "(Pérez)")
		.replace(/\(NI\)/gi, "(Norris)")
		.replace(/\(PIA\)/gi, "(Piastri)");

	// Asegurar que si quedó algún TLA crudo se reemplace por el apellido
	clean = clean.replace(/\(([A-Z]{3})\)/g, (match, tla) => {
		const name = DRIVER_TLA_TO_NAME[tla.toUpperCase()];
		return name ? `(${name})` : match;
	});

	return clean;
}
