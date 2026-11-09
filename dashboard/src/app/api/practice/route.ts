import { NextResponse } from "next/server";

export const revalidate = 1800; // Cache de 30 minutos

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const sessionName = searchParams.get("session") || "FP1"; // "FP1" | "FP2" | "FP3" | "QUALY" | "RACE" | "SPRINT" | "SQ"
	const meetingKey = searchParams.get("meeting_key") || "latest";
	const raceDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

	try {
		// 1. Obtener sesiones de OpenF1 para el fin de semana objetivo
		let sessionsData: any[] = [];
		try {
			const sessionsRes = await fetch(
				`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`,
				{ next: { revalidate: 1800 } }
			);
			if (sessionsRes.ok) {
				sessionsData = await sessionsRes.json();
			}
		} catch (e) {
			console.warn("[API Practice] Error con meeting_key:", e);
		}

		// Fallback por rango de fechas si meeting_key no arrojó resultados
		if (!Array.isArray(sessionsData) || sessionsData.length === 0) {
			try {
				const targetDate = new Date(raceDate);
				const minDate = new Date(targetDate.getTime() - 7 * 86400000).toISOString().split("T")[0];
				const maxDate = new Date(targetDate.getTime() + 4 * 86400000).toISOString().split("T")[0];
				const dateRes = await fetch(
					`https://api.openf1.org/v1/sessions?date_start>=${minDate}&date_start<=${maxDate}`,
					{ next: { revalidate: 1800 } }
				);
				if (dateRes.ok) {
					sessionsData = await dateRes.json();
				}
			} catch (e) {
				console.warn("[API Practice] Error con date range:", e);
			}
		}

		const matchingSession = Array.isArray(sessionsData)
			? sessionsData.find((s: any) => {
					const sName = (s.session_name || "").toLowerCase();
					const sType = (s.session_type || "").toLowerCase();
					if (sessionName === "FP1") return sName.includes("practice 1") || sName.includes("fp1");
					if (sessionName === "FP2") return sName.includes("practice 2") || sName.includes("fp2");
					if (sessionName === "FP3") return sName.includes("practice 3") || sName.includes("fp3");
					if (sessionName === "QUALY") return sName === "qualifying" || sType === "qualifying";
					if (sessionName === "SQ") return sName.includes("shootout") || sName.includes("sprint qual") || sType.includes("qualifying");
					if (sessionName === "SPRINT") return sName === "sprint" || sType === "sprint";
					if (sessionName === "RACE") return sName === "race" || sType === "race";
					return false;
			  })
			: null;

		if (!matchingSession) {
			return NextResponse.json({ error: `Sesión ${sessionName} no encontrada` }, { status: 404 });
		}

		const sessionKey = matchingSession.session_key;

		// 2. Si es CARRERA o SPRINT, procesamos por posiciones finales e intervalos
		if (sessionName === "RACE" || sessionName === "SPRINT") {
			const [driversRes, posRes, intRes] = await Promise.all([
				fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { next: { revalidate: 1800 } }),
				fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { next: { revalidate: 1800 } }),
				fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`, { next: { revalidate: 1800 } }).catch(() => null),
			]);

			if (!driversRes.ok || !posRes.ok) {
				return NextResponse.json({ error: "Error obteniendo posiciones de OpenF1" }, { status: 502 });
			}

			const drivers: any[] = await driversRes.json();
			const pos: any[] = await posRes.json();
			const intervals: any[] = intRes && intRes.ok ? await intRes.json() : [];

			const driverMap: Record<string, any> = {};
			for (const d of drivers) driverMap[d.driver_number] = d;

			const lastPos: Record<string, any> = {};
			for (const p of pos) lastPos[p.driver_number] = p;

			const lastInt: Record<string, any> = {};
			for (const i of intervals) lastInt[i.driver_number] = i;

			const f1Points = sessionName === "RACE"
				? [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
				: [8, 7, 6, 5, 4, 3, 2, 1];

			const ranked = Object.values(lastPos).sort((a, b) => a.position - b.position);

			const results = ranked.map((p) => {
				const d = driverMap[p.driver_number];
				const intr = lastInt[p.driver_number];
				const isP1 = p.position === 1;

				let gap = "";
				if (isP1) {
					gap = "FINAL";
				} else if (intr && intr.gap_to_leader !== undefined && intr.gap_to_leader !== null) {
					const g = intr.gap_to_leader;
					gap = typeof g === "number" ? `+${g.toFixed(3)}s` : String(g);
				} else {
					gap = "INTERVAL";
				}

				const pts = p.position <= f1Points.length ? `+${f1Points[p.position - 1]} PTS` : "";

				return {
					pos: String(p.position),
					number: String(p.driver_number),
					code: d?.name_acronym || `P${p.driver_number}`,
					name: d?.full_name || `Piloto #${p.driver_number}`,
					team: d?.team_name || "Equipo",
					constructorId: (d?.team_name || "").toLowerCase().replaceAll(" ", "-"),
					gapTime: gap,
					points: pts,
					isDNF: false,
				};
			});

			return NextResponse.json({
				session: sessionName,
				circuit: matchingSession.circuit_short_name,
				total: results.length,
				results,
			});
		}

		// 3. Para PRÁCTICAS y CLASIFICACIÓN (FP1, FP2, FP3, QUALY, SQ), calculamos mejor vuelta por piloto
		const [driversRes, lapsRes] = await Promise.all([
			fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { next: { revalidate: 1800 } }),
			fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&is_pit_out_lap=false`, {
				next: { revalidate: 1800 },
			}),
		]);

		if (!driversRes.ok || !lapsRes.ok) {
			return NextResponse.json({ error: "Error obteniendo datos de vueltas de OpenF1" }, { status: 502 });
		}

		const [drivers, laps] = await Promise.all([driversRes.json(), lapsRes.json()]);

		const bestLaps: Record<string, number> = {};
		for (const l of laps) {
			if (l.lap_duration && l.lap_duration > 55 && l.lap_duration < 240 && (!bestLaps[l.driver_number] || l.lap_duration < bestLaps[l.driver_number])) {
				bestLaps[l.driver_number] = l.lap_duration;
			}
		}

		const driverMap: Record<string, any> = {};
		for (const d of drivers) {
			driverMap[d.driver_number] = d;
		}

		const ranked = Object.entries(bestLaps)
			.map(([num, dur]) => ({
				number: String(num),
				duration: dur,
				driver: driverMap[num],
			}))
			.sort((a, b) => a.duration - b.duration);

		const p1Time = ranked[0]?.duration || 0;

		const results = ranked.map((r, idx) => {
			const mins = Math.floor(r.duration / 60);
			const secs = (r.duration % 60).toFixed(3);
			const timeFormatted = `${mins}:${Number(secs) < 10 ? "0" : ""}${secs}`;
			const gap = idx === 0 ? timeFormatted : `+${(r.duration - p1Time).toFixed(3)}s`;

			return {
				pos: String(idx + 1),
				number: r.number,
				code: r.driver?.name_acronym || `P${r.number}`,
				name: r.driver?.full_name || `Piloto #${r.number}`,
				team: r.driver?.team_name || "Equipo",
				constructorId: (r.driver?.team_name || "").toLowerCase().replaceAll(" ", "-"),
				gapTime: gap,
				points: "",
				isDNF: false,
			};
		});

		return NextResponse.json({
			session: sessionName,
			circuit: matchingSession.circuit_short_name,
			total: results.length,
			results,
		});
	} catch (error: any) {
		console.error("Error en API practice/session:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
