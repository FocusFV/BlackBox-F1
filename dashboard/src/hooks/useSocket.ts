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
		// 🛡️ Si la simulación FIA está activa o hay token en URL, aislamos completamente la app del backend remoto
		// para evitar que datos remotos o radios pasados (ej: HAM) pisen la simulación en curso.
		const secretToken = process.env.NEXT_PUBLIC_SIMULATION_TOKEN || "sim_sec_e8d2c4b7a1f930_pitwall2026";
		const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
		const hasSimToken = Boolean(
			searchParams && (searchParams.get("test_mode") === secretToken || searchParams.get("token") === secretToken)
		);
		const isSimActive =
			typeof window !== "undefined" &&
			(sessionStorage.getItem("f1_pitwall_sim") === "active" || hasSimToken);

		if (isSimActive) {
			setConnected(true);
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
