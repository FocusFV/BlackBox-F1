import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SidebarStore = {
	pinned: boolean;
	opened: boolean;

	close: () => void;
	open: () => void;
	toggleOpen: () => void;

	pin: () => void;
	unpin: () => void;
	togglePin: () => void;

	toggle: () => void;
};

export const useSidebarStore = create<SidebarStore>()(
	persist(
		(set, get) => ({
			pinned: true,
			opened: false,

			close: () => {
				set({ opened: false });
			},
			open: () => {
				set({ opened: true });
			},
			toggleOpen: () => {
				set((state) => ({ opened: !state.opened }));
			},

			pin: () => {
				set({ pinned: true, opened: false });
			},
			unpin: () => {
				set({ pinned: false, opened: false });
			},
			togglePin: () => {
				set((state) => ({ pinned: !state.pinned, opened: false }));
			},

			toggle: () => {
				if (typeof window !== "undefined" && window.innerWidth < 768) {
					set((state) => ({ opened: !state.opened }));
				} else {
					set((state) => ({ pinned: !state.pinned, opened: false }));
				}
			},
		}),
		{
			name: "sidebar-storage",
			storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : ({} as Storage))),
			partialize: (state) => ({ pinned: state.pinned }),
		}
	)
);
