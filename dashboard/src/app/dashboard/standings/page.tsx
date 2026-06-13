"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";
import NumberDiff from "@/components/NumberDiff";
import Image from "next/image";

type ExternalDriver = {
	position: string;
	points: string;
	Driver: { givenName: string; familyName: string; code: string };
	Constructor: { name: string; constructorId: string };
};

type ExternalTeam = {
	position: string;
	points: string;
	Constructor: { name: string; constructorId: string };
};

// Diccionario de banderas actualizado
const driverNationalityMap: { [key: string]: string } = {
	COL: "ar", // Franco Colapinto 🇦🇷
	VER: "nl", // Max Verstappen 🇳🇱
	HAM: "gb", // Lewis Hamilton 🇬🇧
	RUS: "gb", // George Russell 🇬🇧
	LEC: "mc", // Charles Leclerc 🇲🇨
	SAI: "es", // Carlos Sainz 🇪🇸
	NOR: "gb", // Lando Norris 🇬🇧
	PIA: "au", // Oscar Piastri 🇦🇺
	ALB: "th", // Alexander Albon 🇹🇭
	GAS: "fr", // Pierre Gasly 🇫🇷
	OCO: "fr", // Esteban Ocon 🇫🇷
	HUL: "de", // Nico Hulkenberg 🇩🇪
	TSU: "jp", // Yuki Tsunoda 🇯🇵
	RIC: "au", // Daniel Ricciardo 🇦🇺
	BOT: "fi", // Valtteri Bottas 🇫🇮
	ZHO: "cn", // Guanyu Zhou 🇨🇳
	MAG: "dk", // Kevin Magnussen 🇩🇰
	STR: "ca", // Lance Stroll 🇨🇦
	ALO: "es", // Fernando Alonso 🇪🇸
	PER: "mx", // Sergio Pérez 🇲🇽
	BEA: "gb", // Oliver Bearman 🇬🇧
	HAD: "fr", // Isack Hadjar 🇫🇷
	BOR: "br", // Gabriel Bortoleto 🇧🇷
	LIN: "us", // Arvid Lindblad 🇺🇸
	LAW: "nz", // Liam Lawson 🇳🇿 ¡Agregado!
	ANT: "it", // Andrea Kimi Antonelli 🇮🇹
};

// Función de mapeo de logos ultra robusta
const getLocalTeamLogoPath = (constructorId: string) => {
	// Reemplazamos guiones bajos por guiones medios para estandarizar
	const cleanId = constructorId.replace("_", "-").toLowerCase();
	
	// Mapeo uno a uno según los nombres estándar de los archivos de F1
	if (cleanId.includes("alpine")) return "/team-logos/alpine-f1-team.svg";
	if (cleanId.includes("red-bull") || cleanId === "red_bull") return "/team-logos/red-bull.svg";
	if (cleanId === "rb" || cleanId.includes("racing-bulls") || cleanId.includes("vcarb")) return "/team-logos/rb-f1-team.svg";
	if (cleanId.includes("haas")) return "/team-logos/haas-f1-team.svg";
	if (cleanId.includes("aston-martin")) return "/team-logos/aston-martin.svg";
	if (cleanId.includes("cadillac")) return "/team-logos/cadillac-f1-team.svg";
	if (cleanId.includes("audi") || cleanId.includes("sauber")) return "/team-logos/audi.svg";
	if (cleanId.includes("williams")) return "/team-logos/williams.svg";
	if (cleanId.includes("ferrari")) return "/team-logos/ferrari.svg";
	if (cleanId.includes("mclaren")) return "/team-logos/mclaren.svg";
	if (cleanId.includes("mercedes")) return "/team-logos/mercedes.svg";

	return `/team-logos/${cleanId}.svg`;
};

export default function Standings() {
	const driverStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Drivers);
	const teamStandingsLive = useDataStore((state) => state.state?.ChampionshipPrediction?.Teams);
	const driversLive = useDataStore((state) => state.state?.DriverList);

	const [extDrivers, setExtDrivers] = useState<ExternalDriver[] | null>(null);
	const [extTeams, setExtTeams] = useState<ExternalTeam[] | null>(null);
	const [loadingBackup, setLoadingBackup] = useState(false);

	useEffect(() => {
		if (!driverStandingsLive || !teamStandingsLive) {
			const fetchBackupStandings = async () => {
				setLoadingBackup(true);
				try {
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

					{/* CASO A: En Carrera (Predicciones) */}
					{driverStandingsLive && driversLive &&
						Object.values(driverStandingsLive)
							.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
							.map((driver) => {
								const driverDetails = driversLive[driver.RacingNumber];
								if (!driverDetails) return null;
								const countryCode = driverNationalityMap[driverDetails.Tla];

								return (
									<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem" }} key={driver.RacingNumber}>
										<NumberDiff old={driver.CurrentPosition} current={driver.PredictedPosition} />
										<p className="font-semibold">{driver.PredictedPosition}</p>
										<div className="flex items-center gap-2">
											{countryCode && (
												<img
													src={`https://flagcdn.com/w20/${countryCode}.png`}
													alt="Bandera"
													className="w-5 h-auto rounded-sm object-cover"
												/>
											)}
											<p>{driverDetails.FirstName} {driverDetails.LastName}</p>
										</div>
										<p className="font-medium text-zinc-300">{driver.PredictedPoints} pts</p>
										<NumberDiff old={driver.PredictedPoints} current={driver.CurrentPoints} />
									</div>
								);
							})}

					{/* CASO B: Respaldo (Qualy / Libres) */}
					{!driverStandingsLive && extDrivers &&
						extDrivers.map((driver) => {
							const driverCode = driver.Driver.code || "F1";
							const countryCode = driverNationalityMap[driverCode];

							return (
								<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem" }} key={driver.Driver.code || driver.Driver.familyName}>
									<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
									<p className="font-semibold">{driver.position}</p>
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-1 rounded w-9 text-center">{driverCode}</span>
										{countryCode && (
											<img
												src={`https://flagcdn.com/w20/${countryCode}.png`}
												alt="Bandera"
												className="w-5 h-3 rounded-sm object-cover"
											/>
										)}
										<p>{driver.Driver.givenName} {driver.Driver.familyName}</p>
									</div>
									<p className="font-medium text-zinc-300">{driver.points} pts</p>
									<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
								</div>
							);
						})}
				</div>
			</div>

			{/* CAMPEONATO DE CONSTRUCTORES */}
			<div className="h-full p-4">
				<h2 className="text-xl mb-4 font-medium">Campeonato de Constructores</h2>
				<div className="flex flex-col divide-y divide-zinc-800">
					{showTeamsSkeleton &&
						new Array(10).fill("").map((_, index) => <SkeletonItem key={`team.loading.${index}`} />)}

					{/* CASO A: En Carrera */}
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

					{/* CASO B: Respaldo */}
					{!teamStandingsLive && extTeams &&
						extTeams.map((team) => (
							<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem 2rem auto 4rem 4rem" }} key={team.Constructor.constructorId}>
								<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
								<p className="font-semibold">{team.position}</p>
								<div className="w-6 h-6 relative flex items-center justify-center">
									<img
										src={getLocalTeamLogoPath(team.Constructor.constructorId)}
										alt={team.Constructor.name}
										className="w-6 h-6 object-contain rounded-sm"
										onError={(e) => {
											(e.currentTarget as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='%2327272a'/></svg>";
										}}
									/>
								</div>
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