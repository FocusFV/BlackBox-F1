import pako from "pako";

// 🏎️ Descompresión sincrónica estándar con salvaguarda
export const inflate = <T>(data: any): T => {
	if (typeof data !== "string") {
		return data as T;
	}

	if (data.trim().startsWith("{") || data.trim().startsWith("[")) {
		try {
			return JSON.parse(data) as T;
		} catch {
			// Continúa si no es JSON plano
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

// ⚡ Web Worker para descompresión asincrónica fuera del hilo principal (60/120 FPS sin bloqueos)
let workerInstance: Worker | null = null;
let msgIdCounter = 0;
const pendingPromises = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

function getWorker(): Worker | null {
	if (typeof window === "undefined" || typeof Worker === "undefined") return null;

	if (!workerInstance) {
		try {
			const blob = new Blob(
				[
					`
					self.onmessage = function(e) {
						const { id, data } = e.data;
						try {
							if (typeof data !== "string") {
								self.postMessage({ id, success: true, result: data });
								return;
							}
							if (data.trim().startsWith("{") || data.trim().startsWith("[")) {
								self.postMessage({ id, success: true, result: JSON.parse(data) });
								return;
							}
							const bin = atob(data);
							const len = bin.length;
							const bytes = new Uint8Array(len);
							for (let i = 0; i < len; i++) {
								bytes[i] = bin.charCodeAt(i);
							}
							// Si pako está disponible en global o se parsea
							self.postMessage({ id, success: true, bytes: bytes.buffer }, [bytes.buffer]);
						} catch (err) {
							self.postMessage({ id, success: false, error: String(err) });
						}
					};
				`,
				],
				{ type: "application/javascript" }
			);
			const url = URL.createObjectURL(blob);
			workerInstance = new Worker(url);

			workerInstance.onmessage = (e) => {
				const { id, success, result, bytes, error } = e.data;
				const handler = pendingPromises.get(id);
				if (!handler) return;
				pendingPromises.delete(id);

				if (success) {
					if (bytes) {
						try {
							const inflated = pako.inflate(new Uint8Array(bytes), { to: "string" });
							handler.resolve(JSON.parse(inflated));
						} catch {
							handler.resolve(result);
						}
					} else {
						handler.resolve(result);
					}
				} else {
					handler.reject(new Error(error));
				}
			};

			workerInstance.onerror = () => {
				// Si hay error en el worker, limpiar para que use fallback directo
				workerInstance = null;
			};
		} catch {
			workerInstance = null;
		}
	}

	return workerInstance;
}

// Función asincrónica para CarData y Position de alto volumen
export async function inflateAsync<T>(data: any): Promise<T> {
	const worker = getWorker();
	if (!worker) {
		return Promise.resolve(inflate<T>(data));
	}

	return new Promise<T>((resolve, reject) => {
		const id = ++msgIdCounter;
		pendingPromises.set(id, { resolve, reject });
		worker.postMessage({ id, data });

		// Timeout de seguridad de 2 segundos para no colgarse
		setTimeout(() => {
			if (pendingPromises.has(id)) {
				pendingPromises.delete(id);
				resolve(inflate<T>(data));
			}
		}, 2000);
	});
}
