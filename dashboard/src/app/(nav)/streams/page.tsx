"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/useDataStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Lock, Unlock, Radio } from "lucide-react";

// 🚀 IMPORTAMOS COMPONENTES DE NAVEGACIÓN Y APOYO
import Sidebar from "@/components/Sidebar";
import SidenavButton from "@/components/SidenavButton";
import SupportModal from "@/components/SupportModal";
import { triggerHaptic } from "@/lib/haptics";
import {
	getUpcomingSessions,
	evaluateSessionStatus,
	type ScheduleSession,
} from "@/lib/sessionSchedule";

// 🏎️ DICCIONARIO DE ESTILOS FOCUSFV
const PILOTOS_CONFIG: Record<
	string,
	{ name: string; border: string; shadow: string; logo: string; btnColor: string }
> = {
	RUS: {
		name: "Onboard Russell",
		border: "border-cyan-400 hover:border-cyan-500",
		shadow: "shadow-[0_10px_25px_rgba(34,211,238,0.25)]",
		logo: "/george.png",
		btnColor: "bg-cyan-400 text-black",
	},
	ANT: {
		name: "Onboard Antonelli",
		border: "border-cyan-400 hover:border-cyan-500",
		shadow: "shadow-[0_10px_25px_rgba(34,211,238,0.25)]",
		logo: "/kimi.png",
		btnColor: "bg-cyan-400 text-black",
	},
	LEC: {
		name: "Onboard Leclerc",
		border: "border-red-500 hover:border-red-600",
		shadow: "shadow-[0_10px_25px_rgba(220,38,38,0.25)]",
		logo: "/leclerc.png",
		btnColor: "bg-red-600 text-white",
	},
	HAM: {
		name: "Onboard Hamilton",
		border: "border-red-500 hover:border-red-600",
		shadow: "shadow-[0_10px_25px_rgba(220,38,38,0.25)]",
		logo: "/hamilton.png",
		btnColor: "bg-red-600 text-white",
	},
	VER: {
		name: "Onboard Verstappen",
		border: "border-blue-500 hover:border-blue-600",
		shadow: "shadow-[0_10px_25px_rgba(37,99,235,0.25)]",
		logo: "/max.png",
		btnColor: "bg-blue-600 text-white",
	},
	NOR: {
		name: "Onboard Norris",
		border: "border-orange-400 hover:border-orange-500",
		shadow: "shadow-[0_10px_25px_rgba(249,115,22,0.25)]",
		logo: "/norris.png",
		btnColor: "bg-orange-500 text-black",
	},
	PIA: {
		name: "Onboard Piastri",
		border: "border-orange-400 hover:border-orange-500",
		shadow: "shadow-[0_10px_25px_rgba(249,115,22,0.25)]",
		logo: "/piastri.png",
		btnColor: "bg-orange-500 text-black",
	},
	ALO: {
		name: "Onboard Alonso",
		border: "border-emerald-600 hover:border-emerald-700",
		shadow: "shadow-[0_10px_25px_rgba(5,150,105,0.25)]",
		logo: "/alonso.png",
		btnColor: "bg-emerald-500 text-black",
	},
	SAI: {
		name: "Onboard Sainz",
		border: "border-blue-600 hover:border-blue-700",
		shadow: "shadow-[0_10px_25px_rgba(29,78,216,0.25)]",
		logo: "/sainz.png",
		btnColor: "bg-blue-600 text-white",
	},
};

