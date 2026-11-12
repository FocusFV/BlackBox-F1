import { useDataStore } from "@/stores/useDataStore";
import type { DriverList, CarsData, Positions } from "@/types/state.type";
import circuit65Track from "@/data/circuit65Track.json";

// 🏎️ PARRILLA 2026 COMPLETA OFICIAL FIA (22 PILOTOS - 11 ESCUDERÍAS)
export const DRIVERS_2026: DriverList = {
	"4": {
		RacingNumber: "4",
		BroadcastName: "L NORRIS",
		FullName: "Lando NORRIS",
		Tla: "NOR",
		Line: 1,
		TeamName: "McLaren",
		TeamColour: "ff8000",
		FirstName: "Lando",
		LastName: "Norris",
		Reference: "NORRIS",
		HeadshotUrl: "",
		CountryCode: "GBR",
	},
	"1": {
		RacingNumber: "1",
		BroadcastName: "M VERSTAPPEN",
		FullName: "Max VERSTAPPEN",
		Tla: "VER",
		Line: 2,
		TeamName: "Red Bull Racing",
		TeamColour: "3671c6",
		FirstName: "Max",
		LastName: "Verstappen",
		Reference: "VERSTAPPEN",
		HeadshotUrl: "",
		CountryCode: "NED",
	},
	"16": {
		RacingNumber: "16",
		BroadcastName: "C LECLERC",
		FullName: "Charles LECLERC",
		Tla: "LEC",
		Line: 3,
		TeamName: "Ferrari",
		TeamColour: "e80020",
		FirstName: "Charles",
		LastName: "Leclerc",
		Reference: "LECLERC",
		HeadshotUrl: "",
		CountryCode: "MON",
	},
	"81": {
		RacingNumber: "81",
		BroadcastName: "O PIASTRI",
		FullName: "Oscar PIASTRI",
		Tla: "PIA",
		Line: 4,
		TeamName: "McLaren",
		TeamColour: "ff8000",
		FirstName: "Oscar",
		LastName: "Piastri",
		Reference: "PIASTRI",
		HeadshotUrl: "",
		CountryCode: "AUS",
	},
	"44": {
		RacingNumber: "44",
		BroadcastName: "L HAMILTON",
		FullName: "Lewis HAMILTON",
		Tla: "HAM",
		Line: 5,
		TeamName: "Ferrari",
		TeamColour: "e80020",
		FirstName: "Lewis",
		LastName: "Hamilton",
		Reference: "HAMILTON",
		HeadshotUrl: "",
		CountryCode: "GBR",
	},
	"63": {
		RacingNumber: "63",
		BroadcastName: "G RUSSELL",
		FullName: "George RUSSELL",
		Tla: "RUS",
		Line: 6,
		TeamName: "Mercedes",
		TeamColour: "27f4d2",
		FirstName: "George",
		LastName: "Russell",
		Reference: "RUSSELL",
		HeadshotUrl: "",
		CountryCode: "GBR",
	},
	"12": {
		RacingNumber: "12",
		BroadcastName: "K ANTONELLI",
		FullName: "Kimi ANTONELLI",
		Tla: "ANT",
		Line: 7,
		TeamName: "Mercedes",
		TeamColour: "27f4d2",
		FirstName: "Kimi",
		LastName: "Antonelli",
		Reference: "ANTONELLI",
		HeadshotUrl: "",
		CountryCode: "ITA",
	},
	"43": {
		RacingNumber: "43",
		BroadcastName: "F COLAPINTO",
		FullName: "Franco COLAPINTO",
		Tla: "COL",
		Line: 8,
		TeamName: "Alpine F1 Team",
		TeamColour: "0093cc",
		FirstName: "Franco",
		LastName: "Colapinto",
		Reference: "COLAPINTO",
		HeadshotUrl: "",
		CountryCode: "ARG",
	},
	"11": {
		RacingNumber: "11",
		BroadcastName: "S PEREZ",
		FullName: "Sergio PEREZ",
		Tla: "PER",
		Line: 9,
		TeamName: "Cadillac F1 Team",
		TeamColour: "94a3b8",
		FirstName: "Sergio",
		LastName: "Perez",
		Reference: "PEREZ",
		HeadshotUrl: "",
		CountryCode: "MEX",
	},
	"55": {
		RacingNumber: "55",
		BroadcastName: "C SAINZ",
		FullName: "Carlos SAINZ",
		Tla: "SAI",
		Line: 10,
		TeamName: "Williams",
		TeamColour: "005aff",
		FirstName: "Carlos",
		LastName: "Sainz",
		Reference: "SAINZ",
		HeadshotUrl: "",
		CountryCode: "ESP",
	},
	"14": {
		RacingNumber: "14",
		BroadcastName: "F ALONSO",
		FullName: "Fernando ALONSO",
		Tla: "ALO",
		Line: 11,
		TeamName: "Aston Martin",
		TeamColour: "229971",
		FirstName: "Fernando",
		LastName: "Alonso",
		Reference: "ALONSO",
		HeadshotUrl: "",
		CountryCode: "ESP",
	},
	"23": {
		RacingNumber: "23",
		BroadcastName: "A ALBON",
		FullName: "Alexander ALBON",
		Tla: "ALB",
		Line: 12,
		TeamName: "Williams",
		TeamColour: "005aff",
		FirstName: "Alexander",
		LastName: "Albon",
		Reference: "ALBON",
		HeadshotUrl: "",
		CountryCode: "THA",
	},
	"10": {
		RacingNumber: "10",
		BroadcastName: "P GASLY",
		FullName: "Pierre GASLY",
		Tla: "GAS",
		Line: 13,
		TeamName: "Alpine F1 Team",
		TeamColour: "0093cc",
		FirstName: "Pierre",
		LastName: "Gasly",
		Reference: "GASLY",
		HeadshotUrl: "",
		CountryCode: "FRA",
	},
	"30": {
		RacingNumber: "30",
		BroadcastName: "L LAWSON",
		FullName: "Liam LAWSON",
		Tla: "LAW",
		Line: 14,
		TeamName: "Racing Bulls",
		TeamColour: "6692ff",
		FirstName: "Liam",
		LastName: "Lawson",
		Reference: "LAWSON",
		HeadshotUrl: "",
		CountryCode: "NZL",
	},
	"22": {
		RacingNumber: "22",
		BroadcastName: "Y TSUNODA",
		FullName: "Yuki TSUNODA",
		Tla: "TSU",
		Line: 15,
		TeamName: "Racing Bulls",
		TeamColour: "6692ff",
		FirstName: "Yuki",
		LastName: "Tsunoda",
		Reference: "TSUNODA",
		HeadshotUrl: "",
		CountryCode: "JPN",
	},
	"87": {
		RacingNumber: "87",
		BroadcastName: "O BEARMAN",
		FullName: "Oliver BEARMAN",
		Tla: "BEA",
		Line: 16,
		TeamName: "Haas F1 Team",
		TeamColour: "b6babd",
		FirstName: "Oliver",
		LastName: "Bearman",
		Reference: "BEARMAN",
		HeadshotUrl: "",
		CountryCode: "GBR",
	},
	"31": {
		RacingNumber: "31",
		BroadcastName: "E OCON",
		FullName: "Esteban OCON",
		Tla: "OCO",
		Line: 17,
		TeamName: "Haas F1 Team",
		TeamColour: "b6babd",
		FirstName: "Esteban",
		LastName: "Ocon",
		Reference: "OCON",
		HeadshotUrl: "",
		CountryCode: "FRA",
	},
	"18": {
		RacingNumber: "18",
		BroadcastName: "L STROLL",
		FullName: "Lance STROLL",
		Tla: "STR",
		Line: 18,
		TeamName: "Aston Martin",
		TeamColour: "229971",
		FirstName: "Lance",
		LastName: "Stroll",
		Reference: "STROLL",
		HeadshotUrl: "",
		CountryCode: "CAN",
	},
	"27": {
		RacingNumber: "27",
		BroadcastName: "N HULKENBERG",
		FullName: "Nico HULKENBERG",
		Tla: "HUL",
		Line: 19,
		TeamName: "Audi",
		TeamColour: "c0c0c0",
		FirstName: "Nico",
		LastName: "Hulkenberg",
		Reference: "HULKENBERG",
		HeadshotUrl: "",
		CountryCode: "GER",
	},
	"5": {
		RacingNumber: "5",
		BroadcastName: "G BORTOLETO",
		FullName: "Gabriel BORTOLETO",
		Tla: "BOR",
		Line: 20,
		TeamName: "Audi",
		TeamColour: "c0c0c0",
		FirstName: "Gabriel",
		LastName: "Bortoleto",
		Reference: "BORTOLETO",
		HeadshotUrl: "",
		CountryCode: "BRA",
	},
	"77": {
		RacingNumber: "77",
		BroadcastName: "V BOTTAS",
		FullName: "Valtteri BOTTAS",
		Tla: "BOT",
		Line: 21,
		TeamName: "Cadillac F1 Team",
		TeamColour: "94a3b8",
		FirstName: "Valtteri",
		LastName: "Bottas",
		Reference: "BOTTAS",
		HeadshotUrl: "",
		CountryCode: "FIN",
	},
	"6": {
		RacingNumber: "6",
		BroadcastName: "I HADJAR",
		FullName: "Isack HADJAR",
		Tla: "HAD",
		Line: 22,
		TeamName: "Red Bull Racing",
		TeamColour: "3671c6",
		FirstName: "Isack",
		LastName: "Hadjar",
		Reference: "HADJAR",
		HeadshotUrl: "",
		CountryCode: "FRA",
	},
};

