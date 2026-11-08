import { NextResponse } from "next/server";
import { sanitizeF1DriverNames, translateFiaMessage } from "@/lib/raceControlTranslations";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const text = searchParams.get("text");

	if (!text) {
		return NextResponse.json({ error: "Parámetro text requerido" }, { status: 400 });
	}

	// 1. Primero intentar con nuestro motor local oficial FIA
	const local = translateFiaMessage(text);
	const hasUnresolvedEnglish = /\b(turn|incident|investigated|stewards|driver|limits|penalty|noted|deleted)\b/i.test(local);

	if (!hasUnresolvedEnglish) {
		return NextResponse.json({
			success: true,
			source: "rules",
			translated: local,
		});
	}

	// 2. Si hay texto no contemplado, consultar a Google Translate desde el SERVIDOR (sin problemas de CORS)
	try {
		const res = await fetch(
			"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=" +
				encodeURIComponent(text),
			{ headers: { "User-Agent": "Mozilla/5.0" } }
		);

		if (res.ok) {
			const data = await res.json();
			if (data && data[0] && data[0][0] && data[0][0][0]) {
				const sanitized = sanitizeF1DriverNames(translateFiaMessage(data[0][0][0]));
				return NextResponse.json({
					success: true,
					source: "google",
					translated: sanitized,
				});
			}
		}
	} catch (e) {
		console.error("Error en API de traducción de servidor:", e);
	}

	return NextResponse.json({
		success: true,
		source: "fallback",
		translated: local,
	});
}
