import clsx from "clsx";

import type { Sector, TimingDataDriver, TimingStatsDriver } from "@/types/state.type";
import { useSettingsStore } from "@/stores/useSettingsStore";

type Props = {
	sectors: TimingDataDriver["Sectors"];
	bestSectors: TimingStatsDriver["BestSectors"] | undefined;
};

export default function DriverMiniSectors({ sectors = [], bestSectors }: Props) {
	const showMiniSectors = useSettingsStore((state) => state.showMiniSectors);
	const showBestSectors = useSettingsStore((state) => state.showBestSectors);

	// 🛡️ En F1 reglamentariamente siempre hay exactamente 3 sectores por vuelta (S1, S2, S3).
	// Garantizamos una tupla fija de 3 elementos mapeando exactamente por índice (0, 1, 2)
	// para que las columnas nunca se corran ni se desplacen hacia los lados.
	const rawMap = Array.isArray(sectors) ? sectors : (Object.values(sectors || {}) as Sector[]);
	const fixedSectors: (Sector | undefined)[] = [
		(sectors as any)?.[0] ?? (sectors as any)?.["0"] ?? rawMap[0],
		(sectors as any)?.[1] ?? (sectors as any)?.["1"] ?? rawMap[1],
		(sectors as any)?.[2] ?? (sectors as any)?.["2"] ?? rawMap[2],
	];

	return (
		<div className="flex gap-1.5 select-none font-mono">
			{fixedSectors.map((sector, i) => {
				const isRecord = Boolean(sector?.OverallFastest);
				const isPersonal = Boolean(sector?.PersonalFastest);

				return (
					<div
						key={`sector.${i}`}
						className={clsx(
							"flex flex-col gap-1 w-[4.85rem] items-center justify-center px-1.5 py-1 rounded-md border transition-all duration-200 overflow-hidden",
							{
								"bg-purple-950/40 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]": isRecord,
								"bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]": isPersonal && !isRecord,
								"bg-zinc-900/60 border-zinc-800/80": !isRecord && !isPersonal,
							}
						)}
					>
						{showMiniSectors && (
							<div className="flex flex-row gap-0.5 justify-center items-center w-full px-0.5 h-[4px]">
								{sector?.Segments && sector.Segments.length > 0 ? (
									sector.Segments.map((segment, j) => (
										<MiniSector status={segment.Status} key={`sector.mini.${j}`} />
									))
								) : (
									<div className="h-[3.5px]" />
								)}
							</div>
						)}

						<p
							className={clsx("text-xs leading-none font-black tabular-nums tracking-tight mt-0.5", {
								"text-purple-300": isRecord,
								"text-emerald-300": isPersonal && !isRecord,
								"text-zinc-200": !isRecord && !isPersonal && !!sector?.Value,
								"text-zinc-500": !sector?.Value,
							})}
						>
							{sector?.Value ? sector.Value : sector?.PreviousValue ? sector.PreviousValue : "--.---"}
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
			className={clsx(
				"h-[3.5px] flex-1 max-w-[8px] min-w-[2px] rounded-[1px] transition-colors shrink-0",
				{
					"bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.7)]": status === 2048 || status === 2052,
					"bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]": status === 2049,
					"bg-violet-400 shadow-[0_0_4px_rgba(167,139,250,0.8)]": status === 2051,
					"bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.7)]": status === 2064,
					"bg-zinc-800/80": status === 0 || !status,
				}
			)}
		/>
	);
}