class SimulatorService {
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private tickCount = 0;
	private lap = 28;
	private totalLaps = 53;
	private isRunning = false;
	private trackStatus = "1"; // "1" = Verde, "2" = Amarilla, "4" = SC, "6" = VSC
	private currentOrder: string[] = [
		"4", "1", "16", "81", "44", "63", "12", "43", "11", "55",
		"14", "23", "10", "30", "22", "87", "31", "18", "27", "5", "77", "6"
	];
	private driverProgress: Record<string, number> = {};
	private driverIntervals: Record<string, number> = {};
	private overtakeCount = 0;

	public start() {
		if (this.isRunning) return;
		this.isRunning = true;

		// 💾 Restaurar estado si ya existía una sesión en progreso (sobrevive recarga/navegación)
		let savedLap: number | null = null;
		let savedTick: number | null = null;
		let savedOrder: string[] | null = null;
		let savedStatus: string | null = null;

		if (typeof window !== "undefined") {
			const strLap = sessionStorage.getItem("f1_sim_lap");
			if (strLap) savedLap = parseInt(strLap, 10);
			const strTick = sessionStorage.getItem("f1_sim_tick");
			if (strTick) savedTick = parseInt(strTick, 10);
			const strStatus = sessionStorage.getItem("f1_sim_status");
			if (strStatus) savedStatus = strStatus;
			const strOrder = sessionStorage.getItem("f1_sim_order");
			if (strOrder) {
				try {
					const parsed = JSON.parse(strOrder);
					if (Array.isArray(parsed) && parsed.length === 22) {
						savedOrder = parsed;
					}
				} catch {}
			}
		}

		this.tickCount = savedTick !== null ? savedTick : 0;
		this.lap = savedLap !== null ? savedLap : 28;
		this.trackStatus = savedStatus !== null ? savedStatus : "1";
		this.overtakeCount = 0;

		this.currentOrder = savedOrder || [
			"4", "1", "16", "81", "44", "63", "12", "43", "11", "55",
			"14", "23", "10", "30", "22", "87", "31", "18", "27", "5", "77", "6"
		];

		// Distribuir a los 22 autos en puntos de la pista del circuito (721 coordenadas)
		const trackLength = circuit65Track.x.length;
		this.currentOrder.forEach((num, index) => {
			// Espaciado dinámico: los primeros van en paquete, luego se distancian
			const offset = (index * 31) % trackLength;
			this.driverProgress[num] = (trackLength - offset) % trackLength;
			this.driverIntervals[num] = index === 0 ? 0 : 0.65 + (index * 0.12);
		});

		// Neumáticos (TimingAppData) para los 22 pilotos
		const timingAppDataLines: Record<string, any> = {};
		this.currentOrder.forEach((num, index) => {
			let compound: "SOFT" | "MEDIUM" | "HARD" = "MEDIUM";
			let laps = 18;
			if (num === "43") { compound = "MEDIUM"; laps = 18; }
			else if (num === "11") { compound = "HARD"; laps = 22; }
			else if (index % 3 === 0) { compound = "HARD"; laps = 24; }
			else if (index % 3 === 1) { compound = "MEDIUM"; laps = 19; }
			else { compound = "SOFT"; laps = 12; }

			timingAppDataLines[num] = {
				RacingNumber: num,
				GridPos: String(index + 1),
				Line: index + 1,
				Stints: [
					{
						Compound: compound,
						TotalLaps: laps,
						New: "FALSE",
					},
				],
			};
		});

		const nowIso = new Date().toISOString();

		const initialState: any = {
			SessionInfo: {
				Meeting: {
					Key: 1240,
					Name: "Gran Premio de la Ciudad de México 2026",
					OfficialName: "FORMULA 1 GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026",
					Location: "Mexico City",
					Country: { Key: 22, Code: "MEX", Name: "Mexico" },
					Circuit: { Key: 65, ShortName: "Mexico City" },
				},
				OfficialName: "FORMULA 1 GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026",
				Location: "Autódromo Hermanos Rodríguez",
				Country: { Key: 22, Code: "MEX", Name: "Mexico" },
				Circuit: { Key: 65, ShortName: "Mexico City" },
				ArchiveStatus: { Status: "Generated" },
				Key: 9999,
				Type: "Race",
				Name: "Race",
				StartDate: nowIso,
				EndDate: new Date(Date.now() + 7200000).toISOString(),
				GmtOffset: "-06:00:00",
				Path: "simulated_session_2026",
			},
			SessionStatus: { Status: "Started" },
			TrackStatus: { Status: "1", Message: "AllClear" },
			LapCount: { CurrentLap: this.lap, TotalLaps: this.totalLaps },
			DriverList: DRIVERS_2026,
			TimingData: { Lines: this.buildLines(), Withheld: false },
			TimingAppData: { Lines: timingAppDataLines },
			WeatherData: {
				AirTemp: "23.8",
				Humidity: "46",
				Pressure: "1014.2",
				Rainfall: "0",
				TrackTemp: "38.5",
				WindDirection: "190",
				WindSpeed: "3.4",
			},
			RaceControlMessages: {
				Messages: [
					{
						Utc: nowIso,
						Lap: 26,
						Message: "TRACK CLEAR - GREEN FLAG IN ALL SECTORS",
						Category: "Flag",
						Flag: "GREEN",
						Scope: "Track",
					},
					{
						Utc: nowIso,
						Lap: 27,
						Message: "FIA REGLAMENTO 2026: BOOST (SOBREPASO ELÉCTRICO) Y AERO ACTIVA HABILITADOS",
						Category: "Other",
						Status: "ENABLED",
					},
					{
						Utc: nowIso,
						Lap: 28,
						Message: "AUTO 43 (COL) EN ZONA DE DRS/BOOST: 0.740s CON AUTO 11 (PER)",
						Category: "Other",
						Scope: "Track",
					},
				],
			},
			TeamRadio: {
				Captures: [
					{
						Utc: nowIso,
						RacingNumber: "43",
						Path: "simulated_colapinto_radio.mp3",
					},
				],
			},
			Heartbeat: {
				Utc: nowIso,
			},
		};

		// 1. Inyectar estado inicial en el store
		useDataStore.getState().setState(initialState);

		// 2. Inyectar posiciones GPS en el trazado
		this.updateGpsPositions();

		// 3. Inyectar telemetría dinámica de autos (RPM, velocidad, marcha, acelerador, MOM)
		useDataStore.getState().setCarsData(this.generateAllCarsData());

		// 4. Iniciar loop vivo cada 1000ms
		this.intervalId = setInterval(() => {
			this.tick();
		}, 1000);
	}

