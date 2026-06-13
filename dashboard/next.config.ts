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