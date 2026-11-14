"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import clsx from "clsx";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";
import { useTranslation } from "@/hooks/useTranslation";

import { sortPos } from "@/lib/sorting";

import Driver from "@/components/driver/Driver";

export default function LeaderBoard() {
    const drivers = useDataStore(({ state }) => state?.DriverList);
    const driversTiming = useDataStore(({ state }) => state?.TimingData);

    const showTableHeader = useSettingsStore((state) => state.tableHeaders);

    return (
        <div className="flex w-fit min-w-full max-w-full flex-col gap-0.5">
            {showTableHeader && <TableHeaders />}

            {(!drivers || !driversTiming) &&
                new Array(20).fill("").map((_, index) => <SkeletonDriver key={`driver.loading.${index}`} />)}

            <LayoutGroup key="drivers">
                {drivers && driversTiming && driversTiming.Lines && (
                    <AnimatePresence>
                        {(() => {
                            // 1. Filtrar solo pilotos que existan en la lista oficial de la sesión
                            const validDrivers = Object.entries(driversTiming.Lines)
                                .map(([key, timingDriver]: [string, any]) => ({
                                    ...timingDriver,
                                    resolvedNumber: timingDriver?.RacingNumber ?? timingDriver?.Line ?? key,
                                }))
                                .filter((timingDriver: any) => {
                                    const driverInfo = drivers[timingDriver.resolvedNumber];
                                    return Boolean(driverInfo);
                                });

                            // 2. Si hay más de 22 pilotos (por ejemplo, si coincidieron pilotos de prueba y titulares por datos heredados),
                            // agrupamos por escudería y tomamos como máximo 2 monoplazas activos por equipo (regla FIA 2026: 11 equipos x 2 autos = 22)
                            const teamCounts: Record<string, number> = {};
                            const sorted = [...validDrivers].sort(sortPos);

                            const prioritized = sorted.filter((d) => {
                                const driverInfo = drivers[d.resolvedNumber];
                                const team = driverInfo?.TeamName || driverInfo?.TeamColour || "unknown";
                                const currentCount = teamCounts[team] || 0;
                                if (currentCount < 2) {
                                    teamCounts[team] = currentCount + 1;
                                    return true;
                                }
                                return false;
                            });

                            // Límite reglamentario FIA: Máximo 22 monoplazas (11 escuderías en 2026)
                            const finalGrid = (prioritized.length >= 20 ? prioritized : sorted).slice(0, 22);

                            let lastValidGapSec = 0;
                            let lastLapsDown = 0;

                            return finalGrid.map((timingDriver: any, index: number) => {
                                const driverKey = timingDriver.resolvedNumber;
                                const pos = index + 1;
                                const isDNF = Boolean(timingDriver.Retired || timingDriver.Stopped);

                                let cumulativeGap = "";
                                const rawGtl = (timingDriver.GapToLeader || "").trim();
                                const rawInterval = (timingDriver.IntervalToPositionAhead?.Value || "").trim();
                                const intervalGap = rawInterval && !rawInterval.includes("L") ? (rawInterval.startsWith("+") ? rawInterval : `+${rawInterval}`) : rawInterval;

                                if (isDNF) {
                                    cumulativeGap = "RET";
                                } else if (pos === 1) {
                                    cumulativeGap = "LÍDER";
                                } else {
                                    const lapMatch = rawGtl.match(/^(\d+)\s*L/i) || rawGtl.match(/^\+(\d+)\s*L/i);
                                    if (lapMatch) {
                                        const laps = parseInt(lapMatch[1], 10);
                                        lastLapsDown = Math.max(lastLapsDown, laps);
                                        cumulativeGap = laps === 1 ? "+1 VTA" : `+${laps} VTAS`;
                                    } else if (rawGtl.includes(":")) {
                                        cumulativeGap = rawGtl.startsWith("+") ? rawGtl : `+${rawGtl}`;
                                    } else if (rawGtl) {
                                        const numSec = parseFloat(rawGtl.replace("+", ""));
                                        if (!isNaN(numSec) && numSec > 0) {
                                            if (numSec >= lastValidGapSec && lastLapsDown === 0) {
                                                lastValidGapSec = numSec;
                                                cumulativeGap = `+${numSec.toFixed(3)}`;
                                            } else if (lastLapsDown > 0) {
                                                cumulativeGap = lastLapsDown === 1 ? "+1 VTA" : `+${lastLapsDown} VTAS`;
                                            } else {
                                                const intrNum = parseFloat(rawInterval.replace("+", ""));
                                                lastValidGapSec += (!isNaN(intrNum) && intrNum > 0 ? intrNum : 0.8);
                                                cumulativeGap = `+${lastValidGapSec.toFixed(3)}`;
                                            }
                                        } else {
                                            cumulativeGap = rawGtl;
                                        }
                                    } else {
                                        if (lastLapsDown > 0) {
                                            cumulativeGap = lastLapsDown === 1 ? "+1 VTA" : `+${lastLapsDown} VTAS`;
                                        } else {
                                            const intrNum = parseFloat(rawInterval.replace("+", ""));
                                            if (!isNaN(intrNum) && intrNum > 0) {
                                                lastValidGapSec += intrNum;
                                                cumulativeGap = `+${lastValidGapSec.toFixed(3)}`;
                                            } else {
                                                cumulativeGap = lastValidGapSec > 0 ? `+${lastValidGapSec.toFixed(3)}` : `+${(pos * 1.5).toFixed(3)}`;
                                            }
                                        }
                                    }
                                }

                                return (
                                    <Driver
                                        key={`leaderBoard.driver.${driverKey || index}`}
                                        position={pos}
                                        driver={drivers[driverKey]}
                                        timingDriver={timingDriver}
                                        cumulativeGap={cumulativeGap}
                                        intervalGap={intervalGap}
                                    />
                                );
                            });
                        })()}
                    </AnimatePresence>
                )}
            </LayoutGroup>
        </div>
    );
}