	private updateGpsPositions() {
		const trackX = circuit65Track.x;
		const trackY = circuit65Track.y;
		const trackLength = trackX.length;

		const positions: Positions = {};
		this.currentOrder.forEach((num) => {
			const prog = this.driverProgress[num] || 0;
			const idx = Math.floor(prog) % trackLength;
			positions[num] = {
				X: trackX[idx],
				Y: trackY[idx],
				Z: 0,
				Status: "OnTrack",
			};
		});

		useDataStore.getState().setPositions(positions);
	}

	private buildLine(
		num: string,
		pos: string,
		gap: string,
		int: string,
		lastLap: string,
		bestLap: string,
		s1: string,
		s2: string,
		s3: string,
		speed: string,
		isFastest = false,
		isPersonalFastest = false
	) {
		return {
			RacingNumber: num,
			Position: pos,
			ShowPosition: true,
			Retired: false,
			InPit: false,
			PitOut: false,
			Stopped: false,
			Status: 0,
			GapToLeader: gap,
			IntervalToPositionAhead: { Value: int, Catching: int.startsWith("-") || isPersonalFastest },
			BestLapTime: { Value: bestLap, Position: parseInt(pos, 10) },
			LastLapTime: { Value: lastLap, Status: 2049, OverallFastest: isFastest, PersonalFastest: isPersonalFastest },
			NumberOfLaps: this.lap,
			Sectors: [
				{
					Stopped: false,
					Value: s1,
					Status: isFastest ? 2051 : isPersonalFastest ? 2049 : 2048,
					OverallFastest: isFastest,
					PersonalFastest: isPersonalFastest,
					Segments: [
						{ Status: isFastest ? 2051 : isPersonalFastest ? 2049 : 2048 },
						{ Status: isFastest ? 2051 : 2049 },
						{ Status: 2048 },
					],
				},
				{
					Stopped: false,
					Value: s2,
					Status: isPersonalFastest ? 2049 : 2048,
					OverallFastest: false,
					PersonalFastest: isPersonalFastest,
					Segments: [
						{ Status: 2049 },
						{ Status: 2048 },
						{ Status: isPersonalFastest ? 2049 : 2048 },
					],
				},
				{
					Stopped: false,
					Value: s3,
					Status: 2048,
					OverallFastest: false,
					PersonalFastest: false,
					Segments: [
						{ Status: 2048 },
						{ Status: 2048 },
						{ Status: 2049 },
					],
				},
			],
			Speeds: {
				St: { Value: speed, Status: 2049, OverallFastest: isFastest, PersonalFastest: isPersonalFastest },
			},
		};
	}

