"use client";

import { useEffect, useState, useRef } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

const CHECK_INTERVAL_MS = 180000; // Consultar cada 3 minutos (ahorro del 85% de requests en Vercel)
const COUNTDOWN_SECONDS = 60; // 60 segundos de pre-aviso

export default function VersionGuard() {
	const initialVersionRef = useRef<string | null>(null);
	const [hasNewVersion, setHasNewVersion] = useState(false);
	const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);
	const [isPostponed, setIsPostponed] = useState(false);
	const postponeUntilRef = useRef<number>(0);

	// Consulta periódica al servidor para detectar nuevos despliegues
	useEffect(() => {
		let isMounted = true;

		const checkVersion = async () => {
			// Si la pestaña está en segundo plano o el celu bloqueado, no gastamos peticiones
			if (typeof document !== "undefined" && document.hidden) return;
			if (isPostponed && Date.now() < postponeUntilRef.current) return;

			try {
				const res = await fetch("/api/version", {
					cache: "no-store",
					headers: { "Cache-Control": "no-cache" },
				});
				if (!res.ok) return;

				const data = await res.json();
				if (!data?.version) return;

				if (!initialVersionRef.current) {
					// Primera vez que se monta en el navegador del usuario
					initialVersionRef.current = data.version;
				} else if (data.version !== initialVersionRef.current) {
					// ¡El servidor tiene una versión nueva desplegada en Vercel!
					if (isMounted && !hasNewVersion) {
						setHasNewVersion(true);
						setIsPostponed(false);
						triggerHaptic("heavy");
					}
				}
			} catch {
				// Silenciar errores de conexión
			}
		};

		// Primera verificación tras 10 segundos
		const initialTimeout = setTimeout(checkVersion, 10000);
		const interval = setInterval(checkVersion, CHECK_INTERVAL_MS);

		return () => {
			isMounted = false;
			clearTimeout(initialTimeout);
			clearInterval(interval);
		};
	}, [hasNewVersion, isPostponed]);

	// Cuenta regresiva de 60 segundos antes de recargar
	useEffect(() => {
		if (!hasNewVersion || isPostponed) return;

		const countdownInterval = setInterval(() => {
			setSecondsRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(countdownInterval);
					// Recarga automática al llegar a 0
					window.location.reload();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(countdownInterval);
	}, [hasNewVersion, isPostponed]);

	const handleReloadNow = () => {
		triggerHaptic("heavy");
		window.location.reload();
	};

	const handlePostpone = () => {
		triggerHaptic("light");
		setIsPostponed(true);
		setHasNewVersion(false);
		setSecondsRemaining(COUNTDOWN_SECONDS);
		postponeUntilRef.current = Date.now() + 5 * 60 * 1000; // Posponer 5 minutos
	};

	if (!hasNewVersion || isPostponed) return null;

	return (
		<div className="fixed bottom-4 right-4 z-[99999] max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-bottom-5 duration-500 font-mono select-none">
			<div className="border border-amber-500/50 bg-[#0c0a05]/95 backdrop-blur-2xl p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-3">
				{/* Cabecera del aviso */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="relative flex h-2.5 w-2.5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
							<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
						</span>
						<span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
							<Sparkles className="w-3 h-3 text-amber-400" />
							MEJORA EN VIVO DISPONIBLE
						</span>
					</div>

					<button
						onClick={handlePostpone}
						className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
						title="Posponer aviso"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Título y Mensaje amigable */}
				<div>
					<h4 className="text-sm font-black uppercase tracking-wide text-white">
						Actualización del Pit-Wall
					</h4>
					<p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
						Aplicamos mejoras en vivo en la telemetría y el sistema. Te pedimos disculpas por la breve interrupción, ¡es para darte la mejor experiencia!
					</p>
				</div>

				{/* Contador regresivo de 60 segundos */}
				<div className="px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 flex items-center justify-between">
					<span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
						Recarga automática en:
					</span>
					<span className="text-base font-black text-amber-400 tabular-nums">
						00:{secondsRemaining.toString().padStart(2, "0")}
					</span>
				</div>

				{/* Acciones del usuario */}
				<div className="flex items-center gap-2 pt-1">
					<button
						onClick={handleReloadNow}
						className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
					>
						<RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
						<span>Actualizar ahora</span>
					</button>

					<button
						onClick={handlePostpone}
						className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl border border-zinc-800 transition-all duration-200 active:scale-95 cursor-pointer"
					>
						Posponer 5m
					</button>
				</div>
			</div>
		</div>
	);
}
