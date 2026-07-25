import { useEffect, useRef, useState } from "react";
import type { MessageInitial, MessageUpdate } from "@/types/message.type";
import { env } from "@/env";

type Props = {
	handleInitial: (data: MessageInitial) => void;
	handleUpdate: (data: MessageUpdate) => void;
};

export const useSocket = ({ handleInitial, handleUpdate }: Props) => {
	const [connected, setConnected] = useState<boolean>(false);

	// Guardamos las referencias actualizadas de las funciones
	const savedHandleInitial = useRef(handleInitial);
	const savedHandleUpdate = useRef(handleUpdate);

	// Mantenemos la referencia al día en cada render sin re-conectar SSE
	useEffect(() => {
		savedHandleInitial.current = handleInitial;
		savedHandleUpdate.current = handleUpdate;
	}, [handleInitial, handleUpdate]);

	useEffect(() => {
		const sse = new EventSource(`${env.NEXT_PUBLIC_LIVE_URL}/api/realtime`);

		sse.onopen = () => setConnected(true);
		
		sse.onerror = (err) => {
			console.error("Error en SSE:", err);
			setConnected(false);
		};

		sse.addEventListener("initial", (message) => {
			if (savedHandleInitial.current) {
				savedHandleInitial.current(JSON.parse(message.data));
			}
		});

		sse.addEventListener("update", (message) => {
			if (savedHandleUpdate.current) {
				savedHandleUpdate.current(JSON.parse(message.data));
			}
		});

		return () => {
			sse.close();
			setConnected(false);
		};
	}, []); // Se conecta una sola vez al montar

	return { connected };
};