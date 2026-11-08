import clsx from "clsx";

import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	last: TimingDataDriver["LastLapTime"];
	best: TimingDataDriver["BestLapTime"];
	hasFastest: boolean;
	isLastOverallFastest?: boolean;
	isLastPersonalFastest?: boolean;
};

export default function DriverLapTime({
	last,
	best,
	hasFastest,
	isLastOverallFastest = false,
	isLastPersonalFastest = false,
}: Props) {
	return (
		<div className="place-self-start font-mono text-center min-w-[5.5rem]">
			<p
				className={clsx("text-base leading-none font-bold tabular-nums", {
					"text-violet-400!": isLastOverallFastest,
					"text-emerald-400!": !isLastOverallFastest && isLastPersonalFastest,
					"text-zinc-500!": !last?.Value,
				})}
			>
				{last?.Value ? last.Value : "--:--.---"}
			</p>
			<p
				className={clsx("text-xs leading-none tabular-nums mt-1", {
					"text-violet-400! font-bold": hasFastest,
					"text-zinc-500": !hasFastest && !!best?.Value,
					"text-zinc-500!": !best?.Value,
				})}
			>
				{best?.Value ? best.Value : "--:--.---"}
			</p>
		</div>
	);
}
