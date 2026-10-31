import { create } from "zustand";

type SupportModalStore = {
	isOpen: boolean;
	open: () => void;
	close: () => void;
};

export const useSupportModalStore = create<SupportModalStore>((set) => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
}));
