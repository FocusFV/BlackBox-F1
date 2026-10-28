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
		<div className="flex gap-1.5 select-none font-mono">
			{sectors.map((sector, i) => {
				const isRecord = Boolean(sector.OverallFastest);
				const isPersonal = Boolean(sector.PersonalFastest);

				return (
					<div
						key={`sector.${i}`}
						className={clsx(
							"flex flex-col gap-1 w-[4.85rem] items-center justify-center px-1.5 py-1 rounded-md border transition-all duration-200",
							{
								"bg-purple-950/40 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]": isRecord,
								"bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]": isPersonal && !isRecord,
								"bg-zinc-900/60 border-zinc-800/80": !isRecord && !isPersonal,
							}
						)}
					>
						{showMiniSectors && (
							<div className="flex flex-row gap-0.5 justify-center">
								{/* 🛡️ Protegido con optional chaining por si Segments viene undefined */}
								{sector.Segments?.map((segment, j) => (
									<MiniSector status={segment.Status} key={`sector.mini.${j}`} />
								))}
							</div>
						)}

						<p
							className={clsx("text-xs leading-none font-black tabular-nums tracking-tight mt-0.5", {
								"text-purple-300": isRecord,
								"text-emerald-300": isPersonal && !isRecord,
								"text-zinc-200": !isRecord && !isPersonal && !!sector.Value,
								"text-zinc-500": !sector.Value,
							})}
						>
							{!!sector.Value ? sector.Value : !!sector.PreviousValue ? sector.PreviousValue : "--.---"}
						</p>

						{showBestSectors && bestSectors?.[i]?.Value && (
							<p
								className={clsx("text-[9px] leading-none text-zinc-500 tabular-nums", {
									"text-purple-400 font-bold": bestSectors?.[i]?.Position === 1,
								})}
							>
								{bestSectors[i].Value}
							</p>
						)}
					</div>
				);
			})}
		</div>
	);
}

function MiniSector({ status }: { status: number }) {
	return (
		<div
			style={{ width: 13, height: 3.5, borderRadius: 1 }}
			className={clsx({
				"bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.7)]": status === 2048 || status === 2052,
				"bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]": status === 2049,
				"bg-violet-400 shadow-[0_0_4px_rgba(167,139,250,0.8)]": status === 2051,
				"bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.7)]": status === 2064,
				"bg-zinc-800/80": status === 0,
			})}
		/>
	);
}