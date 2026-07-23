"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import githubIcon from "public/icons/github.svg";
import coffeeIcon from "public/icons/bmc-logo.svg";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = pathnameIcon();

	// 🕵️ LÓGICA DE SCROLL REFORZADA
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			// Usamos el fallback de documentElement por si window.scrollY se pone mañoso en el layout global
			const currentScrollY = window.scrollY || document.documentElement.scrollTop;
			
			// Si scrolea para abajo (más de 10px de diferencia) y ya pasó el umbral de la barra, la esconde.
			if (currentScrollY > lastScrollY && currentScrollY > 40) {
				setIsVisible(false);
			} else if (currentScrollY < lastScrollY) {
				// Si scrolea para arriba, reaparece al toque
				setIsVisible(true);
			}
			setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollY]);

	function pathnameIcon() {
		try { return usePathname(); } catch { return "/"; }
	}

	const navLinks = [
		{ name: "Panel", href: "/dashboard" },
		{ name: "Calendario", href: "/schedule" },
		{ name: "Ayuda", href: "/help" },
	];

	return (
		<>
			{/* 🏎️ ESTILOS INYECTADOS EN CALIENTE PARA LA RESPIRACIÓN LENTA */}
			<style jsx global>{`
				@keyframes respirarLento {
					0%, 100% { opacity: 1; transform: scale(1); }
					50% { opacity: 0.4; transform: scale(0.98); }
				}
				.animate-respirar-lenta {
					animation: respirarLento 6s ease-in-out infinite;
				}
			`}</style>

			{/* 🏆 BARRA DE NAVEGACIÓN - EDICIÓN FIBRA DE CARBONO INTELIGENTE */}
			<nav 
				className={`fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between gap-4 border-b border-amber-500/10 px-6 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)] font-mono select-none overflow-hidden transition-transform duration-500 relative ${
					isVisible ? "translate-y-0" : "-translate-y-full"
				}`}
				style={{
					backgroundColor: "#09090b",
					backgroundImage: 
						`linear-gradient(45deg, #111115 25%, transparent 25%), 
						 linear-gradient(-45deg, #111115 25%, transparent 25%), 
						 linear-gradient(45deg, transparent 75%, #111115 75%), 
						 linear-gradient(-45deg, transparent 75%, #111115 75%)`,
					backgroundSize: "6px 6px",
					backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0"
				}}
			>
				{/* Capa de opacidad para suavizar la fibra de carbono */}
				<div className="absolute inset-0 bg-zinc-950/60 -z-10 pointer-events-none" />

				{/* SECCIÓN IZQUIERDA: LOGO CON RESPIRACIÓN ULTRA LENTA (6 SEGUNDOS) */}
				<div className="flex items-center">
					<Link href="/" className="flex items-center justify-start bg-transparent transition-transform duration-200 active:scale-95 group">
						<Image 
							src="/favicon.png" 
							alt="Inicio" 
							width={96} 
							height={24} 
							className="w-24 h-auto object-contain transition-transform duration-300 group-hover:scale-102 select-none animate-respirar-lenta"
							priority
						/>
					</Link>
				</div>

				{/* SECCIÓN CENTRAL: LINKS DE ESCRITORIO */}
				<div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] md:flex">
					{navLinks.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`relative py-1 transition-all duration-300 active:scale-95 group ${
									isActive ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "text-zinc-400 hover:text-zinc-100"
								}`}
							>
								<span>{link.name}</span>
								<span className={`absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ${
									isActive ? "w-full" : "w-0 group-hover:w-full"
								}`} />
							</Link>
						);
					})}
				</div>

				{/* SECCIÓN DERECHA: BOTONES 100% TRANSPARENTES RECALIBRADOS */}
				<div className="hidden items-center gap-2 md:flex">
					{/* Botón Café (Más grande, sin fondo gris) */}
					<Link
						className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-transparent border border-transparent text-xs font-bold uppercase tracking-widest text-zinc-400 transition-all duration-300 hover:text-amber-400 hover:border-amber-500/20 hover:bg-amber-500/[0.02] active:scale-95 group"
						href="https://buymeacoffee.com/focusfv"
						target="_blank"
					>
						<Image src={coffeeIcon} alt="Café" width={20} height={20} className="opacity-70 brightness-0 invert transition-all group-hover:opacity-100 group-hover:text-amber-400 group-hover:scale-105 duration-200" />
						<span>Doname un café</span>
					</Link>

					{/* Botón GitHub (Solo Icono, transparente) */}
					<Link
						className="flex items-center justify-center p-2 rounded-lg bg-transparent border border-transparent text-zinc-400 transition-all duration-300 hover:text-zinc-100 hover:border-zinc-800 hover:bg-zinc-900/20 active:scale-95 group"
						href="https://github.com/FocusFV/Blackbox-F1"
						target="_blank"
						title="GitHub"
					>
						<Image src={githubIcon} alt="GitHub" width={18} height={18} className="opacity-70 brightness-0 invert transition-transform group-hover:scale-105 duration-200" />
					</Link>
				</div>

				{/* DISPOSITIVOS MÓVILES */}
				<div className="flex items-center md:hidden">
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="flex flex-col items-center justify-center h-8 w-8 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-all hover:text-amber-400 active:scale-95"
						aria-label="Menú"
					>
						<div className="relative w-4 h-3 flex flex-col justify-between">
							<span className={`w-full h-[1px] bg-current rounded-full transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
							<span className={`w-full h-[1px] bg-current rounded-full transition-opacity duration-200 ${isOpen ? "opacity-0" : ""}`} />
							<span className={`w-full h-[1px] bg-current rounded-full transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
						</div>
					</button>
				</div>
			</nav>

			{/* DESPLEGABLE MÓVIL */}
			<div className={`fixed top-16 left-0 z-40 w-full bg-zinc-950/95 border-b border-amber-500/10 backdrop-blur-2xl transition-all duration-300 md:hidden ${
				isOpen ? "max-h-80 opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.9)]" : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
			}`}>
				<div className="flex flex-col gap-4 p-6 font-mono text-sm font-bold uppercase tracking-widest">
					<Link href="/" onClick={() => setIsOpen(false)} className={`transition-colors py-1 ${pathname === "/" ? "text-amber-400" : "text-zinc-400 hover:text-zinc-100"}`}>
						Inicio
					</Link>
					{navLinks.map((link) => (
						<Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={`transition-colors py-1 ${pathname === link.href ? "text-amber-400" : "text-zinc-400 hover:text-zinc-100"}`}>
							{link.name}
						</Link>
					))}
					<div className="h-[1px] bg-zinc-900 my-2" />
					<div className="flex justify-between items-center gap-4">
						<Link className="flex flex-1 items-center justify-center gap-2 px-4 py-2 rounded-xl bg-transparent border border-zinc-800 text-xs text-zinc-400" href="https://buymeacoffee.com/focusfv" target="_blank">
							<Image src={coffeeIcon} alt="Café" width={18} height={18} className="brightness-0 invert opacity-60" />
							<span>Café</span>
						</Link>
						<Link className="flex items-center justify-center p-2.5 rounded-xl bg-transparent border border-zinc-800 text-zinc-400" href="https://github.com/FocusFV/Blackbox-F1" target="_blank">
							<Image src={githubIcon} alt="GitHub" width={16} height={16} className="brightness-0 invert opacity-60" />
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}