import Image from "next/image";
import type { Stint } from "@/types/state.type";

type Props = {
	stints: Stint[] | undefined;
};

export default function DriverTire({ stints }: Props) {
	const stops = stints && stints.length > 0 ? stints.length - 1 : 0;
	const currentStint = stints && stints.length > 0 ? stints[stints.length - 1] : null;

	const compoundName = currentStint?.Compound?.toLowerCase() ?? "";
	const unknownCompound = !["soft", "medium", "hard", "intermediate", "wet"].includes(compoundName);

	return (
		<div className="flex flex-row items-center gap-2 place-self-start select-none">
			{currentStint && !unknownCompound && (
				<Image
					src={`/tires/${compoundName}.svg`}
					width={32}
					height={32}
					alt={compoundName}
				/>
			)}

			{currentStint && unknownCompound && (
				<div className="flex h-8 w-8 items-center justify-center">
					<Image src="/tires/unknown.svg" width={32} height={32} alt="unknown" />
				</div>
			)}

			{!currentStint && <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800 font-semibold" />}

			<div>
				<p className="leading-none font-medium tabular-nums">
					L {currentStint?.TotalLaps ?? 0}
					{currentStint && !currentStint.New ? "*" : ""}
				</p>

				<p className="text-xs leading-none text-zinc-500 font-mono mt-0.5">PIT {stops}</p>
			</div>
		</div>
	);
}