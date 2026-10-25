"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Tv, Zap, ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";

export function TvSyncControl() {
	const delay = useSettingsStore((s) => s.delay);
	const setDelay = useSettingsStore((s) => s.setDelay);
	const isPaused = useSettingsStore((s) => s.delayIsPaused);

	const [isExpanded, setIsExpanded] = useState(false);

	const adjustDelay = (delta: number) => {
		const next = Math.max(0, delay + delta);
		setDelay(next);
	};

	const PRESETS = [
		{ label: "En Vivo", seconds: 0, icon: Zap, desc: "Telemetría pura sin retraso" },
		{ label: "Disney+ / F1TV", seconds: 35, icon: Tv, desc: "~35 seg de retraso de transmisión" },
		{ label: "Fox Sports / TV", seconds: 45, icon: Tv, desc: "~45 seg de retraso en cable" },
	];

	return (
		<div className="relative">
			{/* Botón trigger compacto */}
			<div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 p-1 text-xs">
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="flex items-center gap-1.5 px-2 py-1 text-zinc-300 hover:text-white transition-colors"
					title="Sincronizar telemetría con transmisión de TV"
				>
					<Tv className="h-3.5 w-3.5 text-amber-400" />
					<span className="font-semibold">
						{delay === 0 ? "En Vivo (0s)" : `TV Sync: +${delay}s`}
					</span>
					{isExpanded ? (
						<ChevronUp className="h-3 w-3 text-zinc-500" />
					) : (
						<ChevronDown className="h-3 w-3 text-zinc-500" />
					)}
				</button>

				{/* Botones de ajuste rápido paso a paso +/- 1s */}
				<div className="flex items-center border-l border-zinc-800 pl-1 gap-0.5">
					<button
						type="button"
						onClick={() => adjustDelay(-1)}
						disabled={delay <= 0 || isPaused}
						className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent"
						title="-1 segundo"
					>
						<Minus className="h-3 w-3" />
					</button>
					<button
						type="button"
						onClick={() => adjustDelay(1)}
						disabled={isPaused}
						className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent"
						title="+1 segundo"
					>
						<Plus className="h-3 w-3" />
					</button>
				</div>
			</div>

			{/* Panel desplegable con presets */}
			{isExpanded && (
				<div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl">
					<div className="mb-2 flex items-center justify-between border-b border-zinc-800/80 pb-2">
						<span className="text-xs font-bold uppercase tracking-wider text-amber-400">
							Sincronizar con la TV
						</span>
						<span className="text-[10px] text-zinc-500">Anti-spoiler</span>
					</div>

					<p className="mb-3 text-[11px] text-zinc-400 leading-relaxed">
						La telemetría llega antes que la señal de TV. Elegí tu plataforma para sincronizar los tiempos con tu pantalla:
					</p>

					{/* Presets */}
					<div className="flex flex-col gap-1.5 mb-3">
						{PRESETS.map((preset) => {
							const Icon = preset.icon;
							const isActive = delay === preset.seconds;
							return (
								<button
									key={preset.label}
									type="button"
									onClick={() => {
										setDelay(preset.seconds);
										setIsExpanded(false);
									}}
									className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${
										isActive
											? "border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold"
											: "border-zinc-800/60 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50"
									}`}
								>
									<div className="flex items-center gap-2">
										<Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
										<div>
											<div className="text-xs">{preset.label}</div>
											<div className="text-[10px] text-zinc-500">{preset.desc}</div>
										</div>
									</div>
									<span className="text-xs font-mono font-bold">
										{preset.seconds === 0 ? "0s" : `+${preset.seconds}s`}
									</span>
								</button>
							);
						})}
					</div>

					{/* Ajuste fino (+/- 5s, +/- 1s) */}
					<div className="border-t border-zinc-800/80 pt-2">
						<div className="mb-1 text-[10px] font-semibold text-zinc-400 uppercase">
							Ajuste fino de segundos:
						</div>
						<div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
							<button
								type="button"
								onClick={() => adjustDelay(-5)}
								disabled={delay <= 0}
								className="rounded bg-zinc-900 border border-zinc-800 py-1 hover:bg-zinc-800 disabled:opacity-30"
							>
								-5s
							</button>
							<button
								type="button"
								onClick={() => adjustDelay(-1)}
								disabled={delay <= 0}
								className="rounded bg-zinc-900 border border-zinc-800 py-1 hover:bg-zinc-800 disabled:opacity-30"
							>
								-1s
							</button>
							<button
								type="button"
								onClick={() => adjustDelay(1)}
								className="rounded bg-zinc-900 border border-zinc-800 py-1 hover:bg-zinc-800"
							>
								+1s
							</button>
							<button
								type="button"
								onClick={() => adjustDelay(5)}
								className="rounded bg-zinc-900 border border-zinc-800 py-1 hover:bg-zinc-800"
							>
								+5s
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