	private buildLines(): Record<string, any> {
		const newLines: Record<string, any> = {};
		let cumulativeGap = 0;
		const isNeutralized = this.trackStatus === "4" || this.trackStatus === "6";

		this.currentOrder.forEach((num, index) => {
			const pos = String(index + 1);
			const interval = index === 0 ? 0 : this.driverIntervals[num] || (0.7 + (index * 0.15));
			if (index > 0) cumulativeGap += interval;

			const gapStr = index === 0 ? "LÍDER" : `+${cumulativeGap.toFixed(3)}`;
			const intStr = index === 0 ? "" : `+${interval.toFixed(3)}`;

			// 🧮 En VSC / SC ritmo ralentizado a ~2:00.000 (~40s por sector), en verde ritmo 1:18.000
			const s1Num = isNeutralized
				? 40.2 + (index * 0.04)
				: 26.3 + (index * 0.04) + Math.sin(this.tickCount * 0.1 + index) * 0.06;
			const s2Num = isNeutralized
				? 41.5 + (index * 0.04)
				: 26.8 + (index * 0.04) + Math.cos(this.tickCount * 0.1 + index) * 0.06;
			const s3Num = isNeutralized
				? 38.3 + (index * 0.04)
				: 24.9 + (index * 0.04) + Math.sin(this.tickCount * 0.12 + index) * 0.06;

			const s1 = s1Num.toFixed(3);
			const s2 = s2Num.toFixed(3);
			const s3 = s3Num.toFixed(3);

			// 🧮 CÁLCULO MATEMÁTICAMENTE EXACTO: Última vuelta = S1 + S2 + S3 sin discrepancias
			const totalSec = s1Num + s2Num + s3Num;
			const m = Math.floor(totalSec / 60);
			const s = (totalSec % 60).toFixed(3).padStart(6, "0");
			const lastLapStr = `${m}:${s}`;
			const bestLapStr = index === 0 ? "1:18.230" : num === "43" ? "1:19.420" : `1:${(18.230 + index * 0.16).toFixed(3)}`;

			const speed = isNeutralized
				? String(Math.floor(165 + (index % 3) * 2))
				: String(Math.floor(338 + (index % 4) * 2 + Math.random() * 4));

			const isLeader = index === 0;
			const isColapinto = num === "43";
			const isFastest = !isNeutralized && isLeader && this.tickCount % 5 === 0;
			const isPersonalFastest = !isNeutralized && (isColapinto || index < 6) && this.tickCount % 3 === 0;

			newLines[num] = this.buildLine(
				num,
				pos,
				gapStr,
				intStr,
				lastLapStr,
				bestLapStr,
				s1,
				s2,
				s3,
				speed,
				isFastest,
				isPersonalFastest
			);
		});

		return newLines;
	}

