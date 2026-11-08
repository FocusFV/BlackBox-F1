"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { simulator } from "@/lib/simulatorFeed";
import {
	SlidersHorizontal,
	ChevronDown,
	ChevronUp,
	Flag,
	Radio,
	Sparkles,
	RotateCcw,
	Volume2,
	AlertTriangle,
	Eye,
	Check,
} from "lucide-react";
import WavingFlag from "@/components/ui/WavingFlag";

export type DevViewMode = "auto" | "telemetry" | "parc_ferme";

type Props = {
	mode: DevViewMode;
	onModeChange: (mode: DevViewMode) => void;
};

export function LocalDevSwitch({ mode, onModeChange }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLocal, setIsLocal] = useState(false);

	useEffect(() => {
		// 🔒 EXCLUSIVIDAD LOCAL ABSOLUTA:
		// En producción (Vercel) process.env.NODE_ENV === "production" y el hostname es público.
		// Este componente NUNCA se renderiza en producción ni nadie externo puede verlo.
		const localCheck =
			process.env.NODE_ENV === "development" ||
			(typeof window !== "undefined" &&
				(window.location.hostname === "localhost" ||
					window.location.hostname === "127.0.0.1" ||
					window.location.hostname.endsWith(".local")));

		setIsLocal(localCheck);
	}, []);

	if (!isLocal) {
		return null;
	}

	// 🏁 Disparar Bandera a Cuadros y Final de Carrera (animación de victoria y bandera ondeante)
	const triggerChequeredFlag = () => {
		const now = new Date().toISOString();
		const currentMsgs = useDataStore.getState().state?.RaceControlMessages?.Messages || [];
		const currentLines = useDataStore.getState().state?.TimingData?.Lines;

		// Marcar primeros 5 autos como finalizados (META)
		let updatedLines = currentLines ? { ...currentLines } : undefined;
		if (updatedLines) {
			["4", "1", "16", "81", "44"].forEach((nr) => {
				if (updatedLines && updatedLines[nr]) {
					(updatedLines[nr] as any).NumberOfLaps = 71;
					(updatedLines[nr] as any).ShowPosition = true;
				}
			});
		}

		const existingTiming = useDataStore.getState().state?.TimingData;
		const timingDataPayload: any = updatedLines && existingTiming
			? { ...existingTiming, Lines: updatedLines }
			: existingTiming;

		useDataStore.getState().setState({
			LapCount: { CurrentLap: 71, TotalLaps: 71 },
			TrackStatus: { Status: "1", Message: "AllClear" },
			TimingData: timingDataPayload,
			RaceControlMessages: {
				Messages: [
					...currentMsgs,
					{
						Utc: now,
						Lap: 71,
						Flag: "CHEQUERED",
						Message: "CHEQUERED FLAG",
						Category: "Flag",
						Scope: "Track",
					},
				],
			},
		});
	};

	// 🟢 Disparar Bandera Verde / Largada
	const triggerGreenFlag = () => {
		const now = new Date().toISOString();
		const currentMsgs = useDataStore.getState().state?.RaceControlMessages?.Messages || [];

		useDataStore.getState().setState({
			TrackStatus: { Status: "1", Message: "AllClear" },
			RaceControlMessages: {
				Messages: [
					...currentMsgs,
					{
						Utc: now,
						Lap: 1,
						Flag: "GREEN",
						Message: "GREEN LIGHT - PIT LANE OPEN",
						Category: "Flag",
						Scope: "Track",
					},
				],
			},
		});
	};

	// 🏎️ Probar Traducción de Lance Stroll (evitar "Paseo")
	const triggerStrollMessage = () => {
		const now = new Date().toISOString();
		const currentMsgs = useDataStore.getState().state?.RaceControlMessages?.Messages || [];

		useDataStore.getState().setState({
			RaceControlMessages: {
				Messages: [
					...currentMsgs,
					{
						Utc: now,
						Lap: 29,
						Flag: "CLEAR",
						Message:
							"FIA STEWARDS: TURN 4 INCIDENT INVOLVING CARS 18 (STR) AND 27 (HUL) NOTED - CAUSING A COLLISION",
						Category: "Incident",
						Scope: "Track",
					},
				],
			},
		});
	};

	// 🔄 Reiniciar Simulación Local
	const resetSimulation = () => {
		simulator.stop();
		setTimeout(() => {
			simulator.start();
		}, 200);
	};

	return (
		<div className="fixed bottom-4 right-4 z-50 font-mono select-none">
			{/* Botón flotante o panel desplegado */}
			{!isOpen ? (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-black/90 px-3 py-2 text-xs font-bold text-amber-400 shadow-2xl backdrop-blur-xl hover:border-amber-400 hover:text-amber-300 transition-all cursor-pointer group"
					title="Panel de Control Local (Solo visible en tu entorno local)"
				>
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
						<span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
					</span>
					<SlidersHorizontal className="h-3.5 w-3.5" />
					<span className="text-[11px] uppercase tracking-wider">
						DEV: {mode === "telemetry" ? "📡 Telemetría" : mode === "parc_ferme" ? "🏁 Parque Cerrado" : "⚙️ Auto"}
					</span>
					<ChevronUp className="h-3 w-3 opacity-60 group-hover:translate-y-[-1px] transition-transform" />
				</button>
			) : (
				<div className="flex w-80 flex-col gap-3 rounded-2xl border border-amber-500/50 bg-zinc-950/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-2xl">
					{/* Cabecera del Panel */}
					<div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
						<div className="flex items-center gap-2">
							<span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400">
								SOLO LOCAL
							</span>
							<h4 className="text-xs font-black uppercase tracking-wide text-zinc-100">
								Switch de Vista & Test
							</h4>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
						>
							<ChevronDown className="h-4 w-4" />
						</button>
					</div>

					{/* Selector de Pantalla Principal (Parque Cerrado / Telemetría) */}
					<div className="flex flex-col gap-1.5">
						<span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
							Modo de Pantalla:
						</span>
						<div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
							<button
								type="button"
								onClick={() => onModeChange("parc_ferme")}
								className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-[10px] font-black uppercase transition-all ${
									mode === "parc_ferme"
										? "bg-amber-500 text-black shadow-md font-black"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								<span>🏁 Cerrado</span>
							</button>

							<button
								type="button"
								onClick={() => onModeChange("telemetry")}
								className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-[10px] font-black uppercase transition-all ${
									mode === "telemetry"
										? "bg-emerald-500 text-black shadow-md font-black"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								<span>📡 Telemetría</span>
							</button>

							<button
								type="button"
								onClick={() => onModeChange("auto")}
								className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-[10px] font-black uppercase transition-all ${
									mode === "auto"
										? "bg-zinc-700 text-white shadow-md font-black"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								<span>⚙️ Auto</span>
							</button>
						</div>
					</div>

					{/* Pruebas de Banderas y Traducción */}
					<div className="flex flex-col gap-1.5 pt-1">
						<span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
							Pruebas Rápidas de Animaciones:
						</span>

						<div className="flex flex-col gap-1.5">
							<button
								type="button"
								onClick={triggerChequeredFlag}
								className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
							>
								<div className="flex items-center gap-2">
									<WavingFlag type="chequered" size="xs" />
									<span>Probar Bandera a Cuadros</span>
								</div>
								<span className="text-[9px] uppercase tracking-widest text-amber-400/80">Banner + VIP</span>
							</button>

							<button
								type="button"
								onClick={triggerGreenFlag}
								className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
							>
								<div className="flex items-center gap-2">
									<WavingFlag type="green" size="xs" />
									<span>Probar Bandera Verde (Largada)</span>
								</div>
								<span className="text-[9px] uppercase tracking-widest text-emerald-400/80">Banner</span>
							</button>

							<button
								type="button"
								onClick={triggerStrollMessage}
								className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/80 px-2.5 py-1.5 text-[11px] font-bold text-zinc-200 hover:border-zinc-500 hover:text-white transition-all cursor-pointer"
							>
								<div className="flex items-center gap-2">
									<span>🏎️</span>
									<span>Probar Lance Stroll (Sin Paseo)</span>
								</div>
								<span className="text-[9px] uppercase tracking-widest text-zinc-400">Comisarios</span>
							</button>
						</div>
					</div>

					{/* Pie con botón de reset */}
					<div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-500">
						<span>Inaccesible en Vercel</span>
						<button
							type="button"
							onClick={resetSimulation}
							className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
						>
							<RotateCcw className="h-3 w-3" />
							<span>Reiniciar Sim</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
