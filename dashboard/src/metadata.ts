import type { Metadata } from "next";

const title = "FocusFV | F1 Live Dashboard";
const description =
	"Telemetría y tiempos en vivo de Fórmula 1 en tiempo real. Seguí las posiciones, neumáticos, brechas, vueltas, radios de equipo y más.";

const url = "https://blackbox-f1.vercel.app";

export const metadata: Metadata = {
	generator: "Next.js",

	applicationName: title,

	title,
	description,

	// Usamos el favicon local de tu carpeta public
	icons: "/favicon.png",

	openGraph: {
		title,
		description,
		url,
		type: "website",
		siteName: "FocusFV F1 Dashboard",
		images: [
			{
				alt: "FocusFV Formula 1 Dashboard",
				url: `${url}/og-image.png`,
				width: 1200,
				height: 630,
			},
		],
	},

	twitter: {
		site: "@FocusFV",
		title,
		description,
		creator: "@FocusFV",
		card: "summary_large_image",
		images: [
			{
				url: `${url}/og-image.png`, // Usamos la misma para twitter
				alt: "FocusFV Formula 1 Dashboard",
				width: 1200,
				height: 630,
			},
		],
	},

	category: "Sports & Recreation",

	referrer: "strict-origin-when-cross-origin",

	keywords: ["Formula 1", "f1 dashboard", "telemetria en vivo", "tiempos f1", "colapinto alpine"],

	creator: "FocusFV",
	publisher: "FocusFV",
	authors: [{ name: "FocusFV", url: "https://blackbox-f1.vercel.app" }],

	appleWebApp: {
		capable: true,
		title: "FocusFV F1",
		statusBarStyle: "black-translucent",
	},

	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},

	metadataBase: new URL(url),

	alternates: {
		canonical: url,
	},

	manifest: "/manifest.json",
};