"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { fetchCoords } from "@/lib/geocode";
import { useDataStore } from "@/stores/useDataStore";

export function WeatherMap() {
	const { t } = useTranslation();
	const meeting = useDataStore((state) => state.state?.SessionInfo?.Meeting);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Map | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			if (!mapContainerRef.current) return;

			// Coordenadas oficiales: Si es simulación México Autódromo Hermanos Rodríguez (19.4042, -99.0907), si no Las Vegas Strip (36.1147, -115.173)
			const isSim = typeof window !== "undefined" && (
				sessionStorage.getItem("f1_pitwall_sim") === "active"
			);
			let coords: { lat: number; lon: number } = isSim
				? { lat: 19.4042, lon: -99.0907 }
				: { lat: 36.1147, lon: -115.173 };

			if (meeting?.Location && meeting?.Country?.Name) {
				try {
					const [coordsC, coordsA] = await Promise.all([
						fetchCoords(`${meeting.Country.Name}, ${meeting.Location} circuit`),
						fetchCoords(`${meeting.Country.Name}, ${meeting.Location} autodrome`),
					]);
					const found = coordsC || coordsA;
					if (found) coords = found;
				} catch (e) {
					console.warn("[WeatherMap] Error geocodificando circuito:", e);
				}
			}

			// Consultar último frame del radar Doppler de RainViewer
			let radarTileUrl = "";
			try {
				const rvRes = await fetch("https://api.rainviewer.com/public/weather-maps.json");
				if (rvRes.ok) {
					const rvData = await rvRes.json();
					const past = rvData?.radar?.past;
					if (Array.isArray(past) && past.length > 0) {
						const latest = past[past.length - 1];
						radarTileUrl = `${rvData.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
					}
				}
			} catch (e) {
				console.warn("[WeatherMap] RainViewer radar no disponible:", e);
			}

			if (!isMounted || !mapContainerRef.current) return;

			const sources: any = {
				"esri-satellite": {
					type: "raster",
					tiles: [
						"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
					],
					tileSize: 256,
					attribution: "Esri",
					maxzoom: 18,
				},
			};

			const layers: any[] = [
				{
					id: "satellite-layer",
					type: "raster",
					source: "esri-satellite",
					minzoom: 0,
					maxzoom: 20,
				},
			];

			if (radarTileUrl) {
				sources["rainviewer-radar"] = {
					type: "raster",
					tiles: [radarTileUrl],
					tileSize: 256,
					minzoom: 0,
					maxzoom: 7,
				};
				layers.push({
					id: "radar-layer",
					type: "raster",
					source: "rainviewer-radar",
					minzoom: 0,
					maxzoom: 20,
					paint: {
						"raster-opacity": 0.85,
					},
				});
			}

			const libMap = new maplibregl.Map({
				container: mapContainerRef.current,
				style: {
					version: 8,
					sources,
					layers,
				},
				center: [coords.lon, coords.lat],
				zoom: 12.5,
				minZoom: 2,
				maxZoom: 16.5,
				pitch: 0,
				interactive: true,
			});

			libMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

			const safetyTimer = setTimeout(() => {
				if (isMounted) setLoading(false);
			}, 2500);

			libMap.on("load", () => {
				clearTimeout(safetyTimer);
				if (isMounted) setLoading(false);
			});

			libMap.on("error", () => {
				clearTimeout(safetyTimer);
				if (isMounted) setLoading(false);
			});

			mapRef.current = libMap;
		})();

		return () => {
			isMounted = false;
			if (mapRef.current) mapRef.current.remove();
		};
	}, [meeting]);

	return (
		<div className="relative w-full h-full bg-black overflow-hidden">
			<div
				ref={mapContainerRef}
				className="absolute inset-0 w-full h-full"
			/>
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,161,155,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,161,155,0.04)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
			{loading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 font-mono text-xs text-[#00A19B] animate-pulse">
					{t("weather.connecting_radar", "🛰️ Conectando radar satelital...")}
				</div>
			)}
		</div>
	);
}
