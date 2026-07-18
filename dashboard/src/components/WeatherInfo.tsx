"use client";

import TemperatureComplication from "./complications/Temperature";
import HumidityComplication from "./complications/Humidity";
import WindSpeedComplication from "./complications/WindSpeed";
import RainComplication from "./complications/Rain";

import { useDataStore } from "@/stores/useDataStore";

export default function DataWeatherInfo() {
	const weather = useDataStore((state) => state.state?.WeatherData);
	const session = useDataStore((state) => state.state?.SessionInfo);
	const lapCount = useDataStore((state) => state.state?.LapCount);
	// 📡 Telemetría oficial del estado de la sesión
	const sessionStatus = useDataStore((state) => state.state?.SessionStatus?.Status);

	// 🔒 Lógica de Parque Cerrado automática sincronizada con el dashboard
	const isParcFerme = !session || 
		sessionStatus === "Ends" || 
		sessionStatus === "Finalised" || 
		(!!lapCount && lapCount.CurrentLap >= lapCount.TotalLaps); 

	// Si estamos en Parque Cerrado, limpiamos el medio de la barra para que no joda
	if (isParcFerme) {
		return null;
	}

	return (
		<div className="flex justify-between gap-4">
			{weather ? (
				<>
					<TemperatureComplication value={Math.round(parseFloat(weather.TrackTemp))} label="TRC" />
					<TemperatureComplication value={Math.round(parseFloat(weather.AirTemp))} label="AIR" />
					<HumidityComplication value={parseFloat(weather.Humidity)} />
					<RainComplication rain={weather.Rainfall === "1"} />
					<WindSpeedComplication speed={parseFloat(weather.WindSpeed)} directionDeg={parseInt(weather.WindDirection)} />
				</>
			) : (
				<>
					<Loading />
					<Loading />
					<Loading />
					<Loading />
					<Loading />
				</>
			)}
		</div>
	);
}

function Loading() {
	return <div className="h-[55px] w-[55px] animate-pulse rounded-full bg-zinc-800" />;
}