import { NextResponse } from "next/server";
import startingGridsOverrides from "@/data/startingGrids.json";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const meetingKeyParam = searchParams.get("meeting_key");
		const gpNameParam = searchParams.get("gp_name");
		const meetingKey = meetingKeyParam || "latest";

		let resolvedMeetingKey = meetingKey;
		let meetingLocation = "";
		let meetingName = "";
		let raceSessionKey: number | null = null;
		let qualySessionKey: number | null = null;

		// 1. Obtener información de sesiones del GP desde OpenF1
		try {
			const sessionsRes = await fetch(
				`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`,
				{
					headers: { "User-Agent": "BlackboxF1/4.1" },
					next: { revalidate: 60 },
				}
			);
			if (sessionsRes.ok) {
				const sessions = await sessionsRes.json();
				if (Array.isArray(sessions) && sessions.length > 0) {
					resolvedMeetingKey = String(sessions[0].meeting_key || meetingKey);
					meetingLocation = sessions[0].location || "";
					meetingName = sessions[0].meeting_name || "";

					const raceSession = sessions.find((s: any) => s.session_type === "Race");
					if (raceSession) raceSessionKey = raceSession.session_key;

					const qualySession = sessions.find((s: any) => s.session_type === "Qualifying");
					if (qualySession) qualySessionKey = qualySession.session_key;
				}
			}
		} catch (e) {
			console.warn("[API Starting Grid] Failed to fetch session info:", e);
		}

		// 2. Intentar consultar OpenF1 starting_grid oficial (FIA Document 45 / Final Starting Grid)
		if (raceSessionKey) {
			try {
				const gridRes = await fetch(
					`https://api.openf1.org/v1/starting_grid?session_key=${raceSessionKey}`,
					{
						headers: { "User-Agent": "BlackboxF1/4.1" },
						next: { revalidate: 60 },
					}
				);
				if (gridRes.ok) {
					const gridData = await gridRes.json();
					if (Array.isArray(gridData) && gridData.length > 0) {
						return NextResponse.json({
							available: true,
							source: "openf1_official",
							session_key: raceSessionKey,
							meeting_key: resolvedMeetingKey,
							grid: gridData.map((item: any) => ({
								position: item.position,
								driver_number: String(item.driver_number),
								lap_duration: item.lap_duration,
								penalty: null,
							})),
						});
					}
				}
			} catch (openF1Err) {
				console.warn("[API Starting Grid] OpenF1 starting_grid fetch failed:", openF1Err);
			}
		}

		// 3. Chequear si existe un dataset/override provisional para este GP específico
		const overrides = startingGridsOverrides as Record<string, any>;
		let currentOverride = overrides[resolvedMeetingKey] || (meetingKeyParam ? overrides[meetingKeyParam] : null);

		// Si no se encontró por meeting_key exacto, evaluar buscando por nombre de GP/location
		if (!currentOverride) {
			const targetSearch = (gpNameParam || meetingLocation || meetingName || "").toLowerCase();
			if (targetSearch) {
				for (const [key, val] of Object.entries(overrides)) {
					if (key !== "latest" && val?.gp && targetSearch.includes(val.gp.toLowerCase())) {
						currentOverride = val;
						break;
					}
				}
			}

			// Solo usar "latest" si coincide con la ubicación o nombre activo (NUNCA retroceder a otro GP)
			if (!currentOverride && overrides["latest"]) {
				const latestOverride = overrides["latest"];
				const latestGp = (latestOverride.gp || "").toLowerCase();
				if (!targetSearch || latestGp.includes(targetSearch) || targetSearch.includes(latestGp)) {
					currentOverride = latestOverride;
				}
			}
		}

		if (
			currentOverride &&
			Array.isArray(currentOverride.grid) &&
			currentOverride.grid.length > 0
		) {
			return NextResponse.json({
				available: true,
				source: "provisional_homologation",
				meeting_key: resolvedMeetingKey,
				gp: currentOverride.gp,
				notes: currentOverride.notes,
				grid: currentOverride.grid,
			});
		}

		// 4. Derivación automática resiliente a partir de la Clasificación (Qualifying) de OpenF1
		if (qualySessionKey) {
			try {
				const posRes = await fetch(
					`https://api.openf1.org/v1/position?session_key=${qualySessionKey}`,
					{
						headers: { "User-Agent": "BlackboxF1/4.1" },
						next: { revalidate: 60 },
					}
				);
				if (posRes.ok) {
					const posData = await posRes.json();
					if (Array.isArray(posData) && posData.length > 0) {
						const latestPosByDriver = new Map<string, number>();
						for (const p of posData) {
							if (p.driver_number && p.position) {
								latestPosByDriver.set(String(p.driver_number), p.position);
							}
						}
						const derivedGrid = Array.from(latestPosByDriver.entries())
							.map(([num, pos]) => ({
								position: pos,
								driver_number: num,
								penalty: null,
							}))
							.sort((a, b) => a.position - b.position);

						if (derivedGrid.length > 0) {
							return NextResponse.json({
								available: true,
								source: "qualifying_provisional",
								meeting_key: resolvedMeetingKey,
								gp: meetingLocation || "Gran Premio",
								notes: "Grilla provisional oficial basada en la Clasificación oficial FIA",
								grid: derivedGrid,
							});
						}
					}
				}
			} catch (qErr) {
				console.warn("[API Starting Grid] Failed to derive grid from qualifying:", qErr);
			}
		}

		return NextResponse.json({
			available: false,
			meeting_key: resolvedMeetingKey,
			message: "Grilla oficial en proceso de homologación por los comisarios de la FIA",
		});
	} catch (err: any) {
		return NextResponse.json(
			{ available: false, error: err?.message },
			{ status: 500 }
		);
	}
}
