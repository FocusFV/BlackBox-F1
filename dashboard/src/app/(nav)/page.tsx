"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Gauge, 
	Radio, 
	Tv2, 
	Trophy, 
	ChevronDown, 
	BarChart3,
	Flag
} from "lucide-react";

import Button from "@/components/ui/Button";
import ScrollHint from "@/components/ScrollHint";

import icon from "public/logoprincipal.png";
import mosaicoEquipos from "public/equiposf1.png";

// PREGUNTAS FRECUENTES
const faqs = [
	{
		q: "¿Tengo que pagar para usar la plataforma?",
		a: "No, para nada. Blackbox-F1 es un proyecto 100% gratuito pensado para la comunidad de fanáticos de la carrera."
	},
	{
		q: "¿Cómo sincronizo los datos con la transmisión de mi tele?",
		a: "Como las transmisiones por TV o streaming suelen tener unos segundos de demora, podés usar el control de retraso (delay) para pausar los datos y hacer que avancen exactamente al mismo tiempo que tu pantalla."
	},
	{
		q: "¿Puedo usarlo desde el celular o la tablet?",
		a: "Sí, la interfaz se adapta perfecto a pantallas táctiles para que la uses como segunda pantalla al lado del televisor o monitor."
	},
	{
		q: "¿Qué datos puedo seguir durante la carrera?",
		a: "Podés ver los tiempos por sector en milésimas, diferencias entre autos, compuesto de neumáticos, paradas en boxes, clima en pista y la ubicación estimada en el mapa."
	}
];

