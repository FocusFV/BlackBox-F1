"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

import { useSidebarStore } from "@/stores/useSidebarStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

import ConnectionStatus from "@/components/ConnectionStatus";
import DelayInput from "@/components/DelayInput";
import SidenavButton from "@/components/SidenavButton";
import DelayTimer from "@/components/DelayTimer";

import { 
	LayoutDashboard, 
	Map as MapIcon, 
	Trophy, 
	CloudSun, 
	Settings, 
	Calendar, 
	HelpCircle, 
	Coffee, 
	Heart,
	Cpu,
	Radio
} from "lucide-react";

interface MenuItem {
	href: string;
	name: string;
	icon: any;
	target?: string;
}

interface MenuCategory {
	titulo: string;
	items: MenuItem[];
}

const categoriesMenu: MenuCategory[] = [
	{
		titulo: "OPERACIONES",
		items: [
			{ href: "/dashboard", name: "Telemetría en Vivo", icon: LayoutDashboard },
			{ href: "/dashboard/track-map", name: "Telemetría Pista", icon: MapIcon },
		]
	},
	{
		titulo: "ANÁLISIS",
		items: [
			{ href: "/dashboard/weather", name: "El Clima", icon: CloudSun },
			{ href: "/dashboard/standings", name: "Campeonatos FIA", icon: Trophy },
			{ href: "/streams", name: "Feed Satelital", icon: Radio },
		]
	},
	{
		titulo: "SISTEMA",
		items: [
			{ href: "/dashboard/settings", name: "Ajustes", icon: Settings },
			{ href: "/schedule", name: "Calendario GP", icon: Calendar },
			{ href: "/help", name: "Ayuda", icon: HelpCircle, target: "_blank" },
		]
	},
	{
		titulo: "ENLACES",
		items: [
			{ href: "https://buymeacoffee.com/focusfv", name: "Donar un Cafecito", icon: Coffee, target: "_blank" },
			{ href: "https://github.com/sponsors/FocusFV", name: "Sponsor Oficial", icon: Heart, target: "_blank" },
		]
	}
];

type Props = {
	connected: boolean;
};

