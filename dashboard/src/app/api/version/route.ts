import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	const currentVersion =
		process.env.buildId ||
		process.env.VERCEL_GIT_COMMIT_SHA ||
		process.env.VERCEL_DEPLOYMENT_ID ||
		process.env.version ||
		"1.0.0";

	return NextResponse.json(
		{
			version: currentVersion,
			timestamp: Date.now(),
		},
		{
			headers: {
				"Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		}
	);
}
