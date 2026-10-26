import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache de 1 hora

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const sessionName = searchParams.get("session") || "FP1"; // "FP1" | "FP2" | "FP3"
	const raceDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

	try {
		// 1. Mapear "FP1" -> "Practice 1", etc.
		const openF1SessionName =
			sessionName === "FP1"
				? "Practice 1"
				: sessionName === "FP2"
				? "Practice 2"
				: sessionName === "FP3"
				? "Practice 3"
				: "Practice 1";

		// 2. Buscar sesiones en la ventana del fin de semana (±4 días de la carrera)
		const targetDate = new Date(raceDate);
		const minDate = new Date(targetDate.getTime() - 4 * 86400000).toISOString().split("T")[0];
		const maxDate = new Date(targetDate.getTime() + 2 * 86400000).toISOString().split("T")[0];

		const sessionsRes = await fetch(
			`https://api.openf1.org/v1/sessions?date_start>=${minDate}&date_start<=${maxDate}`,
			{ next: { revalidate: 3600 } }
		);

		if (!sessionsRes.ok) {
			return NextResponse.json({ error: "Error consultando OpenF1" }, { status: 502 });
		}

		const sessionsData = await sessionsRes.json();
		const matchingSession = sessionsData.find(
			(s: any) => (s.session_name || "").toLowerCase() === openF1SessionName.toLowerCase()
		);

		if (!matchingSession) {
			return NextResponse.json({ error: `Sesión ${sessionName} no encontrada` }, { status: 404 });
		}

		const sessionKey = matchingSession.session_key;

		// 3. Consultar pilotos y vueltas de la sesión
		const [driversRes, lapsRes] = await Promise.all([
			fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, { next: { revalidate: 3600 } }),
			fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&is_pit_out_lap=false`, {
				next: { revalidate: 3600 },
			}),
		]);

		if (!driversRes.ok || !lapsRes.ok) {
			return NextResponse.json({ error: "Error obteniendo datos de vueltas de OpenF1" }, { status: 502 });
		}

		const [drivers, laps] = await Promise.all([driversRes.json(), lapsRes.json()]);

		// 4. Calcular mejor vuelta por piloto
		const bestLaps: Record<string, number> = {};
		for (const l of laps) {
			if (l.lap_duration && (!bestLaps[l.driver_number] || l.lap_duration < bestLaps[l.driver_number])) {
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
				code: r.driver?.name_acronym || "DRV",
				name: r.driver?.full_name || "Piloto",
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
		console.error("Error en API practice:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
