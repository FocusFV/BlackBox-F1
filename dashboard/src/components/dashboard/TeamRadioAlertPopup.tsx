"use client";

import { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Radio, Play, Pause, X, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Driver, RadioCapture } from "@/types/state.type";

export function TeamRadioAlertPopup() {
	const teamRadio = useDataStore((state) => state.state?.TeamRadio);
	const drivers = useDataStore((state) => state.state?.DriverList);
	const sessionPath = useDataStore((state) => state.state?.SessionInfo?.Path);

	const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);
	const autoPlay = useSettingsStore((state) => state.autoPlayFavoriteRadios);

	const [activeCapture, setActiveCapture] = useState<{
		capture: RadioCapture;
		driver: Driver;
	} | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);

	const lastProcessedUtc = useRef<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Detectar nuevas capturas de radio
	useEffect(() => {
		if (!teamRadio?.Captures || teamRadio.Captures.length === 0 || !drivers) return;

		const captures = [...teamRadio.Captures].sort(
			(a, b) => new Date(b.Utc).getTime() - new Date(a.Utc).getTime()
		);
		const latest = captures[0];
		if (!latest || latest.Utc === lastProcessedUtc.current) return;
		lastProcessedUtc.current = latest.Utc;

		// Si el usuario tiene pilotos favoritos, filtramos por ellos. Si no tiene ninguno seleccionado, mostramos de cualquiera.
		const isTargetDriver =
			favoriteDrivers.length === 0 || favoriteDrivers.includes(latest.RacingNumber);

		if (isTargetDriver) {
			const driver = drivers[latest.RacingNumber];
			if (driver) {
				setActiveCapture({ capture: latest, driver });
				setIsPlaying(false);
				setProgress(0);
			}
		}
	}, [teamRadio, drivers, favoriteDrivers]);

	// Auto-play cuando se monta o cambia activeCapture
	useEffect(() => {
		if (!activeCapture || !sessionPath) return;

		const audioUrl = `https://livetiming.formula1.com/static/${sessionPath}${activeCapture.capture.Path}`;
		const audio = new Audio(audioUrl);
		audioRef.current = audio;

		audio.onloadedmetadata = () => {
			setDuration(audio.duration || 0);
		};

		audio.onended = () => {
			setIsPlaying(false);
			setProgress(100);
			if (intervalRef.current) clearInterval(intervalRef.current);

			// Cerrar notificación flotante 5s después de finalizar
			setTimeout(() => {
				setActiveCapture(null);
			}, 5000);
		};

		if (autoPlay) {
			audio
				.play()
				.then(() => {
					setIsPlaying(true);
					intervalRef.current = setInterval(() => {
						if (audio.duration) {
							setProgress((audio.currentTime / audio.duration) * 100);
						}
					}, 100);
				})
				.catch((err) => {
					console.warn("Autoplay bloqueado por políticas del navegador:", err);
				});
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [activeCapture, sessionPath, autoPlay]);

	const togglePlayPause = () => {
		if (!audioRef.current) return;
		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
			if (intervalRef.current) clearInterval(intervalRef.current);
		} else {
			audioRef.current.play().then(() => {
				setIsPlaying(true);
				intervalRef.current = setInterval(() => {
					if (audioRef.current && audioRef.current.duration) {
						setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
					}
				}, 100);
			});
		}
	};

	if (!activeCapture) return null;

	const { driver } = activeCapture;
	const teamColor = driver.TeamColour ? `#${driver.TeamColour}` : "#e10600";

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: 50, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: 50, scale: 0.95 }}
				className="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-3.5 shadow-2xl backdrop-blur-xl"
				style={{
					boxShadow: `0 10px 40px -10px ${teamColor}33`,
				}}
			>
				{/* Barra superior: Badge F1 Broadcast & Cerrar */}
				<div className="flex items-center justify-between pb-2 border-b border-zinc-800">
					<div className="flex items-center gap-2">
						<span className="relative flex h-2.5 w-2.5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
							<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
						</span>
						<span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-zinc-300">
							<Radio className="h-3 w-3 text-red-500" />
							Team Radio en Vivo
						</span>
					</div>

					<button
						type="button"
						onClick={() => setActiveCapture(null)}
						className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
						title="Cerrar"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>

				{/* Info del Piloto */}
				<div className="mt-2.5 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2.5">
						<div
							className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-black text-white"
							style={{ backgroundColor: teamColor }}
						>
							{driver.RacingNumber}
						</div>
						<div className="flex flex-col">
							<span className="text-xs font-black uppercase tracking-wider text-white">
								{driver.BroadcastName || `${driver.FirstName} ${driver.LastName}`}
							</span>
							<span className="text-[11px] font-medium text-zinc-400">
								{driver.TeamName}
							</span>
						</div>
					</div>

					{/* Botón Play / Pause */}
					<button
						type="button"
						onClick={togglePlayPause}
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-zinc-200 transition-transform active:scale-95"
						title={isPlaying ? "Pausar" : "Reproducir"}
					>
						{isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black translate-x-0.5" />}
					</button>
				</div>

				{/* Barra de progreso */}
				<div className="mt-3 flex items-center gap-2">
					<Volume2 className="h-3 w-3 text-zinc-500" />
					<div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
						<div
							className="h-full rounded-full transition-all duration-100"
							style={{
								width: `${progress}%`,
								backgroundColor: teamColor,
							}}
						/>
					</div>
					<span className="font-mono text-[10px] text-zinc-400">
						{duration ? `${Math.round(duration)}s` : ""}
					</span>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
