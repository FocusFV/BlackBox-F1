"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/useDataStore";
import { Lock, Unlock } from "lucide-react";
// 🔌 Descomentá estas líneas cuando enganches la base de datos de tu app:
// import { ref, onValue } from "firebase/database";
// import { db } from "@/lib/firebase"; 

// 🏎️ DICCIONARIO DE ESTILOS FOCUSFV PARA ONBOARDS DINÁMICOS
const PILOTOS_CONFIG: Record<string, { name: string; border: string; shadow: string; logo: string }> = {
	// Mercedes
	RUS: { name: "Onboard Russell", border: "border-cyan-400 hover:border-cyan-500", shadow: "shadow-[0_10px_25px_rgba(34,211,238,0.25)]", logo: "/mercedes.png" },
	ANT: { name: "Onboard Antonelli", border: "border-cyan-400 hover:border-cyan-500", shadow: "shadow-[0_10px_25px_rgba(34,211,238,0.25)]", logo: "/mercedes.png" },
	
	// Ferrari
	LEC: { name: "Onboard Leclerc", border: "border-red-500 hover:border-red-600", shadow: "shadow-[0_10px_25px_rgba(220,38,38,0.25)]", logo: "/ferrari.png" },
	HAM: { name: "Onboard Hamilton", border: "border-red-500 hover:border-red-600", shadow: "shadow-[0_10px_25px_rgba(220,38,38,0.25)]", logo: "/ferrari.png" },
	
	// Red Bull Racing
	VER: { name: "Onboard Verstappen", border: "border-blue-500 hover:border-blue-600", shadow: "shadow-[0_10px_25px_rgba(37,99,235,0.25)]", logo: "/redbull.png" },
	
	// McLaren
	NOR: { name: "Onboard Norris", border: "border-orange-400 hover:border-orange-500", shadow: "shadow-[0_10px_25px_rgba(249,115,22,0.25)]", logo: "/norris.png" },
	PIA: { name: "Onboard Piastri", border: "border-orange-400 hover:border-orange-500", shadow: "shadow-[0_10px_25px_rgba(249,115,22,0.25)]", logo: "/norris.png" },
	
	// Aston Martin
	ALO: { name: "Onboard Alonso", border: "border-emerald-600 hover:border-emerald-700", shadow: "shadow-[0_10px_25px_rgba(5,150,105,0.25)]", logo: "/aston.png" },
	
	// Williams
	SAI: { name: "Onboard Sainz", border: "border-blue-600 hover:border-blue-700", shadow: "shadow-[0_10px_25px_rgba(29,78,216,0.25)]", logo: "/williams.png" },
};

