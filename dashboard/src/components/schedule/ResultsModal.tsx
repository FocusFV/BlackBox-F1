"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { X, Trophy } from "lucide-react";
import clsx from "clsx";

type Props = {
	meetingKey: number;
	raceName: string;
	onClose: () => void;
};

// 🏁 Mapa de colores Blackbox (heredado de ParcFerme)[cite: 10]
const driverTeamColorMap: { [key: string]: { bg: string; text: string } } = {
	"Red Bull Racing": { bg: "#3671C6", text: "#ffffff" },
	"Ferrari": { bg: "#E80020", text: "#ffffff" },
	"Mercedes": { bg: "#27F4D2", text: "#000000" },
	"McLaren": { bg: "#ff8700", text: "#ffffff" },
	"Aston Martin": { bg: "#006f62", text: "#ffffff" },
	"Alpine": { bg: "#ff00ff", text: "#ffffff" },
	"Williams": { bg: "#005aff", text: "#ffffff" },
	"RB": { bg: "#4b77ff", text: "#ffffff" },
	"Kick Sauber": { bg: "#52E252", text: "#000000" },
	"Haas F1 Team": { bg: "#B6BABD", text: "#000000" },
};

// 🏎️ Componente Logo integrado[cite: 10]
const TeamLogo = ({ teamName }: { teamName: string }) => {
    const cleanName = teamName.toLowerCase();
    const [fallbackIndex, setFallbackIndex] = useState(0);
    const fallbacks = [`/team-logos/${cleanName.replaceAll(" ", "-")}.svg`, "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>"];
    
    return (
        <img src={fallbacks[fallbackIndex]} alt={teamName} className="w-5 h-5 object-contain" onError={() => setFallbackIndex(1)} />
    );
};

export default function ResultsModal({ meetingKey, raceName, onClose }: Props) {
	const [results, setResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchRaceData() {
			try {
				const [posRes, driversRes] = await Promise.all([
					fetch(`https://api.openf1.org/v1/position?meeting_key=${meetingKey}`),
					fetch(`https://api.openf1.org/v1/drivers?meeting_key=${meetingKey}`)
				]);
				const posData = await posRes.json();
				const driversData = await driversRes.json();

				if (Array.isArray(posData) && Array.isArray(driversData)) {
					const driversMap = driversData.reduce((acc, d) => ({ ...acc, [d.driver_number]: d }), {});
					const latestPositions: Record<number, any> = {};
					posData.forEach((p: any) => {
						if (!latestPositions[p.driver_number] || p.date > latestPositions[p.driver_number].date) {
							latestPositions[p.driver_number] = p;
						}
					});

					const sorted = Object.values(latestPositions)
						.map((p: any) => ({ ...p, driverInfo: driversMap[p.driver_number] }))
						.sort((a, b) => a.position - b.position);

					setResults(sorted);
				}
			} catch (e) { console.error(e); } finally { setLoading(false); }
		}
		fetchRaceData();
	}, [meetingKey]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono">
			<motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
			<motion.div 
				initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }}
				className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-2xl p-5 shadow-2xl relative z-10 text-zinc-300"
			>
				<div className="flex items-start justify-between border-b border-zinc-900 pb-3 mb-4">
					<div>
						<span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">// ARCHIVO CLASIFICACIÓN FINAL</span>
						<h2 className="text-sm font-black text-neutral-100 uppercase tracking-wide mt-0.5">{raceName}</h2>
					</div>
					<button onClick={onClose} className="p-1 text-zinc-600 hover:text-amber-500 transition-colors"><X className="w-5 h-5" /></button>
				</div>

				<div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-2 pr-1">
					{loading ? (
						<div className="flex flex-col h-40 items-center justify-center text-amber-500/40 text-[10px] uppercase font-black">// CONECTANDO...</div>
					) : results.map((row) => {
						const teamColors = driverTeamColorMap[row.driverInfo?.team_name] || { bg: "#3f3f46", text: "#fff" };
						return (
							<div key={row.driver_number} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/20 border border-zinc-900 relative overflow-hidden h-14" style={{ borderLeft: `4px solid ${teamColors.bg}` }}>
								<div className="flex items-center gap-3 z-10">
									<span className={clsx("w-6 font-black text-center text-xs", row.position <= 3 ? "text-amber-500" : "text-zinc-600")}>{row.position}</span>
									{row.driverInfo?.country_code && <img src={`https://flagcdn.com/w20/${row.driverInfo.country_code.toLowerCase()}.png`} className="w-5 h-auto rounded-sm opacity-90 shadow-sm" />}
									<div className="flex-shrink-0"><TeamLogo teamName={row.driverInfo?.team_name || ""} /></div>
									<div className="flex flex-col">
										<span className="font-black text-xs text-zinc-100 uppercase">{row.driverInfo?.last_name || "PILOTO"}</span>
										<span className="text-[9px] text-zinc-500 font-bold uppercase">{row.driverInfo?.team_name}</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-[9px] font-mono bg-zinc-900/80 px-1.5 py-0.5 rounded text-zinc-500">#{row.driver_number}</span>
									{row.position === 1 && <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />}
								</div>
							</div>
						);
					})}
				</div>
			</motion.div>
		</div>
	);
}