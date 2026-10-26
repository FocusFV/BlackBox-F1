import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * 📳 Emite una respuesta háptica (micro-vibración metálica) estilo botón de volante F1
 */
export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
	if (typeof window === "undefined" || typeof navigator === "undefined") return;
	
	try {
		const enabled = useSettingsStore.getState().hapticFeedback;
		if (!enabled) return;

		if ("vibrate" in navigator) {
			if (type === "light") {
				navigator.vibrate(8);
			} else if (type === "medium") {
				navigator.vibrate(15);
			} else if (type === "heavy") {
				navigator.vibrate([15, 30, 15]);
			}
		}
	} catch {
		// Ignorar si el dispositivo no permite vibración
	}
}
