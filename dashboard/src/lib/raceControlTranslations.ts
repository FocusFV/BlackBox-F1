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
	CAM: "Campos",
};

/**
 * Corrige errores comunes de traducción automática en F1 (ej: Lance Stroll traducido como "Paseo").
 */
export function sanitizeF1DriverNames(text: string): string {
	if (!text) return "";
	return text
		// 🏎️ CORRECCIÓN CRÍTICA: Lance Stroll NUNCA debe ser "Paseo" o "Caminata"
		.replace(/\b(el\s+paseo|un\s+paseo|paseo|caminata)\b/gi, "Stroll")
		.replace(/\(PASEO\)/gi, "(Stroll)")
		.replace(/\(Paseo\)/g, "(Stroll)")
		.replace(/\(paseo\)/g, "(Stroll)")
		// Pierre Gasly nunca debe ser "Gasolina"
		.replace(/\b(gasolina)\b/gi, "Gasly")
		.replace(/\(GASOLINA\)/gi, "(Gasly)")
		// Lewis Hamilton nunca debe ser "Jamón"
		.replace(/\b(jam[oó]n)\b/gi, "Hamilton")
		.replace(/\(JAM[OÓ]N\)/gi, "(Hamilton)")
		// Valtteri Bottas nunca debe ser "Robot" o "Botes"
		.replace(/\(ROBOT\)/gi, "(Bottas)")
		.replace(/\(BOTES\)/gi, "(Bottas)")
		// Lando Norris nunca debe ser "Ni"
		.replace(/\(NI\)/gi, "(Norris)")
		// Oliver Bearman nunca debe ser "Hombre Oso"
		.replace(/\b(hombre\s+oso|hombre-oso)\b/gi, "Bearman");
}

/**
 * Motor de traducción oficial y determinista de mensajes de Dirección de Carrera (FIA).
 * Traduce en 0ms sin llamadas de red ni errores de CORS, garantizando español neutro/argentino de F1.
 */
