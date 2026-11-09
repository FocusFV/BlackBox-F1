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
	{
		source: "/:all*(svg|jpg|jpeg|png|webp|ico|woff|woff2)",
		headers: [
			{
				key: "Cache-Control",
				value: "public, max-age=31536000, immutable",
			},
		],
	},
];

const config: NextConfig = {
	output,
	compress,
	turbopack: {},
	productionBrowserSourceMaps: false,
	env: {
		version: pack.version,
		buildId:
			process.env.VERCEL_GIT_COMMIT_SHA ||
			process.env.VERCEL_DEPLOYMENT_ID ||
			`${pack.version}-${Date.now()}`,
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
	redirects: async () => [
		{
			source: "/panel",
			destination: "/dashboard",
			permanent: true,
		},
	],

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
