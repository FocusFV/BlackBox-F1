"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { X, Swords, Gauge, Flag, Timer, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Driver, TimingDataDriver } from "@/types/state.type";

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
	const drivers = useDataStore((state) => state.state?.DriverList);
	const timingData = useDataStore((state) => state.state?.TimingData?.Lines);
	const appTiming = useDataStore((state) => state.state?.TimingAppData?.Lines);
	const carsData = useDataStore((state) => state.carsData);

	// Usar la grilla 2026 oficial como respaldo completo si el socket aún no hidrató
	const effectiveDrivers = (drivers && Object.keys(drivers).length >= 2) ? drivers : DEFAULT_2026_GRID;

	// Lista de pilotos disponibles ordenada por número o posición
	const driverEntries = Object.entries(effectiveDrivers).sort((a, b) => {
		const posA = timingData?.[a[0]]?.Position ? parseInt(timingData[a[0]].Position) : (parseInt(a[0], 10) || 99);
		const posB = timingData?.[b[0]]?.Position ? parseInt(timingData[b[0]].Position) : (parseInt(b[0], 10) || 99);
		return posA - posB;
	});

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

	const d1 = effectiveDrivers[driver1Num] || DEFAULT_2026_GRID[driver1Num];
	const d2 = effectiveDrivers[driver2Num] || DEFAULT_2026_GRID[driver2Num];

	const t1: TimingDataDriver | undefined = timingData?.[driver1Num];
	const t2: TimingDataDriver | undefined = timingData?.[driver2Num];

	const app1 = appTiming?.[driver1Num];
	const app2 = appTiming?.[driver2Num];

	const car1 = carsData?.[driver1Num]?.Channels;
	const car2 = carsData?.[driver2Num]?.Channels;

	const c1Color = d1?.TeamColour ? `#${d1.TeamColour}` : "#3b82f6";
	const c2Color = d2?.TeamColour ? `#${d2.TeamColour}` : "#ef4444";

	// Duelos rápidos populares
	const QUICK_DUELS = [
		{ label: "Colapinto vs Albon", d1: "43", d2: "23" },
		{ label: "Verstappen vs Norris", d1: "1", d2: "4" },
		{ label: "Leclerc vs Hamilton", d1: "16", d2: "44" },
		{ label: "Piastri vs Russell", d1: "81", d2: "63" },
	];

	// Parsear tiempo en segundos para comparar
	const parseLapToSec = (val?: string) => {
		if (!val) return null;
		const parts = val.split(":");
		if (parts.length === 2) {
			const min = parseFloat(parts[0]);
			const sec = parseFloat(parts[1]);
			return min * 60 + sec;
		}
		const sec = parseFloat(val);
		return isNaN(sec) ? null : sec;
	};

	const s1_t1 = t1?.Sectors?.[0]?.Value ? parseFloat(t1.Sectors[0].Value) : null;
	const s1_t2 = t2?.Sectors?.[0]?.Value ? parseFloat(t2.Sectors[0].Value) : null;
	const s2_t1 = t1?.Sectors?.[1]?.Value ? parseFloat(t1.Sectors[1].Value) : null;
	const s2_t2 = t2?.Sectors?.[1]?.Value ? parseFloat(t2.Sectors[1].Value) : null;
	const s3_t1 = t1?.Sectors?.[2]?.Value ? parseFloat(t1.Sectors[2].Value) : null;
	const s3_t2 = t2?.Sectors?.[2]?.Value ? parseFloat(t2.Sectors[2].Value) : null;

	const best1 = parseLapToSec(t1?.BestLapTime?.Value);
	const best2 = parseLapToSec(t2?.BestLapTime?.Value);
	const bestDelta = best1 && best2 ? (best1 - best2).toFixed(3) : null;

	// Stints y neumáticos actuales
	const stint1 = app1?.Stints?.[app1.Stints.length - 1];
	const stint2 = app2?.Stints?.[app2.Stints.length - 1];

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 15 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 15 }}
					className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
				>
					{/* Botón de cierre */}
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
						title="Cerrar modal"
					>
						<X className="h-5 w-5" />
					</button>

					{/* Encabezado */}
					<div className="flex items-center gap-2 mb-4">
						<Swords className="h-5 w-5 text-red-500" />
						<h3 className="text-base font-black uppercase tracking-wider text-white">
							Cara a Cara Telemetría (Head-to-Head)
						</h3>
					</div>

					{/* Duelos rápidos */}
					<div className="flex flex-wrap gap-1.5 mb-6">
						{QUICK_DUELS.map((q) => (
							<button
								key={q.label}
								type="button"
								onClick={() => {
									if (drivers?.[q.d1]) setDriver1Num(q.d1);
									if (drivers?.[q.d2]) setDriver2Num(q.d2);
								}}
								className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
							>
								{q.label}
							</button>
						))}
					</div>

					{/* Selectores de pilotos enfrentados */}
					<div className="grid grid-cols-2 gap-4 mb-6">
						{/* Piloto 1 */}
						<div
							className="flex flex-col gap-2 rounded-xl border p-4 bg-zinc-900/40"
							style={{ borderColor: `${c1Color}66` }}
						>
							<label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
								Piloto 1
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

							{d1 && (
								<div className="mt-2 flex items-center gap-3">
									<div
										className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-xl font-black text-white shadow-md"
										style={{ backgroundColor: c1Color }}
									>
										{d1.RacingNumber}
									</div>
									<div>
										<h4 className="text-sm font-black text-white">{d1.BroadcastName || d1.FullName}</h4>
										<span className="text-xs text-zinc-400">{d1.TeamName}</span>
										<div className="text-[11px] font-bold text-amber-400">
											Posición: P{t1?.Position || "-"}
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Piloto 2 */}
						<div
							className="flex flex-col gap-2 rounded-xl border p-4 bg-zinc-900/40"
							style={{ borderColor: `${c2Color}66` }}
						>
							<label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
								Piloto 2
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

							{d2 && (
								<div className="mt-2 flex items-center gap-3">
									<div
										className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-xl font-black text-white shadow-md"
										style={{ backgroundColor: c2Color }}
									>
										{d2.RacingNumber}
									</div>
									<div>
										<h4 className="text-sm font-black text-white">{d2.BroadcastName || d2.FullName}</h4>
										<span className="text-xs text-zinc-400">{d2.TeamName}</span>
										<div className="text-[11px] font-bold text-amber-400">
											Posición: P{t2?.Position || "-"}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Tabla comparativa de métricas */}
					<div className="space-y-2 border-t border-zinc-800/80 pt-4">
						{/* Mejor Vuelta */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${bestDelta && parseFloat(bestDelta) < 0 ? "text-emerald-400" : "text-zinc-300"}`}>
								{t1?.BestLapTime?.Value || "-"}
							</span>
							<div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								<Timer className="h-3.5 w-3.5 text-zinc-500" />
								Mejor Vuelta
								{bestDelta && (
									<span className="text-[10px] text-amber-400 font-mono">
										(Δ {Math.abs(parseFloat(bestDelta))}s)
									</span>
								)}
							</div>
							<span className={`font-mono font-bold ${bestDelta && parseFloat(bestDelta) > 0 ? "text-emerald-400" : "text-zinc-300"}`}>
								{t2?.BestLapTime?.Value || "-"}
							</span>
						</div>

						{/* Última Vuelta */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className="font-mono text-zinc-300">{t1?.LastLapTime?.Value || "-"}</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								Última Vuelta
							</span>
							<span className="font-mono text-zinc-300">{t2?.LastLapTime?.Value || "-"}</span>
						</div>

						{/* Sector 1 */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${s1_t1 && s1_t2 && s1_t1 < s1_t2 ? "text-purple-400" : "text-zinc-300"}`}>
								{s1_t1 ? `${s1_t1.toFixed(3)}s` : "-"}
							</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								Sector 1
							</span>
							<span className={`font-mono font-bold ${s1_t1 && s1_t2 && s1_t2 < s1_t1 ? "text-purple-400" : "text-zinc-300"}`}>
								{s1_t2 ? `${s1_t2.toFixed(3)}s` : "-"}
							</span>
						</div>

						{/* Sector 2 */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${s2_t1 && s2_t2 && s2_t1 < s2_t2 ? "text-purple-400" : "text-zinc-300"}`}>
								{s2_t1 ? `${s2_t1.toFixed(3)}s` : "-"}
							</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								Sector 2
							</span>
							<span className={`font-mono font-bold ${s2_t1 && s2_t2 && s2_t2 < s2_t1 ? "text-purple-400" : "text-zinc-300"}`}>
								{s2_t2 ? `${s2_t2.toFixed(3)}s` : "-"}
							</span>
						</div>

						{/* Sector 3 */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className={`font-mono font-bold ${s3_t1 && s3_t2 && s3_t1 < s3_t2 ? "text-purple-400" : "text-zinc-300"}`}>
								{s3_t1 ? `${s3_t1.toFixed(3)}s` : "-"}
							</span>
							<span className="font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								Sector 3
							</span>
							<span className={`font-mono font-bold ${s3_t1 && s3_t2 && s3_t2 < s3_t1 ? "text-purple-400" : "text-zinc-300"}`}>
								{s3_t2 ? `${s3_t2.toFixed(3)}s` : "-"}
							</span>
						</div>

						{/* Speed Trap */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className="font-mono text-zinc-300">
								{t1?.Speeds?.St?.Value ? `${t1.Speeds.St.Value} km/h` : "-"}
							</span>
							<div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								<Gauge className="h-3.5 w-3.5 text-zinc-500" />
								Speed Trap (Vel. Punta)
							</div>
							<span className="font-mono text-zinc-300">
								{t2?.Speeds?.St?.Value ? `${t2.Speeds.St.Value} km/h` : "-"}
							</span>
						</div>

						{/* Neumáticos y Stint */}
						<div className="flex items-center justify-between rounded-lg bg-zinc-900/30 p-2.5 text-xs">
							<span className="font-semibold text-zinc-300">
								{stint1?.Compound || "N/A"} ({stint1?.TotalLaps || 0} vtas)
							</span>
							<div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-400 text-[11px]">
								<Zap className="h-3.5 w-3.5 text-amber-400" />
								Compuesto / Stint
							</div>
							<span className="font-semibold text-zinc-300">
								{stint2?.Compound || "N/A"} ({stint2?.TotalLaps || 0} vtas)
							</span>
						</div>

						{/* Telemetría en Vivo (Velocidad instantánea / Marcha si hay carData) */}
						{(car1 || car2) && (
							<div className="flex items-center justify-between rounded-lg bg-emerald-950/20 border border-emerald-900/30 p-2.5 text-xs">
								<span className="font-mono font-bold text-emerald-400">
									{car1 ? `${car1[2]} km/h (M${car1[3]})` : "-"}
								</span>
								<span className="font-bold uppercase tracking-wider text-emerald-300 text-[11px]">
									Datalink Instantáneo (Vel / Marcha)
								</span>
								<span className="font-mono font-bold text-emerald-400">
									{car2 ? `${car2[2]} km/h (M${car2[3]})` : "-"}
								</span>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
