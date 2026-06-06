"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { duration, now, utc } from "moment";

import type { Session } from "@/types/schedule.type";

type Props = {
	next: Session;
	type: "race" | "other";
	countryName?: string;
};

const countryTranslation: Record<string, string> = {
	Australia: "Australia",
	Austria: "Austria",
	Azerbaijan: "Azerbaiyán",
	Bahrain: "Bahréin",
	Belgium: "Bélgica",
	Brazil: "Brasil",
	Canada: "Canadá",
	China: "China",
	Spain: "España",
	France: "Francia",
	"Great Britain": "Gran Bretaña",
	"United Kingdom": "Reino Unido",
	Germany: "Alemania",
	Hungary: "Hungría",
	Italy: "Italia",
	Japan: "Japón",
	"Saudi Arabia": "Arabia Saudita",
	Mexico: "México",
	Monaco: "Mónaco",
	Netherlands: "Países Bajos",
	Portugal: "Portugal",
	Qatar: "Catar",
	Singapore: "Singapur",
	"United Arab Emirates": "Emiratos Árabes Unidos",
	"United States": "Estados Unidos",
};

export default function Countdown({ next, type, countryName }: Props) {
	const [[days, hours, minutes, seconds], setDuration] = useState<
		[number | null, number | null, number | null, number | null]
	>([null, null, null, null]);

	const nextMoment = utc(next.start);
	const requestRef = useRef<number | null>(null);

	useEffect(() => {
		const animateNextFrame = () => {
			const diff = duration(nextMoment.diff(now()));
			const days = parseInt(diff.asDays().toString());

			if (diff.asSeconds() > 0) {
				setDuration([days, diff.hours(), diff.minutes(), diff.seconds()]);
			} else {
				setDuration([0, 0, 0, 0]);
			}

			requestRef.current = requestAnimationFrame(animateNextFrame);
		};

		requestRef.current = requestAnimationFrame(animateNextFrame);
		return () => (requestRef.current ? cancelAnimationFrame(requestRef.current) : void 0);
	}, [nextMoment]);

	const actionText = (() => {
		const kind = next.kind.toLowerCase();
		if (kind === "race") {
			const translatedCountry = countryName ? (countryTranslation[countryName] || countryName) : "";
			return translatedCountry ? `COMIENZA LA CARRERA DE ${translatedCountry.toUpperCase()}` : "COMIENZA LA CARRERA";
		}
		if (kind === "qualifying") return "COMIENZA LA CLASIFICACIÓN";
		if (kind === "sprint" || kind === "sprint race") return "COMIENZA LA CARRERA SPRINT";
		if (kind === "sprint qualification" || kind === "sprint shootout") return "COMIENZA LA CLASIF. SPRINT";
		if (kind === "practice 1") return "COMIENZAN LOS LIBRES 1";
		if (kind === "practice 2") return "COMIENZAN LOS LIBRES 2";
		if (kind === "practice 3") return "COMIENZAN LOS LIBRES 3";
		return `COMIENZA ${kind.toUpperCase()}`;
	})();

	return (
		<div className="flex flex-col gap-2.5 py-1 first:border-b first:border-zinc-900 first:pb-4">
			<p className="text-xs font-black uppercase tracking-widest text-amber-500/90 flex items-center gap-2">
				<span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
				{actionText} EN
			</p>

			<AnimatePresence mode="popLayout">
				<div className="grid auto-cols-max grid-flow-col gap-5 text-3xl font-mono font-black tracking-tighter">
					<div className="text-center min-w-12">
						{days != undefined && days != null ? (
							<motion.p
								className="text-neutral-100 drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
								key={days}
								initial={{ y: -6, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 6, opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								{days}
							</motion.p>
						) : (
							<div className="h-9 w-12 animate-pulse rounded-md bg-zinc-900/80 border border-zinc-800/40" />
						)}
						<p className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 mt-1">Días</p>
					</div>

					<div className="text-center min-w-12">
						{hours != undefined && hours != null ? (
							<motion.p
								className="text-neutral-100 drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
								key={hours}
								initial={{ y: -6, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 6, opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								{hours}
							</motion.p>
						) : (
							<div className="h-9 w-12 animate-pulse rounded-md bg-zinc-900/80 border border-zinc-800/40" />
						)}
						<p className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 mt-1">Hs</p>
					</div>

					<div className="text-center min-w-12">
						{minutes != undefined && minutes != null ? (
							<motion.p
								className="text-neutral-100 drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
								key={minutes}
								initial={{ y: -6, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 6, opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								{minutes}
							</motion.p>
						) : (
							<div className="h-9 w-12 animate-pulse rounded-md bg-zinc-900/80 border border-zinc-800/40" />
						)}
						<p className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 mt-1">Min</p>
					</div>

					<div className="text-center min-w-12">
						{seconds != undefined && seconds != null ? (
							<motion.p
								className="text-amber-400 font-extrabold drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]"
								key={seconds}
								initial={{ y: -6, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: 6, opacity: 0 }}
								transition={{ duration: 0.12 }}
							>
								{String(seconds).padStart(2, "0")}
							</motion.p>
						) : (
							<div className="h-9 w-12 animate-pulse rounded-md bg-zinc-900/80 border border-zinc-800/40" />
						)}
						<p className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 mt-1">Seg</p>
					</div>
				</div>
			</AnimatePresence>
		</div>
	);
}