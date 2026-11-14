// Utilidades de traducción oficial de Fórmula 1 y códigos de bandera

export type F1Lang = "es" | "en" | "pt";

// 🏎️ DICCIONARIO TRILINGÜE DE GRANDES PREMIOS OFICIALES FIA
interface GpNameRecord {
	es: string;
	en: string;
	pt: string;
}

const GP_TRANSLATIONS_TABLE: Record<string, GpNameRecord> = {
	australia: { es: "Gran Premio de Australia", en: "Australian Grand Prix", pt: "Grande Prêmio da Austrália" },
	china: { es: "Gran Premio de China", en: "Chinese Grand Prix", pt: "Grande Prêmio da China" },
	japan: { es: "Gran Premio de Japón", en: "Japanese Grand Prix", pt: "Grande Prêmio do Japão" },
	bahrain: { es: "Gran Premio de Baréin", en: "Bahrain Grand Prix", pt: "Grande Prêmio do Bahrein" },
	"saudi arabia": { es: "Gran Premio de Arabia Saudita", en: "Saudi Arabian Grand Prix", pt: "Grande Prêmio da Arábia Saudita" },
	miami: { es: "Gran Premio de Miami", en: "Miami Grand Prix", pt: "Grande Prêmio de Miami" },
	"emilia romagna": { es: "Gran Premio de Emilia-Romaña", en: "Emilia Romagna Grand Prix", pt: "Grande Prêmio da Emília-Romanha" },
	monaco: { es: "Gran Premio de Mónaco", en: "Monaco Grand Prix", pt: "Grande Prêmio de Mônaco" },
	canada: { es: "Gran Premio de Canadá", en: "Canadian Grand Prix", pt: "Grande Prêmio do Canadá" },
	spain: { es: "Gran Premio de España", en: "Spanish Grand Prix", pt: "Grande Prêmio da Espanha" },
	barcelona: { es: "Gran Premio de Barcelona", en: "Barcelona Grand Prix", pt: "Grande Prêmio de Barcelona" },
	austria: { es: "Gran Premio de Austria", en: "Austrian Grand Prix", pt: "Grande Prêmio da Áustria" },
	"great britain": { es: "Gran Premio de Gran Bretaña", en: "British Grand Prix", pt: "Grande Prêmio da Grã-Bretanha" },
	silverstone: { es: "Gran Premio de Gran Bretaña", en: "British Grand Prix", pt: "Grande Prêmio da Grã-Bretanha" },
	hungary: { es: "Gran Premio de Hungría", en: "Hungarian Grand Prix", pt: "Grande Prêmio da Hungria" },
	belgium: { es: "Gran Premio de Bélgica", en: "Belgian Grand Prix", pt: "Grande Prêmio da Bélgica" },
	spa: { es: "Gran Premio de Bélgica", en: "Belgian Grand Prix", pt: "Grande Prêmio da Bélgica" },
	netherlands: { es: "Gran Premio de los Países Bajos", en: "Dutch Grand Prix", pt: "Grande Prêmio dos Países Baixos" },
	zandvoort: { es: "Gran Premio de los Países Bajos", en: "Dutch Grand Prix", pt: "Grande Prêmio dos Países Baixos" },
	italy: { es: "Gran Premio de Italia", en: "Italian Grand Prix", pt: "Grande Prêmio da Itália" },
	monza: { es: "Gran Premio de Italia", en: "Italian Grand Prix", pt: "Grande Prêmio da Itália" },
	azerbaijan: { es: "Gran Premio de Azerbaiyán", en: "Azerbaijan Grand Prix", pt: "Grande Prêmio do Azerbaijão" },
	baku: { es: "Gran Premio de Azerbaiyán", en: "Azerbaijan Grand Prix", pt: "Grande Prêmio do Azerbaijão" },
	singapore: { es: "Gran Premio de Singapur", en: "Singapore Grand Prix", pt: "Grande Prêmio de Cingapura" },
	malaysia: { es: "Gran Premio de Malasia", en: "Malaysian Grand Prix", pt: "Grande Prêmio da Malásia" },
	sepang: { es: "Gran Premio de Malasia", en: "Malaysian Grand Prix", pt: "Grande Prêmio da Malásia" },
	"united states": { es: "Gran Premio de los Estados Unidos", en: "United States Grand Prix", pt: "Grande Prêmio dos Estados Unidos" },
	austin: { es: "Gran Premio de los Estados Unidos", en: "United States Grand Prix", pt: "Grande Prêmio dos Estados Unidos" },
	cota: { es: "Gran Premio de los Estados Unidos", en: "United States Grand Prix", pt: "Grande Prêmio dos Estados Unidos" },
	"mexico city": { es: "Gran Premio de la Ciudad de México", en: "Mexico City Grand Prix", pt: "Grande Prêmio da Cidade do México" },
	mexico: { es: "Gran Premio de México", en: "Mexico City Grand Prix", pt: "Grande Prêmio do México" },
	"são paulo": { es: "Gran Premio de São Paulo", en: "São Paulo Grand Prix", pt: "Grande Prêmio de São Paulo" },
	"sao paulo": { es: "Gran Premio de São Paulo", en: "São Paulo Grand Prix", pt: "Grande Prêmio de São Paulo" },
	brazil: { es: "Gran Premio de São Paulo", en: "São Paulo Grand Prix", pt: "Grande Prêmio de São Paulo" },
	interlagos: { es: "Gran Premio de São Paulo", en: "São Paulo Grand Prix", pt: "Grande Prêmio de São Paulo" },
	"las vegas": { es: "Gran Premio de Las Vegas", en: "Las Vegas Grand Prix", pt: "Grande Prêmio de Las Vegas" },
	qatar: { es: "Gran Premio de Catar", en: "Qatar Grand Prix", pt: "Grande Prêmio do Catar" },
	losail: { es: "Gran Premio de Catar", en: "Qatar Grand Prix", pt: "Grande Prêmio do Catar" },
	"abu dhabi": { es: "Gran Premio de Abu Dabi", en: "Abu Dhabi Grand Prix", pt: "Grande Prêmio de Abu Dhabi" },
	yas: { es: "Gran Premio de Abu Dabi", en: "Abu Dhabi Grand Prix", pt: "Grande Prêmio de Abu Dhabi" },
};

