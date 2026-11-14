export type Language = "es" | "en" | "pt";

export interface TranslationDictionary {
	nav: {
		home: string;
		dashboard: string;
		schedule: string;
		help: string;
		coffee: string;
		github: string;
		language: string;
	};
	sessions: {
		fp1: string;
		fp2: string;
		fp3: string;
		qualy: string;
		sprint_qualy: string;
		sprint: string;
		race: string;
		live: string;
		paused: string;
		finished: string;
		on_track: string;
		next_gp: string;
		last_gp: string;
	};
	telemetry: {
		interval: string;
		leader: string;
		gap: string;
		sector: string;
		s1: string;
		s2: string;
		s3: string;
		tyre: string;
		fastest_lap: string;
		in_pit: string;
		pit_stops: string;
		speed_trap: string;
		top_speed: string;
		lap: string;
		laps: string;
		laps_remaining: string;
		position: string;
		driver: string;
	};
	parc_ferme: {
		last_official_round: string;
		view_circuit: string;
		track_paused: string;
		official_results: string;
		final_classification: string;
		official_session: string;
	};
	race_control: {
		yellow_flag: string;
		green_flag: string;
		red_flag: string;
		vsc_active: string;
		sc_deployed: string;
		chequered_flag: string;
		track_clear: string;
		investigation: string;
		penalty: string;
	};
	weather: {
		title: string;
		track_temp: string;
		air_temp: string;
		humidity: string;
		pressure: string;
		wind: string;
		rain_risk: string;
		conditions: string;
	};
	settings: {
		title: string;
		subtitle: string;
		language: string;
		language_desc: string;
		theme: string;
		theme_desc: string;
		speed_unit: string;
		density: string;
		time_format: string;
	};
	common: {
		loading: string;
		close: string;
		open: string;
		back: string;
		yes: string;
		no: string;
	};
}
