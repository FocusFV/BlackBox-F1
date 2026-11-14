import { motion } from "motion/react";
import { utc } from "moment";
import Image from "next/image";
import clsx from "clsx";
import { useEffect, useState } from "react";

import type { Message } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { isFavoriteDriver } from "@/lib/favoriteDriver";

import { toTrackTime } from "@/lib/toTrackTime";
import WavingFlag from "@/components/ui/WavingFlag";
import { useTranslation } from "@/hooks/useTranslation";
import {
	translateFiaMessage,
	postProcessFiaTranslation,
} from "@/lib/raceControlTranslations";

type Props = {
	msg: Message;
	gmtOffset: string;
};

const getDriverNumber = (msg: Message) => {
	const match = msg.Message.match(/CAR (\d+)/);
	return match?.[1];
};

export function RaceControlMessage({ msg, gmtOffset }: Props) {
	const { t, language } = useTranslation();
	const favoriteDriver = useSettingsStore((state) => isFavoriteDriver(getDriverNumber(msg), state.favoriteDrivers));

	const localTime = utc(msg.Utc).local().format("HH:mm:ss");
	const trackTime = utc(toTrackTime(msg.Utc, gmtOffset)).format("HH:mm");

	// 🏁 Traducción instantánea determinista oficial en el idioma activo
	const initialTranslation = translateFiaMessage(msg.Message, language);
	const [translatedText, setTranslatedText] = useState(initialTranslation);

	useEffect(() => {
		if (!msg.Message) return;
		setTranslatedText(translateFiaMessage(msg.Message, language));
	}, [msg.Message, language]);

	const lapWord = language === "en" ? "Lap" : language === "pt" ? "Volta" : "Vuelta";

	const isChequered = msg.Flag === "CHEQUERED" || msg.Message?.toUpperCase().includes("CHEQUERED");
	const isGreen = msg.Flag === "GREEN" || msg.Message?.toUpperCase().includes("GREEN LIGHT") || msg.Message?.toUpperCase().includes("GREEN FLAG");

	// 🏁 BANDERA A CUADROS CON ANIMACIÓN Y DISEÑO VIP DE TRANSMISIÓN
	if (isChequered) {
		return (
			<motion.li
				layout="position"
				animate={{ opacity: 1, scale: 1 }}
				initial={{ opacity: 0, scale: 0.9 }}
				className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-zinc-900/90 to-zinc-950 p-2.5 shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md"
			>
				<div className="flex items-center gap-3">
					<WavingFlag type="chequered" size="sm" />
					<div>
						<div className="flex items-center gap-1.5 text-xs font-mono font-bold leading-none text-amber-400">
							{msg.Lap && <span>{lapWord} {msg.Lap} ·</span>}
							<time dateTime={localTime}>{localTime}</time>
							<span className="rounded bg-amber-400/20 px-1 py-0.5 text-[9px] uppercase tracking-wider text-amber-300">
								{t("sessions.finished", "FINAL DE CARRERA")}
							</span>
						</div>
						<p className="mt-1 font-mono text-sm font-black uppercase tracking-wide text-zinc-100">
							🏁 {translatedText}
						</p>
					</div>
				</div>
			</motion.li>
		);
	}

	// 🟢 BANDERA VERDE / LARGADA CON ANIMACIÓN ESMERALDA NEÓN
	if (isGreen) {
		return (
			<motion.li
				layout="position"
				animate={{ opacity: 1, scale: 1 }}
				initial={{ opacity: 0, scale: 0.9 }}
				className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-zinc-900/90 to-zinc-950 p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md"
			>
				<div className="flex items-center gap-3">
					<WavingFlag type="green" size="sm" />
					<div>
						<div className="flex items-center gap-1.5 text-xs font-mono font-bold leading-none text-emerald-400">
							{msg.Lap && <span>{lapWord} {msg.Lap} ·</span>}
							<time dateTime={localTime}>{localTime}</time>
							<span className="rounded bg-emerald-400/20 px-1 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300">
								{t("race_control.track_clear", "PISTA HABILITADA")}
							</span>
						</div>
						<p className="mt-1 font-mono text-sm font-black uppercase tracking-wide text-zinc-100">
							🟢 {translatedText}
						</p>
					</div>
				</div>
			</motion.li>
		);
	}

	return (
		<motion.li
			layout="position"
			animate={{ opacity: 1, scale: 1 }}
			initial={{ opacity: 0, scale: 0.8 }}
			className={clsx("flex items-center justify-between gap-1 rounded-lg p-2", { "bg-sky-800/30": favoriteDriver })}
		>
			<div>
				<div className="flex items-center gap-1 text-sm leading-none text-zinc-500">
					{msg.Lap && (
						<>
							<p>Vuelta {msg.Lap}</p>
							{"·"}
						</>
					)}
					<time dateTime={localTime}>{localTime}</time>
					{"·"}
					<time className="text-zinc-700" dateTime={trackTime}>
						{trackTime}
					</time>
				</div>

				<p className="text-sm text-zinc-100">{translatedText}</p>
			</div>

			{msg.Flag && msg.Flag !== "CLEAR" && (
				<Image
					src={`/flags/${msg.Flag.toLowerCase().replaceAll(" ", "-")}-flag.svg`}
					alt={msg.Flag}
					width={25}
					height={25}
				/>
			)}
		</motion.li>
	);
}