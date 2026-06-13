import type { NextConfig } from "next";

import pack from "./package.json" with { type: "json" };

import "@/env";

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

	// EL TÚNEL SECRETO PARA LIQUIDAR EL CORS DEL REALTIME EN RENDER
	async rewrites() {
		return [
			{
				source: '/api-proxy/:path*',
				destination: 'https://blackbox-f1-realtime.onrender.com/:path*',
			},
		];
	},

	// Mantenemos tu regla de polling para que el Ctrl + S reaccione al toque en Windows
	webpack: (config, { dev }) => {
		if (dev) {
			config.watchOptions = {
				poll: 1000,
				aggregateTimeout: 300,
			};
		}
		return config;
	},
};

export default config;