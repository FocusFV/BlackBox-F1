import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	gridPos?: number;
};

export default function DriverInfo({ timingDriver, gridPos }: Props) {
	const positionChange = gridPos && gridPos - parseInt(timingDriver.Position);
	const gain = positionChange && positionChange > 0;
	const loss = positionChange && positionChange < 0;

	const status = timingDriver.KnockedOut
		? "ELIM"
		: !!timingDriver.Cutoff
			? "CORTE"
			: timingDriver.Retired
				? "ABAN"
				: timingDriver.Stopped
					? "DET"
					: timingDriver.InPit
						? "BOX"
						: timingDriver.PitOut
							? "SALIDA"
							: null;

	return (
		<div className="place-self-start font-mono text-center min-w-[2.5rem]">
			<p
				className={clsx("text-base leading-none font-bold tabular-nums", {
					"text-emerald-400": gain,
					"text-red-400": loss,
					"text-zinc-500": !gain && !loss,
				})}
			>
				{positionChange !== undefined
					? gain
						? `+${positionChange}`
						: loss
							? positionChange
							: "-"
					: `${timingDriver.NumberOfLaps}V`}
			</p>

			<p className="text-[10px] font-bold leading-none text-zinc-500 mt-1 uppercase tracking-tight">{status ?? "-"}</p>
		</div>
	);
}
