import { motion } from "motion/react";
import { utc } from "moment";
import Image from "next/image";
import clsx from "clsx";
import { useEffect, useState } from "react";

import type { Message } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";

import { toTrackTime } from "@/lib/toTrackTime";

type Props = {
	msg: Message;
	gmtOffset: string;
};

const getDriverNumber = (msg: Message) => {
	const match = msg.Message.match(/CAR (\d+)/);
	return match?.[1];
};

export function RaceControlMessage({ msg, gmtOffset }: Props) {
	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(getDriverNumber(msg) ?? ""));

	const localTime = utc(msg.Utc).local().format("HH:mm:ss");
	const trackTime = utc(toTrackTime(msg.Utc, gmtOffset)).format("HH:mm");

	const [translatedText, setTranslatedText] = useState(msg.Message);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const translateMessage = async () => {
			if (!msg.Message) return;
			setIsLoading(true);
			try {
				const res = await fetch(
					"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=" +
						encodeURIComponent(msg.Message)
				);
				const data = await res.json();
				
				if (data && data[0] && data[0][0] && data[0][0][0]) {
					setTranslatedText(data[0][0][0]);
				}
			} catch (error) {
				console.error("Error al traducir el mensaje de Race Control:", error);
				setTranslatedText(msg.Message);
			} finally {
				setIsLoading(false);
			}
		};

		translateMessage();
	}, [msg.Message]);

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

				<p className={clsx("text-sm, transition-opacity", { "opacity-50": isLoading })}>{translatedText}</p>
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