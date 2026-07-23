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
		const socketUrl = `${baseUrl}/ws`;

		const ws = new WebSocket(socketUrl);

		ws.onopen = () => {
			setConnected(true);
			console.log("🟢 Conectado al simulador de Rust");
		};

		ws.onerror = (err) => {
			setConnected(false);
			console.error("⚠️ Error de conexión WebSocket:", err);
		};

		ws.onclose = () => {
			setConnected(false);
			console.log("🔴 Conexión cerrada con el simulador");
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
					// update.A[0] es la categoría (ej: "TimingData")
					// update.A[1] son los datos
					handleUpdate(update.A[1] || update);
				}
			});
		} 
		// Fallback por si la app espera JSONs simples
		else {
			handleUpdate(parsed);
		}
	} catch (error) {
		console.warn("⚠️ Línea no parseable en el simulador, omitiendo...", error);
	}
};

		return () => {
			ws.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { connected };
};