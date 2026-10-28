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
		<div className="flex items-center gap-2 place-self-start font-mono select-none">
			{/* Marcha actual */}
			<div
				className="flex h-7 w-8 items-center justify-center rounded-md border border-amber-500/40 bg-zinc-900/90 text-xs font-black text-amber-400 shadow-inner"
				title="Marcha actual"
			>
				M{carData[3] || "N"}
			</div>

			{/* Velocidad */}
			<div className="min-w-[3.4rem]">
				<p className="text-right text-sm font-black text-white tabular-nums leading-none tracking-tight">
					{speedUnit === "metric" ? carData[2] : convertKmhToMph(carData[2])}
				</p>
				<p className="text-right text-[8px] font-bold text-zinc-500 uppercase leading-none mt-0.5">
					{speedUnit === "metric" ? "km/h" : "mph"}
				</p>
			</div>

			{/* Barras con etiquetas en español: FRE (freno), ACEL (acelerador), RPM (tacómetro) */}
			<div className="flex flex-col gap-0.5 text-[8px] font-bold">
				<div className="flex items-center gap-1">
					<span className="w-4 text-right text-[7px] text-red-400 font-bold leading-none">FRE</span>
					<DriverPedals className="bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" value={carData[5]} maxValue={1} />
				</div>
				<div className="flex items-center gap-1">
					<span className="w-4 text-right text-[7px] text-emerald-400 font-bold leading-none">ACE</span>
					<DriverPedals className="bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" value={carData[4]} maxValue={100} />
				</div>
				<div className="flex items-center gap-1">
					<span className="w-4 text-right text-[7px] text-cyan-400 font-bold leading-none">RPM</span>
					<DriverPedals className="bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]" value={carData[0]} maxValue={15000} />
				</div>
			</div>
		</div>
	);
}
