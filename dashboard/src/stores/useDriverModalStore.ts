import { create } from "zustand";

export type DriverModalData = {
	driverId?: string;
	driverCode?: string;
	code?: string;
	givenName?: string;
	familyName?: string;
	name?: string;
	position?: string | number;
	points?: string | number;
	nationality?: string;
	countryCode?: string;
	teamName?: string;
	historicTeamName?: string;
	Constructors?: any[];
	Driver?: any;
};

type DriverModalStore = {
	isOpen: boolean;
	driver: DriverModalData | null;
	open: (driver: DriverModalData) => void;
	close: () => void;
};

export const useDriverModalStore = create<DriverModalStore>((set) => ({
	isOpen: false,
	driver: null,
	open: (driver) => set({ isOpen: true, driver }),
	close: () => set({ isOpen: false, driver: null }),
}));
