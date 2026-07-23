"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/useDataStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Lock, Unlock, ShieldAlert, Play } from "lucide-react";

// 🚀 IMPORTAMOS COMPONENTES DE NAVEGACIÓN Y APOYO
import Sidebar from "@/components/Sidebar";
import SidenavButton from "@/components/SidenavButton";
import SupportModal from "@/components/SupportModal";

// 🏎️ DICCIONARIO DE ESTILOS FOCUSFV PARA ONBOARDS Y CANALES
const PILOTOS_CONFIG: Record<string, { name: string; border: string; shadow: string; logo: string; btnColor: string }> = {
	RUS: { name: "Onboard Russell", border: "border-cyan-400 hover:border-cyan-500", shadow: "shadow-[0_10px_25px_rgba(34,211,238,0.25)]", logo: "/george.png", btnColor: "bg-cyan-400 hover:bg-cyan-300 text-black" },
	ANT: { name: "Onboard Antonelli", border: "border-cyan-400 hover:border-cyan-500", shadow: "shadow-[0_10px_25px_rgba(34,211,238,0.25)]", logo: "/kimi.png", btnColor: "bg-cyan-400 hover:bg-cyan-300 text-black" },
	LEC: { name: "Onboard Leclerc", border: "border-red-500 hover:border-red-600", shadow: "shadow-[0_10px_25px_rgba(220,38,38,0.25)]", logo: "/leclerc.png", btnColor: "bg-red-600 hover:bg-red-500 text-white" },
	HAM: { name: "Onboard Hamilton", border: "border-red-500 hover:border-red-600", shadow: "shadow-[0_10px_25px_rgba(220,38,38,0.25)]", logo: "/hamilton.png", btnColor: "bg-red-600 hover:bg-red-500 text-white" },
	VER: { name: "Onboard Verstappen", border: "border-blue-500 hover:border-blue-600", shadow: "shadow-[0_10px_25px_rgba(37,99,235,0.25)]", logo: "/max.png", btnColor: "bg-blue-600 hover:bg-blue-500 text-white" },
	NOR: { name: "Onboard Norris", border: "border-orange-400 hover:border-orange-500", shadow: "shadow-[0_10px_25px_rgba(249,115,22,0.25)]", logo: "/norris.png", btnColor: "bg-orange-500 hover:bg-orange-400 text-black" },
	PIA: { name: "Onboard Piastri", border: "border-orange-400 hover:border-orange-500", shadow: "shadow-[0_10px_25px_rgba(249,115,22,0.25)]", logo: "/piastri.png", btnColor: "bg-orange-500 hover:bg-orange-400 text-black" },
	ALO: { name: "Onboard Alonso", border: "border-emerald-600 hover:border-emerald-700", shadow: "shadow-[0_10px_25px_rgba(5,150,105,0.25)]", logo: "/alonso.png", btnColor: "bg-emerald-500 hover:bg-emerald-400 text-black" },
	SAI: { name: "Onboard Sainz", border: "border-blue-600 hover:border-blue-700", shadow: "shadow-[0_10px_25px_rgba(29,78,216,0.25)]", logo: "/sainz.png", btnColor: "bg-blue-600 hover:bg-blue-500 text-white" },
};

// Map para asociar las pestañas principales con su color correspondiente
const TAB_COLORS: Record<string, string> = {
	FOX: "bg-sky-500 hover:bg-sky-400 text-black",
	DISNEY: "bg-cyan-400 hover:bg-cyan-300 text-black",
	DAZN: "bg-red-600 hover:bg-red-500 text-white",
	COLAPINTO: "bg-pink-500 hover:bg-pink-400 text-black",
	NORRIS: "bg-orange-500 hover:bg-orange-400 text-black",
	RACEHUB: "bg-blue-600 hover:bg-blue-500 text-white",
	GENERAL: "bg-purple-600 hover:bg-purple-500 text-white",
};