const COUNTRY_TO_CODE: Record<string, string> = {
	australia: "aus",
	austria: "aut",
	azerbaijan: "aze",
	bahrain: "brn",
	belgium: "bel",
	brazil: "bra",
	brasil: "bra",
	canada: "can",
	china: "chn",
	spain: "esp",
	españa: "esp",
	barcelona: "esp",
	france: "fra",
	francia: "fra",
	"great britain": "gbr",
	"united kingdom": "gbr",
	uk: "gbr",
	germany: "ger",
	alemania: "ger",
	hungary: "hun",
	hungria: "hun",
	italy: "ita",
	italia: "ita",
	japan: "jpn",
	japon: "jpn",
	"saudi arabia": "ksa",
	arabia: "ksa",
	malaysia: "mys",
	malasia: "mys",
	sepang: "mys",
	mexico: "mex",
	monaco: "mon",
	netherlands: "ned",
	"paises bajos": "ned",
	portugal: "por",
	qatar: "qat",
	singapore: "sgp",
	singapur: "sgp",
	"united states": "usa",
	usa: "usa",
	"estados unidos": "usa",
	"las vegas": "usa",
	miami: "usa",
	austin: "usa",
	uae: "uae",
	"united arab emirates": "uae",
	"emiratos arabes": "uae",
	"emiratos árabes": "uae",
	"emiratos árabes unidos": "uae",
};

export function getCountryCodeForGp(gpName?: string, countryRaw?: string): string {
	if (countryRaw) {
		const cleanCountry = countryRaw.toLowerCase().trim();
		if (COUNTRY_TO_CODE[cleanCountry]) {
			return COUNTRY_TO_CODE[cleanCountry];
		}
	}
	if (gpName) {
		const cleanGp = gpName.toLowerCase().trim();
		for (const [key, code] of Object.entries(COUNTRY_TO_CODE)) {
			if (cleanGp.includes(key)) {
				return code;
			}
		}
	}
	return "";
}

