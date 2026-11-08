import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";
import { useDataStore } from "@/stores/useDataStore";
import { isDriverFinished } from "@/lib/driverFinished";
import WavingFlag from "@/components/ui/WavingFlag";

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

	const laps = timingDriver.NumberOfLaps !== undefined ? `${timingDriver.NumberOfLaps}V` : "-";

	const status = isEliminated
		? "ELIM"
		: timingDriver.Retired
			? "ABAN"
			: timingDriver.Stopped
				? "DET"
				: isFinished
					? "META"
					: timingDriver.InPit
						? "BOX"
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
				) : (
					<p
						className={clsx("text-[10px] font-black leading-none uppercase tracking-tight", {
							"text-amber-400": status === "BOX",
							"text-emerald-400": status === "PISTA",
							"text-cyan-400": status === "SALIDA",
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
