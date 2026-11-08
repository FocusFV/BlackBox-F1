"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { TimingDataDriver } from "@/types/state.type";

type Props = {
	last: TimingDataDriver["LastLapTime"];
	best: TimingDataDriver["BestLapTime"];
	hasFastest: boolean;
	isLastOverallFastest?: boolean;
	isLastPersonalFastest?: boolean;
	inPit?: boolean;
	pitOut?: boolean;
};

export default function DriverLapTime({
	last,
	best,
	hasFastest,
	isLastOverallFastest = false,
	isLastPersonalFastest = false,
	inPit = false,
	pitOut = false,
}: Props) {
	const pitStartTimeRef = useRef<number | null>(null);
	const [pitElapsed, setPitElapsed] = useState<number>(0);

	// ⏱️ Cronómetro en vivo de parada / tiempo transcurrido en el Pit Lane
	useEffect(() => {
		if (inPit) {
			if (!pitStartTimeRef.current) {
				pitStartTimeRef.current = Date.now();
			}
			const interval = setInterval(() => {
				if (pitStartTimeRef.current) {
					const sec = (Date.now() - pitStartTimeRef.current) / 1000;
					setPitElapsed(sec);
				}
			}, 100);
			return () => clearInterval(interval);
		} else {
			pitStartTimeRef.current = null;
			setPitElapsed(0);
		}
	}, [inPit]);

	// 🛠️ MODO PIT STOP: Muestra el cronómetro activo de parada en boxes
	if (inPit) {
		return (
			<div className="place-self-start font-mono text-center min-w-[5.5rem] select-none flex flex-col items-center justify-center">
				<div className="flex items-center gap-1 text-amber-300 text-sm font-black tracking-tight tabular-nums">
					<span className="text-[11px] leading-none">⏱️</span>
					<span className="leading-none">{pitElapsed > 0 ? `${pitElapsed.toFixed(1)}s` : "0.0s"}</span>
				</div>
				<span className="text-[9px] font-black uppercase tracking-wider text-amber-400/90 mt-1 leading-none">
					TIEMPO PIT
				</span>
			</div>
		);
	}

	// 🏎️ MODO PIT OUT: Salida de boxes acelerando a pista
	if (pitOut) {
		return (
			<div className="place-self-start font-mono text-center min-w-[5.5rem] select-none flex flex-col items-center justify-center">
				<div className="flex items-center gap-1 text-cyan-300 text-sm font-black tracking-tight tabular-nums">
					<span className="text-[11px] leading-none">🏎️</span>
					<span className="leading-none">OUT</span>
				</div>
				<span className="text-[9px] font-black uppercase tracking-wider text-cyan-400/90 mt-1 leading-none">
					PIT EXIT
				</span>
			</div>
		);
	}

	return (
		<div className="place-self-start font-mono text-center min-w-[5.5rem]">
			<p
				className={clsx("text-base leading-none font-bold tabular-nums", {
					"text-violet-400!": isLastOverallFastest,
					"text-emerald-400!": !isLastOverallFastest && isLastPersonalFastest,
					"text-zinc-500!": !last?.Value,
				})}
			>
				{last?.Value ? last.Value : "--:--.---"}
			</p>
			<p
				className={clsx("text-xs leading-none tabular-nums mt-1", {
					"text-violet-400! font-bold": hasFastest,
					"text-zinc-500": !hasFastest && !!best?.Value,
					"text-zinc-500!": !best?.Value,
				})}
			>
				{best?.Value ? best.Value : "--:--.---"}
			</p>
		</div>
	);
}
