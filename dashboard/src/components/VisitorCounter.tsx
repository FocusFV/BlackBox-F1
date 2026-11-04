"use client";

import { useEffect, useState } from "react";

const INITIAL_BASE = "6.123";

export function VisitorCounter() {
	const [countStr, setCountStr] = useState<string>(INITIAL_BASE);

	useEffect(() => {
		let isMounted = true;

		async function registerVisit() {
			try {
				const hasCounted = sessionStorage.getItem("bb_spectator_hit");
				const url = hasCounted ? "/api/visitors" : "/api/visitors?hit=1";

				if (!hasCounted) {
					sessionStorage.setItem("bb_spectator_hit", "1");
				}

				const res = await fetch(url);
				if (res.ok) {
					const data = await res.json();
					if (isMounted && data.formatted) {
						setCountStr(data.formatted);
					}
				}
			} catch (err) {
				// Mantiene el valor base elegante sin romper
			}
		}

		registerVisit();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<div
			className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-zinc-900/40 px-2.5 py-0.5 rounded-full border border-zinc-800/60 shadow-xs hover:border-zinc-700/80 transition-colors select-none"
			title="Total de espectadores acumulados en el Pit-Wall"
		>
			<span className="relative flex h-1.5 w-1.5">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
			</span>
			<span className="text-zinc-300 font-bold tracking-tight">{countStr}</span>
			<span className="text-zinc-500 font-sans text-[11px]">espectadores</span>
		</div>
	);
}
