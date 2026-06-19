"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Calendar } from "lucide-react";

interface YearSelectorProps {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export default function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const years = [2026, 2025, 2024, 2023, 2022, 2021];

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/80 border border-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer"
            >
                <Calendar className="w-3 h-3" />
                {selectedYear}
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 mt-2 w-24 bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-2xl"
                    >
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() => { onYearChange(year); setIsOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-400 hover:text-amber-500 hover:bg-zinc-900 transition-colors uppercase"
                            >
                                {year}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}