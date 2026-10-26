import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import { create } from "zustand";

type SpeedUnit = "metric" | "imperial";
export type GoldTheme = "classic" | "neon" | "rose" | "oled";

type SettingsStore = {
	delay: number;
	setDelay: (delay: number) => void;

	goldTheme: GoldTheme;
	setGoldTheme: (goldTheme: GoldTheme) => void;

	hapticFeedback: boolean;
	setHapticFeedback: (hapticFeedback: boolean) => void;

	gridDensity: "compact" | "comfort";
	setGridDensity: (gridDensity: "compact" | "comfort") => void;

	timeFormat: "interval" | "leader";
	setTimeFormat: (timeFormat: "interval" | "leader") => void;

	speedUnit: SpeedUnit;
	setSpeedUnit: (speedUnit: SpeedUnit) => void;

	showCornerNumbers: boolean;
	setShowCornerNumbers: (showCornerNumbers: boolean) => void;

	carMetrics: boolean;
	setCarMetrics: (carMetrics: boolean) => void;

	tableHeaders: boolean;
	setTableHeaders: (tableHeaders: boolean) => void;

	showBestSectors: boolean;
	setShowBestSectors: (showBestSectors: boolean) => void;

	showMiniSectors: boolean;
	setShowMiniSectors: (showMiniSectors: boolean) => void;

	oledMode: boolean;
	setOledMode: (oledMode: boolean) => void;

	useSafetyCarColors: boolean;
	setUseSafetyCarColors: (useSafetyCarColors: boolean) => void;

	favoriteDrivers: string[];
	setFavoriteDrivers: (favoriteDrivers: string[]) => void;
	removeFavoriteDriver: (driver: string) => void;

	raceControlChime: boolean;
	setRaceControlChime: (raceControlChime: boolean) => void;

	raceControlChimeVolume: number;
	setRaceControlChimeVolume: (raceControlChimeVolume: number) => void;

	autoPlayFavoriteRadios: boolean;
	setAutoPlayFavoriteRadios: (autoPlayFavoriteRadios: boolean) => void;

	delayIsPaused: boolean;
	setDelayIsPaused: (delayIsPaused: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
	subscribeWithSelector(
		persist(
			(set) => ({
				delay: 0,
				setDelay: (delay: number) => set({ delay }),

				goldTheme: "classic",
				setGoldTheme: (goldTheme: GoldTheme) =>
					set({
						goldTheme,
						oledMode: goldTheme === "oled",
					}),

				hapticFeedback: true,
				setHapticFeedback: (hapticFeedback: boolean) => set({ hapticFeedback }),

				gridDensity: "comfort",
				setGridDensity: (gridDensity: "compact" | "comfort") => set({ gridDensity }),

				timeFormat: "interval",
				setTimeFormat: (timeFormat: "interval" | "leader") => set({ timeFormat }),

				speedUnit: "metric",
				setSpeedUnit: (speedUnit: SpeedUnit) => set({ speedUnit }),

				showCornerNumbers: false,
				setShowCornerNumbers: (showCornerNumbers: boolean) => set({ showCornerNumbers }),

				carMetrics: false,
				setCarMetrics: (carMetrics: boolean) => set({ carMetrics }),

				tableHeaders: false,
				setTableHeaders: (tableHeaders: boolean) => set({ tableHeaders }),

				showBestSectors: true,
				setShowBestSectors: (showBestSectors: boolean) => set({ showBestSectors }),

				showMiniSectors: true,
				setShowMiniSectors: (showMiniSectors: boolean) => set({ showMiniSectors }),

				oledMode: false,
				setOledMode: (oledMode: boolean) => set({ oledMode }),

				useSafetyCarColors: true,
				setUseSafetyCarColors: (useSafetyCarColors: boolean) => set({ useSafetyCarColors }),

				favoriteDrivers: [],
				setFavoriteDrivers: (favoriteDrivers: string[]) => set({ favoriteDrivers }),
				removeFavoriteDriver: (driver: string) =>
					set((state) => ({ favoriteDrivers: state.favoriteDrivers.filter((d) => d !== driver) })),

				raceControlChime: false,
				setRaceControlChime: (raceControlChime: boolean) => set({ raceControlChime }),

				raceControlChimeVolume: 50,
				setRaceControlChimeVolume: (raceControlChimeVolume: number) => set({ raceControlChimeVolume }),

				autoPlayFavoriteRadios: true,
				setAutoPlayFavoriteRadios: (autoPlayFavoriteRadios: boolean) => set({ autoPlayFavoriteRadios }),

				delayIsPaused: true,
				setDelayIsPaused: (delayIsPaused: boolean) => set({ delayIsPaused }),
			}),
			{
				name: "settings-storage",
				storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : ({} as Storage))),
				onRehydrateStorage: () => {
					return (state) => {
						if (state) {
							state.setDelayIsPaused(false);
						}
					};
				},
			},
		),
	),
);