export function translateFiaMessage(msg: string, lang: string = "es"): string {
	if (!msg) return "";
	const trimmed = msg.trim();
	if (lang === "en") return trimmed;

	const upper = trimmed.toUpperCase();

	if (lang === "pt") {
		if (upper === "CHEQUERED FLAG" || upper === "CHEQUERED FLAG WAVED") return "BANDEIRA QUADRICULADA";
		if (upper === "ALL PASS HOLDERS MAY ACCESS THE PIT LANE") return "TODOS OS CREDENCIADOS PODEM ACESSAR O PIT LANE";
		if (upper === "GREEN LIGHT - PIT LANE OPEN" || upper === "PIT LANE OPEN") return "LUZ VERDE - PIT LANE ABERTO";
		if (upper === "PIT LANE CLOSED") return "PIT LANE FECHADO";
		if (upper === "SAFETY CAR DEPLOYED") return "SAFETY CAR NA PISTA";
		if (upper === "VIRTUAL SAFETY CAR DEPLOYED") return "SAFETY CAR VIRTUAL (VSC) NA PISTA";
		if (upper === "VIRTUAL SAFETY CAR ENDING") return "FINALIZANDO VIRTUAL SAFETY CAR (VSC)";
		if (upper === "SAFETY CAR IN THIS LAP") return "SAFETY CAR ENTRA NESTA VOLTA";
		if (upper === "TRACK CLEAR") return "PISTA LIBERADA";
		if (upper === "DRS ENABLED") return "DRS HABILITADO";
		if (upper === "DRS DISABLED") return "DRS DESABILITADO";
		if (upper === "YELLOW FLAG") return "BANDEIRA AMARELA";
		if (upper === "DOUBLE YELLOW FLAG" || upper === "DOUBLE YELLOW") return "BANDEIRA AMARELA DUPLA";
		if (upper === "RED FLAG" || upper === "RED FLAG - SESSION SUSPENDED") return "BANDEIRA VERMELHA - SESSÃO SUSPENSA";
		if (upper === "STANDING START") return "LARGADA PARADA";
		if (upper === "ROLLING START") return "LARGADA EM MOVIMENTO";
		if (upper === "SESSION SUSPENDED") return "SESSÃO SUSPENSA";
		if (upper === "SESSION RESUMED") return "SESSÃO REINICIADA";
		if (upper === "FORMATION LAP") return "VOLTA DE FORMAÇÃO";

		let ptOut = trimmed;
		ptOut = ptOut
			.replace(/^FIA STEWARDS:\s*/i, "COMISSÁRIOS FIA: ")
			.replace(/^RACE CONTROL:\s*/i, "DIREÇÃO DE PROVA: ")
			.replace(/TURN\s+(\d+)\s+INCIDENT/gi, "INCIDENTE NA CURVA $1")
			.replace(/AT\s+TURN\s+(\d+)/gi, "NA CURVA $1")
			.replace(/TURN\s+(\d+)/gi, "CURVA $1")
			.replace(/INCIDENT INVOLVING CARS?\s+/gi, "INCIDENTE ENVOLVENDO CARROS ")
			.replace(/UNDER INVESTIGATION/gi, "SOB INVESTIGAÇÃO")
			.replace(/NO FURTHER ACTION/gi, "SEM AÇÃO ADICIONAL")
			.replace(/TRACK LIMITS/gi, "LIMITES DE PISTA");
		return ptOut;
	}

	// 1. Mensajes exactos oficiales
	if (upper === "CHEQUERED FLAG" || upper === "CHEQUERED FLAG WAVED") return "BANDERA A CUADROS";
	if (upper === "ALL PASS HOLDERS MAY ACCESS THE PIT LANE") return "TODOS LOS ACREDITADOS PUEDEN ACCEDER AL PIT LANE";
	if (upper === "GREEN LIGHT - PIT LANE OPEN" || upper === "PIT LANE OPEN") return "LUZ VERDE - PIT LANE ABIERTO";
	if (upper === "PIT LANE CLOSED") return "PIT LANE CERRADO";
	if (upper === "SAFETY CAR DEPLOYED") return "SAFETY CAR EN PISTA";
	if (upper === "VIRTUAL SAFETY CAR DEPLOYED") return "SAFETY CAR VIRTUAL (VSC) EN PISTA";
	if (upper === "VIRTUAL SAFETY CAR ENDING") return "FINALIZANDO VIRTUAL SAFETY CAR (VSC)";
	if (upper === "SAFETY CAR IN THIS LAP") return "SAFETY CAR ENTRA EN ESTA VUELTA";
	if (upper === "TRACK CLEAR") return "PISTA DESPEJADA";
	if (upper === "DRS ENABLED") return "DRS HABILITADO";
	if (upper === "DRS DISABLED") return "DRS DESHABILITADO";
	if (upper === "YELLOW FLAG") return "BANDERA AMARILLA";
	if (upper === "DOUBLE YELLOW FLAG" || upper === "DOUBLE YELLOW") return "DOBLE BANDERA AMARILLA";
	if (upper === "RED FLAG" || upper === "RED FLAG - SESSION SUSPENDED") return "BANDERA ROJA - SESIÓN SUSPENDIDA";
	if (upper === "STANDING START") return "LARGADA DESDE PARRILLA";
	if (upper === "ROLLING START") return "LARGADA EN MOVIMIENTO";
	if (upper === "SESSION SUSPENDED") return "SESIÓN SUSPENDIDA";
	if (upper === "SESSION RESUMED") return "SESIÓN REANUDADA";
	if (upper === "FORMATION LAP") return "VUELTA DE FORMACIÓN";

	// 2. Frases y plantillas dinámicas de comisarios
	let out = trimmed;

	// Encabezados oficiales
	out = out
		.replace(/^FIA STEWARDS:\s*/i, "COMISARIOS FIA: ")
		.replace(/^RACE CONTROL:\s*/i, "DIRECCIÓN DE CARRERA: ");

	// Curvas y ubicaciones
	out = out.replace(/TURN\s+(\d+)\s+INCIDENT/gi, "INCIDENTE EN CURVA $1");
	out = out.replace(/AT\s+TURN\s+(\d+)/gi, "EN CURVA $1");
	out = out.replace(/TURN\s+(\d+)/gi, "CURVA $1");

	// Incidentes y decisiones de comisarios
	out = out
		.replace(/INCIDENT INVOLVING CARS?\s+/gi, "INCIDENTE ENTRE AUTOS ")
		.replace(/INVOLVING CARS?\s+/gi, "ENTRE AUTOS ")
		.replace(/WILL BE INVESTIGATED AFTER THE RACE/gi, "SERÁ INVESTIGADO DESPUÉS DE LA CARRERA")
		.replace(/UNDER INVESTIGATION/gi, "BAJO INVESTIGACIÓN")
		.replace(/NO FURTHER ACTION/gi, "SIN SANCIÓN ADICIONAL")
		.replace(/NO INVESTIGATION NECESSARY/gi, "NO SE REQUIERE INVESTIGACIÓN")
		.replace(/\bNOTED\b/gi, "TOMADO NOTA")
		.replace(/CAUSING A COLLISION/gi, "PROVOCAR UNA COLISIÓN")
		.replace(/LEAVING THE TRACK AND GAINING A?N? (?:LASTING )?ADVANTAGE/gi, "SALIR DE PISTA Y OBTENER VENTAJA")
		.replace(/TRACK LIMITS/gi, "LÍMITES DE PISTA")
		.replace(/IMPEDING/gi, "OBSTRUCCIÓN")
		.replace(/UNSAFE RELEASE/gi, "SALIDA INSEGURA DE BOXES");

	// Sanciones y tiempos
	out = out
		.replace(/PENALTY SERVED/gi, "PENALIZACIÓN CUMPLIDA")
		.replace(/(\d+)\s+SECOND TIME PENALTY FOR/gi, "$1 SEGUNDOS DE PENALIZACIÓN PARA")
		.replace(/(\d+)\s+SECOND TIME PENALTY/gi, "$1 SEGUNDOS DE PENALIZACIÓN")
		.replace(/STOP AND GO PENALTY/gi, "PENALIZACIÓN DE STOP & GO")
		.replace(/DRIVE THROUGH PENALTY/gi, "PENALIZACIÓN DE DRIVE THROUGH")
		.replace(/TIME\s+([0-9:.]+)\s+DELETED/gi, "TIEMPO $1 ELIMINADO")
		.replace(/LAP\s+(\d+)/gi, "VUELTA $1")
		.replace(/\bFOR CAR\b/gi, "PARA AUTO")
		.replace(/\bCARS\b/gi, "AUTOS")
		.replace(/\bCAR\b/gi, "AUTO");

	// Meteorología y pista
	out = out
		.replace(/RISK OF RAIN FOR (?:THE )?(?:SESSION|RACE) IS\s+(\d+)%/gi, "PROBABILIDAD DE LLUVIA PARA LA CARRERA: $1%")
		.replace(/RISK OF RAIN\s+(\d+)%/gi, "PROBABILIDAD DE LLUVIA: $1%")
		.replace(/NORMAL GRIP CONDITIONS/gi, "CONDICIONES DE PISTA NORMALES")
		.replace(/LOW GRIP CONDITIONS/gi, "CONDICIONES DE BAJA ADHERENCIA")
		.replace(/DEBRIS ON TRACK/gi, "RESTOS EN PISTA");

	// Conectores gramaticales
	out = out
		.replace(/\s+AND\s+/gi, " Y ")
		.replace(/\s+AT\s+/gi, " EN ")
		.replace(/\s+IN\s+/gi, " EN ")
		.replace(/\s+FROM\s+/gi, " DE ")
		.replace(/\s+TO\s+/gi, " A ");

	// Normalizar nombres de pilotos entre paréntesis
	out = out.replace(/\(([A-Z]{3})\)/g, (match, tla) => {
		const name = DRIVER_TLA_TO_NAME[tla.toUpperCase()];
		return name ? `(${name})` : match;
	});

	// Desinfección estricta (Lance Stroll = Stroll, nunca "Paseo")
	out = sanitizeF1DriverNames(out);

	return out;
}

/**
 * Pre-procesa el mensaje protegiendo nombres de pilotos antes de pasarlo a un traductor externo.
 */
export function prepareFiaMessageForTranslation(msg: string): string {
	if (!msg) return "";
	return msg.replace(/\(([A-Z]{3})\)/g, (match, tla) => {
		const name = DRIVER_TLA_TO_NAME[tla.toUpperCase()];
		return name ? `(${name})` : match;
	});
}

/**
 * Post-procesa la traducción devuelta por la API para corregir errores.
 */
export function postProcessFiaTranslation(translated: string): string {
	if (!translated) return "";
	let clean = translateFiaMessage(translated);
	return sanitizeF1DriverNames(clean);
}
