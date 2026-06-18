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
	
	const isParcFerme = !session || (!!lapCount && lapCount.CurrentLap >= lapCount.TotalLaps);

	return (
		<div className="flex w-full flex-col gap-4 bg-zinc-950 text-zinc-100 min-h-screen">
			
			{/* CONTENIDO PRINCIPAL */}
			{isParcFerme ? (
				<div className="flex flex-col gap-6 w-full">
					{/* El candado elegante en el centro */}
					<ParcFerme />
					
					{/* 📺 CAROUSEL PREMIUM DE VIDEOS: Resúmenes en vivo */}
					<YouTubeFeed />
				</div>
			) : (
				<>
					{/* Panel en vivo normal (Líderes, mapa, radios...) */}
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