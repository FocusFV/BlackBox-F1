"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, Trophy, Flag, Timer } from "lucide-react";
import clsx from "clsx";
import brazilFallbackData from "@/lib/brazil2026_practice_fallback.json";
import { translateGpName } from "@/lib/f1Translations";

type Props = {
	meetingKey?: number;
	roundNumber?: number;
	raceName: string;
	countryName?: string;
	onClose: () => void;
};

// 🏁 Mapa de colores Blackbox F1 2026
const driverTeamColorMap: Record<string, { bg: string; text: string }> = {
	"Red Bull Racing": { bg: "#3671C6", text: "#ffffff" },
	"Red Bull": { bg: "#3671C6", text: "#ffffff" },
	"Ferrari": { bg: "#E80020", text: "#ffffff" },
	"Mercedes": { bg: "#27F4D2", text: "#000000" },
	"McLaren": { bg: "#ff8700", text: "#ffffff" },
	"Aston Martin": { bg: "#006f62", text: "#ffffff" },
	"Alpine": { bg: "#0093cc", text: "#ffffff" },
	"Williams": { bg: "#005aff", text: "#ffffff" },
	"Racing Bulls": { bg: "#4b77ff", text: "#ffffff" },
	"RB": { bg: "#4b77ff", text: "#ffffff" },
	"Audi": { bg: "#c0c0c0", text: "#000000" },
	"Audi F1": { bg: "#c0c0c0", text: "#000000" },
	"Cadillac": { bg: "#d1a153", text: "#000000" },
	"Cadillac F1 Team": { bg: "#d1a153", text: "#000000" },
	"Kick Sauber": { bg: "#52E252", text: "#000000" },
	"Haas F1 Team": { bg: "#e10600", text: "#ffffff" },
	"Haas": { bg: "#e10600", text: "#ffffff" },
};

const driverNationalityMap: Record<string, string> = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "gb",
	LAW: "nz", ANT: "it", CAM: "br", HIR: "jp"
};

const countryTranslation: Record<string, string> = {
	Australia: "Australia", Austria: "Austria", Azerbaijan: "Azerbaiyán", Bahrain: "Bahréin",
	Belgium: "Bélgica", Brazil: "Brasil", Canada: "Canadá", China: "China", Spain: "España",
	France: "Francia", "Great Britain": "Gran Bretaña", "United Kingdom": "Reino Unido",
	Germany: "Alemania", Hungary: "Hungría", Italy: "Italia", Japan: "Japón",
	"Saudi Arabia": "Arabia Saudita", Mexico: "México", Monaco: "Mónaco", Netherlands: "Países Bajos",
	Portugal: "Portugal", Qatar: "Catar", Singapore: "Singapur", "United Arab Emirates": "Emiratos Árabes Unidos",
	"United States": "Estados Unidos", USA: "Estados Unidos", UK: "Reino Unido", Malaysia: "Malasia",
};

const translateStatus = (status: string): string => {
	if (!status) return "";
	const s = status.toLowerCase().trim();
	if (s === "finished") return "FINALIZADO";
	if (s === "lapped" || s === "+1 lap" || s === "+1 vta") return "+1 VUELTA";
	const lapsMatch = s.match(/^\+(\d+)\s+laps?/i);
	if (lapsMatch) return `+${lapsMatch[1]} VUELTAS`;
	const plainLaps = s.match(/^(\d+)\s+laps?/i);
	if (plainLaps) return `+${plainLaps[1]} VUELTAS`;
	if (s.includes("did not start") || s === "dns") return "NO LARGÓ";
	if (s.includes("did not qualify") || s === "dnq") return "NO CLASIFICÓ";
	if (s.includes("disqualified") || s.includes("dsq")) return "DESCALIFICADO";
	if (s.includes("retired") || s.includes("withdrew") || s === "ret") return "RETIRADO";
	if (s.includes("accident") || s.includes("collision") || s.includes("crash")) return "COLISIÓN";
	if (s.includes("engine") || s.includes("power unit")) return "MOTOR";
	if (s.includes("gearbox")) return "CAJA DE CAMBIOS";
	if (s.includes("transmission")) return "TRANSMISIÓN";
	if (s.includes("brakes")) return "FRENOS";
	if (s.includes("suspension")) return "SUSPENSIÓN";
	if (s.includes("hydraulics")) return "HIDRÁULICA";
	if (s.includes("electrical")) return "ELÉCTRICO";
	if (s.includes("puncture") || s.includes("tyre") || s.includes("tire")) return "PINCHAZO";
	if (s.includes("spun") || s.includes("spin")) return "TROMPO";
	if (s === "dnf") return "RETIRADO";
	return status.toUpperCase();
};

