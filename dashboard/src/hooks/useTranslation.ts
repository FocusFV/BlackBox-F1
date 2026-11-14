"use client";

import { useSettingsStore, type Language } from "@/stores/useSettingsStore";
import { dictionaries, languages, getDictionary, type TranslationDictionary } from "@/i18n";
import { useCallback } from "react";

export function useTranslation() {
	const language = useSettingsStore((state) => state.language) || "es";
	const setLanguage = useSettingsStore((state) => state.setLanguage);

	const dict: TranslationDictionary = getDictionary(language);

	// Acceso estilo t("nav.dashboard") o t("telemetry.gap") con fallback
	const t = useCallback(
		(path: string, fallback?: string): string => {
			const keys = path.split(".");
			let current: any = dict;
			for (const key of keys) {
				if (current && typeof current === "object" && key in current) {
					current = current[key];
				} else {
					// Fallback al diccionario en español si falta una clave
					let fbCurrent: any = dictionaries.es;
					for (const fbKey of keys) {
						if (fbCurrent && typeof fbCurrent === "object" && fbKey in fbCurrent) {
							fbCurrent = fbCurrent[fbKey];
						} else {
							return fallback || path;
						}
					}
					return typeof fbCurrent === "string" ? fbCurrent : fallback || path;
				}
			}
			return typeof current === "string" ? current : fallback || path;
		},
		[dict]
	);

	return {
		t,
		dict,
		language,
		setLanguage,
		languages,
	};
}
