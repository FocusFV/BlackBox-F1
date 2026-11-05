import type { Metadata } from "next";

const title = "Blackbox F1 · FocusFV";
const description =
	"Centro de comando y telemetría de Fórmula 1 en tiempo real con tiempos oficiales, radio, telemetría y transmisiones.";

const url = "https://blackboxf1.vercel.app";

export const metadata: Metadata = {
	generator: "Next.js",

	applicationName: "Blackbox F1",

	title,
	description,

	// Favicon local en carpeta public
	icons: "/favicon.png",

	openGraph: {
		title,
		description,
		url,
		type: "website",
		siteName: "Blackbox F1 · FocusFV",
		images: [
			{
				alt: "Blackbox F1 · FocusFV Formula 1 Dashboard",
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
				url: `${url}/og-image.png`,
				alt: "Blackbox F1 · FocusFV Formula 1 Dashboard",
				width: 1200,
				height: 630,
			},
		],
	},

	category: "Sports & Recreation",

	referrer: "strict-origin-when-cross-origin",

	keywords: [
		"Formula 1",
		"Blackbox F1",
		"f1 dashboard",
		"telemetria en vivo",
		"tiempos f1",
		"colapinto alpine",
		"pit wall",
		"f1 live timing"
	],

	creator: "FocusFV",
	publisher: "FocusFV",
	authors: [{ name: "FocusFV", url: "https://blackboxf1.vercel.app" }],

	appleWebApp: {
		capable: true,
		title: "Blackbox F1",
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