	private generateAllCarsData(): CarsData {
		const isNeutralized = this.trackStatus === "4" || this.trackStatus === "6";
		const mock: CarsData = {};

		this.currentOrder.forEach((num, idx) => {
			const isMom = !isNeutralized && (num === "43" || num === "11" || num === "1" || num === "4" || (idx % 2 === 0));
			const baseSpeed = isNeutralized
				? 165
				: num === "43" ? 343 : num === "11" ? 341 : num === "4" ? 345 : 332;

			mock[num] = {
				Channels: {
					0: isNeutralized
						? Math.floor(7400 + Math.random() * 400)
						: Math.floor(10800 + Math.random() * 1400), // RPM
					2: isNeutralized
						? Math.floor(baseSpeed - 2 + Math.random() * 4)
						: Math.floor(baseSpeed - 3 + Math.random() * 6), // Velocidad km/h
					3: isNeutralized ? 5 : 8, // Marcha
					4: isNeutralized ? 45 : Math.floor(88 + Math.random() * 12), // Acelerador %
					5: 0, // Freno
					45: isMom ? 10 : 8, // MOM
				},
			};
		});

		return mock;
	}

	private tick() {
		this.tickCount++;
		const trackLength = circuit65Track.x.length;
		const isNeutralized = this.trackStatus === "4" || this.trackStatus === "6";

		// 1. Avanzar monoplazas a lo largo del circuito
		const baseStep = isNeutralized ? 4.0 : 8.8; // ~9 puntos/segundo a 340 km/h
		this.currentOrder.forEach((num, idx) => {
			// Variaciones de ritmo para que los autos se acerquen y alejen naturalmente
			const driverDelta = isNeutralized ? 0 : Math.sin(this.tickCount * 0.1 + idx) * 0.4;
			const speed = baseStep + driverDelta;
			this.driverProgress[num] = (this.driverProgress[num] + speed) % trackLength;

			// Pequeña oscilación de intervalos (TOTALMENTE CONGELADA BAJO VSC O SAFETY CAR)
			if (idx > 0 && !isNeutralized) {
				const currentInt = this.driverIntervals[num] || 0.8;
				const jitter = (Math.random() - 0.5) * 0.02;
				this.driverIntervals[num] = Math.max(0.25, Math.min(4.5, currentInt + jitter));
			}
		});

		// 2. Actualizar posiciones GPS para el mapa
		this.updateGpsPositions();

		// 3. Actualizar telemetría de motor
		useDataStore.getState().setCarsData(this.generateAllCarsData());

		// 4. Actualizar tabla de tiempos y sectores oscilantes
		const updatedLines = this.buildLines();

		// 5. Clima fluctuante
		const weatherUpdate = {
			AirTemp: (23.8 + Math.sin(this.tickCount * 0.08) * 0.4).toFixed(1),
			Humidity: String(Math.round(46 + Math.cos(this.tickCount * 0.06) * 3)),
			Pressure: "1014.2",
			Rainfall: "0",
			TrackTemp: (38.5 + Math.sin(this.tickCount * 0.07) * 0.9).toFixed(1),
			WindDirection: String(Math.round(190 + Math.sin(this.tickCount * 0.05) * 8)),
			WindSpeed: (3.4 + Math.sin(this.tickCount * 0.1) * 0.5).toFixed(1),
		};

		// 6. Incrementar vueltas periódicamente (cada ~35 segundos)
		if (this.tickCount % 35 === 0 && this.lap < this.totalLaps) {
			this.lap++;
			this.saveSimState();
		}

		// 7. Ciclo de eventos automáticos si no se forzó nada manualmente
		this.handleScheduledEvents();

		// 8. Commit al store global
		useDataStore.getState().setState({
			LapCount: { CurrentLap: this.lap, TotalLaps: this.totalLaps },
			TimingData: { Lines: updatedLines, Withheld: false },
			WeatherData: weatherUpdate,
			TrackStatus: {
				Status: this.trackStatus,
				Message:
					this.trackStatus === "1"
						? "AllClear"
						: this.trackStatus === "2"
						? "Yellow"
						: this.trackStatus === "4"
						? "SafetyCar"
						: "VSC",
			},
			Heartbeat: { Utc: new Date().toISOString() },
		});

		// 💾 Guardar progreso para persistencia entre páginas
		this.saveSimState();
	}

