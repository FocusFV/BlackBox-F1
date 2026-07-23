"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, X, Flag, CheckSquare, Square } from "lucide-react";

// Ícono personalizado estilo Monoplaza F1
function CarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2" />
			<circle cx="7" cy="17" r="2" />
			<circle cx="17" cy="17" r="2" />
			<path d="M5 10l2-4h4" />
		</svg>
	);
}

export default function SupportModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [dontShowToday, setDontShowToday] = useState(false);

	// 💡 Para pruebas usá 5000 (5 seg). En producción: 30 * 60 * 1000 (30 min)
	const TIMER_DELAY = 30 * 60 * 1000; 

	// Función para programar la apertura del modal
	const scheduleModal = useCallback(() => {
		const modalDismissed = localStorage.getItem("blackbox_support_dismissed");
		const today = new Date().toDateString();

		// Si ya eligió no verlo por hoy, no programamos nada
		if (modalDismissed === today) {
			return;
		}

		const timer = setTimeout(() => {
			setIsOpen(true);
		}, TIMER_DELAY);

		return timer;
	}, [TIMER_DELAY]);

	useEffect(() => {
		const timer = scheduleModal();
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [scheduleModal]);

	// Cierre suave (X o "Más tarde") -> Reinicia el temporizador para dentro de X min
	const handleLater = () => {
		if (dontShowToday) {
			const today = new Date().toDateString();
			localStorage.setItem("blackbox_support_dismissed", today);
		}
		setIsOpen(false);
		scheduleModal(); // 🔄 Vuelve a armar el reloj de tiempo
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Fondo oscuro esmerilado */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleLater}
						className="absolute inset-0 bg-black/80 backdrop-blur-md"
					/>

					{/* Tarjeta del Modal */}
					<motion.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.9, opacity: 0, y: 20 }}
						transition={{ type: "spring", duration: 0.5 }}
						className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] font-sans"
					>
						{/* Resplandor dorado de fondo */}
						<div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

						{/* Botón Cerrar (X) -> También activa el "Más tarde" */}
						<button
							onClick={handleLater}
							className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-xl bg-zinc-900/50 border border-zinc-800"
							title="Cerrar"
						>
							<X className="w-4 h-4" />
						</button>

						<div className="flex flex-col items-center text-center space-y-4">
							
							{/* ÍCONO DE MONOPLAZA F1 */}
							<div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
								<CarIcon className="w-9 h-9 text-amber-400 animate-pulse" />
							</div>

							{/* BADGE CON ESTILO F1 */}
							<div className="space-y-1">
								<div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
									<Flag className="w-3 h-3 text-amber-500" /> F1 LIVE TELEMETRY
								</div>
								<h3 className="text-2xl font-black uppercase text-white tracking-tight pt-1">
									¿Te sirve la plataforma?
								</h3>
							</div>

							{/* Mensaje amigable */}
							<p className="text-sm text-zinc-300 font-medium leading-relaxed">
								Llevás un buen rato navegando por la app y parece que te gusta. Mantener los servidores de baja latencia cuesta sus mangos. ¡Si te sirve el proyecto, podés bancar la app con una donación!
							</p>

							{/* BOTONES DE DONACIÓN */}
							<div className="w-full space-y-2.5 pt-2">
								<div className="grid grid-cols-2 gap-2.5">
									{/* Opción Cafecito / Buy Me a Coffee */}
									<a
										href="https://buymeacoffee.com/focusfv"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[11px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
									>
										<Coffee className="w-4 h-4" /> Cafecito
									</a>

									{/* Opción PayPal */}
									<a
										href="https://paypal.me/tu_usuario" 
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-[11px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
									>
										💳 PayPal
									</a>
								</div>

								{/* BOTÓN SECUNDARIO "MÁS TARDE" */}
								<button
									onClick={handleLater}
									className="w-full py-2.5 px-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all duration-200"
								>
									Más tarde
								</button>
							</div>

							{/* CHECKBOX DISCRETO ABAJO DE TODO */}
							<div 
								onClick={() => setDontShowToday(!dontShowToday)}
								className="pt-2 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer select-none transition-colors"
							>
								{dontShowToday ? (
									<CheckSquare className="w-4 h-4 text-amber-500" />
								) : (
									<Square className="w-4 h-4 text-zinc-600" />
								)}
								<span>No volver a mostrar por hoy</span>
							</div>

						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}