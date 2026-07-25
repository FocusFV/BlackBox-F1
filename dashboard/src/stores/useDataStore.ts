import { create } from "zustand";
import type { CarsData, Positions, State } from "@/types/state.type";

type DataStore = {
	state: State | null;
	carsData: CarsData | null;
	positions: Positions | null;

	setState: (state: Partial<State> | null) => void;
	setCarsData: (carsData: CarsData | null) => void;
	setPositions: (positions: Positions | null) => void;
};

export const useDataStore = create<DataStore>((set) => ({
	state: null,
	carsData: null,
	positions: null,

	setState: (partialState) =>
		set((prev) => {
			if (partialState === null) return { state: null };

			// Limpiamos los campos undefined antes del merge
			const cleanPartial = Object.fromEntries(
				Object.entries(partialState).filter(([_, v]) => v !== undefined)
			);

			return {
				state: {
					...(prev.state || {}),
					...cleanPartial,
				} as State,
			};
		}),

	setCarsData: (carsData) => set({ carsData }),
	setPositions: (positions) => set({ positions }),
}));