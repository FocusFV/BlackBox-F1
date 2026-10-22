import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export const useDevMode = () => {
	const active = useSyncExternalStore(
		emptySubscribe,
		() => (typeof window !== "undefined" ? !!localStorage.getItem("dev") : false),
		() => false,
	);

	return { active };
};