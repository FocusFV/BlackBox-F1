"use client";

import type { YouTubeSessionVideo } from "@/app/api/youtube/route";

type VideoProps = {
	video: YouTubeSessionVideo;
};

const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
	race: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/40" },
	qualy: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40" },
	sprint: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40" },
	shootout: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/40" },
	practice: { bg: "bg-zinc-800/80", text: "text-zinc-300", border: "border-zinc-700/60" },
};

export function VideoCard({ video }: VideoProps) {
	const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;
	const style = badgeStyles[video.badgeType || "practice"] || badgeStyles.practice;

	return (
		<a
			href={watchUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-0.75rem)] aspect-video rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between p-4 snap-start relative overflow-hidden group cursor-pointer hover:border-amber-500/50 hover:shadow-[0_4px_25px_rgba(245,158,11,0.15)] transition-all duration-300 select-none"
		>
			{/* Miniatura de fondo con zoom sutil al hover */}
			<div className="absolute inset-0 z-0">
				<img
					src={video.thumbnail}
					alt={video.title}
					className="w-full h-full object-cover opacity-65 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
				/>
			</div>

			{/* Gradiente oscuro para máxima legibilidad */}
			<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20 z-10" />

			{/* Badge superior de Sesión Oficial */}
			<div className="z-20 flex items-center justify-between">
				<span
					className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border backdrop-blur-md shadow-sm ${style.bg} ${style.text} ${style.border}`}
				>
					<span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
					{video.sessionType || video.sessionBadge || "Resumen Oficial"}
				</span>

				{video.publishedAt && (
					<span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/70 px-2 py-0.5 rounded border border-zinc-800/60 backdrop-blur-sm">
						{video.publishedAt}
					</span>
				)}
			</div>

			{/* Botón de Play Cromado Dorado (Hover) */}
			<div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
				<div
					className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.5),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(0,0,0,0.4)] transform scale-90 group-hover:scale-100 transition-all duration-300 relative border border-amber-400/50"
					style={{
						background: "linear-gradient(135deg, #fef08a 0%, #b45309 25%, #fef08a 50%, #f59e0b 75%, #78350f 100%)",
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="w-6 h-6 pl-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
						style={{
							background: "linear-gradient(185deg, #ffffff 0%, #d97706 40%, #fef08a 70%, #451a03 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						<path
							fillRule="evenodd"
							d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 20.03c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
			</div>

			{/* Título inferior */}
			<div className="z-20 pointer-events-none">
				<h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
					{video.title}
				</h3>
				<p className="text-[10px] text-zinc-400 font-mono mt-1 uppercase tracking-wider flex items-center justify-between">
					<span>Fórmula 1 Oficial</span>
					<span className="text-amber-400 font-semibold group-hover:underline">Ver en YouTube ↗</span>
				</p>
			</div>
		</a>
	);
}
