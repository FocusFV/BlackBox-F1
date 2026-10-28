import { useSettingsStore } from "@/stores/useSettingsStore";

import type { CarDataChannels } from "@/types/state.type";

import DriverPedals from "./DriverPedals";

type Props = {
	carData: CarDataChannels;
};

function convertKmhToMph(kmhValue: number) {
	return Math.floor(kmhValue / 1.609344);
}

export default function DriverCarMetrics({ carData }: Props) {
	const speedUnit = useSettingsStore((state) => state.speedUnit);

	return (
		<div className="flex items-center gap-2.5 place-self-start">
			<div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700/80 bg-zinc-900 font-mono text-sm font-black text-amber-400 shadow-inner">
				{carData[3] || "N"}
			</div>

			<div className="min-w-[3.2rem]">
				<p className="text-right font-mono text-sm font-black text-white tabular-nums leading-none tracking-tight">
					{speedUnit === "metric" ? carData[2] : convertKmhToMph(carData[2])}
				</p>
				<p className="text-right text-[9px] font-mono font-medium text-zinc-500 leading-none mt-0.5">
					{speedUnit === "metric" ? "km/h" : "mp/h"}
				</p>
			</div>

			<div className="flex flex-col gap-1">
				<DriverPedals className="bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" value={carData[5]} maxValue={1} />
				<DriverPedals className="bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" value={carData[4]} maxValue={100} />
				<DriverPedals className="bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" value={carData[0]} maxValue={15000} />
			</div>
		</div>
	);
}
