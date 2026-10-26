"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCircuitDetails, type CircuitDetails, DEFAULT_CIRCUIT } from "@/lib/circuitBackdrops";
import { useEffect, useState } from "react";
import Flag from "@/components/Flag";
import { MapPin, Flag as FlagIcon, Timer, Gauge, Zap, Eye, RotateCcw } from "lucide-react";

interface Props {
	gpName?: string;
	country?: string;
	circuitId?: string;
	isCinematic?: boolean;
	onToggleCinematic?: () => void;
}

export function CircuitBackdrop({
	gpName,
	country,
	circuitId,
	isCinematic = false,
	onToggleCinematic,
}: Props) {
	const oledMode = useSettingsStore((state) => state.oledMode);
	const [circuit, setCircuit] = useState<CircuitDetails>(DEFAULT_CIRCUIT);
	const [imageUrl, setImageUrl] = useState<string>("/circuits/default.webp");
	const [loaded, setLoaded] = useState(true);

	useEffect(() => {
		// 1. Intentar resolver mediante props
		const details = getCircuitDetails(gpName, country, circuitId);
		if (details.key !== "default") {
			setCircuit(details);
			setImageUrl(details.imageUrl);
			return;
		}

		// 2. Si no hay props específicas, consultar la próxima o última carrera de la API
		let isMounted = true;
		async function autoResolveCircuit() {
			try {
				const resNext = await fetch("https://api.jolpi.ca/ergast/f1/current/next.json");
				const dataNext = await resNext.json();
				if (isMounted && dataNext?.MRData?.RaceTable?.Races?.length > 0) {
					const race = dataNext.MRData.RaceTable.Races[0];
					const d = getCircuitDetails(
						race.raceName,
						race.Circuit?.Location?.country,
						race.Circuit?.circuitId
					);
					setCircuit(d);
					setImageUrl(d.imageUrl);
					return;
				}
			} catch {}

			try {
				const resLast = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json");
				const dataLast = await resLast.json();
				if (isMounted && dataLast?.MRData?.RaceTable?.Races?.length > 0) {
					const race = dataLast.MRData.RaceTable.Races[0];
					const d = getCircuitDetails(
						race.raceName,
						race.Circuit?.Location?.country,
						race.Circuit?.circuitId
					);
					setCircuit(d);
					setImageUrl(d.imageUrl);
					return;
				}
			} catch {}
		}

		autoResolveCircuit();

		return () => {
			isMounted = false;
		};
	}, [gpName, country, circuitId]);

	if (oledMode) {
		return null;
	}

	return (
		<div
			onClick={() => {
				if (onToggleCinematic) {
					onToggleCinematic();
				}
			}}
			className={`fixed inset-0 select-none transition-all duration-700 overflow-hidden ${
				isCinematic
					? "z-40 pointer-events-auto cursor-pointer bg-black/40 backdrop-blur-[2px]"
					: "z-0 pointer-events-auto cursor-pointer"
			}`}
			title={isCinematic ? "Toca para volver a los resultados" : "Toca el fondo para ver el circuito"}
		>
			{/* Imagen Aérea Cinematográfica del Circuito con alta fidelidad y brillo */}
			<img
				key={imageUrl}
				src={imageUrl}
				alt={circuit.name}
				onLoad={() => setLoaded(true)}
				onError={() => {
					setImageUrl("/circuits/default.webp");
					setLoaded(true);
				}}
				className={`w-full h-full object-cover object-center filter contrast-[1.08] transition-all duration-700 ${
					isCinematic
						? "opacity-90 scale-100 brightness-[1.05]"
						: loaded
						? "opacity-65 scale-100 brightness-[1.0]"
						: "opacity-50 scale-100 brightness-[0.9]"
				}`}
			/>

			{/* Viñeta suave de iluminación */}
			<div
				className={`absolute inset-0 transition-opacity duration-700 ${
					isCinematic
						? "bg-gradient-to-t from-black/90 via-black/40 to-black/30"
						: "bg-gradient-to-t from-black/80 via-black/35 to-black/15"
				}`}
			/>
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

			{/* 🎮 LEYENDA Y ESPECIFICACIONES TÉCNICAS ESTILO VIDEOJUEGO (MODO CINEMÁTICO) */}
			{isCinematic && (
				<div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 pointer-events-none animate-in fade-in zoom-in-95 duration-500">
					{/* Encabezado Superior con Identidad del Circuito */}
					<div className="flex flex-col gap-2 max-w-3xl">
						<div className="flex items-center gap-2.5 flex-wrap">
							<div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-zinc-950/80 px-3 py-1 shadow-lg backdrop-blur-md">
								<Flag countryCode={circuit.countryCode} className="h-4 w-6 rounded object-cover" />
								<span className="font-mono text-[11px] font-black uppercase tracking-widest text-amber-400">
									CIRCUITO OFICIAL FIA
								</span>
							</div>

							<span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
								TEMPORADA F1
							</span>
						</div>

						<h1 className="mt-2 text-3xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight uppercase text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] leading-none">
							{circuit.name}
						</h1>

						<p className="font-mono text-sm sm:text-base font-bold text-zinc-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-2">
							<span className="text-amber-400 font-black">{circuit.gpName}</span>
							<span>·</span>
							<span className="text-zinc-400">{circuit.country}</span>
						</p>
					</div>

					{/* Tarjetas de Telemetría y Métricas Técnicas */}
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl my-auto pt-6">
						{/* LONGITUD */}
						<div className="flex flex-col p-3.5 rounded-2xl bg-zinc-950/85 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
							<div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
								<Gauge className="w-3.5 h-3.5 text-amber-400" />
								<span>Longitud</span>
							</div>
							<span className="text-lg sm:text-xl font-black font-mono text-white tracking-tight">
								{circuit.length}
							</span>
						</div>

						{/* CURVAS */}
						<div className="flex flex-col p-3.5 rounded-2xl bg-zinc-950/85 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
							<div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
								<MapPin className="w-3.5 h-3.5 text-red-400" />
								<span>Curvas</span>
							</div>
							<span className="text-lg sm:text-xl font-black font-mono text-white tracking-tight">
								{circuit.turns} Curvas
							</span>
						</div>

						{/* ZONAS DRS */}
						<div className="flex flex-col p-3.5 rounded-2xl bg-zinc-950/85 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
							<div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
								<Zap className="w-3.5 h-3.5 text-emerald-400" />
								<span>Zonas DRS</span>
							</div>
							<span className="text-lg sm:text-xl font-black font-mono text-emerald-400 tracking-tight">
								{circuit.drsZones} Zonas
							</span>
						</div>

						{/* RÉCORD DE VUELTA */}
						<div className="flex flex-col p-3.5 rounded-2xl bg-zinc-950/85 border border-zinc-800/90 shadow-2xl backdrop-blur-xl col-span-2 sm:col-span-1 lg:col-span-1">
							<div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
								<Timer className="w-3.5 h-3.5 text-purple-400" />
								<span>Récord de Vuelta</span>
							</div>
							<span className="text-xs sm:text-sm font-black font-mono text-purple-300 tracking-tight leading-tight">
								{circuit.lapRecord}
							</span>
						</div>

						{/* PRIMER GP */}
						<div className="flex flex-col p-3.5 rounded-2xl bg-zinc-950/85 border border-zinc-800/90 shadow-2xl backdrop-blur-xl col-span-2 sm:col-span-2 lg:col-span-1">
							<div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
								<FlagIcon className="w-3.5 h-3.5 text-cyan-400" />
								<span>Debut F1</span>
							</div>
							<span className="text-lg sm:text-xl font-black font-mono text-white tracking-tight">
								Año {circuit.firstGp}
							</span>
						</div>
					</div>

					{/* Indicador Flotante Inferior de Retorno */}
					<div className="flex justify-center w-full pb-2">
						<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-zinc-950/90 px-4 py-2 font-mono text-xs font-bold text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3)] backdrop-blur-xl animate-pulse">
							<RotateCcw className="w-4 h-4 text-amber-400" />
							<span>Toca en cualquier parte para volver a los resultados</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
