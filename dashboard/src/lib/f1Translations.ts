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
	"brazilian grand prix": "Gran Premio de Brasil",
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

export function translateGpName(rawName?: string): string {
	if (!rawName) return "Gran Premio";
	const normalized = rawName.toLowerCase().trim();
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

export function translateSessionName(session?: string): string {
	if (!session) return "Sesión Oficial";
	const lower = session.toLowerCase().trim();
	if (lower.includes("fp1") || lower.includes("practice 1") || lower.includes("práctica 1") || lower.includes("practica 1")) return "Práctica 1";
	if (lower.includes("fp2") || lower.includes("practice 2") || lower.includes("práctica 2") || lower.includes("practica 2")) return "Práctica 2";
	if (lower.includes("fp3") || lower.includes("practice 3") || lower.includes("práctica 3") || lower.includes("practica 3")) return "Práctica 3";
	if (lower.includes("sprint shootout") || lower.includes("sprint qualifying") || lower.includes("sq")) return "Clasificación Sprint";
	if (lower.includes("sprint")) return "Carrera Sprint";
	if (lower.includes("qualifying") || lower.includes("qualy") || lower.includes("clasificación") || lower.includes("clasificacion")) return "Clasificación";
	if (lower.includes("race") || lower.includes("carrera")) return "Gran Premio";
	return session;
}

export function translateStatus(status?: string): string {
	if (!status) return "";
	const s = status.toLowerCase().trim();
	if (s === "finished") return "FINALIZADO";
	if (s === "lapped" || s === "+1 lap" || s === "+1 vta") return "+1 VUELTA";
	const lapsMatch = s.match(/^\+(\d+)\s+laps?/i);
	if (lapsMatch) return `+${lapsMatch[1]} VUELTAS`;
	const plainLaps = s.match(/^(\d+)\s+laps?/i);
	if (plainLaps) return `+${plainLaps[1]} VUELTAS`;
	if (s.includes("did not start") || s === "dns") return "NO LARGÓ";
	if (s.includes("did not qualify") || s === "dnq") return "NO CLASIFICÓ";
	if (s.includes("disqualified") || s.includes("dsq")) return "DESCALIFICADO";
	if (s.includes("retired") || s.includes("withdrew") || s === "ret") return "RETIRADO";
	if (s.includes("accident") || s.includes("collision") || s.includes("crash")) return "COLISIÓN";
	if (s.includes("engine") || s.includes("power unit")) return "MOTOR";
	if (s.includes("gearbox")) return "CAJA DE CAMBIOS";
	if (s.includes("transmission")) return "TRANSMISIÓN";
	if (s.includes("brakes")) return "FRENOS";
	if (s.includes("suspension")) return "SUSPENSIÓN";
	if (s.includes("hydraulics")) return "HIDRÁULICA";
	if (s.includes("electrical")) return "ELÉCTRICO";
	if (s.includes("puncture") || s.includes("tyre") || s.includes("tire")) return "PINCHAZO";
	if (s.includes("spun") || s.includes("spin")) return "TROMPO";
	if (s === "dnf" || s === "out") return "RETIRADO";
	return status.toUpperCase();
}

