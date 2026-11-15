import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const targetUrl = process.env.NEXT_PUBLIC_LIVE_URL || "https://blackbox-f1-realtime-docker.onrender.com";
		const res = await fetch(`${targetUrl}/api/current`, {
			cache: "no-store",
			headers: {
				Accept: "application/json",
			},
		});

		if (!res.ok) {
			return NextResponse.json({ error: "Failed to fetch from backend" }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json(data, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (error) {
		console.error("[api/current proxy] error:", error);
		return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
	}
}
