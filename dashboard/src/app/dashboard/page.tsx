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

	const isOfflineOrFerme = !session || 
		sessionStatus === "Ends" || 
		sessionStatus === "Finalised" || 
		(session.Name === "Race" && !!lapCount && lapCount.CurrentLap >= lapCount.TotalLaps);

	return (
		<div className="flex w-full flex-col gap-4 px-4 py-4 text-zinc-100">

			{/* 🧪 BYPASS DE PRUEBA: Forzamos el render para ver si el componente responde */}
			<div className="flex flex-col gap-6 w-full">
				<ParcFerme />
				<YouTubeFeed />
			</div>

			<Footer />
		</div>
	);
}