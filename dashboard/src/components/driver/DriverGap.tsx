import { useRef } from "react";
import clsx from "clsx";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	sessionPart: number | undefined;
};

export default function DriverGap({ timingDriver, sessionPart }: Props) {
	const timeFormat = useSettingsStore((state) => state.timeFormat);
	const lastPrimaryRef = useRef<string>("");
	const lastSecondaryRef = useRef<string>("");

	const gapToLeader =
		timingDriver.GapToLeader ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0]?.TimeDiffToFastest : undefined) ??
		timingDriver.TimeDiffToFastest ??
		"";

	const gapToFront =
		timingDriver.IntervalToPositionAhead?.Value ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0]?.TimeDifftoPositionAhead : undefined) ??
		timingDriver.TimeDiffToPositionAhead ??
		"";

	const catching = timingDriver.IntervalToPositionAhead?.Catching;

	const newPrimary = timeFormat === "leader" ? (gapToLeader || gapToFront) : (gapToFront || gapToLeader);
	const newSecondary = timeFormat === "leader" ? gapToFront : gapToLeader;

	if (newPrimary) {
		lastPrimaryRef.current = newPrimary;
	}
	if (newSecondary) {
		lastSecondaryRef.current = newSecondary;
	}

	const displayPrimary = newPrimary || lastPrimaryRef.current;
	const displaySecondary = newSecondary || lastSecondaryRef.current;

	return (
		<div className="place-self-start font-mono min-w-[4.8rem]">
			<p
				className={clsx("text-base leading-none font-bold tabular-nums", {
					"text-emerald-400": catching,
					"text-zinc-500": !displayPrimary,
				})}
			>
				{!!displayPrimary ? displayPrimary : "--.---"}
			</p>

			<p className="text-xs leading-none text-zinc-500 tabular-nums mt-1">
				{!!displaySecondary ? displaySecondary : "--.---"}
			</p>
		</div>
	);
}
