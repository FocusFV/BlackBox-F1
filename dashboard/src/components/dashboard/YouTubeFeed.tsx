"use client";

import { useEffect, useState, useRef } from "react";
import { useDataStore } from "@/stores/useDataStore";
import { VideoCard } from "./VideoCard";
import type { YouTubeSessionVideo } from "@/app/api/youtube/route";
import { translateGpName } from "@/lib/f1Translations";

export function YouTubeFeed() {
	const rawGpName = useDataStore((state) => state.state?.SessionInfo?.Meeting?.Name);

	const [videos, setVideos] = useState<YouTubeSessionVideo[]>([]);
	const [displayGpName, setDisplayGpName] = useState<string>("Gran Premio");
	const [loading, setLoading] = useState(true);

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let isMounted = true;

		async function fetchSessions() {
			setLoading(true);
			try {
				let currentGp = "United States";

				try {
					const gpRes = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json");
					const gpData = await gpRes.json();
					if (gpData?.MRData?.RaceTable?.Races?.length > 0) {
						const race = gpData.MRData.RaceTable.Races[0];
						currentGp = race.raceName || "United States";
					}
				} catch {
					if (rawGpName) currentGp = rawGpName;
				}

				if (isMounted) setDisplayGpName(translateGpName(currentGp));

				// Consultamos la ruta API interna de Next.js
				const res = await fetch(`/api/youtube?gp=${encodeURIComponent(currentGp)}`);
				if (res.ok) {
					const data = await res.json();
					if (isMounted && Array.isArray(data.sessions)) {
						setVideos(data.sessions);
					}
				}
			} catch (err) {
				console.error("Error obteniendo sesiones en video:", err);
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
				behavior: "smooth",
			});
		}
	};

	if (loading) {
		return (
			<div className="h-36 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse w-full rounded-2xl bg-zinc-950/40 border border-zinc-900 mt-6">
				<span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
				Cargando resúmenes oficiales de YouTube...
			</div>
		);
	}

	return (
		<div className="w-full px-1 mt-6 relative group/feed">
			<div className="flex items-center justify-between mb-3 px-1 select-none">
				<div className="flex items-center gap-2.5">
					<span className="flex h-2.5 w-2.5 relative">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
					</span>
					<h2 className="text-xs md:text-sm font-bold uppercase tracking-wider font-mono text-zinc-200">
						Sesiones Oficiales en Video · {displayGpName}
					</h2>
				</div>
				<span className="text-[10px] font-mono text-zinc-500 hidden sm:inline-block uppercase tracking-wider">
					Fórmula 1 Oficial • YouTube
				</span>
			</div>

			<div className="relative w-full">
				{videos.length > 3 && (
					<button
						onClick={() => scroll("left")}
						className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-16 flex items-center justify-center opacity-0 group-hover/feed:opacity-100 transition-all duration-300 hover:-translate-x-1 active:scale-95 pointer-events-auto rounded-lg bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md"
						aria-label="Scroll izquierdo"
					>
						<span className="text-amber-400 text-lg font-bold">‹</span>
					</button>
				)}

				<div
					ref={scrollContainerRef}
					className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x snap-mandatory w-full"
				>
					{videos.map((video) => (
						<VideoCard key={video.id} video={video} />
					))}

					<a
						href={`https://www.youtube.com/results?search_query=F1+Highlights+${encodeURIComponent(displayGpName)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-0.75rem)] aspect-video rounded-xl bg-zinc-950/80 border border-zinc-800/80 border-dashed flex flex-col items-center justify-center p-4 snap-start relative group cursor-pointer hover:border-amber-500/50 hover:bg-zinc-900/40 transition duration-300 select-none text-center"
					>
						<div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-gradient-to-br group-hover:from-amber-300 group-hover:via-yellow-500 group-hover:to-amber-600 group-hover:text-zinc-950 group-hover:border-amber-400 transition duration-300 text-sm mb-2 shadow-inner">
							➕
						</div>
						<span className="text-xs font-bold text-zinc-300 group-hover:text-amber-200 transition font-sans">
							Explorar archivo completo
						</span>
						<span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
							youtube.com/@f1 ↗
						</span>
					</a>
				</div>

				{videos.length > 3 && (
					<button
						onClick={() => scroll("right")}
						className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-16 flex items-center justify-center opacity-0 group-hover/feed:opacity-100 transition-all duration-300 hover:translate-x-1 active:scale-95 pointer-events-auto rounded-lg bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md"
						aria-label="Scroll derecho"
					>
						<span className="text-amber-400 text-lg font-bold">›</span>
					</button>
				)}
			</div>
		</div>
	);
}
