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
		<div>
			<h1 className="mb-4 text-3xl">Ajustes</h1>

			<h2 className="my-4 text-2xl">Visual</h2>

			<div className="flex gap-2">
				<Toggle enabled={settings.carMetrics} setEnabled={(v) => settings.setCarMetrics(v)} />
				<p className="text-zinc-500">Mostrar datos del auto (RPM, marcha, velocidad)</p>
			</div>

			<div className="flex gap-2">
				<Toggle enabled={settings.showCornerNumbers} setEnabled={(v) => settings.setShowCornerNumbers(v)} />
				<p className="text-zinc-500">Mostrar el número de las curvas en el mapa de la pista</p>
			</div>

			<div className="flex gap-2">
				<Toggle enabled={settings.tableHeaders} setEnabled={(v) => settings.setTableHeaders(v)} />
				<p className="text-zinc-500">Mostrar el encabezado de la tabla de pilotos</p>
			</div>

			<div className="flex gap-2">
				<Toggle enabled={settings.showBestSectors} setEnabled={(v) => settings.setShowBestSectors(v)} />
				<p className="text-zinc-500">Mostrar los mejores sectores de los pilotos</p>
			</div>

			<div className="flex gap-2">
				<Toggle enabled={settings.showMiniSectors} setEnabled={(v) => settings.setShowMiniSectors(v)} />
				<p className="text-zinc-500">Mostrar los minisectores de los pilotos</p>
			</div>

			<div className="flex gap-2">
				<Toggle enabled={settings.oledMode} setEnabled={(v) => settings.setOledMode(v)} />
				<p className="text-zinc-500">Modo OLED (Fondo negro puro)</p>
			</div>

			<div className="flex gap-2">
				<Toggle enabled={settings.useSafetyCarColors} setEnabled={(v) => settings.setUseSafetyCarColors(v)} />
				<p className="text-zinc-500">Usar colores del Auto de Seguridad</p>
			</div>

			<h2 className="my-4 text-2xl">Dirección de Carrera</h2>

			<div className="flex gap-2">
				<Toggle enabled={settings.raceControlChime} setEnabled={(v) => settings.setRaceControlChime(v)} />
				<p className="text-zinc-500">Reproducir un sonido cuando haya un nuevo mensaje de Dirección de Carrera</p>
			</div>

			{settings.raceControlChime && (
				<div className="flex flex-row items-center gap-2">
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
						className="!w-52"
						value={settings.raceControlChimeVolume}
						setValue={(v) => settings.setRaceControlChimeVolume(v)}
					/>

					<p className="text-zinc-500">Volumen del sonido de Dirección de Carrera</p>
				</div>
			)}

			<h2 className="my-4 text-2xl">Pilotos Favoritos</h2>

			<p className="mb-4">Seleccioná tus pilotos favoritos para resaltarlos en el panel principal.</p>

			<FavoriteDrivers />

			<h2 className="my-4 text-2xl">Unidad de Velocidad</h2>

			<p className="mb-4">Elegí la unidad en la que querés que se muestre la velocidad.</p>

			<SegmentedControls
				id="speed-unit"
				selected={settings.speedUnit}
				onSelect={settings.setSpeedUnit}
				options={[
					{ label: "km/h", value: "metric" },
					{ label: "mp/h", value: "imperial" },
				]}
			/>

			<h2 className="my-4 text-2xl">Retraso (Delay)</h2>

			<p className="mb-4">
				Acá tenés la opción de configurar un retraso para los datos; se mostrará la cantidad de segundos ingresados más tarde respecto de la transmisión en vivo. En la página del panel principal tenés este mismo campo para ajustar el delay sin necesidad de venir hasta los ajustes. Lo podés encontrar arriba de todo, a la derecha.
			</p>

			<div className="flex items-center gap-2">
				<DelayTimer />
				<DelayInput />
				<p className="text-zinc-500">Retraso en segundos</p>
			</div>

			<Button className="mt-2 bg-red-500!" onClick={() => settings.setDelay(0)}>
				Reiniciar retraso
			</Button>

			<Footer />
		</div>
	);
}