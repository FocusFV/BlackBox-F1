"use client";

import { useSettingsStore, type GoldTheme } from "@/stores/useSettingsStore";
import { triggerHaptic } from "@/lib/haptics";
import Toggle from "@/components/ui/Toggle";
import Slider from "@/components/ui/Slider";
import Input from "@/components/ui/Input";
import SegmentedControls from "@/components/ui/SegmentedControls";
import FavoriteDrivers from "@/components/settings/FavoriteDrivers";
import Footer from "@/components/Footer";
import { 
	Volume2, 
	Monitor, 
	Sliders, 
	Sparkles, 
	Smartphone, 
	Vibrate, 
	Layers, 
	Clock3 
} from "lucide-react";

export default function Settings() {
	const settings = useSettingsStore();

	const themeOptions: {
		value: GoldTheme;
		label: string;
		desc: string;
		icon: string;
		swatchGradient: string;
		glowBorder: string;
	}[] = [
		{
			value: "classic",
			label: "Oro 24K Blackbox Clásico",
			desc: "El tono ámbar dorado oficial de la plataforma con contraste cinematográfico y sombras profundas.",
			icon: "🏆",
			swatchGradient: "from-amber-600 via-amber-400 to-amber-500",
			glowBorder: "border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
		},
		{
			value: "neon",
			label: "Oro Neón Ultra-Glow",
			desc: "Dorado electrizante de alta luminosidad (#FFD700) para máxima visibilidad nocturna.",
			icon: "⚡",
			swatchGradient: "from-yellow-400 via-yellow-200 to-amber-300",
			glowBorder: "border-yellow-400/80 shadow-[0_0_25px_rgba(255,215,0,0.4)]",
		},
		{
			value: "rose",
			label: "Oro Rosa / Champagne",
			desc: "Matiz cobrizo cálido de súper lujo con acabado de metal pulido rosáceo (#F43F5E).",
			icon: "💎",
			swatchGradient: "from-rose-500 via-rose-300 to-amber-300",
			glowBorder: "border-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.35)]",
		},
		{
			value: "oled",
			label: "Modo OLED Negro Puro",
			desc: "Negro absoluto (#000000) con oro de alto contraste para ahorrar batería en pantallas OLED.",
			icon: "🌙",
			swatchGradient: "from-amber-500 via-amber-300 to-black",
			glowBorder: "border-amber-400/70 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
		},
	];

	return (
		<div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-3xl space-y-8 pb-12 font-mono">
				
				{/* HEADER PRINCIPAL */}
				<div className="border-b border-zinc-800 pb-4 text-center">
					<h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center justify-center gap-2">
						<span className="text-amber-500">⚙️</span> Centro de Control & Ajustes
					</h1>
					<p className="text-xs text-zinc-400 mt-1 max-w-lg mx-auto">
						Personalizá el comportamiento visual, la paleta de oro, las alertas de radio y las unidades de la telemetría en vivo.
					</p>

					{/* Badge Wake Lock siempre activo */}
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mt-3 shadow-xs">
						<Smartphone className="w-3.5 h-3.5" />
						<span>Modo Segunda Pantalla: Wake Lock permanente activo (pantalla encendida)</span>
					</div>
				</div>

				{/* SECCIÓN 1: PALETA DE ORO & ESTÉTICA DE LA APP */}
				<section className="bg-zinc-950/60 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl space-y-5 shadow-2xl relative overflow-hidden">
					<div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

					<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
						<Sparkles className="w-4 h-4 text-amber-400" />
						<div>
							<h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
								Paleta de Oro & Tema Blackbox
							</h2>
							<p className="text-[11px] text-zinc-400 font-sans">
								Elegí el estilo de acento dorado que viste la barra de navegación, botones, tacómetros y modales.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
						{themeOptions.map((opt) => {
							const isSelected = settings.goldTheme === opt.value;
							return (
								<button
									key={opt.value}
									type="button"
									onClick={() => {
										settings.setGoldTheme(opt.value);
										triggerHaptic("medium");
									}}
									className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-300 relative cursor-pointer group ${
										isSelected
											? `bg-amber-500/15 ${opt.glowBorder} text-white`
											: "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70 hover:text-zinc-200"
									}`}
								>
									<div className="flex items-center justify-between w-full mb-2">
										<span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-zinc-100">
											<span>{opt.icon}</span>
											<span>{opt.label}</span>
										</span>
										{isSelected && (
											<span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase">
												Activo
											</span>
										)}
									</div>

									{/* Muestra visual de color (swatch) */}
									<div className="w-full h-2 rounded-full overflow-hidden bg-zinc-800 mb-2">
										<div className={`h-full w-full bg-gradient-to-r ${opt.swatchGradient}`} />
									</div>

									<p className="text-[11px] text-zinc-400 font-sans font-medium leading-relaxed">
										{opt.desc}
									</p>
								</button>
							);
						})}
					</div>
				</section>

				{/* SECCIÓN 2: INTERACCIÓN TÁCTIL & RENDIMIENTO EN MÓVIL */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-5 shadow-2xl">
					<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
						<Vibrate className="w-4 h-4 text-amber-400" />
						<div>
							<h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
								Interacción Táctil & Densidad
							</h2>
							<p className="text-[11px] text-zinc-400 font-sans">
								Personalizá la respuesta física en mano y el tamaño de las grillas de telemetría.
							</p>
						</div>
					</div>

					<div className="space-y-4 pt-1">
						{/* Respuesta Háptica */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<div className="flex items-start gap-3">
								<Toggle 
									enabled={settings.hapticFeedback} 
									setEnabled={(v) => {
										settings.setHapticFeedback(v);
										if (v) triggerHaptic("heavy");
									}} 
								/>
								<div className="flex flex-col">
									<span className="text-xs font-bold text-zinc-200 uppercase">Respuesta Háptica Táctil</span>
									<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
										Emite una micro-vibración física estilo volante F1 al tocar botones, pestañas de sesión y pilotos (en celulares compatibles).
									</span>
								</div>
							</div>
							{settings.hapticFeedback && (
								<button
									type="button"
									onClick={() => triggerHaptic("heavy")}
									className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all shrink-0 cursor-pointer self-start sm:self-center"
								>
									📳 Probar Vibración
								</button>
							)}
						</div>

						{/* Densidad de la Grilla */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-lg bg-zinc-800 text-amber-400 shrink-0">
									<Layers className="w-4 h-4" />
								</div>
								<div className="flex flex-col">
									<span className="text-xs font-bold text-zinc-200 uppercase">Densidad de Grilla de Pilotos</span>
									<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
										Confort muestra fotos y filas holgadas. Pit-Wall compacta las filas para ver los 20 autos sin scrollear.
									</span>
								</div>
							</div>
							<div className="shrink-0 self-start sm:self-center">
								<SegmentedControls
									id="grid-density"
									selected={settings.gridDensity}
									onSelect={(v) => {
										settings.setGridDensity(v as "compact" | "comfort");
										triggerHaptic("light");
									}}
									options={[
										{ label: "Confort", value: "comfort" },
										{ label: "Pit-Wall", value: "compact" },
									]}
								/>
							</div>
						</div>

						{/* Formato de Tiempos Preferido */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-lg bg-zinc-800 text-amber-400 shrink-0">
									<Clock3 className="w-4 h-4" />
								</div>
								<div className="flex flex-col">
									<span className="text-xs font-bold text-zinc-200 uppercase">Visualización de Tiempos</span>
									<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
										Elegí si preferís ver por defecto el intervalo con el auto de adelante o la diferencia acumulada respecto al líder (P1).
									</span>
								</div>
							</div>
							<div className="shrink-0 self-start sm:self-center">
								<SegmentedControls
									id="time-format"
									selected={settings.timeFormat}
									onSelect={(v) => {
										settings.setTimeFormat(v as "interval" | "leader");
										triggerHaptic("light");
									}}
									options={[
										{ label: "Intervalo (+0.4s)", value: "interval" },
										{ label: "Diferencia P1", value: "leader" },
									]}
								/>
							</div>
						</div>
					</div>
				</section>

				{/* SECCIÓN 3: VISUALIZACIÓN & LIVE-HUD */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-2xl">
					<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
						<Monitor className="w-4 h-4 text-amber-400" />
						<div>
							<h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
								Visualización & Telemetría en Pantalla
							</h2>
							<p className="text-[11px] text-zinc-400 font-sans">
								Ajustá qué capas de datos querés ver superpuestas durante las carreras.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
						{/* Car Metrics */}
						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.carMetrics} setEnabled={(v) => settings.setCarMetrics(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Métricas de Auto (RPM / Marcha / Vel)</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Muestra el cambio actual, tacómetro de revoluciones por minuto y velocidad en vivo de cada monoplaza.
								</span>
							</div>
						</div>

						{/* Corner numbers */}
						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.showCornerNumbers} setEnabled={(v) => settings.setShowCornerNumbers(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Números de Curva en el Mapa</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Etiqueta cada curva del circuito (T1, T2, etc.) en el mapa satelital para seguir los sobrepasos con precisión.
								</span>
							</div>
						</div>

						{/* Table headers */}
						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.tableHeaders} setEnabled={(v) => settings.setTableHeaders(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Encabezados de Grilla</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Muestra las columnas superiores fijas (POS, PILOTO, INTERVALO, S1, S2, S3, NEUMÁTICOS).
								</span>
							</div>
						</div>

						{/* Best Sectors */}
						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.showBestSectors} setEnabled={(v) => settings.setShowBestSectors(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Mejores Sectores (Púrpura / Verde)</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Destaca en púrpura el récord absoluto de pista y en verde el récord personal del piloto en esa vuelta.
								</span>
							</div>
						</div>

						{/* Minisectors */}
						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.showMiniSectors} setEnabled={(v) => settings.setShowMiniSectors(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Minisectores en Tiempo Real</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Desglosa cada uno de los 20+ microsectores del circuito para ver aceleración y frenada curva por curva.
								</span>
							</div>
						</div>

						{/* Safety Car Colors */}
						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.useSafetyCarColors} setEnabled={(v) => settings.setUseSafetyCarColors(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Alertas de Safety Car (SC / VSC)</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Tiñe la cabecera en amarillo parpadeante durante Auto de Seguridad o amarillo virtual en incidentes.
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* SECCIÓN 4: PILOTOS FAVORITOS */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-2xl flex flex-col items-center text-center">
					<div className="flex flex-col items-center border-b border-zinc-800/80 pb-3 w-full">
						<h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
							Pilotos Preferidos
						</h2>
						<p className="text-[11px] text-zinc-400 font-sans max-w-md mt-0.5">
							Tus pilotos seleccionados aparecerán con un marco destacado en la tabla de tiempos y sus radios de equipo se priorizarán en vivo.
						</p>
					</div>
					
					<div className="w-full flex flex-col items-center pt-2">
						<FavoriteDrivers />
					</div>
				</section>

				{/* SECCIÓN 5: DIRECCIÓN DE CARRERA & AUDIO */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-2xl">
					<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
						<Volume2 className="w-4 h-4 text-amber-400" />
						<div>
							<h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
								Dirección de Carrera & Audio
							</h2>
							<p className="text-[11px] text-zinc-400 font-sans">
								Alertas audibles y reproducción automática de comunicaciones por radio del Pit-Wall.
							</p>
						</div>
					</div>

					<div className="space-y-3.5 pt-1">
						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.raceControlChime} setEnabled={(v) => settings.setRaceControlChime(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Chime de Alerta de FIA / Race Control</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Emite un aviso sonoro sutil cada vez que Dirección de Carrera publica una sanción, bandera amarilla o bandera roja.
								</span>
							</div>
						</div>

						<div className="flex items-start gap-3 bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.autoPlayFavoriteRadios} setEnabled={(v) => settings.setAutoPlayFavoriteRadios(v)} />
							<div className="flex flex-col">
								<span className="text-xs font-bold text-zinc-200 uppercase">Auto-reproducir Radios de Favoritos</span>
								<span className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
									Reproduce automáticamente el mensaje de voz entre ingeniero y piloto apenas se emite en la transmisión oficial.
								</span>
							</div>
						</div>

						{settings.raceControlChime && (
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/60 mt-3">
								<div className="flex items-center gap-3">
									<Input
										value={String(settings.raceControlChimeVolume)}
										setValue={(v) => {
											const numericValue = Number(v);
											if (!isNaN(numericValue)) {
												settings.setRaceControlChimeVolume(numericValue);
											}
										}}
									/>
									<Slider
										className="!w-44"
										value={settings.raceControlChimeVolume}
										setValue={(v) => settings.setRaceControlChimeVolume(v)}
									/>
								</div>
								<span className="text-xs text-zinc-400 font-mono">Volumen del chime de alerta ({settings.raceControlChimeVolume}%)</span>
							</div>
						)}
					</div>
				</section>

				{/* SECCIÓN 6: UNIDADES DE MEDIDA */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-2xl">
					<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
						<Sliders className="w-4 h-4 text-amber-400" />
						<div>
							<h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
								Escalas & Unidades
							</h2>
							<p className="text-[11px] text-zinc-400 font-sans">
								Configurá la unidad métrica para velocímetro, velocidad en trampa y telemetría de rectas.
							</p>
						</div>
					</div>

					<div className="space-y-2 flex flex-col items-center md:items-start pt-1">
						<SegmentedControls
							id="speed-unit"
							selected={settings.speedUnit}
							onSelect={settings.setSpeedUnit}
							options={[
								{ label: "Kilómetros por hora (km/h)", value: "metric" },
								{ label: "Millas por hora (mph)", value: "imperial" },
							]}
						/>
						<p className="text-[11px] text-zinc-500 font-sans mt-1">
							Estándar internacional FIA: km/h para telemetría oficial de monoplazas y sensores de Speed Trap.
						</p>
					</div>
				</section>

				<Footer />
			</div>
		</div>
	);
}
