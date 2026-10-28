"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LeaderBoard from "@/components/dashboard/LeaderBoard";
import RaceControl from "@/components/dashboard/RaceControl";
import TeamRadios from "@/components/dashboard/TeamRadios";
import TrackViolations from "@/components/dashboard/TrackViolations";
import Map from "@/components/dashboard/Map";
import Footer from "@/components/Footer";
import { simulator } from "@/lib/simulatorFeed";
import { RaceControlAlertBanner } from "@/components/dashboard/RaceControlAlertBanner";
import { TeamRadioAlertPopup } from "@/components/dashboard/TeamRadioAlertPopup";
import { HeadToHeadModal } from "@/components/dashboard/HeadToHeadModal";
import { TvSyncControl } from "@/components/dashboard/TvSyncControl";
import { Swords, ArrowLeft, Radio, Gauge, Sparkles } from "lucide-react";

export default function DemoPage() {
	const [isH2HOpen, setIsH2HOpen] = useState(false);

	useEffect(() => {
		// Iniciar simulación con los 22 pilotos de 2026
		simulator.start();

		return () => {
			// Detener simulación al salir de la página
			simulator.stop();
		};
	}, []);

	return (
		<div className="flex w-full flex-col gap-4 px-4 py-4 text-zinc-100 min-h-screen">
			{/* 🏎️ Barra de estado HUD Secreta / Demo */}
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-zinc-950/90 px-4 py-2.5 backdrop-blur-md shadow-lg shadow-amber-950/20">
				<div className="flex items-center gap-3">
					<Link
						href="/dashboard"
						className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-all cursor-pointer"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						<span>Volver al Dashboard</span>
					</Link>

					<div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
						<span className="relative flex h-3 w-3">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
							<span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
						</span>
						<span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
							GRAN PREMIO DE MÉXICO 2026 • CARRERA EN VIVO
						</span>
						<span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/40 uppercase">
							VUELTA 28 / 53 • REGS 2026 (MOM)
						</span>
					</div>
				</div>

				{/* Controles de la derecha: Cara a Cara y TV Sync */}
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => setIsH2HOpen(true)}
						className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-red-500/50 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
						title="Abrir comparador Cara a Cara entre dos pilotos"
					>
						<Swords className="h-3.5 w-3.5 text-red-500" />
						<span>Cara a Cara</span>
					</button>

					<TvSyncControl />
				</div>
			</div>

			{/* Alertas dinámicas de Dirección de Carrera (MOM, banderas, sectores) */}
			<RaceControlAlertBanner />

			{/* Popup flotante de Team Radios en vivo */}
			<TeamRadioAlertPopup />

			{/* HUD de comando en vivo */}
			<div className="flex w-full flex-col gap-2 2xl:flex-row">
				<div className="overflow-x-auto">
					<LeaderBoard />
				</div>
				<div className="flex-1 2xl:max-h-[50rem]">
					<Map />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
				<div>
					<RaceControl />
				</div>
				<div>
					<TeamRadios />
				</div>
				<div>
					<TrackViolations />
				</div>
			</div>

			{/* Modal Comparador Cara a Cara */}
			<HeadToHeadModal isOpen={isH2HOpen} onClose={() => setIsH2HOpen(false)} />

			<Footer />
		</div>
	);
}
