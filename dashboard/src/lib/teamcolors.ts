// src/constants/teamColors.ts

export const TEAM_COLORS: Record<string, string> = {
	mercedes: "#27F4D2",
	red_bull: "#3671C6",
	ferrari: "#E8002D",
	mclaren: "#FF8000",
	aston_martin: "#229971",
	alpine: "#0093CC",
	williams: "#64C4FF",
	vcarb: "#6692FF", // Racing Bulls / RB
	sauber: "#52E252", // Kick Sauber
	haas: "#B6BABD",
	audi: "#F51B4F", // Por si las moscas ya lo tenemos
	cadillac: "#FFFFFF"
};

// Función útil por si la API te devuelve el nombre de la escudería en mayúsculas o con espacios
export const getTeamColor = (teamName: string): string => {
	const formattedName = teamName.toLowerCase().replace(/\s+/g, "_");
	return TEAM_COLORS[formattedName] || "#A1A1AA"; // Gris zinc por defecto si no encuentra
};