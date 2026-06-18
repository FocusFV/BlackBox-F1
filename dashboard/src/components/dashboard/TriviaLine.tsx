"use client";

import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/useDataStore";

interface TriviaPackage {
	lastGpName: string;
	items: {
		label: string;
		text: string;
	}[];
}

const triviaArchive: Record<string, TriviaPackage> = {
	"austria": {
		lastGpName: "España (Barcelona)",
		items: [
			{
				label: "Maniobra del GP",
				text: "Franco Colapinto enmudeció a Montmeló con una frenada brutal estirando por el exterior de la curva 1 en el arranque."
			},
			{
				label: "Estrategia",
				text: "La degradación térmica en el asfalto catalán destrozó los planes tradicionales, forzando un cambio masivo a tres paradas (Soft-Medium-Hard-Soft)."
			},
			{
				label: "Récord Técnico",
				text: "Los autos con motorización Mercedes registraron la mayor velocidad final en la recta principal gracias a un mapa de despliegue de ERS optimizado."
			}
		]
	},
	"great britain": {
		lastGpName: "Austria (Spielberg)",
		items: [
			{
				label: "Polémica en pista",
				text: "Los límites en las curvas 9 y 10 volvieron loco al Race Control, acumulando más de 45 advertencias y reconfigurando la grilla post-carrera."
			},
			{
				label: "Telemetría",
				text: "Las zonas de DRS consecutivas generaron turbulencias tan severas que los autos de atrás perdían hasta un 8% de carga aerodinámica en el segundo sector."
			},
			{
				label: "Dato de Color",
				text: "La zona del Red Bull Ring registró la menor diferencia de tiempos en Q1 de toda la temporada, encerrando a 18 autos en menos de 7 décimas."
			}
		]
	}
};

export function TriviaLine() {
	const session = useDataStore((state) => state.state?.SessionInfo);
	const rawGpName = session?.Meeting?.Name || "Austria";
	const gpName = rawGpName.replace(/grand prix/gi, "").trim().toLowerCase();

	const [packageData, setPackageData] = useState<TriviaPackage | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const currentTrivia = triviaArchive[gpName] || triviaArchive["austria"];
		setPackageData(currentTrivia);
		setCurrentIndex(0);
	}, [gpName]);

	// Efecto para hacer rotar los datos automáticamente cada 8 segundos
	useEffect(() => {
		if (!packageData || packageData.items.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % packageData.items.length);
		}, 8000);

		return () => clearInterval(interval);
	}, [packageData]);

	if (!packageData) return null;

	const activeItem = packageData.items[currentIndex];

	return (
		<div className="w-full px-2 mt-4 animate-fade-in">
			<div className="w-full p-4 rounded-xl border border-zinc-800/60 bg-gradient-to-r from-zinc-950 via-zinc-900/20 to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs h-auto md:h-16 transition-all duration-500">
				
				<div className="flex items-center gap-3 flex-1">
					{/* Badge del GP Anterior */}
					<span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
						GP Anterior: {packageData.lastGpName}
					</span>
					
					{/* Contenedor con animación de transición para el texto que rota */}
					<div key={currentIndex} className="animate-pulse flex flex-col md:flex-row md:items-center gap-1.5 transition-all duration-500">
						<span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wide border-b border-zinc-800 md:border-none pb-0.5 md:pb-0">
							[{activeItem.label}]
						</span>
						<p className="text-zinc-300 leading-relaxed">
							{activeItem.text}
						</p>
					</div>
				</div>
				
				{/* Indicador de puntitos de paginación para saber cuánta data hay */}
				<div className="flex items-center gap-1.5 md:justify-end border-t border-zinc-900 md:border-none pt-2 md:pt-0">
					{packageData.items.map((_, idx) => (
						<span 
							key={idx}
							className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-red-500' : 'w-1 bg-zinc-800'}`}
						/>
					))}
				</div>

			</div>
		</div>
	);
}