"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/useDataStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Lock, Unlock, Radio, RefreshCw, ShieldCheck } from "lucide-react";

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
import { translateSessionName } from "@/lib/f1Translations";
import { simulator } from "@/lib/simulatorFeed";

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
	const { t, language } = useTranslation();
	const [bypass, setBypass] = useState<boolean>(false);
	const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const clickCountRef = React.useRef<number>(0);
	const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

	// Controles del Sidebar Store
	const pinnedSidebar = useSidebarStore((state) => state.pinned);
	const toggleSidebar = useSidebarStore((state) => state.toggle);

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
			{ label: "Servidor 1 (StreamXHD .sbs)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc2JzL2xpdmUxLnBocD9zdHJlYW09Zm94MWFy" },
			{ label: "Servidor 2 (StreamXHD .st)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc3QvbGl2ZTEucGhwP3N0cmVhbT1mb3gxYXI=" },
			{ label: "Servidor 3 (StreamXHD .click)", token: "aHR0cHM6Ly9zdHJlYW14aGQuY2xpY2svbGl2ZTEucGhwP3N0cmVhbT1mb3gxYXI=" },
			{ label: "Servidor 4 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWZveDFhcg==" },
			{ label: "Servidor 5 (DaddyLive)", token: "aHR0cHM6Ly90aGVkYWRkeS5way9zdHJlYW0vc3RyZWFtLTc4Ny5waHA=" },
			{ label: "Servidor 6 (Respaldo)", token: "aHR0cHM6Ly9sYTE4aGQuc3Uvdml2by9jYW5hbGVzLnBocD9zdHJlYW09Zm94c3BvcnRz" },
		],
		DISNEY: [
			{ label: "Servidor 1 (StreamXHD .sbs)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc2JzL2xpdmUxLnBocD9zdHJlYW09ZGlzbmV5MTA=" },
			{ label: "Servidor 2 (StreamXHD .st)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc3QvbGl2ZTEucGhwP3N0cmVhbT1kaXNuZXkxMA==" },
			{ label: "Servidor 3 (StreamXHD .click)", token: "aHR0cHM6Ly9zdHJlYW14aGQuY2xpY2svbGl2ZTEucGhwP3N0cmVhbT1kaXNuZXkxMA==" },
			{ label: "Servidor 4 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWRpc25leTg=" },
			{ label: "Servidor 5 (DaddyLive)", token: "aHR0cHM6Ly9kYWRkeWxpdmUubW92L3BsYXllci9lbWJlZC5waHA/aWQ9ZDM0Yjg=" },
		],
		DAZN: [
			{ label: "Servidor 1 (StreamXHD .sbs)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc2JzL2xpdmUxLnBocD9zdHJlYW09ZGF6bmYx" },
			{ label: "Servidor 2 (StreamXHD .st)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc3QvbGl2ZTEucGhwP3N0cmVhbT1kYXpuZjE=" },
			{ label: "Servidor 3 (StreamXHD .click)", token: "aHR0cHM6Ly9zdHJlYW14aGQuY2xpY2svbGl2ZTEucGhwP3N0cmVhbT1kYXpuZjE=" },
			{ label: "Servidor 4 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWRhem5mMQ==" },
			{ label: "Servidor 5 (Respaldo)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/Y2hhbm5lbD1kYXpuZjE=" },
		],
		F1TV: [
			{ label: "Servidor 1 (F1 Oficial HD 1080p)", token: "aHR0cHM6Ly93ZWVsbHoubGl2ZS9iZXRhP3N0cmVhbT1nZWJkYWNlZmdmYWNpZWVl" },
			{ label: "Servidor 2 (DaddyLive F1)", token: "aHR0cHM6Ly90aGVkYWRkeS5way9zdHJlYW0vc3RyZWFtLTc4Ny5waHA=" },
		],
		COLAPINTO: [
			{ label: "Servidor Principal (StreamXHD)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc2JzL2xpdmUxLnBocD9zdHJlYW09ZGlzbmV5MjU=" },
		],
		GENERAL: [
			{ label: "Servidor 1 (StreamXHD .sbs)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc2JzL2xpdmUxLnBocD9zdHJlYW09ZXNwbjI=" },
			{ label: "Servidor 2 (StreamXHD .st)", token: "aHR0cHM6Ly9zdHJlYW14aGQuc3QvbGl2ZTEucGhwP3N0cmVhbT1lc3BuMg==" },
			{ label: "Servidor 3 (StreamXHD .click)", token: "aHR0cHM6Ly9zdHJlYW14aGQuY2xpY2svbGl2ZTEucGhwP3N0cmVhbT1lc3BuMg==" },
			{ label: "Servidor 4 (StreamTP)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/c3RyZWFtPWVzcG4y" },
			{ label: "Servidor 5 (HD)", token: "aHR0cHM6Ly90dmY5MC5jb20vaGQucGhwP3N0cmVhbT1lc3BuMg==" },
			{ label: "Servidor 6 (Respaldo)", token: "aHR0cHM6Ly9zdHJlYW10cDk5YS5zYnMvZ2xvYmFsMS5waHA/Y2hhbm5lbD1lc3BuMg==" },
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
	const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
	const [autoFailoverEnabled, setAutoFailoverEnabled] = useState<boolean>(true);
	const failoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const handleNextServer = (isAuto = false) => {
		const sources = STREAMS_CONFIG[activeTab] || [];
		if (sources.length <= 1) return;

		const nextIdx = (serverIndex + 1) % sources.length;
		setServerIndex(nextIdx);
		setIframeLoaded(false);
		setSwitchNotice(
			isAuto
				? `⚠️ Servidor anterior no respondió. Conmutando a: ${sources[nextIdx]?.label}`
				: `Conectando con: ${sources[nextIdx]?.label}`
		);
		triggerHaptic("medium");
	};

	const handleTabSelect = (tab: keyof typeof STREAMS_CONFIG) => {
		setActiveTab(tab);
		setServerIndex(0);
		setIframeLoaded(false);
		setSwitchNotice(null);
		triggerHaptic("light");
	};

	useEffect(() => {
		setIframeLoaded(false);
		if (failoverTimeoutRef.current) {
			clearTimeout(failoverTimeoutRef.current);
		}

		if (!autoFailoverEnabled) return;

		const sources = STREAMS_CONFIG[activeTab] || [];
		// Si quedan espejos por probar antes de agotar la lista
		if (serverIndex < sources.length - 1) {
			failoverTimeoutRef.current = setTimeout(() => {
				setIframeLoaded((loaded) => {
					if (!loaded) {
						const nextIdx = serverIndex + 1;
						setServerIndex(nextIdx);
						setSwitchNotice(
							`⚠️ El servidor actual no respondió a tiempo. Conmutando automáticamente a: ${sources[nextIdx]?.label}`
						);
						triggerHaptic("heavy");
					}
					return loaded;
				});
			}, 7500);
		}

		return () => {
			if (failoverTimeoutRef.current) {
				clearTimeout(failoverTimeoutRef.current);
			}
		};
	}, [serverIndex, activeTab, autoFailoverEnabled]);

	const trackStatus = useDataStore((state) => state.state?.TrackStatus?.Status);
	const sessionInfo = useDataStore((state) => state.state?.SessionInfo);
	const activeRace = sessionInfo?.Meeting?.Name || "Gran Premio";

	// 🕒 DETECCIÓN INTELIGENTE DE HORARIOS DE SESIÓN (FP1, FP2, FP3, Qualy, Sprint, Carrera)
	const [sessions, setSessions] = useState<ScheduleSession[]>([]);
	const [isLive, setIsLive] = useState<boolean>(false);
	const [activeSessionName, setActiveSessionName] = useState<string | null>(null);
	const [nextSessionName, setNextSessionName] = useState<string | null>(null);
	const [countdownText, setCountdownText] = useState<string>("");

	// 📡 Verificación directa contra el backend en tiempo real de F1 (lluvia, banderas rojas, retrasos)
	const [isBackendSessionLive, setIsBackendSessionLive] = useState<boolean>(false);
	const [backendSessionTitle, setBackendSessionTitle] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		const checkBackendLive = async () => {
			const isSimActive = typeof window !== "undefined" && (sessionStorage.getItem("f1_pitwall_sim") === "active" || simulator.getActive());
			if (isSimActive) {
				if (isMounted) {
					setIsBackendSessionLive(true);
					setBackendSessionTitle("GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026 · CARRERA (SIMULACIÓN)");
				}
				return;
			}

			try {
				const liveUrl = process.env.NEXT_PUBLIC_LIVE_URL || "https://blackbox-f1-realtime-docker.onrender.com";
				const res = await fetch(`${liveUrl}/api/current`, { cache: "no-store" });
				if (!res.ok) return;
				const data = await res.json();
				if (!isMounted) return;

				const sessionName = data?.SessionInfo?.Name;
				const archiveStatus = data?.SessionInfo?.ArchiveStatus?.Status;
				const hbUtc = data?.Heartbeat?.Utc;
				const isRecent = hbUtc && Math.abs(Date.now() - new Date(hbUtc).getTime()) < 8 * 60 * 1000;

				if (sessionName && sessionName !== "None" && archiveStatus !== "Complete" && isRecent) {
					setIsBackendSessionLive(true);
					setBackendSessionTitle(sessionName);
				} else if (archiveStatus === "Complete") {
					setIsBackendSessionLive(false);
				}
			} catch {
				// Silenciar errores
			}
		};

		checkBackendLive();
		const interval = setInterval(checkBackendLive, 10000);
		return () => {
			isMounted = false;
			clearInterval(interval);
		};
	}, []);

	// 🔒 Refs para sincronización limpia y continua del temporizador de 1 segundo
	const isLiveRef = React.useRef(isLive);
	const bypassRef = React.useRef(bypass);
	const isUnlockingRef = React.useRef(isUnlocking);

	useEffect(() => {
		isLiveRef.current = isLive;
		bypassRef.current = bypass;
		isUnlockingRef.current = isUnlocking;
	}, [isLive, bypass, isUnlocking]);

	// Cargar cronograma del fin de semana y verificar modo simulación o token
	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			const secretToken = process.env.NEXT_PUBLIC_SIMULATION_TOKEN || "sim_sec_e8d2c4b7a1f930_pitwall2026";
			const isTokenMatch = Boolean(secretToken && secretToken.length >= 16 && params.get("test_mode") === secretToken);
			const isSimActive = sessionStorage.getItem("f1_pitwall_sim") === "active" || simulator.getActive();

			if (isSimActive && !simulator.getActive()) {
				simulator.start();
			}

			if (isTokenMatch || isSimActive) {
				setBypass(true);
			}
		}

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

	// Evaluar cada 1 segundo para cuenta regresiva 100% fluida y apertura automática
	useEffect(() => {
		const updateStatus = () => {
			const status = evaluateSessionStatus(sessions);
			const isTelemetryActive = Boolean(
				(trackStatus &&
				parseInt(trackStatus, 10) > 0 &&
				sessionInfo?.Name &&
				sessionInfo?.Name !== "None") ||
				isBackendSessionLive
			);

			const isSimActive = typeof window !== "undefined" && (
				sessionStorage.getItem("f1_pitwall_sim") === "active" || simulator.getActive()
			);
			const shouldBeLive = status.isLiveWindow || isTelemetryActive || isBackendSessionLive || isSimActive || bypass;

			if (shouldBeLive) {
				const displayTitle = isSimActive
					? "GRAN PREMIO DE LA CIUDAD DE MÉXICO 2026 · CARRERA (SIMULACIÓN)"
					: (backendSessionTitle || status.activeSessionName || sessionInfo?.Name || "Sesión Oficial");

				if (isSimActive || bypassRef.current) {
					// En modo simulación o bypass manual, desbloquear DE INMEDIATO sin bloquear en pantalla de motores apagados
					setIsLive(true);
					setActiveSessionName(translateSessionName(displayTitle));
					setCountdownText("");
				} else if (!isLiveRef.current && !isUnlockingRef.current) {
					// 🚀 Secuencia animada de desbloqueo al llegar a los 15 min antes o por F1 en vivo
					setIsUnlocking(true);
					triggerHaptic("heavy");
					setTimeout(() => {
						setIsLive(true);
						setActiveSessionName(translateSessionName(displayTitle));
						setCountdownText("");
						setTimeout(() => {
							setIsUnlocking(false);
						}, 200);
					}, 950);
				} else if (isLiveRef.current) {
					setActiveSessionName(translateSessionName(displayTitle));
					setCountdownText("");
				}
			} else {
				if (!bypassRef.current && !isUnlockingRef.current) {
					setIsLive(false);
					setActiveSessionName(null);
					const rawNext = status.nextSessionName;
					setNextSessionName(rawNext ? translateSessionName(rawNext) : null);
					if (status.nextSessionStart) {
						const diff = Math.max(0, status.nextSessionStart - Date.now());
						setCountdownText(formatRemainingTime(diff));
					} else {
						setCountdownText("");
					}
				}
			}
		};

		updateStatus();
		const interval = setInterval(updateStatus, 1000);
		return () => clearInterval(interval);
	}, [trackStatus, sessions, sessionInfo, isBackendSessionLive, backendSessionTitle]);

	const handleLockClick = () => {
		if (isUnlocking || isLive || bypass) return;

		clickCountRef.current += 1;

		if (clickCountRef.current >= 3) {
			clickCountRef.current = 0;
			if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
			setIsUnlocking(true);
			triggerHaptic("heavy");
			setTimeout(() => {
				setBypass(true);
				setTimeout(() => {
					setIsUnlocking(false);
				}, 200);
			}, 950);
		} else {
			triggerHaptic("light");
			if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
			clickTimeoutRef.current = setTimeout(() => {
				clickCountRef.current = 0;
			}, 1200);
		}
	};

	return (
		<div className="flex h-screen w-full md:pt-2 md:pr-2 md:pb-2 font-mono text-white select-none">
			{/* 🚀 SIDEBAR INTEGRADO */}
			<Sidebar key="sidebar" connected={true} />

			{/* CONTENIDO PRINCIPAL */}
			<div className="flex h-full w-full flex-1 flex-col overflow-auto no-scrollbar md:gap-2">
				{/* 🛑 CASO 1: {t("streams_page.engines_off_title", "MOTORES APAGADOS")} (CANDADO CERRADO) */}
				{!isLive && !bypass ? (
					<div className="pt-4 w-full mx-auto px-4 sm:px-6 h-full flex flex-col items-center justify-center relative">
						<div className="absolute top-4 left-4 z-20">
							<SidenavButton
								onClick={() => {
									triggerHaptic("light");
									toggleSidebar();
								}}
								title={pinnedSidebar ? "Ocultar menú lateral" : "Fijar menú lateral"}
							/>
						</div>

						<div
							className={`max-w-md w-full border border-zinc-900 bg-[#0c0a05]/60 backdrop-blur-md p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-700 ease-out ${
								isUnlocking
									? "opacity-0 scale-95 blur-xs pointer-events-none"
									: "opacity-100 scale-100 blur-0 animate-fade-in"
							}`}
						>
							<div
								onClick={handleLockClick}
								className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 cursor-pointer select-none active:scale-90 group ${
									isUnlocking
										? "bg-gradient-to-b from-emerald-950/90 to-zinc-950 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_50px_rgba(16,185,129,0.6)] scale-110"
										: "bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 hover:border-amber-500/70 text-amber-500/80 hover:text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
								}`}
							>
								{isUnlocking && (
									<>
										<div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/80 animate-ping pointer-events-none" />
										<div className="absolute -inset-4 rounded-3xl bg-emerald-500/25 blur-xl animate-pulse pointer-events-none" />
									</>
								)}
								{isUnlocking ? (
									<Unlock className="w-9 h-9 text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.9)] animate-bounce duration-500" />
								) : (
									<Lock className="w-8 h-8 group-hover:scale-110 duration-300 transition-transform" />
								)}
							</div>

							<span
								className={`text-[11px] font-black uppercase tracking-widest mb-2 transition-colors duration-300 ${
									isUnlocking ? "text-emerald-400 animate-pulse" : "text-zinc-500"
								}`}
							>
								{isUnlocking ? t("streams_page.connecting_badge", "ACCESO SATELITAL CONCEDIDO") : t("streams_page.engines_off_badge", "FEED SATELITAL EN ESPERA")}
							</span>
							<h2
								className={`text-xl font-black uppercase tracking-tight transition-colors duration-300 ${
									isUnlocking ? "text-emerald-300 animate-pulse" : "text-zinc-100"
								}`}
							>
								{isUnlocking ? t("streams_page.connecting_title", "CONECTANDO CON EL PIT-WALL...") : t("streams_page.engines_off_title", "MOTORES APAGADOS")}
							</h2>

							{isUnlocking ? (
								<div className="my-5 w-full px-5 py-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
									<span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
										<span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
										{t("streams_page.syncing_signal", "Sincronizando señal en vivo")}
									</span>
									<div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
										<div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-full animate-pulse" />
									</div>
								</div>
							) : nextSessionName && countdownText ? (
								<div className="my-5 w-full px-4 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col items-center">
									<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
										Próxima Sesión:{" "}
										<span className="text-amber-400 font-black">
											{translateSessionName(nextSessionName)}
										</span>
									</span>
									<span className="text-3xl font-black text-white font-mono mt-1 tracking-widest text-emerald-400 tabular-nums">
										{countdownText}
									</span>
									<span className="text-[9px] text-zinc-500 mt-1">
										{t("streams_page.lock_notice", "El candado se abre automáticamente 15 minutos antes")}
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
						</div>
					</div>
				) : (
					/* 🟢 CASO 2: TRANSMISIONES EN VIVO (CANDADO ABIERTO) */
					<div className="pt-2 w-full mx-auto px-4 sm:px-6 max-w-[1920px] animate-in fade-in zoom-in-[0.98] duration-700 ease-out">
						{/* CABECERA HUD CON BOTÓN DE SIDEBAR */}
						<div className="my-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-4">
							<div className="flex items-center gap-3">
								<SidenavButton
									onClick={() => {
										triggerHaptic("light");
										toggleSidebar();
									}}
									title={pinnedSidebar ? "Ocultar menú lateral" : "Fijar menú lateral"}
								/>
								<div>
									<div className="flex items-center gap-2.5">
										<h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-zinc-100 border-l-4 border-emerald-500 pl-3">
											{t("streams_page.live_streams_title", "Transmisiones en Vivo")}
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
											? t("streams_page.test_access", "Acceso manual de prueba")
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
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
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

							{/* CANAL F1 TV (OFICIAL 1080P) */}
							<button
								onClick={() => handleTabSelect("F1TV")}
								className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 h-28 gap-2 cursor-pointer ${
									activeTab === "F1TV"
										? "text-white border-red-500 shadow-[0_10px_25px_rgba(239,68,68,0.35)] animate-pulse"
										: "bg-zinc-950/60 text-zinc-400 border-zinc-900 hover:border-red-900"
								}`}
							>
								<img src="/f1tv.png" alt="F1 TV" className="h-10 w-auto max-w-[85%] object-contain" />
								<span className="font-black text-[10px] uppercase tracking-widest text-center mt-auto">F1 TV (1080p)</span>
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
															setIframeLoaded(false);
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

										<div className="flex items-center gap-2 flex-wrap">
											{/* Botón de cambio rápido manual */}
											<button
												onClick={() => handleNextServer(false)}
												className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-amber-400 border border-zinc-800 transition-all cursor-pointer"
												title="Saltar al siguiente servidor de respaldo"
											>
												<RefreshCw className="w-3 h-3" />
												<span>{t("streams_page.try_next_server", "¿No carga? Probar siguiente")}</span>
											</button>

											{/* Indicador de Failover Automático */}
											<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
												<ShieldCheck className="w-3 h-3 text-emerald-400" />
												<span>{t("streams_page.auto_failover", "Auto-Failover Activo")}</span>
											</div>
										</div>

										{switchNotice && (
											<div className="w-full mt-1">
												<span className="text-[10px] font-bold text-amber-400 animate-pulse bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg block">
													{switchNotice}
												</span>
											</div>
										)}
									</div>

									{/* REPRODUCTOR DE STREAM SELECCIONADO */}
									<div onContextMenu={(e) => e.preventDefault()} className="w-full aspect-video rounded-2xl overflow-hidden border border-zinc-900 bg-black shadow-2xl relative select-none">
										{!iframeLoaded && (
											<div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 z-10 pointer-events-none gap-2">
												<div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
												<p className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-widest">
													{t("streams_page.connecting_with", "Conectando con")} {currentSource?.label}...
												</p>
												<p className="text-[9px] text-zinc-500">
													{t("streams_page.auto_switch_active", "Conmutación automática de respaldo activa (7.5s)")}
												</p>
											</div>
										)}

										<iframe
											key={currentSource?.url}
											src={currentSource?.url}
											title="F1 Live Stream"
											className="w-full h-full border-0 relative z-20"
											allowFullScreen
											allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
											onLoad={() => {
												setIframeLoaded(true);
												if (failoverTimeoutRef.current) {
													clearTimeout(failoverTimeoutRef.current);
												}
											}}
											onError={() => {
												handleNextServer(true);
											}}
										/>
									</div>
								</>
							);
						})()}

						{/* RECOMENDACIÓN DE REPRODUCCIÓN */}
						<div className="w-full mx-auto p-4 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-xs mt-6 mb-6">
							<div className="space-y-1">
								<p className="font-mono font-black text-zinc-300 uppercase tracking-wider">{t("streams_page.recommendation_title", "Recomendación para la transmisión")}</p>
								<p className="text-zinc-500">{t("streams_page.recommendation_desc", "Para una experiencia limpia y sin ventanas emergentes de los reproductores, se sugiere utilizar un bloqueador de anuncios.")}</p>
							</div>
							<div className="flex flex-wrap gap-2 shrink-0">
								<a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono font-bold text-[11px] uppercase tracking-wide transition-all">uBlock Origin</a>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
