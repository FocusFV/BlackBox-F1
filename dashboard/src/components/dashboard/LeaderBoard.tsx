import { AnimatePresence, LayoutGroup } from "motion/react";
import clsx from "clsx";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

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

                            return finalGrid.map((timingDriver: any, index: number) => {
                                const driverKey = timingDriver.resolvedNumber;
                                return (
                                    <Driver
                                        key={`leaderBoard.driver.${driverKey || index}`}
                                        position={index + 1}
                                        driver={drivers[driverKey]}
                                        timingDriver={timingDriver}
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
    const carMetrics = useSettingsStore((state) => state.carMetrics);

    return (
        <div
            className="grid items-center gap-2 p-1.5 px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 select-none border-b border-zinc-900 pb-1.5"
            style={{
                gridTemplateColumns: carMetrics
                    ? "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto 13rem"
                    : "5.5rem 3.8rem 5.5rem 4rem 5.5rem 6.2rem auto",
            }}
        >
            <p>POS</p>
            <p className="text-center">BOOST</p>
            <p className="text-center">GOMA</p>
            <p className="text-center">INFO</p>
            <p className="text-left pl-1">BRECHA / INT</p>
            <p className="text-left pl-1">VUELTA</p>
            <div className="flex gap-1.5">
                <p className="w-[4.85rem] text-center">S1</p>
                <p className="w-[4.85rem] text-center">S2</p>
                <p className="w-[4.85rem] text-center">S3</p>
            </div>
            {carMetrics && <p className="pl-1">TELEMETRÍA</p>}
        </div>
    );
};

const SkeletonDriver = () => {
    const carMetrics = useSettingsStore((state) => state.carMetrics);

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