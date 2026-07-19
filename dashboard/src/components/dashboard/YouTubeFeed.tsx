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
    weight?: number; 
}

export function YouTubeFeed() {
    // 🏎️ Nos suscribimos al nombre del GP sin "grand prix"
    const gpName = useDataStore((state) => {
        const name = state.state?.SessionInfo?.Meeting?.Name;
        if (!name) return ""; 
        return name.replace(/grand prix/gi, "").trim();
    });

    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchLiveVideos() {
            setLoading(true);
            
            // 👑 USAMOS TU VARIABLE DE ENTORNO DINÁMICA O TU NUEVO RENDER DIRECTO
            const baseUrl = process.env.NEXT_PUBLIC_LIVE_URL || "https://blackbox-f1-realtime-docker.onrender.com";
            const url = `${baseUrl.replace(/\/$/, "")}/api/videos`;

            try {
                const res = await fetch(url);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    // Mapeamos los videos que nos manda Rust con el formato que ya usa tu VideoCard
                    const mappedVideos = data.map((video: any) => ({
                        id: video.id,
                        title: video.title,
                        thumbnail: video.thumbnail,
                        publishedAt: video.publishedAt,
                        embedUrl: video.embedUrl
                    }));

                    setVideos(mappedVideos);
                } else {
                    setVideos([]);
                }
            } catch (error) {
                console.error("Error trayendo videos del caché de Rust:", error);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        }

        fetchLiveVideos();
    }, [gpName]);

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
                Buscando transmisiones oficiales...
            </div>
        );
    }

    return (
        <div className="w-full px-2 mt-6 relative group/feed">
            <div className="flex items-center justify-between mb-4 px-1 select-none">
                <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    • Resúmenes Oficiales: GP de {gpName || "Formula 1"}
                </h2>
            </div>

            <div className="relative w-full">
                
                {/* 👑 FLECHA IZQUIERDA: DISEÑO ORO 3D ESCULPIDO RECUPERADO */}
                <button 
                    onClick={() => scroll("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-20 flex items-center justify-center opacity-0 group-hover/feed:opacity-100 transition-all duration-300 hover:-translate-x-1 active:scale-90 pointer-events-auto group/btnLeft"
                    aria-label="Scroll izquierdo"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        className="w-10 h-10 transition duration-200 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)] group-hover/btnLeft:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    >
                        <defs>
                            <linearGradient id="gold3DLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="30%" stopColor="#b45309" />
                                <stop offset="50%" stopColor="#fff9c4" />
                                <stop offset="75%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#451a03" />
                            </linearGradient>
                        </defs>
                        <path 
                            d="M16 4L6 12L16 20L19 17L11 12L19 7L16 4Z" 
                            fill="url(#gold3DLeft)"
                            stroke="#78350f"
                            strokeWidth="0.75"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Tira scrolleable */}
                <div 
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 snap-x snap-mandatory w-full"
                >
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}

                    {/* ➕ BOTÓN ORIGINAL CON PLAY EXTRA SANEADO */}
                    <a
                        href={`https://www.youtube.com/results?search_query=F1+Highlights+${encodeURIComponent(gpName || "Formula 1")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-0.75rem)] aspect-video rounded-xl bg-zinc-950 border border-zinc-900 border-dashed flex flex-col items-center justify-center p-4 snap-start relative group cursor-pointer hover:border-amber-500/40 transition duration-300 select-none text-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-gradient-to-br group-hover:from-amber-300 group-hover:via-yellow-500 group-hover:to-amber-600 group-hover:text-zinc-950 group-hover:border-amber-400 transition duration-300 text-sm mb-2 shadow-inner">
                            ➕
                        </div>
                        <span className="text-xs font-bold text-zinc-400 group-hover:text-amber-200/90 transition font-sans">
                            Explorar archivo completo
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                            youtube.com/f1
                        </span>
                    </a>
                </div>

                {/* 👑 FLECHA DERECHA: DISEÑO ORO 3D ESCULPIDO RECUPERADO */}
                <button 
                    onClick={() => scroll("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-20 flex items-center justify-center opacity-0 group-hover/feed:opacity-100 transition-all duration-300 hover:translate-x-1 active:scale-90 pointer-events-auto group/btnRight"
                    aria-label="Scroll derecho"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        className="w-10 h-10 transition duration-200 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)] group-hover/btnRight:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    >
                        <defs>
                            <linearGradient id="gold3DRight" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="30%" stopColor="#b45309" />
                                <stop offset="50%" stopColor="#fff9c4" />
                                <stop offset="75%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#451a03" />
                            </linearGradient>
                        </defs>
                        <path 
                            d="M8 4L18 12L8 20L5 17L13 12L5 7L8 4Z" 
                            fill="url(#gold3DRight)"
                            stroke="#78350f"
                            strokeWidth="0.75"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

            </div>
        </div>
    );
}