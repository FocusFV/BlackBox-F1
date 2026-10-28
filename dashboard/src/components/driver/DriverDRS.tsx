import clsx from "clsx";

type Props = {
	on: boolean;
	possible: boolean;
	inPit: boolean;
	pitOut: boolean;
};

export default function DriverDRS({ on, possible, inPit, pitOut }: Props) {
	const pit = inPit || pitOut;

	return (
		<span
			className={clsx(
				"text-[10px] inline-flex h-7 w-full items-center justify-center rounded-md border font-mono font-black uppercase tracking-wider select-none",
				{
					"border-zinc-800 text-zinc-600 bg-zinc-950/40": !pit && !on && !possible,
					"border-zinc-600 text-zinc-300 bg-zinc-900/60": !pit && !on && possible,
					"border-emerald-500 text-emerald-400 bg-emerald-950/40 shadow-[0_0_10px_rgba(16,185,129,0.35)] animate-pulse": !pit && on,
					"border-cyan-500 text-cyan-400 bg-cyan-950/30": pit,
				},
			)}
		>
			{pit ? "BOX" : "BOOST"}
		</span>
	);
}
