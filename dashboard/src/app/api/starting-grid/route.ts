import { NextResponse } from "next/server";
import startingGridsOverrides from "@/data/startingGrids.json";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const meetingKey = searchParams.get("meeting_key") || "latest";

		// 1. Intentar consultar OpenF1 starting_grid oficial
		try {
			const sessionsRes = await fetch(
				`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}&session_type=Race`,
				{ next: { revalidate: 60 } }
			);
			if (sessionsRes.ok) {
				const sessions = await sessionsRes.json();
				const raceSession =
					Array.isArray(sessions) && sessions.length > 0
						? sessions[sessions.length - 1]
						: null;
				const sessionKey = raceSession?.session_key;

				if (sessionKey) {
					const gridRes = await fetch(
						`https://api.openf1.org/v1/starting_grid?session_key=${sessionKey}`,
						{ next: { revalidate: 60 } }
					);
					if (gridRes.ok) {
						const gridData = await gridRes.json();
						if (Array.isArray(gridData) && gridData.length > 0) {
							return NextResponse.json({
								available: true,
								source: "openf1",
								session_key: sessionKey,
								grid: gridData.map((item: any) => ({
									position: item.position,
									driver_number: String(item.driver_number),
									lap_duration: item.lap_duration,
								})),
							});
						}
					}
				}
			}
		} catch (openF1Err) {
			console.warn("[API Starting Grid] OpenF1 fetch failed:", openF1Err);
		}

		// 2. Si OpenF1 aún no tiene la grilla oficial porque los comisarios de la FIA están deliberando,
		// chequear si existe un dataset/override provisional para este GP
		const currentOverride =
			(startingGridsOverrides as any)?.[meetingKey] ||
			(startingGridsOverrides as any)?.["latest"];

		if (
			currentOverride &&
			Array.isArray(currentOverride.grid) &&
			currentOverride.grid.length > 0
		) {
			return NextResponse.json({
				available: true,
				source: "provisional_homologation",
				gp: currentOverride.gp,
				notes: currentOverride.notes,
				grid: currentOverride.grid,
			});
		}

		return NextResponse.json({
			available: false,
			message: "Grilla oficial en proceso de homologación por los comisarios de la FIA",
		});
	} catch (err: any) {
		return NextResponse.json(
			{ available: false, error: err?.message },
			{ status: 500 }
		);
	}
}
