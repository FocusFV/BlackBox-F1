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
		root.classList.toggle("bg-zinc-950", !oledMode);
		root.classList.toggle("bg-black", oledMode);

		root.classList.remove("theme-classic", "theme-neon", "theme-rose", "theme-oled");
		root.classList.add(`theme-${goldTheme}`);
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
