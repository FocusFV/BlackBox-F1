import { useEffect, useState } from "react";

import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { env } from "@/env";

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props) => {
	const [connected, setConnected] = useState<boolean>(false);

	useEffect(() => {
		const baseUrl = env.NEXT_PUBLIC_LIVE_URL.replace(/^http/, "ws");
		const prodUrl = `${baseUrl}/ws`;
		const simUrl = "ws://127.0.0.1:8080/ws";

		let ws: WebSocket | null = null;
		let triedProd = false;

		const connect = (url: string) => {
			ws = new WebSocket(url);

			ws.onopen = () => {
				setConnected(true);
				console.log(`🟢 Conectado con éxito a: ${url}`);
			};

			ws.onerror = () => {
				setConnected(false);
				// 🚀 Si el simulador de Cargo está apagado, saltamos automáticamente al servidor Real/Prod
				if (!triedProd && url === simUrl) {
					console.warn("⚠️ Simulador local apagado. Conectando automáticamente a la URL real...");
					triedProd = true;
					ws?.close();
					connect(prodUrl);
				} else {
					console.warn(`⚠️ No se pudo conectar al WebSocket (${url})`);
				}
			};

			ws.onclose = () => {
				setConnected(false);
			};

			ws.onmessage = (event) => {
				const raw = event.data?.trim();
				if (!raw) return;

				try {
					const parsed = JSON.parse(raw);

					// Si viene la respuesta inicial de SignalR (Objeto 'R')
					if (parsed.R) {
						console.log("🏎️ Estado inicial recibido:", parsed.R);
						handleInitial(parsed.R);
					} 
					// Si vienen actualizaciones progresivas (Array 'M')
					else if (parsed.M && Array.isArray(parsed.M)) {
						parsed.M.forEach((update: any) => {
							if (update.A) {
								handleUpdate(update.A[1] || update);
							}
						});
					} 
					// Fallback por si la app espera JSONs simples
					else {
						handleUpdate(parsed);
					}
				} catch (error) {
					console.warn("⚠️ Línea no parseable en la telemetría, omitiendo...", error);
				}
			};
		};

		// Arranca intentando conectar al simulador local
		connect(simUrl);

		return () => {
			ws?.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { connected };
};