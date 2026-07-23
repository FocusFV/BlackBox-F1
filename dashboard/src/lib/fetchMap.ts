import type { Map } from "@/types/map.type";

export const fetchMap = async (circuitKey: number): Promise<Map | null> => {
	try {
		const year = new Date().getFullYear();

		let mapRequest = await fetch(`https://api.multiviewer.app/api/v1/circuits/${circuitKey}/${year}`, {
			next: { revalidate: 60 * 60 * 2 },
		});

		// 🛡️ FALLBACK: Si el circuitKey de prueba no existe (404), busca un mapa por defecto (Key 7 / Silverstone)
		if (!mapRequest.ok) {
			console.warn(`CircuitKey ${circuitKey} no encontrado. Reintentando con circuito fallback (7)...`);
			mapRequest = await fetch(`https://api.multiviewer.app/api/v1/circuits/7/${year}`, {
				next: { revalidate: 60 * 60 * 2 },
			});
		}

		if (!mapRequest.ok) {
			console.error("Failed to fetch map", mapRequest);
			return null;
		}

		return mapRequest.json();
	} catch (error) {
		console.error("Failed to fetch map", error);
		return null;
	}
};