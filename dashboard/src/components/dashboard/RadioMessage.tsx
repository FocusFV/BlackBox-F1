import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { utc } from "moment";
import clsx from "clsx";
import { Languages, Loader2, X, ChevronDown, Radio } from "lucide-react";

import type { Driver, RadioCapture } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { isFavoriteDriver } from "@/lib/favoriteDriver";

import { toTrackTime } from "@/lib/toTrackTime";

import DriverTag from "@/components/driver/DriverTag";
import PlayControls from "@/components/ui/PlayControls";
import Progress from "@/components/ui/Progress";

type Props = {
	driver: Driver;
	capture: RadioCapture;
	basePath: string;
	gmtOffset: string;
};

export default function RadioMessage({ driver, capture, basePath, gmtOffset }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const [playing, setPlaying] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(10);
	const [progress, setProgress] = useState<number>(0);

	const simulatedTranscript = (capture as any)?.Transcript || null;
	const [subtitle, setSubtitle] = useState<string | null>(simulatedTranscript);
	const [subLoading, setSubLoading] = useState<boolean>(false);
	const [showSub, setShowSub] = useState<boolean>(true);
	const [subError, setSubError] = useState<string | null>(null);

	// ⏱️ Auto-cierre suave e infalible a los 12 segundos para radios de simulación
	// manualState: null (automático según tiempo), "open" (forzado por el usuario con Abrir), "closed" (forzado con X)
	const [manualState, setManualState] = useState<"open" | "closed" | null>(null);
	const [, setTimerTick] = useState<number>(0);

	const captureTimeMs = capture?.Utc ? new Date(capture.Utc).getTime() : 0;
	const ageMs = captureTimeMs > 0 ? Date.now() - captureTimeMs : 0;
	const isSimulated = Boolean(simulatedTranscript);
	// Si tiene más de 12 segundos de antigüedad, colapsa automáticamente a la vista compacta
	const autoExpired = isSimulated && ageMs >= 12000;

	useEffect(() => {
		if (!isSimulated || manualState !== null) return;
		const remainingMs = Math.max(100, 12000 - ageMs);
		const timer = setTimeout(() => {
			setTimerTick((t) => t + 1);
		}, remainingMs);
		return () => clearTimeout(timer);
	}, [isSimulated, manualState, ageMs, capture.Utc]);

	const isClosed = manualState !== null ? manualState === "closed" : autoExpired;

	const audioUrl = `${basePath}${capture.Path}`;

	const fetchSubtitle = async () => {
		if (subLoading) return;
		if (subtitle) {
			setShowSub((old) => !old);
			return;
		}
		setSubLoading(true);
		setSubError(null);
		try {
			const res = await fetch(`/api/radio-transcribe?url=${encodeURIComponent(audioUrl)}`);
			const json = await res.json();
			if (json.success && json.data?.translated) {
				setSubtitle(json.data.translated);
				setShowSub(true);
			} else if (json.message) {
				setSubError(json.message);
				setShowSub(true);
			} else {
				setSubError("Traducción no disponible temporalmente.");
				setShowSub(true);
			}
		} catch {
			setSubError("Error de conexión al traducir.");
			setShowSub(true);
		} finally {
			setSubLoading(false);
		}
	};

	const loadMeta = () => {
		if (!audioRef.current) return;
		setDuration(audioRef.current.duration);
	};

	const onEnded = () => {
		setPlaying(false);
		setProgress(0);

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
	};

	const updateProgress = () => {
		if (!audioRef.current) return;
		setProgress(audioRef.current.currentTime);
	};

	const togglePlayback = () => {
		setPlaying((old) => {
			if (!audioRef.current) return old;

			if (!old) {
				audioRef.current.play();
				fetchSubtitle();
				intervalRef.current = setInterval(updateProgress, 10);
			} else {
				audioRef.current.pause();

				if (intervalRef.current) {
					clearInterval(intervalRef.current);
				}

				setTimeout(() => {
					setProgress(0);
					audioRef.current?.fastSeek(0);
				}, 10000);
			}

			return !old;
		});
	};

	const favoriteDriver = useSettingsStore((state) => isFavoriteDriver(driver, state.favoriteDrivers));

	const localTime = utc(capture.Utc).local().format("HH:mm:ss");
	const trackTime = utc(toTrackTime(capture.Utc, gmtOffset)).format("HH:mm");

	if (isClosed) {
		return (
			<motion.li
				animate={{ opacity: 1, scale: 1 }}
				initial={{ opacity: 0 }}
				className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-950/70 border border-zinc-900/80 hover:border-zinc-800 transition-all font-mono"
			>
				<div className="flex items-center gap-2 min-w-0 flex-1 truncate">
					<span className="text-[10px] text-zinc-500 font-bold shrink-0">[{localTime}]</span>
					<DriverTag className="!w-fit !text-[9px] shrink-0" teamColor={driver.TeamColour} short={driver.Tla} />
					<span className="text-zinc-400 text-xs italic truncate font-sans">
						&ldquo;{subtitle || simulatedTranscript || "Comunicación de boxes"}&rdquo;
					</span>
				</div>
				<button
					type="button"
					onClick={() => setManualState("open")}
					className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider underline cursor-pointer shrink-0 ml-1"
				>
					Abrir
				</button>
			</motion.li>
		);
	}

	return (
		<motion.li
			animate={{ opacity: 1, scale: 1 }}
			initial={{ opacity: 0, scale: 0.9 }}
			className={clsx("flex flex-col gap-1 rounded-lg p-2.5 border border-zinc-800/90 bg-zinc-950/90 shadow-lg relative", { "bg-sky-800/30": favoriteDriver })}
		>
			<div className="flex items-center justify-between gap-1 text-sm leading-none text-zinc-500">
				<div className="flex items-center gap-1.5">
					<time dateTime={localTime} className="text-zinc-400 font-mono text-xs">{localTime}</time>
					{"·"}
					<time className="text-zinc-600 font-mono text-xs" dateTime={trackTime}>
						{trackTime}
					</time>
					{simulatedTranscript && (
						<span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
							SIM LIVE
						</span>
					)}
				</div>

				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={fetchSubtitle}
						disabled={subLoading}
						className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 hover:border-amber-500/40 hover:bg-zinc-800 hover:text-amber-400 transition-all cursor-pointer"
						title="Traducir o subtitular radio con IA"
					>
						{subLoading ? (
							<>
								<Loader2 className="h-2.5 w-2.5 animate-spin text-amber-400" />
								<span>Traduciendo...</span>
							</>
						) : (
							<>
								<Languages className="h-2.5 w-2.5 text-amber-400" />
								<span>{subtitle ? (showSub ? "Ocultar" : "Ver Sub") : "Traducir"}</span>
							</>
						)}
					</button>

					{simulatedTranscript && (
						<button
							type="button"
							onClick={() => setManualState("closed")}
							className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
							title="Cerrar reproductor"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>
			</div>

			<div className="flex items-center gap-1">
				<DriverTag className="!w-fit" teamColor={driver.TeamColour} short={driver.Tla} />

				<PlayControls playing={playing} onClick={togglePlayback} />
				<Progress duration={duration} progress={progress} />

				<audio
					preload="none"
					src={`${basePath}${capture.Path}`}
					ref={audioRef}
					onEnded={() => onEnded()}
					onLoadedMetadata={() => loadMeta()}
				/>
			</div>

			{(showSub && subtitle) || simulatedTranscript ? (
				<div className="mt-1 flex items-start gap-1.5 rounded-lg bg-zinc-900/90 border border-amber-500/30 p-2 text-xs font-sans text-zinc-200 shadow-sm">
					<span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
						TRANSCRIPCIÓN
					</span>
					<p className="italic leading-snug">&ldquo;{subtitle || simulatedTranscript}&rdquo;</p>
				</div>
			) : null}

			{showSub && subError && !subtitle && (
				<div className="mt-1 flex items-start gap-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-1.5 text-[10px] font-sans text-zinc-400">
					<span className="font-mono text-[8px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-800 px-1 py-0.5 rounded shrink-0">
						INFO
					</span>
					<p className="leading-tight">{subError}</p>
				</div>
			)}
		</motion.li>
	);
}