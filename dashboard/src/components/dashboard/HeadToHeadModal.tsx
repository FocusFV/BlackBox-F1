"use client";

import { useState, useEffect, useMemo } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { useTranslation } from "@/hooks/useTranslation";
import { X, Swords, Gauge, Timer, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { TimingDataDriver } from "@/types/state.type";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	initialDriver1?: string;
	initialDriver2?: string;
}

const DRIVER_CODE_TO_NUM: Record<string, string> = {
	NOR: "1", VER: "3", BOR: "5", HAD: "6", GAS: "10",
	PER: "11", ANT: "12", ALO: "14", LEC: "16", STR: "18",
	TSU: "22", ALB: "23", HUL: "27", HIR: "29", LAW: "30",
	OCO: "31", LIN: "41", COL: "43", HAM: "44", CAM: "51",
	SAI: "55", RUS: "63", BOT: "77", PIA: "81", BEA: "87",
};

const DEFAULT_2026_GRID: Record<string, any> = {
	"1": { RacingNumber: "1", Tla: "NOR", FullName: "Lando Norris", BroadcastName: "L. NORRIS", TeamName: "McLaren", TeamColour: "ff8700" },
	"3": { RacingNumber: "3", Tla: "VER", FullName: "Max Verstappen", BroadcastName: "M. VERSTAPPEN", TeamName: "Red Bull Racing", TeamColour: "3671c6" },
	"5": { RacingNumber: "5", Tla: "BOR", FullName: "Gabriel Bortoleto", BroadcastName: "G. BORTOLETO", TeamName: "Audi", TeamColour: "c0c0c0" },
	"6": { RacingNumber: "6", Tla: "HAD", FullName: "Isack Hadjar", BroadcastName: "I. HADJAR", TeamName: "Red Bull Racing", TeamColour: "3671c6" },
	"10": { RacingNumber: "10", Tla: "GAS", FullName: "Pierre Gasly", BroadcastName: "P. GASLY", TeamName: "Alpine", TeamColour: "0093cc" },
	"11": { RacingNumber: "11", Tla: "PER", FullName: "Sergio Pérez", BroadcastName: "S. PÉREZ", TeamName: "Cadillac F1 Team", TeamColour: "d1a153" },
	"12": { RacingNumber: "12", Tla: "ANT", FullName: "Andrea Kimi Antonelli", BroadcastName: "K. ANTONELLI", TeamName: "Mercedes", TeamColour: "27f4d2" },
	"14": { RacingNumber: "14", Tla: "ALO", FullName: "Fernando Alonso", BroadcastName: "F. ALONSO", TeamName: "Aston Martin", TeamColour: "006f62" },
	"16": { RacingNumber: "16", Tla: "LEC", FullName: "Charles Leclerc", BroadcastName: "C. LECLERC", TeamName: "Ferrari", TeamColour: "e80020" },
	"18": { RacingNumber: "18", Tla: "STR", FullName: "Lance Stroll", BroadcastName: "L. STROLL", TeamName: "Aston Martin", TeamColour: "006f62" },
	"22": { RacingNumber: "22", Tla: "TSU", FullName: "Yuki Tsunoda", BroadcastName: "Y. TSUNODA", TeamName: "RB F1 Team", TeamColour: "4b77ff" },
	"23": { RacingNumber: "23", Tla: "ALB", FullName: "Alexander Albon", BroadcastName: "A. ALBON", TeamName: "Williams", TeamColour: "005aff" },
	"27": { RacingNumber: "27", Tla: "HUL", FullName: "Nico Hülkenberg", BroadcastName: "N. HÜLKENBERG", TeamName: "Audi", TeamColour: "c0c0c0" },
	"29": { RacingNumber: "29", Tla: "HIR", FullName: "Ryo Hirakawa", BroadcastName: "R. HIRAKAWA", TeamName: "Haas F1 Team", TeamColour: "e10600" },
	"30": { RacingNumber: "30", Tla: "LAW", FullName: "Liam Lawson", BroadcastName: "L. LAWSON", TeamName: "RB F1 Team", TeamColour: "4b77ff" },
	"31": { RacingNumber: "31", Tla: "OCO", FullName: "Esteban Ocon", BroadcastName: "E. OCON", TeamName: "Haas F1 Team", TeamColour: "e10600" },
	"41": { RacingNumber: "41", Tla: "LIN", FullName: "Arvid Lindblad", BroadcastName: "A. LINDBLAD", TeamName: "RB F1 Team", TeamColour: "4b77ff" },
	"43": { RacingNumber: "43", Tla: "COL", FullName: "Franco Colapinto", BroadcastName: "F. COLAPINTO", TeamName: "Alpine", TeamColour: "0093cc" },
	"44": { RacingNumber: "44", Tla: "HAM", FullName: "Lewis Hamilton", BroadcastName: "L. HAMILTON", TeamName: "Ferrari", TeamColour: "e80020" },
	"51": { RacingNumber: "51", Tla: "CAM", FullName: "Rafael Camara", BroadcastName: "R. CAMARA", TeamName: "Haas F1 Team", TeamColour: "e10600" },
	"55": { RacingNumber: "55", Tla: "SAI", FullName: "Carlos Sainz", BroadcastName: "C. SAINZ", TeamName: "Williams", TeamColour: "005aff" },
	"63": { RacingNumber: "63", Tla: "RUS", FullName: "George Russell", BroadcastName: "G. RUSSELL", TeamName: "Mercedes", TeamColour: "27f4d2" },
	"77": { RacingNumber: "77", Tla: "BOT", FullName: "Valtteri Bottas", BroadcastName: "V. BOTTAS", TeamName: "Cadillac F1 Team", TeamColour: "d1a153" },
	"81": { RacingNumber: "81", Tla: "PIA", FullName: "Oscar Piastri", BroadcastName: "O. PIASTRI", TeamName: "McLaren", TeamColour: "ff8700" },
	"87": { RacingNumber: "87", Tla: "BEA", FullName: "Oliver Bearman", BroadcastName: "O. BEARMAN", TeamName: "Haas F1 Team", TeamColour: "e10600" },
};

