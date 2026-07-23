"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

import xIcon from "public/icons/xmark.svg";

import { env } from "@/env";
import { useSettingsStore } from "@/stores/useSettingsStore";

import DriverTag from "@/components/driver/DriverTag";
import SelectMultiple from "@/components/ui/SelectMultiple";

// 🏎️ LISTA DE RESPALDO (Temporada F1): Garantiza que siempre puedas buscar aunque la telemetría esté apagarla
const FALLBACK_DRIVERS = [
	{ number: "1", name: "Max Verstappen", tla: "VER", color: "#061d43" },
	{ number: "44", name: "Lewis Hamilton", tla: "HAM", color: "#e10600" },
	{ number: "16", name: "Charles Leclerc", tla: "LEC", color: "#e10600" },
	{ number: "4", name: "Lando Norris", tla: "NOR", color: "#ff8700" },
	{ number: "81", name: "Oscar Piastri", tla: "PIA", color: "#ff8700" },
	{ number: "63", name: "George Russell", tla: "RUS", color: "#00d2be" },
	{ number: "12", name: "Kimi Antonelli", tla: "ANT", color: "#00d2be" },
	{ number: "14", name: "Fernando Alonso", tla: "ALO", color: "#006f62" },
	{ number: "18", name: "Lance Stroll", tla: "STR", color: "#006f62" },
	{ number: "10", name: "Pierre Gasly", tla: "GAS", color: "#ff00ff" },
	{ number: "43", name: "Franco Colapinto", tla: "COL", color: "#ff00ff" },
	{ number: "23", name: "Alexander Albon", tla: "ALB", color: "#005aff" },
	{ number: "55", name: "Carlos Sainz", tla: "SAI", color: "#005aff" },
	{ number: "30", name: "Liam Lawson", tla: "LAW", color: "#4b77ff" },
	{ number: "22", name: "Yuki Tsunoda", tla: "TSU", color: "#4b77ff" },
	{ number: "27", name: "Nico Hulkenberg", tla: "HUL", color: "#1f1f1f" },
	{ number: "5", name: "Gabriel Bortoleto", tla: "BOR", color: "#1f1f1f" },
	{ number: "31", name: "Esteban Ocon", tla: "OCO", color: "#e10600" },
	{ number: "87", name: "Oliver Bearman", tla: "BEA", color: "#e10600" },
	{ number: "41", name: "Arvid Lindblad", tla: "LIN", color: "#061d43" },
];

export default function FavoriteDrivers() {
	const [drivers, setDrivers] = useState<any[]>(FALLBACK_DRIVERS);

	const { favoriteDrivers, setFavoriteDrivers, removeFavoriteDriver } = useSettingsStore();

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`${env.NEXT_PUBLIC_LIVE_URL}/api/drivers`);
				if (!res.ok) return;
				const data = await res.json();
				
				let list: any[] = [];
				if (Array.isArray(data)) {
					list = data;
				} else if (data && typeof data === "object") {
					list = Array.isArray(data.drivers) ? data.drivers : Object.values(data);
				}

				if (list.length > 0) {
					const normalized = list.map((d: any) => {
						const number = String(d.RacingNumber || d.driver_number || d.number || "").trim();
						const name = d.FullName || d.full_name || d.broadcast_name || d.name || `Piloto #${number}`;
						const tla = d.Tla || d.name_acronym || d.code || number;
						const color = d.TeamColour || d.team_colour || "27272a";

						return {
							number,
							name,
							tla,
							color: color.startsWith("#") ? color : `#${color}`
						};
					}).filter(d => d.number !== "");

					if (normalized.length > 0) {
						setDrivers(normalized);
					}
				}
			} catch (e) {
				console.log("Servidor en boxes, usando grilla base F1.");
			}
		})();
	}, []);

	// Opciones formateadas de manera limpia para el Select
	const options = drivers.map((d) => ({
		label: `${d.name} (#${d.number})`,
		value: String(d.number)
	}));

	return (
		<div className="flex flex-col gap-4 w-full items-center">
			{/* Pilotos seleccionados */}
			<div className="flex flex-wrap gap-2 justify-center min-h-[36px] items-center">
				{favoriteDrivers.length === 0 && (
					<p className="text-xs text-zinc-500 font-mono italic">No hay pilotos favoritos seleccionados.</p>
				)}

				{favoriteDrivers.map((driverNumber) => {
					const driver = drivers.find((d) => String(d.number) === String(driverNumber));

					return (
						<div key={driverNumber} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 shadow-md">
							<DriverTag teamColor={driver?.color || "#3f3f46"} short={driver?.tla || `#${driverNumber}`} />
							<span className="text-xs font-bold text-zinc-200">{driver?.name || `Piloto #${driverNumber}`}</span>

							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								onClick={() => removeFavoriteDriver(driverNumber)}
								className="ml-1 opacity-60 hover:opacity-100 transition"
							>
								<Image src={xIcon} alt="x" width={14} height={14} />
							</motion.button>
						</div>
					);
				})}
			</div>

			{/* Input Buscador */}
			<div className="w-full max-w-md relative">
				<SelectMultiple
					placeholder="Escribí un nombre o número (ej: HAM, 44, COL...)"
					options={options}
					selected={favoriteDrivers}
					setSelected={setFavoriteDrivers}
				/>
			</div>
		</div>
	);
}