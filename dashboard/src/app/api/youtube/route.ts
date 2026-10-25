import { NextResponse } from "next/server";

export const revalidate = 300; // Cache de 5 minutos

const GP_SYNONYMS: Record<string, string[]> = {
	"united states": ["united states", "austin", "texas", "cota", "ee.uu", "estados unidos", "usa"],
	mexico: ["mexico", "mexican", "hermanos rodriguez", "ciudad de mexico", "cdmx"],
	brazil: ["brazil", "brasil", "sao paulo", "são paulo", "interlagos"],
	"las vegas": ["las vegas", "vegas", "strip"],
	qatar: ["qatar", "losail", "lusail"],
	"abu dhabi": ["abu dhabi", "yas marina"],
	australia: ["australia", "melbourne", "albert park"],
	bahrain: ["bahrain", "sakhir"],
	"saudi arabia": ["saudi arabia", "saudi", "jeddah"],
	japan: ["japan", "suzuka"],
	china: ["china", "chinese", "shanghai"],
	miami: ["miami"],
	"emilia romagna": ["emilia", "imola"],
	monaco: ["monaco", "monte carlo"],
	canada: ["canada", "canadian", "montreal", "gilles villeneuve"],
	spain: ["spain", "spanish", "barcelona", "catalunya"],
	austria: ["austria", "austrian", "red bull ring", "spielberg"],
	"great britain": ["great britain", "british", "silverstone"],
	hungary: ["hungary", "hungarian", "hungaroring", "budapest"],
	belgium: ["belgium", "belgian", "spa", "francorchamps"],
	netherlands: ["netherlands", "dutch", "zandvoort"],
	italy: ["italy", "italian", "monza"],
	azerbaijan: ["azerbaijan", "baku"],
	singapore: ["singapore", "marina bay"],
};

export interface YouTubeSessionVideo {
	id: string;
	title: string;
	thumbnail: string;
	publishedAt: string;
	embedUrl: string;
	sessionType: string;
	sessionBadge: string;
	badgeType: "race" | "qualy" | "sprint" | "shootout" | "practice";
	sortOrder: number;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const gpQuery = searchParams.get("gp") || "United States";

	const allVideos: { id: string; title: string; thumbnail: string; publishedAt: string; embedUrl: string }[] = [];

