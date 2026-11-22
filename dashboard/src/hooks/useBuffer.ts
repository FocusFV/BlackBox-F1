import { useRef } from "react";

const KEEP_BUFFER_SECS = 5;
const MAX_BUFFER_FRAMES = 1200; // Máximo ~4-5 minutos de buffer rodante (evita fugas de memoria en carreras largas)

type Frame<T> = {
	data: T;
	timestamp: number;
};

export const useBuffer = <T>() => {
	const bufferRef = useRef<Frame<T>[]>([]);

	const push = (update: T) => {
		bufferRef.current.push({ data: update, timestamp: Date.now() });
		if (bufferRef.current.length > MAX_BUFFER_FRAMES) {
			bufferRef.current = bufferRef.current.slice(-MAX_BUFFER_FRAMES);
		}
	};

	const pushTimed = (update: T, timestamp: number) => {
		if (!Number.isFinite(timestamp) || timestamp < 0) return;

		bufferRef.current.push({ data: update, timestamp });
		if (bufferRef.current.length > MAX_BUFFER_FRAMES) {
			bufferRef.current = bufferRef.current.slice(-MAX_BUFFER_FRAMES);
		}
	};

	const latest = (): T | null => {
		const frame = bufferRef.current[bufferRef.current.length - 1];
		return frame ? frame.data : null;
	};

	const delayed = (delayedTime: number): T | null => {
		const buffer = bufferRef.current;
		const length = buffer.length;

		// Handle empty buffer
		if (length === 0) return null;

		// Handle case where all data is newer than delayedTime
		if (buffer[0].timestamp > delayedTime) return null;

		// Handle case where all data is older than delayedTime
		if (buffer[length - 1].timestamp < delayedTime) return buffer[length - 1].data;

		// binary search for the closest frame before delayedTime
		let left = 0;
		let right = length - 1;

		while (left <= right) {
			const mid = Math.floor((left + right) / 2);

			if (buffer[mid].timestamp <= delayedTime && (mid === length - 1 || buffer[mid + 1].timestamp > delayedTime)) {
				return buffer[mid].data;
			}

			if (buffer[mid].timestamp <= delayedTime) {
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}

		return null;
	};

	const cleanup = (delayedTime: number) => {
		const buffer = bufferRef.current;
		const length = buffer.length;

		// Handle empty buffer
		if (length === 0) return;
		if (length === 1) return;

		// Calculate the threshold time
		const thresholdTime = delayedTime - KEEP_BUFFER_SECS * 1000;

		// Find the index of the first frame that is newer than the threshold time
		let index = 0;
		while (index < length && buffer[index].timestamp <= thresholdTime) {
			index++;
		}

		// Ensure at least one frame is kept
		if (index > 0 && index < length) {
			bufferRef.current = buffer.slice(index - 1);
		} else if (index >= length) {
			bufferRef.current = [buffer[length - 1]];
		}
	};

	const maxDelay = (): number => {
		return bufferRef.current.length > 0 ? Math.floor((Date.now() - bufferRef.current[0].timestamp) / 1000) : 0;
	};

	const getFrames = (): Frame<T>[] => bufferRef.current;

	const loadFrames = (frames: Frame<T>[]) => {
		if (Array.isArray(frames) && frames.length > 0) {
			bufferRef.current = frames;
		}
	};

	return {
		push,
		pushTimed,
		latest,
		delayed,
		cleanup,
		maxDelay,
		getFrames,
		loadFrames,
	};
};
