import { Suspense } from "react";

import NextRound from "@/components/schedule/NextRound";
import Schedule from "@/components/schedule/Schedule";

export default async function SchedulePage() {
	return (
		// Usamos w-full para que recupere el tamaño grande original, y un mx-auto estándar para centrar
		<div className="pt-4 w-full mx-auto px-4 sm:px-6">
			
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