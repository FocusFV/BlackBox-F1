"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import NumberDiff from "@/components/NumberDiff";
import Image from "next/image";

// Tipados rápidos para la API externa de respaldo
type ExternalDriver = {
	position: string;
	points: string;
	Driver: { firstName: string; lastName: string; code: string };
	Constructor: { name: string; constructorId: string };
};

type ExternalTeam = {
	position: string;
	points: string;
	Constructor: { name: string; constructorId: string };
};

export default function Standings() {
	// 1. Intentamos agarrar los datos en vivo de tu servidor en Render
	const driverStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Drivers);
	const teamStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Teams);
	const driversLive = useDataStore((state) => state.state?.DriverList);

	// 2. Estados para guardar el Plan B (API externa) si el de arriba viene vacío
	const [extDrivers, setExtDrivers] = useState<ExternalDriver[] | null>(null);
	const [extTeams, setExtTeams] = useState<ExternalTeam[] | null>(null);
	const [loadingBackup, setLoadingBackup] = useState(false);

	// 3. Si no hay datos en vivo (porque es qualy o prácticas), vamos a buscar el campeonato real a internet
	useEffect(() => {
		if (!driverStandingsLive || !teamStandingsLive) {
			const fetchBackupStandings = async () => {
				setLoadingBackup(true);
				try {
					// Consultamos la API global actual de la temporada 2026
					const resDrivers = await fetch("https://api.jolpi.ca/ergast/f1/2026/driverStandings.json");
					const dataDrivers = await resDrivers.json();
					const dList = dataDrivers?.MRData?.StandingsTable?.StandingsLists[0]?.DriverStandings;
					if (dList) setExtDrivers(dList);

					const resTeams = await fetch("https://api.jolpi.ca/ergast/f1/2026/constructorStandings.json");
					const dataTeams = await resTeams.json();
					const tList = dataTeams?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings;
					if (tList) setExtTeams(tList);
				} catch (err) {
					console.error("Error al traer el campeonato de respaldo:", err);
				} finally {
					setLoadingBackup(false);
				}
			};

			fetchBackupStandings();
		}
	}, [driverStandingsLive, teamStandingsLive]);

	// Condición para mostrar el esqueleto de carga
	const showDriversSkeleton = !driverStandingsLive && loadingBackup && !extDrivers;
	const showTeamsSkeleton = !teamStandingsLive && loadingBackup && !extTeams;

	return (
		<div className="grid h-full grid-cols-1 divide-y divide-zinc-800 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
			{/* CAMPEONATO DE PILOTOS */}
			<div className="h-full p-4">
				<h2 className="text-xl mb-4 font-medium">Campeonato de Pilotos</h2>
				<div className="flex flex-col divide-y divide-zinc-800">
					{showDriversSkeleton &&
						new Array(20).fill("").map((_, index) => <SkeletonItem key={`driver.loading.${index}`} />)}

					{/* CASO A: Renderizamos los datos predictivos EN VIVO (Solo en Carrera) */}
					{driverStandingsLive && driversLive &&
						Object.values(driverStandingsLive)
							.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
							.map((driver) => {
								const driverDetails = driversLive[driver.RacingNumber];
								if (!driverDetails) return null;
								return (
									<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem" }} key={driver.RacingNumber}>
										<NumberDiff old={driver.CurrentPosition} current={driver.PredictedPosition} />
										<p className="font-semibold">{driver.PredictedPosition}</p>
										<p>{driverDetails.FirstName} {driverDetails.LastName}</p>
										<p className="font-medium text-zinc-300">{driver.PredictedPoints} pts</p>
										<NumberDiff old={driver.PredictedPoints} current={driver.CurrentPoints} />
									</div>
								);
							})}

					{/* CASO B: Renderizamos el campeonato RESPALDO REAL (Fuera de carrera / Qualy) */}
					{!driverStandingsLive && extDrivers &&
						extDrivers.map((driver) => (
							<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem" }} key={driver.Driver.code}>
								<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
								<p className="font-semibold">{driver.position}</p>
								<p>{driver.Driver.firstName} {driver.Driver.lastName}</p>
								<p className="font-medium text-zinc-300">{driver.points} pts</p>
								<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
							</div>
						))}
				</div>
			</div>

			{/* CAMPEONATO DE CONSTRUCTORES */}
			<div className="h-full p-4">
				<h2 className="text-xl mb-4 font-medium">Campeonato de Constructores</h2>
				<div className="flex flex-col divide-y divide-zinc-800">
					{showTeamsSkeleton &&
						new Array(10).fill("").map((_, index) => <SkeletonItem key={`team.loading.${index}`} />)}

					{/* CASO A: Renderizamos los datos predictivos EN VIVO (Solo en Carrera) */}
					{teamStandingsLive &&
						Object.values(teamStandingsLive)
							.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
							.map((team) => (
								<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem 2rem auto 4rem 4rem" }} key={team.TeamName}>
									<NumberDiff old={team.CurrentPosition} current={team.PredictedPosition} />
									<p className="font-semibold">{team.PredictedPosition}</p>
									<Image
										src={`/team-logos/${team.TeamName.replaceAll(" ", "-").toLowerCase()}.svg`}
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

					{/* CASO B: Renderizamos el campeonato RESPALDO REAL (Fuera de carrera / Qualy) */}
					{!teamStandingsLive && extTeams &&
						extTeams.map((team) => (
							<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem 2rem auto 4rem 4rem" }} key={team.Constructor.constructorId}>
								<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
								<p className="font-semibold">{team.position}</p>
								<div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] text-zinc-500 font-bold">F1</div>
								<p>{team.Constructor.name}</p>
								<p className="font-medium text-zinc-300">{team.points} pts</p>
								<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

const SkeletonItem = () => {
	return (
		<div className="grid gap-2 p-2" style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem 4rem" }}>
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