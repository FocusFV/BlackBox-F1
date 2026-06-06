import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";
import ScrollHint from "@/components/ScrollHint";

import icon from "public/logoprincipal.png";
import mosaicoEquipos from "public/equiposf1.png";

export default function Home() {
	return (
		// El contenedor principal mantiene la fibra de carbono simulada cubriendo el 100% de la pantalla
		<div 
			className="min-h-screen w-full text-neutral-200 relative overflow-hidden"
			style={{
				backgroundImage: `
					radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.97)),
					linear-gradient(45deg, #111 25%, transparent 25%), 
					linear-gradient(-45deg, #111 25%, transparent 25%), 
					linear-gradient(45deg, transparent 75%, #111 75%), 
					linear-gradient(-45deg, transparent 75%, #111 75%)
				`,
				backgroundSize: "100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px",
				backgroundColor: "#050505"
			}}
		>
			
			{/* TU CONFIGURACIÓN PERFECTA DE MOSAICO (De diez!) */}
			<div className="absolute inset-0 z-0 opacity-10 overflow-hidden flex items-center justify-center">
				<div 
					className="absolute"
					style={{
						top: "50%",
						left: "50%",
						width: "300vw",
						height: "300vh",
						backgroundImage: `url(${mosaicoEquipos.src})`,
						backgroundRepeat: "repeat",
						backgroundSize: "1500px auto", 
						transform: "translate(-75%, -50%) rotate(10deg)",
					}}
				/>
			</div>

			{/* Destello de luz oro de fondo */}
			<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/[0.04] blur-[150px] rounded-full pointer-events-none z-0" />

			{/* HERO PRINCIPAL */}
			<section className="relative z-10 flex h-screen w-full flex-col items-center pt-20 sm:justify-center sm:pt-0 max-w-6xl mx-auto px-6 sm:px-16">
				
				{/* NUEVO LOGO TUNING: Más grande (max-w-[460px]) y con efecto pulse sutil en el resplandor */}
				<div className="w-full max-w-[460px] drop-shadow-[0_0_30px_rgba(245,158,11,0.18)] animate-pulse [animation-duration:4s] hover:scale-105 hover:drop-shadow-[0_0_45px_rgba(245,158,11,0.3)] transition duration-500 flex justify-center select-none">
					<Image 
						src={icon} 
						alt="BlackBox-F1 tag logo" 
						className="w-full h-auto object-contain" 
						priority 
					/>
				</div>

				<h1 className="my-14 text-center text-4xl sm:text-6xl font-black uppercase tracking-tight text-zinc-100 leading-tight">
					Telemetría y Tiempos de <br />
					<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
						Formula 1 en Vivo
					</span>
				</h1>

				{/* BOTONES TUNED */}
<div className="flex flex-wrap justify-center gap-4 z-20">
	{/* Le clavamos prefetch={false} para que Docker no se tilde compilando el dashboard antes de tiempo */}
	<Link href="/dashboard" prefetch={false}>
		<Button className="rounded-xl! border border-transparent bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 px-6 py-3.5 font-black uppercase tracking-widest text-xs shadow-[0_4px_20px_rgba(245,158,11,0.15)] transition duration-200 hover:from-amber-400 hover:to-amber-300 hover:shadow-[0_4px_25px_rgba(245,158,11,0.25)] hover:-translate-y-0.5">
			Ir al Dashboard
		</Button>
	</Link>

	{/* Lo mismo acá, así desactivamos el bendito /schedule que te congelaba el servidor */}
	<Link href="/schedule" prefetch={false}>
		<Button className="rounded-xl! border border-zinc-800 bg-zinc-900/30 text-neutral-200 px-6 py-3.5 font-bold uppercase tracking-widest text-xs backdrop-blur-sm transition duration-200 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/[0.02] hover:-translate-y-0.5">
			Ver Calendario
		</Button>
	</Link>
</div>

				<ScrollHint />
			</section>

			{/* SECCIONES INFORMATIVAS */}
			<div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 pb-24 max-w-6xl mx-auto px-6 sm:px-16">
				
				<section className="bg-gradient-to-b from-zinc-900/60 to-neutral-950/50 p-6 rounded-2xl border border-zinc-900/80 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-700">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						¿Qué es BlackBox-F1?
					</h2>
					<p className="text-sm text-zinc-400 leading-relaxed font-medium">
						BlackBox-F1 es una evolución estética y funcional inspirada en el proyecto original f1-dash. Nace con el objetivo de ofrecer una interfaz completamente traducida al español, con un diseño pulido, moderno y optimizado para los fanáticos de la Formula 1. Te permite seguir la telemetría y los tiempos oficiales en tiempo real, con datos de vueltas, sectores y neumáticos en una experiencia visual superadora.
					</p>
				</section>

				<section className="bg-gradient-to-b from-zinc-900/60 to-neutral-950/50 p-6 rounded-2xl border border-zinc-900/80 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-700">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						¿Cómo se calcula la posición en pista?
					</h2>
					<div className="space-y-3 text-sm text-zinc-400 leading-relaxed font-medium">
						<p>
							Debido a las restricciones actuales en el acceso a las métricas de ubicación posicional por parte de los servicios oficiales, en BlackBox-F1 adaptamos la arquitectura del backend para procesar la información mediante un sistema inteligente de **minisectores**.
						</p>
						<p className="border-t border-zinc-900/80 pt-2 text-zinc-400/90">
							Este algoritmo estima de manera aproximada la localización de los monoplazas en el circuito. Aunque no es una telemetría por satélite milimétrica, otorga una referencia visual sumamente fiel de la progresión y las batallas en pista durante la carrera.
						</p>
					</div>
				</section>

				<section className="bg-gradient-to-b from-zinc-900/60 to-neutral-950/50 p-6 rounded-2xl border border-zinc-900/80 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-700">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						Origen y Reestructuración
					</h2>
					<p className="text-sm text-zinc-400 leading-relaxed font-medium">
						Esta plataforma es una versión refactorizada que toma la sólida base Open Source de f1-dash y la lleva a un nuevo nivel de rendimiento local. Mientras el desarrollo original se mantiene bajo mantenimiento básico, en BlackBox-F1 integramos un backend robusto en Rust montado sobre contenedores Docker para garantizar estabilidad absoluta y respuestas instantáneas en cada sesión.
					</p>
				</section>

				<section className="bg-gradient-to-b from-zinc-900/60 to-neutral-950/50 p-6 rounded-2xl border border-zinc-900/80 shadow-lg backdrop-blur-sm transition duration-200 hover:border-zinc-700">
					<h2 className="mb-3 text-lg font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
						¿Qué es lo próximo?
					</h2>
					<p className="text-sm text-zinc-400 leading-relaxed font-medium">
						El rediseño de la interfaz es solo el punto de partida. La meta de BlackBox-F1 es continuar tuneando la visualización de datos, incorporando componentes personalizados para la telemetría histórica y mejorando las herramientas de sincronización de transmisión. Iremos desplegando optimizaciones continuas en el panel de control para que ver las carreras del campeonato sea una experiencia totalmente inmersiva.
					</p>
				</section>

			</div>
		</div>
	);
}