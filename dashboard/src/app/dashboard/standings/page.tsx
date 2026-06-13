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

// Diccionario de banderas de los pilotos
const driverNationalityMap: { [key: string]: string } = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "us",
	LAW: "nz", ANT: "it"
};

// Mapeo de colores oficiales por sigla de piloto
const driverTeamColorMap: { [key: string]: { bg: string; text: string } } = {
	ANT: { bg: "#27f4d2", text: "#000000" }, // Mercedes
	HAM: { bg: "#e8002d", text: "#ffffff" }, // Ferrari
	RUS: { bg: "#27f4d2", text: "#000000" }, // Mercedes
	LEC: { bg: "#e8002d", text: "#ffffff" }, // Ferrari
	PIA: { bg: "#ff8000", text: "#000000" }, // McLaren
	NOR: { bg: "#ff8000", text: "#000000" }, // McLaren
	VER: { bg: "#3671c6", text: "#ffffff" }, // Red Bull
	GAS: { bg: "#ff87bc", text: "#000000" }, // Alpine
	HAD: { bg: "#3671c6", text: "#ffffff" }, // Red Bull (Junior/Reserva)
	LAW: { bg: "#6692ff", text: "#ffffff" }, // RB F1 Team
	BEA: { bg: "#e8002d", text: "#ffffff" }, // Haas / Ferrari
	COL: { bg: "#37bedd", text: "#000000" }, // Williams 🇦🇷
	LIN: { bg: "#3671c6", text: "#ffffff" }, // Red Bull / Compitiendo
	SAI: { bg: "#b6babd", text: "#000000" }, // Williams / Ajustado
	ALB: { bg: "#37bedd", text: "#000000" }, // Williams
	OCO: { bg: "#2293d1", text: "#ffffff" }, // Haas / Aston
	BOR: { bg: "#6692ff", text: "#ffffff" }, // RB / Sauber
	ALO: { bg: "#229971", text: "#ffffff" }, // Aston Martin
	HUL: { bg: "#b6babd", text: "#000000" }, // Kick Sauber / Audi
	PER: { bg: "#3671c6", text: "#ffffff" }, // Red Bull
	TSU: { bg: "#6692ff", text: "#ffffff" }, // RB F1 Team
	MAG: { bg: "#b6babd", text: "#000000" }, // Haas
	STR: { bg: "#229971", text: "#ffffff" }, // Aston Martin
	BOT: { bg: "#7a0016", text: "#ffffff" }, // Audi / Sauber
};

// Mapeo de escuderías a sus colores
const constructorColorMap: { [key: string]: { bg: string; text: string } } = {
	mercedes: { bg: "#27f4d2", text: "#000000" },
	ferrari: { bg: "#e8002d", text: "#ffffff" },
	mclaren: { bg: "#ff8000", text: "#000000" },
	red_bull: { bg: "#3671c6", text: "#ffffff" },
	alpine: { bg: "#ff87bc", text: "#000000" },
	rb: { bg: "#6692ff", text: "#ffffff" },
	haas: { bg: "#b6babd", text: "#000000" },
	williams: { bg: "#37bedd", text: "#000000" },
	aston_martin: { bg: "#229971", text: "#ffffff" },
	audi: { bg: "#7a0016", text: "#ffffff" },
	cadillac: { bg: "#e5e7eb", text: "#000000" },
};

// Función para obtener los logos vectoriales
const getTeamLogoUrl = (constructorId: string) => {
	const cleanId = constructorId.toLowerCase();
	
	if (cleanId.includes("red_bull") || cleanId.includes("red-bull")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/red-bull-racing.png";
	if (cleanId.includes("alpine")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/alpine.png";
	if (cleanId === "rb" || cleanId.includes("racing") || cleanId.includes("bulls")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/rb.png";
	if (cleanId.includes("haas")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/haas.png";
	if (cleanId.includes("aston")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/aston-martin.png";
	if (cleanId.includes("williams")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/williams.png";
	if (cleanId.includes("ferrari")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/ferrari.png";
	if (cleanId.includes("mclaren")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/mclaren.png";
	if (cleanId.includes("mercedes")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/mercedes.png";
	if (cleanId.includes("audi") || cleanId.includes("sauber")) return "https://media.formula1.com/content/dam/fom-website/teams/2026/sauber.png";
	
	return `/team-logos/${cleanId.replace("_", "-")}.svg`;
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

					{/* CASO A: Datos en vivo en carrera */}
					{driverStandingsLive && driversLive &&
						Object.values(driverStandingsLive)
							.sort((a, b) => a.PredictedPosition - b.PredictedPosition)
							.map((driver) => {
								const driverDetails = driversLive[driver.RacingNumber];
								if (!driverDetails) return null;
								const countryCode = driverNationalityMap[driverDetails.Tla];
								const badgeColor = driverTeamColorMap[driverDetails.Tla] || { bg: "#27272a", text: "#ffffff" };

								return (
									<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem" }} key={driver.RacingNumber}>
										<NumberDiff old={driver.CurrentPosition} current={driver.PredictedPosition} />
										<p className="font-semibold">{driver.PredictedPosition}</p>
										<div className="flex items-center gap-2">
											<span className="text-xs font-bold px-1.5 py-0.5 rounded text-center w-10" style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}>
												{driverDetails.Tla}
											</span>
											{countryCode && (
												<img src={`https://flagcdn.com/w20/${countryCode}.png`} alt="Bandera" className="w-5 h-auto rounded-sm" />
											)}
											<p>{driverDetails.FirstName} {driverDetails.LastName}</p>
										</div>
										<p className="font-medium text-zinc-300">{driver.PredictedPoints} pts</p>
										<NumberDiff old={driver.PredictedPoints} current={driver.CurrentPoints} />
									</div>
								);
							})}

					{/* CASO B: Datos de respaldo en Qualy / Libres */}
					{!driverStandingsLive && extDrivers &&
						extDrivers.map((driver) => {
							const driverCode = driver.Driver.code || "F1";
							const countryCode = driverNationalityMap[driverCode];
							const badgeColor = driverTeamColorMap[driverCode] || constructorColorMap[driver.Constructor.constructorId] || { bg: "#27272a", text: "#ffffff" };

							return (
								<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem auto 4rem 4rem" }} key={driver.Driver.code || driver.Driver.familyName}>
									<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
									<p className="font-semibold">{driver.position}</p>
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold px-1.5 py-0.5 rounded text-center w-10" style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}>
											{driverCode}
										</span>
										{countryCode && (
											<img src={`https://flagcdn.com/w20/${countryCode}.png`} alt="Bandera" className="w-5 h-3 rounded-sm" />
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
									{/* PARCHE PROLIJO AQUÍ: Quitamos la propiedad inexistente position */}
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
										src={getTeamLogoUrl(team.Constructor.constructorId)}
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