import { Suspense } from "react";
import Link from "next/link";

import NextRound from "@/components/schedule/NextRound";
import Schedule from "@/components/schedule/Schedule";

import { useDataStore } from "@/stores/useDataStore";

export default async function SchedulePage() {
	// 🏎️ LEEMOS EL ESTADO EN VIVO DE LA PISTA CORREGIDO:
	const trackStatus = useDataStore.getState().state?.TrackStatus?.Status;
	const isLive = trackStatus && parseInt(trackStatus) > 0;
	
	// 🌟 CAMBIO ACÁ: Usamos SessionInfo para traer el nombre oficial del Meeting
	const activeRace = useDataStore.getState().state?.SessionInfo?.Meeting?.Name || "Gran Premio";

	return (
		/* 🟢 CORREGIDO: Eliminamos 'select-none' para devolver el control y el clic normal a toda la interfaz */
		<div className="pt-4 w-full mx-auto px-4 sm:px-6 font-mono text-white">
			
			{/* 🏁 CONDICIÓN DE EMBRAGUE INTERACTIVA: Si hay carrera, anulamos el resto */}
			{isLive ? (
				<div className="my-12 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-emerald-500/30 bg-gradient-to-b from-zinc-950 to-emerald-950/10 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.05)] animate-fade-in">
					
					{/* Encabezado de Crisis en Pista */}
					<div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-black tracking-widest uppercase animate-pulse mb-6">
						<span className="w-2 h-2 rounded-full bg-emerald-400" />
						<span>¡Semáforos en verde! Sesión activa en vivo</span>
					</div>

					<h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-100 max-w-3xl">
						{activeRace} está en marcha
					</h1>
					
					<p className="text-zinc-400 text-sm md:text-base mt-4 max-w-xl font-sans">
						Los contadores de cronograma se suspendieron de forma automática para priorizar los canales de telemetría crítica del pit-wall.
					</p>

					{/* Botón Masivo Industrial para saltar al Dashboard */}
					<div className="my-8">
						<Link 
							href="/dashboard" 
							className="inline-flex items-center gap-3 text-sm md:text-base font-black bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all px-8 py-4 rounded-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.35)] border border-emerald-300/30 group"
						>
							<span>Ingresar al centro de comando</span>
							<span className="text-xl group-hover:translate-x-1 transition-transform">🏎️💨</span>
						</Link>
					</div>

					{/* 🎧 REPRODUCTOR DE AUDIO HUD DE TRANSMISIÓN DE BOXES */}
					<div className="w-full max-w-lg border border-zinc-800 bg-zinc-950/80 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-3 text-left">
						<div className="flex items-center justify-between border-b border-zinc-900 pb-2">
							<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">// REPRODUCIR AUDIO DE BOXES (LIVE)</span>
							<span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-amber-400 font-bold">PU 2026</span>
						</div>
						
						<audio 
							controls 
							className="w-full accent-emerald-500 h-9 rounded-lg"
							src="https://stream.publicbroadcasting.net/production/mp3/kcur/local-kcur-993740.mp3"
						>
							Tu navegador no soporta el elemento de reproducción de audio.
						</audio>
						
						<p className="text-[9px] text-zinc-500 text-center italic">
							Sugerencia: Conectá los auriculares para escuchar las comunicaciones de radio del muro de ingenieros.
						</p>
					</div>

				</div>
			) : (
				/* ⏳ MODO ESTÁNDAR: Si los motores están apagados, se muestra el contador y el calendario tradicional */
				<>
					{/* Sección Próximo Evento */}
					<div className="my-6">
						<h1 className="text-3xl font-extrabold uppercase tracking-wider text-zinc-100 border-l-4 border-amber-500 pl-3">
							Próximo Evento
						</h1>
						<p className="text-zinc-500 text-sm mt-1">Todos los horarios corresponden a tu hora local</p>
					</div>

					<Suspense fallback={<NextRoundLoading />}>
						<NextRound />
					</Suspense>

					{/* Sección Calendario */}
					<div className="my-10">
						<h1 className="text-3xl font-extrabold uppercase tracking-wider text-zinc-100 border-l-4 border-amber-500 pl-3">
							Calendario del Campeonato
						</h1>
						<p className="text-zinc-500 text-sm mt-1">Todos los horarios corresponden a tu hora local</p>
					</div>

					<Suspense fallback={<FullScheduleLoading />}>
						<Schedule />
					</Suspense>
				</>
			)}

		</div>
	);
}

const RoundLoading = () => {
	return (
		<div className="flex flex-col gap-1">
			<div className="h-12 w-full animate-pulse rounded-md bg-zinc-900 border border-zinc-800" />

			<div className="grid grid-cols-3 gap-8 pt-1">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={`day.${i}`} className="grid grid-rows-2 gap-2">
						<div className="h-12 w-full animate-pulse rounded-md bg-zinc-900 border border-zinc-800" />
						<div className="h-12 w-full animate-pulse rounded-md bg-zinc-900 border border-zinc-800" />
					</div>
				))}
			</div>
		</div>
	);
};

const NextRoundLoading = () => {
	return (
		<div className="grid h-44 grid-cols-1 gap-8 sm:grid-cols-2">
			<div className="flex flex-col gap-4">
				<div className="h-1/2 w-3/4 animate-pulse rounded-md bg-zinc-900 border border-zinc-800" />
				<div className="h-1/2 w-3/4 animate-pulse rounded-md bg-zinc-900 border border-zinc-800" />
			</div>

			<RoundLoading />
		</div>
	);
};

const FullScheduleLoading = () => {
	return (
		<div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
			{Array.from({ length: 6 }).map((_, i) => (
				<RoundLoading key={`round.${i}`} />
			))}
		</div>
	);
};