	private handleScheduledEvents() {
		// Evento informativo a los 25s sin forzar sobrepasos automáticos que pisen el botón del usuario
		if (this.tickCount === 25) {
			this.addRaceControlMessage(
				"FIA RACE CONTROL: DRS / BOOST SYSTEM (MANUAL OVERRIDE) AVAILABLE",
				"Other",
				"Track"
			);
		}
	}

	public executeOvertake(carA: string, carB: string) {
		const posA = this.currentOrder.indexOf(carA);
		const posB = this.currentOrder.indexOf(carB);

		if (posA === -1 || posB === -1 || posA === posB) return;

		// El que tiene índice mayor está más atrás en la pista y es quien adelanta
		const [aheadIdx, behindIdx] = posA < posB ? [posA, posB] : [posB, posA];
		const overtakerNum = this.currentOrder[behindIdx];
		const defenderNum = this.currentOrder[aheadIdx];

		// Intercambiar posiciones en la lista para que el que venía atrás quede adelante
		this.currentOrder[aheadIdx] = overtakerNum;
		this.currentOrder[behindIdx] = defenderNum;

		// Ajustar el progreso en pista para que el auto que adelantó esté físicamente por delante
		const defenderProg = this.driverProgress[defenderNum] || 0;
		this.driverProgress[overtakerNum] = (defenderProg + 12) % circuit65Track.x.length;

		// Intercambiar intervalos
		this.driverIntervals[overtakerNum] = 0.45;
		this.driverIntervals[defenderNum] = 0.62;

		const overtaker = DRIVERS_2026[overtakerNum];
		const defender = DRIVERS_2026[defenderNum];
		const newPos = aheadIdx + 1;

		this.addRaceControlMessage(
			`OVERTAKE · AUTO ${overtakerNum} (${overtaker?.Tla || overtakerNum}) ADELANTÓ A AUTO ${defenderNum} (${defender?.Tla || defenderNum}) POR P${newPos}`,
			"Overtake",
			"Track"
		);

		this.overtakeCount++;
		this.saveSimState();
	}

