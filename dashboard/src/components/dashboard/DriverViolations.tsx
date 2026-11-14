import { useTranslation } from "@/hooks/useTranslation";
import type { Driver, TimingData } from "@/types/state.type";

import { calculatePosition } from "@/lib/calculatePosition";

import DriverTag from "@/components/driver/DriverTag";

type Props = {
	driver: Driver;
	driverViolations: number;
	driversTiming: TimingData | undefined;
};

export default function DriverViolations({ driver, driverViolations, driversTiming }: Props) {
	const { t } = useTranslation();
	return (
		<div className="flex gap-2 p-1.5" key={`violation.${driver.RacingNumber}`}>
			<DriverTag className="h-fit" teamColor={driver.TeamColour} short={driver.Tla} />

			<div className="flex flex-col justify-around text-sm leading-none text-zinc-600">
				<p>
					{driverViolations} {driverViolations > 1 ? t("track_limits.infractions", "Infracciones") : t("track_limits.infraction", "Infracción")}
					{driverViolations > 4 && <span> - {Math.round(driverViolations / 5) * 5}{t("track_limits.penalty_seconds", "s de Sanción")}</span>}
				</p>
				{driverViolations > 4 && driversTiming && (
					<p>
						{calculatePosition(Math.round(driverViolations / 5) * 5, driver.RacingNumber, driversTiming)}
						{t("track_limits.pos_after_penalty", "° después de la sanción")}
					</p>
				)}
			</div>
		</div>
	);
}