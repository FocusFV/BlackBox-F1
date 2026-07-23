import clsx from "clsx";

type Props = {
	teamColor: string;
	short: string;
	position?: number;
	className?: string;
};

export default function DriverTag({ position, teamColor, short, className }: Props) {
	// 🛡️ Prevenimos el error del doble "#" si teamColor ya trae el hashtag
	const hexColor = teamColor ? (teamColor.startsWith("#") ? teamColor : `#${teamColor}`) : "#3f3f46";

	return (
		<div
			id="walkthrough-driver-position"
			className={clsx(
				"flex w-fit items-center justify-between gap-0.5 rounded-lg px-1 py-1 font-black",
				className
			)}
			style={{ backgroundColor: hexColor }}
		>
			{position && <p className="px-1 text-xl leading-none text-white">{position}</p>}

			<div className="flex h-min w-min items-center justify-center rounded-md bg-white px-1">
				<p className="font-mono font-bold" style={{ color: hexColor }}>
					{short}
				</p>
			</div>
		</div>
	);
}