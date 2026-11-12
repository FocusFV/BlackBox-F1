"use client";

import React, { useEffect, useState } from "react";
import { simulator } from "@/lib/simulatorFeed";
import { useDataStore } from "@/stores/useDataStore";
import { triggerHaptic } from "@/lib/haptics";
import {
	Radio,
	Zap,
	AlertTriangle,
	Play,
	Flag,
	X,
	ChevronDown,
	ChevronUp,
	RotateCcw,
	Activity,
} from "lucide-react";

export default function SecretSimulationHUD() {
	const [isActive, setIsActive] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [flagToggle, setFlagToggle] = useState<"1" | "6">("1");

	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status) || "1";
	const currentLap = useDataStore((state) => state.state?.LapCount?.CurrentLap) || 28;
	const totalLaps = useDataStore((state) => state.state?.LapCount?.TotalLaps) || 53;

	useEffect(() => {
		if (typeof window === "undefined") return;

		const params = new URLSearchParams(window.location.search);
		const testParam = params.get("test_mode") || params.get("token");
		const secretToken = process.env.NEXT_PUBLIC_SIMULATION_TOKEN || "sim_sec_9f7a8b3e2c1d04_pitwall2026";

		// 🛡️ Activar ÚNICAMENTE si coincide exactamente con el token largo
		const isAuthorized = Boolean(
			secretToken &&
			secretToken.length >= 16 &&
			testParam === secretToken
		);

		if (isAuthorized) {
			sessionStorage.setItem("f1_pitwall_sim", "active");
			setIsActive(true);
			if (!simulator.getActive()) {
				simulator.start();
			}
			// Limpiar la URL sin recargar para no exponer el token en la barra de direcciones
			const cleanUrl = window.location.pathname;
			window.history.replaceState({}, "", cleanUrl);
			triggerHaptic("heavy");
		} else if (testParam === "stop" || testParam === "off" || testParam === "exit") {
			sessionStorage.removeItem("f1_pitwall_sim");
			sessionStorage.removeItem("f1_sim_lap");
			sessionStorage.removeItem("f1_sim_tick");
			sessionStorage.removeItem("f1_sim_order");
			sessionStorage.removeItem("f1_sim_status");
			sessionStorage.removeItem("f1_sim_intervals");
			sessionStorage.removeItem("f1_sim_progress");
			setIsActive(false);
			simulator.stop();
			useDataStore.getState().resetSession();
			const cleanUrl = window.location.pathname;
			window.history.replaceState({}, "", cleanUrl);
			triggerHaptic("medium");
		} else if (sessionStorage.getItem("f1_pitwall_sim") === "active") {
			setIsActive(true);
			if (!simulator.getActive()) {
				simulator.start();
			}
		}
	}, []);

	const handleStop = () => {
		triggerHaptic("heavy");
		sessionStorage.removeItem("f1_pitwall_sim");
		sessionStorage.removeItem("f1_sim_lap");
		sessionStorage.removeItem("f1_sim_tick");
		sessionStorage.removeItem("f1_sim_order");
		sessionStorage.removeItem("f1_sim_status");
		sessionStorage.removeItem("f1_sim_intervals");
		sessionStorage.removeItem("f1_sim_progress");
		setIsActive(false);
		simulator.stop();
		useDataStore.getState().resetSession();
		window.location.href = "/dashboard";
	};

	const handleOvertake = () => {
		triggerHaptic("medium");
		simulator.triggerOvertake();
	};

	const handleToggleFlag = () => {
		triggerHaptic("medium");
		const nextFlag = trackStatus === "1" ? "6" : "1";
		setFlagToggle(nextFlag);
		simulator.triggerFlag(nextFlag);
	};

	const handleRadio = () => {
		triggerHaptic("light");
		const drivers = ["43", "44", "1", "4"];
		const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
		simulator.triggerRadio(randomDriver);
	};

	const handleNextLap = () => {
		triggerHaptic("light");
		simulator.triggerLapIncrement();
	};

	if (!isActive) return null;

	const getStatusBadge = () => {
		if (trackStatus === "1") {
			return (
				<span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase font-mono">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
					🟢 BANDERA VERDE
				</span>
			);
		}
		if (trackStatus === "2") {
			return (
				<span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase font-mono">
					<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
					🟡 AMARILLA (S2)
				</span>
			);
		}
		return (
			<span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/60 text-[10px] font-black uppercase font-mono">
				<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
				⚠️ VSC ACTIVO
			</span>
		);
	};

	return (
		<div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto select-none font-mono">
			{isCollapsed ? (
				/* BOTÓN FLOTANTE MINIMIZADO PARA MÓVIL */
				<div className="flex justify-end p-2 pr-3">
					<button
						onClick={() => setIsCollapsed(false)}
						className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/90 border border-red-500/50 text-white shadow-2xl backdrop-blur-md text-[11px] font-black cursor-pointer hover:bg-red-900 transition-all"
					>
						<span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
						<span>SIMULACIÓN FIA (V{currentLap})</span>
						<ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
					</button>
				</div>
			) : (
				/* BARRA DE CONTROL COMPLETA */
				<div className="w-full bg-zinc-950/95 border-b border-red-500/50 backdrop-blur-xl shadow-2xl px-3 sm:px-4 py-2 transition-all">
					<div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
						
						{/* LADO IZQUIERDO: ESTADO Y VUELTAS */}
						<div className="flex items-center gap-2.5">
							<span className="relative flex h-2.5 w-2.5">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
								<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
							</span>

							<div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
								<span className="text-[11px] sm:text-xs font-black tracking-wider text-red-400 uppercase">
									SIMULACIÓN FIA EN VIVO
								</span>
								<span className="hidden sm:inline text-zinc-600">•</span>
								<span className="text-[10px] sm:text-[11px] font-bold text-zinc-300">
									MÉXICO GP · VUELTA {currentLap}/{totalLaps}
								</span>
							</div>

							{getStatusBadge()}
						</div>

						{/* CENTRO: BOTONES RÁPIDOS DE PRUEBA */}
						<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
							<button
								onClick={handleOvertake}
								title="Simular un sobrepaso en pista y cartel de Dirección de Carrera"
								className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/80 hover:border-amber-400 text-zinc-200 hover:text-amber-300 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95"
							>
								<Zap className="w-3 h-3 text-amber-400" />
								<span>Sobrepaso</span>
							</button>

							<button
								onClick={handleToggleFlag}
								title="Alternar entre Bandera Verde y Virtual Safety Car (VSC)"
								className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/80 hover:border-amber-400 text-zinc-200 hover:text-amber-300 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95"
							>
								<AlertTriangle className="w-3 h-3 text-yellow-400" />
								<span>{trackStatus === "1" ? "Forzar VSC" : "Forzar Verde"}</span>
							</button>

							<button
								onClick={handleRadio}
								title="Simular entrada de radio de equipo (Colapinto, Hamilton, Verstappen)"
								className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/80 hover:border-cyan-400 text-zinc-200 hover:text-cyan-300 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95"
							>
								<Radio className="w-3 h-3 text-cyan-400" />
								<span>Radio</span>
							</button>

							<button
								onClick={handleNextLap}
								title="Avanzar 1 vuelta de carrera"
								className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 text-zinc-300 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer active:scale-95"
							>
								<RotateCcw className="w-3 h-3 text-zinc-400" />
								<span>+1 Vta</span>
							</button>
						</div>

						{/* LADO DERECHO: MINIMIZAR Y DETENER */}
						<div className="flex items-center gap-1.5 ml-auto sm:ml-0">
							<button
								onClick={() => setIsCollapsed(true)}
								className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
								title="Minimizar barra"
							>
								<ChevronUp className="w-3.5 h-3.5" />
							</button>

							<button
								onClick={handleStop}
								className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600/90 hover:bg-red-600 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider transition-all shadow-md shadow-red-950/50 cursor-pointer active:scale-95"
							>
								<X className="w-3.5 h-3.5" />
								<span>Detener</span>
							</button>
						</div>

					</div>
				</div>
			)}
		</div>
	);
}
