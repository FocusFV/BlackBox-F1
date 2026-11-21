"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import clsx from "clsx";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";
import { useTranslation } from "@/hooks/useTranslation";

import { sortPos } from "@/lib/sorting";
import { parseLapTimeToMs } from "@/lib/lapTime";

import Driver from "@/components/driver/Driver";

export default function LeaderBoard() {
    const { t, language } = useTranslation();
    const drivers = useDataStore(({ state }) => state?.DriverList);
    const driversTiming = useDataStore(({ state }) => state?.TimingData);
    const session = useDataStore(({ state }) => state?.SessionInfo);
    const lapCount = useDataStore(({ state }) => state?.LapCount);
    const sessionPart = useDataStore(({ state }) => state?.TimingData?.SessionPart);

    const isRaceOrSprint = Boolean(
        session?.Name === "Race" ||
        session?.Name === "Sprint" ||
        session?.Type === "Race" ||
        (lapCount?.TotalLaps && lapCount.TotalLaps > 0)
    );

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

                            const leaderBestMs = parseLapTimeToMs(finalGrid[0]?.BestLapTime?.Value);

                            return finalGrid.map((timingDriver: any, index: number) => {
                                const driverKey = timingDriver.resolvedNumber;
                                const pos = index + 1;
                                const isDNF = Boolean(timingDriver.Retired || timingDriver.Stopped);

                                let cumulativeGap = "";
                                let intervalGap = "";

                                // 🏎️ 1. Extraer brecha oficial de la FOM (en Carrera: GapToLeader, en Prácticas/Qualy: TimeDiffToFastest)
                                const rawGtl = String(
                                    timingDriver.GapToLeader ??
                                    (timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0]?.TimeDiffToFastest : undefined) ??
                                    timingDriver.TimeDiffToFastest ??
                                    ""
                                ).trim();

                                const rawInterval = String(
                                    timingDriver.IntervalToPositionAhead?.Value ??
                                    (timingDriver.Stats ? timingDriver.Stats[sessionPart ? sessionPart - 1 : 0]?.TimeDifftoPositionAhead : undefined) ??
                                    timingDriver.TimeDiffToPositionAhead ??
                                    ""
                                ).trim();

                                // 🏎️ 2. Si no viene en el paquete FOM directo pero ambos tienen tiempos de vuelta válidos (común en FP/Qualy):
                                const driverBestMs = parseLapTimeToMs(timingDriver?.BestLapTime?.Value);
                                const prevBestMs = index > 0 ? parseLapTimeToMs(finalGrid[index - 1]?.BestLapTime?.Value) : null;

                                let effectiveGtl = rawGtl;
                                if (!effectiveGtl && !isRaceOrSprint && pos > 1 && driverBestMs !== null && leaderBestMs !== null && driverBestMs >= leaderBestMs) {
                                    const diffSec = (driverBestMs - leaderBestMs) / 1000;
                                    effectiveGtl = `+${diffSec.toFixed(3)}`;
                                }

                                let effectiveInterval = rawInterval;
                                if (!effectiveInterval && !isRaceOrSprint && pos > 1 && driverBestMs !== null && prevBestMs !== null && driverBestMs >= prevBestMs) {
                                    const intSec = (driverBestMs - prevBestMs) / 1000;
                                    effectiveInterval = `+${intSec.toFixed(3)}`;
                                }

                                if (isDNF) {
                                    cumulativeGap = "RET";
                                } else if (pos === 1) {
                                    cumulativeGap = t("telemetry.leader", "LÍDER");
                                } else {
                                    const lapMatch = effectiveGtl.match(/^(\d+)\s*L/i) || effectiveGtl.match(/^\+(\d+)\s*L/i);
                                    if (lapMatch) {
                                        const laps = parseInt(lapMatch[1], 10);
                                        lastLapsDown = Math.max(lastLapsDown, laps);
                                        cumulativeGap = laps === 1 ? (language === "en" ? "+1 LAP" : "+1 VTA") : (language === "en" ? `+${laps} LAPS` : `+${laps} VTAS`);
                                    } else if (lastLapsDown > 0 && isRaceOrSprint) {
                                        cumulativeGap = lastLapsDown === 1 ? (language === "en" ? "+1 LAP" : "+1 VTA") : (language === "en" ? `+${lastLapsDown} LAPS` : `+${lastLapsDown} VTAS`);
                                    } else if (effectiveGtl.includes(":")) {
                                        cumulativeGap = effectiveGtl.startsWith("+") ? effectiveGtl : `+${effectiveGtl}`;
                                    } else if (effectiveGtl) {
                                        const numSec = parseFloat(effectiveGtl.replace("+", ""));
                                        if (!isNaN(numSec) && numSec > 0) {
                                            lastValidGapSec = numSec;
                                            cumulativeGap = `+${numSec.toFixed(3)}`;
                                        } else {
                                            cumulativeGap = effectiveGtl;
                                        }
                                    } else {
                                        // Monoplaza sin tiempo marcado en la sesión: queda vacío para que DriverGap muestre --.---
                                        cumulativeGap = "";
                                    }
                                }

                                if (effectiveInterval) {
                                    intervalGap = effectiveInterval.startsWith("+") || effectiveInterval.includes("L") ? effectiveInterval : `+${effectiveInterval}`;
                                } else {
                                    intervalGap = "";
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