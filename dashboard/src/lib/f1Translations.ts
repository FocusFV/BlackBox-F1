// Utilidades de traducción oficial de Fórmula 1 y códigos de bandera

const GP_TRANSLATIONS: Record<string, string> = {
	"australian grand prix": "Gran Premio de Australia",
	"chinese grand prix": "Gran Premio de China",
	"japanese grand prix": "Gran Premio de Japón",
	"bahrain grand prix": "Gran Premio de Baréin",
	"saudi arabian grand prix": "Gran Premio de Arabia Saudita",
	"miami grand prix": "Gran Premio de Miami",
	"emilia romagna grand prix": "Gran Premio de Emilia-Romaña",
	"monaco grand prix": "Gran Premio de Mónaco",
	"canadian grand prix": "Gran Premio de Canadá",
	"spanish grand prix": "Gran Premio de España",
	"austrian grand prix": "Gran Premio de Austria",
	"british grand prix": "Gran Premio de Gran Bretaña",
	"hungarian grand prix": "Gran Premio de Hungría",
	"belgian grand prix": "Gran Premio de Bélgica",
	"dutch grand prix": "Gran Premio de los Países Bajos",
	"italian grand prix": "Gran Premio de Italia",
	"azerbaijan grand prix": "Gran Premio de Azerbaiyán",
	"singapore grand prix": "Gran Premio de Singapur",
	"malaysian grand prix": "Gran Premio de Malasia",
	"malaysia grand prix": "Gran Premio de Malasia",
	"bahrain grand prix in malaysia": "Gran Premio de Malasia",
	"united states grand prix": "Gran Premio de los Estados Unidos",
	"mexico city grand prix": "Gran Premio de la Ciudad de México",
	"mexican grand prix": "Gran Premio de México",
	"são paulo grand prix": "Gran Premio de São Paulo",
	"sao paulo grand prix": "Gran Premio de São Paulo",
	"brazilian grand prix": "Gran Premio de São Paulo",
	"barcelona grand prix": "Gran Premio de Barcelona",
	"barcelona": "Gran Premio de Barcelona",
	"gran premio de barcelona": "Gran Premio de Barcelona",
	"catalunya grand prix": "Gran Premio de Barcelona",
	"las vegas grand prix": "Gran Premio de Las Vegas",
	"qatar grand prix": "Gran Premio de Catar",
	"abu dhabi grand prix": "Gran Premio de Abu Dabi",
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

export type F1Lang = "es" | "en" | "pt";

export function translateGpName(rawName?: string, lang: F1Lang = "es"): string {
	if (!rawName) {
		return lang === "en" ? "Grand Prix" : lang === "pt" ? "Grande Prêmio" : "Gran Premio";
	}
	const normalized = rawName.toLowerCase().trim();
	if (lang === "en") {
		// En inglés, preservar o asegurar nombre con Grand Prix
		if (normalized.includes("grand prix")) {
			return rawName;
		}
		const cleaned = rawName.replace(/gran premio de/i, "").replace(/gran premio/i, "").replace(/grande prêmio de/i, "").replace(/grande prêmio/i, "").trim();
		return `${cleaned} Grand Prix`;
	}
	if (lang === "pt") {
		const esName = GP_TRANSLATIONS[normalized];
		if (esName) {
			return esName.replace(/^Gran Premio de/i, "Grande Prêmio da").replace(/^Gran Premio del/i, "Grande Prêmio do").replace(/^Gran Premio/i, "Grande Prêmio");
		}
		const cleaned = rawName.replace(/grand prix/i, "").replace(/gp/i, "").replace(/gran premio de/i, "").replace(/gran premio/i, "").trim();
		return cleaned ? `Grande Prêmio de ${cleaned}` : "Grande Prêmio";
	}
	// Español (por defecto)
	if (GP_TRANSLATIONS[normalized]) {
		return GP_TRANSLATIONS[normalized];
	}
	for (const [key, translated] of Object.entries(GP_TRANSLATIONS)) {
		if (normalized.includes(key.replace(" grand prix", ""))) {
			return translated;
		}
	}
	const cleaned = rawName
		.replace(/grand prix/i, "")
		.replace(/gp/i, "")
		.replace(/gran premio de/i, "")
		.replace(/gran premio/i, "")
		.trim();
	return cleaned ? `Gran Premio de ${cleaned}` : "Gran Premio";
}

export function translateSessionName(session?: string, lang: F1Lang = "es"): string {
	if (!session) {
		return lang === "en" ? "Official Session" : lang === "pt" ? "Sessão Oficial" : "Sesión Oficial";
	}
	const lower = session.toLowerCase().trim();
	if (lower.includes("fp1") || lower.includes("practice 1") || lower.includes("práctica 1") || lower.includes("practica 1") || lower.includes("treino 1")) {
		return lang === "en" ? "Practice 1" : lang === "pt" ? "Treino Livre 1" : "Práctica 1";
	}
	if (lower.includes("fp2") || lower.includes("practice 2") || lower.includes("práctica 2") || lower.includes("practica 2") || lower.includes("treino 2")) {
		return lang === "en" ? "Practice 2" : lang === "pt" ? "Treino Livre 2" : "Práctica 2";
	}
	if (lower.includes("fp3") || lower.includes("practice 3") || lower.includes("práctica 3") || lower.includes("practica 3") || lower.includes("treino 3")) {
		return lang === "en" ? "Practice 3" : lang === "pt" ? "Treino Livre 3" : "Práctica 3";
	}
	if (lower.includes("sprint shootout") || lower.includes("sprint qualifying") || lower.includes("sq")) {
		return lang === "en" ? "Sprint Qualifying" : lang === "pt" ? "Classificação Sprint" : "Clasificación Sprint";
	}
	if (lower.includes("sprint")) {
		return lang === "en" ? "Sprint Race" : lang === "pt" ? "Corrida Sprint" : "Carrera Sprint";
	}
	if (lower.includes("qualifying") || lower.includes("qualy") || lower.includes("clasificación") || lower.includes("clasificacion")) {
		return lang === "en" ? "Qualifying" : lang === "pt" ? "Classificação" : "Clasificación";
	}
	if (lower.includes("race") || lower.includes("carrera") || lower.includes("corrida")) {
		return lang === "en" ? "Grand Prix" : lang === "pt" ? "Grande Prêmio" : "Gran Premio";
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
