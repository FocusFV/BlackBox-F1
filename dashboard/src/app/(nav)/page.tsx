"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
	Gauge, 
	Tv2, 
	Trophy, 
	ChevronDown, 
	ChevronRight,
	Activity,
	Radio,
	Sparkles,
	SlidersHorizontal,
	Eye,
	Zap
} from "lucide-react";

import Button from "@/components/ui/Button";
import ScrollHint from "@/components/ScrollHint";
import Flag from "@/components/Flag";

import icon from "public/logoprincipal.png";
import mosaicoEquipos from "public/equiposf1.png";
import calendar2026 from "@/data/calendar2026.json";
import { translateGpName, getCountryCodeForGp } from "@/lib/f1Translations";

// PREGUNTAS FRECUENTES DEL SISTEMA
const faqs = [
	{
		q: "¿Tengo que pagar o registrarme para usar la plataforma?",
		a: "No, para nada. Blackbox-F1 es un cockpit de telemetría 100% libre y gratuito, optimizado para la comunidad de fanáticos del automovilismo."
	},
	{
		q: "¿Cómo sincronizo los datos con mi televisor o streaming?",
		a: "Las transmisiones por TV o Star+/F1TV suelen tener entre 10 y 45 segundos de retraso. Desde los Ajustes podés configurar el offset de delay para pausar la telemetría y hacer que coincida exactamente con tu pantalla."
	},
	{
		q: "¿La pantalla de mi tablet o celular se apaga durante la carrera?",
		a: "¡No! Integramos la tecnología Wake Lock automática en segundo plano: mientras tengas la pestaña de Blackbox-F1 abierta, tu dispositivo mantendrá la pantalla encendida sin bloquearse jamás."
	},
	{
		q: "¿Puedo personalizar los colores y temas de la plataforma?",
		a: "Sí. En el menú de Ajustes podés elegir entre cuatro acabados: Oro 24K Clásico, Oro Neón Ultra-Glow, Oro Rosa Champagne y Modo OLED de contraste puro para ahorrar batería."
	}
];

