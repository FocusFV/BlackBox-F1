"use client";

import { motion } from "motion/react";
import clsx from "clsx";

type Props = {
	className?: string;
	title?: string;
};

export default function ChequeredFlagStrip({ className = "", title = "Bandera a cuadros (Finalizado)" }: Props) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.75, x: 4 }}
			animate={{ opacity: 1, scale: 1, x: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className={clsx(
				"relative flex items-center justify-center overflow-hidden rounded-[3px] border border-zinc-700/80 bg-zinc-950 shadow-[0_0_8px_rgba(255,255,255,0.12)] shrink-0 select-none",
				className
			)}
			style={{ width: "16px", height: "28px" }}
			title={title}
		>
			<svg
				viewBox="0 0 16 28"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="h-full w-full"
			>
				{/* 🏁 Patrón oficial F1 TV Broadcast: 2 columnas x 5 filas */}
				{/* Fila 1 */}
				<rect x="0" y="0" width="8" height="5.6" fill="#FFFFFF" />
				<rect x="8" y="0" width="8" height="5.6" fill="#18181B" />

				{/* Fila 2 */}
				<rect x="0" y="5.6" width="8" height="5.6" fill="#18181B" />
				<rect x="8" y="5.6" width="8" height="5.6" fill="#FFFFFF" />

				{/* Fila 3 */}
				<rect x="0" y="11.2" width="8" height="5.6" fill="#FFFFFF" />
				<rect x="8" y="11.2" width="8" height="5.6" fill="#18181B" />

				{/* Fila 4 */}
				<rect x="0" y="16.8" width="8" height="5.6" fill="#18181B" />
				<rect x="8" y="16.8" width="8" height="5.6" fill="#FFFFFF" />

				{/* Fila 5 */}
				<rect x="0" y="22.4" width="8" height="5.6" fill="#FFFFFF" />
				<rect x="8" y="22.4" width="8" height="5.6" fill="#18181B" />

				{/* Efecto Glossy Broadcast de cristal */}
				<rect x="0" y="0" width="16" height="28" fill="url(#flag-shine)" opacity="0.35" />
				<defs>
					<linearGradient id="flag-shine" x1="0" y1="0" x2="16" y2="28" gradientUnits="userSpaceOnUse">
						<stop stopColor="#ffffff" stopOpacity="0.4" />
						<stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
						<stop offset="1" stopColor="#000000" stopOpacity="0.5" />
					</linearGradient>
				</defs>
			</svg>
		</motion.div>
	);
}
