"use client";

import clsx from "clsx";
import { motion } from "motion/react";

import type { Driver, TimingDataDriver } from "@/types/state.type";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";
import { triggerHaptic } from "@/lib/haptics";

import DriverTag from "./DriverTag";
import DriverDRS from "./DriverDRS";
import DriverGap from "./DriverGap";
import DriverTire from "./DriverTire";
import DriverMiniSectors from "./DriverMiniSectors";
import DriverLapTime from "./DriverLapTime";
import DriverInfo from "./DriverInfo";
import DriverCarMetrics from "./DriverCarMetrics";

type Props = {
	position: number;
	driver: Driver;
	timingDriver: TimingDataDriver;
	teamColor?: string; // 🌟 LE AGREGAMOS EL '?' ACÁ PARA HACERLA OPCIONAL
};

const hasDRS = (drs: number) => drs > 9;

const possibleDRS = (drs: number) => drs === 8;

const inDangerZone = (position: number, sessionPart: number) => {
	switch (sessionPart) {
		case 1:
			return position > 15;
		case 2:
			return position > 10;
		case 3:
		default:
			return false;
	}
};

export default function Driver({ driver, timingDriver, position, teamColor }: Props) {
	const sessionPart = useDataStore((state) => state.state?.TimingData?.SessionPart);
	const timingStatsDriver = useDataStore((state) => state.state?.TimingStats?.Lines[driver.RacingNumber]);
	const appTimingDriver = useDataStore((state) => state.state?.TimingAppData?.Lines[driver.RacingNumber]);
	const carData = useDataStore((state) => (state?.carsData ? state.carsData[driver.RacingNumber]?.Channels : undefined));

	const hasFastest = timingStatsDriver?.PersonalBestLapTime.Position == 1;

	const carMetrics = useSettingsStore((state) => state.carMetrics);
	const gridDensity = useSettingsStore((state) => state.gridDensity);
	const isCompact = gridDensity === "compact";

	const favoriteDriver = useSettingsStore((state) => state.favoriteDrivers.includes(driver.RacingNumber));

	return (
		<motion.div
			layout="position"
			whileHover={{ x: 3 }}
			onClick={() => triggerHaptic("light")}
			className={clsx(
				"group/driver flex flex-col gap-1 rounded-lg select-none transition-all duration-200 cursor-pointer border bg-zinc-950/40 border-zinc-900/60 hover:border-zinc-700/70 hover:bg-zinc-900/50",
				isCompact ? "p-1" : "p-1.5",
				{
					"opacity-40 grayscale": timingDriver.KnockedOut || timingDriver.Retired || timingDriver.Stopped,
					"bg-sky-950/40 border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.15)]": favoriteDriver,
					"bg-violet-950/40 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]": hasFastest,
					"bg-red-950/40 border-red-500/50": sessionPart != undefined && inDangerZone(position, sessionPart),
				}
			)}
		>
			<div
				className="grid items-center gap-2"
				style={{
					gridTemplateColumns: carMetrics
						? "5.5rem 3.5rem 5.5rem 4rem 5rem 5.5rem auto 10.5rem"
						: "5.5rem 3.5rem 5.5rem 4rem 5rem 5.5rem auto",
				}}
			>
				{/* 🌟 Usamos la prop teamColor que viene desde LeaderBoard */}
				<DriverTag className="min-w-full!" short={driver.Tla} teamColor={teamColor || `#${driver.TeamColour}` || "#A1A1AA"} position={position} />
				<DriverDRS
					on={carData ? hasDRS(carData[45]) : false}
					possible={carData ? possibleDRS(carData[45]) : false}
					inPit={timingDriver.InPit}
					pitOut={timingDriver.PitOut}
				/>
				<DriverTire stints={appTimingDriver?.Stints} />
				<DriverInfo timingDriver={timingDriver} gridPos={appTimingDriver ? parseInt(appTimingDriver.GridPos) : 0} />
				<DriverGap timingDriver={timingDriver} sessionPart={sessionPart} />
				<DriverLapTime last={timingDriver.LastLapTime} best={timingDriver.BestLapTime} hasFastest={hasFastest} />
				<DriverMiniSectors sectors={timingDriver.Sectors} bestSectors={timingStatsDriver?.BestSectors} />

				{carMetrics && carData && <DriverCarMetrics carData={carData} />}
			</div>
		</motion.div>
	);
}