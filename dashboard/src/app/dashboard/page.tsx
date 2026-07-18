"use client";

import LeaderBoard from "@/components/dashboard/LeaderBoard";
import RaceControl from "@/components/dashboard/RaceControl";
import TeamRadios from "@/components/dashboard/TeamRadios";
import TrackViolations from "@/components/dashboard/TrackViolations";
import Map from "@/components/dashboard/Map";
import Footer from "@/components/Footer";
import { ParcFerme } from "@/components/dashboard/ParcFerme";
import { useDataStore } from "@/stores/useDataStore";
import { YouTubeFeed } from "@/components/dashboard/YouTubeFeed"; 

export default function Page() {
	const dataStore = useDataStore();
	
	const session = dataStore.state?.SessionInfo;
	const lapCount = dataStore.state?.LapCount;
	const sessionStatus = dataStore.state?.SessionStatus?.Status;
	
	// 🏎️ MODO MOTORES APAGADOS / PARQUE CERRADO BLINDADO
	// Si no hay sesión en el store (Offline), si la API manda estado de cierre ("Ends"/"Finalised"),
	// o si ya se completaron todas las vueltas programadas, la telemetría se guarda en boxes.
	const isOfflineOrFerme = !session || 
		sessionStatus === "Ends" || 
		sessionStatus === "Finalised" || 
		(session.Name === "Race" && !!lapCount && lapCount.CurrentLap >= lapCount.TotalLaps);

	return (
		<div className="flex w-full flex-col gap-4 bg-zinc-950 text-zinc-100 min-h-screen">
			
			{/* CONTENIDO PRINCIPAL */}
			{isOfflineOrFerme ? (
				<div className="flex flex-col gap-6 w-full">
					{/* El candado premium con el historial del GP anterior */}
					<ParcFerme />
					
					{/* 📺 Feed oficial de YouTube con los mejores momentos */}
					<YouTubeFeed />
				</div>
			) : (
				<>
					{/* HUD de comando en vivo (Solo visible con Bandera Verde / Motores Encendidos) */}
					<div className="flex w-full flex-col gap-2 2xl:flex-row">
						<div className="overflow-x-auto">
							<LeaderBoard />
						</div>
						<div className="flex-1 2xl:max-h-[50rem]">
							<Map />
						</div>
					</div>
					
					<div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
						<div>
							<RaceControl />
						</div>
						<div>
							<TeamRadios />
						</div>
						<div>
							<TrackViolations />
						</div>
					</div>
				</>
			)}

			<Footer />
		</div>
	);
}