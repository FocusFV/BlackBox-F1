"use client";

import { useEffect, useState, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { AlertTriangle, ShieldAlert, Flag, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { translateFiaMessage } from "@/lib/raceControlTranslations";
import WavingFlag from "@/components/ui/WavingFlag";
import { useTranslation } from "@/hooks/useTranslation";

interface AlertData {
	id: string;
	type: "SC" | "VSC" | "RED_FLAG" | "YELLOW" | "MESSAGE" | "CHEQUERED" | "GREEN_FLAG";
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
	const { t, language } = useTranslation();

	const [activeAlert, setActiveAlert] = useState<AlertData | null>(null);
	const [dismissedId, setDismissedId] = useState<string | null>(null);

	const lastMessageUtc = useRef<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const prevTrackStatus = useRef<string | null>(null);

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

	// 1. Monitoreo de estado de pista (SC, VSC, Red Flag, Bandera Amarilla, Largada en Verde)
	useEffect(() => {
		if (!trackStatus) return;

		let alert: AlertData | null = null;

		switch (trackStatus) {
			case "1":
				// Si la pista pasa a verde desde SC (4), VSC (6), Red Flag (5), Amarilla (2) o inicio de carrera
				if (prevTrackStatus.current && prevTrackStatus.current !== "1") {
					const isRestart =
						prevTrackStatus.current === "4" ||
						prevTrackStatus.current === "6" ||
						prevTrackStatus.current === "2" ||
						prevTrackStatus.current === "5";

					alert = {
						id: `track-green-${Date.now()}`,
						type: "GREEN_FLAG",
						title: isRestart
							? t("race_control.restart_green_title", "PISTA HABILITADA · BANDERA VERDE")
							: t("race_control.green_flag_title", "¡LARGARON! · BANDERA VERDE EN PISTA"),
						subtitle: isRestart
							? t("race_control.restart_green_sub", "Pista despejada · Fin de neutralización")
							: t("race_control.green_flag_sub", "Pista habilitada · ¡Aceleran a fondo!"),
						badgeBg: "bg-emerald-400",
						textColor: "text-emerald-200",
						borderColor: "border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)]",
						pulseColor: "bg-emerald-400",
						persistent: false,
					};
				}
				break;
			case "4":
				alert = {
					id: "track-sc",
					type: "SC",
					title: t("race_control.sc_title", "SAFETY CAR DESPLEGADO"),
					subtitle: t("race_control.sc_sub", "Reducir la velocidad · Prohibido adelantar"),
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
					title: t("race_control.vsc_title", "VIRTUAL SAFETY CAR (VSC)"),
					subtitle: t("race_control.vsc_sub", "Mantener delta positivo · Velocidad reducida"),
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
					title: t("race_control.vsc_ending_title", "VSC FINALIZANDO"),
					subtitle: t("race_control.vsc_ending_sub", "Prepararse para relanzamiento en verde"),
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
					title: t("race_control.red_flag_title", "BANDERA ROJA · SESIÓN SUSPENDIDA"),
					subtitle: t("race_control.red_flag_sub", "Todos los coches al Pit Lane inmediatamente"),
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
					title: t("race_control.yellow_flag_title", "BANDERA AMARILLA EN PISTA"),
					subtitle: t("race_control.yellow_flag_sub", "Precaución en pista · Prohibido adelantar en el sector"),
					badgeBg: "bg-yellow-500",
					textColor: "text-yellow-300",
					borderColor: "border-yellow-500/60",
					pulseColor: "bg-yellow-400",
					persistent: true,
				};
				break;
			default:
				if (activeAlert?.persistent) {
					setActiveAlert(null);
				}
				break;
		}

		prevTrackStatus.current = trackStatus;

		if (alert && alert.id !== dismissedId) {
			setActiveAlert(alert);
			playAlertSound();

			if (!alert.persistent) {
				const t = setTimeout(() => {
					setActiveAlert((curr) => (curr?.id === alert?.id ? null : curr));
				}, 10000);
				return () => clearTimeout(t);
			}
		}
	}, [trackStatus, dismissedId]);

	// 2. Monitoreo de mensajes críticos de Dirección de Carrera (Banderas, Sanciones, etc.)
	useEffect(() => {
		if (!messages || messages.length === 0) return;

		const latest = messages[messages.length - 1];
		if (!latest || latest.Utc === lastMessageUtc.current) return;
		lastMessageUtc.current = latest.Utc;

		// Solo alertar si el mensaje ocurrió en el último minuto en vivo
		const msgTime = new Date(latest.Utc).getTime();
		const isRecent = !isNaN(msgTime) && Math.abs(Date.now() - msgTime) < 60 * 1000;
		if (!isRecent) return;

		const text = (latest.Message || "").toUpperCase();
		const flag = (latest.Flag || "").toUpperCase();

		// 🏁 CELEBRACIÓN DE BANDERA A CUADROS
		if (flag === "CHEQUERED" || text.includes("CHEQUERED")) {
			const alertId = `rc-chequered-${latest.Utc}`;
			const messageAlert: AlertData = {
				id: alertId,
				type: "CHEQUERED",
				title: "BANDERA A CUADROS · FINAL DE CARRERA",
				subtitle: "¡Victoria y final de carrera! Monoplazas en vuelta de honor hacia el Parque Cerrado",
				badgeBg: "bg-amber-400 text-black",
				textColor: "text-amber-200",
				borderColor: "border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.35)]",
				pulseColor: "bg-amber-400",
				persistent: false,
			};

			setActiveAlert(messageAlert);
			playAlertSound();

			const timer = setTimeout(() => {
				setActiveAlert((curr) => (curr?.id === alertId ? null : curr));
			}, 15000);

			return () => clearTimeout(timer);
		}

		// 🟢 CELEBRACIÓN DE LARGADA / BANDERA VERDE
		if (flag === "GREEN" || text.includes("GREEN LIGHT") || text.includes("GREEN FLAG")) {
			const alertId = `rc-green-${latest.Utc}`;
			const isStart =
				(!latest.Lap || latest.Lap <= 1) &&
				(text.includes("GREEN LIGHT") || text.includes("START") || text.includes("LARGADA") || text.includes("RACE STARTED"));
			const messageAlert: AlertData = {
				id: alertId,
				type: "GREEN_FLAG",
				title: isStart
					? "¡LARGARON! · BANDERA VERDE EN PISTA"
					: "PISTA HABILITADA · BANDERA VERDE",
				subtitle: translateFiaMessage(latest.Message),
				badgeBg: "bg-emerald-400 text-black",
				textColor: "text-emerald-200",
				borderColor: "border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)]",
				pulseColor: "bg-emerald-400",
				persistent: false,
			};

			setActiveAlert(messageAlert);
			playAlertSound();

			const timer = setTimeout(() => {
				setActiveAlert((curr) => (curr?.id === alertId ? null : curr));
			}, 10000);

			return () => clearTimeout(timer);
		}

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
				subtitle: translateFiaMessage(latest.Message),
				badgeBg: "bg-red-600 text-white",
				textColor: "text-white",
				borderColor: "border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.25)]",
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
						<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700/60">
							<span
								className={`absolute inline-flex h-full w-full animate-ping rounded-lg opacity-40 ${activeAlert.pulseColor}`}
							></span>
							{activeAlert.type === "CHEQUERED" ? (
								<WavingFlag type="chequered" size="sm" />
							) : activeAlert.type === "GREEN_FLAG" ? (
								<WavingFlag type="green" size="sm" />
							) : activeAlert.type === "RED_FLAG" ? (
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
									className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${activeAlert.badgeBg}`}
								>
									{activeAlert.type === "CHEQUERED" ? "META" : activeAlert.type === "GREEN_FLAG" ? "VERDE" : activeAlert.type}
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
