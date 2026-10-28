import clsx from "clsx";

import type { TimingDataDriver, TimingStatsDriver } from "@/types/state.type";
import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	sectors: TimingDataDriver["Sectors"];
	bestSectors: TimingStatsDriver["BestSectors"] | undefined;
};

export default function DriverMiniSectors({ sectors = [], bestSectors }: Props) {
	const showMiniSectors = useSettingsStore((state) => state.showMiniSectors);
	const showBestSectors = useSettingsStore((state) => state.showBestSectors);

	return (
		<div className="flex gap-2">
			{sectors.map((sector, i) => (
				<div key={`sector.${i}`} className="flex flex-col gap-1 w-[4.75rem] items-center text-center">
					{showMiniSectors && (
						<div className="flex flex-row gap-0.5 justify-center">
							{/* 🛡️ Protegido con optional chaining por si Segments viene undefined */}
							{sector.Segments?.map((segment, j) => (
								<MiniSector status={segment.Status} key={`sector.mini.${j}`} />
							))}
						</div>
					)}

					<div className={clsx("flex font-mono", showMiniSectors ? "items-center justify-center gap-1" : "flex-col")}>
						<p
							className={clsx("text-base leading-none font-bold tabular-nums", {
								"text-violet-400!": sector.OverallFastest,
								"text-emerald-400!": sector.PersonalFastest,
								"text-zinc-500": !sector.Value,
							})}
						>
							{!!sector.Value ? sector.Value : !!sector.PreviousValue ? sector.PreviousValue : "--.---"}
						</p>

						{showBestSectors && (
							<p
								className={clsx("text-xs leading-none text-zinc-500 tabular-nums", {
									"text-violet-400!": bestSectors?.[i]?.Position === 1,
								})}
							>
								{bestSectors && bestSectors[i]?.Value ? bestSectors[i].Value : "--.---"}
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

function MiniSector({ status }: { status: number }) {
	return (
		<div
			style={{ width: 13, height: 4, borderRadius: 1.5 }}
			className={clsx({
				"bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)]": status === 2048 || status === 2052,
				"bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]": status === 2049,
				"bg-violet-400 shadow-[0_0_4px_rgba(167,139,250,0.6)]": status === 2051,
				"bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.6)]": status === 2064,
				"bg-zinc-800": status === 0,
			})}
		/>
	);
}