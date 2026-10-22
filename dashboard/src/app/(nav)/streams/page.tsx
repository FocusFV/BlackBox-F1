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

	// 📱 CONTROL REMOTO DESDE RENDER
	const [firebaseStreams, setFirebaseStreams] = useState({
		disney7: "RUS",
		disney8: "HAM",
	});

	useEffect(() => {
		fetch(
			`${process.env.NEXT_PUBLIC_API_URL || "https://Blackbox-f1.onrender.com"}/api/streams-config`,
		)
			.then((res) => {
				if (!res.ok) throw new Error("Error en la respuesta del pit-wall");
				return res.json();
			})
			.then((data) => {
				if (data && data.disney7 && data.disney8) {
					setFirebaseStreams(data);
				}
			})
			.catch((err) =>
				console.error("⚠️ Error leyendo telemetría desde Render:", err),
			);
	}, []);

	// 🏎️ PARRILLA COMPLETA DE IFRAMES
	const STREAMS_CONFIG = {
		FOX: "https://fltvhd.com/online/canal.php?stream=foxsports",
		DISNEY: "https://streamx-hd.com/live1.php?stream=disney3",
		DAZN: "https://streamx-hd.com/live1.php?stream=daznf1",
		COLAPINTO: "https://streamx-hd.com/live1.php?stream=disney6",
		NORRIS: "https://streamx-hd.com/live1.php?stream=disney6",
		RACEHUB: "https://streamx-hd.com/live1.php?stream=disney4",
		GENERAL: "https://streamx-hd.com/live1.php?stream=disney5",
		DISNEY7: "https://streamx-hd.com/live1.php?stream=disney7",
		DISNEY8: "https://streamx-hd.com/live1.php?stream=disney8",
	};

	const [activeTab, setActiveTab] =
		useState<keyof typeof STREAMS_CONFIG>("FOX");

	const handleTabSelect = (tab: keyof typeof STREAMS_CONFIG) => {
		setActiveTab(tab);
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
								{"// FEED SATELITAL: EN ESPERA"}
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
										El candado se abre automáticamente 30 minutos antes
									</span>
								</div>
							) : (
								<p className="text-zinc-400 text-xs font-sans mt-3 leading-relaxed">
									La señal de video en vivo se habilita automáticamente{" "}
									<span className="text-zinc-200 font-bold">
										30 minutos antes
									</span>{" "}
									de cada sesión oficial (FP1, FP2, FP3, Qualy, Sprint o Carrera).
								</p>
							)}

							<p className="text-zinc-600 text-[10px] mt-3 font-sans">
								(Hacé triple-clic en el candado para probar la señal ahora)
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
											? "// ACCESO MANUAL FORZADO POR EL USUARIO"
											: `// SEÑAL SATELITAL ACTIVA: ${activeRace}`}
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

						{/* SELECTOR DE CANALES */}
						<div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mb-4 border-b border-zinc-900/60">
							{Object.keys(STREAMS_CONFIG).map((tabKey) => {
								const key = tabKey as keyof typeof STREAMS_CONFIG;
								const isActive = activeTab === key;

								let label = key.toUpperCase();
								if (key === "DISNEY7") {
									const pilot =
										PILOTOS_CONFIG[firebaseStreams.disney7]?.name ||
										firebaseStreams.disney7;
									label = `D7: ${pilot}`;
								} else if (key === "DISNEY8") {
									const pilot =
										PILOTOS_CONFIG[firebaseStreams.disney8]?.name ||
										firebaseStreams.disney8;
									label = `D8: ${pilot}`;
								}

								return (
									<button
										key={key}
										onClick={() => handleTabSelect(key)}
										className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
											isActive
												? "bg-zinc-100 text-black shadow-lg"
												: "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
										}`}
									>
										{label}
									</button>
								);
							})}
						</div>

						{/* REPRODUCTOR DE STREAM SELECCIONADO */}
						<div className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-900 bg-black shadow-2xl relative">
							<iframe
								src={STREAMS_CONFIG[activeTab]}
								title="F1 Live Stream"
								className="w-full h-full border-0"
								allowFullScreen
								allow="autoplay; encrypted-media; picture-in-picture"
							/>
						</div>
					</div>
				)}
			</div>

			<SupportModal />
		</div>
	);
}