// 🏎️ Componente Logo integrado
const TeamLogo = ({ teamName }: { teamName: string }) => {
	const cleanName = (teamName || "").toLowerCase().replaceAll(" ", "-");
	const [fallbackIndex, setFallbackIndex] = useState(0);
	const fallbacks = [
		`/team-logos/${cleanName}.svg`,
		`/team-logos/${cleanName.replace("-f1-team", "").replace("-f1", "")}.svg`,
		"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>"
	];

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className="w-5 h-5 object-contain shrink-0"
			onError={() => setFallbackIndex((prev) => Math.min(prev + 1, fallbacks.length - 1))}
		/>
	);
};

export default function ResultsModal({ meetingKey, roundNumber, raceName, countryName, onClose }: Props) {
	const [results, setResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		async function fetchRaceData() {
			setLoading(true);
			const isBrazil = (raceName || "").toLowerCase().includes("brazil") || (raceName || "").toLowerCase().includes("brasil") || (raceName || "").toLowerCase().includes("paulo");
			const targetRound = (roundNumber && roundNumber <= 30) 
				? roundNumber 
				: (meetingKey && meetingKey <= 30 ? meetingKey : (isBrazil ? 20 : null));

			// 1. Intentamos consultar Ergast/Jolpica para la ronda oficial
			if (targetRound) {
				try {
					const urls = [
						`https://api.jolpi.ca/ergast/f1/2026/${targetRound}/results.json`,
						`https://api.jolpi.ca/ergast/f1/current/${targetRound}/results.json`,
					];
					for (const url of urls) {
						const res = await fetch(url).catch(() => null);
						if (res && res.ok) {
							const data = await res.json();
							const r = data?.MRData?.RaceTable?.Races?.[0];
							if (r?.Results && Array.isArray(r.Results) && r.Results.length > 0) {
								const parsed = r.Results.map((item: any) => {
									const code = item.Driver?.code || item.Driver?.familyName?.substring(0, 3).toUpperCase() || "";
									const flag = driverNationalityMap[code] || item.Driver?.nationality?.substring(0, 2).toLowerCase() || "";
									const isFinished = item.status === "Finished" || item.status?.startsWith("+");
									return {
										position: parseInt(item.position, 10) || 99,
										driver_number: item.number,
										driverName: `${item.Driver?.givenName || ""} ${item.Driver?.familyName || ""}`.trim(),
										code,
										flag,
										teamName: item.Constructor?.name || "Equipo",
										gapTime: item.position === "1" ? (item.Time?.time || "GANADOR") : (item.Time?.time || translateStatus(item.status) || "INTERVAL"),
										points: item.points ? `+${item.points} PTS` : "",
										isFastestLap: item.FastestLap?.rank === "1",
										fastestLapTime: item.FastestLap?.Time?.time,
										isDNF: !isFinished,
									};
								});

								if (isMounted) {
									setResults(parsed);
									setLoading(false);
									return;
								}
							}
						}
					}
				} catch (e) {
					console.warn("[ResultsModal] Error consultando Jolpica:", e);
				}
			}

			// 2. Fallback con endpoint interno de telemetría de carrera
			try {
				const practiceRes = await fetch(`/api/practice?session=RACE`).catch(() => null);
				if (practiceRes && practiceRes.ok) {
					const practiceData = await practiceRes.json();
					if (Array.isArray(practiceData?.results) && practiceData.results.length > 0) {
						const parsed = practiceData.results.map((r: any) => ({
							position: parseInt(r.pos, 10) || 99,
							driver_number: r.number,
							driverName: r.name,
							code: r.code,
							flag: driverNationalityMap[r.code] || "fia",
							teamName: r.team,
							gapTime: r.gapTime,
							points: r.points,
							isDNF: r.isDNF,
						}));

						if (isMounted) {
							setResults(parsed);
							setLoading(false);
							return;
						}
					}
				}
			} catch (e) {
				console.warn("[ResultsModal] Error consultando API interna:", e);
			}

			// 3. Fallback con OpenF1 por meetingKey si está disponible
			if (meetingKey && meetingKey > 100) {
				try {
					const [posRes, driversRes] = await Promise.all([
						fetch(`https://api.openf1.org/v1/position?meeting_key=${meetingKey}`),
						fetch(`https://api.openf1.org/v1/drivers?meeting_key=${meetingKey}`)
					]);
					const posData = await posRes.json();
					const driversData = await driversRes.json();

					if (Array.isArray(posData) && Array.isArray(driversData) && posData.length > 0) {
						const driversMap = driversData.reduce((acc, d) => ({ ...acc, [d.driver_number]: d }), {});
						const latestPositions: Record<number, any> = {};
						posData.forEach((p: any) => {
							if (!latestPositions[p.driver_number] || p.date > latestPositions[p.driver_number].date) {
								latestPositions[p.driver_number] = p;
							}
						});

						// Deduplicar estrictamente por posición y número de piloto para evitar posiciones clonadas
						const uniqueByPos: Record<number, any> = {};
						Object.values(latestPositions).forEach((p: any) => {
							const pos = parseInt(p.position, 10);
							if (pos >= 1 && pos <= 22 && !uniqueByPos[pos]) {
								uniqueByPos[pos] = p;
							}
						});

						const sorted = Object.values(uniqueByPos)
							.map((p: any) => {
								const d = driversMap[p.driver_number];
								const code = d?.name_acronym || "";
								return {
									position: p.position,
									driver_number: p.driver_number,
									driverName: d?.full_name || `Piloto #${p.driver_number}`,
									code,
									flag: driverNationalityMap[code] || d?.country_code?.toLowerCase() || "",
									teamName: d?.team_name || "Equipo",
									gapTime: p.position === 1 ? "P1" : `P${p.position}`,
									points: "",
									isDNF: false,
								};
							})
							.sort((a, b) => a.position - b.position);

						if (isMounted) {
							setResults(sorted);
							setLoading(false);
							return;
						}
					}
				} catch (e) {
					console.warn("[ResultsModal] Error consultando OpenF1:", e);
				}
			}

			if (isMounted) {
				const fb = (brazilFallbackData as any).RACE;
				if (Array.isArray(fb) && fb.length > 0) {
					const parsed = fb.map((r: any) => ({
						position: parseInt(r.pos, 10) || 99,
						driver_number: r.number,
						driverName: r.name,
						code: r.code,
						flag: driverNationalityMap[r.code] || "fia",
						teamName: r.team,
						gapTime: r.gapTime,
						points: r.points,
						isDNF: r.isDNF,
					}));
					setResults(parsed);
				} else {
					setResults([]);
				}
				setLoading(false);
			}
		}

		fetchRaceData();

		return () => {
			isMounted = false;
		};
	}, [meetingKey, roundNumber]);

	// Cierre accesible con tecla Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	const modalContent = (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono select-none"
			onClick={(e) => e.stopPropagation()}
		>
			<motion.div
				onClick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
			/>
			<motion.div
				initial={{ scale: 0.95, opacity: 0, y: 15 }}
				animate={{ scale: 1, opacity: 1, y: 0 }}
				exit={{ scale: 0.95, opacity: 0, y: 15 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl relative z-10 text-zinc-300"
			>
				{/* CABECERA */}
				<div className="flex items-start justify-between border-b border-zinc-800/80 pb-3 mb-4">
					<div>
						<span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
							<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
							RESULTADOS OFICIALES FIA · CLASIFICACIÓN FINAL
						</span>
						<h2 className="text-base font-black text-white uppercase tracking-wide mt-1">
							{translateGpName(raceName)} {countryName ? `· ${countryTranslation[countryName] || countryName}` : ""}
						</h2>
					</div>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}
						className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* LISTA DE POSICIONES */}
				<div className="max-h-[460px] overflow-y-auto no-scrollbar space-y-1.5 pr-1">
					{loading ? (
						<div className="flex flex-col h-48 items-center justify-center text-amber-400 text-xs uppercase font-black gap-2">
							<span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
							// CARGANDO TELEMETRÍA OFICIAL...
						</div>
					) : results.length === 0 ? (
						<div className="flex flex-col h-48 items-center justify-center text-zinc-500 text-xs text-center p-6 space-y-2">
							<Flag className="w-8 h-8 text-zinc-600 mb-1" />
							<p className="font-bold uppercase tracking-wider text-zinc-400">
								Aguardando publicación oficial de carrera
							</p>
							<p className="text-[11px] text-zinc-600">
								Los resultados y tiempos finales se sincronizarán en cuanto la FIA homologue el Gran Premio.
							</p>
						</div>
					) : (
						results.map((row) => {
							const teamColors = driverTeamColorMap[row.teamName] || { bg: "#3f3f46", text: "#fff" };
							const isP1 = row.position === 1;
							const isP2 = row.position === 2;
							const isP3 = row.position === 3;
							const isPodium = isP1 || isP2 || isP3;

							return (
								<div
									key={row.driver_number}
									className={clsx(
										"flex items-center justify-between p-2.5 rounded-xl border relative overflow-hidden h-14 transition-colors",
										isP1
											? "bg-amber-950/20 border-amber-500/40"
											: isPodium
											? "bg-zinc-900/40 border-zinc-700/60"
											: row.isDNF
											? "bg-zinc-950/40 border-zinc-900/60 opacity-50"
											: "bg-zinc-900/20 border-zinc-900 hover:border-zinc-800"
									)}
									style={{ borderLeft: `4px solid ${teamColors.bg}` }}
								>
									{/* IZQUIERDA: POSICIÓN, BANDERA, LOGO, NOMBRE */}
									<div className="flex items-center gap-3 z-10 min-w-0">
										<span
											className={clsx(
												"w-6 font-black text-center text-xs shrink-0",
												isP1 ? "text-amber-400" : isPodium ? "text-zinc-200" : "text-zinc-500"
											)}
										>
											{row.position}
										</span>

										{row.flag && (
											<img
												src={`https://flagcdn.com/w20/${row.flag.toLowerCase()}.png`}
												alt=""
												className="w-4 h-auto rounded-xs opacity-90 shadow-xs shrink-0"
											/>
										)}

										<div className="shrink-0">
											<TeamLogo teamName={row.teamName} />
										</div>

										<div className="flex flex-col min-w-0">
											<div className="flex items-center gap-2 truncate">
												<span
													className={clsx(
														"font-black text-xs uppercase truncate",
														isP1 ? "text-amber-200" : "text-zinc-100"
													)}
												>
													{row.driverName}
												</span>
												<span className="text-[9px] font-mono font-bold px-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
													#{row.driver_number}
												</span>
											</div>
											<span className="text-[10px] text-zinc-500 font-bold uppercase truncate">
												{row.teamName}
											</span>
										</div>
									</div>

									{/* DERECHA: TIEMPO, PUNTOS Y VUELTA RÁPIDA */}
									<div className="flex items-center gap-2 shrink-0 font-mono text-right">
										{row.isFastestLap && (
											<span className="text-purple-400 text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
												🟣 VR
											</span>
										)}

										<div className="flex flex-col items-end">
											<span
												className={clsx(
													"text-xs font-black uppercase tracking-tight",
													row.isDNF
														? "text-red-400/80 text-[10px]"
														: isP1
														? "text-amber-400"
														: "text-zinc-300"
												)}
											>
												{translateStatus(row.gapTime)}
											</span>
											{row.points && (
												<span className="text-[10px] font-bold text-amber-400">
													{row.points}
												</span>
											)}
										</div>

										{isP1 && <Trophy className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
									</div>
								</div>
							);
						})
					)}
				</div>
			</motion.div>
		</div>
	);

	if (typeof document === "undefined") return null;
	return createPortal(modalContent, document.body);
}
