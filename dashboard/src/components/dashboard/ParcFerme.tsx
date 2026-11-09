"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import Flag from "@/components/Flag";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";
import { triggerHaptic } from "@/lib/haptics";
import { getSmartGpContext, type SmartGpContext } from "@/lib/sessionSchedule";

interface DriverResult {
	pos: string;
	number: string;
	code: string;
	name: string;
	team: string;
	constructorId: string;
	points?: string;
	gapTime: string;
	isDNF: boolean;
	dnfReason?: string;
	gridPos?: number;
	qualyPos?: number;
	delta?: number;
	penaltyNote?: string | null;
}

type SessionTab = "RACE" | "QUALY" | "SPRINT" | "FP3" | "FP2" | "FP1" | "SQ";

const driverNationalityMap: Record<string, string> = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "gb",
	LAW: "nz", ANT: "it", CAM: "br", HIR: "jp"
};

const driverTeamColorMap: Record<string, { bg: string; text: string }> = {
	NOR: { bg: "#ff8700", text: "#ffffff" },
	PIA: { bg: "#ff8700", text: "#ffffff" },
	LEC: { bg: "#e10600", text: "#ffffff" },
	HAM: { bg: "#e10600", text: "#ffffff" },
	VER: { bg: "#061d43", text: "#ffffff" },
	HAD: { bg: "#061d43", text: "#ffffff" },
	LIN: { bg: "#061d43", text: "#ffffff" },
	PER: { bg: "#94a3b8", text: "#000000" }, // Cadillac F1 Team
	RUS: { bg: "#00d2be", text: "#ffffff" },
	ANT: { bg: "#00d2be", text: "#ffffff" },
	ALO: { bg: "#006f62", text: "#ffffff" },
	STR: { bg: "#006f62", text: "#ffffff" },
	GAS: { bg: "#0093cc", text: "#ffffff" }, // Alpine
	COL: { bg: "#0093cc", text: "#ffffff" }, // Alpine
	BEA: { bg: "#e10600", text: "#ffffff" }, // Haas F1 Team
	CAM: { bg: "#e10600", text: "#ffffff" }, // Haas F1 Team
	HIR: { bg: "#e10600", text: "#ffffff" }, // Haas F1 Team
	OCO: { bg: "#e10600", text: "#ffffff" },
	MAG: { bg: "#373737", text: "#ffffff" },
	LAW: { bg: "#4b77ff", text: "#ffffff" },
	TSU: { bg: "#4b77ff", text: "#ffffff" },
	ALB: { bg: "#005aff", text: "#ffffff" },
	SAI: { bg: "#005aff", text: "#ffffff" },
	BOT: { bg: "#94a3b8", text: "#000000" }, // Cadillac F1 Team
	HUL: { bg: "#c0c0c0", text: "#000000" }, // Audi
	BOR: { bg: "#c0c0c0", text: "#000000" }, // Audi
};

const TeamLogo: React.FC<{ teamName: string }> = ({ teamName }) => {
	const [fallbackIndex, setFallbackIndex] = useState(0);
	const cleanName = (teamName || "").toLowerCase().trim();

	const fallbacks: string[] = [];
	if (cleanName.includes("red bull")) {
		fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg");
	} else if (cleanName.includes("cadillac")) {
		fallbacks.push("/team-logos/cadillac-f1-team.svg", "/team-logos/cadillac.svg");
	} else if (cleanName.includes("alpine")) {
		fallbacks.push("/team-logos/alpine-f1-team.svg", "/team-logos/alpine.svg");
	} else if (cleanName.includes("rb") || cleanName.includes("racing bulls")) {
		fallbacks.push("/team-logos/rb-f1-team.svg", "/team-logos/rb.svg");
	} else if (cleanName.includes("haas")) {
		fallbacks.push("/team-logos/haas-f1-team.svg", "/team-logos/haas.svg");
	} else if (cleanName.includes("audi") || cleanName.includes("sauber")) {
		fallbacks.push("/team-logos/audi.svg", "/team-logos/kick-sauber.svg");
	} else if (cleanName.includes("williams")) {
		fallbacks.push("/team-logos/williams.svg", "/team-logos/williams-racing.svg");
	} else if (cleanName.includes("ferrari")) {
		fallbacks.push("/team-logos/ferrari.svg");
	} else if (cleanName.includes("mercedes")) {
		fallbacks.push("/team-logos/mercedes.svg");
	} else if (cleanName.includes("mclaren")) {
		fallbacks.push("/team-logos/mclaren.svg");
	} else if (cleanName.includes("aston")) {
		fallbacks.push("/team-logos/aston-martin.svg");
	} else {
		fallbacks.push(`/team-logos/${cleanName.replaceAll(" ", "-")}.svg`);
	}
	fallbacks.push(
		"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>"
	);

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className="w-5 h-5 object-contain"
			onError={() => {
				if (fallbackIndex < fallbacks.length - 1) setFallbackIndex(fallbackIndex + 1);
			}}
		/>
	);
};

interface ParcFermeProps {
	onOpenCircuit?: (gpName?: string, countryCode?: string) => void;
	onGpLoaded?: (gpName: string, countryCode: string) => void;
}

