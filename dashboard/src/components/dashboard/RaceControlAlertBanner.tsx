"use client";

import { useEffect, useState, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { AlertTriangle, ShieldAlert, Flag, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface AlertData {
	id: string;
	type: "SC" | "VSC" | "RED_FLAG" | "YELLOW" | "MESSAGE";
	title: string;
	subtitle?: string;
	badgeBg: string;
	textColor: string;
	borderColor: string;
	pulseColor: string;
	persistent?: boolean;
}

export function RaceControlAlertBanner() {
	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const messages = useDataStore((state) => state.state?.RaceControlMessages?.Messages);
	const raceControlChime = useSettingsStore((state) => state.raceControlChime);
	const setRaceControlChime = useSettingsStore((state) => state.setRaceControlChime);
	const volume = useSettingsStore((state) => state.raceControlChimeVolume);

	const [activeAlert, setActiveAlert] = useState<AlertData | null>(null);
	const [dismissedId, setDismissedId] = useState<string | null>(null);

	const lastMessageUtc = useRef<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const audio = new Audio("/sounds/chime.mp3");
			audio.volume = Math.max(0, Math.min(1, volume / 100));
			audioRef.current = audio;
		}
	}, [volume]);

	const playAlertSound = () => {
		if (raceControlChime && audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch(() => null);
		}
	};

	// 1. Monitoreo de estado de pista (SC, VSC, Red Flag, Bandera Amarilla)
	useEffect(() => {
		if (!trackStatus) return;

		let alert: AlertData | null = null;

		switch (trackStatus) {
			case "4":
				alert = {
					id: "track-sc",
					type: "SC",
					title: "SAFETY CAR DESPLEGADO",
					subtitle: "Reducir la velocidad · Prohibido adelantar",
					badgeBg: "bg-amber-500",
					textColor: "text-amber-300",
					borderColor: "border-amber-500/60",
					pulseColor: "bg-amber-400",
					persistent: true,
				};
				break;
			case "6":
				alert = {
					id: "track-vsc",
					type: "VSC",
					title: "VIRTUAL SAFETY CAR (VSC)",
					subtitle: "Mantener delta positivo · Velocidad reducida",
					badgeBg: "bg-amber-500",
					textColor: "text-amber-300",
					borderColor: "border-amber-500/60",
					pulseColor: "bg-amber-400",
					persistent: true,
				};
				break;
			case "7":
				alert = {
					id: "track-vsc-ending",
					type: "VSC",
					title: "VSC FINALIZANDO",
					subtitle: "Prepararse para relanzamiento en verde",
					badgeBg: "bg-amber-400",
					textColor: "text-amber-200",
					borderColor: "border-amber-400/60",
					pulseColor: "bg-amber-300",
					persistent: true,
				};
				break;
			case "5":
				alert = {
					id: "track-red-flag",
					type: "RED_FLAG",
					title: "BANDERA ROJA · SESIÓN SUSPENDIDA",
					subtitle: "Todos los coches al Pit Lane inmediatamente",
					badgeBg: "bg-red-600",
					textColor: "text-red-300",
					borderColor: "border-red-600/60",
					pulseColor: "bg-red-500",
					persistent: true,
				};
				break;
			case "2":
				alert = {
					id: "track-yellow",
					type: "YELLOW",
					title: "BANDERA AMARILLA EN PISTA",
					subtitle: "Precaución en pista · Prohibido adelantar en el sector",
					badgeBg: "bg-yellow-500",
					textColor: "text-yellow-300",
					borderColor: "border-yellow-500/60",
					pulseColor: "bg-yellow-400",
					persistent: true,
				};
				break;
			default:
				// Si vuelve a verde (status "1") o neutral
				if (activeAlert?.persistent) {
					setActiveAlert(null);
				}
				break;
		}

		if (alert && alert.id !== dismissedId) {
			setActiveAlert(alert);
			playAlertSound();
		}
	}, [trackStatus, dismissedId]);

	// 2. Monitoreo de mensajes críticos de Dirección de Carrera
	useEffect(() => {
		if (!messages || messages.length === 0) return;

		const latest = messages[messages.length - 1];
		if (!latest || latest.Utc === lastMessageUtc.current) return;
		lastMessageUtc.current = latest.Utc;

		const text = (latest.Message || "").toUpperCase();
		const isCritical =
			text.includes("PENALTY") ||
			text.includes("INVESTIGATION") ||
			text.includes("INCIDENT") ||
			text.includes("SAFETY CAR") ||
			text.includes("STOP & GO") ||
			text.includes("BLACK FLAG") ||
			text.includes("TRACK LIMITS");

		if (isCritical) {
			const alertId = `rc-${latest.Utc}`;
			const messageAlert: AlertData = {
				id: alertId,
				type: "MESSAGE",
				title: "DIRECCIÓN DE CARRERA",
				subtitle: latest.Message,
				badgeBg: "bg-red-600",
				textColor: "text-white",
				borderColor: "border-red-500/60",
				pulseColor: "bg-red-400",
				persistent: false,
			};

			setActiveAlert(messageAlert);
			playAlertSound();

			// Auto-dismiss luego de 10 segundos para mensajes no permanentes
			const timer = setTimeout(() => {
				setActiveAlert((curr) => (curr?.id === alertId ? null : curr));
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [messages]);

	if (!activeAlert || activeAlert.id === dismissedId) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: -20, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -20, scale: 0.98 }}
				className={`w-full overflow-hidden rounded-xl border bg-black/90 p-3 shadow-2xl backdrop-blur-xl transition-all ${activeAlert.borderColor}`}
			>
				<div className="flex items-center justify-between gap-3">
					{/* Icono + Título + Subtítulo */}
					<div className="flex items-center gap-3">
						<div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700/60">
							<span
								className={`absolute inline-flex h-full w-full animate-ping rounded-lg opacity-40 ${activeAlert.pulseColor}`}
							></span>
							{activeAlert.type === "RED_FLAG" ? (
								<Flag className="h-5 w-5 text-red-500 fill-red-500" />
							) : activeAlert.type === "SC" || activeAlert.type === "VSC" ? (
								<ShieldAlert className="h-5 w-5 text-amber-400" />
							) : (
								<AlertTriangle className="h-5 w-5 text-amber-400" />
							)}
						</div>

						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								<span
									className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black ${activeAlert.badgeBg}`}
								>
									{activeAlert.type}
								</span>
								<h4 className="text-xs font-black uppercase tracking-wide text-white md:text-sm">
									{activeAlert.title}
								</h4>
							</div>
							{activeAlert.subtitle && (
								<p className="mt-0.5 text-xs font-medium text-zinc-300 md:text-sm">
									{activeAlert.subtitle}
								</p>
							)}
						</div>
					</div>

					{/* Acciones: Silencio de Chime y Descartar */}
					<div className="flex items-center gap-1.5 shrink-0">
						<button
							type="button"
							onClick={() => setRaceControlChime(!raceControlChime)}
							className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-400 hover:text-white transition-colors"
							title={raceControlChime ? "Silenciar alertas sonoras" : "Activar sonido de alerta"}
						>
							{raceControlChime ? (
								<Volume2 className="h-4 w-4 text-emerald-400" />
							) : (
								<VolumeX className="h-4 w-4 text-zinc-500" />
							)}
						</button>

						<button
							type="button"
							onClick={() => setDismissedId(activeAlert.id)}
							className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-400 hover:text-white transition-colors"
							title="Ocultar banner"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
