import type { CarDataChannels } from "@/types/state.type";
import SpeedGauge from "@/components/complications/SpeedGauge";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	carData: CarDataChannels;
};

function convertKmhToMph(kmhValue: number) {
	return Math.floor(kmhValue / 1.609344);
}

export default function DriverSpeedometer({ carData }: Props) {
	const speedUnit = useSettingsStore((state) => state.speedUnit);

	const rpm = useAnimatedNumber(carData[0] || 0);
	const throttle = useAnimatedNumber(carData[4] || 0);
	const rawSpeed = carData[2] || 0;
	const speed = useAnimatedNumber(rawSpeed);

	const displayedSpeed = speedUnit === "metric" ? speed : convertKmhToMph(speed);

	return (
		<div className="flex size-32 flex-col items-center justify-center">
			<SpeedGauge
				value={rpm}
				min={0}
				max={15000}
				size={128}
				strokeWidth={5}
				guideClassName="stroke-zinc-700"
				progressClassName="stroke-blue-500"
			/>

			<SpeedGauge
				value={throttle}
				min={0}
				max={100}
				startAngle={-130}
				endAngle={80}
				size={110}
				strokeWidth={8}
				guideClassName="stroke-zinc-700"
				progressClassName="stroke-green-400"
			/>

			<SpeedGauge
				value={!!carData[5] ? 10 : 0}
				min={0}
				max={10}
				startAngle={95}
				endAngle={130}
				size={110}
				strokeWidth={8}
				guideClassName="stroke-zinc-700"
				progressClassName="stroke-red-700"
			/>

			{/* Marcha (Gear) */}
			<p className="mt-12 text-2xl tabular-nums font-bold">{carData[3] ?? "N"}</p>

			{/* Velocidad animada + Unidad dinámica */}
			<p className="text-xl tabular-nums font-bold">{displayedSpeed.toFixed(0)}</p>
			<p className="text-xs text-zinc-500 uppercase">{speedUnit === "metric" ? "km/h" : "mp/h"}</p>
		</div>
	);
}