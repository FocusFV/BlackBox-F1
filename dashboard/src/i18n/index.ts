import { es } from "./es";
import { en } from "./en";
import { pt } from "./pt";
import type { Language, TranslationDictionary } from "./types";

export * from "./types";

export const dictionaries: Record<Language, TranslationDictionary> = {
	es,
	en,
	pt,
};

export const languages: { code: Language; name: string; flag: string }[] = [
	{ code: "es", name: "Español", flag: "🇪🇸" },
	{ code: "en", name: "English", flag: "🇬🇧" },
	{ code: "pt", name: "Português", flag: "🇧🇷" },
];

export function getDictionary(lang: Language = "es"): TranslationDictionary {
	return dictionaries[lang] || dictionaries.es;
}

/**
 * Detecta inteligentemente el idioma del dispositivo/navegador del usuario.
 * - Si comienza con 'pt' (ej. pt-BR, pt-PT) -> 'pt' (Português)
 * - Si comienza con 'en' (ej. en-US, en-GB) -> 'en' (English)
 * - En cualquier otro caso (o 'es') -> 'es' (Español)
 */
export function detectBrowserLanguage(): Language {
	if (typeof window === "undefined") {
		return "es";
	}
	const navLang = (navigator.language || (navigator as any).userLanguage || "").toLowerCase().trim();
	if (navLang.startsWith("pt")) {
		return "pt";
	}
	if (navLang.startsWith("en")) {
		return "en";
	}
	return "es";
}
