"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import Image from "next/image";

import sidebarIcon from "public/icons/sidebar.svg";

type Props = {
	className?: string;
	onClick: () => void;
};

export default function SidenavButton({ className, onClick }: Props) {
	return (
		<motion.button
			onClick={onClick}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ scale: 0, opacity: 0 }}
			whileTap={{ scale: 0.9 }}
			// 🏎️ Reducimos el tamaño a algo sutil para la cabecera (size-7)
			className={clsx("flex size-7 cursor-pointer items-center justify-center transition-opacity hover:opacity-80", className)}
		>
			<Image 
				src={sidebarIcon} 
				alt="sidebar icon" 
				loading="eager" 
				// 🪐 FILTRO MAESTRO: Transforma el SVG blanco original a Oro Puro de forma nativa
				style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(50%) saturate(1466%) hue-rotate(3deg) brightness(98%) contrast(93%)' }}
			/>
		</motion.button>
	);
}