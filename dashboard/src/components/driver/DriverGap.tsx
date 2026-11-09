import { useRef } from "react";
import clsx from "clsx";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	sessionPart: number | undefined;
	cumulativeGap?: string;
	intervalGap?: string;
	position?: number;
};

// 🛡️ Almacén global en memoria que persiste brechas entre re-montajes y micro-paquetes
const globalGapCache = new Map<string, { primary: string; secondary: string }>();

export default function DriverGap({ timingDriver, sessionPart, cumulativeGap, intervalGap, position }: Props) {
	const timeFormat = useSettingsStore((state) => state.timeFormat);
	const driverKey = String(timingDriver?.RacingNumber ?? timingDriver?.Line ?? "");
	const lastPrimaryRef = useRef<string>(globalGapCache.get(driverKey)?.primary || "");
	const lastSecondaryRef = useRef<string>(globalGapCache.get(driverKey)?.secondary || "");

	const rawGtl =
		timingDriver.GapToLeader ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0]?.TimeDiffToFastest : undefined) ??
		timingDriver.TimeDiffToFastest ??
		"";

	const rawInterval =
		timingDriver.IntervalToPositionAhead?.Value ??
		(timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0]?.TimeDifftoPositionAhead : undefined) ??
		timingDriver.TimeDiffToPositionAhead ??
		"";

	const isP1 = position === 1 || timingDriver.Position === "1" || timingDriver.Line === 1;

	// 🏁 Formatear brecha acumulada con el líder (estrictamente monótona y creciente)
	const formatLeaderGap = (gap: string): string => {
		if (isP1) return "LÍDER";
		if (!gap) return "";
		const lapMatch = gap.match(/^(\d+)\s*L/i) || gap.match(/^\+(\d+)\s*L/i);
		if (lapMatch) {
			const laps = parseInt(lapMatch[1], 10);
			return laps === 1 ? "+1 VTA" : `+${laps} VTAS`;
		}
		if (gap.includes(":") || gap.startsWith("+")) return gap;
		const num = parseFloat(gap);
		if (!isNaN(num)) return `+${num.toFixed(3)}`;
		return gap;
	};

	const gapToLeader = formatLeaderGap(cumulativeGap || rawGtl);
	const gapToFront = intervalGap || (rawInterval ? (rawInterval.startsWith("+") ? rawInterval : `+${rawInterval}`) : "");

	const catching = timingDriver.IntervalToPositionAhead?.Catching;

	// Un solo criterio en BlackBox: la brecha principal siempre es la acumulada con el líder
	const newPrimary = gapToLeader || (isP1 ? "LÍDER" : gapToFront);
	const newSecondary = isP1 ? "" : gapToFront;

	if (newPrimary && newPrimary !== "--.---") {
		lastPrimaryRef.current = newPrimary;
		if (driverKey) {
			globalGapCache.set(driverKey, {
				primary: newPrimary,
				secondary: newSecondary || globalGapCache.get(driverKey)?.secondary || "",
			});
		}
	}
	if (newSecondary && newSecondary !== "--.---") {
		lastSecondaryRef.current = newSecondary;
		if (driverKey) {
			const existing = globalGapCache.get(driverKey);
			globalGapCache.set(driverKey, {
				primary: existing?.primary || newPrimary || "",
				secondary: newSecondary,
			});
		}
	}

	const cached = driverKey ? globalGapCache.get(driverKey) : undefined;

	const displayPrimary =
		newPrimary ||
		lastPrimaryRef.current ||
		cached?.primary ||
		"";

	const displaySecondary =
		newSecondary ||
		lastSecondaryRef.current ||
		cached?.secondary ||
		"";

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
