import type { NextConfig } from "next";

import pack from "./package.json" with { type: "json" };

import "@/env";

const output = "standalone";
const compress = process.env.NEXT_NO_COMPRESS === "1";

const securityAndRobotsHeaders = [
	{
		source: "/(.*)",
		headers: [
			{
				key: "X-Frame-Options",
				value: "SAMEORIGIN",
			},
			{
				key: "Content-Security-Policy",
				value: "frame-ancestors 'self';",
			},
		],
	},
	{
		source: "/streams(.*)",
		headers: [
			{
				key: "X-Robots-Tag",
				value: "noindex, nofollow, noarchive, nosnippet",
			},
		],
	},
];

const config: NextConfig = {
	output,
	compress,
	productionBrowserSourceMaps: false,
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
	headers: async () => securityAndRobotsHeaders,

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
