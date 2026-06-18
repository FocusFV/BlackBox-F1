"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import { Timer, CheckCircle2 } from "lucide-react";
import { utc } from "moment";

import Round from "@/components/schedule/Round";
import type { Round as RoundType } from "@/types/schedule.type";

type Props = {
	schedule: RoundType[];
	nextName?: string;
};

export default function RoundListClient({ schedule, nextName }: Props) {
	const [filtro, setFiltro] = useState<"proximas" | "completadas">("proximas");

	const rondasFiltradas = schedule.filter((round) => {
		const nameClean = round.name ? round.name.toLowerCase() : "";
		if (nameClean.includes("testing") || nameClean.includes("pre-season")) {
			return false;
		}

		const raceSession = round.sessions?.find((s) => s.kind.toLowerCase() === "race");
		const endTime = raceSession ? utc(raceSession.end) : utc(round.end).endOf("day");
		
		const isRoundOver = round.over || endTime.isBefore(utc());
		return filtro === "completadas" ? isRoundOver : !isRoundOver;
	});

	return (
		<div className="space-y-6">
			{/* CONTROLES DESLIZANTES EN ORO PURO */}
			<div className="flex bg-black/40 border border-zinc-900/80 p-1 rounded-xl max-w-xs font-mono shadow-inner">
				<button
					onClick={() => setFiltro("proximas")}
					className={clsx(
						"flex-1 relative py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 z-10 flex items-center justify-center gap-1.5 cursor-pointer",
						filtro === "proximas" ? "text-amber-100" : "text-zinc-500 hover:text-zinc-300"
					)}
				>
					<Timer className="w-3.5 h-3.5" />
					Próximas
					{filtro === "proximas" && (
						<motion.div 
							layoutId="activeScheduleTab"
							className="absolute inset-0 bg-gradient-to-r from-amber-500/15 to-transparent border border-amber-500/30 rounded-lg -z-10"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
				</button>

				<button
					onClick={() => setFiltro("completadas")}
					className={clsx(
						"flex-1 relative py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 z-10 flex items-center justify-center gap-1.5 cursor-pointer",
						filtro === "completadas" ? "text-amber-100" : "text-zinc-500 hover:text-zinc-300"
					)}
				>
					<CheckCircle2 className="w-3.5 h-3.5" />
					Completadas
					{filtro === "completadas" && (
						<motion.div 
							layoutId="activeScheduleTab"
							className="absolute inset-0 bg-gradient-to-r from-amber-500/15 to-transparent border border-amber-500/30 rounded-lg -z-10"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
				</button>
			</div>

			{/* CONTENEDOR DE TARJETAS ANIMADAS */}
			<motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<AnimatePresence mode="popLayout">
					{rondasFiltradas.map((round, roundI) => (
						<motion.div
							key={`${round.name || 'round'}-${round.start || roundI}-${roundI}`}
							layout
							initial={{ opacity: 0, scale: 0.97, y: 12 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.97, y: -12 }}
							transition={{ duration: 0.22, ease: "easeInOut" }}
						>
							{/* 🛠️ BLINDAJE: Le pasamos hideBadge={true} para apagar la etiqueta repetida abajo */}
							<Round nextName={nextName} round={round} hideBadge={true} />
						</motion.div>
					))}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}