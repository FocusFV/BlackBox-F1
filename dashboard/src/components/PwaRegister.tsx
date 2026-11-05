"use client";

import { useEffect } from "react";

export function PwaRegister() {
	useEffect(() => {
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((reg) => {
					// Actualización silenciosa si hay un nuevo SW
					reg.onupdatefound = () => {
						const installing = reg.installing;
						if (installing) {
							installing.onstatechange = () => {
								if (installing.state === "installed" && navigator.serviceWorker.controller) {
									console.log("Nueva versión de Blackbox F1 PWA disponible.");
								}
							};
						}
					};
				})
				.catch((err) => {
					console.error("Error registrando Service Worker PWA:", err);
				});
		}
	}, []);

	return null;
}