	// 1. Scraping directo del canal oficial de YouTube de F1 (Server-side)
	try {
		const pageRes = await fetch("https://www.youtube.com/@Formula1/videos", {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				"Accept-Language": "en-US,en;q=0.9",
			},
			next: { revalidate: 300 },
		});
		const html = await pageRes.text();
		const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
		if (match) {
			const data = JSON.parse(match[1]);
			const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs;
			const tab = tabs?.find((t: any) => t.tabRenderer?.content);
			const items = tab?.tabRenderer?.content?.richGridRenderer?.contents;
			if (Array.isArray(items)) {
				for (const it of items) {
					const lvm = it.richItemRenderer?.content?.lockupViewModel;
					const vr = it.richItemRenderer?.content?.videoRenderer || it.gridVideoRenderer;
					const id = lvm?.contentId || vr?.videoId;
					const title =
						lvm?.metadata?.lockupMetadataViewModel?.title?.content ||
						vr?.title?.runs?.[0]?.text ||
						vr?.title?.simpleText;
					const published =
						lvm?.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]
							?.metadataParts?.[0]?.text?.content ||
						vr?.publishedTimeText?.simpleText ||
						"";

					if (id && title && !allVideos.some((v) => v.id === id)) {
						allVideos.push({
							id,
							title,
							thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
							publishedAt: published,
							embedUrl: `https://www.youtube.com/embed/${id}`,
						});
					}
				}
			}
		}
	} catch (e) {
		console.error("Error scraping @Formula1/videos:", e);
	}

	// 2. Fallback complementario usando el RSS oficial
	try {
		const rssRes = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=UCB_qr75-ydFVKSF9Dmo6izg", {
			next: { revalidate: 300 },
		});
		const xml = await rssRes.text();
		const entryBlocks = xml.split("<entry>").slice(1);
		for (const b of entryBlocks) {
			const id = b.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
			const title = b.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/&amp;/g, "&");
			const published = b.match(/<published>(.*?)<\/published>/)?.[1] || "";
			if (id && title && !allVideos.some((v) => v.id === id)) {
				allVideos.push({
					id,
					title,
					thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
					publishedAt: published,
					embedUrl: `https://www.youtube.com/embed/${id}`,
				});
			}
		}
	} catch (e) {
		console.error("Error fetching RSS fallback:", e);
	}

	// 3. Resolución de palabras clave para el GP solicitado
	const cleanGp = (gpQuery || "").toLowerCase().replace("grand prix", "").replace("gran premio", "").trim();
	let keywords: string[] = [cleanGp];
	for (const [key, syns] of Object.entries(GP_SYNONYMS)) {
		if (cleanGp.includes(key) || syns.some((s) => cleanGp.includes(s))) {
			keywords = Array.from(new Set([...keywords, ...syns]));
			break;
		}
	}

	// 4. Clasificación precisa de sesiones en pista
	const forbidden = [
		"podcast",
		"nation",
		"react",
		"interview",
		"press",
		"review",
		"debrief",
		"warm up",
		"live:",
		"unfiltered",
		"talks",
		"speaks",
		"radio",
		"chumps",
		"top 10",
		"palmer",
		"jolyon",
		"show",
		"gigs",
		"view of the race start",
		"ghost car",
		"pole lap",
		"drivers look ahead",
		"extended highlights",
		"2018",
		"2012",
	];

	const sessionMap: Record<string, YouTubeSessionVideo> = {};

	for (const v of allVideos) {
		const titleLower = v.title.toLowerCase();
		const normalized = titleLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

		const matchesGp = keywords.some((k) => normalized.includes(k));
		if (!matchesGp) continue;

		if (forbidden.some((w) => normalized.includes(w))) continue;

		const base = {
			id: v.id,
			title: v.title,
			thumbnail: v.thumbnail,
			publishedAt: v.publishedAt,
			embedUrl: v.embedUrl,
		};

		if (
			(normalized.includes("sprint qualifying") || normalized.includes("shootout") || normalized.includes("sq")) &&
			!sessionMap["SPRINT_QUALY"]
		) {
			sessionMap["SPRINT_QUALY"] = {
				...base,
				sessionType: "Clasificación Sprint",
				sessionBadge: "SQ",
				badgeType: "shootout",
				sortOrder: 2,
			};
		} else if (
			(normalized.includes("sprint highlights") || (normalized.includes("sprint") && normalized.includes("race"))) &&
			!normalized.includes("qualifying") &&
			!sessionMap["SPRINT"]
		) {
			sessionMap["SPRINT"] = {
				...base,
				sessionType: "Carrera Sprint",
				sessionBadge: "Sprint",
				badgeType: "sprint",
				sortOrder: 3,
			};
		} else if (
			(normalized.includes("qualifying highlights") ||
				(normalized.includes("qualifying") && !normalized.includes("sprint"))) &&
			!sessionMap["QUALY"]
		) {
			sessionMap["QUALY"] = {
				...base,
				sessionType: "Clasificación",
				sessionBadge: "Qualy",
				badgeType: "qualy",
				sortOrder: 4,
			};
		} else if (
			(normalized.includes("race highlights") ||
				(normalized.includes("highlights") && normalized.includes("race"))) &&
			!normalized.includes("sprint") &&
			!normalized.includes("qualifying") &&
			!sessionMap["RACE"]
		) {
			sessionMap["RACE"] = {
				...base,
				sessionType: "Gran Premio (Carrera)",
				sessionBadge: "Carrera",
				badgeType: "race",
				sortOrder: 5,
			};
		} else if (
			(normalized.includes("fp3") || normalized.includes("practice 3")) &&
			!sessionMap["FP3"]
		) {
			sessionMap["FP3"] = {
				...base,
				sessionType: "Práctica Libre 3",
				sessionBadge: "FP3",
				badgeType: "practice",
				sortOrder: 3.5,
			};
		} else if (
			(normalized.includes("fp2") || normalized.includes("practice 2")) &&
			!sessionMap["FP2"]
		) {
			sessionMap["FP2"] = {
				...base,
				sessionType: "Práctica Libre 2",
				sessionBadge: "FP2",
				badgeType: "practice",
				sortOrder: 2.5,
			};
		} else if (
			(normalized.includes("fp1") || normalized.includes("practice 1")) &&
			!sessionMap["FP1"]
		) {
			sessionMap["FP1"] = {
				...base,
				sessionType: "Práctica Libre 1",
				sessionBadge: "FP1",
				badgeType: "practice",
				sortOrder: 1,
			};
		}
	}

	// Orden cronológico: FP1 -> SQ/FP2 -> Sprint/FP3 -> Qualy -> Carrera
	const sorted = Object.values(sessionMap).sort((a, b) => a.sortOrder - b.sortOrder);

	return NextResponse.json({
		gp: gpQuery,
		total: sorted.length,
		sessions: sorted,
	});
}
