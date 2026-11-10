'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useDataEngine } from '@/hooks/useDataEngine';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useStores } from '@/hooks/useStores';
import { useSocket } from '@/hooks/useSocket';

import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useDataStore } from '@/stores/useDataStore';

import Sidebar from '@/components/Sidebar';
import SidenavButton from '@/components/SidenavButton';
import SessionInfo from '@/components/SessionInfo';
import WeatherInfo from '@/components/WeatherInfo';
import TrackInfo from '@/components/TrackInfo';
import DelayInput from '@/components/DelayInput';
import DelayTimer from '@/components/DelayTimer';
import ConnectionStatus from '@/components/ConnectionStatus';
import SupportModal from '@/components/SupportModal';
import { Radio } from 'lucide-react';

type Props = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
	const stores = useStores();
	const { handleInitial, handleUpdate, maxDelay } = useDataEngine(stores);
	const { connected } = useSocket({ handleInitial, handleUpdate });

	const delay = useSettingsStore((state) => state.delay);
	const setDelay = useSettingsStore((state) => state.setDelay);
	const syncing = delay > maxDelay;

	useWakeLock();

	const ended = useDataStore(({ state }) => state?.SessionStatus?.Status === 'Ends');

	return (
		<div className="flex h-screen w-full md:pt-2 md:pr-2 md:pb-2">
			<Sidebar key="sidebar" connected={connected} />

			<motion.div layout="size" className="flex h-full w-full flex-1 flex-col md:gap-2">
				<DesktopStaticBar show={!syncing || ended} />
				<MobileStaticBar show={!syncing || ended} connected={connected} />

				<div
					className={
						!syncing || ended ? 'no-scrollbar w-full flex-1 overflow-auto md:rounded-lg' : 'hidden'
					}
				>
					<MobileDynamicBar />
					{children}
				</div>

				<div
					className={
						syncing && !ended
							? 'flex h-full flex-1 flex-col items-center justify-center p-4 border-zinc-800 md:rounded-lg md:border'
							: 'hidden'
					}
				>
					<div className="max-w-md w-full border border-zinc-800/80 bg-[#0c0a05]/70 backdrop-blur-md p-8 rounded-3xl text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-fade-in font-mono">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
							<Radio className="w-8 h-8 animate-pulse text-amber-400" />
						</div>

						<span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5">
							TELEMETRÍA EN BÚFER
						</span>
						<h2 className="text-xl font-black uppercase tracking-tight text-zinc-100">
							Sincronizando con la TV
						</h2>

						<p className="text-zinc-400 text-xs font-sans mt-2 mb-5 leading-relaxed">
							Calibrando el flujo de datos para sincronizar con tu transmisión en vivo.
						</p>

						<div className="w-full px-5 py-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col items-center mb-5">
							<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
								Tiempo de espera restante
							</span>
							<span className="text-4xl font-black font-mono mt-1 tracking-widest text-emerald-400">
								{Math.max(delay - maxDelay, 0)}s
							</span>
							<span className="text-[10px] text-zinc-500 mt-1">
								Retraso deseado: <span className="text-zinc-300 font-semibold">{delay}s</span> • Búfer cargado: <span className="text-zinc-300 font-semibold">{maxDelay}s</span>
							</span>
						</div>

						<div className="flex flex-col w-full gap-2.5">
							<button
								onClick={() => setDelay(0)}
								className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
							>
								Ver en vivo directo (0s de espera)
							</button>

							{maxDelay > 0 && (
								<button
									onClick={() => setDelay(maxDelay)}
									className="text-zinc-500 hover:text-zinc-300 text-[11px] font-sans underline transition-colors cursor-pointer py-1"
								>
									Usar retraso disponible de {maxDelay}s sin esperar
								</button>
							)}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Contenedor principal */}
		</div>
	);
}

function MobileDynamicBar() {
	return (
		<div className="flex flex-col divide-y divide-zinc-800 border-b border-zinc-800 md:hidden">
			<div className="px-3.5 py-2">
				<SessionInfo />
			</div>
		</div>
	);
}

function MobileStaticBar({ show, connected }: { show: boolean; connected: boolean }) {
	const toggle = useSidebarStore((state) => state.toggle);

	return (
		<div className="relative z-20 flex w-full items-center justify-between overflow-hidden border-b border-zinc-800/90 bg-zinc-950/90 backdrop-blur-md p-2 md:hidden shadow-md">
			<div className="flex items-center gap-2">
				<SidenavButton key="mobile" onClick={() => toggle()} title="Menú lateral" />

				<DelayInput saveDelay={500} />
				<DelayTimer />

				<ConnectionStatus connected={connected} />
			</div>

			{show && <TrackInfo />}
		</div>
	);
}

function DesktopStaticBar({ show }: { show: boolean }) {
	const pinned = useSidebarStore((state) => state.pinned);
	const togglePin = useSidebarStore((state) => state.togglePin);

	return (
		<div className="relative z-20 hidden w-full flex-row justify-between overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/85 backdrop-blur-xl p-2.5 shadow-xl md:flex">
			<div className="flex items-center gap-2">
				<SidenavButton 
					key="desktop" 
					className="shrink-0" 
					onClick={() => togglePin()} 
					title={pinned ? "Ocultar menú lateral" : "Fijar menú lateral"}
				/>

				<motion.div key="session-info" layout="position">
					<SessionInfo />
				</motion.div>
			</div>

			<div className="flex justify-end">{show && <TrackInfo />}</div>
		</div>
	);
}