const TableHeaders = () => {
    const isSimActive = typeof window !== "undefined" && (sessionStorage.getItem("f1_pitwall_sim") === "active");
    const carMetrics = useSettingsStore((state) => state.carMetrics) || isSimActive;
    const { t } = useTranslation();

    return (
        <div
            className="grid items-center gap-2 p-1.5 px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 select-none border-b border-zinc-900 pb-1.5"
            style={{
                gridTemplateColumns: carMetrics
                    ? "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto 13rem"
                    : "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto",
            }}
        >
            <p>{t("telemetry.position", "POS")}</p>
            <p className="text-center">{t("telemetry.boost", "BOOST")}</p>
            <p className="text-center">{t("telemetry.tyre", "GOMA")}</p>
            <p className="text-center">{t("telemetry.info", "INFO")}</p>
            <p className="text-left pl-1">{t("telemetry.gap_int", "BRECHA / INT")}</p>
            <p className="text-left pl-1">{t("telemetry.lap", "VUELTA")}</p>
            <div className="flex gap-1.5">
                <p className="w-[4.85rem] text-center">S1</p>
                <p className="w-[4.85rem] text-center">S2</p>
                <p className="w-[4.85rem] text-center">S3</p>
            </div>
            {carMetrics && <p className="pl-1">{t("telemetry.telemetry_title", "TELEMETRÍA")}</p>}
        </div>
    );
};

const SkeletonDriver = () => {
    const isSimActive = typeof window !== "undefined" && (sessionStorage.getItem("f1_pitwall_sim") === "active");
    const carMetrics = useSettingsStore((state) => state.carMetrics) || isSimActive;

    const animateClass = "h-8 animate-pulse rounded-md bg-zinc-800";

    return (
        <div
            className="grid items-center gap-2 p-1.5"
            style={{
                gridTemplateColumns: carMetrics
                    ? "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto 13rem"
                    : "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto",
            }}
        >
            <div className={animateClass} style={{ width: "100%" }} />

            <div className={animateClass} style={{ width: "100%" }} />

            <div className="flex w-full gap-2">
                <div className={clsx(animateClass, "w-8")} />

                <div className="flex flex-1 flex-col gap-1">
                    <div className={clsx(animateClass, "h-4!")} />
                    <div className={clsx(animateClass, "h-3! w-2/3")} />
                </div>
            </div>

            {new Array(2).fill(null).map((_, index) => (
                <div className="flex w-full flex-col gap-1" key={`skeleton.${index}`}>
                    <div className={clsx(animateClass, "h-4!")} />
                    <div className={clsx(animateClass, "h-3! w-2/3")} />
                </div>
            ))}

            <div className="flex w-full flex-col gap-1">
                <div className={clsx(animateClass, "h-3! w-4/5")} />
                <div className={clsx(animateClass, "h-4!")} />
            </div>

            <div className="flex w-full gap-1">
                {new Array(3).fill(null).map((_, index) => (
                    <div className="flex w-full flex-col gap-1" key={`skeleton.sector.${index}`}>
                        <div className={clsx(animateClass, "h-4!")} />
                        <div className={clsx(animateClass, "h-3! w-2/3")} />
                    </div>
                ))}
            </div>

            {carMetrics && (
                <div className="flex w-full gap-2">
                    <div className={clsx(animateClass, "w-8")} />

                    <div className="flex flex-1 flex-col gap-1">
                        <div className={clsx(animateClass, "h-1/2!")} />
                        <div className={clsx(animateClass, "h-1/2!")} />
                    </div>
                </div>
            )}
        </div>
    );
};