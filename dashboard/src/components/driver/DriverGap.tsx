import clsx from "clsx";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	sessionPart: number | undefined;
};

export default function DriverGap({ timingDriver, sessionPart }: Props) {
	const timeFormat = useSettingsStore((state) => state.timeFormat);

	const gapToLeader =
		timingDriver.GapToLeader ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0].TimeDiffToFastest : undefined) ??
		timingDriver.TimeDiffToFastest ??
		"";

	const gapToFront =
		timingDriver.IntervalToPositionAhead?.Value ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0].TimeDifftoPositionAhead : undefined) ??
		timingDriver.TimeDiffToPositionAhead ??
		"";

	const catching = timingDriver.IntervalToPositionAhead?.Catching;

	const primary = timeFormat === "leader" ? (gapToLeader || gapToFront) : (gapToFront || gapToLeader);
	const secondary = timeFormat === "leader" ? gapToFront : gapToLeader;

	return (
		<div className="place-self-start font-mono">
			<p
				className={clsx("text-lg leading-none font-bold tabular-nums", {
					"text-emerald-500": catching,
					"text-zinc-500": !primary,
				})}
			>
				{!!primary ? primary : "-- ---"}
			</p>

			<p className="text-xs leading-none text-zinc-500 tabular-nums mt-0.5">
				{!!secondary ? secondary : "-- ---"}
			</p>
		</div>
	);
}
