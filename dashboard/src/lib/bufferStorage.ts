/**
 * 🛰️ Persistencia Inteligente del Búfer de Telemetría (Anti-Spoiler TV Sync)
 * Guarda y restaura el historial rodante de telemetría en sessionStorage
 * para que al recargar la página (F5) o reactivar la pestaña, el búfer NO arranque de 0s
 * y el usuario no tenga que esperar "la bajada" de segundos.
 */

const STORAGE_KEY = "blackbox_telemetry_buffer_v1";
const SYNC_DISMISSED_KEY = "blackbox_sync_dismissed";
const MAX_BUFFER_AGE_MS = 240_000; // 4 minutos de validez máxima para considerar el búfer vigente

export interface SavedBufferFrame {
	data: any;
	timestamp: number;
}

export interface SavedBufferPayload {
	savedAt: number;
	sessionKey?: string | number | null;
	buffers: Record<string, SavedBufferFrame[]>;
	carFrames?: SavedBufferFrame[];
	posFrames?: SavedBufferFrame[];
}

export function saveBuffersToStorage(
	buffers: Record<string, { getFrames?: () => SavedBufferFrame[] }>,
	carBuffer?: { getFrames?: () => SavedBufferFrame[] },
	posBuffer?: { getFrames?: () => SavedBufferFrame[] },
	sessionKey?: string | number | null
): void {
	if (typeof window === "undefined") return;

	try {
		const now = Date.now();
		const cutoff = now - MAX_BUFFER_AGE_MS;

		const payload: SavedBufferPayload = {
			savedAt: now,
			sessionKey: sessionKey ?? null,
			buffers: {},
		};

		// 1. Guardar los buffers de estado (TimingData, TrackStatus, Clock, etc.)
		for (const [key, b] of Object.entries(buffers)) {
			if (typeof b?.getFrames === "function") {
				const frames = b.getFrames();
				if (Array.isArray(frames) && frames.length > 0) {
					const recent = frames.filter((f) => f && f.timestamp >= cutoff);
					if (recent.length > 0) {
						payload.buffers[key] = recent;
					}
				}
			}
		}

		// 2. Telemetría de coches y GPS se omiten de sessionStorage para evitar QuotaExceeded y bloqueos de CPU (se reconectan vía SSE de inmediato)

		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		} catch (storageErr) {
			// Si excede la cuota por carFrames/posFrames, guardamos solo los buffers de estado críticos
			delete payload.carFrames;
			delete payload.posFrames;
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		}
	} catch (e) {
		console.warn("[BufferStorage] No se pudo guardar búfer en sessionStorage:", e);
	}
}

export function restoreBuffersFromStorage(
	buffers: Record<string, { loadFrames?: (frames: SavedBufferFrame[]) => void }>,
	carBuffer?: { loadFrames?: (frames: SavedBufferFrame[]) => void },
	posBuffer?: { loadFrames?: (frames: SavedBufferFrame[]) => void },
	currentSessionKey?: string | number | null
): boolean {
	if (typeof window === "undefined") return false;

	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return false;

		const payload: SavedBufferPayload = JSON.parse(raw);
		if (!payload || !payload.savedAt || !payload.buffers) return false;

		const now = Date.now();
		const age = now - payload.savedAt;

		// Si pasaron más de 4 minutos o el reloj del dispositivo saltó hacia atrás, el búfer caducó
		if (age > MAX_BUFFER_AGE_MS || age < -5000) {
			sessionStorage.removeItem(STORAGE_KEY);
			return false;
		}

		// Si cambió de sesión (ej: de Práctica 3 a Clasificación), descartar
		if (
			currentSessionKey &&
			payload.sessionKey &&
			String(currentSessionKey) !== String(payload.sessionKey)
		) {
			sessionStorage.removeItem(STORAGE_KEY);
			return false;
		}

		let restoredCount = 0;

		for (const [key, frames] of Object.entries(payload.buffers)) {
			if (buffers[key] && typeof buffers[key].loadFrames === "function" && Array.isArray(frames)) {
				buffers[key].loadFrames(frames);
				restoredCount++;
			}
		}

		if (payload.carFrames && typeof carBuffer?.loadFrames === "function") {
			carBuffer.loadFrames(payload.carFrames);
		}

		if (payload.posFrames && typeof posBuffer?.loadFrames === "function") {
			posBuffer.loadFrames(payload.posFrames);
		}

		return restoredCount > 0;
	} catch (e) {
		console.warn("[BufferStorage] Error al restaurar búfer:", e);
		return false;
	}
}

export function clearBufferStorage(): void {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.removeItem(STORAGE_KEY);
		sessionStorage.removeItem(SYNC_DISMISSED_KEY);
	} catch {}
}

export function isSyncModalDismissed(): boolean {
	if (typeof window === "undefined") return false;
	return sessionStorage.getItem(SYNC_DISMISSED_KEY) === "true";
}

export function setSyncModalDismissed(dismissed: boolean): void {
	if (typeof window === "undefined") return;
	if (dismissed) {
		sessionStorage.setItem(SYNC_DISMISSED_KEY, "true");
	} else {
		sessionStorage.removeItem(SYNC_DISMISSED_KEY);
	}
}
