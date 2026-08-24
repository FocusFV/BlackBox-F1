"use client";

import { useEffect, useState, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { VideoCard } from "./VideoCard";

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    embedUrl: string;
    sessionType?: string;
}

export function YouTubeFeed() {
    const rawGpName = useDataStore((state) => state.state?.SessionInfo?.Meeting?.Name);

    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [displayGpName, setDisplayGpName] = useState<string>("Cargando...");
    const [loading, setLoading] = useState(true);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchSessions() {
            setLoading(true);
            try {
                // 1. Obtener GP dinámicamente desde API
                let currentGp = "Dutch";

                try {
                    const gpRes = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json");
                    const gpData = await gpRes.json();
                    if (gpData?.MRData?.RaceTable?.Races?.length > 0) {
                        const race = gpData.MRData.RaceTable.Races[0];
                        currentGp = (race.raceName || "").replace("Grand Prix", "").trim() || "Dutch";
                    }
                } catch {
                    if (rawGpName) currentGp = rawGpName;
                }

                if (isMounted) setDisplayGpName(currentGp);

                const gpKeywords = [
                    currentGp.toLowerCase(),
                    "dutch",
                    "paises bajos",
                    "países bajos",
                    "netherlands",
                    "zandvoort"
                ];

                // 2. Traer el listado extendido de videos del canal oficial de F1
                const ytChannelUrl = "https://www.youtube.com/@F1/videos";
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(ytChannelUrl)}`;
                
                let rawList: any[] = [];

                try {
                    const response = await fetch(proxyUrl);
                    const data = await response.json();
                    const html = data.contents;

                    const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
                    if (match && match[1]) {
                        const parsed = JSON.parse(match[1]);
                        const tabs = parsed.contents?.twoColumnBrowseResultsRenderer?.tabs;
                        const tab = tabs?.find((t: any) => t.tabRenderer?.content);
                        const items = tab?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.gridRenderer?.items 
                                   || tab?.tabRenderer?.content?.richGridRenderer?.contents;

                        if (Array.isArray(items)) {
                            for (const it of items) {
                                const renderer = it.gridVideoRenderer || it.richItemRenderer?.content?.videoRenderer;
                                if (!renderer) continue;

                                const videoId = renderer.videoId;
                                const title = renderer.title?.runs?.[0]?.text || renderer.title?.simpleText || "";
                                const thumb = renderer.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                const published = renderer.publishedTimeText?.simpleText || "";

                                if (videoId && title) {
                                    rawList.push({
                                        id: videoId,
                                        title,
                                        thumbnail: thumb,
                                        publishedAt: published,
                                        embedUrl: `https://www.youtube.com/embed/${videoId}`
                                    });
                                }
                            }
                        }
                    }
                } catch {
                    // Fallback directo a RSS si el scraping del tab falla
                    try {
                        const rssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://www.youtube.com/feeds/videos.xml?channel_id=UCB_qr75-ydFVKSF9Dmo6izg")}`);
                        const rssData = await rssRes.json();
                        if (rssData?.items) {
                            rawList = rssData.items.map((i: any) => ({
                                id: i.guid?.replace("yt:video:", "") || i.link?.split("v=")[1],
                                title: i.title,
                                thumbnail: i.thumbnail || `https://i.ytimg.com/vi/${i.guid?.replace("yt:video:", "")}/hqdefault.jpg`,
                                publishedAt: i.pubDate,
                                embedUrl: `https://www.youtube.com/embed/${i.guid?.replace("yt:video:", "")}`
                            }));
                        }
                    } catch {}
                }

                // 3. Filtrar y clasificar únicamente sesiones en pista
                const forbidden = [
                    "podcast", "nation", "react", "interview", "press", "review", 
                    "debrief", "warm up", "live:", "unfiltered", "talks", "speaks", 
                    "radio", "chumps", "top 10", "palmer", "jolyon", "show"
                ];

                const sessionMap: Record<string, YouTubeVideo> = {};

                for (const v of rawList) {
                    if (!v || !v.id) continue;

                    const titleLower = (v.title || "").toLowerCase();
                    const normalized = titleLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                    if (forbidden.some((w) => normalized.includes(w))) continue;
                    if (!gpKeywords.some((k) => normalized.includes(k))) continue;

                    const videoObj: YouTubeVideo = {
                        id: v.id,
                        title: v.title,
                        thumbnail: v.thumbnail,
                        publishedAt: v.publishedAt,
                        embedUrl: v.embedUrl
                    };

                    if (
                        (normalized.includes("sprint qualifying") || normalized.includes("clasificacion sprint") || normalized.includes("shootout")) &&
                        !sessionMap["SPRINT_QUALY"]
                    ) {
                        sessionMap["SPRINT_QUALY"] = { ...videoObj, sessionType: "Sprint Qualy" };
                    } else if (
                        (normalized.includes("sprint highlights") || normalized.includes("momentos sprint") || (normalized.includes("sprint") && normalized.includes("race"))) &&
                        !normalized.includes("clasificaci") &&
                        !sessionMap["SPRINT"]
                    ) {
                        sessionMap["SPRINT"] = { ...videoObj, sessionType: "Sprint" };
                    } else if (
                        (normalized.includes("qualifying highlights") || normalized.includes("clasificacion")) &&
                        !normalized.includes("sprint") &&
                        !sessionMap["QUALY"]
                    ) {
                        sessionMap["QUALY"] = { ...videoObj, sessionType: "Qualifying" };
                    } else if (
                        (normalized.includes("race highlights") || normalized.includes("mejores momentos")) &&
                        !normalized.includes("sprint") &&
                        !normalized.includes("clasificaci") &&
                        !sessionMap["RACE"]
                    ) {
                        sessionMap["RACE"] = { ...videoObj, sessionType: "Race" };
                    } else if (
                        (normalized.includes("fp3") || normalized.includes("practice 3") || normalized.includes("libres 3")) &&
                        !sessionMap["FP3"]
                    ) {
                        sessionMap["FP3"] = { ...videoObj, sessionType: "FP3" };
                    } else if (
                        (normalized.includes("fp2") || normalized.includes("practice 2") || normalized.includes("libres 2")) &&
                        !sessionMap["FP2"]
                    ) {
                        sessionMap["FP2"] = { ...videoObj, sessionType: "FP2" };
                    } else if (
                        (normalized.includes("fp1") || normalized.includes("practice 1") || normalized.includes("libres 1")) &&
                        !sessionMap["FP1"]
                    ) {
                        sessionMap["FP1"] = { ...videoObj, sessionType: "FP1" };
                    }
                }

                // 4. Ordenar cronológicamente (Carrera -> Qualy -> Sprint -> Sprint Qualy -> Prácticas)
                const priority = ["RACE", "QUALY", "SPRINT", "SPRINT_QUALY", "FP3", "FP2", "FP1"];
                const resultList: YouTubeVideo[] = [];

                for (const key of priority) {
                    if (sessionMap[key]) {
                        resultList.push(sessionMap[key]);
                    }
                }

                if (isMounted) {
                    setVideos(resultList);
                }
            } catch (err) {
                console.error("Error obteniendo videos:", err);
                if (isMounted) setVideos([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchSessions();

        return () => {
            isMounted = false;
        };
    }, [rawGpName]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({ 
                left: direction === "left" ? -width : width, 
                behavior: "smooth" 
            });
        }
    };

    if (loading) {
        return (
            <div className="h-32 flex items-center justify-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse w-full">
                Cargando sesiones oficiales...
            </div>
        );
    }

    return (
        <div className="w-full px-2 mt-6 relative group/feed">
            <div className="flex items-center justify-between mb-4 px-1 select-none">
                <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    • Sesiones Oficiales: GP de {displayGpName}
                </h2>
            </div>

            <div className="relative w-full">
                <button 
                    onClick={() => scroll("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-20 flex items-center justify-center opacity-0 group-hover/feed:opacity-100 transition-all duration-300 hover:-translate-x-1 active:scale-90 pointer-events-auto group/btnLeft"
                    aria-label="Scroll izquierdo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10 transition duration-200 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)] group-hover/btnLeft:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <defs>
                            <linearGradient id="gold3DLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" /><stop offset="30%" stopColor="#b45309" /><stop offset="50%" stopColor="#fff9c4" /><stop offset="75%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#451a03" />
                            </linearGradient>
                        </defs>
                        <path d="M16 4L6 12L16 20L19 17L11 12L19 7L16 4Z" fill="url(#gold3DLeft)" stroke="#78350f" strokeWidth="0.75" strokeLinejoin="round" />
                    </svg>
                </button>

                <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 snap-x snap-mandatory w-full">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video as any} />
                    ))}

                    <a
                        href={`https://www.youtube.com/results?search_query=F1+Highlights+${encodeURIComponent(displayGpName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-0.75rem)] aspect-video rounded-xl bg-zinc-950 border border-zinc-900 border-dashed flex flex-col items-center justify-center p-4 snap-start relative group cursor-pointer hover:border-amber-500/40 transition duration-300 select-none text-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-gradient-to-br group-hover:from-amber-300 group-hover:via-yellow-500 group-hover:to-amber-600 group-hover:text-zinc-950 group-hover:border-amber-400 transition duration-300 text-sm mb-2 shadow-inner">➕</div>
                        <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-200/90 transition font-sans">Explorar archivo completo</span>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-1">youtube.com/f1</span>
                    </a>
                </div>

                <button 
                    onClick={() => scroll("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-20 flex items-center justify-center opacity-0 group-hover/feed:opacity-100 transition-all duration-300 hover:translate-x-1 active:scale-90 pointer-events-auto group/btnRight"
                    aria-label="Scroll derecho"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10 transition duration-200 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)] group-hover/btnRight:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <defs>
                            <linearGradient id="gold3DRight" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" /><stop offset="30%" stopColor="#b45309" /><stop offset="50%" stopColor="#fff9c4" /><stop offset="75%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#451a03" />
                            </linearGradient>
                        </defs>
                        <path d="M8 4L18 12L8 20L5 17L13 12L5 7L8 4Z" fill="url(#gold3DRight)" stroke="#78350f" strokeWidth="0.75" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}