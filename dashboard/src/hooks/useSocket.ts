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
		// 🛡️ Si estamos en la ruta de demostración (/dashboard/demo), no nos conectamos al servidor
		// remoto para evitar que sesiones viejas o en pausa pisen la simulación activa de 2026.
		if (typeof window !== "undefined" && window.location.pathname.includes("/demo")) {
			return;
		}

		let isMounted = true;

		// 🚀 Carga inicial instantánea vía HTTP GET para hidratar la grilla en milisegundos
		fetch(`${env.NEXT_PUBLIC_LIVE_URL}/api/current`)
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (isMounted && data && Object.keys(data).length > 0) {
					handleInitial(data);
				}
			})
			.catch((e) => console.warn("Error hidratando estado inicial desde /api/current:", e));

		const sse = new EventSource(`${env.NEXT_PUBLIC_LIVE_URL}/api/realtime`);

		sse.onerror = () => setConnected(false);
		sse.onopen = () => setConnected(true);

		sse.addEventListener("initial", (message) => {
			try {
				const parsed = JSON.parse(message.data);
				if (parsed && Object.keys(parsed).length > 0) {
					handleInitial(parsed);
				}
			} catch (e) {
				console.error("Error procesando evento initial SSE:", e);
			}
		});

		sse.addEventListener("update", (message) => {
			try {
				handleUpdate(JSON.parse(message.data));
			} catch (e) {
				console.error("Error procesando update SSE:", e);
			}
		});

		return () => {
			isMounted = false;
			sse.close();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { connected };
};