export default function Home() {
	const [activeFaq, setActiveFaq] = useState<number | null>(null);
	const [mounted, setMounted] = useState(false);
	const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

	// Determinar el próximo GP de la temporada 2026
	const nextRace = useMemo(() => {
		const now = Date.now();
		const upcoming = calendar2026.find((r) => {
			const raceTime = new Date(`${r.date}T${r.time || "12:00:00Z"}`).getTime();
			// Mantener activo hasta 3 horas post-carrera
			return raceTime + 3 * 3600 * 1000 >= now;
		});
		return upcoming || calendar2026[calendar2026.length - 1];
	}, []);

	const translatedGp = useMemo(() => translateGpName(nextRace.raceName), [nextRace]);
	const countryCode = useMemo(() => getCountryCodeForGp(nextRace.raceName), [nextRace]);

	// Timer de cuenta regresiva en vivo
	useEffect(() => {
		setMounted(true);
		const targetTime = new Date(`${nextRace.date}T${nextRace.time || "12:00:00Z"}`).getTime();

		const updateTime = () => {
			const diff = Math.max(0, targetTime - Date.now());
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const seconds = Math.floor((diff / 1000) % 60);
			setTimeLeft({ days, hours, minutes, seconds });
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, [nextRace]);

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
			{/* MOSAICO DE FONDO (PRESERVADO) */}
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

			{/* DESTELLO DORADO PRINCIPAL */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-amber-500/[0.07] blur-[170px] rounded-full pointer-events-none z-0" />

			{/* HERO PRINCIPAL */}
			<section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-20 text-center">

				{/* LOGO GIGANTE DESTACADO (PRESERVADO) */}
				<motion.div 
					initial={{ opacity: 0, scale: 0.88 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8 }}
					className="w-full max-w-[560px] drop-shadow-[0_0_55px_rgba(245,158,11,0.35)] hover:scale-105 hover:drop-shadow-[0_0_75px_rgba(245,158,11,0.5)] transition duration-500 flex justify-center select-none mb-8 cursor-pointer"
				>
					<Image 
						src={icon} 
						alt="Blackbox-F1 Logo" 
						className="w-full h-auto object-contain" 
						priority 
					/>
				</motion.div>

				{/* HUD DEL PRÓXIMO GRAN PREMIO (CUENTA REGRESIVA EN VIVO) */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.15 }}
					className="w-full max-w-2xl mb-8 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/85 border border-amber-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
				>
					<div className="flex items-center gap-3 w-full sm:w-auto">
						<div className="flex items-center justify-center overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900 p-0.5 shadow-md shrink-0">
							<Flag countryCode={countryCode} className="h-7 w-10 object-cover rounded-lg" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-[10px] uppercase font-mono font-black tracking-widest text-amber-400">
									Ronda {nextRace.round} · Oficial FIA
								</span>
								<span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold">
									<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
									Próximo GP
								</span>
							</div>
							<h3 className="text-sm sm:text-base font-black text-white tracking-wide truncate max-w-[280px] sm:max-w-[320px]">
								{translatedGp}
							</h3>
							<p className="text-[11px] text-zinc-400 font-mono">
								{nextRace.Circuit.circuitName}
							</p>
						</div>
					</div>

					{/* BLOQUES DE CUENTA REGRESIVA */}
					<div className="flex items-center gap-1.5 sm:gap-2 font-mono text-center shrink-0 w-full sm:w-auto justify-center border-t sm:border-t-0 sm:border-l border-zinc-800/80 pt-2 sm:pt-0 sm:pl-4">
						<div className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
							<span className="text-base sm:text-lg font-black text-amber-400 block leading-tight">
								{mounted && timeLeft ? String(timeLeft.days).padStart(2, "0") : "--"}
							</span>
							<span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Días</span>
						</div>
						<span className="text-amber-500/60 font-bold">:</span>
						<div className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
							<span className="text-base sm:text-lg font-black text-amber-400 block leading-tight">
								{mounted && timeLeft ? String(timeLeft.hours).padStart(2, "0") : "--"}
							</span>
							<span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Horas</span>
						</div>
						<span className="text-amber-500/60 font-bold">:</span>
						<div className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
							<span className="text-base sm:text-lg font-black text-amber-400 block leading-tight">
								{mounted && timeLeft ? String(timeLeft.minutes).padStart(2, "0") : "--"}
							</span>
							<span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Min</span>
						</div>
						<span className="text-amber-500/60 font-bold">:</span>
						<div className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
							<span className="text-base sm:text-lg font-black text-amber-300 block leading-tight">
								{mounted && timeLeft ? String(timeLeft.seconds).padStart(2, "0") : "--"}
							</span>
							<span className="text-[8px] uppercase tracking-wider text-zinc-500 block">Seg</span>
						</div>
					</div>
				</motion.div>

				{/* TÍTULO PRINCIPAL */}
				<motion.h1 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="text-center text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-zinc-100 leading-[1.05] mb-5"
				>
					Cockpit de Telemetría <br />
					<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.35)]">
						En Tiempo Real
					</span>
				</motion.h1>
				
				{/* SUBTÍTULO */}
				<motion.p 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.3 }}
					className="text-center text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl font-medium leading-relaxed mb-8"
				>
					Tiempos sector a sector en milésimas, diferencias en pista, compuestos de neumáticos, control de retraso sin spoilers y Wake Lock permanente.
				</motion.p>
					
				{/* BOTONES PRINCIPALES CON SHIFT LIGHTS DE VOLANTE F1 */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="flex flex-col items-center gap-5 z-20 mb-12"
				>
					{/* LUCES DE CAMBIO DE MARCHA (F1 SHIFT LIGHTS) */}
					<div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-950/90 border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md">
						<span className="text-[8px] font-mono font-bold text-zinc-500 mr-1 uppercase tracking-wider">RPM</span>
						{/* 5 Verdes */}
						<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
						<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse delay-75" />
						<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse delay-100" />
						<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse delay-150" />
						<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse delay-200" />
						<span className="w-1" />
						{/* 5 Rojas */}
						<div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse delay-300" />
						<div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse delay-300" />
						<div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse delay-300" />
						<div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse delay-300" />
						<div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse delay-300" />
						<span className="w-1" />
						{/* 5 Azules (Shift Point) */}
						<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse delay-500" />
						<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse delay-500" />
						<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse delay-500" />
						<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse delay-500" />
						<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse delay-500" />
					</div>

					<div className="flex flex-wrap justify-center gap-4">
						<Link href="/dashboard" prefetch={false}>
							<Button className="rounded-2xl border border-amber-300/60 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 px-9 py-4 font-black uppercase tracking-widest text-xs shadow-[0_0_35px_rgba(245,158,11,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(245,158,11,0.65)] flex items-center gap-3 cursor-pointer">
								<Gauge className="w-5 h-5 text-black" /> Ingresar a la Telemetría
							</Button>
						</Link>

						<Link href="/dashboard/standings">
							<Button className="rounded-2xl border border-zinc-800 bg-zinc-900/80 text-neutral-200 px-8 py-4 font-bold uppercase tracking-widest text-xs backdrop-blur-xl transition duration-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/[0.08] hover:scale-105 flex items-center gap-2.5 cursor-pointer">
								<Trophy className="w-4 h-4 text-amber-500" /> Campeonatos FIA
							</Button>
						</Link>

						<Link href="/schedule">
							<Button className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 text-zinc-400 px-6 py-4 font-mono font-bold uppercase tracking-wider text-xs backdrop-blur-xl transition duration-300 hover:text-zinc-200 hover:border-zinc-700 hover:scale-105 flex items-center gap-2 cursor-pointer">
								Calendario 2026 <ChevronRight className="w-3.5 h-3.5" />
							</Button>
						</Link>
					</div>
				</motion.div>

				<ScrollHint />
			</section>

			{/* FICHA TÉCNICA HORIZONTAL DEL COCKPIT (SPECS BAR) */}
			<section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 -mt-10 mb-16">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
					<div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
						<div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
							<Zap className="w-5 h-5" />
						</div>
						<div className="text-left font-mono">
							<p className="text-[10px] text-zinc-500 uppercase tracking-widest">MUESTREO</p>
							<p className="text-xs font-black text-zinc-200">60 FPS / En Vivo</p>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
						<div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
							<Activity className="w-5 h-5" />
						</div>
						<div className="text-left font-mono">
							<p className="text-[10px] text-zinc-500 uppercase tracking-widest">PRECISIÓN</p>
							<p className="text-xs font-black text-zinc-200">0.001s Milésimas</p>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
						<div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
							<Eye className="w-5 h-5" />
						</div>
						<div className="text-left font-mono">
							<p className="text-[10px] text-zinc-500 uppercase tracking-widest">WAKE LOCK</p>
							<p className="text-xs font-black text-amber-300">Siempre Activo</p>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
						<div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
							<Sparkles className="w-5 h-5" />
						</div>
						<div className="text-left font-mono">
							<p className="text-[10px] text-zinc-500 uppercase tracking-widest">TEMAS ORO</p>
							<p className="text-xs font-black text-zinc-200">24K / OLED / Neón</p>
						</div>
					</div>
				</div>
			</section>

			{/* COMMAND DECK: 3 PANELES DE CRISTAL AHUMADO Y ORO */}
			<section className="relative z-10 py-12 max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
				<div className="text-center mb-14 space-y-3">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase">
						<Radio className="w-3.5 h-3.5 animate-pulse" />
						Centro de Control Pit-Wall
					</div>
					<h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
						Tres Módulos de Comando
					</h2>
					<p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
						Toda la tecnología de la pared de ingenieros de boxes disponible en tu segunda pantalla.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

					{/* MÓDULO 1: TELEMETRÍA EN VIVO */}
					<motion.div 
						whileHover={{ y: -6 }}
						className="bg-gradient-to-br from-zinc-950/95 via-zinc-900/60 to-black p-7 rounded-3xl border border-zinc-800/90 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between group hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-2xl pointer-events-none" />
						<div>
							<div className="flex items-center justify-between mb-6">
								<div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 group-hover:scale-110 transition-transform">
									<Gauge className="w-7 h-7" />
								</div>
								<span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
									MÓDULO 01
								</span>
							</div>

							<h3 className="text-xl font-black uppercase tracking-wide text-white mb-2 group-hover:text-amber-200 transition-colors">
								Telemetría y Tiempos
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed font-medium mb-6">
								Monitoreo en vivo sector a sector, mejores marcas de vuelta personales y absolutas, velocidad punta y diferencias directas entre autos.
							</p>

							{/* Mini Preview de Telemetría */}
							<div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] space-y-1.5 mb-6">
								<div className="flex justify-between items-center text-zinc-400">
									<span>SPEED TRAP</span>
									<span className="text-amber-400 font-bold">347.8 KM/H</span>
								</div>
								<div className="flex gap-1.5">
									<span className="flex-1 text-center py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">S1 28.140</span>
									<span className="flex-1 text-center py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">S2 29.890</span>
									<span className="flex-1 text-center py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">S3 23.012</span>
								</div>
							</div>
						</div>

						<Link href="/dashboard" className="w-full">
							<Button className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-200 py-3 font-mono font-bold text-xs uppercase tracking-wider hover:border-amber-500/50 hover:text-amber-300 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
								Abrir Telemetría <ChevronRight className="w-4 h-4" />
							</Button>
						</Link>
					</motion.div>

					{/* MÓDULO 2: CAMPEONATOS FIA */}
					<motion.div 
						whileHover={{ y: -6 }}
						className="bg-gradient-to-br from-zinc-950/95 via-zinc-900/60 to-black p-7 rounded-3xl border border-zinc-800/90 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between group hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-2xl pointer-events-none" />
						<div>
							<div className="flex items-center justify-between mb-6">
								<div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 group-hover:scale-110 transition-transform">
									<Trophy className="w-7 h-7" />
								</div>
								<span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
									MÓDULO 02
								</span>
							</div>

							<h3 className="text-xl font-black uppercase tracking-wide text-white mb-2 group-hover:text-amber-200 transition-colors">
								Campeonato Mundial
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed font-medium mb-6">
								Tablas oficiales de puntos de Pilotos y Constructores. Modales inmersivos con colores oficiales de escudería, biografías, victorias y podios.
							</p>

							{/* Mini Preview de Podio */}
							<div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] space-y-1.5 mb-6">
								<div className="flex justify-between items-center text-zinc-300">
									<span className="text-amber-400 font-black">1. L. NORRIS</span>
									<span className="font-bold">MCLAREN · 354 PTS</span>
								</div>
								<div className="flex justify-between items-center text-zinc-400">
									<span className="text-zinc-200 font-bold">2. M. VERSTAPPEN</span>
									<span>RED BULL · 311 PTS</span>
								</div>
								<div className="flex justify-between items-center text-zinc-400">
									<span className="text-zinc-200 font-bold">3. C. LECLERC</span>
									<span>FERRARI · 288 PTS</span>
								</div>
							</div>
						</div>

						<Link href="/dashboard/standings" className="w-full">
							<Button className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-200 py-3 font-mono font-bold text-xs uppercase tracking-wider hover:border-amber-500/50 hover:text-amber-300 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
								Ver Clasificación Completa <ChevronRight className="w-4 h-4" />
							</Button>
						</Link>
					</motion.div>

					{/* MÓDULO 3: TV SYNC & DELAY */}
					<motion.div 
						whileHover={{ y: -6 }}
						className="bg-gradient-to-br from-zinc-950/95 via-zinc-900/60 to-black p-7 rounded-3xl border border-zinc-800/90 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between group hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-2xl pointer-events-none" />
						<div>
							<div className="flex items-center justify-between mb-6">
								<div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 group-hover:scale-110 transition-transform">
									<Tv2 className="w-7 h-7" />
								</div>
								<span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
									MÓDULO 03
								</span>
							</div>

							<h3 className="text-xl font-black uppercase tracking-wide text-white mb-2 group-hover:text-amber-200 transition-colors">
								Sincronizador TV
							</h3>
							<p className="text-sm text-zinc-400 leading-relaxed font-medium mb-6">
								Control de retraso milimétrico con slider interactivo. Retrasá los datos los segundos que necesites para disfrutar sin spoilers de la tele.
							</p>

							{/* Mini Preview de Delay */}
							<div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] space-y-2 mb-6">
								<div className="flex justify-between items-center text-zinc-400">
									<span>BUFFER LOCAL</span>
									<span className="text-emerald-400 font-bold">SINCRONIZADO</span>
								</div>
								<div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
									<div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full w-2/3 rounded-full" />
								</div>
							</div>
						</div>

						<Link href="/dashboard/settings" className="w-full">
							<Button className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-200 py-3 font-mono font-bold text-xs uppercase tracking-wider hover:border-amber-500/50 hover:text-amber-300 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
								Ajustes y Sincronización <SlidersHorizontal className="w-3.5 h-3.5" />
							</Button>
						</Link>
					</motion.div>

				</div>
			</section>

			{/* SECCIÓN PREGUNTAS FRECUENTES DEL SISTEMA */}
			<section className="relative z-10 py-16 max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
				<div className="text-center mb-10 space-y-2">
					<span className="text-[10px] font-mono font-extrabold text-amber-500 uppercase tracking-[0.3em]">
						PREGUNTAS DEL SISTEMA
					</span>
					<h2 className="text-2xl sm:text-4xl font-black uppercase text-white">
						Todo lo que Necesitás Saber
					</h2>
				</div>

				<div className="space-y-3.5">
					{faqs.map((faq, idx) => (
						<div 
							key={idx} 
							className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-zinc-700/80"
						>
							<button 
								onClick={() => toggleFaq(idx)}
								className="w-full p-5 sm:p-6 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-amber-300 transition-colors cursor-pointer select-none"
							>
								<span className="text-sm sm:text-base">{faq.q}</span>
								<ChevronDown className={`w-5 h-5 text-amber-500 shrink-0 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
							</button>

							<AnimatePresence>
								{activeFaq === idx && (
									<motion.div 
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.3 }}
										className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed border-t border-zinc-800/60 pt-4"
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
			<section className="relative z-10 py-16 max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
				<div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-zinc-950/95 via-zinc-900/90 to-black p-8 sm:p-14 text-center shadow-[0_10px_45px_rgba(245,158,11,0.15)] backdrop-blur-2xl">
					
					{/* Luces de fondo */}
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
					<div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-28 bg-amber-500/5 blur-2xl pointer-events-none" />

					<div className="relative z-10 max-w-2xl mx-auto space-y-6">
						
						{/* Ícono destacado */}
						<div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
							<Activity className="w-8 h-8 text-amber-400 animate-pulse" />
						</div>

						{/* Título Principal */}
						<h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
							Encendé tus Motores <br />
							<span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
								Y Viví la F1 Como Nunca
							</span>
						</h2>

						<p className="text-zinc-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
							Conectate en vivo al Gran Premio, calibrá tu sincronización y disfrutá de una experiencia sin spoilers, con diseño de puro oro y carbono.
						</p>

						{/* Botón Dorado Imponente */}
						<div className="pt-2 flex justify-center">
							<Link href="/dashboard">
								<Button className="rounded-2xl border border-amber-400/80 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black px-10 py-4.5 font-black uppercase tracking-widest text-xs shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_55px_rgba(245,158,11,0.7)] hover:scale-105 transition-all duration-300 flex items-center gap-3 cursor-pointer">
									<Gauge className="w-5 h-5 text-black" /> Ir al Cockpit En Vivo
								</Button>
							</Link>
						</div>

					</div>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="relative z-10 border-t border-zinc-900 bg-black/90 py-8 text-center text-xs font-mono text-zinc-600">
				<p>BLACKBOX-F1 · COCKPIT Y TELEMETRÍA OFICIAL EN ESPAÑOL</p>
			</footer>
		</div>
	);
}
