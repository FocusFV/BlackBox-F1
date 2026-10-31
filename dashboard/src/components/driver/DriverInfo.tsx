import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	gridPos?: number;
};

export default function DriverInfo({ timingDriver, gridPos }: Props) {
	const hasGridChange = typeof gridPos === "number" && gridPos > 0;
	const positionChange = hasGridChange ? gridPos - parseInt(timingDriver.Position || "0", 10) : undefined;
	const gain = positionChange !== undefined && positionChange > 0;
	const loss = positionChange !== undefined && positionChange < 0;

	const laps = timingDriver.NumberOfLaps !== undefined ? `${timingDriver.NumberOfLaps}V` : "-";

	const status = timingDriver.KnockedOut
		? "ELIM"
		: timingDriver.Retired
			? "ABAN"
			: timingDriver.Stopped
				? "DET"
				: timingDriver.InPit
					? "BOX"
					: timingDriver.PitOut
						? "SALIDA"
						: timingDriver.Cutoff
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
