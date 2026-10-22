"use client";

import { useEffect, useRef, useState } from "react";

import type { CarData, CarsData, Position, Positions, State } from "@/types/state.type";
import type { MessageInitial, MessageUpdate } from "@/types/message.type";

import { inflate } from "@/lib/inflate";
import { utcToLocalMs } from "@/lib/utcToLocalMs";

import { useSettingsStore } from "@/stores/useSettingsStore";

import { useBuffer } from "@/hooks/useBuffer";
import { useStatefulBuffer } from "@/hooks/useStatefulBuffer";

const UPDATE_MS = 200;

type Props = {
	updateState: (state: State) => void;
	updatePosition: (pos: Positions) => void;
	updateCarData: (car: CarsData) => void;
};

export const useDataEngine = ({ updateState, updatePosition, updateCarData }: Props) => {
	const buffers = {
		ExtrapolatedClock: useStatefulBuffer(),
		TopThree: useStatefulBuffer(),
		TimingStats: useStatefulBuffer(),
		TimingAppData: useStatefulBuffer(),
		WeatherData: useStatefulBuffer(),
		TrackStatus: useStatefulBuffer(),
		SessionStatus: useStatefulBuffer(),
		DriverList: useStatefulBuffer(),
		RaceControlMessages: useStatefulBuffer(),
		SessionInfo: useStatefulBuffer(),
		SessionData: useStatefulBuffer(),
		LapCount: useStatefulBuffer(),
		TimingData: useStatefulBuffer(),
		TeamRadio: useStatefulBuffer(),
		ChampionshipPrediction: useStatefulBuffer(),
	};

	const carBuffer = useBuffer<CarsData>();
	const posBuffer = useBuffer<Positions>();

	const [maxDelay, setMaxDelay] = useState<number>(0);

	const delayRef = useRef<number>(0);

	useEffect(() => {
		const unsubscribe = useSettingsStore.subscribe(
			(state) => state.delay,
			(delay) => {
				delayRef.current = delay;
			},
			{ fireImmediately: true },
		);
		return () => unsubscribe();
	}, []);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const handleInitial = (payload: any) => {
		// 🛠️ Mapeo inteligente para capturar CarData.z o CarDataZ indistintamente
		const carZ = payload["CarData.z"] || payload["CarDataZ"];
		const posZ = payload["Position.z"] || payload["PositionZ"];
		const initial = { ...payload };

		updateState(initial);

		Object.keys(buffers).forEach((key) => {
			const data = initial[key as keyof typeof initial];
			const buffer = buffers[key as keyof typeof buffers];
			if (data) buffer.push(data);
		});

		if (carZ) {
			try {
				const carData = inflate<CarData>(carZ);
				if (carData?.Entries?.[0]?.Cars) {
					updateCarData(carData.Entries[0].Cars);

					for (const entry of carData.Entries) {
						carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
					}
				}
			} catch (err) {
				console.error("[DataEngine] Error descomprimiendo CarData:", err);
			}
		}

		if (posZ) {
			try {
				const position = inflate<Position>(posZ);
				if (position?.Position?.[0]?.Entries) {
					updatePosition(position.Position[0].Entries);

					for (const entry of position.Position) {
						posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
					}
				}
			} catch (err) {
				console.error("[DataEngine] Error descomprimiendo Position:", err);
			}
		}
	};

	const handleUpdate = (payload: any) => {
		const carZ = payload["CarData.z"] || payload["CarDataZ"];
		const posZ = payload["Position.z"] || payload["PositionZ"];
		const update = { ...payload };

		Object.keys(buffers).forEach((key) => {
			const data = update[key as keyof typeof update];
			const buffer = buffers[key as keyof typeof buffers];
			if (data) buffer.push(data);
		});

		if (carZ) {
			try {
				const carData = inflate<CarData>(carZ);
				if (carData?.Entries) {
					for (const entry of carData.Entries) {
						carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
					}
				}
			} catch (err) {
				console.error("[DataEngine] Error descomprimiendo CarData update:", err);
			}
		}

		if (posZ) {
			try {
				const position = inflate<Position>(posZ);
				if (position?.Position) {
					for (const entry of position.Position) {
						posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
					}
				}
			} catch (err) {
				console.error("[DataEngine] Error descomprimiendo Position update:", err);
			}
		}
	};

	const handleCurrentState = () => {
    const delay = delayRef.current;

    if (delay === 0) {
        const newStateFrame: Record<string, State[keyof State]> = {};

        Object.keys(buffers).forEach((key) => {
            const buffer = buffers[key as keyof typeof buffers];
            const latest = buffer.latest() as State[keyof State];
            if (latest) newStateFrame[key] = latest;
        });

        // 🛡️ SOLUCIÓN: Solo actualizamos Zustand si realmente hay datos en el frame
        if (Object.keys(newStateFrame).length > 0) {
            updateState(newStateFrame);
        }

        const carFrame = carBuffer.latest();
        if (carFrame) updateCarData(carFrame);

        const posFrame = posBuffer.latest();
        if (posFrame) updatePosition(posFrame);
    } else {
        const delayedTimestamp = Date.now() - delay * 1000;
        const newStateFrame: Record<string, State[keyof State]> = {};

        Object.keys(buffers).forEach((key) => {
            const buffer = buffers[key as keyof typeof buffers];
            const delayed = buffer.delayed(delayedTimestamp) as State[keyof State];

            if (delayed) newStateFrame[key] = delayed;

            setTimeout(() => buffer.cleanup(delayedTimestamp), 0);
        });

        // 🛡️ SOLUCIÓN: Solo actualizamos Zustand si realmente hay datos en el frame retrasado
        if (Object.keys(newStateFrame).length > 0) {
            updateState(newStateFrame);
        }

        const carFrame = carBuffer.delayed(delayedTimestamp);
        if (carFrame) {
            updateCarData(carFrame);
            setTimeout(() => carBuffer.cleanup(delayedTimestamp), 0);
        }

        const posFrame = posBuffer.delayed(delayedTimestamp);
        if (posFrame) {
            updatePosition(posFrame);
            setTimeout(() => posBuffer.cleanup(delayedTimestamp), 0);
        }
    }

    const maxDelay = Math.min(
        ...Object.values(buffers)
            .map((buffer) => buffer.maxDelay())
            .filter((delay) => delay > 0),
    );

    setMaxDelay(maxDelay);
};

	useEffect(() => {
		intervalRef.current = setInterval(handleCurrentState, UPDATE_MS);
		return () => (intervalRef.current ? clearInterval(intervalRef.current) : void 0);
	}, []);

	return {
		handleUpdate,
		handleInitial,
		maxDelay,
	};
};