"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { getCircuitBackdropUrl } from "@/lib/circuitBackdrops";
import { useEffect, useState } from "react";

interface Props {
	gpName?: string;
	country?: string;
	circuitId?: string;
}

export function CircuitBackdrop({ gpName, country, circuitId }: Props) {
	const oledMode = useSettingsStore((state) => state.oledMode);
	const [imageUrl, setImageUrl] = useState<string>("/circuits/default.webp");
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const url = getCircuitBackdropUrl(gpName, country, circuitId);
		setImageUrl(url);
		setLoaded(false);
	}, [gpName, country, circuitId]);

	if (oledMode) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-opacity duration-1000">
			{/* Imagen Aérea Cinematográfica del Circuito */}
			<img
				src={imageUrl}
				alt=""
				onLoad={() => setLoaded(true)}
				className={`w-full h-full object-cover object-center filter contrast-[1.1] brightness-[0.75] transition-all duration-1000 ${
					loaded ? "opacity-25 scale-100" : "opacity-0 scale-105"
				}`}
			/>

			{/* Gradientes de oscurecimiento y viñeta radial para legibilidad de telemetría */}
			<div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-zinc-950/50" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_85%)]" />
		</div>
	);
}
