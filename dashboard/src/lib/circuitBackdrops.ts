// Mapeo inteligente de fondos aéreos para cada circuito y Gran Premio

const CIRCUIT_IMAGE_MAP: Record<string, string> = {
	monaco: "/circuits/monaco.webp",
	"monte carlo": "/circuits/monaco.webp",
	"circuit de monaco": "/circuits/monaco.webp",

	americas: "/circuits/americas.webp",
	cota: "/circuits/americas.webp",
	austin: "/circuits/americas.webp",
	texas: "/circuits/americas.webp",
	"united states": "/circuits/americas.webp",
	usa: "/circuits/americas.webp",

	rodriguez: "/circuits/mexico.webp",
	mexico: "/circuits/mexico.webp",
	"hermanos rodriguez": "/circuits/mexico.webp",
	"ciudad de mexico": "/circuits/mexico.webp",
	cdmx: "/circuits/mexico.webp",

	interlagos: "/circuits/interlagos.webp",
	brazil: "/circuits/interlagos.webp",
	"sao paulo": "/circuits/interlagos.webp",

	vegas: "/circuits/vegas.webp",
	"las vegas": "/circuits/vegas.webp",

	silverstone: "/circuits/silverstone.webp",
	"great britain": "/circuits/silverstone.webp",

	spa: "/circuits/spa.webp",
	belgium: "/circuits/spa.webp",

	monza: "/circuits/monza.webp",
	italy: "/circuits/monza.webp",

	suzuka: "/circuits/suzuka.webp",
	japan: "/circuits/suzuka.webp",
};

export function getCircuitBackdropUrl(gpName?: string, countryRaw?: string, circuitId?: string): string {
	const candidates = [
		circuitId?.toLowerCase().trim(),
		countryRaw?.toLowerCase().trim(),
		gpName?.toLowerCase().trim(),
	].filter(Boolean) as string[];

	for (const candidate of candidates) {
		for (const [key, path] of Object.entries(CIRCUIT_IMAGE_MAP)) {
			if (candidate.includes(key)) {
				return path;
			}
		}
	}

	return "/circuits/default.webp";
}
