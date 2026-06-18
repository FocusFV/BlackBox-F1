"use client";

type VideoProps = {
	video: {
		id: string;
		title: string;
		thumbnail: string;
		publishedAt: string;
		embedUrl: string;
	};
};

export function VideoCard({ video }: VideoProps) {
	const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

	return (
		<a
			href={watchUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-0.75rem)] aspect-video rounded-xl bg-zinc-900 border border-zinc-800/80 flex flex-col justify-end p-4 snap-start relative overflow-hidden group cursor-pointer hover:border-amber-500/40 transition duration-300 select-none"
		>
			{/* Miniatura de fondo */}
			<div className="absolute inset-0 z-0">
				<img
					src={video.thumbnail}
					alt={video.title}
					className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-500"
				/>
			</div>

			<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />

			{/* 🏆 BOTÓN DE PLAY DE ORO CROMADO REAL (Inspirado en image_fd1da5.png e image_fd1d2a.png) */}
			<div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition duration-300">
				
				{/* Contenedor del Botón con reflejos metálicos multi-parada y relieve 3D */}
				<div 
					className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.3),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-3px_6px_rgba(0,0,0,0.4)] transform scale-90 group-hover:scale-100 transition-all duration-300 relative border border-amber-400/40"
					style={{
						// Gradiente metálico de alta definición que simula oro pulido real
						background: "linear-gradient(135deg, #fef08a 0%, #b45309 25%, #fef08a 50%, #f59e0b 75%, #78350f 100%)"
					}}
				>
					{/* Sombra interna para dar profundidad de bisel 3D */}
					<div className="absolute inset-[2px] rounded-full bg-transparent border border-black/10 pointer-events-none" />

					{/* Icono del triángulo de Play con brillo metalizado alineado (image_fd1d49.png) */}
					<svg 
						xmlns="http://www.w3.org/2000/svg" 
						viewBox="0 0 24 24" 
						fill="currentColor" 
						className="w-6 h-6 pl-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
						style={{
							// El icono lleva su propio patrón de reflejos cruzados para simular relieve separado
							background: "linear-gradient(185deg, #ffffff 0%, #d97706 40%, #fef08a 70%, #451a03 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent"
						}}
					>
						<path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 20.03c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" stroke="#78350f" strokeWidth={0.5} />
					</svg>
				</div>
			</div>

			<div className="z-20 pointer-events-none">
				<h3 className="text-sm md:text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
					{video.title}
				</h3>
				<p className="text-[10px] text-zinc-400 font-mono mt-1 uppercase tracking-wider flex items-center gap-1">
					Fórmula 1 Oficial • {video.publishedAt} 
					<span className="text-[9px] text-amber-400/90 transition">(Ver en YT ↗)</span>
				</p>
			</div>
		</a>
	);
}