// 🌍 DICCIONARIO TRILINGÜE DE PAÍSES DE FÓRMULA 1
const COUNTRY_TRANSLATIONS: Record<string, { es: string; en: string; pt: string }> = {
	australia: { es: "Australia", en: "Australia", pt: "Austrália" },
	austria: { es: "Austria", en: "Austria", pt: "Áustria" },
	azerbaijan: { es: "Azerbaiyán", en: "Azerbaijan", pt: "Azerbaijão" },
	azerbaiyán: { es: "Azerbaiyán", en: "Azerbaijan", pt: "Azerbaijão" },
	azerbaijão: { es: "Azerbaiyán", en: "Azerbaijan", pt: "Azerbaijão" },
	bahrain: { es: "Baréin", en: "Bahrain", pt: "Bahrein" },
	bahréin: { es: "Baréin", en: "Bahrain", pt: "Bahrein" },
	baréin: { es: "Baréin", en: "Bahrain", pt: "Bahrein" },
	bahrein: { es: "Baréin", en: "Bahrain", pt: "Bahrein" },
	belgium: { es: "Bélgica", en: "Belgium", pt: "Bélgica" },
	bélgica: { es: "Bélgica", en: "Belgium", pt: "Bélgica" },
	brazil: { es: "Brasil", en: "Brazil", pt: "Brasil" },
	brasil: { es: "Brasil", en: "Brazil", pt: "Brasil" },
	canada: { es: "Canadá", en: "Canada", pt: "Canadá" },
	canadá: { es: "Canadá", en: "Canada", pt: "Canadá" },
	china: { es: "China", en: "China", pt: "China" },
	spain: { es: "España", en: "Spain", pt: "Espanha" },
	españa: { es: "España", en: "Spain", pt: "Espanha" },
	espanha: { es: "España", en: "Spain", pt: "Espanha" },
	france: { es: "Francia", en: "France", pt: "França" },
	francia: { es: "Francia", en: "France", pt: "França" },
	frança: { es: "Francia", en: "France", pt: "França" },
	"great britain": { es: "Gran Bretaña", en: "Great Britain", pt: "Grã-Bretanha" },
	"gran bretaña": { es: "Gran Bretaña", en: "Great Britain", pt: "Grã-Bretanha" },
	"grã-bretanha": { es: "Gran Bretaña", en: "Great Britain", pt: "Grã-Bretanha" },
	"united kingdom": { es: "Reino Unido", en: "United Kingdom", pt: "Reino Unido" },
	"reino unido": { es: "Reino Unido", en: "United Kingdom", pt: "Reino Unido" },
	uk: { es: "Reino Unido", en: "UK", pt: "Reino Unido" },
	germany: { es: "Alemania", en: "Germany", pt: "Alemanha" },
	alemania: { es: "Alemania", en: "Germany", pt: "Alemanha" },
	alemanha: { es: "Alemania", en: "Germany", pt: "Alemanha" },
	hungary: { es: "Hungría", en: "Hungary", pt: "Hungria" },
	hungría: { es: "Hungría", en: "Hungary", pt: "Hungria" },
	hungria: { es: "Hungría", en: "Hungary", pt: "Hungria" },
	italy: { es: "Italia", en: "Italy", pt: "Itália" },
	italia: { es: "Italia", en: "Italy", pt: "Itália" },
	itália: { es: "Italia", en: "Italy", pt: "Itália" },
	japan: { es: "Japón", en: "Japan", pt: "Japão" },
	japon: { es: "Japón", en: "Japan", pt: "Japão" },
	japón: { es: "Japón", en: "Japan", pt: "Japão" },
	japão: { es: "Japón", en: "Japan", pt: "Japão" },
	"saudi arabia": { es: "Arabia Saudita", en: "Saudi Arabia", pt: "Arábia Saudita" },
	"arabia saudita": { es: "Arabia Saudita", en: "Saudi Arabia", pt: "Arábia Saudita" },
	"arábia saudita": { es: "Arabia Saudita", en: "Saudi Arabia", pt: "Arábia Saudita" },
	mexico: { es: "México", en: "Mexico", pt: "México" },
	méxico: { es: "México", en: "Mexico", pt: "México" },
	monaco: { es: "Mónaco", en: "Monaco", pt: "Mônaco" },
	mónaco: { es: "Mónaco", en: "Monaco", pt: "Mônaco" },
	mônaco: { es: "Mónaco", en: "Monaco", pt: "Mônaco" },
	netherlands: { es: "Países Bajos", en: "Netherlands", pt: "Países Baixos" },
	"paises bajos": { es: "Países Bajos", en: "Netherlands", pt: "Países Baixos" },
	"países bajos": { es: "Países Bajos", en: "Netherlands", pt: "Países Baixos" },
	"países baixos": { es: "Países Bajos", en: "Netherlands", pt: "Países Baixos" },
	portugal: { es: "Portugal", en: "Portugal", pt: "Portugal" },
	qatar: { es: "Catar", en: "Qatar", pt: "Catar" },
	catar: { es: "Catar", en: "Qatar", pt: "Catar" },
	singapore: { es: "Singapur", en: "Singapore", pt: "Singapura" },
	singapur: { es: "Singapur", en: "Singapore", pt: "Singapura" },
	singapura: { es: "Singapur", en: "Singapore", pt: "Singapura" },
	"united states": { es: "Estados Unidos", en: "United States", pt: "Estados Unidos" },
	usa: { es: "Estados Unidos", en: "USA", pt: "Estados Unidos" },
	"estados unidos": { es: "Estados Unidos", en: "United States", pt: "Estados Unidos" },
	uae: { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	"united arab emirates": { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	"emiratos arabes unidos": { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	"emiratos árabes unidos": { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	"emiratos arabes": { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	"emiratos árabes": { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	"emirados árabes unidos": { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	"abu dhabi": { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", pt: "Emirados Árabes Unidos" },
	malaysia: { es: "Malasia", en: "Malaysia", pt: "Malásia" },
	malasia: { es: "Malasia", en: "Malaysia", pt: "Malásia" },
	malásia: { es: "Malasia", en: "Malaysia", pt: "Malásia" },
	sepang: { es: "Malasia", en: "Malaysia", pt: "Malásia" },
};

export function translateCountry(country?: string, lang: F1Lang = "es"): string {
	if (!country) return "";
	const clean = country.toLowerCase().trim();
	const match = COUNTRY_TRANSLATIONS[clean];
	if (match) {
		return match[lang] || match.es;
	}
	// Búsqueda por coincidencia parcial si el string contiene el país
	for (const [key, val] of Object.entries(COUNTRY_TRANSLATIONS)) {
		if (clean.includes(key)) {
			return val[lang] || val.es;
		}
	}
	return country;
}

export function translateGpName(rawName?: string, lang: F1Lang = "es"): string {
	if (!rawName) {
		return lang === "en" ? "Grand Prix" : lang === "pt" ? "Grande Prêmio" : "Gran Premio";
	}
	const clean = rawName
		.toLowerCase()
		.replace(/^(gran premio de la|gran premio de los|gran premio del|gran premio de|gran premio|grande prêmio da|grande prêmio do|grande prêmio de|grande prêmio)\s+/i, "")
		.replace(/\s+(grand prix|gp)$/i, "")
		.trim();

	// Buscar primero por coincidencia exacta o en la tabla
	for (const [key, record] of Object.entries(GP_TRANSLATIONS_TABLE)) {
		if (clean === key || clean.includes(key) || rawName.toLowerCase().includes(key)) {
			return record[lang] || record.es;
		}
	}

	// Fallback por formato según idioma
	if (lang === "en") {
		return rawName.toLowerCase().includes("grand prix") ? rawName : `${clean} Grand Prix`;
	}
	if (lang === "pt") {
		return `Grande Prêmio de ${clean}`;
	}
	return `Gran Premio de ${clean}`;
}

export function translateSessionName(session?: string, lang: F1Lang = "es", short: boolean = false): string {
	if (!session) {
		return lang === "en" ? "Official Session" : lang === "pt" ? "Sessão Oficial" : "Sesión Oficial";
	}
	const lower = session.toLowerCase().trim();

	if (lower.includes("fp1") || lower.includes("practice 1") || lower.includes("práctica 1") || lower.includes("practica 1") || lower.includes("treino 1") || lower.includes("libres 1")) {
		return lang === "en" ? "Practice 1" : lang === "pt" ? "Treino Livre 1" : short ? "Libres 1" : "Práctica 1";
	}
	if (lower.includes("fp2") || lower.includes("practice 2") || lower.includes("práctica 2") || lower.includes("practica 2") || lower.includes("treino 2") || lower.includes("libres 2")) {
		return lang === "en" ? "Practice 2" : lang === "pt" ? "Treino Livre 2" : short ? "Libres 2" : "Práctica 2";
	}
	if (lower.includes("fp3") || lower.includes("practice 3") || lower.includes("práctica 3") || lower.includes("practica 3") || lower.includes("treino 3") || lower.includes("libres 3")) {
		return lang === "en" ? "Practice 3" : lang === "pt" ? "Treino Livre 3" : short ? "Libres 3" : "Práctica 3";
	}
	if (lower.includes("sprint shootout") || lower.includes("sprint qualifying") || lower.includes("sprint qualification") || lower.includes("sq") || lower.includes("clasif. sprint")) {
		return lang === "en" ? (short ? "Sprint Qualy" : "Sprint Qualifying") : lang === "pt" ? "Classif. Sprint" : "Clasif. Sprint";
	}
	if (lower.includes("sprint")) {
		return lang === "en" ? (short ? "Sprint" : "Sprint Race") : lang === "pt" ? (short ? "Sprint" : "Corrida Sprint") : (short ? "Sprint" : "Carrera Sprint");
	}
	if (lower.includes("qualifying") || lower.includes("qualy") || lower.includes("clasificación") || lower.includes("clasificacion") || lower.includes("classificação")) {
		return lang === "en" ? "Qualifying" : lang === "pt" ? "Classificação" : "Clasificación";
	}
	if (lower === "race" || lower.includes("carrera") || lower.includes("corrida")) {
		return lang === "en" ? (short ? "Race" : "Grand Prix") : lang === "pt" ? (short ? "Corrida" : "Grande Prêmio") : (short ? "Carrera" : "Gran Premio");
	}
	return session;
}

export function translateStatus(status?: string, lang: F1Lang = "es"): string {
	if (!status) return "";
	const s = status.toLowerCase().trim();
	if (s === "finished") {
		return lang === "en" ? "FINISHED" : "FINALIZADO";
	}
	if (s === "lapped" || s === "+1 lap" || s === "+1 vta") {
		return lang === "en" ? "+1 LAP" : lang === "pt" ? "+1 VOLTA" : "+1 VUELTA";
	}
	const lapsMatch = s.match(/^\+(\d+)\s+laps?/i);
	if (lapsMatch) {
		return lang === "en" ? `+${lapsMatch[1]} LAPS` : lang === "pt" ? `+${lapsMatch[1]} VOLTAS` : `+${lapsMatch[1]} VUELTAS`;
	}
	if (s.includes("did not start") || s === "dns") {
		return lang === "en" ? "DNS" : lang === "pt" ? "NÃO LARGOU" : "NO LARGÓ";
	}
	if (s.includes("did not qualify") || s === "dnq") {
		return lang === "en" ? "DNQ" : lang === "pt" ? "NÃO CLASSIF." : "NO CLASIFICÓ";
	}
	if (s.includes("disqualified") || s.includes("dsq")) {
		return lang === "en" ? "DISQUALIFIED" : lang === "pt" ? "DESCLASSIFICADO" : "DESCALIFICADO";
	}
	if (s.includes("retired") || s.includes("withdrew") || s === "ret" || s === "dnf" || s === "out") {
		return lang === "en" ? "RETIRED" : lang === "pt" ? "ABANDONOU" : "RETIRADO";
	}
	if (s.includes("accident") || s.includes("collision") || s.includes("crash")) {
		return lang === "en" ? "COLLISION" : lang === "pt" ? "COLISÃO" : "COLISIÓN";
	}
	if (s.includes("engine") || s.includes("power unit")) {
		return lang === "en" ? "ENGINE" : "MOTOR";
	}
	if (s.includes("gearbox")) {
		return lang === "en" ? "GEARBOX" : lang === "pt" ? "CÂMBIO" : "CAJA DE CAMBIOS";
	}
	if (s.includes("transmission")) {
		return lang === "en" ? "TRANSMISSION" : lang === "pt" ? "TRANSMISSÃO" : "TRANSMISIÓN";
	}
	if (s.includes("brakes")) {
		return lang === "en" ? "BRAKES" : lang === "pt" ? "FREIOS" : "FRENOS";
	}
	if (s.includes("suspension")) {
		return lang === "en" ? "SUSPENSION" : lang === "pt" ? "SUSPENSÃO" : "SUSPENSIÓN";
	}
	if (s.includes("hydraulics")) {
		return lang === "en" ? "HYDRAULICS" : lang === "pt" ? "HIDRÁULICA" : "HIDRÁULICA";
	}
	if (s.includes("electrical")) {
		return lang === "en" ? "ELECTRICAL" : lang === "pt" ? "ELÉTRICO" : "ELÉCTRICO";
	}
	if (s.includes("puncture") || s.includes("tyre") || s.includes("tire")) {
		return lang === "en" ? "PUNCTURE" : lang === "pt" ? "FURO NO PNEU" : "PINCHAZO";
	}
	if (s.includes("spun") || s.includes("spin")) {
		return lang === "en" ? "SPUN OFF" : lang === "pt" ? "RODOU" : "TROMPO";
	}
	return status.toUpperCase();
}
