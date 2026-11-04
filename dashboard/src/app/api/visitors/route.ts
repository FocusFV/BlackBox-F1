import { NextResponse } from "next/server";

export const revalidate = 60; // Cache de 1 minuto

const BASE_VISITORS = 6123;
let cachedTotal = BASE_VISITORS;
let lastUpdate = 0;

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const shouldHit = searchParams.get("hit") === "1";
	const now = Date.now();

	// Solo consultamos el servicio si es una nueva visita única o pasaron más de 60s
	if (shouldHit || now - lastUpdate > 60000) {
		try {
			const res = await fetch("https://api.visitorbadge.io/api/visitors?path=FocusFV.Blackbox-F1", {
				cache: "no-store",
			});

			if (res.ok) {
				const svg = await res.text();
				const matches = [...svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
				if (matches && matches[1]) {
					const count = parseInt(matches[1].replace(/,/g, ""), 10);
					if (!isNaN(count) && count >= 0) {
						cachedTotal = BASE_VISITORS + count;
						lastUpdate = now;
					}
				}
			}
		} catch (error) {
			console.error("Error obteniendo contador de espectadores:", error);
		}
	}

	return NextResponse.json({
		count: cachedTotal,
		formatted: cachedTotal.toLocaleString("es-AR"),
	});
}
