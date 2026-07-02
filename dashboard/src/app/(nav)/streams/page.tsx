"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/useDataStore";
import { Calendar, ShieldAlert } from "lucide-react";

// 🏎️ CONFIGURACIÓN DE LOS 5 FEEDS SATELITALES
const STREAMS_CONFIG = {
	FOX: "https://stream-xhd.com/live1.php?stream=fox1ar",
	DISNEY: "https://stream-xhd.com/live1.php?stream=disney5",
	DAZN: "https://streamx996.one/global1.php?channel=daznf1",
	COLAPINTO: "https://streamx996.one/global2.php?stream=disney2",
	VERSTAPPEN: "https://streamx996.one/global2.php?stream=disney3",
	GENERAL: "https://streamtpday1.xyz/global2.php?stream=disney4",
};

export default function StreamsPage() {
	const [activeTab, setActiveTab] = useState<keyof typeof STREAMS_CONFIG>("FOX");
	// 🪄 ESTADO MÁGICO: Bypass secreto para saltar el bloqueo cuando vos quieras
	const [bypass, setBypass] = useState<boolean>(false);

	// Monitoreo del store de Zustand
	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const sessionInfo = useDataStore((state) => state.state?.SessionInfo);
	const activeRace = sessionInfo?.Meeting?.Name || "Gran Premio";

	// ⏳ LÓGICA DE CONTROL AUTOMÁTICO (30 min antes y después de cada sesión)
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

	// 🛑 CASO 1: MOTORES APAGADOS (Bóveda cerrada al público y bots)
	if (!isLive && !bypass) {
		return (
			<div className="pt-4 w-full mx-auto px-4 sm:px-6 font-mono text-white select-none h-[80vh] flex flex-col items-center justify-center">
				<div className="max-w-md w-full border border-zinc-900 bg-[#0c0a05]/20 backdrop-blur-md p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fade-in">
					
					<div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
						<ShieldAlert className="w-6 h-6" />
					</div>

					{/* 🤫 EL HUEVO DE PASCUA: Doble click exacto acá y saltás el bloqueo de horario */}
					<span 
						onDoubleClick={() => setBypass(true)}
						className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest animate-pulse mb-2 cursor-default active:opacity-50 select-none"
					>
						// FEED SATELITAL: INACTIVO
					</span>
					
					<h2 className="text-xl font-black uppercase tracking-tight text-zinc-200">
						MOTORES APAGADOS
					</h2>
					
					<p className="text-zinc-500 text-xs font-sans mt-3 leading-relaxed">
						La señal de video en vivo se habilita de forma automática <span className="text-zinc-300 font-bold">30 minutos antes</span> de la sesión y se interrumpe 30 minutos después de la bandera a cuadros.
					</p>

					<div className="w-full h-[1px] bg-zinc-900 my-5" />

					<Link 
						href="/schedule" 
						className="w-full inline-flex items-center justify-center gap-2 text-xs font-black bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-400 active:scale-95 transition-all py-3 rounded-xl uppercase tracking-wider"
					>
						<Calendar className="w-4 h-4" />
						<span>Consultar Horarios GP</span>
					</Link>
				</div>
			</div>
		);
	}

	// 🟢 CASO 2: CONEXIÓN ESTABLECIDA (Acción en pista o bypass activado)
	return (
		<div className="pt-4 w-full mx-auto px-4 sm:px-6 font-mono text-white select-none">
			
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

			{/* BOTONERA MULTICANAL CON LOGOS AGRANDADOS */}
			<div className="flex flex-wrap gap-2 mb-6">
				<button
					onClick={() => setActiveTab("FOX")}
					className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
						activeTab === "FOX"
							? "bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
							: "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800"
					}`}
				>
					<img src="/fox.jpg" alt="Fox" className="h-6 w-auto object-contain" />
					<span>Fox Sports</span>
				</button>

				<button
					onClick={() => setActiveTab("DISNEY")}
					className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
						activeTab === "DISNEY"
							? "bg-sky-500 text-black border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]"
							: "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800"
					}`}
				>
					<img src="/disney.png" alt="Disney" className="h-6 w-auto object-contain" />
					<span>Disney+</span>
				</button>

				<button
					onClick={() => setActiveTab("DAZN")}
					className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
						activeTab === "DAZN"
							? "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
							: "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800"
					}`}
				>
					<img src="/dazn.png" alt="DAZN" className="h-6 w-auto object-contain" />
					<span>DAZN F1</span>
				</button>

				<button
					onClick={() => setActiveTab("COLAPINTO")}
					className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
						activeTab === "COLAPINTO"
							? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse"
							: "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800"
					}`}
				>
					<img src="/colapinto.png" alt="Colapinto" className="h-6 w-auto object-contain rounded-sm" />
					<span>Onboard Colapinto #43</span>
				</button>

				<button
					onClick={() => setActiveTab("VERSTAPPEN")}
					className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
						activeTab === "VERSTAPPEN"
							? "bg-orange-500 text-black border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
							: "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800"
					}`}
				>
					<img src="/max.png" alt="Verstappen" className="h-6 w-auto object-contain" />
					<span>Onboard Max #1</span>
				</button>

				<button
					onClick={() => setActiveTab("GENERAL")}
					className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
						activeTab === "GENERAL"
							? "bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.2)]"
							: "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800"
					}`}
				>
					<img src="/onboard.png" alt="General" className="h-6 w-auto object-contain" />
					<span>Onboard General</span>
				</button>
			</div>

			{/* CONTENEDOR DEL IFRAME ELECTRÓNICO */}
			<div className="w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
				<iframe
					key={activeTab} // Resetea el iframe al cambiar de feed para optimizar memoria
					src={STREAMS_CONFIG[activeTab]}
					className="w-full h-full"
					allowFullScreen
					scrolling="no"
					allow="autoplay; encrypted-media; picture-in-picture"
				/>
			</div>

			{/* 🛡️ ALERTA DE BOXES: RECOMENDACIÓN DE BLOQUEADOR */}
			<div className="w-full max-w-5xl mx-auto mt-6 p-4 border border-amber-500/10 bg-amber-500/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-xs">
				<div className="space-y-1">
					<p className="font-mono font-black text-amber-400 uppercase tracking-wider">
						⚠️ ADVERTENCIA DE SEGURIDAD (PIT-WALL)
					</p>
					<p className="text-zinc-400 leading-relaxed">
						Para esquivar las redirecciones y pop-ups molestos de los servidores de origen, es indispensable que navegues usando protección activa en boxes.
					</p>
				</div>
				
				<div className="flex flex-wrap gap-2 shrink-0">
					<a 
						href="https://ublockorigin.com/" 
						target="_blank" 
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/30 text-zinc-300 hover:text-red-400 font-mono font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95"
					>
						🛡️ uBlock Origin
					</a>
					<a 
						href="https://brave.com/" 
						target="_blank" 
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-zinc-300 hover:text-orange-400 font-mono font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95"
					>
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