export default function Sidebar({ connected }: Props) {
	const pathname = usePathname();
	const { opened, pinned } = useSidebarStore();
	const close = useSidebarStore((state) => state.close);
	const open = useSidebarStore((state) => state.open);

	const pin = useSidebarStore((state) => state.pin);
	const unpin = useSidebarStore((state) => state.unpin);

	const oledMode = useSettingsStore((state) => state.oledMode);
	const setDelay = useSettingsStore((state) => state.setDelay);

	const handleForzarEnVivo = () => {
		setDelay(0);
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				unpin();
			}
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => window.removeEventListener("resize", handleResize, false);
	}, [unpin]);

	return (
		<div>
			<motion.div className="hidden md:block" style={{ width: 230 }} animate={{ width: pinned ? 230 : 8 }} />

			<AnimatePresence>
				{opened && (
					<motion.div
						onTouchEnd={() => close()}
						className="fixed top-0 right-0 bottom-0 left-0 z-30 bg-black/50 backdrop-blur-md md:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					/>
				)}
			</AnimatePresence>

			<motion.div
				className="no-scrollbar fixed top-0 bottom-0 left-0 z-40 flex overflow-y-auto select-none p-2 md:p-3"
				onHoverEnd={!pinned ? () => close() : undefined}
				onHoverStart={!pinned ? () => open() : undefined}
				animate={{ left: pinned || opened ? 0 : -230 }}
				transition={{ type: "spring", bounce: 0.05, duration: 0.4 }}
			>
				<nav
					className={clsx(
						"flex w-56 flex-col p-4 font-mono transition-all duration-500 rounded-2xl border",
						!oledMode && "bg-[#0c0a05]/60 backdrop-blur-2xl border-amber-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),_inset_0_1px_1px_rgba(255,255,255,0.03)]",
						oledMode && "bg-black border-zinc-900"
					)}
				>
					{/* 🔝 CABECERA: Limpia y equilibrada */}
					<div className="flex items-center justify-between px-1 mb-4">
						<div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-500 tracking-wider">
							<Cpu className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
							BLACKBOX_F1
						</div>
						
						<div className="flex items-center gap-1.5">
							<ConnectionStatus connected={connected} />
							
							{/* Botón superior limpio (ya maneja el oro desde su propio archivo) */}
							<div className="flex items-center bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-lg p-0.5 transition-all duration-300">
								<SidenavButton className="hidden md:flex" onClick={() => (pinned ? unpin() : pin())} />
								<SidenavButton className="md:hidden" onClick={() => close()} />
							</div>
						</div>
					</div>

					{/* 🎛️ HUD DE DELAY: Contraste recuperado y legible */}
					<div className="bg-black/50 border border-zinc-900 rounded-xl p-2.5 mb-5 space-y-2.5 shadow-inner">
						<div className="flex justify-between items-center px-0.5">
							<p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">// RETRASO FEED</p>
							<span className="text-[9px] font-bold text-amber-500/60 uppercase tracking-wider animate-pulse">Sincro</span>
						</div>

						{/* Fila del Control Real: Fondo oscuro limpio de filtros para leer el input perfecto */}
						<div className="flex items-center justify-between gap-1.5 bg-zinc-950/80 p-2 rounded-lg border border-zinc-900/60">
							<div className="flex items-center gap-1 overflow-hidden">
								<span className="text-[9px] text-zinc-500 font-bold block select-none mr-0.5">MS:</span>
								<DelayInput saveDelay={500} />
							</div>
							
							{/* Lógica del Timer */}
							<div className="flex items-center text-right border-l border-zinc-900/60 pl-2 font-bold text-amber-500">
								<DelayTimer />
							</div>
						</div>

						{/* Botón En Vivo */}
						<button 
							onClick={handleForzarEnVivo}
							className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/40 text-[10px] font-extrabold text-amber-500 uppercase tracking-widest transition-all duration-300 active:scale-95 group/btn"
						>
							<Radio className="w-3 h-3 text-amber-500 animate-pulse group-hover/btn:scale-110 transition-transform" />
							En Vivo
						</button>
					</div>

					{/* Secciones de menú */}
					<div className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
						{categoriesMenu.map((cat: MenuCategory, idx: number) => (
							<div key={idx} className="space-y-1.5">
								<p className="px-2.5 text-[9px] font-extrabold text-amber-500/50 uppercase tracking-widest">
									// {cat.titulo}
								</p>
								<div className="flex flex-col gap-1">
									{cat.items.map((item: MenuItem) => (
										<Item 
											key={item.href} 
											item={item} 
											icon={item.icon} 
											target={item.target} 
											pathname={pathname}
										/>
									))}
								</div>
							</div>
						))}
					</div>

					{/* Pie */}
					<div className="border-t border-zinc-900/80 pt-3 mt-4 flex items-center justify-between text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
						<span>SYS_CORE_V4.5</span>
						<span className="text-amber-500/40 animate-pulse">● ONLINE</span>
					</div>
				</nav>
			</motion.div>
		</div>
	);
}

type ItemProps = {
	target?: string;
	item: MenuItem;
	icon?: any;
	pathname: string;
};

const Item = ({ target, item, icon: Icon, pathname }: ItemProps) => {
	const active = pathname === item.href;

	return (
		<Link href={item.href} target={target} className="block relative group">
			<div
				className={clsx(
					"rounded-xl p-2.5 px-3 flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden border",
					active && "text-amber-100 bg-gradient-to-r from-amber-500/15 to-transparent border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.04)]",
					!active && "text-zinc-400 border-transparent hover:text-zinc-100 hover:bg-zinc-900/40"
				)}
			>
				{Icon && (
					<Icon className={clsx("w-4 h-4 transition-transform duration-500 group-hover:rotate-6", active ? "text-amber-500" : "text-zinc-500 group-hover:text-amber-500")} />
				)}
				<span className="relative z-10">{item.name}</span>
				<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-amber-500/5 via-transparent to-transparent" />
				<div className={clsx("absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 transition-transform duration-300 origin-bottom", active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100")} />
			</div>
			<div className="absolute -inset-0.5 rounded-xl bg-amber-500/5 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none -z-10" />
		</Link>
	);
};