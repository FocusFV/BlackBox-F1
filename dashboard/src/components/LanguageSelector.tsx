"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronDown } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

interface LanguageSelectorProps {
	variant?: "navbar" | "drawer" | "settings";
}

export default function LanguageSelector({ variant = "navbar" }: LanguageSelectorProps) {
	const { language, setLanguage, languages } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Cerrar al hacer clic afuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const currentLang = languages.find((l) => l.code === language) || languages[0];

	// Variante 1: Cajón Móvil (3 botones compactos alineados con bandera SVG)
	if (variant === "drawer") {
		return (
			<div className="flex items-center gap-1.5 w-full bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800">
				{languages.map((lang) => {
					const isSelected = lang.code === language;
					return (
						<button
							key={lang.code}
							type="button"
							onClick={() => {
								triggerHaptic("light");
								setLanguage(lang.code);
							}}
							className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
								isSelected
									? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
									: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
							}`}
						>
							<img
								src={`/country-flags/${lang.countryCode || "esp"}.svg`}
								alt={lang.name}
								className="w-4 h-2.5 object-cover rounded-xs border border-zinc-700/60 shadow-xs shrink-0"
							/>
							<span>{lang.code.toUpperCase()}</span>
						</button>
					);
				})}
			</div>
		);
	}

	// Variante 2: Ajustes (Tarjetas amplias seleccionables)
	if (variant === "settings") {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
				{languages.map((lang) => {
					const isSelected = lang.code === language;
					return (
						<button
							key={lang.code}
							type="button"
							onClick={() => {
								triggerHaptic("medium");
								setLanguage(lang.code);
							}}
							className={`flex items-center gap-3 p-3.5 rounded-xl border font-mono transition-all text-left cursor-pointer ${
								isSelected
									? "bg-amber-500/10 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-amber-300"
									: "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-900/40"
							}`}
						>
							<div className="flex items-center justify-center p-1 rounded-lg bg-zinc-900 border border-zinc-700/60 shadow-sm shrink-0">
								<img
									src={`/country-flags/${lang.countryCode || "esp"}.svg`}
									alt={lang.name}
									className="w-7 h-5 object-cover rounded-xs"
								/>
							</div>
							<div className="flex flex-col">
								<span className="text-xs font-black uppercase tracking-wider">
									{lang.name}
								</span>
								<span className="text-[10px] text-zinc-400 font-sans">
									{lang.code.toUpperCase()} · {lang.code === "es" ? "Predeterminado" : lang.code === "en" ? "Official F1" : "América Latina"}
								</span>
							</div>
						</button>
					);
				})}
			</div>
		);
	}

	// Variante 3: Navbar Escritorio (Dropdown compacto elegante con bandera SVG nítida)
	return (
		<div className="relative z-50" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-transparent border border-transparent hover:border-zinc-800 hover:bg-zinc-900/40 text-xs font-mono font-bold text-zinc-300 hover:text-amber-400 transition-all cursor-pointer active:scale-95"
				title="Cambiar idioma / Switch language"
			>
				<img
					src={`/country-flags/${currentLang.countryCode || "esp"}.svg`}
					alt={currentLang.name}
					className="w-4 h-3 object-cover rounded-xs border border-zinc-700/60 shadow-xs shrink-0"
				/>
				<span className="uppercase text-[11px] tracking-wider">{currentLang.code}</span>
				<ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-400" : ""}`} />
			</button>

			{isOpen && (
				<div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-800/90 bg-[#09090b] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.95)] z-[99999] font-mono animate-fade-in">
					{languages.map((lang) => {
						const isSelected = lang.code === language;
						return (
							<button
								key={lang.code}
								type="button"
								onClick={() => {
									triggerHaptic("light");
									setLanguage(lang.code);
									setIsOpen(false);
								}}
								className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
									isSelected
										? "bg-amber-500/15 text-amber-400 font-black border border-amber-500/30"
										: "text-zinc-300 hover:bg-zinc-900 hover:text-white"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<img
										src={`/country-flags/${lang.countryCode || "esp"}.svg`}
										alt={lang.name}
										className="w-4 h-3 object-cover rounded-xs border border-zinc-700/60 shadow-xs shrink-0"
									/>
									<span>{lang.name}</span>
								</div>
								{isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