function formatRemainingTime(ms: number): string {
	if (ms <= 0) return "00:00:00";
	const totalSecs = Math.floor(ms / 1000);
	const hours = Math.floor(totalSecs / 3600);
	const minutes = Math.floor((totalSecs % 3600) / 60);
	const seconds = totalSecs % 60;
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function StreamsPage() {
	const [bypass, setBypass] = useState<boolean>(false);
	const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const clickCountRef = React.useRef<number>(0);
	const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

	// Controles del Sidebar Store
	const openSidebar = useSidebarStore((state) => state.open);
	const pinnedSidebar = useSidebarStore((state) => state.pinned);
	const pinSidebar = useSidebarStore((state) => state.pin);

	// 🏎️ PARRILLA PROTEGIDA CON ENCRIPTACIÓN DE SERVIDORES Y DE RESPALDO
	interface StreamSource {
		label: string;
		url: string;
	}

	const _d = (s: string) => {
		try {
			return typeof atob !== "undefined" ? atob(s) : Buffer.from(s, "base64").toString("utf-8");
		} catch {
			return "";
		}
	};

	const STREAMS_CONFIG_RAW: Record<string, { label: string; token: string }[]> = {
		FOX: [
			{ label: "Servidor 1 (DaddyLive)", token: "aHR0cHM6Ly90aGVkYWRkeS5way9zdHJlYW0vc3RyZWFtLTc4Ny5waHA=" },
			{ label: "Servidor 2 (Embed)", token: "aHR0cHM6Ly9lbWJlZC5zYW9oZ2Rhc3NyZWdpb25zLmNvbS9lbWJlZDIvZm94c3BvcnRzLnBocA==" },
			{ label: "Servidor 3 (NTV)", token: "aHR0cHM6Ly9udHYuc3QvZW1iZWQ/dD1kbUpHTVRWaVowWjFlV1JoWWxSYVJHSnpiVFpZT0dSTFREUXJNRzVNY1RSMlpVMXZWR1JaVmxONGRXdzBkM2hvVVhkTVFVYzRUbnB4TWxwcU1FeE5jZw==" },
			{ label: "Servidor 4 (DeporteLibre)", token: "aHR0cHM6Ly9kZXBvcnRlbGlicmUudG9wL3RvdGFsL3N0cmVhbS03ODcucGhw" },
			{ label: "Servidor 5 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWZveDFhcg==" },
			{ label: "Servidor 6 (Respaldo)", token: "aHR0cHM6Ly9sYTE4aGQuc3Uvdml2by9jYW5hbGVzLnBocD9zdHJlYW09Zm94c3BvcnRz" },
		],
		DISNEY: [
			{ label: "Servidor 1 (DaddyLive)", token: "aHR0cHM6Ly9kYWRkeWxpdmUubW92L3BsYXllci9lbWJlZC5waHA/aWQ9ZDM0Yjg=" },
			{ label: "Servidor 2 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWRpc25leTg=" },
			{ label: "Servidor 3 (Respaldo)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/Y2hhbm5lbD1kaXNuZXk4" },
		],
		DAZN: [
			{ label: "Servidor 1 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWRhem5mMQ==" },
			{ label: "Servidor 2 (Respaldo)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/Y2hhbm5lbD1kYXpuZjE=" },
		],
		COLAPINTO: [
			{ label: "Servidor 1 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWRpc25leTk=" },
			{ label: "Servidor 2 (Respaldo)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/Y2hhbm5lbD1kaXNuZXk5" },
		],
		GENERAL: [
			{ label: "Servidor 1 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWVzcG4y" },
			{ label: "Servidor 2 (Respaldo)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/Y2hhbm5lbD1lc3BuMg==" },
			{ label: "Servidor 3 (HD)", token: "aHR0cHM6Ly90dmY5MC5jb20vaGQucGhwP3N0cmVhbT1lc3BuMg==" },
			{ label: "Servidor 4 (Opción 1)", token: "aHR0cHM6Ly90dmY5MC5jb20vMS5waHA/c3RyZWFtPWVzcG4y" },
			{ label: "Servidor 5 (Opción 2)", token: "aHR0cHM6Ly90dmY5MC5jb20vMi5waHA/c3RyZWFtPWVzcG4y" },
			{ label: "Servidor 6 (Opción 3)", token: "aHR0cHM6Ly90dmY5MC5jb20vMy5waHA/c3RyZWFtPWVzcG4y" },
		],
	};

	const STREAMS_CONFIG: Record<string, StreamSource[]> = Object.fromEntries(
		Object.entries(STREAMS_CONFIG_RAW).map(([key, sources]) => [
			key,
			sources.map((s) => ({ label: s.label, url: _d(s.token) })),
		])
	);

	const [activeTab, setActiveTab] =
		useState<keyof typeof STREAMS_CONFIG>("FOX");
	const [serverIndex, setServerIndex] = useState<number>(0);
	const [switchNotice, setSwitchNotice] = useState<string | null>(null);

	const handleTabSelect = (tab: keyof typeof STREAMS_CONFIG) => {
		setActiveTab(tab);
		setServerIndex(0);
		setSwitchNotice(null);
		triggerHaptic("light");
	};

	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const sessionInfo = useDataStore((state) => state.state?.SessionInfo);
	const activeRace = sessionInfo?.Meeting?.Name || "Gran Premio";

	// 🕒 DETECCIÓN INTELIGENTE DE HORARIOS DE SESIÓN (FP1, FP2, FP3, Qualy, Sprint, Carrera)
	const [sessions, setSessions] = useState<ScheduleSession[]>([]);
	const [isLive, setIsLive] = useState<boolean>(false);
	const [activeSessionName, setActiveSessionName] = useState<string | null>(null);
	const [nextSessionName, setNextSessionName] = useState<string | null>(null);
	const [countdownText, setCountdownText] = useState<string>("");

	// Cargar cronograma del fin de semana
	useEffect(() => {
		let isMounted = true;
		getUpcomingSessions().then((loadedSessions) => {
			if (isMounted && loadedSessions.length > 0) {
				setSessions(loadedSessions);
			}
		});
		return () => {
			isMounted = false;
		};
	}, []);

	// Evaluar cada 5 segundos si el candado debe abrirse
	useEffect(() => {
		const updateStatus = () => {
			const isTelemetryActive = Boolean(trackStatus && parseInt(trackStatus, 10) > 0);
			const status = evaluateSessionStatus(sessions);

			if (isTelemetryActive || status.isLiveWindow) {
				setIsLive(true);
				setActiveSessionName(status.activeSessionName || "Sesión Oficial");
				setCountdownText("");
			} else {
				setIsLive(false);
				setActiveSessionName(null);
				setNextSessionName(status.nextSessionName);
				if (status.nextSessionStart) {
					const diff = status.nextSessionStart - Date.now();
					setCountdownText(formatRemainingTime(diff));
				} else {
					setCountdownText("");
				}
			}
		};

		updateStatus();
		const interval = setInterval(updateStatus, 5000);
		return () => clearInterval(interval);
	}, [trackStatus, sessions]);

	const handleLockClick = () => {
		clickCountRef.current += 1;
		if (clickCountRef.current >= 3) {
			clickCountRef.current = 0;
			if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
			setIsUnlocking(true);
			setTimeout(() => {
				setBypass(true);
				setIsUnlocking(false);
			}, 600);
		} else {
			if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
			clickTimeoutRef.current = setTimeout(() => {
				clickCountRef.current = 0;
			}, 1000);
		}
	};

	return (
		<div className="flex h-screen w-full md:pt-2 md:pr-2 md:pb-2 font-mono text-white select-none">
			{/* 🚀 SIDEBAR INTEGRADO */}
			<Sidebar key="sidebar" connected={true} />

			{/* CONTENIDO PRINCIPAL */}
			<div className="flex h-full w-full flex-1 flex-col overflow-auto no-scrollbar md:gap-2">
				{/* 🛑 CASO 1: MOTORES APAGADOS (CANDADO CERRADO) */}
				{!isLive && !bypass ? (
					<div className="pt-4 w-full mx-auto px-4 sm:px-6 h-full flex flex-col items-center justify-center relative">
						<div className="absolute top-4 left-4">
							<SidenavButton
								onClick={() => (pinnedSidebar ? pinSidebar() : openSidebar())}
							/>
						</div>

						<div className="max-w-md w-full border border-zinc-900 bg-[#0c0a05]/40 backdrop-blur-md p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-fade-in">
							<div
								onClick={handleLockClick}
								title="Hacé triple-clic para desbloquear de forma manual"
								className={`w-16 h-16 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border flex items-center justify-center mb-6 transition-all duration-300 cursor-pointer active:scale-95 group ${
									isUnlocking
										? "border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-110 rotate-[360deg]"
										: "border-amber-500/20 hover:border-amber-500/50 text-amber-500/70 hover:text-amber-400"
								}`}
							>
								{isUnlocking ? (
									<Unlock className="w-7 h-7" />
								) : (
									<Lock className="w-7 h-7 group-hover:scale-110 duration-300" />
								)}
							</div>

							<span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">
								FEED SATELITAL EN ESPERA
							</span>
							<h2 className="text-xl font-black uppercase tracking-tight text-zinc-100">
								MOTORES APAGADOS
							</h2>

							{nextSessionName && countdownText ? (
								<div className="my-5 w-full px-4 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col items-center">
									<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
										Próxima Sesión:{" "}
										<span className="text-amber-400 font-black">
											{nextSessionName}
										</span>
									</span>
									<span className="text-3xl font-black text-white font-mono mt-1 tracking-widest text-emerald-400">
										{countdownText}
									</span>
									<span className="text-[9px] text-zinc-500 mt-1">
										El candado se abre automáticamente 15 minutos antes
									</span>
								</div>
							) : (
								<p className="text-zinc-400 text-xs font-sans mt-3 leading-relaxed">
									La señal de video en vivo se habilita automáticamente{" "}
									<span className="text-zinc-200 font-bold">
										15 minutos antes
									</span>{" "}
									de cada sesión oficial (FP1, FP2, FP3, Qualy, Sprint o Carrera).
								</p>
							)}

							<p className="text-zinc-600 text-[10px] mt-3 font-sans">
								Hacé triple clic en el candado para habilitar la señal de forma manual
							</p>
						</div>
					</div>
				) : (
					/* 🟢 CASO 2: TRANSMISIONES EN VIVO (CANDADO ABIERTO) */
					<div className="pt-2 w-full mx-auto px-4 sm:px-6 max-w-7xl">
						{/* CABECERA HUD CON BOTÓN DE SIDEBAR */}
						<div className="my-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4">
							<div className="flex items-center gap-3">
								<SidenavButton
									onClick={() => (pinnedSidebar ? pinSidebar() : openSidebar())}
								/>
								<div>
									<div className="flex items-center gap-2.5">
										<h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-100 border-l-4 border-emerald-500 pl-3">
											Transmisiones en Vivo
										</h1>
										{activeSessionName && (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
												<Radio className="w-3 h-3" />
												{activeSessionName}
											</span>
										)}
									</div>
									<p className="text-zinc-500 text-xs mt-1">
										{bypass
											? "Acceso manual de prueba"
											: `Señal satelital activa: ${activeRace}`}
									</p>
								</div>
							</div>

							<Link
								href="/dashboard"
								className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-800 transition-all active:scale-95 self-start sm:self-auto"
							>
								<span>Volver al Dashboard</span>
							</Link>
						</div>

						{/* PARRILLA DE CANALES (GRID DE ACCESO DIRECTO CON DISEÑO PREMIUM) */}
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
							{/* CANAL FOX */}
							<button
								onClick={() => handleTabSelect("FOX")}
								className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 cursor-pointer ${
									activeTab === "FOX"
										? "text-white border-blue-400 shadow-[0_10px_25px_rgba(56,189,248,0.3)] animate-pulse"
										: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-blue-900"
								}`}
							>
								<img src="/fox.png" alt="Fox Sports" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">Fox Sports AR</span>
							</button>

							{/* CANAL DISNEY */}
							<button
								onClick={() => handleTabSelect("DISNEY")}
								className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 cursor-pointer ${
									activeTab === "DISNEY"
										? "text-white border-cyan-400 shadow-[0_10px_25px_rgba(34,211,238,0.3)] animate-pulse"
										: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-cyan-900"
								}`}
							>
								<img src="/disney.png" alt="Disney+" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">Disney +</span>
							</button>

							{/* CANAL DAZN F1 */}
							<button
								onClick={() => handleTabSelect("DAZN")}
								className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 cursor-pointer ${
									activeTab === "DAZN"
										? "text-white border-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.3)] animate-pulse"
										: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-red-900"
								}`}
							>
								<img src="/dazn.png" alt="DAZN F1" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">DAZN F1</span>
							</button>

							{/* ONBOARD COLAPINTO */}
							<button
								onClick={() => handleTabSelect("COLAPINTO")}
								className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 cursor-pointer ${
									activeTab === "COLAPINTO"
										? "text-white border-pink-400 shadow-[0_10px_25px_rgba(244,114,182,0.3)] animate-pulse"
										: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-pink-900"
								}`}
							>
								<img src="/colapinto.png" alt="Colapinto" className="h-10 w-auto max-w-[85%] object-contain rounded-sm" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">🇦🇷 Onboard Colapinto</span>
							</button>

							{/* GENERAL / ESPN 2 */}
							<button
								onClick={() => handleTabSelect("GENERAL")}
								className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 cursor-pointer ${
									activeTab === "GENERAL"
										? "text-white border-purple-500 shadow-[0_10px_25px_rgba(147,51,234,0.3)] animate-pulse"
										: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-purple-900"
								}`}
							>
								<img src="/onboard.png" alt="General" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">ESPN 2 / General</span>
							</button>
						</div>

						{/* SELECTOR DE SERVIDORES Y AVISO DE CONMUTACIÓN */}
						{(() => {
							const sources = STREAMS_CONFIG[activeTab] || [];
							const currentSource = sources[serverIndex] || sources[0];

							return (
								<>
									<div className="flex items-center justify-between flex-wrap gap-2 mb-3 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SERVIDOR:</span>
											<div className="flex items-center gap-1.5 flex-wrap">
												{sources.map((source, idx) => (
													<button
														key={`${source.label}-${idx}`}
														onClick={() => {
															setServerIndex(idx);
															setSwitchNotice(null);
															triggerHaptic("light");
														}}
														className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
															serverIndex === idx
																? "bg-amber-500 text-black shadow-md font-black"
																: "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
														}`}
													>
														{source.label}
													</button>
												))}
											</div>
										</div>

										{switchNotice && (
											<span className="text-[10px] font-bold text-amber-400 animate-pulse bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
												{switchNotice}
											</span>
										)}
									</div>

									{/* REPRODUCTOR DE STREAM SELECCIONADO */}
									<div onContextMenu={(e) => e.preventDefault()} className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-900 bg-black shadow-2xl relative select-none">
										<iframe
											key={currentSource?.url}
											src={currentSource?.url}
											title="F1 Live Stream"
											className="w-full h-full border-0"
											allowFullScreen
											allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
										/>
									</div>
								</>
							);
						})()}

						{/* RECOMENDACIÓN DE REPRODUCCIÓN */}
						<div className="w-full mx-auto p-4 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-xs mt-6 mb-6">
							<div className="space-y-1">
								<p className="font-mono font-black text-zinc-300 uppercase tracking-wider">Recomendación para la transmisión</p>
								<p className="text-zinc-500">Para una experiencia limpia y sin ventanas emergentes de los reproductores, se sugiere utilizar un bloqueador de anuncios.</p>
							</div>
							<div className="flex flex-wrap gap-2 shrink-0">
								<a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono font-bold text-[11px] uppercase tracking-wide transition-all">uBlock Origin</a>
							</div>
						</div>
					</div>
				)}
			</div>

			<SupportModal />
		</div>
	);
}
