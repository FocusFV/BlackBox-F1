import { type ReactNode } from "react";
import Script from "next/script";

import "@/styles/globals.css";

import { env } from "@/env";
import EnvScript from "@/env-script";
import OledModeProvider from "@/components/OledModeProvider";
import Navbar from "@/components/Navbar";
import SupportModal from "@/components/SupportModal";
import VersionGuard from "@/components/VersionGuard";
import SecretSimulationHUD from "@/components/SecretSimulationHUD";
import { PwaRegister } from "@/components/PwaRegister";

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

				{/* 📢 Google AdSense - Carga asíncrona sin bloquear telemetría/WebSockets */}
				{env.NEXT_PUBLIC_ADS_ENABLED === "true" && env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
					<Script
						id="google-adsense"
						strategy="afterInteractive"
						src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
						crossOrigin="anonymous"
					/>
				)}
			</head>

			{/* El body queda sobrio y limpio, ya que la Navbar se encarga de su propia estética */}
			<body className="bg-zinc-950 antialiased min-h-screen relative max-w-full overflow-x-hidden">
				<OledModeProvider>
					{/* 🏎️ HUD SECRETO DE SIMULACIÓN FIA (Solo visible con ?test_mode=pitwall2026) */}
					<SecretSimulationHUD />

					{/* La Navbar ahora tiene el patrón encapsulado adentro */}
					<Navbar />
					
					{/* El contenido de todas las pantallas fluye libre abajo de la barra */}
					<main className="w-full max-w-full overflow-x-hidden">
						{children}
					</main>

					{/* 🚀 MONITOR DE ACTUALIZACIONES EN VIVO */}
					<VersionGuard />

					{/* ☕ MODAL DE DONACIÓN / APOYO GLOBAL */}
					<SupportModal />
				</OledModeProvider>

				{/* 📊 Cloudflare Web Analytics (Cookieless, 100% Ilimitado y Preciso para SPA) */}
				<Script
					strategy="afterInteractive"
					src="https://static.cloudflareinsights.com/beacon.min.js"
					data-cf-beacon={JSON.stringify({ token: "1719a9cfc7d848418fbb58f3bbc4f7f3" })}
				/>
				<PwaRegister />
			</body>
		</html>
	);
}