export const ParcFerme: React.FC<ParcFermeProps> = ({ onOpenCircuit, onGpLoaded }) => {
	const gridDensity = useSettingsStore((state) => state.gridDensity);
	const isCompact = gridDensity === "compact";

	const liveSession = useDataStore((state) => state.state?.SessionInfo);
	const liveTiming = useDataStore((state) => state.state?.TimingData);
	const liveStats = useDataStore((state) => state.state?.TimingStats);
	const liveDrivers = useDataStore((state) => state.state?.DriverList);
	const liveLapCount = useDataStore((state) => state.state?.LapCount);
	const liveSessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);

	const roundNumber = (liveSession?.Meeting as any)?.Number || (liveSession as any)?.Number;
	const currentGpName = liveSession?.Meeting?.Name;
	const currentCountryName = liveSession?.Meeting?.Country?.Name;
	const initialCountry = (currentGpName ? getCountryCodeForGp(currentGpName, currentCountryName) : null) || "bra";
	const initialGpName = currentGpName ? translateGpName(currentGpName) : "Gran Premio de São Paulo";

	const getInitialTab = (): SessionTab => {
		if (typeof window !== "undefined") {
			const saved = sessionStorage.getItem("bb_parc_ferme_tab") as SessionTab;
			if (saved && ["FP1", "FP2", "FP3", "QUALY", "SPRINT", "SQ", "RACE"].includes(saved)) {
				return saved;
			}
		}
		const sName = (liveSession?.Name || "").toLowerCase();
		const sType = (liveSession?.Type || "").toLowerCase();
		if (
			sName.includes("qualifying") ||
			sType.includes("qualifying") ||
			sName.includes("shootout") ||
			sType.includes("shootout")
		) {
			return "QUALY";
		}
		if (sName.includes("sprint") || sType.includes("sprint")) {
			return "SPRINT";
		}
		if (sName.includes("practice 3") || sType.includes("practice 3")) return "FP3";
		if (sName.includes("practice 2") || sType.includes("practice 2")) return "FP2";
		if (sName.includes("practice 1") || sType.includes("practice 1")) return "FP1";
		if (sName === "race" || sType === "race") return "RACE";

		// Inferencia por día de la semana mientras hidrata el store
		const day = new Date().getDay(); // 6 = Sábado, 0 = Domingo, 5 = Viernes
		if (day === 6) return "QUALY";
		if (day === 5) return "FP1";
		return "RACE";
	};

	const [smartContext, setSmartContext] = useState<SmartGpContext | null>(null);
	const [activeTab, setActiveTab] = useState<SessionTab>(getInitialTab);
	const [tabManuallySelected, setTabManuallySelected] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			return sessionStorage.getItem("bb_parc_ferme_manual") === "true";
		}
		return false;
	});
	const [results, setResults] = useState<DriverResult[]>([]);
	const sessionResultsCache = useRef<Record<string, DriverResult[]>>({});
	const [gpName, setGpName] = useState(initialGpName);
	const [countryCode, setCountryCode] = useState<string>(initialCountry);
	const [raceDate, setRaceDate] = useState<string>(() => (liveSession?.StartDate ? liveSession.StartDate.split("T")[0] : ""));
	const [loading, setLoading] = useState(true);
	const [hasSprint, setHasSprint] = useState(false);

	useEffect(() => {
		if (gpName && onGpLoaded) {
			onGpLoaded(gpName, countryCode);
		}
	}, [gpName, countryCode, onGpLoaded]);
	const [qualyViewMode, setQualyViewMode] = useState<"times" | "grid">("times");
	const [startingGrid, setStartingGrid] = useState<
		{ position: number; driver_number: string; penalty?: string | null }[] | null
	>(null);
	const [gridLoading, setGridLoading] = useState(false);

	// 🚦 Consulta de grilla oficial de largada para clasificación
	useEffect(() => {
		let isMounted = true;
		if (activeTab === "QUALY" || activeTab === "SQ") {
			setGridLoading(true);
			fetch("/api/starting-grid")
				.then((r) => r.json())
				.then((data) => {
					if (!isMounted) return;
					if (data?.available && Array.isArray(data?.grid) && data.grid.length > 0) {
						setStartingGrid(data.grid);
						setQualyViewMode("grid");
					} else {
						setStartingGrid(null);
						setQualyViewMode("times");
					}
				})
				.catch((err) => {
					console.warn("[ParcFerme] Error fetching starting grid:", err);
					if (isMounted) setStartingGrid(null);
				})
				.finally(() => {
					if (isMounted) setGridLoading(false);
				});
		}
		return () => {
			isMounted = false;
		};
	}, [activeTab]);

	// 🔄 Lista de resultados procesada según el modo seleccionado (Tiempos o Grilla de Salida)
	const displayResults = useMemo(() => {
		if (activeTab === "QUALY" && qualyViewMode === "grid") {
			if (!startingGrid || startingGrid.length === 0) {
				return [];
			}
			return startingGrid
				.map((gridItem) => {
					const match = results.find(
						(r) => String(r.number) === String(gridItem.driver_number)
					);
					if (!match) return null;
					const qualyPos = parseInt(match.pos, 10);
					const gridPos = gridItem.position;
					const delta = isNaN(qualyPos) ? 0 : qualyPos - gridPos;
					return {
						...match,
						pos: String(gridPos),
						gridPos,
						qualyPos,
						delta,
						penaltyNote: gridItem.penalty,
					};
				})
				.filter(Boolean) as DriverResult[];
		}
		return results;
	}, [activeTab, qualyViewMode, startingGrid, results]);

	// 🧠 Detección inteligente de GP y sesión según calendario y día de la semana
	useEffect(() => {
		let isMounted = true;
		getSmartGpContext().then((ctx) => {
			if (!isMounted) return;
			setSmartContext(ctx);
			const targetGp = liveSession?.Meeting?.Name || ctx.raceName;
			const targetCountry = liveSession?.Meeting?.Country?.Name || ctx.country;
			setGpName(translateGpName(targetGp));
			setCountryCode(getCountryCodeForGp(targetGp, targetCountry) || ctx.countryCode);
			setRaceDate(liveSession?.StartDate ? liveSession.StartDate.split("T")[0] : ctx.raceDate);
			setHasSprint(ctx.hasSprint);
			const storedTab = typeof window !== "undefined" ? (sessionStorage.getItem("bb_parc_ferme_tab") as SessionTab) : null;
			if (storedTab && ctx.availableTabs.includes(storedTab)) {
				setActiveTab(storedTab);
			} else if (!tabManuallySelected || !ctx.availableTabs.includes(activeTab)) {
				setActiveTab(ctx.defaultTab);
			}
		});
		return () => {
			isMounted = false;
		};
	}, [liveSession?.Meeting?.Name, liveSession?.StartDate, tabManuallySelected, activeTab]);

	useEffect(() => {
		async function fetchSessionData() {
			const isPractice = activeTab === "FP1" || activeTab === "FP2" || activeTab === "FP3";

			// 🛡️ Si ya tenemos resultados para esta sesión en memoria, mostrarlos al instante (0ms) sin parpadeo
			if (sessionResultsCache.current[activeTab] && sessionResultsCache.current[activeTab].length > 0) {
				setResults(sessionResultsCache.current[activeTab]);
				setLoading(false);
				// Para sesiones de práctica ya concluidas, evitar saturar la API en cada paquete del websocket
				if (isPractice) return;
			} else {
				setLoading(true);
			}

			try {
				let currentTiming = liveTiming;
				let currentSession = liveSession;
				let currentStats = liveStats;
				let currentDrivers = liveDrivers;
				let currentLap = liveLapCount;

				// 🚀 Resiliencia instantánea: Si el store aún no terminó de hidratar desde el socket, consultamos /api/current directamente
				if (!currentTiming?.Lines || Object.keys(currentTiming.Lines).length === 0) {
					try {
						const liveBase = process.env.NEXT_PUBLIC_LIVE_URL || "https://blackbox-f1-realtime-docker.onrender.com";
						const liveRes = await fetch(`${liveBase}/api/current`, { cache: "no-store" });
						if (liveRes.ok) {
							const liveData = await liveRes.json();
							if (liveData?.TimingData?.Lines && Object.keys(liveData.TimingData.Lines).length > 0) {
								currentTiming = liveData.TimingData;
								currentSession = liveData.SessionInfo || currentSession;
								currentStats = liveData.TimingStats || currentStats;
								currentDrivers = liveData.DriverList || currentDrivers;
								currentLap = liveData.LapCount || currentLap;
							}
						}
					} catch (err) {
						console.warn("[ParcFerme] Error obteniendo /api/current de respaldo:", err);
					}
				}

				const sessionName = (currentSession?.Name || "").toLowerCase();
				const sessionType = (currentSession?.Type || "").toLowerCase();
				const isQualySession =
					sessionName.includes("qualifying") ||
					sessionType.includes("qualifying") ||
					sessionName.includes("shootout") ||
					sessionType.includes("shootout");
				const isRaceSession =
					(sessionName === "race" || sessionType === "race") &&
					!sessionName.includes("sprint");
				const isSprintSession =
					sessionName.includes("sprint") &&
					!sessionName.includes("shootout") &&
					!sessionName.includes("qual");

				const hasLiveLines = Boolean(
					currentTiming?.Lines && Object.keys(currentTiming.Lines).length > 0
				);

				const effectiveGpName = currentSession?.Meeting?.Name || currentGpName;
				const effectiveCountryName = currentSession?.Meeting?.Country?.Name || currentCountryName;

				// 1. PRIORIDAD MÁXIMA: Telemetría oficial en vivo o de sesión recién concluida
				if (hasLiveLines) {
					// 1.A CLASIFICACIÓN / SHOOTOUT EN VIVO O RECIÉN FINALIZADA
					if ((activeTab === "QUALY" || activeTab === "SQ") && isQualySession) {
						if (effectiveGpName) {
							setGpName(translateGpName(effectiveGpName));
							setCountryCode(getCountryCodeForGp(effectiveGpName, effectiveCountryName) || "bra");
						}
						if (currentSession?.StartDate) {
							setRaceDate(currentSession.StartDate.split("T")[0]);
						}

						const parseMs = (s?: string) => {
							if (!s || !s.includes(":")) return null;
							const [m, rest] = s.split(":");
							const [sec, ms] = rest.split(".");
							return parseInt(m, 10) * 60000 + parseInt(sec, 10) * 1000 + parseInt(ms || "0", 10);
						};

						const getBestLap = (l: any): string => {
							if (l.BestLapTime?.Value) return l.BestLapTime.Value;
							if (currentStats?.Lines?.[l.RacingNumber]?.PersonalBestLapTime?.Value) {
								return currentStats.Lines[l.RacingNumber].PersonalBestLapTime.Value;
							}
							if (Array.isArray(l.BestLapTimes)) {
								for (let i = l.BestLapTimes.length - 1; i >= 0; i--) {
									if (l.BestLapTimes[i]?.Value) return l.BestLapTimes[i].Value;
								}
							}
							return "";
						};

						const lines = Object.values(currentTiming!.Lines).sort((a: any, b: any) => {
							const posA = parseInt(a.Position, 10) || 99;
							const posB = parseInt(b.Position, 10) || 99;
							return posA - posB;
						});

						const p1Line = lines.find((l: any) => parseInt(l.Position, 10) === 1) || lines[0];
						const p1Best = p1Line ? getBestLap(p1Line) : "";
						const p1Ms = parseMs(p1Best);

						const liveResults: DriverResult[] = lines.map((line: any) => {
							const posNum = parseInt(line.Position, 10) || 99;
							const drv = currentDrivers?.[line.RacingNumber];
							const isDNF = Boolean(line.Retired || line.Stopped);
							const code = drv?.Tla || line.RacingNumber;
							const name = drv?.FullName || drv?.BroadcastName || `Piloto #${line.RacingNumber}`;
							const team = drv?.TeamName || "Equipo";
							const best = getBestLap(line);
							const driverMs = parseMs(best);

							let gapTime = "";
							if (posNum === 1) {
								gapTime = best || "POLE";
							} else if (driverMs && p1Ms && driverMs >= p1Ms) {
								gapTime = `+${((driverMs - p1Ms) / 1000).toFixed(3)}s`;
							} else if (best) {
								gapTime = best;
							} else if (isDNF) {
								gapTime = "DNF";
							} else {
								gapTime = "S/T";
							}

							return {
								pos: String(posNum),
								number: String(line.RacingNumber),
								code,
								name,
								team,
								constructorId: team.toLowerCase().replaceAll(" ", "-"),
								points: "",
								gapTime,
								isDNF,
								dnfReason: isDNF ? "DNF" : undefined,
							};
						});

						if (liveResults.length > 0) {
							sessionResultsCache.current[activeTab] = liveResults;
							setResults(liveResults);
							setLoading(false);
							return;
						}
					}

					// 1.B CARRERA O SPRINT EN VIVO O RECIÉN FINALIZADA
					if (
						(activeTab === "RACE" && isRaceSession) ||
						(activeTab === "SPRINT" && isSprintSession)
					) {
						if (effectiveGpName) {
							setGpName(translateGpName(effectiveGpName));
							setCountryCode(getCountryCodeForGp(effectiveGpName, effectiveCountryName) || "bra");
						}
						if (currentSession?.StartDate) {
							setRaceDate(currentSession.StartDate.split("T")[0]);
						}

						const f1Points =
							activeTab === "RACE"
								? [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
								: [8, 7, 6, 5, 4, 3, 2, 1];

						const lines = Object.values(currentTiming!.Lines).sort((a: any, b: any) => {
							const posA = parseInt(a.Position, 10) || 99;
							const posB = parseInt(b.Position, 10) || 99;
							return posA - posB;
						});

						const liveResults: DriverResult[] = lines.map((line: any) => {
							const posNum = parseInt(line.Position, 10) || 99;
							const drv = currentDrivers?.[line.RacingNumber];
							const isDNF = Boolean(line.Retired || line.Stopped);
							const code = drv?.Tla || line.RacingNumber;
							const name = drv?.FullName || drv?.BroadcastName || `Piloto #${line.RacingNumber}`;
							const team = drv?.TeamName || "Equipo";

							let gapTime = "";
							if (posNum === 1) {
								gapTime = `${line.NumberOfLaps || currentLap?.TotalLaps || 71} VUELTAS`;
							} else if (isDNF) {
								gapTime = line.NumberOfLaps ? `DNF (Vta ${line.NumberOfLaps})` : "DNF · RETIRADO";
							} else {
								gapTime = line.GapToLeader || line.IntervalToPositionAhead?.Value || "INTERVAL";
							}

							let pointsStr = "";
							if (posNum <= f1Points.length && !isDNF) {
								pointsStr = `+${f1Points[posNum - 1]} PTS`;
							}

							return {
								pos: String(posNum),
								number: String(line.RacingNumber),
								code,
								name,
								team,
								constructorId: team.toLowerCase().replaceAll(" ", "-"),
								points: pointsStr,
								gapTime,
								isDNF,
								dnfReason: isDNF ? "DNF" : undefined,
							};
						});

						if (liveResults.length > 0) {
							sessionResultsCache.current[activeTab] = liveResults;
							setResults(liveResults);
							setLoading(false);
							return;
						}
					}
				}

				// 2. Si es práctica libre (FP1, FP2, FP3), consultamos nuestra API de OpenF1
				if (activeTab === "FP1" || activeTab === "FP2" || activeTab === "FP3") {
					const dateParam = raceDate ? `&date=${raceDate}` : (liveSession?.StartDate ? `&date=${liveSession.StartDate.split("T")[0]}` : "");
					try {
						const res = await fetch(`/api/practice?session=${activeTab}${dateParam}`);
						if (res.ok) {
							const data = await res.json();
							if (Array.isArray(data.results) && data.results.length > 0) {
								if (currentGpName) {
									setGpName(translateGpName(currentGpName));
									setCountryCode(getCountryCodeForGp(currentGpName, currentCountryName) || "bra");
								}
								sessionResultsCache.current[activeTab] = data.results;
								setResults(data.results);
								setLoading(false);
								return;
							}
						}
					} catch (e) {
						console.error("Error obteniendo prácticas libres:", e);
					}
					// 🛡️ Si la consulta falló pero ya teníamos resultados en caché, NO borrarlos
					if (sessionResultsCache.current[activeTab] && sessionResultsCache.current[activeTab].length > 0) {
						setResults(sessionResultsCache.current[activeTab]);
						setLoading(false);
						return;
					}
					// 🚫 NUNCA consultar Jolpica para prácticas libres (evita cargar carreras anteriores)
					setResults([]);
					setLoading(false);
					return;
				}

				// 3. Consultamos Jolpica/Ergast para la ronda objetivo actual
				let subpath = "results.json";
				if (activeTab === "QUALY") subpath = "qualifying.json";
				else if (activeTab === "SPRINT" || activeTab === "SQ") subpath = "sprint.json";

				const targetRound = roundNumber || smartContext?.round;
				const endpoints: string[] = [];
				if (targetRound) {
					endpoints.push(`https://api.jolpi.ca/ergast/f1/current/${targetRound}/${subpath}`);
					endpoints.push(`https://api.jolpi.ca/ergast/f1/2026/${targetRound}/${subpath}`);
				}

				// ⚠️ Solo recurrir a /current/last/ si NO estamos en un fin de semana de carrera activo y no tenemos liveSession
				if (!smartContext?.isWeekendActive && !targetRound && !currentGpName) {
					endpoints.push(
						`https://api.jolpi.ca/ergast/f1/current/last/${subpath}`,
						`https://api.jolpi.ca/ergast/f1/last/${subpath}`,
						`https://ergast.com/api/f1/current/last/${subpath}`
					);
				}

				let data: any = null;
				for (const url of endpoints) {
					try {
						const res = await fetch(url);
						if (res.ok) {
							const json = await res.json();
							const races = json?.MRData?.RaceTable?.Races;
							if (Array.isArray(races) && races.length > 0) {
								const r = races[0];
								const hasSessionResults =
									(activeTab === "RACE" && r.Results?.length > 0) ||
									(activeTab === "QUALY" && r.QualifyingResults?.length > 0) ||
									((activeTab === "SPRINT" || activeTab === "SQ") && r.SprintResults?.length > 0);
								if (hasSessionResults) {
									data = json;
									break;
								}
							}
						}
					} catch {
						// Continuar búsqueda
					}
				}

				if (data?.MRData?.RaceTable?.Races?.length > 0) {
					const race = data.MRData.RaceTable.Races[0];
					if (!currentGpName) {
						setGpName(translateGpName(race.raceName));
						setCountryCode(getCountryCodeForGp(race.raceName, race.Circuit?.Location?.country));
					}
					if (race.date) setRaceDate(race.date);

					if (race.Sprint || race.SprintResults) {
						setHasSprint(true);
					}

					let listSource: any[] = [];
					let isTimeBased = false;

					if (activeTab === "RACE") listSource = race.Results || [];
					else if (activeTab === "SPRINT") listSource = race.SprintResults || [];
					else if (activeTab === "QUALY") {
						listSource = race.QualifyingResults || [];
						isTimeBased = true;
					}

					// Si todos los tiempos de clasificación en Jolpica vienen vacíos, consultar las mejores vueltas oficiales en OpenF1
					const allTimesEmpty = isTimeBased && listSource.length > 0 && listSource.every((r: any) => !r.Q3 && !r.Q2 && !r.Q1);
					const openF1BestTimes: Record<string, number> = {};

					if (allTimesEmpty) {
						try {
							const openF1SessionRes = await fetch("https://api.openf1.org/v1/sessions?meeting_key=latest&session_type=Qualifying");
							if (openF1SessionRes.ok) {
								const sessions = await openF1SessionRes.json();
								const qSession = Array.isArray(sessions) && sessions.length > 0 ? sessions[sessions.length - 1] : null;
								if (qSession?.session_key) {
									const lapsRes = await fetch(`https://api.openf1.org/v1/laps?session_key=${qSession.session_key}`);
									if (lapsRes.ok) {
										const lapsData = await lapsRes.json();
										if (Array.isArray(lapsData)) {
											for (const lap of lapsData) {
												if (!lap.lap_duration || lap.lap_duration < 60 || lap.lap_duration > 120) continue;
												const drvNum = String(lap.driver_number);
												if (!openF1BestTimes[drvNum] || lap.lap_duration < openF1BestTimes[drvNum]) {
													openF1BestTimes[drvNum] = lap.lap_duration;
												}
											}
										}
									}
								}
							}
						} catch (openF1Err) {
							console.warn("[ParcFerme] Error fetching OpenF1 qualy laps:", openF1Err);
						}
					}

					const fetchedResults: DriverResult[] = listSource.map((r: any) => {
						const drvNum = String(r.number || r.Driver?.permanentNumber || "0");
						const statusStr = (r.status || "").toLowerCase();
						const isFinished =
							statusStr.includes("finished") ||
							statusStr.includes("+") ||
							statusStr.includes("lap") ||
							statusStr.includes("laps") ||
							isTimeBased;

						const isDNF = !isFinished;

						let gapTime = "";
						let pointsStr = "";

						if (isTimeBased) {
							if (r.Q3 || r.Q2 || r.Q1) {
								gapTime = r.Q3 || r.Q2 || r.Q1;
							} else if (openF1BestTimes[drvNum]) {
								const bestSec = openF1BestTimes[drvNum];
								const mins = Math.floor(bestSec / 60);
								const remSecs = (bestSec % 60).toFixed(3);
								gapTime = `${mins}:${remSecs.padStart(6, "0")}`;
							} else {
								gapTime = "S/T";
							}
						} else if (isDNF) {
							gapTime = `DNF · ${r.status?.toUpperCase() || "OUT"}`;
						} else {
							gapTime = r.Time?.time || (statusStr.includes("+") ? r.status : "INTERVAL");
							const ptsNum = Number(r.points || 0);
							pointsStr = ptsNum > 0 ? `+${ptsNum} PTS` : "";
						}

						return {
							pos: String(r.position),
							number: drvNum,
							code: r.Driver?.code || r.Driver?.familyName?.substring(0, 3).toUpperCase() || "DRV",
							name: `${r.Driver?.givenName || ""} ${r.Driver?.familyName || ""}`.trim(),
							team: r.Constructor?.name || "Equipo",
							constructorId: r.Constructor?.constructorId || "",
							points: pointsStr,
							gapTime,
							isDNF,
							dnfReason: r.status,
						};
					});

					sessionResultsCache.current[activeTab] = fetchedResults;
					setResults(fetchedResults);
					setLoading(false);
					return;
				}

				// 4. Si Jolpica no tiene datos aún para esta sesión, consultamos OpenF1 solo si no es carrera en vivo
				if (!currentGpName && !smartContext?.isWeekendActive) {
					const dateParam = raceDate ? `&date=${raceDate}` : (liveSession?.StartDate ? `&date=${liveSession.StartDate.split("T")[0]}` : "");
					try {
						const openF1Res = await fetch(`/api/practice?session=${activeTab}${dateParam}`);
						if (openF1Res.ok) {
							const openF1Data = await openF1Res.json();
							if (Array.isArray(openF1Data.results) && openF1Data.results.length > 0) {
								sessionResultsCache.current[activeTab] = openF1Data.results;
								setResults(openF1Data.results);
								setLoading(false);
								return;
							}
						}
					} catch (e) {
						console.error("Error consultando OpenF1 para sesión:", e);
					}
				}

				// Si ninguna fuente tiene resultados nuevos, pero ya teníamos datos en caché para esta sesión, mantenerlos
				if (sessionResultsCache.current[activeTab] && sessionResultsCache.current[activeTab].length > 0) {
					setResults(sessionResultsCache.current[activeTab]);
				} else {
					setResults([]);
				}
			} catch (error) {
				console.error("Error al obtener resultados oficiales:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchSessionData();
	}, [activeTab, raceDate, roundNumber, smartContext, liveSession, liveTiming, liveStats, liveDrivers, liveLapCount, liveSessionStatus]);

	return (
		<div className="flex flex-col gap-4 w-full text-white items-center">
			{/* 🏁 CABECERA UNIFICADA PANORÁMICA (TÁCTIL PARA ACTIVAR MODO CIRCUITO EN MÓVIL Y DESKTOP) */}
			<div
				onClick={() => onOpenCircuit ? onOpenCircuit(gpName, countryCode) : undefined}
				className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/75 border border-zinc-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:w-8/12 w-full cursor-pointer hover:border-amber-500/50 hover:bg-zinc-900/80 transition-all group"
				title="Toca para ver el circuito completo en alta resolución"
			>
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<div className="flex items-center justify-center overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900 p-0.5 shadow-md shrink-0">
						<Flag countryCode={countryCode} className="h-6 w-9 object-cover rounded-md" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[11px] uppercase font-mono font-bold tracking-wider text-amber-400">
								{smartContext?.isWeekendActive
									? smartContext.stage === "FRIDAY"
										? "Fin de Semana en Vivo · Libres"
										: smartContext.stage === "SATURDAY"
										? "Fin de Semana en Vivo · Clasificación"
										: smartContext.stage === "SUNDAY"
										? "Fin de Semana en Vivo · Gran Premio"
										: "Gran Premio Finalizado"
									: "Última Ronda Oficial"}
							</span>
							<span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono font-bold uppercase group-hover:border-amber-500/40 group-hover:text-amber-300 transition-colors">
								Ver Circuito 🏁
							</span>
						</div>
						<h2 className="text-sm md:text-base font-black tracking-wide text-zinc-100 font-sans group-hover:text-amber-100 transition-colors">
							{gpName}
						</h2>
					</div>
				</div>

				<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 w-full sm:w-auto justify-center sm:justify-end">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
						<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
					</span>
					<div className="text-left font-mono">
						<p className="text-[11px] font-bold text-zinc-200 uppercase tracking-tight leading-none">
							{smartContext?.isWeekendActive ? "Pista en Espera" : "Pista en Pausa"}
						</p>
						<p className="text-[10px] text-zinc-400 font-medium tracking-normal leading-tight mt-0.5">
							Resultados Oficiales FIA
						</p>
					</div>
				</div>
			</div>

			{/* GRILLA DE RESULTADOS PRINCIPAL */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full justify-center">
				<div className="lg:col-start-3 lg:col-span-8 flex flex-col bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-xl max-w-full shadow-2xl">
					{/* SELECTOR PANORÁMICO DE SESIONES ESTILO PIT-WALL (UNIFICADO EN ORO LÍQUIDO) */}
					<div className="flex flex-col gap-2.5 mb-5 border-b border-zinc-900/80 pb-4">
						<div className="w-full bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-wrap sm:flex-nowrap gap-1.5 select-none relative">
							{(hasSprint
								? [
										{ id: "FP1" as SessionTab, label: "FP1", sub: "Libres 1" },
										{ id: "SQ" as SessionTab, label: "SQ", sub: "Shootout" },
										{ id: "SPRINT" as SessionTab, label: "SPRINT", sub: "Carrera" },
										{ id: "QUALY" as SessionTab, label: "QUALY", sub: "Clasificación" },
										{ id: "RACE" as SessionTab, label: "CARRERA", sub: "Gran Premio" },
								  ]
								: [
										{ id: "FP1" as SessionTab, label: "FP1", sub: "Libres 1" },
										{ id: "FP2" as SessionTab, label: "FP2", sub: "Libres 2" },
										{ id: "FP3" as SessionTab, label: "FP3", sub: "Libres 3" },
										{ id: "QUALY" as SessionTab, label: "QUALY", sub: "Clasificación" },
										{ id: "RACE" as SessionTab, label: "CARRERA", sub: "Gran Premio" },
								  ]
							)
								.filter((tab) => {
									// 🔒 Filtrado progresivo e inteligente: Solo se muestran las sesiones que YA fueron disputadas
									if (smartContext?.availableTabs && smartContext.availableTabs.length > 0) {
										return smartContext.availableTabs.includes(tab.id);
									}
									return true;
								})
								.map((tab) => {
								const isActive = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										onClick={() => {
											setTabManuallySelected(true);
											setActiveTab(tab.id);
											if (typeof window !== "undefined") {
												sessionStorage.setItem("bb_parc_ferme_tab", tab.id);
												sessionStorage.setItem("bb_parc_ferme_manual", "true");
											}
											triggerHaptic("light");
										}}
										className={`relative flex-1 py-2.5 px-3 min-w-[65px] rounded-xl text-center font-mono transition-colors duration-200 select-none cursor-pointer border ${
											isActive
												? "border-amber-400/80 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)]"
												: "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800/60 hover:border-zinc-700/80"
										}`}
									>
										{isActive && (
											<motion.div
												layoutId="activeSessionPill"
												className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-xl -z-0"
												transition={{ type: "spring", stiffness: 380, damping: 30 }}
											/>
										)}
										<span className={`text-xs font-black tracking-wider block relative z-10 ${isActive ? "text-black" : ""}`}>
											{tab.label}
										</span>
										<span
											className={`text-[9px] uppercase tracking-tight block mt-0.5 relative z-10 ${
												isActive ? "text-black/85 font-bold" : "text-zinc-500 font-medium"
											}`}
										>
											{tab.sub}
										</span>
									</button>
								);
							})}
						</div>

						<div className="flex flex-wrap items-center justify-between gap-2 px-1">
							{activeTab === "QUALY" || activeTab === "SQ" ? (
								<div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
									<button
										type="button"
										onClick={() => {
											setQualyViewMode("times");
											triggerHaptic("light");
										}}
										className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 select-none cursor-pointer ${
											qualyViewMode === "times"
												? "bg-amber-400 text-black shadow-md font-black"
												: "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
										}`}
									>
										⏱️ Tiempos Clasificación
									</button>
									<button
										type="button"
										onClick={() => {
											setQualyViewMode("grid");
											triggerHaptic("light");
										}}
										className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
											qualyViewMode === "grid"
												? "bg-amber-400 text-black shadow-md font-black"
												: "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
										}`}
									>
										<span>🚦 Grilla de Salida</span>
										{startingGrid && startingGrid.length > 0 && (
											<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
										)}
									</button>
								</div>
							) : (
								<span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
									{activeTab === "RACE"
										? "Clasificación Final Oficial"
										: activeTab.startsWith("FP")
										? "Mejores Vueltas en Pista"
										: "Puntos Oficiales Sprint"}
								</span>
							)}
							<span className="text-[10px] font-mono text-amber-400/80 font-bold uppercase tracking-wider hidden sm:inline-block">
								{activeTab === "QUALY" && qualyViewMode === "grid"
									? "Parrilla Oficial de Salida FIA"
									: "Blackbox Timing Console"}
							</span>
						</div>
					</div>

					{loading ? (
						<div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
							<span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
							Cargando tiempos oficiales...
						</div>
					) : activeTab === "QUALY" && qualyViewMode === "grid" && displayResults.length === 0 ? (
						<div className="h-48 flex flex-col items-center justify-center gap-2 text-zinc-400 font-mono text-xs text-center p-6 bg-zinc-950/40 rounded-xl border border-zinc-900/80">
							<span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
								🚦 Grilla de Salida en Homologación FIA
							</span>
							<p className="max-w-md text-zinc-400 text-[11px] leading-relaxed">
								Los comisarios de la FIA están confirmando las penalizaciones técnicas y conformando la grilla oficial de largada para el Gran Premio. Se actualizará automáticamente en cuanto se publique el documento oficial.
							</p>
							<button
								type="button"
								onClick={() => setQualyViewMode("times")}
								className="mt-2 text-[10px] text-amber-400 underline uppercase tracking-wider cursor-pointer hover:text-amber-300"
							>
								Ver tiempos de clasificación
							</button>
						</div>
					) : results.length === 0 ? (
						<div className="h-48 flex flex-col items-center justify-center gap-2 text-zinc-400 font-mono text-xs text-center p-6 bg-zinc-950/40 rounded-xl border border-zinc-900/80">
							<span className="text-amber-400 font-bold text-xs uppercase tracking-wider">⏱️ Tiempos en Homologación FIA</span>
							<p className="max-w-md text-zinc-400 text-[11px] leading-relaxed">
								Aguardando la publicación de registros oficiales para esta sesión del {gpName}. Los resultados se actualizarán automáticamente en la consola apenas estén disponibles.
							</p>
						</div>
					) : (
						/* LISTA UNIFICADA Y COMPACTA (DE P1 A P22 SIN TARJETAS GIGANTES) */
						<div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
							{displayResults.map((row, index) => {
								const driverFlag = driverNationalityMap[row.code];
								const teamColor = driverTeamColorMap[row.code]?.bg || "#3f3f46";
								const posNum = parseInt(row.pos, 10);

								const isP1 = posNum === 1;
								const isP2 = posNum === 2;
								const isP3 = posNum === 3;

								// Líneas de corte FIA limpias en Qualy / Shootout (solo en modo tiempos)
								const isQualyTab = activeTab === "QUALY" || activeTab === "SQ";
								const isCutoffQ2 = qualyViewMode === "times" && isQualyTab && posNum === 11;
								const isCutoffQ1 = qualyViewMode === "times" && isQualyTab && posNum === 17;

								// Estilo sutil de podio integrado en la misma altura
								const rowBg = isP1
									? "bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/15"
									: isP2
									? "bg-zinc-400/10 border-zinc-500/40 hover:bg-zinc-400/15"
									: isP3
									? "bg-amber-700/10 border-amber-700/40 hover:bg-amber-700/15"
									: row.isDNF
									? "bg-zinc-950/20 border-zinc-900/40 opacity-40 saturate-50"
									: "bg-zinc-900/30 border-zinc-900/80 hover:border-zinc-700/80 hover:bg-zinc-900/60";

								const renderPosBadge = () => {
									if (isP1) return <span className="text-sm">🥇</span>;
									if (isP2) return <span className="text-sm">🥈</span>;
									if (isP3) return <span className="text-sm">🥉</span>;
									return (
										<span className="font-mono font-bold text-xs text-zinc-400">
											{row.pos}
										</span>
									);
								};

								return (
									<React.Fragment key={`${activeTab}-${row.code}-${row.pos}`}>
										{/* Línea de corte Q2 (sin texto) */}
										{isCutoffQ2 && (
											<div className="h-[1px] w-full bg-red-500/40 my-1" />
										)}

										{/* Línea de corte Q1 (sin texto) */}
										{isCutoffQ1 && (
											<div className="h-[1px] w-full bg-zinc-700/50 my-1" />
										)}

										<motion.div
											initial={{ opacity: 0, x: 8 }}
											animate={{ opacity: 1, x: 0 }}
											whileHover={{ x: 3 }}
											transition={{ delay: index * 0.015 }}
											onClick={() => triggerHaptic("light")}
											className={`group/row relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
												isCompact ? "h-10 py-1.5" : "h-12"
											} overflow-hidden ${rowBg} hover:border-zinc-700/80 cursor-pointer`}
										>
											<div className="flex items-center gap-2.5 z-10 truncate flex-1 min-w-0 pr-2">
												{/* Franja vertical de escudería con ensanchamiento reactivo en hover/touch de 4px a 6px con resplandor */}
												<div
													className="w-1 group-hover/row:w-1.5 self-stretch rounded-full shrink-0 my-0.5 transition-all duration-300"
													style={{ 
														backgroundColor: row.isDNF ? "#3f3f46" : teamColor,
														boxShadow: row.isDNF ? "none" : `0 0 12px ${teamColor}90`
													}}
												/>

												<div className="w-5 flex justify-center items-center shrink-0">
													{renderPosBadge()}
												</div>

												{driverFlag && (
													<img
														src={`https://flagcdn.com/w20/${driverFlag}.png`}
														alt=""
														className="w-4 h-auto rounded-xs opacity-90 shadow-xs shrink-0"
													/>
												)}

												<div className="shrink-0">
													<TeamLogo teamName={row.team} />
												</div>

												<div className="flex items-center gap-2 truncate min-w-0">
													<p
														className={`text-xs md:text-sm truncate font-bold ${
															isP1 ? "text-amber-200" : "text-zinc-100"
														}`}
													>
														{row.name}
													</p>
													<span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border bg-zinc-900/90 text-zinc-400 border-zinc-800 shrink-0">
														#{row.number}
													</span>
												</div>
											</div>

											{/* Datos derecha (Tiempos, Penalizaciones y Puntos) */}
											<div className="flex items-center gap-2 shrink-0 font-mono">
												{row.penaltyNote && (
													<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0">
														{row.penaltyNote}
													</span>
												)}
												{qualyViewMode === "grid" && typeof row.delta === "number" && row.delta !== 0 && (
													<span
														className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
															row.delta > 0
																? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
																: "bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
														}`}
													>
														{row.delta > 0 ? `▲ +${row.delta}` : `▼ ${row.delta}`}
													</span>
												)}
												{qualyViewMode === "grid" && row.qualyPos && (
													<span className="text-[10px] text-zinc-500 font-bold hidden sm:inline-block">
														(Q: P{row.qualyPos})
													</span>
												)}
												<p
													className={`text-xs font-bold tracking-tight uppercase ${
														row.isDNF
															? "text-red-400/80 text-[10px]"
															: isP1
															? "text-amber-300"
															: "text-zinc-300"
													}`}
												>
													{row.gapTime}
												</p>
												{row.points && (
													<span className="text-amber-400 font-bold text-xs pl-1">
														{row.points}
													</span>
												)}
											</div>
										</motion.div>
									</React.Fragment>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