export default function Home() {
	const [activeFaq, setActiveFaq] = useState<number | null>(null);

	const toggleFaq = (idx: number) => {
		setActiveFaq(activeFaq === idx ? null : idx);
	};

	return (
		<div 
			className="min-h-screen w-full text-neutral-100 relative overflow-x-hidden font-sans selection:bg-amber-500 selection:text-black"
			style={{
				backgroundImage: `
					radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.05) 0%, transparent 60%),
					linear-gradient(45deg, #111 25%, transparent 25%), 
					linear-gradient(-45deg, #111 25%, transparent 25%), 
					linear-gradient(45deg, transparent 75%, #111 75%), 
					linear-gradient(-45deg, transparent 75%, #111 75%)
				`,
				backgroundSize: "100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px",
				backgroundColor: "#050505"
			}}
		>
			{/* MOSAICO DE FONDO */}
			<div className="absolute inset-0 z-0 opacity-10 overflow-hidden flex items-center justify-center pointer-events-none">
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

			{/* DESTELLO DORADO DE FONDO */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-amber-500/[0.06] blur-[170px] rounded-full pointer-events-none z-0" />

			{/* HERO PRINCIPAL */}
			<section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center max-w-7xl mx-auto px-6 py-12 sm:px-12">

				{/* LOGO PRINCIPAL DESTACADO */}
				<motion.div 
					initial={{ opacity: 0, scale: 0.85 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8 }}
					className="w-full max-w-[560px] drop-shadow-[0_0_50px_rgba(245,158,11,0.3)] hover:scale-105 hover:drop-shadow-[0_0_70px_rgba(245,158,11,0.45)] transition duration-500 flex justify-center select-none mb-10 cursor-pointer"
				>
					<Image 
						src={icon} 
						alt="Blackbox-F1 Logo" 
						className="w-full h-auto object-contain" 
						priority 
					/>
				</motion.div>

				{/* TÍTULO PRINCIPAL */}
				<motion.h1 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="text-center text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-zinc-100 leading-[1.05] mb-6"
				>
					Seguí la Fórmula 1 <br />
					<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
						En Vivo y al Detalle
					</span>
				</motion.h1>
				
				{/* SUBTÍTULO */}
				<motion.p 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.3 }}
					className="text-center text-zinc-400 text-base sm:text-lg max-w-2xl font-medium leading-relaxed mb-12"
				>
					Tiempos en vivo por milésimas, estrategia de neumáticos, mapa de la pista y control de retraso para estar en la misma línea que tu transmisión de TV.
				</motion.p>
					
				{/* BOTONES PRINCIPALES */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="flex flex-wrap justify-center gap-5 z-20 mb-12"
				>
					<Link href="/dashboard" prefetch={false}>
						<Button className="rounded-2xl border border-transparent bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 px-9 py-4 font-black uppercase tracking-widest text-xs shadow-[0_4px_30px_rgba(245,158,11,0.3)] transition duration-300 hover:scale-105 hover:shadow-[0_4px_40px_rgba(245,158,11,0.5)] flex items-center gap-3">
							<Gauge className="w-5 h-5" /> Abrir Telemetría En Vivo
						</Button>
					</Link>

					<Link href="/schedule">
						<Button className="rounded-2xl border border-zinc-800 bg-zinc-900/60 text-neutral-200 px-9 py-4 font-bold uppercase tracking-widest text-xs backdrop-blur-xl transition duration-300 hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/[0.05] hover:scale-105 flex items-center gap-3">
							<Trophy className="w-5 h-5 text-amber-500" /> Ver Fechas de GP
						</Button>
					</Link>
				</motion.div>

				<ScrollHint />
			</section>

			{/* CARACTERÍSTICAS */}
			<section className="relative z-10 py-20 max-w-7xl mx-auto px-6 sm:px-12">
				<div className="text-center mb-16 space-y-3">
					<h2 className="text-xs font-mono font-extrabold text-amber-500 uppercase tracking-[0.3em]">
						// DATOS EN TIEMPO REAL
					</h2>
					<p className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
						Tu Segunda Pantalla para el Fin de Semana
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

					{/* Tarjeta 1 */}
					<motion.div 
						whileHover={{ y: -6 }}
						className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-black p-7 rounded-2xl border border-zinc-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300"
					>
						<div>
							<div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-5 group-hover:scale-110 transition-transform">
								<Radio className="w-6 h-6" />
							</div>
							<h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">
								Tiempos Oficiales
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed font-medium">
								Tiempos de cada sector, mejores marcas de vuelta y diferencias entre pilotos actualizadas al instante.
							</p>
						</div>
						<div className="mt-6 pt-4 border-t border-zinc-800/60 text-[11px] font-mono text-amber-500/80 font-bold uppercase tracking-wider">
							● Actualización Inmediata
						</div>
					</motion.div>

					{/* Tarjeta 2 */}
					<motion.div 
						whileHover={{ y: -6 }}
						className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-black p-7 rounded-2xl border border-zinc-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300"
					>
						<div>
							<div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-5 group-hover:scale-110 transition-transform">
								<Tv2 className="w-6 h-6" />
							</div>
							<h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">
								Sincronización con la Tele
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed font-medium">
								Podés pausar la llegada de datos los segundos necesarios para ver la información en sintonía con la TV.
							</p>
						</div>
						<div className="mt-6 pt-4 border-t border-zinc-800/60 text-[11px] font-mono text-amber-500/80 font-bold uppercase tracking-wider">
							● Control de Retraso
						</div>
					</motion.div>

					{/* Tarjeta 3 */}
					<motion.div 
						whileHover={{ y: -6 }}
						className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-black p-7 rounded-2xl border border-zinc-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300"
					>
						<div>
							<div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-5 group-hover:scale-110 transition-transform">
								<Gauge className="w-6 h-6" />
							</div>
							<h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">
								Mapa de la Pista
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed font-medium">
								Ubicación estimada de los autos sobre el circuito para seguir de cerca las luchas de posiciones.
							</p>
						</div>
						<div className="mt-6 pt-4 border-t border-zinc-800/60 text-[11px] font-mono text-amber-500/80 font-bold uppercase tracking-wider">
							● Posición en Circuito
						</div>
					</motion.div>

					{/* Tarjeta 4 */}
					<motion.div 
						whileHover={{ y: -6 }}
						className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-black p-7 rounded-2xl border border-zinc-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300"
					>
						<div>
							<div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-5 group-hover:scale-110 transition-transform">
								<BarChart3 className="w-6 h-6" />
							</div>
							<h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">
								Uso de Neumáticos
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed font-medium">
								Consultá qué compuesto está usando cada piloto, las vueltas de uso que llevan y sus paradas en boxes.
							</p>
						</div>
						<div className="mt-6 pt-4 border-t border-zinc-800/60 text-[11px] font-mono text-amber-500/80 font-bold uppercase tracking-wider">
							● Tipo y Desgaste
						</div>
					</motion.div>

				</div>
			</section>

			{/* SECCIÓN PREGUNTAS FRECUENTES */}
			<section className="relative z-10 py-20 max-w-4xl mx-auto px-6 sm:px-12">
				<div className="text-center mb-12 space-y-2">
					<h2 className="text-xs font-mono font-extrabold text-amber-500 uppercase tracking-[0.3em]">
						// PREGUNTAS FRECUENTES
					</h2>
					<p className="text-3xl font-black uppercase text-white">Preguntas Frecuentes</p>
				</div>

				<div className="space-y-4">
					{faqs.map((faq, idx) => (
						<div 
							key={idx} 
							className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md overflow-hidden transition-all duration-300"
						>
							<button 
								onClick={() => toggleFaq(idx)}
								className="w-full p-6 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-amber-400 transition-colors"
							>
								<span className="text-base sm:text-lg">{faq.q}</span>
								<ChevronDown className={`w-5 h-5 text-amber-500 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
							</button>

							<AnimatePresence>
								{activeFaq === idx && (
									<motion.div 
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.3 }}
										className="px-6 pb-6 text-sm text-zinc-400 font-medium leading-relaxed border-t border-zinc-800/40 pt-4"
									>
										{faq.a}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					))}
				</div>
			</section>

			{/* BANNER FINAL RECARGADO */}
			<section className="relative z-10 py-20 max-w-5xl mx-auto px-6 sm:px-12">
				<div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-10 sm:p-16 text-center shadow-[0_10px_40px_rgba(245,158,11,0.1)] backdrop-blur-2xl">
					
					{/* Luces de fondo de la tarjeta */}
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
					<div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-28 bg-amber-500/5 blur-2xl pointer-events-none" />

					<div className="relative z-10 max-w-2xl mx-auto space-y-6">
						
						{/* Ícono destacado */}
						<div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-2">
							<Flag className="w-8 h-8 text-amber-400 animate-pulse" />
						</div>

						{/* Título Principal */}
						<h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
							Encendé tus Motores <br />
							<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
								Y Seguí la Carrera
							</span>
						</h2>

						{/* Texto descriptivo más legible */}
						<p className="text-zinc-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
							Sincronizá el panel con tu tele en segundos y no te pierdas ni un solo tiempo de sector, parada en boxes o duelo en pista.
						</p>

						{/* Botón Dorado Imponente */}
						<div className="pt-4 flex justify-center">
							<Link href="/dashboard">
								<Button className="rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black px-10 py-4.5 font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_45px_rgba(245,158,11,0.55)] hover:scale-105 transition-all duration-300 flex items-center gap-3">
									<Gauge className="w-5 h-5" /> Ir al Panel En Vivo
								</Button>
							</Link>
						</div>

					</div>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="relative z-10 border-t border-zinc-900 bg-black/80 py-8 text-center text-xs font-mono text-zinc-600">
				<p>BLACKBOX-F1 // PLATAFORMA DE TELEMETRÍA EN ESPAÑOL</p>
			</footer>
		</div>
	);
}