	public triggerOvertake() {
		// Encuentra una pareja reñida para adelantar
		if (this.overtakeCount % 3 === 0) {
			this.executeOvertake("43", "11"); // Colapinto vs Perez
		} else if (this.overtakeCount % 3 === 1) {
			this.executeOvertake("1", "4"); // Verstappen vs Norris
		} else {
			this.executeOvertake("44", "81"); // Hamilton vs Piastri
		}
	}

	public setTrackStatus(status: string, reasonMessage?: string) {
		this.trackStatus = status;

		if (reasonMessage) {
			const flagType:
				| "GREEN"
				| "YELLOW"
				| "BLACK AND WHITE"
				| "BLUE"
				| "CLEAR"
				| "DOUBLE YELLOW"
				| "RED"
				| "CHEQUERED"
				| undefined =
				status === "1" ? "GREEN" : status === "2" ? "YELLOW" : undefined;
			this.addRaceControlMessage(reasonMessage, "Flag", "Track", flagType);
		}

		useDataStore.getState().setState({
			TrackStatus: {
				Status: status,
				Message:
					status === "1"
						? "AllClear"
						: status === "2"
						? "Yellow"
						: status === "4"
						? "SafetyCar"
						: "VSC",
			},
		});

		this.saveSimState();
	}

	public triggerFlag(status: "1" | "2" | "4" | "6") {
		const messages: Record<string, string> = {
			"1": "TRACK CLEAR - GREEN FLAG IN ALL SECTORS",
			"2": "YELLOW FLAG IN SECTOR 2 - HAZARD REPORTED AT TURN 4",
			"4": "SAFETY CAR (SC) DEPLOYED - REDUCE SPEED IMMEDIATELY",
			"6": "VIRTUAL SAFETY CAR (VSC) DEPLOYED - MAINTAIN POSITIVE DELTA",
		};
		this.setTrackStatus(status, messages[status]);
	}

