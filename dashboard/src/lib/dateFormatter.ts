import { utc } from "moment";

// Diccionario pistero para obligar a los meses a hablar en español
const monthsTranslation: Record<string, string> = {
	january: "Enero",
	february: "Febrero",
	march: "Marzo",
	april: "Abril",
	may: "Mayo",
	june: "Junio",
	july: "Julio",
	august: "Agosto",
	september: "Septiembre",
	october: "Octubre",
	november: "Noviembre",
	december: "Diciembre",
	jan: "Ene",
	feb: "Feb",
	mar: "Mar",
	apr: "Abr",
	may_short: "May",
	jun: "Jun",
	jul: "Jul",
	aug: "Ago",
	sep: "Sep",
	oct: "Oct",
	nov: "Nov",
	dec: "Dic"
};

export const formatMonth = (start: string, end: string): string => {
	const startM = utc(start).local();
	const endM = utc(end).local();

	const startMonthEng = startM.format("MMMM").toLowerCase();
	const endMonthEng = endM.format("MMMM").toLowerCase();

	const sameMonth = startMonthEng === endMonthEng;

	if (sameMonth) {
		return monthsTranslation[startMonthEng] || startM.format("MMMM");
	} else {
		const startShort = startM.format("MMM").toLowerCase();
		const endShort = endM.format("MMM").toLowerCase();
		
		// Corrección por si las moscas con mayo corto
		const startTranslated = startShort === "may" ? "May" : (monthsTranslation[startShort] || startM.format("MMM"));
		const endTranslated = endShort === "may" ? "May" : (monthsTranslation[endShort] || endM.format("MMM"));

		return `${startTranslated} - ${endTranslated}`;
	}
};

export const formatDayRange = (start: string, end: string): string => {
	return `${utc(start).local().format("D")}-${utc(end).local().format("D")}`;
};