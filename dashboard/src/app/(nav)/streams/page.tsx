"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/useDataStore";
import { Calendar, Lock, Unlock } from "lucide-react";

// 🏎️ CONFIGURACIÓN DE LOS FEEDS SATELITALES
const STREAMS_CONFIG = {
	FOX: "https://streamx-hd.com/live1.php?stream=fox1ar",
	DISNEY: "https://streamx-hd.com/live1.php?stream=disney2",
	DAZN: "https://streamx-hd.com/live1.php?stream=daznf1",
	COLAPINTO: "https://streamx-hd.com/live1.php?stream=disney5",
	NORRIS: "https://streamx-hd.com/live1.php?stream=disney6",
	RACEHUB: "https://streamx-hd.com/live1.php?stream=disney3",
	GENERAL: "https://streamx-hd.com/live1.php?stream=disney4",
};

export default function StreamsPage() {
	const [activeTab, setActiveTab] = useState<keyof typeof STREAMS_CONFIG>("FOX");
	const [bypass, setBypass] = useState<boolean>(false);
	const [clickCount, setClickCount] = useState<number>(0);
	const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

	// Monitoreo del store de Zustand
	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const sessionInfo = useDataStore((state) => state.state?.SessionInfo);
	const activeRace = sessionInfo?.Meeting?.Name || "Gran Premio";

	// ⏳ LÓGICA DE CONTROL AUTOMÁTICO
	const checkTimeWindow = (): boolean => {
		if (trackStatus && parseInt(trackStatus, 10) > 0) {
			return true;
		}

		if (!sessionInfo?.StartDate || !sessionInfo?.EndDate) {
			return false;
		}

		const now = Date.now();
		const startTime = new Date(sessionInfo.StartDate).getTime();
		const endTime = new Date(sessionInfo.EndDate).getTime();
		const THIRTY_MINUTES = 1800000; 

		const isInsideWindow = now >= (startTime - THIRTY_MINUTES) && now <= (endTime + THIRTY_MINUTES);
		return isInsideWindow;
	};

	const isLive = checkTimeWindow();

	// 🛑 CASO 1: MOTORES APAGADOS (Bóveda con Candado Interactivo)
	if (!isLive && !bypass) {
		const handleSecretClick = () => {
			setClickCount((prev) => {
				const nextCount = prev + 1;
				if (nextCount >= 3) {
					setIsUnlocking(true);
					setTimeout(() => {
						setBypass(true);
						setIsUnlocking(false);
					}, 600);
					return 0;
				}
				setTimeout(() => setClickCount(0), 1000);
				return nextCount;
			});
		};

		return (
			<div className="pt-4 w-full mx-auto px-4 sm:px-6 font-mono text-white select-none h-[80vh] flex flex-col items-center justify-center">
				<div className="max-w-md w-full border border-zinc-900 bg-[#0c0a05]/20 backdrop-blur-md p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fade-in">
					
					<div 
						onClick={handleSecretClick}
						className={`w-14 h-14 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all duration-300 cursor-pointer active:scale-95 group ${
							isUnlocking 
								? "border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-110 rotate-[360deg]" 
								: "border-amber-500/20 hover:border-amber-500/50 text-amber-500/70 hover:text-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
						}`}
						title="Forzar Enlace Satelital"
					>
						{isUnlocking ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6 group-hover:scale-110 duration-300" />}
					</div>

					<span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-2">
						// FEED SATELITAL: INACTIVO
					</span>
					
					<h2 className="text-xl font-black uppercase tracking-tight text-zinc-200">
						MOTORES APAGADOS
					</h2>
					
					<p className="text-zinc-500 text-xs font-sans mt-3 leading-relaxed">
						La señal de video en vivo se habilita automáticamente <span className="text-zinc-300 font-bold">30 minutos antes</span> de la sesión.
						Si experimentás desincronización horaria, podés <span className="text-amber-500/80 font-bold">forzar el enlace satelital tocando 3 veces el candado central</span>.
					</p>
				</div>
			</div>
		);
	}

	// 🟢 CASO 2: CONEXIÓN ESTABLECIDA (Acción en pista o bypass activado)
	return (
		<div className="pt-4 w-full mx-auto px-4 sm:px-6 font-mono text-white select-none max-w-7xl">
			
			{/* CABECERA HUD */}
			<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4">
				<div>
					<h1 className="text-3xl font-extrabold uppercase tracking-wider text-zinc-100 border-l-4 border-emerald-500 pl-3">
						Transmisiones en Vivo
					</h1>
					<p className="text-zinc-500 text-sm mt-1">
						{bypass ? "// ACCESO MAGICO ACTIVADO FORZOSO" : `// FEED EMITIDO PARA: ${activeRace}`}
					</p>
				</div>

				<Link 
					href="/dashboard" 
					className="inline-flex items-center gap-2 text-xs font-black bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 active:scale-95 transition-all px-4 py-2 rounded-xl uppercase tracking-wider"
				>
					<span>Muro de Telemetría</span>
					<span>📊</span>
				</Link>
			</div>

			{/* 📺 REPRODUCTOR XL */}
			<div className="w-full mx-auto aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-black/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative mb-8">
				<iframe
					key={activeTab}
					src={STREAMS_CONFIG[activeTab]}
					className="w-full h-full"
					allowFullScreen
					scrolling="no"
					allow="autoplay; encrypted-media; picture-in-picture"
				/>
			</div>

			{/* 🎛️ TABLERO DE CONTROL MULTICANAL (DISEÑO GRID CON LOGOS MASIVOS h-12 / h-14) */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
				
				{/* FOX SPORTS */}
				<button
					onClick={() => setActiveTab("FOX")}
					className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 active:scale-95 gap-3 h-32 ${
						activeTab === "FOX"
							? "bg-transparent-500 text-white border-blue-400 shadow-[0_10px_25px_rgba(14,165,233,0.25)] animate-pulse"
							: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-blue-800 hover:bg-zinc-900/40"
					}`}
				>
					<img src="/fox.png" alt="Fox" className="h-14 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Fox Sports AR</span>
				</button>

				{/* DISNEY+ */}
				<button
					onClick={() => setActiveTab("DISNEY")}
					className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 active:scale-95 gap-3 h-32 ${
						activeTab === "DISNEY"
							? "bg-transparent-500 text-white border-cyan-400 shadow-[0_10px_25px_rgba(14,165,233,0.25)] animate-pulse"
							: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-cyan-800 hover:bg-zinc-900/40"
					}`}
				>
					<img src="/disney.png" alt="Disney" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Disney +</span>
				</button>

				{/* DAZN F1 */}
				<button
					onClick={() => setActiveTab("DAZN")}
					className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 active:scale-95 gap-3 h-32 ${
						activeTab === "DAZN"
							? "bg-transparent-600 text-white border-red-500 shadow-[0_10px_25px_rgba(220,38,38,0.3)] animate-pulse"
							: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-red-800 hover:bg-zinc-900/40"
					}`}
				>
					<img src="/dazn.png" alt="DAZN" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">DAZN F1</span>
				</button>

				{/* ONBOARD COLAPINTO */}
				<button
					onClick={() => setActiveTab("COLAPINTO")}
					className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 active:scale-95 gap-3 h-32 ${
						activeTab === "COLAPINTO"
							? "bg-transparent text-white border-pink-400 shadow-[0_10px_25px_rgba(244,63,94,0.3)] animate-pulse"
							: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-pink-800 hover:bg-zinc-900/40"
					}`}
				>
					<img src="/colapinto.png" alt="Colapinto" className="h-12 w-auto max-w-[85%] object-contain rounded-sm" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Onboard Colapinto</span>
				</button>

				{/* ONBOARD NORRIS */}
				<button
					onClick={() => setActiveTab("NORRIS")}
					className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 active:scale-95 gap-3 h-32 ${
						activeTab === "NORRIS"
							? "bg-transparent text-white border-orange-400 shadow-[0_10px_25px_rgba(249,115,22,0.3)] animate-pulse"
							: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-orange-800 hover:bg-zinc-900/40"
					}`}
				>
					<img src="/norris.png" alt="Norris" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Onboard Norris</span>
				</button>

				{/* RACEHUB */}
				<button
					onClick={() => setActiveTab("RACEHUB")}
					className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 active:scale-95 gap-3 h-32 ${
						activeTab === "RACEHUB"
							? "bg-transparent text-white border-blue-500 shadow-[0_10px_25px_rgba(37,99,235,0.3)] animate-pulse"
							: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-blue-800 hover:bg-zinc-900/40"
					}`}
				>
					<img src="/racehub.png" alt="RaceHub" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">RaceHub General</span>
				</button>

				{/* ONBOARD GENERAL */}
				<button
					onClick={() => setActiveTab("GENERAL")}
					className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 active:scale-95 gap-3 h-32 ${
						activeTab === "GENERAL"
							? "bg-transparent text-white border-purple-500 shadow-[0_10px_25px_rgba(147,51,234,0.3)] animate-pulse"
							: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-purple-800 hover:bg-zinc-900/40"
					}`}
				>
					<img src="/onboard.png" alt="General" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Onboard General</span>
				</button>
			</div>

			{/* 🛡️ ALERTA DE BOXES */}
			<div className="w-full mx-auto p-4 border border-amber-500/10 bg-amber-500/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-xs">
				<div className="space-y-1">
					<p className="font-mono font-black text-amber-400 uppercase tracking-wider">
						⚠️ ADVERTENCIA DE SEGURIDAD (PIT-WALL)
					</p>
					<p className="text-zinc-400 leading-relaxed">
						Para esquivar los anuncios y pop-ups molestos de los servidores de origen, es indispensable que navegues usando protección activa.
					</p>
				</div>
				
				<div className="flex flex-wrap gap-2 shrink-0">
					<a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/30 text-zinc-300 hover:text-red-400 font-mono font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95">
						🛡️ uBlock Origin
					</a>
					<a href="https://brave.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-zinc-300 hover:text-orange-400 font-mono font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95">
						🦁 Navegador Brave
					</a>
				</div>
			</div>

			<p className="text-[10px] text-zinc-600 text-center mt-4 max-w-xl mx-auto italic font-mono">
				Aviso de Muro: Si un feed pierde cuadros o se traba debido a la carga del servidor externo, cambiá de pestaña o refrescá la URL.
			</p>
		</div>
	);
}