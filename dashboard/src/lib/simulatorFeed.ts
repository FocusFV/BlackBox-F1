import { useDataStore } from "@/stores/useDataStore";
import type { DriverList, CarsData } from "@/types/state.type";

class SimulatorService {
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private lap = 1;
	private isRunning = false;

	public start() {
		if (this.isRunning) return;
		this.isRunning = true;

		// 1. Inyectar estado inicial de carrera simulada
		const initialDrivers: DriverList = {
			"43": {
				RacingNumber: "43",
				BroadcastName: "F COLAPINTO",
				FullName: "Franco COLAPINTO",
				Tla: "COL",
				Line: 1,
				TeamName: "Williams",
				TeamColour: "00a0de",
				FirstName: "Franco",
				LastName: "Colapinto",
				Reference: "COLAPINTO",
				HeadshotUrl: "",
				CountryCode: "ARG",
			},
			"1": {
				RacingNumber: "1",
				BroadcastName: "M VERSTAPPEN",
				FullName: "Max VERSTAPPEN",
				Tla: "VER",
				Line: 2,
				TeamName: "Red Bull Racing",
				TeamColour: "001a30",
				FirstName: "Max",
				LastName: "Verstappen",
				Reference: "VERSTAPPEN",
				HeadshotUrl: "",
				CountryCode: "NED",
			},
			"4": {
				RacingNumber: "4",
				BroadcastName: "L NORRIS",
				FullName: "Lando NORRIS",
				Tla: "NOR",
				Line: 3,
				TeamName: "McLaren",
				TeamColour: "ff8000",
				FirstName: "Lando",
				LastName: "Norris",
				Reference: "NORRIS",
				HeadshotUrl: "",
				CountryCode: "GBR",
			},
			"16": {
				RacingNumber: "16",
				BroadcastName: "C LECLERC",
				FullName: "Charles LECLERC",
				Tla: "LEC",
				Line: 4,
				TeamName: "Ferrari",
				TeamColour: "e8002d",
				FirstName: "Charles",
				LastName: "Leclerc",
				Reference: "LECLERC",
				HeadshotUrl: "",
				CountryCode: "MON",
			},
			"23": {
				RacingNumber: "23",
				BroadcastName: "A ALBON",
				FullName: "Alexander ALBON",
				Tla: "ALB",
				Line: 5,
				TeamName: "Williams",
				TeamColour: "00a0de",
				FirstName: "Alexander",
				LastName: "Albon",
				Reference: "ALBON",
				HeadshotUrl: "",
				CountryCode: "THA",
			},
		};

		const initialState: any = {
			SessionInfo: {
				Meeting: {
					Key: 1234,
					Name: "Gran Premio Simulado",
					OfficialName: "Gran Premio Simulado",
					Location: "Monza",
					Country: { Key: 1, Code: "ITA", Name: "Italy" },
					Circuit: { Key: 2, ShortName: "Monza" },
				},
				OfficialName: "SIMULADOR EN VIVO FOCUSFV 2026",
				Location: "Autodromo Nazionale Monza",
				Country: { Key: 1, Code: "ITA", Name: "Italy" },
				Circuit: { Key: 2, ShortName: "Monza" },
				ArchiveStatus: { Status: "Generated" },
				Key: 9999,
				Type: "Race",
				Name: "Carrera Simulada",
				StartDate: new Date().toISOString(),
				EndDate: new Date(Date.now() + 7200000).toISOString(),
				GmtOffset: "02:00:00",
				Path: "simulated_session",
			},
			SessionStatus: { Status: "Started" },
			TrackStatus: { Status: "1", Message: "AllClear" },
			LapCount: { CurrentLap: 1, TotalLaps: 53 },
			DriverList: initialDrivers,
			TimingData: {
				Lines: {
					"43": {
						RacingNumber: "43",
						Position: "1",
						ShowPosition: true,
						Retired: false,
						InPit: false,
						PitOut: false,
						Stopped: false,
						Status: 0,
						GapToLeader: "",
						IntervalToPositionAhead: { Value: "", Catching: false },
						BestLapTime: { Value: "1:21.042", Position: 1 },
						LastLapTime: { Value: "1:21.430", Status: 2049, OverallFastest: true, PersonalFastest: true },
						NumberOfLaps: 1,
						Sectors: [
							{ Stopped: false, Value: "27.120", Status: 2049, OverallFastest: true, PersonalFastest: true, Segments: [] },
							{ Stopped: false, Value: "27.410", Status: 2049, OverallFastest: true, PersonalFastest: true, Segments: [] },
							{ Stopped: false, Value: "26.512", Status: 2049, OverallFastest: true, PersonalFastest: true, Segments: [] },
						],
						Speeds: {
							St: { Value: "348", Status: 2049, OverallFastest: true, PersonalFastest: true },
						},
					},
					"1": {
						RacingNumber: "1",
						Position: "2",
						ShowPosition: true,
						Retired: false,
						InPit: false,
						PitOut: false,
						Stopped: false,
						Status: 0,
						GapToLeader: "+0.450",
						IntervalToPositionAhead: { Value: "+0.450", Catching: true },
						BestLapTime: { Value: "1:21.190", Position: 2 },
						LastLapTime: { Value: "1:21.490", Status: 2049, OverallFastest: false, PersonalFastest: true },
						NumberOfLaps: 1,
						Sectors: [
							{ Stopped: false, Value: "27.200", Status: 2049, OverallFastest: false, PersonalFastest: true, Segments: [] },
							{ Stopped: false, Value: "27.390", Status: 2049, OverallFastest: false, PersonalFastest: true, Segments: [] },
							{ Stopped: false, Value: "26.600", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
						],
						Speeds: {
							St: { Value: "345", Status: 2049, OverallFastest: false, PersonalFastest: true },
						},
					},
					"4": {
						RacingNumber: "4",
						Position: "3",
						ShowPosition: true,
						Retired: false,
						InPit: false,
						PitOut: false,
						Stopped: false,
						Status: 0,
						GapToLeader: "+1.210",
						IntervalToPositionAhead: { Value: "+0.760", Catching: false },
						BestLapTime: { Value: "1:21.340", Position: 3 },
						LastLapTime: { Value: "1:21.550", Status: 2049, OverallFastest: false, PersonalFastest: false },
						NumberOfLaps: 1,
						Sectors: [
							{ Stopped: false, Value: "27.310", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
							{ Stopped: false, Value: "27.420", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
							{ Stopped: false, Value: "26.620", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
						],
						Speeds: {
							St: { Value: "342", Status: 2049, OverallFastest: false, PersonalFastest: false },
						},
					},
					"16": {
						RacingNumber: "16",
						Position: "4",
						ShowPosition: true,
						Retired: false,
						InPit: false,
						PitOut: false,
						Stopped: false,
						Status: 0,
						GapToLeader: "+2.530",
						IntervalToPositionAhead: { Value: "+1.320", Catching: true },
						BestLapTime: { Value: "1:21.480", Position: 4 },
						LastLapTime: { Value: "1:21.610", Status: 2049, OverallFastest: false, PersonalFastest: false },
						NumberOfLaps: 1,
						Sectors: [
							{ Stopped: false, Value: "27.350", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
							{ Stopped: false, Value: "27.510", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
							{ Stopped: false, Value: "26.750", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
						],
						Speeds: {
							St: { Value: "344", Status: 2049, OverallFastest: false, PersonalFastest: false },
						},
					},
					"23": {
						RacingNumber: "23",
						Position: "5",
						ShowPosition: true,
						Retired: false,
						InPit: false,
						PitOut: false,
						Stopped: false,
						Status: 0,
						GapToLeader: "+4.120",
						IntervalToPositionAhead: { Value: "+1.590", Catching: false },
						BestLapTime: { Value: "1:21.820", Position: 5 },
						LastLapTime: { Value: "1:21.950", Status: 2049, OverallFastest: false, PersonalFastest: false },
						NumberOfLaps: 1,
						Sectors: [
							{ Stopped: false, Value: "27.450", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
							{ Stopped: false, Value: "27.600", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
							{ Stopped: false, Value: "26.900", Status: 2049, OverallFastest: false, PersonalFastest: false, Segments: [] },
						],
						Speeds: {
							St: { Value: "346", Status: 2049, OverallFastest: false, PersonalFastest: false },
						},
					},
				},
			},
		};

		useDataStore.getState().setState(initialState);

		// 2. Loop de actualización en tiempo real cada 1.5 segundos
		this.intervalId = setInterval(() => {
			this.tick();
		}, 1500);
	}

	private tick() {
		const state = useDataStore.getState().state;
		if (!state?.TimingData?.Lines) return;

		this.lap = (this.lap % 53) + 1;

		// Variar velocidades de los autos (RPM, marcha, velocidad)
		const mockCarsData: CarsData = {
			"43": {
				Channels: {
					0: Math.floor(10500 + Math.random() * 2000), // RPM
					2: Math.floor(310 + Math.random() * 38),     // Speed
					3: 8,                                         // Gear
					4: Math.floor(85 + Math.random() * 15),       // Throttle
					5: Math.random() > 0.8 ? 80 : 0,              // Brake
					45: Math.random() > 0.5 ? 10 : 0,             // DRS
				},
			},
			"1": {
				Channels: {
					0: Math.floor(10600 + Math.random() * 1900),
					2: Math.floor(308 + Math.random() * 36),
					3: 8,
					4: Math.floor(88 + Math.random() * 12),
					5: Math.random() > 0.85 ? 75 : 0,
					45: Math.random() > 0.4 ? 10 : 0,
				},
			},
			"4": {
				Channels: {
					0: Math.floor(10400 + Math.random() * 2100),
					2: Math.floor(305 + Math.random() * 37),
					3: 8,
					4: Math.floor(80 + Math.random() * 20),
					5: Math.random() > 0.8 ? 90 : 0,
					45: Math.random() > 0.6 ? 10 : 0,
				},
			},
		};

		useDataStore.getState().setCarsData(mockCarsData);

		// Actualizar vuelta
		useDataStore.getState().setState({
			LapCount: {
				CurrentLap: this.lap,
				TotalLaps: 53,
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
