"use client";

import { useDataStore } from "@/stores/useDataStore";

import NumberDiff from "@/components/NumberDiff";
import Image from "next/image";

export default function Standings() {
	const driverStandings = useDataStore((state) => state.state?.ChampionshipPrediction?.Drivers);
	const teamStandings = useDataStore((state) => state.state?.ChampionshipPrediction?.Teams);

	const drivers = useDataStore((state) => state.state?.DriverList);

	// Volamos el bloqueo de "isRace" para que renderice siempre la tabla del campeonato mundial

	return (
		<div className="grid h-full grid-cols-1 divide-y divide-zinc-800 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
			<div className="h-full p-4">
				<h2 className="text-xl mb-4 font-medium">Campeonato de Pilotos</h2>

				<div className="divide flex flex-col divide-y divide-zinc-800">
					{!driverStandings &&
						new Array(20).fill("").map((_, index) => <SkeletonItem key={`driver.loading.${index}`} />)}

					{driverStandings &&
						drivers &&
						Object.values(driverStandings)
							.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
							.map((driver) => {
								const driverDetails = drivers[driver.RacingNumber];

								if (!driverDetails) {
									return null;
								}

								return (
									<div
										className="grid p-2 items-center"
										style={{
											gridTemplateColumns: "2rem 2rem auto 4rem 4rem",
										}}
										key={driver.RacingNumber}
									>
										<NumberDiff old={driver.CurrentPosition} current={driver.PredictedPosition} />
										<p className="font-semibold">{driver.PredictedPosition}</p>

										<p>
											{driverDetails.FirstName} {driverDetails.LastName}
										</p>

										<p className="font-medium text-zinc-300">{driver.PredictedPoints} pts</p>

										<NumberDiff old={driver.PredictedPoints} current={driver.CurrentPoints} />
									</div>
								);
							})}
				</div>
			</div>

			<div className="h-full p-4">
				<h2 className="text-xl mb-4 font-medium">Campeonato de Constructores</h2>

				<div className="divide flex flex-col divide-y divide-zinc-800">
					{!teamStandings && new Array(10).fill("").map((_, index) => <SkeletonItem key={`team.loading.${index}`} />)}

					{teamStandings &&
						Object.values(teamStandings)
							.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
							.map((team) => (
								<div
									className="grid p-2 items-center"
									style={{
										gridTemplateColumns: "2rem 2rem 2rem auto 4rem 4rem",
									}}
									key={team.TeamName}
								>
									<NumberDiff old={team.CurrentPosition} current={team.PredictedPosition} />
									<p className="font-semibold">{team.PredictedPosition}</p>

									<Image
										src={`/team-logos/${team.TeamName.replaceAll(" ", "-").toLowerCase()}.${"svg"}`}
										alt={team.TeamName}
										width={24}
										height={24}
										className="overflow-hidden rounded-lg"
									/>

									<p>{team.TeamName}</p>

									<p className="font-medium text-zinc-300">{team.PredictedPoints} pts</p>

									<NumberDiff old={team.PredictedPoints} current={team.CurrentPoints} />
								</div>
							))}
				</div>
			</div>
		</div>
	);
}

const SkeletonItem = () => {
	return (
		<div
			className="grid gap-2 p-2"
			style={{
				gridTemplateColumns: "2rem 2rem auto 4rem 4rem 4rem",
			}}
		>
			<div className="h-4 w-4 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-4 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-4 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-16 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-8 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-8 animate-pulse rounded-md bg-zinc-800" />
			<div className="h-4 w-4 animate-pulse rounded-md bg-zinc-800" />
		</div>
	);
};