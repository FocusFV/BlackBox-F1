import type { Map } from "@/types/map.type";

export const fetchMap = async (circuitKey: number): Promise<Map | null> => {
	try {
		const year = new Date().getFullYear();

		let mapRequest = await fetch(`https://api.multiviewer.app/api/v1/circuits/${circuitKey}/${year}`, {
			next: { revalidate: 60 * 60 * 2 },
		});

		// 🛡️ FALLBACK: Si el circuitKey de prueba no existe (404), busca Las Vegas Strip (Key 152 / 17 curvas)
		if (!mapRequest.ok) {
			console.warn(`CircuitKey ${circuitKey} no encontrado. Reintentando con circuito fallback (152 / Las Vegas)...`);
			mapRequest = await fetch(`https://api.multiviewer.app/api/v1/circuits/152/2024`, {
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