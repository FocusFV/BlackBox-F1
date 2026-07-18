import { type ReactNode } from "react";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";

import { env } from "@/env";
import EnvScript from "@/env-script";
import OledModeProvider from "@/components/OledModeProvider";
import Navbar from "@/components/Navbar";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

export { metadata } from "@/metadata";
export { viewport } from "@/viewport";

type Props = Readonly<{
	children: ReactNode;
}>;

export default function RootLayout({ children }: Props) {
	return (
		<html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} font-sans text-white`}>
			<head>
				<EnvScript />

				{env.TRACKING_ID && env.TRACKING_URL && (
					<>
						<Script strategy="afterInteractive" data-site-id={env.TRACKING_ID} src={env.TRACKING_URL} />
					</>
				)}
			</head>

			{/* El body queda sobrio y limpio, ya que la Navbar se encarga de su propia estética */}
			<body className="bg-zinc-950 antialiased min-h-screen relative">
				<OledModeProvider>
					{/* La Navbar ahora tiene el patrón encapsulado adentro */}
					<Navbar />
					
					{/* El contenido de todas las pantallas fluye libre abajo de la barra */}
					<main className="w-full">
						{children}
					</main>
				</OledModeProvider>

				<Analytics />
			</body>
		</html>
	);
}