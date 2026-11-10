"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Map from "@/components/dashboard/Map";
import { useDataStore } from "@/stores/useDataStore";

const WeatherMap = dynamic(
	() => import("@/app/dashboard/weather/map").then((mod) => mod.WeatherMap),
	{
		ssr: false,
		loading: () => (
			<div className="w-full h-full flex items-center justify-center bg-black text-zinc-500 font-mono text-xs">
				<span className="w-2 h-2 rounded-full bg-[#00A19B] animate-ping mr-2" />
				Cargando radar satelital...
			</div>
		),
	}
);

export default function WeatherPage() {
	// 📡 Feed oficial en vivo
	const weatherData = useDataStore((state) => state?.state?.WeatherData);
	const trackStatus = useDataStore((state) => state?.state?.TrackStatus);
	const mensajesControl = useDataStore((state) => state?.state?.RaceControlMessages?.Messages) ?? [];
	const sessionInfo = useDataStore((state) => state?.state?.SessionInfo);
	const infoSesionMilitar = sessionInfo as any;

	// 🌦️ Telemetría meteorológica de alta precisión (Open-Meteo) para Las Vegas
	const [backupWeather, setBackupWeather] = useState<{
		airTemp: string;
		trackTemp: string;
		humidity: string;
		pressure: string;
		windSpeed: string;
		windDir: string;
		rainfall: boolean;
	}>({
		airTemp: "21.4",
		trackTemp: "25.2",
		humidity: "28",
		pressure: "945.0",
		windSpeed: "9.5",
		windDir: "70",
		rainfall: false,
	});

	useEffect(() => {
		let isMounted = true;
		async function fetchLasVegasWeather() {
			try {
				const res = await fetch(
					"https://api.open-meteo.com/v1/forecast?latitude=36.1147&longitude=-115.173&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation&timezone=auto"
				);
				if (res.ok) {
					const data = await res.json();
					const c = data?.current;
					if (c && isMounted) {
						const aTemp = Number(c.temperature_2m || 21).toFixed(1);
						const tTemp = (Number(c.temperature_2m || 21) + 4.2).toFixed(1);
						setBackupWeather({
							airTemp: aTemp,
							trackTemp: tTemp,
							humidity: String(Math.round(c.relative_humidity_2m ?? 28)),
							pressure: String(Math.round(c.surface_pressure ?? 945)),
							windSpeed: String(Math.round(c.wind_speed_10m ?? 9.5)),
							windDir: String(Math.round(c.wind_direction_10m ?? 70)),
							rainfall: Boolean(c.precipitation && c.precipitation > 0),
						});
					}
				}
			} catch (e) {
				console.warn("[WeatherPage] Error cargando clima de respaldo:", e);
			}
		}
		fetchLasVegasWeather();
		return () => {
			isMounted = false;
		};
	}, []);

	const isLiveTelemetryPresent = Boolean(
		weatherData?.AirTemp && weatherData.AirTemp !== "0.0" && weatherData.AirTemp !== "0"
	);

	const isLiveSessionRunning = Boolean(
		infoSesionMilitar?.SessionStatus &&
		infoSesionMilitar.SessionStatus !== "Finalised" &&
		infoSesionMilitar.SessionStatus !== "Complete" &&
		infoSesionMilitar?.Name
	);

	const gpNombre = infoSesionMilitar?.Meeting?.OfficialName
		? infoSesionMilitar.Meeting.OfficialName.toUpperCase()
		: "FORMULA 1 HEINEKEN SILVER LAS VEGAS GRAND PRIX 2026";

	const sesionNombre = isLiveSessionRunning
		? (infoSesionMilitar.Name === "Race" ? "CARRERA" : infoSesionMilitar.Name.toUpperCase())
		: "ENTRE SESIONES · PISTA EN PAUSA";

	const circuitoNombre = infoSesionMilitar?.Meeting?.Circuit?.ShortName
		? infoSesionMilitar.Meeting.Circuit.ShortName.toUpperCase()
		: "LAS VEGAS STRIP CIRCUIT";

	const paisGP = infoSesionMilitar?.Meeting?.Country?.Name
		? infoSesionMilitar.Meeting.Country.Name.toUpperCase()
		: "ESTADOS UNIDOS";

	// 🌡️ Variables climáticas activas
	const tempAire = isLiveTelemetryPresent ? weatherData!.AirTemp : backupWeather.airTemp;
	const tempPista = isLiveTelemetryPresent ? weatherData!.TrackTemp : backupWeather.trackTemp;
	const humedad = isLiveTelemetryPresent ? weatherData!.Humidity : backupWeather.humidity;
	const presion = isLiveTelemetryPresent ? weatherData!.Pressure : backupWeather.pressure;
	const velViento = isLiveTelemetryPresent ? weatherData!.WindSpeed : backupWeather.windSpeed;
	const dirVientoGrados = isLiveTelemetryPresent ? (weatherData!.WindDirection ?? "0") : backupWeather.windDir;
	const tieneLluvia = isLiveTelemetryPresent ? weatherData!.Rainfall === "1" : backupWeather.rainfall;

	// 🧭 Conversión de grados a coordenadas cardinales
	const obtenerPuntoCardinal = (grados: string | number) => {
		const g = Number(grados);
		if (isNaN(g)) return "NORESTE (NE) ↗";
		const direcciones = [
			"NORTE (N) ↑", 
			"NORESTE (NE) ↗", 
			"ESTE (E) →", 
			"SURESTE (SE) ↘", 
			"SUR (S) ↓", 
			"SUROESTE (SO) ↙", 
			"OESTE (O) ←", 
			"NOROESTE (NO) ↖"
		];
		const indice = Math.round(((g % 360) / 45)) % 8;
		return direcciones[indice];
	};

	const vientoCardinal = obtenerPuntoCardinal(dirVientoGrados);
	const estadoPistaMensaje = isLiveSessionRunning
		? (trackStatus?.Message ? trackStatus.Message.toUpperCase() : "PISTA HABILITADA")
		: "ENTRE SESIONES · PISTA EN PAUSA";

	const ultimosMensajes = [...mensajesControl].reverse().slice(0, 5);

	return (
		<div className="relative h-full w-full bg-[#030305] text-zinc-200 font-mono text-sm overflow-y-auto md:overflow-hidden p-3 flex flex-col md:grid md:grid-cols-12 md:grid-rows-6 gap-3.5 sm:gap-4">
			
			{/* 🛰️ MONITOR ALFA: RADAR SATELITAL DE PRECIPITACIÓN */}
			<div className="md:col-span-5 md:row-span-4 relative border border-zinc-900 rounded-xl overflow-hidden bg-black shadow-2xl min-h-[300px] md:min-h-0">
				<WeatherMap />
				<div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-black/90 border border-[#00A19B]/30 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-xs text-[#00A19B] tracking-wider sm:tracking-widest font-bold max-w-[calc(100%-20px)] truncate shadow-lg backdrop-blur-md">
					<span className="sm:hidden">🛰️ RADAR DOPPLER · NUBOSIDAD</span>
					<span className="hidden sm:inline">🛰️ RADAR_SATELITAL_DOPPLER // CAPA_NUBOSA</span>
				</div>
			</div>

			{/* 🏎️ MONITOR BRAVO: MAPA DE TELEMETRÍA Y TRAZADA EXACTA EN VIVO */}
			<div className="md:col-span-3 md:row-span-4 relative border border-[#00A19B]/30 rounded-xl overflow-hidden bg-[#050608] flex items-center justify-center pt-12 pb-4 px-4 sm:p-6 shadow-2xl min-h-[260px] md:min-h-0">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0e12_1px,transparent_1px),linear-gradient(to_bottom,#0c0e12_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-60" />
				
				<div className="w-full h-full relative z-10 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(0,161,155,0.25)]">
					<Map circuitKey={152} />
				</div>

				<div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-black/85 border border-zinc-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-xs text-zinc-300 tracking-wider sm:tracking-widest font-bold max-w-[calc(100%-20px)] truncate shadow-lg backdrop-blur-md">
					<span className="sm:hidden">🏎️ TRAZADA REAL · {circuitoNombre} (17 CURVAS)</span>
					<span className="hidden sm:inline">🏎️ TRAZADA_DIGITAL_REAL // {circuitoNombre} (17 CURVAS)</span>
				</div>
			</div>

			{/* 🌡️ MONITOR CHARLIE: PANEL DE ESTADO ATMOSFÉRICO DE BOXES */}
			<div className="md:col-span-4 md:row-span-4 bg-[#07080a] border border-zinc-900 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-2xl overflow-y-auto no-scrollbar">
				<div className="space-y-3 sm:space-y-4">
					<div className="border-b border-zinc-900 pb-2.5 flex flex-wrap items-center justify-between gap-2">
						<span className="text-[#00A19B] font-bold tracking-wider text-xs shrink-0">// CONTROL_METEOROLOGICO</span>
						<span className="text-[10px] sm:text-[11px] text-zinc-400 font-bold px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 shrink-0">
							{isLiveSessionRunning ? "● EN VIVO" : "● PISTA EN PAUSA"}
						</span>
					</div>

					{/* Bloque de Ubicación y Evento Real */}
					<div className="bg-black/60 border border-zinc-900 p-3 rounded-lg border-l-4 border-l-[#00A19B] flex flex-col gap-1.5">
						<div className="flex items-center justify-between gap-2">
							<p className="text-[10px] text-zinc-500 tracking-wider uppercase font-bold">EVENTO OFICIAL FIA</p>
							<span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A19B]/10 text-[#00A19B] border border-[#00A19B]/20 shrink-0">
								{sesionNombre}
							</span>
						</div>
						<h3 className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug break-words">
							{gpNombre}
						</h3>
						<div className="text-[11px] text-zinc-400 font-sans font-medium flex items-center gap-1.5 pt-0.5">
							<span className="text-zinc-300 font-semibold">{circuitoNombre}</span>
							<span className="text-zinc-600">·</span>
							<span className="text-zinc-400">{paisGP}</span>
						</div>
					</div>
					
					{/* Matriz Completa de Variables */}
					<div className="space-y-2 sm:space-y-2.5">
						<div className="grid grid-cols-2 gap-2">
							<div className="bg-black/40 border border-zinc-900 p-2 sm:p-2.5 rounded-lg">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Temp. Aire</p>
								<p className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono mt-0.5">{tempAire}<span className="text-xs text-zinc-500">°C</span></p>
							</div>
							<div className="bg-black/40 border border-zinc-900 p-2 sm:p-2.5 rounded-lg border-b-2 border-b-amber-500">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Temp. Pista</p>
								<p className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-0.5">{tempPista}<span className="text-xs text-amber-500/60">°C</span></p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<div className="bg-black/40 border border-zinc-900 p-2 sm:p-2.5 rounded-lg">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Humedad</p>
								<p className="text-lg sm:text-xl font-bold text-zinc-200 mt-0.5">{humedad}<span className="text-xs text-zinc-400">%</span></p>
							</div>
							<div className="bg-black/40 border border-zinc-900 p-2 sm:p-2.5 rounded-lg">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Presión Atm.</p>
								<p className="text-lg sm:text-xl font-bold text-zinc-200 mt-0.5">{presion}<span className="text-[10px] text-zinc-500"> hPa</span></p>
							</div>
						</div>

						<div className="bg-black/40 border border-zinc-900 p-2.5 sm:p-3 rounded-lg flex items-center justify-between">
							<div>
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Vel. Viento</p>
								<p className="text-xl sm:text-2xl font-bold text-zinc-100 mt-0.5">{velViento}<span className="text-xs text-zinc-500"> km/h</span></p>
							</div>
							<div className="text-right">
								<p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">Dirección</p>
								<p className="text-[11px] font-bold text-[#00A19B] mt-1 tracking-tight">{vientoCardinal}</p>
								<p className="text-[10px] text-zinc-500 font-sans font-semibold">Azimut: {dirVientoGrados}°</p>
							</div>
						</div>

						{/* Estado de Precipitación */}
						<div className={`p-2 sm:p-2.5 rounded-lg border text-center font-bold text-xs ${tieneLluvia ? "bg-blue-950/40 border-blue-800 text-blue-400 animate-pulse" : "bg-black/40 border-zinc-900 text-zinc-400"}`}>
							{tieneLluvia ? "⚠️ ADVERTENCIA: DETECCIÓN DE AGUA ACTIVA" : "✓ MONITOREO AMBIENTAL: PISTA SECA"}
						</div>
					</div>
				</div>

				<div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-emerald-400 border border-zinc-900 py-2 sm:py-2.5 rounded-lg bg-black/40 shadow-inner text-center mt-3 px-2 break-words">
					● {estadoPistaMensaje}
				</div>
			</div>

			{/* 🖥️ MONITOR DEL PITWALL: INFORME DE DIRECCIÓN DE CARRERA */}
			<div className="md:col-span-12 md:row-span-2 bg-[#07080a] border border-zinc-900 rounded-xl p-4 flex flex-col justify-between shadow-2xl">
				<div className="text-xs text-[#00A19B] font-bold tracking-wider border-b border-zinc-900 pb-2 mb-2 flex justify-between items-center">
					<span>// REGISTRO_DE_INCIDENTES_FIA // RACE_CONTROL_FEED</span>
					<span className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold">Actualización Automática</span>
				</div>
				
				<div className="flex-1 flex flex-col justify-center space-y-2 overflow-hidden">
					{ultimosMensajes.length > 0 ? (
						ultimosMensajes.map((msg, idx) => {
							const msgAny = msg as any;
							const marcaTiempo = msgAny.Time || msgAny.Utc || "00:00:00";
							
							return (
								<div key={idx} className="flex items-center gap-4 text-xs font-mono bg-black/50 border border-zinc-900/80 px-3 py-2 rounded-lg transition duration-200 hover:border-zinc-800">
									<span className="text-amber-500 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shadow-inner">[{marcaTiempo}]</span>
									<span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px]">Categoría: {msgAny.Category ?? "GENERAL"}</span>
									<span className="text-zinc-200 flex-1 font-sans font-semibold tracking-wide border-l border-zinc-800 pl-4">{msgAny.Message ?? ""}</span>
								</div>
							);
						})
					) : (
						<div className="text-center text-zinc-500 text-xs py-4 uppercase tracking-widest font-mono">
							Monitoreo meteorológico oficial FIA activo para el Gran Premio de Las Vegas. Sin incidentes en pista.
						</div>
					)}
				</div>
			</div>

		</div>
	);
}
