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

// 1. Diccionario de banderas de los países
const driverNationalityMap: { [key: string]: string } = {
	COL: "ar", VER: "nl", HAM: "gb", RUS: "gb", LEC: "mc", SAI: "es",
	NOR: "gb", PIA: "au", ALB: "th", GAS: "fr", OCO: "fr", HUL: "de",
	TSU: "jp", RIC: "au", BOT: "fi", ZHO: "cn", MAG: "dk", STR: "ca",
	ALO: "es", PER: "mx", BEA: "gb", HAD: "fr", BOR: "br", LIN: "us",
	LAW: "nz", ANT: "it"
};

// 2. Colores EXACTOS extraídos de tu Captura 2 (F1 2026)
const driverTeamColorMap: { [key: string]: { bg: string; text: string } } = {
	ANT: { bg: "#00d2be", text: "#ffffff" }, // Mercedes (Turquesa/Celeste)
	RUS: { bg: "#00d2be", text: "#ffffff" }, // Mercedes
	HAM: { bg: "#e10600", text: "#ffffff" }, // Ferrari (Rojo)
	LEC: { bg: "#e10600", text: "#ffffff" }, // Ferrari
	NOR: { bg: "#ff8700", text: "#ffffff" }, // McLaren (Papaya/Naranja)
	PIA: { bg: "#ff8700", text: "#ffffff" }, // McLaren
	VER: { bg: "#061d43", text: "#ffffff" }, // Red Bull (Azul oscuro)
	HAD: { bg: "#061d43", text: "#ffffff" }, // Red Bull
	LIN: { bg: "#061d43", text: "#ffffff" }, // Red Bull
	PER: { bg: "#061d43", text: "#ffffff" }, // Red Bull
	LAW: { bg: "#4b77ff", text: "#ffffff" }, // RB F1 Team (Azul brillante)
	TSU: { bg: "#4b77ff", text: "#ffffff" }, // RB F1 Team
	GAS: { bg: "#ff00ff", text: "#ffffff" }, // Alpine (Fucsia/Rosa de tu captura 2)
	OCO: { bg: "#373737", text: "#ffffff" }, // Haas (Gris oscuro/Grafito)
	BEA: { bg: "#373737", text: "#ffffff" }, // Haas
	MAG: { bg: "#373737", text: "#ffffff" }, // Haas
	COL: { bg: "#005aff", text: "#ffffff" }, // Williams (Azul Francia/Eléctrico) 🇦🇷
	ALB: { bg: "#005aff", text: "#ffffff" }, // Williams
	SAI: { bg: "#005aff", text: "#ffffff" }, // Williams
	ALO: { bg: "#006f62", text: "#ffffff" }, // Aston Martin (Verde esmeralda)
	STR: { bg: "#006f62", text: "#ffffff" }, // Aston Martin
	HUL: { bg: "#e10600", text: "#ffffff" }, // Audi (Rojo sólido de tu captura 2)
	BOR: { bg: "#e10600", text: "#ffffff" }, // Audi
	BOT: { bg: "#e10600", text: "#ffffff" }, // Audi
};

// 3. Componente inteligente para evitar que falle cualquier logo local
const TeamLogo = ({ teamName }: { teamName: string }) => {
	const cleanName = teamName.toLowerCase();
	const [fallbackIndex, setFallbackIndex] = useState(0);

	const fallbacks: string[] = [];

	if (cleanName.includes("red bull")) {
		fallbacks.push("/team-logos/red-bull.svg", "/team-logos/red-bull-racing.svg", "/team-logos/redbull.svg");
	} else if (cleanName.includes("alpine")) {
		fallbacks.push("/team-logos/alpine-f1-team.svg", "/team-logos/alpine.svg");
	} else if (cleanName.includes("rb f1") || cleanName === "rb" || cleanName.includes("bulls")) {
		fallbacks.push("/team-logos/rb-f1-team.svg", "/team-logos/rb.svg", "/team-logos/visa-cash-app-rb.svg");
	} else if (cleanName.includes("haas")) {
		fallbacks.push("/team-logos/haas-f1-team.svg", "/team-logos/haas.svg");
	} else if (cleanName.includes("audi") || cleanName.includes("sauber")) {
		fallbacks.push("/team-logos/audi.svg", "/team-logos/kick-sauber.svg", "/team-logos/sauber.svg");
	} else if (cleanName.includes("cadillac")) {
		fallbacks.push("/team-logos/cadillac-f1-team.svg", "/team-logos/cadillac.svg");
	} else if (cleanName.includes("aston")) {
		fallbacks.push("/team-logos/aston-martin.svg");
	} else {
		fallbacks.push(`/team-logos/${cleanName.replaceAll(" ", "-")}.svg`);
	}

	// Icono neutro final por si de verdad borraste el archivo
	fallbacks.push("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8' fill='%233f3f46'/></svg>");

	return (
		<img
			src={fallbacks[fallbackIndex]}
			alt={teamName}
			className="w-6 h-6 object-contain"
			onError={() => {
				if (fallbackIndex < fallbacks.length - 1) {
					setFallbackIndex(fallbackIndex + 1);
				}
			}}
		/>
	);
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

					{/* CASO A: En carrera */}
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

					{/* CASO B: Qualy / Libres */}
					{!driverStandingsLive && extDrivers &&
						extDrivers.map((driver) => {
							const driverCode = driver.Driver.code || "F1";
							const countryCode = driverNationalityMap[driverCode];
							const badgeColor = driverTeamColorMap[driverCode] || { bg: "#27272a", text: "#ffffff" };

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

					{/* CASO B: Respaldo con Componente Autocorrector de Logos */}
					{!teamStandingsLive && extTeams &&
						extTeams.map((team) => (
							<div className="grid p-2 items-center" style={{ gridTemplateColumns: "2rem 2rem 2rem auto 4rem 4rem" }} key={team.Constructor.constructorId}>
								<div className="w-4 h-4 text-zinc-600 text-xs text-center">-</div>
								<p className="font-semibold">{team.position}</p>
								<div className="w-6 h-6 relative flex items-center justify-center">
									<TeamLogo teamName={team.Constructor.name} />
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