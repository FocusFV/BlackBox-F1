import { NextResponse } from "next/server";
import brazilFallbackData from "@/lib/brazil2026_practice_fallback.json";

export const revalidate = 1800; // Cache de 30 minutos

// 🏎️ Caché en memoria para evitar rate-limits de OpenF1 (3 req/segundo)
const sessionResultsCache: Record<string, { timestamp: number; data: any }> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de validez en memoria

const brazilFallback = brazilFallbackData as Record<string, any[]>;

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const sessionName = searchParams.get("session") || "FP1"; // "FP1" | "FP2" | "FP3" | "QUALY" | "RACE" | "SPRINT" | "SQ"
	const meetingKey = searchParams.get("meeting_key") || "latest";
	const raceDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

	const cacheKey = `${meetingKey}_${sessionName}`;

	// 1. Si ya tenemos los resultados en caché de memoria reciente, devolver inmediatamente
	if (
		sessionResultsCache[cacheKey] &&
		Date.now() - sessionResultsCache[cacheKey].timestamp < CACHE_TTL_MS &&
		Array.isArray(sessionResultsCache[cacheKey].data?.results) &&
		sessionResultsCache[cacheKey].data.results.length > 0
	) {
		return NextResponse.json(sessionResultsCache[cacheKey].data);
	}

	try {
		// 2. Obtener sesiones de OpenF1 para el fin de semana objetivo
		let sessionsData: any[] = [];
		try {
			const sessionsRes = await fetch(
				`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`,
				{
					headers: {
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BlackboxF1/4.1",
						"Accept": "application/json",
					},
					next: { revalidate: 1800 },
				}
			);
			if (sessionsRes.ok) {
				const json = await sessionsRes.json();
				if (Array.isArray(json)) sessionsData = json;
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
					{
						headers: {
							"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BlackboxF1/4.1",
							"Accept": "application/json",
						},
						next: { revalidate: 1800 },
					}
				);
				if (dateRes.ok) {
					const json = await dateRes.json();
					if (Array.isArray(json)) sessionsData = json;
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
			// Si OpenF1 no tiene la sesión o está rate-limited, recurrir a los datos oficiales de respaldo de Brasil 2026
			if (brazilFallback[sessionName]) {
				const fb = {
					session: sessionName,
					circuit: "Interlagos",
					total: brazilFallback[sessionName].length,
					results: brazilFallback[sessionName],
				};
				sessionResultsCache[cacheKey] = { timestamp: Date.now(), data: fb };
				return NextResponse.json(fb);
			}
			return NextResponse.json({ error: `Sesión ${sessionName} no encontrada` }, { status: 404 });
		}

		const sessionKey = matchingSession.session_key;

		// 3. Si es CARRERA o SPRINT, procesamos por posiciones finales e intervalos
		if (sessionName === "RACE" || sessionName === "SPRINT") {
			const [driversRes, posRes, intRes] = await Promise.all([
				fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, {
					headers: { "User-Agent": "BlackboxF1/4.1" },
					next: { revalidate: 1800 },
				}).catch(() => null),
				fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, {
					headers: { "User-Agent": "BlackboxF1/4.1" },
					next: { revalidate: 1800 },
				}).catch(() => null),
				fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`, {
					headers: { "User-Agent": "BlackboxF1/4.1" },
					next: { revalidate: 1800 },
				}).catch(() => null),
			]);

			if (!driversRes?.ok || !posRes?.ok) {
				if (brazilFallback[sessionName]) {
					const fb = {
						session: sessionName,
						circuit: matchingSession.circuit_short_name || "Interlagos",
						total: brazilFallback[sessionName].length,
						results: brazilFallback[sessionName],
					};
					sessionResultsCache[cacheKey] = { timestamp: Date.now(), data: fb };
					return NextResponse.json(fb);
				}
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

			const payload = {
				session: sessionName,
				circuit: matchingSession.circuit_short_name,
				total: results.length,
				results,
			};

			sessionResultsCache[cacheKey] = { timestamp: Date.now(), data: payload };
			return NextResponse.json(payload);
		}

		// 4. Para PRÁCTICAS y CLASIFICACIÓN (FP1, FP2, FP3, QUALY, SQ), calculamos mejor vuelta por piloto
		const [driversRes, lapsRes] = await Promise.all([
			fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`, {
				headers: { "User-Agent": "BlackboxF1/4.1" },
				next: { revalidate: 1800 },
			}).catch(() => null),
			fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&is_pit_out_lap=false`, {
				headers: { "User-Agent": "BlackboxF1/4.1" },
				next: { revalidate: 1800 },
			}).catch(() => null),
		]);

		if (!driversRes?.ok || !lapsRes?.ok) {
			// Si OpenF1 devuelve 429 (Rate limit) o 500, usamos de inmediato el respaldo oficial
			if (brazilFallback[sessionName]) {
				const fb = {
					session: sessionName,
					circuit: matchingSession.circuit_short_name || "Interlagos",
					total: brazilFallback[sessionName].length,
					results: brazilFallback[sessionName],
				};
				sessionResultsCache[cacheKey] = { timestamp: Date.now(), data: fb };
				return NextResponse.json(fb);
			}
			return NextResponse.json({ error: "Error obteniendo datos de vueltas de OpenF1" }, { status: 502 });
		}

		const [drivers, laps] = await Promise.all([driversRes.json(), lapsRes.json()]);

		if (!Array.isArray(drivers) || !Array.isArray(laps)) {
			if (brazilFallback[sessionName]) {
				const fb = {
					session: sessionName,
					circuit: matchingSession.circuit_short_name || "Interlagos",
					total: brazilFallback[sessionName].length,
					results: brazilFallback[sessionName],
				};
				sessionResultsCache[cacheKey] = { timestamp: Date.now(), data: fb };
				return NextResponse.json(fb);
			}
			return NextResponse.json({ error: "Respuesta inválida de OpenF1" }, { status: 502 });
		}

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

		const finalResults =
			results.length > 0
				? results
				: brazilFallback[sessionName] || [];

		const payload = {
			session: sessionName,
			circuit: matchingSession.circuit_short_name || "Interlagos",
			total: finalResults.length,
			results: finalResults,
		};

		sessionResultsCache[cacheKey] = { timestamp: Date.now(), data: payload };
		return NextResponse.json(payload);
	} catch (error: any) {
		console.error("Error en API practice/session:", error);
		if (brazilFallback[sessionName]) {
			const fb = {
				session: sessionName,
				circuit: "Interlagos",
				total: brazilFallback[sessionName].length,
				results: brazilFallback[sessionName],
			};
			return NextResponse.json(fb);
		}
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
