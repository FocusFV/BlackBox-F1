"use client";

import { motion } from "motion/react";
import clsx from "clsx";

type Props = {
	type: "chequered" | "green" | "red" | "yellow";
	size?: "xs" | "sm" | "md" | "lg";
	className?: string;
};

export default function WavingFlag({ type, size = "md", className = "" }: Props) {
	const dims = {
		xs: { width: 18, height: 13, poleH: 17 },
		sm: { width: 36, height: 26, poleH: 34 },
		md: { width: 54, height: 38, poleH: 48 },
		lg: { width: 72, height: 50, poleH: 64 },
	}[size];

	return (
		<div className={clsx("relative inline-flex items-center select-none", className)}>
			{/* Estilos CSS embebidos para la física de ondulación del viento */}
			<style jsx>{`
				@keyframes flutter {
					0% {
						transform: skewY(0deg) scaleY(1);
					}
					25% {
						transform: skewY(3.5deg) scaleY(0.96) translateZ(0);
					}
					50% {
						transform: skewY(-3deg) scaleY(1.03) translateZ(0);
					}
					75% {
						transform: skewY(2deg) scaleY(0.98) translateZ(0);
					}
					100% {
						transform: skewY(0deg) scaleY(1);
					}
				}

				@keyframes rippleShine {
					0% {
						transform: translateX(-100%);
					}
					100% {
						transform: translateX(100%);
					}
				}

				.flag-cloth {
					transform-origin: left center;
					animation: flutter 2s ease-in-out infinite;
					filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
				}

				.flag-sheen {
					animation: rippleShine 2s linear infinite;
				}
			`}</style>

			<svg
				width={dims.width + 10}
				height={dims.poleH + 4}
				viewBox={`0 0 ${dims.width + 10} ${dims.poleH + 4}`}
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="overflow-visible"
			>
				{/* Mástil plateado metálico */}
				<line
					x1="4"
					y1="2"
					x2="4"
					y2={dims.poleH + 2}
					stroke="url(#pole-metal)"
					strokeWidth="3"
					strokeLinecap="round"
				/>
				{/* Pomo esférico superior del mástil */}
				<circle cx="4" cy="3" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />

				{/* Paño de la bandera ondeando */}
				<g transform="translate(6, 4)" className="flag-cloth">
					{type === "chequered" && (
						<g>
							{/* Fondo base con clip-path redondeado */}
							<clipPath id="flag-clip">
								<rect x="0" y="0" width={dims.width} height={dims.height} rx="3" />
							</clipPath>

							<g clipPath="url(#flag-clip)">
								{/* Cuadrícula de 6 columnas x 4 filas de cuadros */}
								{Array.from({ length: 4 }).map((_, row) =>
									Array.from({ length: 6 }).map((_, col) => {
										const isWhite = (row + col) % 2 === 0;
										const cellW = dims.width / 6;
										const cellH = dims.height / 4;
										return (
											<rect
												key={`cq.${row}.${col}`}
												x={col * cellW}
												y={row * cellH}
												width={cellW + 0.5}
												height={cellH + 0.5}
												fill={isWhite ? "#FFFFFF" : "#18181B"}
											/>
										);
									})
								)}

								{/* Falso pliegue de viento / sombra y brillo translúcido en movimiento */}
								<rect
									x="0"
									y="0"
									width={dims.width}
									height={dims.height}
									fill="url(#wave-gradient)"
									opacity="0.5"
								/>
							</g>
						</g>
					)}

					{type === "green" && (
						<g>
							<clipPath id="green-flag-clip">
								<rect x="0" y="0" width={dims.width} height={dims.height} rx="3" />
							</clipPath>

							<g clipPath="url(#green-flag-clip)">
								{/* Fondo verde esmeralda neón */}
								<rect x="0" y="0" width={dims.width} height={dims.height} fill="url(#green-fabric)" />

								{/* Sombra de ondulación de seda */}
								<rect
									x="0"
									y="0"
									width={dims.width}
									height={dims.height}
									fill="url(#wave-gradient)"
									opacity="0.4"
								/>
							</g>
						</g>
					)}

					{type === "yellow" && (
						<g>
							<clipPath id="yellow-flag-clip">
								<rect x="0" y="0" width={dims.width} height={dims.height} rx="3" />
							</clipPath>

							<g clipPath="url(#yellow-flag-clip)">
								<rect x="0" y="0" width={dims.width} height={dims.height} fill="#eab308" />
								<rect
									x="0"
									y="0"
									width={dims.width}
									height={dims.height}
									fill="url(#wave-gradient)"
									opacity="0.4"
								/>
							</g>
						</g>
					)}

					{type === "red" && (
						<g>
							<clipPath id="red-flag-clip">
								<rect x="0" y="0" width={dims.width} height={dims.height} rx="3" />
							</clipPath>

							<g clipPath="url(#red-flag-clip)">
								<rect x="0" y="0" width={dims.width} height={dims.height} fill="#dc2626" />
								<rect
									x="0"
									y="0"
									width={dims.width}
									height={dims.height}
									fill="url(#wave-gradient)"
									opacity="0.4"
								/>
							</g>
						</g>
					)}
				</g>

				{/* Gradientes y efectos de luz */}
				<defs>
					<linearGradient id="pole-metal" x1="0" y1="0" x2="8" y2="0" gradientUnits="userSpaceOnUse">
						<stop stopColor="#71717a" />
						<stop offset="0.5" stopColor="#e4e4e7" />
						<stop offset="1" stopColor="#3f3f46" />
					</linearGradient>

					<linearGradient id="green-fabric" x1="0" y1="0" x2="1" y2="1">
						<stop stopColor="#34d399" />
						<stop offset="0.5" stopColor="#10b981" />
						<stop offset="1" stopColor="#047857" />
					</linearGradient>

					<linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
						<stop offset="25%" stopColor="#ffffff" stopOpacity="0.3" />
						<stop offset="50%" stopColor="#000000" stopOpacity="0.35" />
						<stop offset="75%" stopColor="#ffffff" stopOpacity="0.25" />
						<stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
}
