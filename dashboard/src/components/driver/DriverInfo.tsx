import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";
import { useDataStore } from "@/stores/useDataStore";

type Props = {
	timingDriver: TimingDataDriver;
	gridPos?: number;
};

export default function DriverInfo({ timingDriver, gridPos }: Props) {
	const session = useDataStore((state) => state.state?.SessionInfo);
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const timingData = useDataStore((state) => state.state?.TimingData);

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

			<p
				className={clsx("text-[10px] font-black leading-none mt-1 uppercase tracking-tight", {
					"text-amber-400": status === "BOX",
					"text-emerald-400": status === "PISTA",
					"text-cyan-400": status === "SALIDA",
					"text-red-400": status === "ELIM" || status === "ABAN" || status === "DET",
					"text-zinc-400": status === "CORTE",
				})}
			>
				{status}
			</p>
		</div>
	);
}