export default function StreamsPage() {
	const [bypass, setBypass] = useState<boolean>(false);
	const [clickCount, setClickCount] = useState<number>(0);
	const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
	
	// 🛡️ Estado del Escudo de Protección Antianuncios
	const [overlayActive, setOverlayActive] = useState<boolean>(true);

	// Controles del Sidebar Store
	const openSidebar = useSidebarStore((state) => state.open);
	const pinnedSidebar = useSidebarStore((state) => state.pinned);
	const pinSidebar = useSidebarStore((state) => state.pin);

	// 📱 CONTROL REMOTO DESDE RENDER
	const [firebaseStreams, setFirebaseStreams] = useState({
		disney7: "RUS", 
		disney8: "HAM"  
	});

	// 🔌 CONEXIÓN CON BACKEND EN RENDER
	useEffect(() => {
		fetch("https://Blackbox-f1.onrender.com/api/streams-config")
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

	// 🏎️ PARRILLA COMPLETA DE IFRAMES
	const STREAMS_CONFIG = {
		FOX: "https://streamx-hd.com/live1.php?stream=fox1ar",
		DISNEY: "https://streamx-hd.com/live1.php?stream=disney2",
		DAZN: "https://streamx-hd.com/live1.php?stream=daznf1",
		COLAPINTO: "https://streamx-hd.com/live1.php?stream=disney5",
		NORRIS: "https://streamx-hd.com/live1.php?stream=disney6",
		RACEHUB: "https://streamx-hd.com/live1.php?stream=disney3",
		GENERAL: "https://streamx-hd.com/live1.php?stream=disney4",
		DISNEY7: "https://streamx-hd.com/live1.php?stream=disney7",
		DISNEY8: "https://streamx-hd.com/live1.php?stream=disney8",
	};

	const [activeTab, setActiveTab] = useState<keyof typeof STREAMS_CONFIG>("FOX");

	// Cada vez que cambia la pestaña, reactivamos el escudo por seguridad
	const handleTabChange = (tab: keyof typeof STREAMS_CONFIG) => {
		setActiveTab(tab);
		setOverlayActive(true);
	};

	// Determinamos el color activo del botón según la pestaña actual
	const getActiveButtonColor = () => {
		if (activeTab === "DISNEY7") {
			const tla = firebaseStreams.disney7 || "RUS";
			return PILOTOS_CONFIG[tla]?.btnColor || "bg-amber-500 hover:bg-amber-400 text-black";
		}
		if (activeTab === "DISNEY8") {
			const tla = firebaseStreams.disney8 || "HAM";
			return PILOTOS_CONFIG[tla]?.btnColor || "bg-amber-500 hover:bg-amber-400 text-black";
		}
		return TAB_COLORS[activeTab] || "bg-amber-500 hover:bg-amber-400 text-black";
	};

	// Monitoreo del store de Zustand
	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const sessionInfo = useDataStore((state) => state.state?.SessionInfo);
	const activeRace = sessionInfo?.Meeting?.Name || "Gran Premio";

	const checkTimeWindow = (): boolean => {
		if (trackStatus && parseInt(trackStatus, 10) > 0) return true;
		if (!sessionInfo?.StartDate || !sessionInfo?.EndDate) return false;

		const now = Date.now();
		const parseUTC = (dateStr: string) => {
			const cleanStr = dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`;
			return new Date(cleanStr).getTime();
		};

		const startTime = parseUTC(sessionInfo.StartDate);
		const endTime = parseUTC(sessionInfo.EndDate);
		const THIRTY_MINUTES = 1800000; 

		return now >= (startTime - THIRTY_MINUTES) && now <= (endTime + THIRTY_MINUTES);
	};

	const isLive = checkTimeWindow();

	return (
		<div className="flex h-screen w-full md:pt-2 md:pr-2 md:pb-2 font-mono text-white select-none">
			
			{/* 🚀 SIDEBAR INTEGRADO */}
			<Sidebar key="sidebar" connected={true} />

			{/* CONTENIDO PRINCIPAL */}
			<div className="flex h-full w-full flex-1 flex-col overflow-auto no-scrollbar md:gap-2">
				
				{/* 🛑 CASO 1: MOTORES APAGADOS */}
				{!isLive && !bypass ? (
					<div className="pt-4 w-full mx-auto px-4 sm:px-6 h-full flex flex-col items-center justify-center relative">
						
						{/* BOTÓN PARA ABRIR SIDEBAR SI ESTÁ DESFIJADO */}
						<div className="absolute top-4 left-4">
							<SidenavButton onClick={() => (pinnedSidebar ? pinSidebar() : openSidebar())} />
						</div>

						<div className="max-w-md w-full border border-zinc-900 bg-[#0c0a05]/20 backdrop-blur-md p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fade-in">
							<div 
								onClick={() => {
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
								}}
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
								La señal de video en vivo se habilita automáticamente <span className="text-zinc-300 font-bold">30 minutos antes</span> de la sesión.
							</p>
						</div>
					</div>
				) : (

					/* 🟢 CASO 2: TRANSMISIONES EN VIVO */
					<div className="pt-2 w-full mx-auto px-4 sm:px-6 max-w-7xl">
						
						{/* CABECERA HUD CON BOTÓN DE SIDEBAR */}
						<div className="my-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4">
							<div className="flex items-center gap-3">
								<SidenavButton onClick={() => (pinnedSidebar ? pinSidebar() : openSidebar())} />
								<div>
									<h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-100 border-l-4 border-emerald-500 pl-3">
										Transmisiones en Vivo
									</h1>
									<p className="text-zinc-500 text-xs mt-0.5">
										{bypass ? "// ACCESO MAGICO ACTIVADO FORZOSO" : `// FEED EMITIDO PARA: ${activeRace}`}
									</p>
								</div>
							</div>

							<Link 
								href="/dashboard" 
								className="inline-flex items-center gap-2 text-xs font-black bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 active:scale-95 transition-all px-4 py-2 rounded-xl uppercase tracking-wider w-fit"
							>
								<span>Muro de Telemetría</span> 📊
							</Link>
						</div>

						{/* 📺 REPRODUCTOR XL CON ESCUDO CORTA-POPUP */}
						<div className="w-full mx-auto aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-black/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative mb-6">
							
							<iframe
								key={activeTab}
								src={STREAMS_CONFIG[activeTab]}
								className="w-full h-full"
								allowFullScreen
								scrolling="no"
								allow="autoplay; encrypted-media; picture-in-picture"
							/>

							{/* 🛡️ ESCUDO CON MENSAJE AMIGABLE Y COLOR DINÁMICO */}
							{overlayActive && (
								<div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
									<div className="bg-zinc-950/90 border border-zinc-800 p-6 sm:p-8 rounded-3xl max-w-md flex flex-col items-center shadow-2xl space-y-4">
										<div className="p-3.5 bg-zinc-900 border border-zinc-800 text-amber-400 rounded-2xl shadow-inner">
											<ShieldAlert className="w-7 h-7 animate-pulse" />
										</div>
										
										<div className="space-y-1">
											<h3 className="text-lg font-black text-white uppercase tracking-tight">
												Escudo Antianuncios
											</h3>
											<p className="text-xs text-zinc-400 font-sans leading-relaxed">
												Para esquivar las pestañas y anuncios molestos tuve que poner este botón. Tocalo y arrancá a ver la transmisión tranquilo.
											</p>
										</div>

										<button
											onClick={() => setOverlayActive(false)}
											className={`w-full py-3.5 px-5 font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-95 ${getActiveButtonColor()}`}
										>
											<Play className="w-4 h-4 fill-current" /> Iniciar Stream
										</button>
									</div>
								</div>
							)}
						</div>

						{/* 🎛️ TABLERO DE CONTROL MULTICANAL */}
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
							
							{/* FOX SPORTS */}
							<button onClick={() => handleTabChange("FOX")} className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${activeTab === "FOX" ? "text-white border-blue-400 shadow-[0_10px_25px_rgba(14,165,233,0.25)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-blue-800"}`}>
								<img src="/fox.png" alt="Fox" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">Fox Sports AR</span>
							</button>

							{/* DISNEY+ */}
							<button onClick={() => handleTabChange("DISNEY")} className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${activeTab === "DISNEY" ? "text-white border-cyan-400 shadow-[0_10px_25px_rgba(14,165,233,0.25)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-cyan-800"}`}>
								<img src="/disney.png" alt="Disney" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">Disney +</span>
							</button>

							{/* DAZN F1 */}
							<button onClick={() => handleTabChange("DAZN")} className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${activeTab === "DAZN" ? "text-white border-red-500 shadow-[0_10px_25px_rgba(220,38,38,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-red-800"}`}>
								<img src="/dazn.png" alt="DAZN" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">DAZN F1</span>
							</button>

							{/* ONBOARD FRANCO COLAPINTO */}
							<button onClick={() => handleTabChange("COLAPINTO")} className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${activeTab === "COLAPINTO" ? "text-white border-pink-400 shadow-[0_10px_25px_rgba(244,63,94,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-pink-800"}`}>
								<img src="/colapinto.png" alt="Colapinto" className="h-10 w-auto max-w-[85%] object-contain rounded-sm" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">Onboard Colapinto</span>
							</button>

							{/* ONBOARD LANDO NORRIS */}
							<button onClick={() => handleTabChange("NORRIS")} className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${activeTab === "NORRIS" ? "text-white border-orange-400 shadow-[0_10px_25px_rgba(249,115,22,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-orange-800"}`}>
								<img src="/norris.png" alt="Norris" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">Onboard Norris</span>
							</button>

							{/* RACEHUB GENERAL */}
							<button onClick={() => handleTabChange("RACEHUB")} className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${activeTab === "RACEHUB" ? "text-white border-blue-500 shadow-[0_10px_25px_rgba(37,99,235,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-blue-800"}`}>
								<img src="/racehub.png" alt="RaceHub" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">RaceHub General</span>
							</button>

							{/* ONBOARD GENERAL */}
							<button onClick={() => handleTabChange("GENERAL")} className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${activeTab === "GENERAL" ? "text-white border-purple-500 shadow-[0_10px_25px_rgba(147,51,234,0.3)] animate-pulse" : "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-purple-800"}`}>
								<img src="/onboard.png" alt="General" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">Onboard General</span>
							</button>

							{/* 📡 DISNEY 7 */}
							{(() => {
								const tla = firebaseStreams.disney7 || "RUS"; 
								const style = PILOTOS_CONFIG[tla] || { name: `Disney 7 (${tla})`, border: "border-zinc-900", shadow: "", logo: "/onboard.png" };
								return (
									<button 
										onClick={() => handleTabChange("DISNEY7")} 
										className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${
											activeTab === "DISNEY7" ? `text-white ${style.border} ${style.shadow} animate-pulse` : `bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:bg-zinc-900/40`
										}`}
									>
										<img src={style.logo} alt={tla} className="h-10 w-auto max-w-[85%] object-contain" />
										<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">{style.name}</span>
									</button>
								);
							})()}

							{/* 📡 DISNEY 8 */}
							{(() => {
								const tla = firebaseStreams.disney8 || "HAM"; 
								const style = PILOTOS_CONFIG[tla] || { name: `Disney 8 (${tla})`, border: "border-zinc-900", shadow: "", logo: "/onboard.png" };
								return (
									<button 
										onClick={() => handleTabChange("DISNEY8")} 
										className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 ${
											activeTab === "DISNEY8" ? `text-white ${style.border} ${style.shadow} animate-pulse` : `bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:bg-zinc-900/40`
										}`}
									>
										<img src={style.logo} alt={tla} className="h-10 w-auto max-w-[85%] object-contain" />
										<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">{style.name}</span>
									</button>
								);
							})()}

						</div>

						{/* ADVERTENCIA DE SEGURIDAD */}
						<div className="w-full mx-auto p-4 border border-amber-500/10 bg-amber-500/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-xs mb-6">
							<div className="space-y-1">
								<p className="font-mono font-black text-amber-400 uppercase tracking-wider">⚠️ RECOMENDACIÓN ANTI-POPUP</p>
								<p className="text-zinc-400">Para bloquear ventanas molestas al hacer clic en el video, usá una extensión adblocker.</p>
							</div>
							<div className="flex flex-wrap gap-2 shrink-0">
								<a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono font-bold text-[11px] uppercase tracking-wide">🛡️ uBlock Origin</a>
							</div>
						</div>

					</div>
				)}
			</div>

			{/* 🚀 MODAL DE APOYO INTEGRADOR */}
			<SupportModal />
		</div>
	);
}