import pako from "pako";

export const inflate = <T>(data: any): T => {
	// Si ya es un objeto o no es un string, retornarlo directo
	if (typeof data !== "string") {
		return data as T;
	}

	// Si es un JSON serializado simple (no comprimido)
	if (data.trim().startsWith("{") || data.trim().startsWith("[")) {
		try {
			return JSON.parse(data) as T;
		} catch {
			// Si falla el parseo, sigue al bloque atob
		}
	}

	try {
		const binaryString = atob(data);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);

		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		const inflated = pako.inflate(bytes, { to: "string" });
		return JSON.parse(inflated) as T;
	} catch (err) {
		console.warn("Fallo al descomprimir payload con inflate, intentando parseo raw:", err);
		try {
			return JSON.parse(data) as T;
		} catch {
			return data as T;
		}
	}
};