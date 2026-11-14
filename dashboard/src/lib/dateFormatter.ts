import { utc } from "moment";
import type { F1Lang } from "./f1Translations";

// 📅 DICCIONARIO TRILINGÜE DE MESES OFICIALES (ES / EN / PT)
const MONTHS_BY_LANG: Record<F1Lang, { full: string[]; short: string[] }> = {
	es: {
		full: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
		short: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
	},
	en: {
		full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		short: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
	},
	pt: {
		full: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		short: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"]
	}
};

export const formatMonth = (start: string, end: string, lang: F1Lang = "es"): string => {
	const startM = utc(start).local();
	const endM = utc(end).local();
	const dict = MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.es;

	const startMonthIdx = startM.month();
	const endMonthIdx = endM.month();

	if (startMonthIdx === endMonthIdx) {
		return dict.full[startMonthIdx] || startM.format("MMMM");
	} else {
		const startShort = dict.short[startMonthIdx] || startM.format("MMM");
		const endShort = dict.short[endMonthIdx] || endM.format("MMM");
		return `${startShort} - ${endShort}`;
	}
};

export const formatDayRange = (start: string, end: string, lang: F1Lang = "es"): string => {
	const startM = utc(start).local();
	const endM = utc(end).local();
	const dict = MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.es;

	if (startM.month() !== endM.month()) {
		const startTr = dict.short[startM.month()] || startM.format("MMM").toUpperCase();
		const endTr = dict.short[endM.month()] || endM.format("MMM").toUpperCase();
		return `${startM.format("D")} ${startTr} - ${endM.format("D")} ${endTr}`;
	}
	return `${startM.format("D")}-${endM.format("D")}`;
};

export const formatDayMonthShort = (m: any, lang: F1Lang = "es"): string => {
	const dict = MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.es;
	const day = m.format("DD");
	const month = dict.short[m.month()] || m.format("MMM").toUpperCase();
	return `${day} · ${month}`;
};
