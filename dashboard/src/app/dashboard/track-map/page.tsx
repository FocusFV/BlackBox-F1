"use client";

import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";

import Map from "@/components/dashboard/Map";
import DriverTag from "@/components/driver/DriverTag";
import DriverInfo from "@/components/driver/DriverInfo";
import DriverGap from "@/components/driver/DriverGap";
import DriverLapTime from "@/components/driver/DriverLapTime";

import { sortPos } from "@/lib/sorting";
import { useDataStore } from "@/stores/useDataStore";
import type { Driver, TimingDataDriver } from "@/types/state.type";

const driverTeamColorMap: { [key: string]: string } = {
	NOR: "#ff8700", PIA: "#ff8700",
	LEC: "#e10600", HAM: "#e10600", BEA: "#e10600",
	VER: "#061d43", HAD: "#061d43", PER: "#061d43", LIN: "#061d43",
	RUS: "#00d2be", ANT: "#00d2be",
	ALO: "#006f62", STR: "#006f62",
	GAS: "#ff00ff", COL: "#ff00ff", OCO: "#ff00ff",
	MAG: "#373737",
	LAW: "#4b77ff", TSU: "#4b77ff",
	ALB: "#005aff", SAI: "#005aff",
	BOT: "#1f1f1f", HUL: "#1f1f1f", BOR: "#1f1f1f",
};

export default function TrackMap() {
	const drivers = useDataStore((state) => state.state?.DriverList);
	const driversTiming = useDataStore((state) => state.state?.TimingData);
	const activeTrackName = useDataStore((state) => (state.state as any)?.RaceInfo?.TrackName || "Circuito Activo");

	return (
		<div className="flex flex-col flex-1 h-full gap-4 p-4 bg-black font-mono text-white select-none">
			
			{/* HUD SUPERIOR */}
			<div className="flex flex-wrap items-center justify-between border bg-zinc-950/40 border-zinc-900 rounded-xl p-3 px-4 backdrop-blur-md w-full">
				<div className="flex items-center gap-3">
					<span className="text-xl">📍</span>
					<div className="flex flex-col">
						<span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">// MAPA DE PISTA EN VIVO</span>
						<span className="text-xs font-black text-zinc-200 uppercase tracking-tight">{activeTrackName}</span>
					</div>
				</div>
				<div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
					<div className="flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						<span>TRAZADA ÓPTIMA ACTIVA</span>
					</div>
					<div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 text-amber-500 rounded border border-zinc-800">
						REGULACIÓN PU 2026
					</div>
				</div>
			</div>

			{/* PANEL HUD */}
			<div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
				
				{/* CRONOMETRAJE IZQUIERDO */}
				<div className="md:col-span-5 lg:col-span-4 flex flex-col gap-2 overflow-y-auto pr-1 border border-zinc-900 bg-zinc-950/20 p-2 rounded-xl h-full">
					{(!drivers || !driversTiming) &&
						new Array(20).fill("").map((_, index) => <SkeletonDriver key={`driver.loading.${index}`} />)}

					{drivers && driversTiming && (
						<AnimatePresence mode="popLayout">
							{(Object.values(driversTiming.Lines) as any[])
								.sort(sortPos)
								.map((timingDriver: any, index) => {
									const driverCode = drivers[timingDriver.RacingNumber]?.Tla || "F1";
									const realTeamColor = driverTeamColorMap[driverCode] || drivers[timingDriver.RacingNumber]?.TeamColour || "#3f3f46";
									return (
										<motion.div
											layout="position"
											className="flex flex-col gap-1 rounded-xl p-2 border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800/80 transition-all min-h-14 justify-center select-none"
											key={`trackmap.driver.${timingDriver.RacingNumber}`}
										>
											<div className="grid items-center gap-3 w-full" style={{ gridTemplateColumns: "5.5rem 3.5rem 4rem 1fr 5rem" }}>
												<DriverTag className="min-w-full!" short={driverCode} teamColor={realTeamColor} position={index + 1} />
												<div className="flex flex-col items-center justify-center text-center">
													<span className="text-[9px] font-black px-1 py-0.5 rounded bg-zinc-900 text-emerald-500/60 border border-zinc-800/60">MOM</span>
												</div>
												<DriverInfo timingDriver={timingDriver} gridPos={0} />
												<DriverGap timingDriver={timingDriver} sessionPart={1} />
												<DriverLapTime last={timingDriver.LastLapTime} best={timingDriver.BestLapTime} hasFastest={false} />
											</div>
										</motion.div>
									);
								})}
						</AnimatePresence>
					)}
				</div>

				{/* PISTA DERECHA */}
				<div className="md:col-span-7 lg:col-span-8 relative flex flex-col justify-center items-center border border-zinc-900 bg-zinc-950/30 backdrop-blur-sm rounded-xl h-full p-4 overflow-hidden">
					<div className="absolute top-4 left-4 z-10 bg-zinc-950/90 p-3 rounded-xl border border-zinc-900 shadow-2xl max-w-[240px]">
						<p className="text-[9px] font-black tracking-widest text-zinc-500 uppercase border-b border-zinc-900 pb-1.5 mb-1.5">// DATOS DE TELEMETRÍA EN PISTA</p>
						<ul className="space-y-1 text-[10px] text-zinc-400">
							<li className="flex justify-between"><span className="font-bold text-zinc-500">Trazado Ideal:</span> <span className="text-emerald-500 font-black">Proyectado</span></li>
							<li className="flex justify-between"><span className="font-bold text-zinc-500">Vértices y Curvas:</span> <span className="text-zinc-200 font-black">Modo HUD Activo</span></li>
							<li className="flex justify-between"><span className="font-bold text-zinc-500">Boost PU 2026:</span> <span className="text-amber-500 font-black">Manual Override</span></li>
						</ul>
					</div>
					<div className="w-full h-full flex items-center justify-center relative">
						<Map />
					</div>
				</div>
			</div>
		</div>
	);
}

const SkeletonDriver = () => (
	<div className="grid place-items-center items-center gap-2 p-1.5 border border-zinc-900/40 rounded-xl" style={{ gridTemplateColumns: "5.5rem 4rem 5.5rem 1fr 5rem" }}>
		<div className="h-8 animate-pulse rounded-lg bg-zinc-900/60 w-full" />
		<div className="h-8 animate-pulse rounded-lg bg-zinc-900/60 w-90%" />
	</div>
);