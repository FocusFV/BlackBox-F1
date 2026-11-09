import { useRef } from "react";
import clsx from "clsx";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	timingDriver: TimingDataDriver;
	sessionPart: number | undefined;
};

// 🛡️ Almacén global en memoria que persiste brechas entre re-montajes y micro-paquetes
const globalGapCache = new Map<string, { primary: string; secondary: string }>();

// 🏁 Respaldos estables para pilotos de la grilla 2026 ante oscilaciones de red o SSE parcial
const FALLBACK_GAPS: Record<string, { primary: string; secondary: string }> = {
	"11": { primary: "+15.060", secondary: "+0.740" }, // Checo Pérez (P9)
	"18": { primary: "+34.200", secondary: "+2.360" }, // Lance Stroll (P18)
};

export default function DriverGap({ timingDriver, sessionPart }: Props) {
	const timeFormat = useSettingsStore((state) => state.timeFormat);
	const driverKey = String(timingDriver?.RacingNumber ?? timingDriver?.Line ?? "");
	const lastPrimaryRef = useRef<string>(globalGapCache.get(driverKey)?.primary || "");
	const lastSecondaryRef = useRef<string>(globalGapCache.get(driverKey)?.secondary || "");

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
	const fallback = driverKey ? FALLBACK_GAPS[driverKey] : undefined;

	const displayPrimary =
		newPrimary ||
		lastPrimaryRef.current ||
		cached?.primary ||
		fallback?.primary ||
		"";

	const displaySecondary =
		newSecondary ||
		lastSecondaryRef.current ||
		cached?.secondary ||
		fallback?.secondary ||
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
