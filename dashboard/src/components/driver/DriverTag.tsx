import clsx from "clsx";
import { resolveDriverColor } from "@/lib/teamcolors";

type Props = {
	teamColor: string;
	short: string;
	position?: number;
	className?: string;
	isFavorite?: boolean;
};

export default function DriverTag({ position, teamColor, short, className, isFavorite }: Props) {
	// 🌟 Resuelve el color oficial normalizado 2026 (ej. Alpine Rosa BWT, Ferrari Rojo, Williams Azul)
	const resolved = resolveDriverColor(short, undefined, teamColor);
	const hexColor = resolved.startsWith("#") ? resolved : `#${resolved}`;

	return (
		<div
			id="walkthrough-driver-position"
			className={clsx(
				"flex w-fit items-center justify-between gap-1 rounded-lg px-1 py-1 font-black transition-all",
				className
			)}
			style={{ backgroundColor: hexColor }}
		>
			{position && <p className="px-1 text-xl leading-none text-white">{position}</p>}

			<div className="flex h-min w-min items-center justify-center gap-1 rounded-md bg-white px-1">
				{isFavorite && (
					<span className="text-amber-500 text-[11px] leading-none select-none">⭐</span>
				)}
				<p className="font-mono font-bold" style={{ color: hexColor }}>
					{short}
				</p>
			</div>
		</div>
	);
}