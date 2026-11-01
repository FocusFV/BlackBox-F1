import { useRef, useState } from "react";
import { motion } from "motion/react";
import { utc } from "moment";
import clsx from "clsx";
import { Languages, Loader2 } from "lucide-react";

import type { Driver, RadioCapture } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";

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

	const [subtitle, setSubtitle] = useState<string | null>(null);
	const [subLoading, setSubLoading] = useState<boolean>(false);
	const [showSub, setShowSub] = useState<boolean>(true);
	const [subError, setSubError] = useState<string | null>(null);

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

	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.RacingNumber));

	const localTime = utc(capture.Utc).local().format("HH:mm:ss");
	const trackTime = utc(toTrackTime(capture.Utc, gmtOffset)).format("HH:mm");

	return (
		<motion.li
			animate={{ opacity: 1, scale: 1 }}
			initial={{ opacity: 0, scale: 0.9 }}
			className={clsx("flex flex-col gap-1 rounded-lg p-2", { "bg-sky-800/30": favoriteDriver })}
		>
			<div className="flex items-center justify-between gap-1 text-sm leading-none text-zinc-500">
				<div className="flex items-center gap-1">
					<time dateTime={localTime}>{localTime}</time>
					{"·"}
					<time className="text-zinc-700" dateTime={trackTime}>
						{trackTime}
					</time>
				</div>

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

			{showSub && subtitle && (
				<div className="mt-1 flex items-start gap-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 p-2 text-xs font-sans text-zinc-300">
					<span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
						SUB
					</span>
					<p className="italic leading-snug">"{subtitle}"</p>
				</div>
			)}

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