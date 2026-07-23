import Image from "next/image";

import Note from "@/components/Note";
import DriverDRS from "@/components/driver/DriverDRS";
import DriverTire from "@/components/driver/DriverTire";
import DriverPedals from "@/components/driver/DriverPedals";
import TemperatureComplication from "@/components/complications/Temperature";
import HumidityComplication from "@/components/complications/Humidity";
import WindSpeedComplication from "@/components/complications/WindSpeed";
import RainComplication from "@/components/complications/Rain";

import unknownTireIcon from "public/tires/unknown.svg";
import mediumTireIcon from "public/tires/medium.svg";
import interTireIcon from "public/tires/intermediate.svg";
import hardTireIcon from "public/tires/hard.svg";
import softTireIcon from "public/tires/soft.svg";
import wetTireIcon from "public/tires/wet.svg";

export default function HelpPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-12 px-4 py-8 text-zinc-100">
			{/* HERO SECTION */}
			<div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/40 to-black p-8 backdrop-blur-md shadow-2xl">
				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
				<div className="flex flex-col gap-3">
					<div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 w-fit uppercase tracking-widest">
						<span className="size-2 rounded-full bg-red-500 animate-pulse" /> Guía Oficial de Telemetría
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
						Centro de Ayuda Blackboxf1
					</h1>
					<p className="max-w-2xl text-zinc-400 text-base leading-relaxed">
						Dominá la interfaz de telemetría en tiempo real. Conocé la codificación de colores, indicadores de estado de los monoplazas y cómo sincronizar los datos en vivo con tu transmisión.
					</p>
				</div>
			</div>

			{/* SECCIÓN 1: CÓDIGO DE COLORES */}
			<section className="space-y-6">
				<div className="border-b border-zinc-800/80 pb-4">
					<h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<span className="text-red-500">#</span> Sistema de Codificación por Colores
					</h2>
					<p className="text-sm text-zinc-400 mt-1">
						Inspirado en los gráficos oficiales de la Fórmula 1 para tiempos de vuelta, sectores y deltas.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm hover:border-zinc-700 transition-all">
						<div className="flex items-center gap-3">
							<span className="size-5 rounded-md bg-white shadow-sm shadow-white/20" />
							<span className="font-bold text-white">Blanco</span>
						</div>
						<p className="mt-2 text-sm text-zinc-400">Tiempo de la última vuelta registrada por el piloto.</p>
					</div>

					<div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm hover:border-zinc-700 transition-all">
						<div className="flex items-center gap-3">
							<span className="size-5 rounded-md bg-amber-400 shadow-sm shadow-amber-400/20" />
							<span className="font-bold text-amber-400">Amarillo</span>
						</div>
						<p className="mt-2 text-sm text-zinc-400">Sector o vuelta más lenta que la mejor marca personal.</p>
					</div>

					<div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm hover:border-zinc-700 transition-all">
						<div className="flex items-center gap-3">
							<span className="size-5 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/20" />
							<span className="font-bold text-emerald-400">Verde</span>
						</div>
						<p className="mt-2 text-sm text-zinc-400">Mejor marca personal del piloto (récord personal en la sesión).</p>
					</div>

					<div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm hover:border-zinc-700 transition-all">
						<div className="flex items-center gap-3">
							<span className="size-5 rounded-md bg-violet-500 shadow-sm shadow-violet-500/20" />
							<span className="font-bold text-violet-400">Violeta</span>
						</div>
						<p className="mt-2 text-sm text-zinc-400">Mejor marca absoluta de toda la sesión (récord de pista).</p>
					</div>

					<div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-sm hover:border-zinc-700 transition-all md:col-span-2 lg:col-span-2">
						<div className="flex items-center gap-3">
							<span className="size-5 rounded-md bg-blue-500 shadow-sm shadow-blue-500/20" />
							<span className="font-bold text-blue-400">Azul</span>
						</div>
						<p className="mt-2 text-sm text-zinc-400">Indica que el piloto se encuentra transitando por la calle de boxes (pit lane).</p>
					</div>
				</div>

				<Note className="border-amber-500/30 bg-amber-500/5 text-amber-200/90">
					<strong>Atención:</strong> Solo los mini sectores utilizan el color amarillo. Esto evita sobrecargar la pantalla con texto cuando la mayoría de los pilotos no están mejorando sus tiempos.
				</Note>
			</section>

			{/* SECCIÓN 2: LEADERBOARD / CLASIFICACIÓN */}
			<section className="space-y-6">
				<div className="border-b border-zinc-800/80 pb-4">
					<h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<span className="text-red-500">#</span> Clasificación y Tabla de Posiciones
					</h2>
					<p className="text-sm text-zinc-400 mt-1">
						Estados especiales destacados en el leaderboard según el transcurso de la sesión.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-5 backdrop-blur-sm">
						<div className="inline-block rounded-md bg-violet-800/40 px-3 py-1 font-semibold text-violet-300 text-xs border border-violet-500/30 mb-3">
							Vuelta Rápida
						</div>
						<h3 className="font-bold text-white text-base">Fondo Violeta</h3>
						<p className="mt-1 text-xs text-zinc-400">El piloto posee el tiempo récord de vuelta en toda la sesión.</p>
					</div>

					<div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-5 opacity-70 backdrop-blur-sm">
						<div className="inline-block rounded-md border border-zinc-600 bg-zinc-800/50 px-3 py-1 font-semibold text-zinc-300 text-xs mb-3">
							Out / DNF
						</div>
						<h3 className="font-bold text-white text-base">Transparente</h3>
						<p className="mt-1 text-xs text-zinc-400">El auto sufrió una avería, chocó o quedó eliminado de la tanda.</p>
					</div>

					<div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5 backdrop-blur-sm">
						<div className="inline-block rounded-md bg-red-800/40 px-3 py-1 font-semibold text-red-300 text-xs border border-red-500/30 mb-3">
							Zona de Peligro
						</div>
						<h3 className="font-bold text-white text-base">Fondo Rojo</h3>
						<p className="mt-1 text-xs text-zinc-400">Piloto dentro de la zona de eliminación instantánea durante Qualy.</p>
					</div>
				</div>
			</section>

			{/* SECCIÓN 3: DRS Y PIT */}
			<section className="space-y-6">
				<div className="border-b border-zinc-800/80 pb-4">
					<h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<span className="text-red-500">#</span> Estados de DRS y Boxes (PIT)
					</h2>
					<p className="text-sm text-zinc-400 mt-1">
						Saber al instante si un auto tiene oportunidad de sobrepaso o si perderá tiempo en boxes.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
						<div>
							<h3 className="font-bold text-white">DRS Apagado</h3>
							<p className="text-xs text-zinc-400">Estado por defecto cuando no hay zona habilitada o está fuera de rango.</p>
						</div>
						<div className="w-16">
							<DriverDRS on={false} possible={false} inPit={false} pitOut={false} />
						</div>
					</div>

					<div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
						<div>
							<h3 className="font-bold text-white">DRS Posible</h3>
							<p className="text-xs text-zinc-400">A menos de 1s en la detección. Listo para abrir ala en zona DRS.</p>
						</div>
						<div className="w-16">
							<DriverDRS on={false} possible={true} inPit={false} pitOut={false} />
						</div>
					</div>

					<div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
						<div>
							<h3 className="font-bold text-emerald-400">DRS Activo</h3>
							<p className="text-xs text-zinc-400">El alerón trasero está abierto entregando máxima velocidad punta.</p>
						</div>
						<div className="w-16">
							<DriverDRS on={true} possible={false} inPit={false} pitOut={false} />
						</div>
					</div>

					<div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
						<div>
							<h3 className="font-bold text-amber-400">En PIT / Pit Out</h3>
							<p className="text-xs text-zinc-400">El coche se desplaza por la calle de boxes realizando parada o regreso.</p>
						</div>
						<div className="w-16">
							<DriverDRS on={false} possible={false} inPit={true} pitOut={false} />
						</div>
					</div>
				</div>
			</section>

			{/* SECCIÓN 4: NEUMÁTICOS Y COMPUESTOS */}
			<section className="space-y-6">
				<div className="border-b border-zinc-800/80 pb-4">
					<h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<span className="text-red-500">#</span> Neumáticos y Estrategia de Stints
					</h2>
					<p className="text-sm text-zinc-400 mt-1">
						Muestra el tipo de goma colocado y la cantidad de vueltas acumuladas de uso.
					</p>
				</div>

				<div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
					<div className="space-y-1 text-center md:text-left">
						<h3 className="font-bold text-white text-lg">Ejemplo de Historial de Paradas</h3>
						<p className="text-sm text-zinc-400">
							Acá se observa un piloto que realizó 1 parada y lleva neumáticos blandos con 12 vueltas.
						</p>
					</div>
					<div className="bg-black/60 p-4 rounded-lg border border-zinc-800">
						<DriverTire
							stints={[
								{ TotalLaps: 12, Compound: "SOFT" },
								{ TotalLaps: 12, Compound: "SOFT", New: "TRUE" },
							]}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
					<div className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center gap-2">
						<Image src={softTireIcon} alt="blando" className="size-10" />
						<span className="text-xs font-bold text-red-400">Blando (Soft)</span>
					</div>
					<div className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center gap-2">
						<Image src={mediumTireIcon} alt="medio" className="size-10" />
						<span className="text-xs font-bold text-yellow-400">Medio (Medium)</span>
					</div>
					<div className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center gap-2">
						<Image src={hardTireIcon} alt="duro" className="size-10" />
						<span className="text-xs font-bold text-white">Duro (Hard)</span>
					</div>
					<div className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center gap-2">
						<Image src={interTireIcon} alt="intermedio" className="size-10" />
						<span className="text-xs font-bold text-emerald-400">Intermedio</span>
					</div>
					<div className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center gap-2">
						<Image src={wetTireIcon} alt="lluvia" className="size-10" />
						<span className="text-xs font-bold text-blue-400">Extrema Lluvia</span>
					</div>
					<div className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center gap-2">
						<Image src={unknownTireIcon} alt="desconocido" className="size-10 opacity-60" />
						<span className="text-xs font-bold text-zinc-500">Desconocido</span>
					</div>
				</div>
			</section>

			{/* SECCIÓN 5: TELEMETRÍA DE PEDALES */}
			<section className="space-y-6">
				<div className="border-b border-zinc-800/80 pb-4">
					<h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<span className="text-red-500">#</span> Telemetría de Pedales y Motor
					</h2>
					<p className="text-sm text-zinc-400 mt-1">
						Medidores en tiempo real del esfuerzo de aceleración, frenado y revoluciones.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
						<div className="w-16">
							<DriverPedals className="bg-red-500" value={1} maxValue={3} />
						</div>
						<div>
							<h3 className="font-bold text-red-400">Freno</h3>
							<p className="text-xs text-zinc-400 mt-1">Presión aplicada en pedal de freno (On / Off).</p>
						</div>
					</div>

					<div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
						<div className="w-16">
							<DriverPedals className="bg-emerald-500" value={3} maxValue={4} />
						</div>
						<div>
							<h3 className="font-bold text-emerald-400">Acelerador</h3>
							<p className="text-xs text-zinc-400 mt-1">Porcentaje de apertura de mariposa (0 - 100%).</p>
						</div>
					</div>

					<div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
						<div className="w-16">
							<DriverPedals className="bg-blue-500" value={2} maxValue={3} />
						</div>
						<div>
							<h3 className="font-bold text-blue-400">Motor (RPM)</h3>
							<p className="text-xs text-zinc-400 mt-1">Revoluciones por minuto actuales (0 - 15.000 RPM).</p>
						</div>
					</div>
				</div>
			</section>

			{/* SECCIÓN 6: CLIMA EN PISTA */}
			<section className="space-y-6">
				<div className="border-b border-zinc-800/80 pb-4">
					<h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<span className="text-red-500">#</span> Condiciones Meteorológicas (Weather)
					</h2>
					<p className="text-sm text-zinc-400 mt-1">
						Variables ambientales que alteran directamente el desgaste de neumáticos y la adherencia.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
						<TemperatureComplication value={39} label="TRC" />
						<div>
							<h3 className="font-bold text-white text-sm">Pista (TRC)</h3>
							<p className="text-xs text-zinc-400">Temp. del asfalto.</p>
						</div>
					</div>

					<div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
						<TemperatureComplication value={26} label="AIR" />
						<div>
							<h3 className="font-bold text-white text-sm">Ambiente (AIR)</h3>
							<p className="text-xs text-zinc-400">Temp. del aire.</p>
						</div>
					</div>

					<div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
						<RainComplication rain={true} />
						<div>
							<h3 className="font-bold text-white text-sm">Lluvia</h3>
							<p className="text-xs text-zinc-400">Precipitación detectada.</p>
						</div>
					</div>

					<div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
						<WindSpeedComplication speed={2.9} directionDeg={250} />
						<div>
							<h3 className="font-bold text-white text-sm">Viento</h3>
							<p className="text-xs text-zinc-400">Velocidad y rumbo en m/s.</p>
						</div>
					</div>
				</div>
			</section>

			{/* SECCIÓN 7: DELAY CONTROL */}
			<section className="space-y-6">
				<div className="border-b border-zinc-800/80 pb-4">
					<h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
						<span className="text-red-500">#</span> Sincronización y Control de Retraso
					</h2>
					<p className="text-sm text-zinc-400 mt-1">
						Ajustá la telemetría para que coincida exactamente con tu señal de TV o F1TV.
					</p>
				</div>

				<div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-black p-6 space-y-4">
					<p className="text-sm text-zinc-300 leading-relaxed">
						Dado que la API directo de boxes se actualiza milisegundos antes que la transmisión de TV, podés configurar un retraso (delay) en segundos. Así la app pausará la llegada de datos y la reproducirá a la par de tus imágenes sin spoliarte los sobrepasos.
					</p>

					<div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-2">
						<h3 className="text-xs font-bold uppercase tracking-wider text-red-400">Puntos de Referencia para Sincronizar:</h3>
						<ul className="text-sm text-zinc-400 space-y-1 list-disc pl-5">
							<li>El paso por la línea de meta al iniciar nueva vuelta (en carrera).</li>
							<li>El segundero del reloj principal de sesión (en FP1, FP2, FP3 y Qualy).</li>
							<li>Los cambios de color en los sectores de los pilotos en pantalla.</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	);
}