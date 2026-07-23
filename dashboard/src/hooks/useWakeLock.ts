import { useEffect, useRef } from "react";

export const useWakeLock = () => {
	const wakeLock = useRef<null | WakeLockSentinel>(null);

	const requestLock = async () => {
		if (
			typeof window !== "undefined" &&
			window.isSecureContext &&
			"wakeLock" in navigator &&
			window.location.hostname !== "localhost"
		) {
			try {
				wakeLock.current = await navigator.wakeLock.request("screen");
			} catch (err) {
				console.log("WakeLock no disponible o denegado");
			}
		}
	};

	useEffect(() => {
		requestLock();

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				requestLock();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			if (wakeLock.current) {
				wakeLock.current.release();
			}
		};
	}, []);
};