// src/constants/teamColors.ts

export const TEAM_COLORS: Record<string, string> = {
	mercedes: "#00D2BE",
	red_bull: "#061D43",
	red_bull_racing: "#061D43",
	ferrari: "#E10600",
	mclaren: "#FF8700",
	aston_martin: "#006F62",
	alpine: "#0093CC",
	alpine_f1_team: "#0093CC",
	williams: "#005AFF",
	williams_racing: "#005AFF",
	rb: "#4B77FF",
	racing_bulls: "#4B77FF",
	vcarb: "#4B77FF",
	haas: "#B6BABD",
	haas_f1_team: "#B6BABD",
	audi: "#C0C0C0",
	audi_f1_team: "#C0C0C0",
	cadillac: "#94A3B8",
	cadillac_f1_team: "#94A3B8",
	sauber: "#52E252",
};

// Función útil para normalizar el nombre y obtener el color oficial
export const getTeamColor = (teamName: string): string => {
	const formattedName = (teamName || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
	return TEAM_COLORS[formattedName] || "#A1A1AA";
};
