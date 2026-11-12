import { AnimatePresence } from "motion/react";
import clsx from "clsx";

import { useDataStore } from "@/stores/useDataStore";

import { sortUtc } from "@/lib/sorting";

import RadioMessage from "@/components/dashboard/RadioMessage";

export default function TeamRadios() {
	const drivers = useDataStore((state) => state.state?.DriverList);
	const teamRadios = useDataStore((state) => state.state?.TeamRadio);
	const sessionPath = useDataStore((state) => state.state?.SessionInfo?.Path);

	const gmtOffset = useDataStore((state) => state.state?.SessionInfo?.GmtOffset);

	const basePath = `https://livetiming.formula1.com/static/${sessionPath}`;

	return (
		<ul className="flex flex-col gap-2">
			{!teamRadios && new Array(6).fill("").map((_, index) => <SkeletonMessage key={`radio.loading.${index}`} />)}

			{teamRadios && drivers && teamRadios.Captures && teamRadios.Captures.length === 0 && (
				<li className="flex flex-col items-center justify-center p-6 text-center text-zinc-500 font-mono text-xs bg-zinc-950/40 rounded-xl border border-zinc-900/60">
					<span className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">CANAL DE RADIO DISPONIBLE</span>
					<p className="text-zinc-400">Sin mensajes en este momento. Pulsa <strong className="text-amber-400">[Radio]</strong> en el HUD para emitir.</p>
				</li>
			)}

			{teamRadios && (gmtOffset || true) && drivers && teamRadios.Captures && teamRadios.Captures.length > 0 && (
				<AnimatePresence>
					{teamRadios.Captures.sort(sortUtc)
						.slice(0, 20)
						.map((teamRadio, i) => (
							<RadioMessage
								key={teamRadio.Utc ? `radio.${teamRadio.Utc}` : `radio.${i}`}
								driver={drivers[teamRadio.RacingNumber]}
								capture={teamRadio}
								basePath={basePath}
								gmtOffset={gmtOffset || "-06:00:00"}
							/>
						))}
				</AnimatePresence>
			)}
		</ul>
	);
}

const SkeletonMessage = () => {
	const animateClass = "h-6 animate-pulse rounded-md bg-zinc-800";

	return (
		<li className="flex flex-col gap-1 p-2">
			<div className={clsx(animateClass, "h-4! w-16")} />

			<div
				className="grid place-items-center items-center gap-4"
				style={{
					gridTemplateColumns: "2rem 20rem",
				}}
			>
				<div className="place-self-start">
					<div className={clsx(animateClass, "h-8! w-14")} />
				</div>

				<div className="flex items-center gap-4">
					<div className={clsx(animateClass, "h-6 w-6")} />
					<div className={clsx(animateClass, "h-2! w-60")} />
				</div>
			</div>
		</li>
	);
};