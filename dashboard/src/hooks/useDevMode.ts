import { useEffect, useState } from "react";

export const useDevMode = () => {
	const [active, setActive] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setActive(!!localStorage.getItem("dev"));
		}
	}, []);

	return { active };
};