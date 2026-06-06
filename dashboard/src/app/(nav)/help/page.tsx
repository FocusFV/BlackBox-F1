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
		<div>
			<h1 className="my-4 text-3xl">Página de Ayuda</h1>

			<p>Esta página explica algunas de las funciones principales y elementos de la interfaz de f1-dash.</p>

			<h2 className="my-4 text-2xl">Colores</h2>

			<p>
				Un elemento central en la interfaz de f1-dash, inspirado en los gráficos oficiales de la Fórmula 1, es el sistema de codificación por colores utilizado para los tiempos de vuelta, tiempos de sector, mini sectores y diferencias. Cada color tiene un significado específico en este contexto.
			</p>

			<div className="my-4 flex flex-col">
				<div className="flex gap-1">
					<p className="flex items-center gap-1">
						<span className="size-4 rounded-md bg-white" /> Blanco
					</p>
					<p>Tiempo de la última vuelta</p>
				</div>

				<div className="flex gap-1">
					<p className="flex items-center gap-1 text-yellow-500">
						<span className="size-4 rounded-md bg-amber-400" /> Amarillo
					</p>
					<p>Más lento que su mejor marca personal</p>
				</div>

				<div className="flex gap-1">
					<p className="flex items-center gap-1 text-emerald-500">
						<span className="size-4 rounded-md bg-emerald-500" /> Verde
					</p>
					<p>Mejor marca personal (récord personal)</p>
				</div>

				<div className="flex gap-1">
					<p className="flex items-center gap-1 text-violet-500">
						<span className="size-4 rounded-md bg-violet-500" /> Violeta
					</p>
					<p>Mejor marca general (récord de la sesión)</p>
				</div>

				<div className="flex gap-1">
					<p className="flex items-center gap-1 text-blue-500">
						<span className="size-4 rounded-md bg-blue-500" /> Azul
					</p>
					<p>Piloto en la calle de boxes (pit lane)</p>
				</div>
			</div>

			<Note>
				Solo los mini sectores usan el color amarillo. Usar amarillo para todos los pilotos que no mejoran sus tiempos haría que la interfaz se vea muy cargada, ya que habría demasiados elementos de texto amarillos al mismo tiempo.
			</Note>

			<h2 className="my-4 text-2xl">Clasificación (Leaderboard)</h2>

			<p className="mb-4">
				La tabla de posiciones muestra a todos los pilotos de la sesión actual. Dependiendo del estado del piloto y del progreso de la sesión, algunos pueden aparecer con un fondo de color.
			</p>

			<div className="grid grid-cols-1 gap-x-4 divide-y divide-zinc-800 sm:grid-cols-3 sm:divide-y-0">
				<div>
					<p className="rounded-md bg-violet-800/30 p-2">Piloto con fondo violeta</p>
					<p className="p-2">El piloto tiene el tiempo de vuelta más rápido de toda la sesión</p>
				</div>

				<div className="pt-4 sm:pt-0">
					<p className="rounded-md border p-2 opacity-50">Piloto un poco transparente</p>
					<p className="p-2">El piloto chocó, abandonó o quedó fuera de la sesión</p>
				</div>

				<div className="pt-4 sm:pt-0">
					<p className="rounded-md bg-red-800/30 p-2">Piloto con fondo rojo</p>
					<p className="p-2">Piloto en zona de eliminación durante la clasificación (qualy)</p>
				</div>
			</div>

			<h2 className="my-4 text-2xl">Estado de DRS y PIT</h2>

			<p className="mb-4">
				Cada piloto en la tabla cuenta con un indicador de estado de DRS y PIT. Muestra si el piloto no tiene DRS, si está a menos de 1 segundo del auto de adelante (y es elegible para activarlo tras pasar por la zona de detección), si tiene el DRS activo, o si se encuentra entrando o saliendo de boxes.
			</p>

			<p className="mb-4">
				En general, te da un vistazo rápido para saber si un piloto va a entrar a boxes y podría perder posiciones, o si viene con DRS activo y tiene chances claras de sobrepaso.
			</p>

			<div className="mb-4 flex flex-col gap-4">
				<div className="flex items-center gap-2">
					<div className="w-[4rem]">
						<DriverDRS on={false} possible={false} inPit={false} pitOut={false} />
					</div>

					<p>Apagado: Sin DRS (por defecto)</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="w-[4rem]">
						<DriverDRS on={false} possible={true} inPit={false} pitOut={false} />
					</div>

					<p>Posible: Elegible para activar DRS en la próxima zona</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="w-[4rem]">
						<DriverDRS on={true} possible={false} inPit={false} pitOut={false} />
					</div>

					<p>Activo: El DRS está abierto / activado</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="w-[4rem]">
						<DriverDRS on={false} possible={false} inPit={true} pitOut={false} />
					</div>

					<p>PIT: En la calle de boxes o saliendo de ella</p>
				</div>
			</div>

			<h2 className="my-4 text-2xl">Neumáticos (Tires)</h2>

			<p className="mb-4">
				También mostramos los diferentes compuestos que usa cada piloto y cuántas vueltas dieron con ellos. <br />
				En este ejemplo, el piloto lleva un neumático blando (soft) que tiene 12 vueltas de uso y realizó una parada en boxes.
			</p>

			<div className="mb-4">
				<DriverTire
					stints={[
						{ TotalLaps: 12, Compound: "SOFT" },
						{ TotalLaps: 12, Compound: "SOFT", New: "TRUE" },
					]}
				/>
			</div>

			<p className="mb-4">Estos son los diferentes íconos para cada tipo de compuesto:</p>

			<div className="mb-4 flex flex-wrap gap-4">
				<div className="flex items-center gap-2">
					<Image src={softTireIcon} alt="blando" className="size-8" />
					<p>Blando (Soft)</p>
				</div>

				<div className="flex items-center gap-2">
					<Image src={mediumTireIcon} alt="medio" className="size-8" />
					<p>Medio (Medium)</p>
				</div>

				<div className="flex items-center gap-2">
					<Image src={hardTireIcon} alt="duro" className="size-8" />
					<p>Duro (Hard)</p>
				</div>

				<div className="flex items-center gap-2">
					<Image src={interTireIcon} alt="intermedio" className="size-8" />
					<p>Intermedio (Intermediate)</p>
				</div>

				<div className="flex items-center gap-2">
					<Image src={wetTireIcon} alt="lluvia" className="size-8" />
					<p>Lluvia extrema (Wet)</p>
				</div>

				<div className="flex items-center gap-2">
					<Image src={unknownTireIcon} alt="desconocido" className="size-8" />
					<p>Desconocido</p>
				</div>
			</div>

			<Note className="mb-4">
				A veces el tipo de compuesto figura como desconocido. Esto puede pasar al inicio de una sesión o cuando hay algún inconveniente con la lectura de datos.
			</Note>

			<h2 className="my-4 text-2xl">Control de Retraso (Delay Control)</h2>

			<p className="mb-4">
				Al usar f1-dash mientras mirás la carrera en la tele, F1TV o tu plataforma de streaming favorita, vas a notar que f1-dash se actualiza mucho antes que tu transmisión. Esto le puede sacar emoción a las carreras, ya que te enterás de los eventos clave antes de verlos en pantalla. Para solucionar esto existe el control de retraso.
			</p>

			<p className="mb-4">
				Con el control de retraso podés configurar una pausa en segundos para que f1-dash se actualice más tarde de lo habitual. Por ejemplo, si ponés un retraso de 30 segundos, la app va a procesar los datos con 30 segundos de demora.
				<br />
				Podés usar esta función para sincronizar perfectamente tu transmisión con el dashboard.
			</p>

			<Note className="mb-4">
				Actualmente, solo podés configurar un retraso equivalente al tiempo que llevás dentro de la página. Por ejemplo, si configurás 30s de delay en una página que visitás hace 20s, vas a tener que esperar 10s hasta que se reanude la reproducción de datos. (Esto se modificará en el futuro).
			</Note>

			<h3 className="my-4 text-xl">¿En qué fijarse para sincronizar?</h3>

			<ul className="list ml-6 list-disc">
				<li>
					El inicio de una nueva vuelta <span className="text-zinc-500">(en carrera)</span>
				</li>
				<li>
					El reloj de la sesión <span className="text-zinc-500">(en prácticas libres y clasificación)</span>
				</li>
				<li>Los cambios en los mini sectores, si están disponibles</li>
			</ul>

			<h2 className="my-4 text-2xl">Pedales del Piloto</h2>

			<div className="mb-4 flex flex-col gap-4">
				<div className="flex items-center gap-6">
					<div className="w-[4rem]">
						<DriverPedals className="bg-red-500" value={1} maxValue={3} />
					</div>

					<p>
						Muestra si el piloto está frenando <span className="text-zinc-500">(encendido / apagado)</span>
					</p>
				</div>

				<div className="flex items-center gap-6">
					<div className="w-[4rem]">
						<DriverPedals className="bg-emerald-500" value={3} maxValue={4} />
					</div>

					<p>
						Muestra qué tanto está pisando el pedal del acelerador <span className="text-zinc-500">(0-100%)</span>
					</p>
				</div>

				<div className="flex items-center gap-6">
					<div className="w-[4rem]">
						<DriverPedals className="bg-blue-500" value={2} maxValue={3} />
					</div>

					<p>
						Muestra las revoluciones por minuto del motor (RPM) <span className="text-zinc-500">(0 - 15.000)</span>
					</p>
				</div>
			</div>

			<h2 className="my-4 text-2xl">Clima (Weather)</h2>

			<div className="mb-4 flex flex-col gap-2">
				<div className="flex flex-row items-center gap-2">
					<TemperatureComplication value={39} label="TRC" />
					<p>Muestra la temperatura actual de la superficie de la pista.</p>
				</div>

				<div className="flex flex-row items-center gap-2">
				<TemperatureComplication value={39} label="TRC" />
				<p>Muestra la temperatura actual de la superficie de la pista.</p>
			</div>

				<div className="flex flex-row items-center gap-2">
				<TemperatureComplication value={26} label="AIR" />
				<p>Muestra la temperatura actual del ambiente (aire).</p>
			</div>

				<div className="flex flex-row items-center gap-2">
					<RainComplication rain={true} />
					<p>Muestra si está lloviendo en el circuito o no.</p>
				</div>

				<div className="flex flex-row items-center gap-2">
					<WindSpeedComplication speed={2.9} directionDeg={250} />
					<p>Muestra la velocidad actual del viento en m/s y su dirección según los puntos cardinales.</p>
				</div>
			</div>
		</div>
	);
}