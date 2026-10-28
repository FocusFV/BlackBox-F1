import { useDataStore } from "@/stores/useDataStore";
import type { DriverList, CarsData } from "@/types/state.type";

class SimulatorService {
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private lap = 28;
	private isRunning = false;

	public start() {
		if (this.isRunning) return;
		this.isRunning = true;

		// 🏎️ PARRILLA 2026 COMPLETA (22 PILOTOS - 11 ESCUDERÍAS)
		const drivers2026: DriverList = {
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

		const buildLine = (
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
			isPersonalFastest = false,
		) => ({
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
			NumberOfLaps: 28,
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
		});

		const lines: Record<string, any> = {
			"4": buildLine("4", "1", "LÍDER", "", "1:18.230", "1:18.230", "26.410", "26.890", "24.930", "345", true, true),
			"1": buildLine("1", "2", "+0.640", "+0.640", "1:18.310", "1:18.290", "26.450", "26.920", "24.940", "344"),
			"16": buildLine("16", "3", "+2.110", "+1.470", "1:18.450", "1:18.380", "26.500", "26.980", "24.970", "346"),
			"81": buildLine("81", "4", "+3.480", "+1.370", "1:18.520", "1:18.460", "26.520", "27.010", "24.990", "343"),
			"44": buildLine("44", "5", "+5.920", "+2.440", "1:18.690", "1:18.610", "26.590", "27.080", "25.020", "345"),
			"63": buildLine("63", "6", "+7.800", "+1.880", "1:18.730", "1:18.700", "26.620", "27.100", "25.010", "342"),
			"12": buildLine("12", "7", "+10.150", "+2.350", "1:19.010", "1:18.980", "26.710", "27.140", "25.160", "340"),
			"43": buildLine("43", "8", "+14.320", "+4.170", "1:19.420", "1:19.420", "26.920", "27.180", "25.320", "343", false, true),
			"11": buildLine("11", "9", "+15.060", "+0.740", "1:19.780", "1:19.710", "27.050", "27.240", "25.490", "341"),
			"55": buildLine("55", "10", "+16.890", "+1.830", "1:19.920", "1:19.850", "27.100", "27.300", "25.520", "339"),
			"14": buildLine("14", "11", "+18.420", "+1.530", "1:20.040", "1:19.980", "27.150", "27.350", "25.540", "338"),
			"23": buildLine("23", "12", "+20.110", "+1.690", "1:20.180", "1:20.100", "27.200", "27.400", "25.580", "340"),
			"10": buildLine("10", "13", "+22.050", "+1.940", "1:20.310", "1:20.250", "27.240", "27.450", "25.620", "339"),
			"30": buildLine("30", "14", "+24.300", "+2.250", "1:20.450", "1:20.390", "27.300", "27.500", "25.650", "337"),
			"22": buildLine("22", "15", "+26.550", "+2.250", "1:20.580", "1:20.500", "27.350", "27.550", "25.680", "336"),
			"87": buildLine("87", "16", "+29.120", "+2.570", "1:20.720", "1:20.650", "27.400", "27.600", "25.720", "335"),
			"31": buildLine("31", "17", "+31.840", "+2.720", "1:20.890", "1:20.800", "27.450", "27.650", "25.790", "335"),
			"18": buildLine("18", "18", "+34.200", "+2.360", "1:21.050", "1:20.950", "27.500", "27.700", "25.850", "334"),
			"27": buildLine("27", "19", "+37.600", "+3.400", "1:21.220", "1:21.100", "27.550", "27.780", "25.890", "333"),
			"5": buildLine("5", "20", "+40.150", "+2.550", "1:21.400", "1:21.320", "27.600", "27.850", "25.950", "332"),
			"77": buildLine("77", "21", "+43.820", "+3.670", "1:21.650", "1:21.500", "27.680", "27.920", "26.050", "334"),
			"6": buildLine("6", "22", "+47.500", "+3.680", "1:21.920", "1:21.800", "27.750", "28.020", "26.150", "331"),
		};

		// Neumáticos (TimingAppData) para los 22 pilotos
		const timingAppDataLines: Record<string, any> = {};
		Object.keys(drivers2026).forEach((num, index) => {
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
			LapCount: { CurrentLap: 28, TotalLaps: 53 },
			DriverList: drivers2026,
			TimingData: { Lines: lines },
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
						Lap: 25,
						Message: "TRACK CLEAR - GREEN FLAG IN ALL SECTORS",
						Category: "Flag",
						Flag: "GREEN",
						Scope: "Track",
					},
					{
						Utc: nowIso,
						Lap: 26,
						Message: "2026 REGS: MANUAL OVERRIDE MODE (MOM) & ACTIVE AERO ENABLED",
						Category: "Other",
						Status: "ENABLED",
					},
					{
						Utc: nowIso,
						Lap: 27,
						Message: "CAR 43 (COL) PERSONAL FASTEST LAP 1:19.420 IN SECTOR 1 & 2",
						Category: "Sector",
						Scope: "Driver",
					},
					{
						Utc: nowIso,
						Lap: 28,
						Message: "CAR 11 (PER) CLOSING GAP: 0.740s TO CAR 43 (COL) - MOM ACTIVE",
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
					{
						Utc: nowIso,
						RacingNumber: "11",
						Path: "simulated_perez_radio.mp3",
					},
				],
			},
			Heartbeat: {
				Utc: nowIso,
			},
		};

		// Inyectar estado inicial en el store
		useDataStore.getState().setState(initialState);

		// Inyectar telemetría en vivo (RPM, velocidad, marcha, acelerador, MOM) para TODOS los 22 autos
		useDataStore.getState().setCarsData(this.generateAllCarsData());

		// Loop de actualización viva
		this.intervalId = setInterval(() => {
			this.tick();
		}, 1500);
	}

	private generateAllCarsData(): CarsData {
		const allNumbers = [
			"4", "1", "16", "81", "44", "63", "12", "43", "11", "55",
			"14", "23", "10", "30", "22", "87", "31", "18", "27", "5", "77", "6"
		];

		const mock: CarsData = {};
		allNumbers.forEach((num, idx) => {
			// Activar MOM en Franco, Checo, Verstappen, Norris y algunos pilotos estratégicos
			const isMom = num === "43" || num === "11" || num === "1" || num === "4" || (idx % 2 === 0);
			const baseSpeed = num === "43" ? 343 : num === "11" ? 341 : num === "4" ? 345 : 332;

			mock[num] = {
				Channels: {
					0: Math.floor(10500 + Math.random() * 1400), // RPM
					2: Math.floor(baseSpeed - 3 + Math.random() * 6), // Velocidad km/h
					3: 8, // Marcha 8
					4: Math.floor(88 + Math.random() * 12), // Acelerador %
					5: 0, // Freno
					45: isMom ? 10 : 8, // 10 = MOM Activo, 8 = MOM Disponible
				},
			};
		});

		return mock;
	}

	private tick() {
		const state = useDataStore.getState().state;
		if (!state?.TimingData?.Lines) return;

		// Actualizamos telemetría oscilante de todos los 22 autos
		useDataStore.getState().setCarsData(this.generateAllCarsData());

		// Mantener Heartbeat vivo para que los widgets reconozcan actividad continua
		useDataStore.getState().setState({
			Heartbeat: {
				Utc: new Date().toISOString(),
			},
		});
	}

	public stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
	}

	public getActive(): boolean {
		return this.isRunning;
	}
}

export const simulator = new SimulatorService();
