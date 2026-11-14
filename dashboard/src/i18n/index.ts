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
