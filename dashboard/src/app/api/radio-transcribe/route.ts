import { NextResponse } from "next/server";

// Caché en memoria para evitar llamadas redundantes de los mismos audios
const transcriptionCache = new Map<string, { original: string; translated: string }>();

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const audioUrl = searchParams.get("url");

	if (!audioUrl) {
		return NextResponse.json({ error: "Falta el parámetro url" }, { status: 400 });
	}

	// 1. Verificar si ya fue transcripto previamente
	if (transcriptionCache.has(audioUrl)) {
		return NextResponse.json({
			success: true,
			cached: true,
			data: transcriptionCache.get(audioUrl),
		});
	}

	const apiKey = process.env.GEMINI_API_KEY;

	// Si no hay API key configurada en las variables de entorno de Vercel/Render
	if (!apiKey) {
		return NextResponse.json({
			success: false,
			message: "Subtítulos automáticos disponibles configurando GEMINI_API_KEY.",
		});
	}

	try {
		// 2. Descargar el archivo .mp3 de la FOM
		const audioRes = await fetch(audioUrl);
		if (!audioRes.ok) {
			return NextResponse.json(
				{ error: "No se pudo descargar el audio de la radio" },
				{ status: 502 }
			);
		}

		const arrayBuffer = await audioRes.arrayBuffer();
		const base64Audio = Buffer.from(arrayBuffer).toString("base64");

		// 3. Procesar transcripción y traducción con Gemini Flash (gratis)
		const geminiRes = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{
									text: "Escucha este audio de radio de equipo de Fórmula 1. Transcribe lo que dice el piloto o ingeniero en inglés original y tradúcelo al español neutro. Responde ÚNICAMENTE un JSON con esta estructura exacta: {\"original\": \"texto en ingles\", \"translated\": \"texto en español\"}",
								},
								{
									inlineData: {
										mimeType: "audio/mp3",
										data: base64Audio,
									},
								},
							],
						},
					],
					generationConfig: {
						responseMimeType: "application/json",
					},
				}),
			}
		);

		if (!geminiRes.ok) {
			const err = await geminiRes.text();
			return NextResponse.json({ error: "Error en Gemini API", details: err }, { status: 502 });
		}

		const result = await geminiRes.json();
		const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!rawText) {
			return NextResponse.json({ error: "No se obtuvo respuesta de transcripción" }, { status: 500 });
		}

		const parsed = JSON.parse(rawText);
		transcriptionCache.set(audioUrl, parsed);

		return NextResponse.json({
			success: true,
			cached: false,
			data: parsed,
		});
	} catch (err: any) {
		return NextResponse.json(
			{ error: "Error procesando transcripción", message: err.message },
			{ status: 500 }
		);
	}
}
