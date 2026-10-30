// src/lib/teamcolors.ts

export const TEAM_COLORS: Record<string, string> = {
	mercedes: "#00D2BE",
	red_bull: "#3671C6",
	red_bull_racing: "#3671C6",
	ferrari: "#E10600",
	mclaren: "#FF8700",
	aston_martin: "#006F62",
	alpine: "#FF00FF", // 🌸 Rosa BWT Alpine
	alpine_f1_team: "#FF00FF", // 🌸 Rosa BWT Alpine
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
	kick_sauber: "#52E252",
};

// 🏎️ Mapeo oficial 2026 por sigla de piloto (TLA)
export const DRIVER_COLORS_2026: Record<string, string> = {
	// Alpine F1 Team (BWT Rosa)
	COL: "#FF00FF",
	GAS: "#FF00FF",
	DOO: "#FF00FF",

	// Ferrari
	LEC: "#E10600",
	HAM: "#E10600",

	// McLaren
	NOR: "#FF8700",
	PIA: "#FF8700",

	// Red Bull Racing
	VER: "#3671C6",
	HAD: "#3671C6",
	VES: "#3671C6",

	// Mercedes
	RUS: "#00D2BE",
	ANT: "#00D2BE",

	// Aston Martin
	ALO: "#006F62",
	STR: "#006F62",

	// Williams Racing
	ALB: "#005AFF",
	SAI: "#005AFF",

	// Racing Bulls
	LAW: "#4B77FF",
	TSU: "#4B77FF",
	LIN: "#4B77FF",
	IWA: "#4B77FF",

	// Haas
	OCO: "#B6BABD",
	BEA: "#B6BABD",
	MAG: "#B6BABD",

	// Audi / Sauber
	HUL: "#C0C0C0",
	BOR: "#C0C0C0",

	// Cadillac F1 Team
	PER: "#94A3B8",
	BOT: "#94A3B8",
};

// Normalizar por nombre de escudería
export const getTeamColor = (teamName: string): string => {
	const formattedName = (teamName || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
	return TEAM_COLORS[formattedName] || "#A1A1AA";
};

// 🌟 Resuelve el color prioritario de cada piloto
export const resolveDriverColor = (tla?: string, teamName?: string, rawTeamColour?: string): string => {
	if (tla && DRIVER_COLORS_2026[tla.toUpperCase()]) {
		return DRIVER_COLORS_2026[tla.toUpperCase()];
	}

	if (teamName) {
		const teamCol = getTeamColor(teamName);
		if (teamCol !== "#A1A1AA") return teamCol;
	}

	if (rawTeamColour) {
		return rawTeamColour.startsWith("#") ? rawTeamColour : `#${rawTeamColour}`;
	}

	return "#3f3f46";
};
