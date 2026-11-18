"use client";

import { useEffect, useRef, useState } from "react";
import { X, Heart, ShieldAlert } from "lucide-react";
import { env } from "@/env";
import { useTranslation } from "@/hooks/useTranslation";
import { useSupportModalStore } from "@/stores/useSupportModalStore";

declare global {
	interface Window {
		adsbygoogle?: any[];
	}
}

export type AdFormat = "leaderboard" | "rectangle" | "mobile-banner";

export interface AdSlotProps {
	slotId?: string;
	format: AdFormat;
	className?: string;
	dismissible?: boolean;
}

const FORMAT_CONFIG: Record<
	AdFormat,
	{
		containerClass: string;
		adWidth: number;
		adHeight: number;
		adFormatAttr: string;
	}
> = {
	leaderboard: {
		containerClass: "w-full max-w-[728px] h-[90px]",
		adWidth: 728,
		adHeight: 90,
		adFormatAttr: "horizontal",
	},
	rectangle: {
		containerClass: "w-[300px] h-[250px]",
		adWidth: 300,
		adHeight: 250,
		adFormatAttr: "rectangle",
	},
	"mobile-banner": {
		containerClass: "w-[320px] h-[50px]",
		adWidth: 320,
		adHeight: 50,
		adFormatAttr: "horizontal",
	},
};

export default function AdSlot({
	slotId,
	format,
	className = "",
	dismissible = false,
}: AdSlotProps) {
	const { t } = useTranslation();
	const openSupport = useSupportModalStore((state) => state.open);

	const [isDismissed, setIsDismissed] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const insRef = useRef<HTMLModElement | null>(null);
	const adPushedRef = useRef(false);

	const config = FORMAT_CONFIG[format];
	const isAdsEnabled =
		env.NEXT_PUBLIC_ADS_ENABLED === "true" ||
		process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
	const clientId =
		env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
		process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isMounted || !isAdsEnabled) return;

		// Si no hay slotId o clientId configurado, activamos el fallback de Patreon/Sponsor
		if (!slotId || !clientId) {
			setIsBlocked(true);
			return;
		}

		let checkTimer: NodeJS.Timeout | null = null;

		// Intentamos inicializar el anuncio una única vez por ciclo de vida
		try {
			if (!adPushedRef.current && insRef.current) {
				// Verificamos que el <ins> no tenga ya un iframe renderizado
				if (!insRef.current.getAttribute("data-adsbygoogle-status")) {
					(window.adsbygoogle = window.adsbygoogle || []).push({});
					adPushedRef.current = true;
				}
			}
		} catch (err) {
			console.warn("[AdSense] Error pushing slot:", err);
			setIsBlocked(true);
		}

		// Detector seguro de Brave Shields / uBlock Origin
		checkTimer = setTimeout(() => {
			if (insRef.current) {
				const hasIframe = insRef.current.querySelector("iframe");
				const status = insRef.current.getAttribute("data-adsbygoogle-status");
				const isZeroHeight = insRef.current.clientHeight === 0 && insRef.current.clientWidth === 0;

				// Si no hay status de adsbygoogle, o no hay iframe cargado, o el contenedor fue colapsado por AdBlock
				if (!status || status === "unfilled" || isZeroHeight || (!hasIframe && !status)) {
					setIsBlocked(true);
				}
			} else {
				setIsBlocked(true);
			}
		}, 1500);

		return () => {
			if (checkTimer) clearTimeout(checkTimer);
		};
	}, [isMounted, isAdsEnabled, slotId, clientId]);

	// Si los anuncios están deshabilitados globalmente, o si fue cerrado por el usuario
	if (!isAdsEnabled || isDismissed) {
		return null;
	}

	return (
		<div
			className={`relative flex items-center justify-center bg-zinc-950/90 border border-zinc-800/80 rounded-lg overflow-hidden shadow-xl select-none transition-all duration-300 ${config.containerClass} ${className}`}
			style={{ minWidth: config.adWidth, minHeight: config.adHeight }}
		>
			{/* Etiqueta técnica superior de patrocinio */}
			<div className="absolute top-1.5 right-2 z-10 flex items-center gap-1 pointer-events-none">
				<span className="font-mono text-[9px] tracking-widest text-zinc-600 uppercase font-bold">
					SPONSOR // TELEMETRY
				</span>
			</div>

			{/* Botón de cierre para formatos descartables (ej: móvil sticky) */}
			{dismissible && (
				<button
					type="button"
					onClick={() => setIsDismissed(true)}
					className="absolute top-1.5 left-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors shadow-sm cursor-pointer active:scale-95"
					title={t("common.close", "Cerrar")}
					aria-label="Cerrar anuncio"
				>
					<X className="h-3 w-3" />
				</button>
			)}

			{/* Anuncio real de AdSense */}
			{!isBlocked && slotId && clientId ? (
				<ins
					ref={insRef}
					className="adsbygoogle block"
					style={{
						display: "inline-block",
						width: config.adWidth,
						height: config.adHeight,
					}}
					data-ad-client={clientId}
					data-ad-slot={slotId}
					data-ad-format={config.adFormatAttr}
					data-full-width-responsive="false"
				/>
			) : (
				/* Fallback elegante cuando AdBlock / Brave Shields está activo o no hay slotId real */
				<div className="flex h-full w-full flex-col items-center justify-center p-2 text-center font-mono">
					{format === "mobile-banner" ? (
						<div className="flex items-center justify-between w-full px-3 gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<ShieldAlert className="h-4 w-4 text-amber-500/80 shrink-0" />
								<p className="text-[10px] text-zinc-400 font-bold uppercase truncate">
									{t("ads.support_project_short", "Telemetría 100% Libre")}
								</p>
							</div>
							<button
								type="button"
								onClick={() => openSupport()}
								className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all text-[10px] font-black uppercase tracking-wider active:scale-95 cursor-pointer"
							>
								<Heart className="h-3 w-3 fill-amber-500/30 text-amber-400" />
								<span>{t("ads.sponsor_cta", "Apoyar")}</span>
							</button>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center gap-2 max-w-sm px-4">
							<div className="flex items-center gap-2 text-amber-500/90">
								<ShieldAlert className="h-4 w-4" />
								<span className="text-[11px] font-black uppercase tracking-wider">
									{t("ads.patreon_badge", "CLUB PITWALL // SPONSOR")}
								</span>
							</div>
							<p className="text-[11px] text-zinc-400 leading-tight">
								{t(
									"ads.support_desc",
									"Mantenemos los servidores de telemetría y streams sin trackers invasivos. Colaborá con el proyecto en Patreon o Cafecito."
								)}
							</p>
							<div className="flex items-center gap-2 mt-0.5">
								<button
									type="button"
									onClick={() => openSupport()}
									className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all text-[10px] font-black uppercase tracking-wider active:scale-95 cursor-pointer shadow-sm"
								>
									<Heart className="h-3 w-3 fill-amber-500/30 text-amber-400" />
									<span>{t("ads.support_cta", "Apoyá en Patreon / Cafecito")}</span>
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