export default function StreamsPage() {
	const [bypass, setBypass] = useState<boolean>(false);
	const [clickCount, setClickCount] = useState<number>(0);
	const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

	// 📱 CONTROL REMOTO DESDE RENDER: Sincroniza los pilotos mutables
	const [firebaseStreams, setFirebaseStreams] = useState({
		disney7: "RUS", // Backup por si falla la red
		disney8: "HAM"  
	});

	// Conexión directa con tu API de Rust en Render
	useEffect(() => {
		// 🏎️ Cambiá "tu-app-rust" por el subdominio real que te da Render para BlackBox-F1
		fetch("https://blackbox-f1.onrender.com/api/streams-config")
			.then((res) => {
				if (!res.ok) throw new Error("Error en la respuesta del pit-wall");
				return res.json();
			})
			.then((data) => {
				if (data && data.disney7 && data.disney8) {
					setFirebaseStreams(data);
				}
			})
			.catch((err) => console.error("⚠️ Error leyendo telemetría desde Render:", err));
	}, []);

	// 🏎️ PARRILLA COMPLETA DE IFRAMES (Tus 7 fijos + los 2 mutables nuevos)
	const STREAMS_CONFIG = {
		FOX: "https://streamx-hd.com/live1.php?stream=fox1ar",
		DISNEY: "https://streamx-hd.com/live1.php?stream=disney2",
		DAZN: "https://streamx-hd.com/live1.php?stream=daznf1",
		COLAPINTO: "https://streamx-hd.com/live1.php?stream=disney5",
		NORRIS: "https://streamx-hd.com/live1.php?stream=disney6",
		RACEHUB: "https://streamx-hd.com/live1.php?stream=disney3",
		GENERAL: "https://streamx-hd.com/live1.php?stream=disney4",
		DISNEY7: "https://streamx-hd.com/live1.php?stream=disney7",   // Slot Mutable 1
		DISNEY8: "https://streamx-hd.com/live1.php?stream=disney8",   // Slot Mutable 2
	};

	const [activeTab, setActiveTab] = useState<keyof typeof STREAMS_CONFIG>("FOX");

	// Conexión en tiempo real con Firebase
	useEffect(() => {
		// 🔌 Descomentá esto cuando lo tengas subido:
		// const streamRef = ref(db, "live_onboards");
		// return onValue(streamRef, (snapshot) => {
		// 	const data = snapshot.val();
		// 	if (data) setFirebaseStreams(data);
		// });
	}, []);

	// Monitoreo del store de Zustand
	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const sessionInfo = useDataStore((state) => state.state?.SessionInfo);
	const activeRace = sessionInfo?.Meeting?.Name || "Gran Premio";

	const checkTimeWindow = (): boolean => {
		if (trackStatus && parseInt(trackStatus, 10) > 0) return true;
		if (!sessionInfo?.StartDate || !sessionInfo?.EndDate) return false;

		const now = Date.now();
		const startTime = new Date(sessionInfo.StartDate).getTime();
		const endTime = new Date(sessionInfo.EndDate).getTime();
		const THIRTY_MINUTES = 1800000; 

		return now >= (startTime - THIRTY_MINUTES) && now <= (endTime + THIRTY_MINUTES);
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
						className={`w-14 h-14 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border flex items-center justify-center mb-6 transition-all duration-300 cursor-pointer active:scale-95 group ${
							isUnlocking 
								? "border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-110 rotate-[360deg]" 
								: "border-amber-500/20 hover:border-amber-500/50 text-amber-500/70 hover:text-amber-400"
						}`}
					>
						{isUnlocking ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6 group-hover:scale-110 duration-300" />}
					</div>
					<span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-2">// FEED SATELITAL: INACTIVO</span>
					<h2 className="text-xl font-black uppercase tracking-tight text-zinc-200">MOTORES APAGADOS</h2>
					<p className="text-zinc-500 text-xs font-sans mt-3 leading-relaxed">
						La señal de video en vivo se habilita automáticamente <span className="text-zinc-300 font-bold">30 minutes antes</span> de la sesión.
					</p>
				</div>
			</div>
		);
	}

	// 🟢 CASO 2: CONEXIÓN ESTABLECIDA (Acción en pista)
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
					<span>Muro de Telemetría</span> 📊
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

			{/* 🎛️ TABLERO DE CONTROL MULTICANAL (DISEÑO AJUSTADO A 9 BOTONES) */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
				
				{/* FOX SPORTS */}
				<button onClick={() => setActiveTab("FOX")} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${activeTab === "FOX" ? "text-white border-blue-400 shadow-[0_10px_25px_rgba(14,165,233,0.25)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-blue-800"}`}>
					<img src="/fox.png" alt="Fox" className="h-14 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Fox Sports AR</span>
				</button>

				{/* DISNEY+ */}
				<button onClick={() => setActiveTab("DISNEY")} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${activeTab === "DISNEY" ? "text-white border-cyan-400 shadow-[0_10px_25px_rgba(14,165,233,0.25)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-cyan-800"}`}>
					<img src="/disney.png" alt="Disney" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Disney +</span>
				</button>

				{/* DAZN F1 */}
				<button onClick={() => setActiveTab("DAZN")} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${activeTab === "DAZN" ? "text-white border-red-500 shadow-[0_10px_25px_rgba(220,38,38,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-red-800"}`}>
					<img src="/dazn.png" alt="DAZN" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">DAZN F1</span>
				</button>

				{/* ONBOARD FRANCO COLAPINTO */}
				<button onClick={() => setActiveTab("COLAPINTO")} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${activeTab === "COLAPINTO" ? "text-white border-pink-400 shadow-[0_10px_25px_rgba(244,63,94,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-pink-800"}`}>
					<img src="/colapinto.png" alt="Colapinto" className="h-12 w-auto max-w-[85%] object-contain rounded-sm" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Onboard Colapinto</span>
				</button>

				{/* ONBOARD LANDO NORRIS */}
				<button onClick={() => setActiveTab("NORRIS")} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${activeTab === "NORRIS" ? "text-white border-orange-400 shadow-[0_10px_25px_rgba(249,115,22,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-orange-800"}`}>
					<img src="/norris.png" alt="Norris" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Onboard Norris</span>
				</button>

				{/* RACEHUB GENERAL */}
				<button onClick={() => setActiveTab("RACEHUB")} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${activeTab === "RACEHUB" ? "text-white border-blue-500 shadow-[0_10px_25px_rgba(37,99,235,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-blue-800"}`}>
					<img src="/racehub.png" alt="RaceHub" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">RaceHub General</span>
				</button>

				{/* ONBOARD GENERAL */}
				<button onClick={() => setActiveTab("GENERAL")} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${activeTab === "GENERAL" ? "text-white border-purple-500 shadow-[0_10px_25px_rgba(147,51,234,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-purple-800"}`}>
					<img src="/onboard.png" alt="General" className="h-12 w-auto max-w-[85%] object-contain" />
					<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">Onboard General</span>
				</button>

				{/* 📡 DISNEY 7 (MUTABLE DESDE FIREBASE) */}
				{(() => {
					const tla = firebaseStreams.disney7 || "RUS"; 
					const style = PILOTOS_CONFIG[tla] || { name: `Disney 7 (${tla})`, border: "border-zinc-900", shadow: "", logo: "/onboard.png" };
					return (
						<button 
							onClick={() => setActiveTab("DISNEY7")} 
							className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${
								activeTab === "DISNEY7" ? `text-white ${style.border} ${style.shadow} animate-pulse` : `bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:bg-zinc-900/40`
							}`}
						>
							<img src={style.logo} alt={tla} className="h-12 w-auto max-w-[85%] object-contain" />
							<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">{style.name}</span>
						</button>
					);
				})()}

				{/* 📡 DISNEY 8 (MUTABLE DESDE FIREBASE) */}
				{(() => {
					const tla = firebaseStreams.disney8 || "HAM"; 
					const style = PILOTOS_CONFIG[tla] || { name: `Disney 8 (${tla})`, border: "border-zinc-900", shadow: "", logo: "/onboard.png" };
					return (
						<button 
							onClick={() => setActiveTab("DISNEY8")} 
							className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 h-32 gap-3 ${
								activeTab === "DISNEY8" ? `text-white ${style.border} ${style.shadow} animate-pulse` : `bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:bg-zinc-900/40`
							}`}
						>
							<img src={style.logo} alt={tla} className="h-12 w-auto max-w-[85%] object-contain" />
							<span className="font-black text-[11px] uppercase tracking-widest text-center mt-auto">{style.name}</span>
						</button>
					);
				})()}

			</div>

			{/* ADVERTENCIA DE SEGURIDAD */}
			<div className="w-full mx-auto p-4 border border-amber-500/10 bg-amber-500/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-xs">
				<div className="space-y-1">
					<p className="font-mono font-black text-amber-400 uppercase tracking-wider">⚠️ ADVERTENCIA DE SEGURIDAD (PIT-WALL)</p>
					<p className="text-zinc-400">Para esquivar anuncios molestos, es indispensable usar protección activa.</p>
				</div>
				<div className="flex flex-wrap gap-2 shrink-0">
					<a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono font-bold text-[11px] uppercase tracking-wide">🛡️ uBlock Origin</a>
				</div>
			</div>
		</div>
	);
}