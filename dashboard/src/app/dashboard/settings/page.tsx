"use client";

import SegmentedControls from "@/components/ui/SegmentedControls";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import Input from "@/components/ui/Input";

import FavoriteDrivers from "@/components/settings/FavoriteDrivers";

import DelayInput from "@/components/DelayInput";
import DelayTimer from "@/components/DelayTimer";
import Toggle from "@/components/ui/Toggle";

import { useSettingsStore } from "@/stores/useSettingsStore";
import Footer from "@/components/Footer";

export default function SettingsPage() {
	const settings = useSettingsStore();

	return (
		<div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-3xl space-y-8 pb-12">
				
				{/* HEADER PRINCIPAL */}
				<div className="border-b border-zinc-800 pb-4 text-center">
					<h1 className="text-3xl font-black uppercase tracking-wider font-mono text-white flex items-center justify-center gap-2">
						<span className="text-amber-500">⚙️</span> Ajustes de Telemetría
					</h1>
					<p className="text-xs text-zinc-400 font-mono mt-1">
						Configurá el comportamiento visual, alertas de sonido y sincronización del Live-HUD.
					</p>
				</div>

				{/* SECCIÓN 1: VISUAL */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-2xl">
					<h2 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-widest border-b border-zinc-900 pb-2 text-center md:text-left">
						Visualización & Live-HUD
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
						<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.carMetrics} setEnabled={(v) => settings.setCarMetrics(v)} />
							<span className="text-xs font-medium text-zinc-300">Mostrar datos del auto (RPM, marcha, velocidad)</span>
						</div>

						<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.showCornerNumbers} setEnabled={(v) => settings.setShowCornerNumbers(v)} />
							<span className="text-xs font-medium text-zinc-300">Mostrar números de curva en el mapa</span>
						</div>

						<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.tableHeaders} setEnabled={(v) => settings.setTableHeaders(v)} />
							<span className="text-xs font-medium text-zinc-300">Mostrar encabezados de la grilla de tiempos</span>
						</div>

						<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.showBestSectors} setEnabled={(v) => settings.setShowBestSectors(v)} />
							<span className="text-xs font-medium text-zinc-300">Mostrar mejores sectores de los pilotos</span>
						</div>

						<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.showMiniSectors} setEnabled={(v) => settings.setShowMiniSectors(v)} />
							<span className="text-xs font-medium text-zinc-300">Mostrar minisectores en tiempo real</span>
						</div>

						<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
							<Toggle enabled={settings.oledMode} setEnabled={(v) => settings.setOledMode(v)} />
							<span className="text-xs font-medium text-zinc-300">Modo OLED (Fondo negro puro #000000)</span>
						</div>

						<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900 md:col-span-2">
							<Toggle enabled={settings.useSafetyCarColors} setEnabled={(v) => settings.setUseSafetyCarColors(v)} />
							<span className="text-xs font-medium text-zinc-300">Resaltar alertas con colores de Auto de Seguridad (SC / VSC)</span>
						</div>
					</div>
				</section>

				{/* SECCIÓN 2: PILOTOS FAVORITOS */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-2xl flex flex-col items-center text-center">
					<h2 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-widest border-b border-zinc-900 pb-2 w-full">
						Pilotos Favoritos
					</h2>
					<p className="text-xs text-zinc-400 max-w-md">
						Elegí a tus pilotos preferidos para destacarlos con un indicador especial en la grilla principal durante las carreras.
					</p>
					
					<div className="w-full flex flex-col items-center">
						<FavoriteDrivers />
					</div>
				</section>

				{/* SECCIÓN 3: DIRECCIÓN DE CARRERA */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-4 shadow-2xl">
					<h2 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-widest border-b border-zinc-900 pb-2 text-center md:text-left">
						Dirección de Carrera & Audio
					</h2>

					<div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
						<Toggle enabled={settings.raceControlChime} setEnabled={(v) => settings.setRaceControlChime(v)} />
						<span className="text-xs font-medium text-zinc-300">Sonido de alerta para nuevos avisos de FIA / Race Control</span>
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
							<span className="text-xs text-zinc-400 font-mono">Volumen del chime de alerta</span>
						</div>
					)}
				</section>

				{/* SECCIÓN 4: UNIDADES & DELAY */}
				<section className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-2xl">
					<h2 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-widest border-b border-zinc-900 pb-2 text-center md:text-left">
						Unidades & Sincronización
					</h2>

					<div className="space-y-2 flex flex-col items-center md:items-start">
						<p className="text-xs font-bold font-mono text-zinc-300 uppercase">Unidad de Velocidad</p>
						<SegmentedControls
							id="speed-unit"
							selected={settings.speedUnit}
							onSelect={settings.setSpeedUnit}
							options={[
								{ label: "km/h", value: "metric" },
								{ label: "mp/h", value: "imperial" },
							]}
						/>
					</div>

					<div className="border-t border-zinc-900 pt-4 space-y-3 flex flex-col items-center md:items-start text-center md:text-left">
						<p className="text-xs font-bold font-mono text-zinc-300 uppercase">Sincronización de Retraso (Delay)</p>
						<p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
							Si tu transmisión de TV/Streaming tiene delay respecto al WebSocket en vivo, podés pausar la telemetría los segundos exactos que necesites para matchear el audio de la transmisión.
						</p>

						<div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
							<DelayTimer />
							<DelayInput />
							<Button className="bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/40 text-xs py-1.5 px-3 rounded-lg" onClick={() => settings.setDelay(0)}>
								Reiniciar a 0s
							</Button>
						</div>
					</div>
				</section>

				<Footer />
			</div>
		</div>
	);
}