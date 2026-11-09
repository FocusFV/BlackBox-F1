import { create } from "zustand";
import { persist } from "zustand/middleware";

type HeadToHeadStore = {
	isOpen: boolean;
	first: string | null;
	second: string | null;

	setFirst: (first: string | null) => void;
	setSecond: (second: string | null) => void;
	open: (driver1?: string | null, driver2?: string | null) => void;
	close: () => void;
};

export const useHeadToHeadStore = create<HeadToHeadStore>()(
	persist(
		(set) => ({
			isOpen: false,
			first: null,
			second: null,

			setFirst: (first: string | null) => set({ first }),
			setSecond: (second: string | null) => set({ second }),
			open: (driver1?: string | null, driver2?: string | null) =>
				set((state) => ({
					isOpen: true,
					first: driver1 !== undefined && driver1 !== null ? String(driver1) : state.first,
					second: driver2 !== undefined && driver2 !== null ? String(driver2) : state.second,
				})),
			close: () => set({ isOpen: false }),
		}),
		{
			name: "head-to-head",
		},
	),
);
