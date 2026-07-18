"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { duration, utc } from "moment"; // Cambiamos 'now' por 'utc'

import type { Session } from "@/types/schedule.type";

type Props = {
	next: Session;
	type: "race" | "other";
	countryName?: string;
};

const countryTranslation: Record<string, string> = {
	Australia: "Australia", Austria: "Austria", Azerbaijan: "Azerbaiyán", Bahrain: "Bahréin",
	Belgium: "Bélgica", Brazil: "Brasil", Canada: "Canadá", China: "China", Spain: "España",
	France: "Francia", "Great Britain": "Gran Bretaña", "United Kingdom": "Reino Unido",
	Germany: "Alemania", Hungary: "Hungría", Italy: "Italia", Japan: "Japón",
	"Saudi Arabia": "Arabia Saudita", Mexico: "México", Monaco: "Mónaco", Netherlands: "Países Bajos",
	Portugal: "Portugal", Qatar: "Catar", Singapore: "Singapur", "United Arab Emirates": "Emiratos Árabes Unidos",
	"United States": "Estados Unidos",
};

export default function Countdown({ next, type, countryName }: Props) {
	const [[days, hours, minutes, seconds], setDuration] = useState<
		[number | null, number | null, number | null, number | null]
	>([null, null, null, null]);

	const nextMoment = utc(next.start);
	const requestRef = useRef<number | null>(null);

	// Usamos un ref auxiliar para controlar los valores reales en cada frame sin causar re-renders
	const currentValuesRef = useRef<string>("");

	useEffect(() => {
		const calculateTime = () => {
			const diff = duration(nextMoment.diff(utc()));
			const daysVal = Math.floor(diff.asDays());

			const nextDays = diff.asSeconds() > 0 ? daysVal : 0;
			const nextHours = diff.asSeconds() > 0 ? diff.hours() : 0;
			const nextMinutes = diff.asSeconds() > 0 ? diff.minutes() : 0;
			const nextSeconds = diff.asSeconds() > 0 ? diff.seconds() : 0;

			// Creamos un string único con el tiempo actual (ej: "4-12-30-55")
			const timeString = `${nextDays}-${nextHours}-${nextMinutes}-${nextSeconds}`;

			// 🟢 CORRECCIÓN CLAVE: Si el string es idéntico, frenamos el frame antes de tocar a React
			if (currentValuesRef.current === timeString) {
				return; 
			}

			// Si cambió, guardamos la nueva marca y actualizamos el estado
			currentValuesRef.current = timeString;
			setDuration([nextDays, nextHours, nextMinutes, nextSeconds]);
		};

		// Ejecutamos al toque en el render inicial para evitar el efecto de parpadeo gris
		calculateTime();

		const animateNextFrame = () => {
			calculateTime();
			requestRef.current = requestAnimationFrame(animateNextFrame);
		};

		requestRef.current = requestAnimationFrame(animateNextFrame);
		
		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	// 🟢 FIX DE DEPENDENCIAS: Escuchamos el string primitivo del inicio de la sesión. 
	// Moment no va a poder romper el bucle ahora porque el string no cambia de referencia.
	}, [next.start, nextMoment]);

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
							<motion.p className="text-neutral-100" key={days} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.15 }}>
								{days}
							</motion.p>
						) : (
							<div className="h-9 w-12 animate-pulse rounded-md bg-zinc-900/80 border border-zinc-800/40" />
						)}
						<p className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 mt-1">Días</p>
					</div>

					<div className="text-center min-w-12">
						{hours != undefined && hours != null ? (
							<motion.p className="text-neutral-100" key={hours} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.15 }}>
								{hours}
							</motion.p>
						) : (
							<div className="h-9 w-12 animate-pulse rounded-md bg-zinc-900/80 border border-zinc-800/40" />
						)}
						<p className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 mt-1">Hs</p>
					</div>

					<div className="text-center min-w-12">
						{minutes != undefined && minutes != null ? (
							<motion.p className="text-neutral-100" key={minutes} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.15 }}>
								{minutes}
							</motion.p>
						) : (
							<div className="h-9 w-12 animate-pulse rounded-md bg-zinc-900/80 border border-zinc-800/40" />
						)}
						<p className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-500 mt-1">Min</p>
					</div>

					<div className="text-center min-w-12">
						{seconds != undefined && seconds != null ? (
							<motion.p className="text-amber-400 font-extrabold" key={seconds} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.12 }}>
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