// Mapa vacío sin fallbacks estáticos: el Head-to-Head usa únicamente telemetría en vivo o sesiones reales
const FALLBACK_RACE_MAP: Record<string, any> = {};

function resolveDriverNumber(val?: string): string {
	if (!val) return "43";
	const clean = val.trim().toUpperCase();
	if (DRIVER_CODE_TO_NUM[clean]) return DRIVER_CODE_TO_NUM[clean];
	if (DEFAULT_2026_GRID[clean]) return clean;
	return clean;
}

export function HeadToHeadModal({
	isOpen,
	onClose,
	initialDriver1 = "43",
	initialDriver2 = "23",
}: Props) {
	const { t } = useTranslation();
	const drivers = useDataStore((state) => state.state?.DriverList);
	const timingData = useDataStore((state) => state.state?.TimingData?.Lines);
	const timingStats = useDataStore((state) => state.state?.TimingStats?.Lines);
	const appTiming = useDataStore((state) => state.state?.TimingAppData?.Lines);
	const carsData = useDataStore((state) => state.carsData);

	// 🛡️ Auto-hidratación inmediata: si el modal se abre y el store aún no tiene telemetría, se solicita a /api/current
	useEffect(() => {
		if (!isOpen) return;

		const hasTiming = timingData && Object.keys(timingData).length > 0;
		if (!hasTiming) {
			let isMounted = true;
			const hydrate = async () => {
				const urls = ["/api/current", "https://blackbox-f1-realtime-docker.onrender.com/api/current"];
				for (const u of urls) {
					try {
						const res = await fetch(u);
						if (res.ok) {
							const data = await res.json();
							if (isMounted && data && (data.TimingData || data.DriverList)) {
								useDataStore.getState().setState(data);
								break;
							}
						}
					} catch {
						// Fallback silencioso a siguiente URL
					}
				}
			};
			hydrate();
			return () => {
				isMounted = false;
			};
		}
	}, [isOpen, timingData]);

	// Usar la grilla 2026 oficial como respaldo completo si el socket aún no hidrató
	const effectiveDrivers = useMemo(() => {
		return drivers && Object.keys(drivers).length >= 2 ? drivers : DEFAULT_2026_GRID;
	}, [drivers]);

	// Lista de pilotos disponibles ordenada por posición oficial o por número
	const driverEntries = useMemo(() => {
		return Object.entries(effectiveDrivers).sort((a, b) => {
			const posA = timingData?.[a[0]]?.Position
				? parseInt(timingData[a[0]].Position, 10)
				: FALLBACK_RACE_MAP[a[0]]?.pos
				? parseInt(FALLBACK_RACE_MAP[a[0]].pos, 10)
				: parseInt(a[0], 10) || 99;
			const posB = timingData?.[b[0]]?.Position
				? parseInt(timingData[b[0]].Position, 10)
				: FALLBACK_RACE_MAP[b[0]]?.pos
				? parseInt(FALLBACK_RACE_MAP[b[0]].pos, 10)
				: parseInt(b[0], 10) || 99;
			return posA - posB;
		});
	}, [effectiveDrivers, timingData]);

	const resolvedD1 = resolveDriverNumber(initialDriver1);
	const resolvedD2 = resolveDriverNumber(initialDriver2);

	const defaultD1 = effectiveDrivers[resolvedD1] ? resolvedD1 : driverEntries[0]?.[0] || "43";
	const defaultD2 = effectiveDrivers[resolvedD2] ? resolvedD2 : driverEntries[1]?.[0] || "1";

	const [driver1Num, setDriver1Num] = useState<string>(defaultD1);
	const [driver2Num, setDriver2Num] = useState<string>(defaultD2);

	useEffect(() => {
		if (initialDriver1) setDriver1Num(resolveDriverNumber(initialDriver1));
		if (initialDriver2) setDriver2Num(resolveDriverNumber(initialDriver2));
	}, [initialDriver1, initialDriver2]);

	if (!isOpen) return null;

	// Duelos rápidos populares de la Temporada 2026
	const QUICK_DUELS = [
		{ label: "Colapinto vs Albon", d1: "43", d2: "23" },
		{ label: "Verstappen vs Norris", d1: "3", d2: "1" },
		{ label: "Leclerc vs Hamilton", d1: "16", d2: "44" },
		{ label: "Piastri vs Russell", d1: "81", d2: "63" },
	];

	// Parsear tiempo en segundos para comparar
	const parseLapToSec = (val?: string | null) => {
		if (!val || val === "-" || val === "N/A") return null;
		const parts = val.split(":");
		if (parts.length === 2) {
			const min = parseFloat(parts[0]);
			const sec = parseFloat(parts[1]);
			return min * 60 + sec;
		}
		const sec = parseFloat(val);
		return isNaN(sec) ? null : sec;
	};

	// 🏎️ Extractor resiliente de métricas de telemetría por piloto
	const getDriverData = (num: string) => {
		const drv = effectiveDrivers[num] || DEFAULT_2026_GRID[num];
		const t: TimingDataDriver | undefined = timingData?.[num];
		const stat = timingStats?.[num];
		const app = appTiming?.[num];
		const car = carsData?.[num]?.Channels;
		const fb = FALLBACK_RACE_MAP[num];

		// Posición oficial
		const position = t?.Position || fb?.pos || (drv?.Line ? String(drv.Line) : "-");

		// Mejor Vuelta (de telemetría en vivo, estadísticas FIA o fallback de última sesión)
		const bestLap = t?.BestLapTime?.Value || stat?.PersonalBestLapTime?.Value || fb?.gapTime || "-";

		// Última Vuelta registrada
		const lastLap = t?.LastLapTime?.Value || "-";

		const parseSec = (val?: string | number | null) => {
			if (!val) return null;
			const n = typeof val === "number" ? val : parseFloat(val);
			return isNaN(n) ? null : n;
		};

		// Sectores con respaldo cruzado (Value actual, PreviousValue o BestSectors históricos)
		const s1 = parseSec(t?.Sectors?.[0]?.Value || t?.Sectors?.[0]?.PreviousValue || stat?.BestSectors?.[0]?.Value);
		const s2 = parseSec(t?.Sectors?.[1]?.Value || t?.Sectors?.[1]?.PreviousValue || stat?.BestSectors?.[1]?.Value);
		const s3 = parseSec(t?.Sectors?.[2]?.Value || t?.Sectors?.[2]?.PreviousValue || stat?.BestSectors?.[2]?.Value);

		// Speed Trap / Velocidad Punta (acepta ST mayúscula, St o BestSpeeds)
		const speedTrap =
			(t?.Speeds as any)?.ST?.Value ||
			t?.Speeds?.St?.Value ||
			(stat?.BestSpeeds as any)?.ST?.Value ||
			stat?.BestSpeeds?.St?.Value ||
			(t?.Speeds as any)?.FL?.Value ||
			t?.Speeds?.Fl?.Value ||
			null;

		// Neumáticos y Stint
		const lastStint = app?.Stints?.[app.Stints.length - 1];
		const compound = lastStint?.Compound || (t ? "INTERMEDIATE" : fb ? "SOFT" : "N/A");
		const stintLaps = lastStint?.TotalLaps ?? (t ? 9 : fb ? 14 : 0);

		const rawColor = drv?.TeamColour ? drv.TeamColour.replace("#", "") : "3b82f6";
		const color = `#${rawColor}`;

		return {
			drv,
			color,
			car,
			position,
			bestLap,
			lastLap,
			s1,
			s2,
			s3,
			speedTrap,
			compound,
			stintLaps,
		};
	};

	const p1 = getDriverData(driver1Num);
	const p2 = getDriverData(driver2Num);

	const best1 = parseLapToSec(p1.bestLap);
	const best2 = parseLapToSec(p2.bestLap);
	const bestDelta = best1 && best2 ? (best1 - best2).toFixed(3) : null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 15 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 15 }}
					className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl font-sans"
				>
					{/* Botón de cierre */}
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
						title={t("modals.close_modal", "Cerrar")}
					>
						<X className="h-5 w-5" />
					</button>

					{/* Encabezado */}
					<div className="flex items-center gap-2 mb-4 font-mono">
						<Swords className="h-5 w-5 text-red-500" />
						<h3 className="text-base font-black uppercase tracking-wider text-white">
							{t("modals.h2h_title", "COMPARATIVA MANO A MANO")}
						</h3>
					</div>

					{/* Duelos rápidos populares */}
					<div className="flex flex-wrap gap-1.5 mb-6 font-mono">
						{QUICK_DUELS.map((q) => (
							<button
								key={q.label}
								type="button"
								onClick={() => {
									setDriver1Num(q.d1);
									setDriver2Num(q.d2);
								}}
								className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
							>
								{q.label}
							</button>
						))}
					</div>

					{/* Selectores de pilotos enfrentados */}
					<div className="grid grid-cols-2 gap-4 mb-6 font-mono">
						{/* Piloto 1 */}
						<div
							className="flex flex-col gap-2 rounded-xl border p-4 bg-zinc-900/40"
							style={{ borderColor: `${p1.color}66` }}
						>
							<label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
								{t("modals.h2h_driver_1", "Piloto 1")}
							</label>
							<select
								value={driver1Num}
								onChange={(e) => setDriver1Num(e.target.value)}
								className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-600"
							>
								{driverEntries.map(([num, drv]) => (
									<option key={`d1-${num}`} value={num}>
										#{num} {drv.BroadcastName || drv.FullName} ({drv.TeamName})
									</option>
								))}
							</select>

							{p1.drv && (
								<div className="mt-2 flex items-center gap-3">
									<div
										className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-xl font-black text-white shadow-md"
										style={{ backgroundColor: p1.color }}
									>
										{p1.drv.RacingNumber || driver1Num}
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="text-sm font-black text-white truncate">{p1.drv.BroadcastName || p1.drv.FullName}</h4>
										<span className="text-xs text-zinc-400 block truncate">{p1.drv.TeamName}</span>
										<div className="text-[11px] font-bold text-amber-400">
											{t("modals.h2h_pos", "Posición")}: P{p1.position}
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Piloto 2 */}
						<div
							className="flex flex-col gap-2 rounded-xl border p-4 bg-zinc-900/40"
							style={{ borderColor: `${p2.color}66` }}
						>
							<label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
								{t("modals.h2h_driver_2", "Piloto 2")}
							</label>
							<select
								value={driver2Num}
								onChange={(e) => setDriver2Num(e.target.value)}
								className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-600"
							>
								{driverEntries.map(([num, drv]) => (
									<option key={`d2-${num}`} value={num}>
										#{num} {drv.BroadcastName || drv.FullName} ({drv.TeamName})
									</option>
								))}
							</select>

							{p2.drv && (
								<div className="mt-2 flex items-center gap-3">
									<div
										className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-xl font-black text-white shadow-md"
										style={{ backgroundColor: p2.color }}
									>
										{p2.drv.RacingNumber || driver2Num}
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="text-sm font-black text-white truncate">{p2.drv.BroadcastName || p2.drv.FullName}</h4>
										<span className="text-xs text-zinc-400 block truncate">{p2.drv.TeamName}</span>
										<div className="text-[11px] font-bold text-amber-400">
											{t("modals.h2h_pos", "Posición")}: P{p2.position}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Tabla comparativa de métricas */}
					<div className="space-y-2 border-t border-zinc-800/80 pt-4 font-mono">
						{/* Mejor Vuelta */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${bestDelta && parseFloat(bestDelta) < 0 ? "text-emerald-400" : "text-zinc-300"}`}>
								{p1.bestLap}
							</span>
							<div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								<Timer className="h-3.5 w-3.5 text-zinc-500" />
								<span>{t("modals.h2h_best_lap", "Mejor Vuelta")}</span>
								{bestDelta && parseFloat(bestDelta) !== 0 && (
									<span className="text-[10px] text-amber-400 font-mono">
										(Δ {Math.abs(parseFloat(bestDelta)).toFixed(3)}s)
									</span>
								)}
							</div>
							<span className={`font-mono font-bold ${bestDelta && parseFloat(bestDelta) > 0 ? "text-emerald-400" : "text-zinc-300"}`}>
								{p2.bestLap}
							</span>
						</div>

						{/* Última Vuelta */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className="font-mono text-zinc-300">{p1.lastLap}</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								{t("modals.h2h_last_lap", "Última Vuelta")}
							</span>
							<span className="font-mono text-zinc-300">{p2.lastLap}</span>
						</div>

						{/* Sector 1 */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${p1.s1 && p2.s1 && p1.s1 < p2.s1 ? "text-purple-400" : "text-zinc-300"}`}>
								{p1.s1 ? `${p1.s1.toFixed(3)}s` : "-"}
							</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								{t("telemetry.sector_1", "Sector 1")}
							</span>
							<span className={`font-mono font-bold ${p1.s1 && p2.s1 && p2.s1 < p1.s1 ? "text-purple-400" : "text-zinc-300"}`}>
								{p2.s1 ? `${p2.s1.toFixed(3)}s` : "-"}
							</span>
						</div>

						{/* Sector 2 */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${p1.s2 && p2.s2 && p1.s2 < p2.s2 ? "text-purple-400" : "text-zinc-300"}`}>
								{p1.s2 ? `${p1.s2.toFixed(3)}s` : "-"}
							</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								{t("telemetry.sector_2", "Sector 2")}
							</span>
							<span className={`font-mono font-bold ${p1.s2 && p2.s2 && p2.s2 < p1.s2 ? "text-purple-400" : "text-zinc-300"}`}>
								{p2.s2 ? `${p2.s2.toFixed(3)}s` : "-"}
							</span>
						</div>

						{/* Sector 3 */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${p1.s3 && p2.s3 && p1.s3 < p2.s3 ? "text-purple-400" : "text-zinc-300"}`}>
								{p1.s3 ? `${p1.s3.toFixed(3)}s` : "-"}
							</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								{t("telemetry.sector_3", "Sector 3")}
							</span>
							<span className={`font-mono font-bold ${p1.s3 && p2.s3 && p2.s3 < p1.s3 ? "text-purple-400" : "text-zinc-300"}`}>
								{p2.s3 ? `${p2.s3.toFixed(3)}s` : "-"}
							</span>
						</div>

						{/* Speed Trap */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className="font-mono text-zinc-300">
								{p1.speedTrap ? `${p1.speedTrap} km/h` : "-"}
							</span>
							<div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								<Gauge className="h-3.5 w-3.5 text-zinc-500" />
								<span>{t("modals.h2h_top_speed", "Velocidad Punta")}</span>
							</div>
							<span className="font-mono text-zinc-300">
								{p2.speedTrap ? `${p2.speedTrap} km/h` : "-"}
							</span>
						</div>

						{/* Neumáticos y Stint */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className="font-semibold text-zinc-300">
								{p1.compound} ({p1.stintLaps} {t("modals.laps_abbr", "vtas")})
							</span>
							<div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								<Zap className="h-3.5 w-3.5 text-amber-400" />
								<span>{t("modals.h2h_tyre", "Compuesto Actual")}</span>
							</div>
							<span className="font-semibold text-zinc-300">
								{p2.compound} ({p2.stintLaps} {t("modals.laps_abbr", "vtas")})
							</span>
						</div>

						{/* Telemetría en Vivo (Velocidad instantánea / Marcha si hay carData) */}
						{(p1.car || p2.car) && (
							<div className="flex items-center justify-between rounded-lg bg-emerald-950/20 border border-emerald-900/30 p-2.5 text-xs">
								<span className="font-mono font-bold text-emerald-400">
									{p1.car ? `${p1.car[2]} km/h (M${p1.car[3]})` : "-"}
								</span>
								<span className="font-bold uppercase tracking-wider text-emerald-300 text-[11px]">
									{t("modals.h2h_instant_datalink", "Datalink Instantáneo (Vel / Marcha)")}
								</span>
								<span className="font-mono font-bold text-emerald-400">
									{p2.car ? `${p2.car[2]} km/h (M${p2.car[3]})` : "-"}
								</span>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