	public triggerRadio(driverNum: string = "43") {
		const nowIso = new Date().toISOString();
		const driver = DRIVERS_2026[driverNum];
		const currentRadio = useDataStore.getState().state?.TeamRadio?.Captures || [];

		useDataStore.getState().setState({
			TeamRadio: {
				Captures: [
					{
						Utc: nowIso,
						RacingNumber: driverNum,
						Path: `simulated_${driver?.Tla?.toLowerCase() || "driver"}_radio.mp3`,
					},
					...currentRadio.slice(0, 5),
				],
			},
		});
	}

	public triggerLapIncrement() {
		if (this.lap < this.totalLaps) {
			this.lap++;
			useDataStore.getState().setState({
				LapCount: { CurrentLap: this.lap, TotalLaps: this.totalLaps },
			});
			this.saveSimState();
		}
	}

	private addRaceControlMessage(
		message: string,
		category: string = "Other",
		scope: "Track" | "Sector" | "Driver" = "Track",
		flag?: "GREEN" | "YELLOW" | "BLACK AND WHITE" | "BLUE" | "CLEAR" | "DOUBLE YELLOW" | "RED" | "CHEQUERED"
	) {
		const nowIso = new Date().toISOString();
		const existing = useDataStore.getState().state?.RaceControlMessages?.Messages || [];

		useDataStore.getState().setState({
			RaceControlMessages: {
				Messages: [
					{
						Utc: nowIso,
						Lap: this.lap,
						Message: message,
						Category: category,
						Scope: scope,
						Flag: flag,
					},
					...existing.slice(0, 15),
				],
			},
		});
	}

	public stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
		if (typeof window !== "undefined") {
			sessionStorage.removeItem("f1_pitwall_sim");
			sessionStorage.removeItem("f1_sim_lap");
			sessionStorage.removeItem("f1_sim_tick");
			sessionStorage.removeItem("f1_sim_order");
			sessionStorage.removeItem("f1_sim_status");
		}
	}

	private saveSimState() {
		if (typeof window === "undefined") return;
		try {
			sessionStorage.setItem("f1_sim_lap", String(this.lap));
			sessionStorage.setItem("f1_sim_tick", String(this.tickCount));
			sessionStorage.setItem("f1_sim_status", this.trackStatus);
			sessionStorage.setItem("f1_sim_order", JSON.stringify(this.currentOrder));
		} catch {}
	}

	public getActive(): boolean {
		return this.isRunning;
	}

	public getCurrentLap(): number {
		return this.lap;
	}

	public getTrackStatus(): string {
		return this.trackStatus;
	}
}

export const simulator = new SimulatorService();
