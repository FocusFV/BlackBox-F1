"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { fetchCoords } from "@/lib/geocode";
import { useDataStore } from "@/stores/useDataStore";

export function WeatherMap() {
	const meeting = useDataStore((state) => state.state?.SessionInfo?.Meeting);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Map | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		(async () => {
			if (!mapContainerRef.current || !meeting) return;

			const [coordsC, coordsA] = await Promise.all([
				fetchCoords(`${meeting.Country.Name}, ${meeting.Location} circuit`),
				fetchCoords(`${meeting.Country.Name}, ${meeting.Location} autodrome`),
			]);

			const coords = coordsC || coordsA;

			const libMap = new maplibregl.Map({
				container: mapContainerRef.current,
				style: {
					version: 8,
					sources: {
						"esri-satellite": {
							type: "raster",
							tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
							tileSize: 256,
							attribution: "Esri"
						}
					},
					layers: [
						{
							id: "satellite-layer",
							type: "raster",
							source: "esri-satellite",
							minzoom: 0,
							maxzoom: 20
						}
					]
				},
				center: coords ? [coords.lon, coords.lat] : undefined,
				zoom: 14.2, // Vista perfecta de pájaro
				pitch: 0,   // 2D Plano para mapeo de precisión de lluvia
				interactive: true
			});

			libMap.on("load", () => {
				setLoading(false);
			});

			mapRef.current = libMap;
		})();

		return () => {
			if (mapRef.current) mapRef.current.remove();
		};
	}, [meeting]);

	return (
		<div className="relative w-full h-full bg-black overflow-hidden">
			<div 
				ref={mapContainerRef} 
				className="absolute inset-0 w-full h-full" 
				style={{ filter: "hue-rotate(130deg) saturate(2.2) brightness(0.35) contrast(1.2)" }}
			/>
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,161,155,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,161,155,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
			{loading && <div className="h-full w-full animate-pulse bg-zinc-950" />}
		</div>
	);
}