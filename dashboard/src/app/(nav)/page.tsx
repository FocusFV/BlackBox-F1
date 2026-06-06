import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";
import ScrollHint from "@/components/ScrollHint";

import icon from "public/logoprincipal.png";

export default function Home() {
	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-neutral-200 px-6 sm:px-16 max-w-6xl mx-auto relative overflow-hidden">
			
			{/* Destello de luz oro de fondo */}
			<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

			{/* HERO PRINCIPAL */}
<section className="relative z-10 flex h-screen w-full flex-col items-center pt-20 sm:justify-center sm:pt-0">
	{/* Contenedor flexible para que no strainée la imagen */}
	<div className="w-full max-w-[280px] drop-shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:scale-105 transition duration-300 flex justify-center">
		<Image 
			src={icon} 
			alt="f1-dash tag logo" 
			className="w-full h-auto object-contain" // Fuerza a mantener la proporción real sin cortes
			priority // Carga el logo al toque sin delay
		/>
	</div>

	<h1 className="my-14 text-center text-4xl sm:text-6xl font-black uppercase tracking-tight text-zinc-100 leading-tight">
					Telemetría y Tiempos de <br />
					<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
						Formula 1 en Vivo
					</span>
				</h1>

				{/* BOTONES CORREGIDOS (Apertura y cierre con mayúscula) */}
				<div className="flex flex-wrap justify-center gap-4 z-20">
					<Link href="/dashboard">
						<Button className="rounded-xl! border border-transparent bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 px-6 py-3.5 font-black uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(245,158,11,0.15)] transition duration-200 hover:from-amber-400 hover:to-amber-300 hover:shadow-[0_4px_25px_rgba(245,158,11,0.25)] hover:-translate-y-0.5">
							Ir al Dashboard
						</Button>
					</Link>

					<Link href="/schedule">
						<Button className="rounded-xl! border border-zinc-800 bg-zinc-900/30 text-neutral-200 px-6 py-3.5 font-bold uppercase tracking-widest text-xs backdrop-blur-sm transition duration-200 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/[0.02] hover:-translate-y-0.5">
							Ver Calendario
						</Button>
					</Link>
				</div>

				<ScrollHint />
			</section>

			{/* SECCIONES INFORMATIVAS */}
			<div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
				
				{/* Tarjeta 1: ¿Qué es f1-dash? */}
				<section className="bg-gradient-to-b from-zinc-900/50 to-neutral-950/40 p-6 rounded-2xl border border-zinc-900 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-800">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						¿Qué es f1-dash?
					</h2>
					<p className="text-sm text-zinc-400 leading-relaxed font-medium">
						f1-dash es un proyecto personal que arranqué en 2023. Es un panel de telemetría y tiempos en tiempo real para Formula 1. Te permite ver los datos en vivo de los autos en la pista y el cronometraje oficial, incluyendo tiempos de vuelta, sectores, brechas entre pilotos, elección de neumáticos y mucho más.
					</p>
				</section>

				{/* Tarjeta 2: ¿Qué pasó con los datos de posición? */}
				<section className="bg-gradient-to-b from-zinc-900/50 to-neutral-950/40 p-6 rounded-2xl border border-zinc-900 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-800">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						¿Qué pasó con la posición y métricas?
					</h2>
					<div className="space-y-3 text-sm text-zinc-400 leading-relaxed font-medium">
						<p>
							Formula 1 cambió la accesibilidad de los datos posicionales y del monoplaza, cerrándolos bajo suscripción. Como no tengo intenciones de eludir esto, ni de implementar un logueo de F1 que no sea 100% seguro y adecuado, esa info ya no está disponible de forma nativa.
						</p>
						<p className="border-t border-zinc-900/80 pt-2 text-zinc-400/90">
							Para los datos de posición ahora implementamos **minisectores** para calcular una ubicación aproximada. Por su naturaleza no es tan exacta como antes, pero da una excelente indicación de dónde están los autos en pista.
						</p>
					</div>
				</section>

				{/* Tarjeta 3: Estado del proyecto */}
				<section className="bg-gradient-to-b from-zinc-900/50 to-neutral-950/40 p-6 rounded-2xl border border-zinc-900 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-800">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						¿Cuál es el estado actual?
					</h2>
					<p className="text-sm text-zinc-400 leading-relaxed font-medium">
						Actualmente el proyecto se encuentra en modo de mantenimiento. El repositorio público de GitHub no está 100% al día porque empecé una reestructuración masiva que todavía es privada. Esta versión refactorizada es la que está corriendo justo ahora acá en f1-dash.com. Planeo liberar este código en algún momento, pero hoy tengo el foco puesto en otros desarrollos.
					</p>
				</section>

				{/* Tarjeta 4: ¿Qué sigue? */}
				<section className="bg-gradient-to-b from-zinc-900/50 to-neutral-950/40 p-6 rounded-2xl border border-zinc-900 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-800">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						¿Qué es lo próximo?
					</h2>
					<p className="text-sm text-zinc-400 leading-relaxed font-medium">
						La v3 fue el inicio de algo grande; el rediseño inicial abrió nuevas formas de visualizar la data. Lamentablemente, entre los cambios recientes de la F1, la carga de mantener la plataforma bajo un crecimiento constante y el hecho de que algunas personas no respetaron la licencia Open Source, decidí bajar un cambio. Me estoy enfocando en el mantenimiento básico y en el desarrollo de un nuevo proyecto llamado{" "}
						<a className="text-amber-400 font-bold hover:underline" target="_blank" href="https://nitrous.software">
							nitrous
						</a>
						. Iré subiendo novedades de tanto en tanto en Discord o la web.
					</p>
				</section>

			</div>
		</div>
	);
}