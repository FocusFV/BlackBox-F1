"use client";

import { WeatherMap } from "@/app/dashboard/weather/map";
import Map from "@/components/dashboard/Map"; // Tu mapa real en vivo
import { useDataStore } from "@/stores/useDataStore"; // Tu store oficial

export default function WeatherPage() {
	// 📡 ACCESO DIRECTO AL FEED OFICIAL EN VIVO
	const weatherData = useDataStore((state) => state?.state?.WeatherData);
	const trackStatus = useDataStore((state) => state?.state?.TrackStatus);
	
	// 🛠️ CORREGIDO: El fallback '?? []' ahora se ejecuta AFUERA del selector
	const mensajesControl = useDataStore((state) => state?.state?.RaceControlMessages?.Messages) ?? [];
	const sessionInfo = useDataStore((state) => state?.state?.SessionInfo);

	// 📋 EVITAMOS EL ERROR DE TIPADO DE SESSIONINFO CON UN CASTEO SEGURO
	const infoSesionMilitar = sessionInfo as any;
	
	const gpNombre = infoSesionMilitar?.Meeting?.OfficialName ? infoSesionMilitar.Meeting.OfficialName.toUpperCase() : "GRAN PREMIO DE FÓRMULA 1";
	const sesionNombre = infoSesionMilitar?.Name ? infoSesionMilitar.Name.toUpperCase() : (infoSesionMilitar?.Type ? infoSesionMilitar.Type.toUpperCase() : "SESIÓN ACTIVA");
	const circuitoNombre = infoSesionMilitar?.Meeting?.Circuit?.ShortName ? infoSesionMilitar.Meeting.Circuit.ShortName.toUpperCase() : "TRAZADO DE COMPETICIÓN";
	const paisGP = infoSesionMilitar?.Meeting?.Country?.Name ? infoSesionMilitar.Meeting.Country.Name.toUpperCase() : "SITUACIÓN GEOGRÁFICA";

	// 🌡️ PARSEO DE TELEMETRÍA CLIMÁTICA DE OPENF1
	const tempAire = weatherData?.AirTemp ?? "0.0";
	const tempPista = weatherData?.TrackTemp ?? "0.0";
	const humedad = weatherData?.Humidity ?? "0.0";
	const presion = weatherData?.Pressure ?? "0.0";
	const velViento = weatherData?.WindSpeed ?? "0.0";
	const dirVientoGrados = weatherData?.WindDirection ?? "0";
	const tieneLluvia = weatherData?.Rainfall === "1";

	// 🧭 CÁLCULO REAL: Conversión de grados a coordenadas cardinales
	const obtenerPuntoCardinal = (grados: string | number) => {
		const g = Number(grados);
		if (isNaN(g)) return "NO DISPONIBLE";
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
	const estadoPistaMensaje = trackStatus?.Message ? trackStatus.Message.toUpperCase() : "MONITOREO DE SUPERFICIE ACTIVO";

	// Historial estricto de banderas e incidentes (Últimos 5 mensajes)
	const ultimosMensajes = [...mensajesControl].reverse().slice(0, 5);

	return (
		<div className="relative h-[calc(100%-142px)] w-full md:h-full bg-[#030305] text-zinc-200 font-mono text-sm overflow-hidden p-3 flex flex-col md:grid md:grid-cols-12 md:grid-rows-6 gap-4">
			
			{/* 🛰️ MONITOR ALFA: RADAR SATELITAL DE PRECIPITACIÓN */}
			<div className="md:col-span-5 md:row-span-4 relative border border-zinc-900 rounded-xl overflow-hidden bg-black shadow-2xl">
				<WeatherMap />
				<div className="absolute top-3 left-3 z-10 bg-black/90 border border-[#00A19B]/30 px-3 py-1.5 rounded text-xs text-[#00A19B] tracking-widest font-bold">
					🛰️ RADAR_SATELITAL_DOPPLER // CAPA_NUBOSA
				</div>
			</div>

			{/* 🏎️ MONITOR BRAVO: MAPA DE TELEMETRÍA Y TRAZADA EXACTA EN VIVO */}
			<div className="md:col-span-4 md:row-span-4 relative border border-[#00A19B]/30 rounded-xl overflow-hidden bg-[#050608] flex items-center justify-center p-6 shadow-2xl">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0e12_1px,transparent_1px),linear-gradient(to_bottom,#0c0e12_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-60" />
				
				<div className="w-full h-full relative z-10 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(0,161,155,0.25)]">
					<Map />
				</div>

				<div className="absolute top-3 left-3 z-10 bg-black/80 border border-zinc-800 px-3 py-1.5 rounded text-xs text-zinc-400 tracking-widest font-bold">
					🏎️ TRAZADA_DIGITAL_REAL // {circuitoNombre}
				</div>
			</div>

			{/* 🌡️ MONITOR CHARLIE: PANEL DE ESTADO ATMOSFÉRICO DE BOXES */}
			<div className="md:col-span-3 md:row-span-4 bg-[#07080a] border border-zinc-900 rounded-xl p-4 flex flex-col justify-between shadow-2xl">
				<div className="space-y-4">
					<div className="border-b border-zinc-900 pb-2 flex justify-between items-center">
						<span className="text-[#00A19B] font-bold tracking-wider text-xs">// CONTROL_METEOROLOGICO</span>
						<span className="text-[11px] text-zinc-600 animate-pulse font-bold">● EN VIVO</span>
					</div>

					{/* Bloque de Ubicación y Evento Real */}
					<div className="bg-black/60 border border-zinc-900 p-3 rounded-lg border-l-4 border-l-[#00A19B] space-y-1">
						<p className="text-[11px] text-zinc-500 tracking-wider uppercase font-bold">EVENTO OFICIAL FIA</p>
						<p className="text-sm font-bold text-zinc-100 truncate">{gpNombre}</p>
						<div className="flex justify-between text-[11px] text-zinc-400 pt-1 font-sans font-semibold">
							<span>{circuitoNombre} ({paisGP})</span>
							<span className="text-[#00A19B] font-mono">{sesionNombre}</span>
						</div>
					</div>
					
					{/* Matriz Completa de Variables de OpenF1 */}
					<div className="space-y-2.5">
						<div className="grid grid-cols-2 gap-2">
							<div className="bg-black/40 border border-zinc-900 p-2.5 rounded-lg">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Temp. Aire</p>
								<p className="text-2xl font-bold text-zinc-100 font-mono mt-0.5">{tempAire}<span className="text-xs text-zinc-500">°C</span></p>
							</div>
							<div className="bg-black/40 border border-zinc-900 p-2.5 rounded-lg border-b-2 border-b-amber-500">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Temp. Pista</p>
								<p className="text-2xl font-bold text-amber-400 font-mono mt-0.5">{tempPista}<span className="text-xs text-amber-500/60">°C</span></p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<div className="bg-black/40 border border-zinc-900 p-2.5 rounded-lg">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Humedad</p>
								<p className="text-xl font-bold text-zinc-200 mt-0.5">{humedad}<span className="text-xs text-zinc-400">%</span></p>
							</div>
							<div className="bg-black/40 border border-zinc-900 p-2.5 rounded-lg">
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Presión Atm.</p>
								<p className="text-xl font-bold text-zinc-200 mt-0.5">{presion}<span className="text-[10px] text-zinc-500"> hPa</span></p>
							</div>
						</div>

						<div className="bg-black/40 border border-zinc-900 p-3 rounded-lg flex items-center justify-between">
							<div>
								<p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Vel. Viento</p>
								<p className="text-2xl font-bold text-zinc-100 mt-0.5">{velViento}<span className="text-xs text-zinc-500"> km/h</span></p>
							</div>
							<div className="text-right">
								<p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">Dirección</p>
								<p className="text-[11px] font-bold text-[#00A19B] mt-1 tracking-tight">{vientoCardinal}</p>
								<p className="text-[10px] text-zinc-500 font-sans font-semibold">Azimut: {dirVientoGrados}°</p>
							</div>
						</div>

						{/* Estado de Precipitación */}
						<div className={`p-2.5 rounded-lg border text-center font-bold text-xs ${tieneLluvia ? "bg-blue-950/40 border-blue-800 text-blue-400 animate-pulse" : "bg-black/40 border-zinc-900 text-zinc-400"}`}>
							{tieneLluvia ? "⚠️ ADVERTENCIA: DETECCION DE AGUA ACTIVA" : "✓ MONITOREO AMBIENTAL: PISTA SECA"}
						</div>
					</div>
				</div>

				<div className="text-[11px] font-bold tracking-widest text-emerald-400 border border-zinc-900 py-2.5 rounded-lg bg-black/40 shadow-inner text-center mt-3 truncate px-1">
					● {estadoPistaMensaje}
				</div>
			</div>

			{/* 🖥️ MONITOR DEL PITWALL: INFORME DE DIRECCIÓN DE CARRERA EN VIVO */}
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
						<div className="text-center text-zinc-600 text-xs py-4 uppercase tracking-widest animate-pulse font-bold">
							Esperando transmisión... No se registran banderas ni investigaciones en esta sesión.
						</div>
					)}
				</div>
			</div>

		</div>
	);
}