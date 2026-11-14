"use client";

import Image from "next/image";
import { motion } from "motion/react";

import downIcon from "public/icons/chevron-down.svg";

export default function ScrollHint() {
	return (
		<motion.div
			animate={{
				y: [0, 15, 0],
				transition: {
					repeat: Infinity,
					duration: 3.5,
					ease: "backInOut",
				},
			}}
			className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-60"
		>
			<Image alt="down icon" src={downIcon} width={20} height={20} />
		</motion.div>
	);
}
