import type { NextConfig } from "next";

import pack from "./package.json" with { type: "json" };

import "@/env";

// Forzamos el modo standalone para que Docker encuentre la carpeta al compilar
const output = "standalone";
const compress = process.env.NEXT_NO_COMPRESS === "1";

const frameDisableHeaders = [
	{
		source: "/(.*)",
		headers: [
			{
				type: "header",
				key: "X-Frame-Options",
				value: "SAMEORIGIN",
			},
			{
				type: "header",
				key: "Content-Security-Policy",
				value: "frame-ancestors 'self';",
			},
		],
	},
];

const config: NextConfig = {
	output,
	compress,
	env: {
		version: pack.version,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**formula1.com",
				port: "",
			},
		],
	},
	headers: async () => frameDisableHeaders,

	// --- INYECTAMOS ESTO PARA ARREGLAR EL CTRL + S EN WINDOWS ---
	webpack: (config, { dev }) => {
		if (dev) {
			config.watchOptions = {
				poll: 1000,           // Revisa cambios de Windows cada 1 segundo obligatoriamente
				aggregateTimeout: 300, // Nos da un changüí de 300ms al guardar para procesar todo junto
			};
		}
		return config;
	},
};

export default config;