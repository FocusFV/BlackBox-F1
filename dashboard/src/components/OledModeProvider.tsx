"use client";

import { useEffect, type ReactNode } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	children: ReactNode;
};

export default function OledModeProvider({ children }: Props) {
	const oledMode = useSettingsStore((state) => state.oledMode);
	const goldTheme = useSettingsStore((state) => state.goldTheme) || "classic";

	// 🎨 Aplicar clases globales de tema y fondo OLED
	useEffect(() => {
		const root = document.documentElement;
		const body = document.body;
		const effectiveTheme = oledMode ? "oled" : goldTheme;

		const themeClasses = ["theme-classic", "theme-neon", "theme-rose", "theme-oled"];
		root.classList.remove(...themeClasses);
		if (body) body.classList.remove(...themeClasses);

		root.classList.add(`theme-${effectiveTheme}`);
		if (body) body.classList.add(`theme-${effectiveTheme}`);

		root.setAttribute("data-theme", effectiveTheme);
		if (body) body.setAttribute("data-theme", effectiveTheme);

		const isOled = effectiveTheme === "oled";
		root.classList.toggle("bg-black", isOled);
		root.classList.toggle("bg-zinc-950", !isOled);
		if (body) {
			body.classList.toggle("bg-black", isOled);
			body.classList.toggle("bg-zinc-950", !isOled);
		}
	}, [oledMode, goldTheme]);

	// 📱 WAKE LOCK GLOBAL (Pantalla siempre activa en segundo plano, sin apagar pantalla)
	useEffect(() => {
		let wakeLock: any = null;

		async function requestWakeLock() {
			try {
				if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
					wakeLock = await (navigator as any).wakeLock.request("screen");
				}
			} catch {
				// El navegador puede rechazar si el tab está inactivo o en modo ahorro extremo
			}
		}

		requestWakeLock();

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				requestWakeLock();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			if (wakeLock) {
				try {
					wakeLock.release();
				} catch {
					// Ignorar
				}
			}
		};
	}, []);

	return children;
}
