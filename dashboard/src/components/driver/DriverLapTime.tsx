import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	last: TimingDataDriver["LastLapTime"];
	best: TimingDataDriver["BestLapTime"];
	hasFastest: boolean;
};

export default function DriverLapTime({ last, best, hasFastest }: Props) {
	return (
		<div className="place-self-start font-mono text-center min-w-[5.5rem]">
			<p
				className={clsx("text-base leading-none font-bold tabular-nums", {
					"text-violet-400!": last.OverallFastest,
					"text-emerald-400!": last.PersonalFastest,
					"text-zinc-500!": !last.Value,
				})}
			>
				{!!last.Value ? last.Value : "--:--.---"}
			</p>
			<p
				className={clsx("text-xs leading-none text-zinc-500 tabular-nums mt-1", {
					"text-violet-400!": hasFastest,
					"text-zinc-500!": !best.Value,
				})}
			>
				{!!best.Value ? best.Value : "--:--.---"}
			</p>
		</div>
	);
}
