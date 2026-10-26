"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Trophy, Calendar, Flag } from "lucide-react";

import Button from "@/components/ui/Button";
import ScrollHint from "@/components/ScrollHint";

import icon from "public/logoprincipal.png";
import mosaicoEquipos from "public/equiposf1.png";

export default function Home() {
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
			{/* MOSAICO DE FONDO (PRESERVADO INTACTO CON VIÑETEADO CINEMATOGRÁFICO) */}
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
				{/* Viñeteado suave en los bordes para fundir el mosaico con el negro puro */}
				<div className="absolute inset-0 bg-radial from-transparent via-black/60 to-black pointer-events-none" />
			</div>

			{/* DESTELLO DORADO PRINCIPAL DE FONDO */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-amber-500/[0.07] blur-[170px] rounded-full pointer-events-none z-0" />

			{/* HERO PRINCIPAL */}
			<section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center max-w-7xl mx-auto px-6 py-16 sm:px-12 text-center">

				{/* LOGO GIGANTE DESTACADO (PRESERVADO) */}
				<motion.div 
					initial={{ opacity: 0, scale: 0.88 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8 }}
					className="w-full max-w-[560px] drop-shadow-[0_0_55px_rgba(245,158,11,0.35)] hover:scale-105 hover:drop-shadow-[0_0_75px_rgba(245,158,11,0.5)] transition duration-500 flex justify-center select-none mb-10 cursor-pointer"
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
					<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.35)]">
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
					
				{/* BOTONES PRINCIPALES DE ACCESO DIRECTO */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="flex flex-wrap justify-center gap-4 z-20 mb-12"
				>
					<Link href="/dashboard" prefetch={false}>
						<Button className="rounded-2xl border border-amber-300/60 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 px-9 py-4 font-black uppercase tracking-widest text-xs shadow-[0_4px_30px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_45px_rgba(245,158,11,0.6)] flex items-center gap-3 cursor-pointer">
							<Gauge className="w-5 h-5 text-black" /> Abrir Telemetría En Vivo
						</Button>
					</Link>

					<Link href="/dashboard/standings">
						<Button className="rounded-2xl border border-zinc-800 bg-zinc-900/80 text-neutral-200 px-8 py-4 font-bold uppercase tracking-widest text-xs backdrop-blur-xl transition duration-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/[0.08] hover:scale-105 flex items-center gap-2.5 cursor-pointer">
							<Trophy className="w-4 h-4 text-amber-500" /> Campeonatos FIA
						</Button>
					</Link>

					<Link href="/schedule">
						<Button className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 text-zinc-300 px-8 py-4 font-bold uppercase tracking-widest text-xs backdrop-blur-xl transition duration-300 hover:border-amber-500/40 hover:text-amber-400 hover:scale-105 flex items-center gap-2.5 cursor-pointer">
							<Calendar className="w-4 h-4 text-amber-500" /> Ver Fechas de GP
						</Button>
					</Link>
				</motion.div>

				<ScrollHint />
			</section>

			{/* BANNER FINAL ELEGANTE "ENCENDÉ TUS MOTORES" */}
			<section className="relative z-10 py-20 max-w-5xl mx-auto px-6 sm:px-12">
				<div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-10 sm:p-16 text-center shadow-[0_10px_40px_rgba(245,158,11,0.15)] backdrop-blur-2xl">
					
					{/* Luces de fondo */}
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
					<div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-28 bg-amber-500/5 blur-2xl pointer-events-none" />

					<div className="relative z-10 max-w-2xl mx-auto space-y-6">
						<div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
							<Flag className="w-8 h-8 text-amber-400 animate-pulse" />
						</div>

						<h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
							Encendé tus Motores <br />
							<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
								Y Seguí la Carrera
							</span>
						</h2>

						<p className="text-zinc-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
							Sincronizá el panel con tu tele en segundos y no te pierdas ni un solo tiempo de sector, parada en boxes o duelo en pista.
						</p>

						<div className="pt-4 flex justify-center">
							<Link href="/dashboard">
								<Button className="rounded-2xl border border-amber-400/60 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black px-10 py-4.5 font-black uppercase tracking-widest text-xs shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-3 cursor-pointer">
									<Gauge className="w-5 h-5 text-black" /> Ir al Panel En Vivo
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* FOOTER OFICIAL */}
			<footer className="relative z-10 border-t border-zinc-900 bg-black/90 py-8 text-center text-xs font-mono text-zinc-600">
				<p>BLACKBOX-F1 · PLATAFORMA DE TELEMETRÍA EN ESPAÑOL</p>
			</footer>
		</div>
	);
}
