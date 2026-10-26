"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckSquare, Square, Heart, Coffee } from "lucide-react";

function PayPalIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} viewBox="0 0 24 24" fill="currentColor">
			<path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.784.784 0 0 1 .773-.655h6.643c3.082 0 5.485 1.258 5.485 4.39 0 2.686-1.745 4.793-4.333 5.428-.488.119-.884.181-1.378.181H9.86l-1.42 7.643a.643.643 0 0 1-.632.536l-.732.094zm10.748-12.79c-.067-.323-.178-.636-.334-.932-.452-.862-1.328-1.524-2.52-1.895-.873-.271-1.954-.374-3.238-.374H7.957a.784.784 0 0 0-.773.655L4.975 19.34h3.693l1.096-5.903a.64.64 0 0 1 .632-.536h1.737c3.342 0 5.96-1.358 6.726-5.283.351-1.796.066-3.081-1.035-3.971z" />
		</svg>
	);
}

export default function SupportModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [dontShowToday, setDontShowToday] = useState(false);

	const TIMER_DELAY = 30 * 60 * 1000; // 30 minutos

	const scheduleModal = useCallback(() => {
		const modalDismissed = localStorage.getItem("blackbox_support_dismissed");
		const today = new Date().toDateString();

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

	const handleLater = () => {
		if (dontShowToday) {
			const today = new Date().toDateString();
			localStorage.setItem("blackbox_support_dismissed", today);
		}
		setIsOpen(false);
		scheduleModal();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleLater}
						className="absolute inset-0 bg-black/85 backdrop-blur-md"
					/>

					<motion.div
						initial={{ scale: 0.92, opacity: 0, y: 15 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.92, opacity: 0, y: 15 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl font-sans text-white select-none"
					>
						{/* Barra decorativa superior estilo Pit-Wall */}
						<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

						{/* Botón Cerrar */}
						<button
							onClick={handleLater}
							className="absolute right-4 top-4 p-1.5 text-zinc-400 hover:text-white transition-colors rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
							title="Cerrar"
						>
							<X className="w-4 h-4" />
						</button>

						<div className="flex flex-col items-center text-center space-y-4 pt-1">
							{/* Ícono sobrio de telemetría/comunidad */}
							<div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
								<Heart className="w-6 h-6 fill-amber-500/20 text-amber-400" />
							</div>

							<div className="space-y-1">
								<span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
									BlackBox F1 · Pit-Wall
								</span>
								<h3 className="text-xl font-black uppercase text-zinc-100 tracking-tight">
									Apoyá el Proyecto
								</h3>
							</div>

							<p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-xs">
								Desarrollamos esta plataforma en vivo de forma independiente y sin publicidad invasiva. Si disfrutás de la telemetría y las transmisiones durante los Grandes Premios, tu colaboración nos ayuda a mantener los servidores activos.
							</p>

							{/* Botones de Donación */}
							<div className="w-full space-y-2 pt-1">
								<div className="grid grid-cols-2 gap-2.5">
									{/* Cafecito / Buy Me a Coffee */}
									<a
										href="https://buymeacoffee.com/focusfv"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-black uppercase tracking-wider text-[11px] shadow-md hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer"
									>
										<Coffee className="w-4 h-4" />
										<span>Cafecito</span>
									</a>

									{/* PayPal con link directo */}
									<a
										href="https://paypal.me/fvillalba4423"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-mono font-black uppercase tracking-wider text-[11px] shadow-md hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer"
									>
										<PayPalIcon className="w-4 h-4 fill-white" />
										<span>PayPal</span>
									</a>
								</div>

								{/* Botón Cerrar / Más Tarde */}
								<button
									onClick={handleLater}
									className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
								>
									Continuar a la app
								</button>
							</div>

							{/* Checkbox No volver a mostrar por hoy */}
							<div
								onClick={() => setDontShowToday(!dontShowToday)}
								className="pt-1 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs font-sans cursor-pointer select-none transition-colors"
							>
								{dontShowToday ? (
									<CheckSquare className="w-3.5 h-3.5 text-amber-500" />
								) : (
									<Square className="w-3.5 h-3.5 text-zinc-600" />
								)}
								<span className="text-[11px]">No volver a mostrar por hoy</span>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
