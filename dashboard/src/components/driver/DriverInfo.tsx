"use client";

import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";
import { useDataStore } from "@/stores/useDataStore";
import { isDriverFinished } from "@/lib/driverFinished";
import WavingFlag from "@/components/ui/WavingFlag";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
	timingDriver: TimingDataDriver;
	gridPos?: number;
};

export default function DriverInfo({ timingDriver, gridPos }: Props) {
	const session = useDataStore((state) => state.state?.SessionInfo);
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const timingData = useDataStore((state) => state.state?.TimingData);
	const raceControlMessages = useDataStore((state) => state.state?.RaceControlMessages?.Messages);
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);

	const isRaceOrSprint = Boolean(
		session?.Name === "Race" ||
		session?.Name === "Sprint" ||
		session?.Type === "Race" ||
		(lapCount?.TotalLaps && lapCount.TotalLaps > 0)
	);

	const isQualy = !isRaceOrSprint && Boolean(
		session?.Name?.toLowerCase().includes("qual") ||
		session?.Type?.toLowerCase().includes("qual") ||
		session?.Name?.toLowerCase().includes("shootout") ||
		timingData?.SessionPart
	);

	const isEliminated = isQualy && Boolean(timingDriver.KnockedOut);

	// 🏁 Detección en tiempo real: ¿Ya tomó la bandera a cuadros este monoplaza?
	const isFinished = isDriverFinished({
		timingDriver,
		position: parseInt(timingDriver.Position || "0", 10),
		sessionName: session?.Name,
		sessionType: session?.Type,
		sessionStatus,
		totalLaps: lapCount?.TotalLaps,
		currentLap: lapCount?.CurrentLap,
		raceControlMessages,
	});

	const hasGridChange = typeof gridPos === "number" && gridPos > 0;
	const positionChange = hasGridChange ? gridPos - parseInt(timingDriver.Position || "0", 10) : undefined;
	const gain = positionChange !== undefined && positionChange > 0;
	const loss = positionChange !== undefined && positionChange < 0;

	const { t } = useTranslation();
	const laps = timingDriver.NumberOfLaps !== undefined ? `${timingDriver.NumberOfLaps}${t("telemetry.lap_badge", "V")}` : "-";

	const status = isEliminated
		? "ELIM"
		: timingDriver.Retired
			? t("telemetry.out_badge", "ABAN")
			: timingDriver.Stopped
				? t("telemetry.stop_badge", "DET")
				: isFinished
					? "META"
					: timingDriver.InPit
						? t("telemetry.pit_badge", "BOX")
						: timingDriver.PitOut
							? "SALIDA"
							: timingDriver.Cutoff && isQualy
								? "CORTE"
								: "PISTA";

	return (
		<div className="place-self-start font-mono text-center min-w-[2.5rem]">
			<p
				className={clsx("text-base leading-none font-bold tabular-nums", {
					"text-emerald-400": gain,
					"text-red-400": loss,
					"text-zinc-200": !gain && !loss,
				})}
			>
				{positionChange !== undefined
					? gain
						? `+${positionChange}`
						: loss
							? `${positionChange}`
							: "-"
					: laps}
			</p>

			<div className="mt-1 flex items-center justify-center">
				{status === "META" ? (
					<span
						className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-zinc-900/90 px-1 py-0.5 text-[9px] font-black text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)] select-none"
						title="Bandera a cuadros (Finalizado)"
					>
						<WavingFlag type="chequered" size="xs" />
						<span className="leading-none">META</span>
					</span>
				) : status === "BOX" ? (
					<span
						className="inline-flex items-center gap-1 rounded border border-amber-400/70 bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)] select-none tracking-wider"
						title={t("telemetry.pit_lane_stopped", "Monoplaza detenido en boxes (Pit Lane)")}
					>
						<span className="relative flex h-1.5 w-1.5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-80" />
							<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
						</span>
						<span className="leading-none text-[9px]">🛠️</span>
						<span className="leading-none">IN PIT</span>
					</span>
				) : status === "SALIDA" ? (
					<span
						className="inline-flex items-center gap-1 rounded border border-cyan-400/60 bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-black text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)] select-none tracking-wider"
						title={t("telemetry.pit_exit_running", "Saliendo de boxes a pista (Pit Exit)")}
					>
						<span className="relative flex h-1.5 w-1.5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-80" />
							<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
						</span>
						<span className="leading-none">PIT OUT</span>
					</span>
				) : (
					<p
						className={clsx("text-[10px] font-black leading-none uppercase tracking-tight", {
							"text-emerald-400": status === "PISTA",
							"text-red-400": status === "ELIM" || status === "ABAN" || status === "DET",
							"text-zinc-400": status === "CORTE",
						})}
					>
						{status}
					</p>
				)}
			</div>
		</div>
	);
}
