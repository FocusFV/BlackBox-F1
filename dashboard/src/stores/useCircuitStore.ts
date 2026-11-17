import { create } from "zustand";

interface CircuitStore {
	isOpen: boolean;
	gpName: string;
	countryCode?: string;
	openCircuit: (gpName: string, countryCode?: string) => void;
	closeCircuit: () => void;
	toggleCircuit: () => void;
}

export const useCircuitStore = create<CircuitStore>((set) => ({
	isOpen: false,
	gpName: "Gran Premio de Las Vegas",
	countryCode: "usa",
	openCircuit: (gpName, countryCode) => set({ isOpen: true, gpName, countryCode }),
	closeCircuit: () => set({ isOpen: false }),
	toggleCircuit: () => set((state) => ({ isOpen: !state.isOpen })),
}));
