import { create } from "zustand";
import { getCalendarGpContextSync } from "@/lib/sessionSchedule";
import { translateGpName } from "@/lib/f1Translations";

interface CircuitStore {
	isOpen: boolean;
	gpName: string;
	countryCode?: string;
	openCircuit: (gpName: string, countryCode?: string) => void;
	closeCircuit: () => void;
	toggleCircuit: () => void;
}

const initialCtx = getCalendarGpContextSync();

export const useCircuitStore = create<CircuitStore>((set) => ({
	isOpen: false,
	gpName: translateGpName(initialCtx.raceName),
	countryCode: initialCtx.countryCode || undefined,
	openCircuit: (gpName, countryCode) => set({ isOpen: true, gpName, countryCode }),
	closeCircuit: () => set({ isOpen: false }),
	toggleCircuit: () => set((state) => ({ isOpen: !state.isOpen })),
}));
