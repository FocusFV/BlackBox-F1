"use client";

import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
    streamUrl: string;
    title?: string;
}

export default function HLSPlayer({ streamUrl, title = "FocusFV Live" }: HLSPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {});
            });
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [streamUrl]);

    return (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
            <video 
                ref={videoRef}
                controls
                autoPlay
                className="w-full h-full"
                playsInline
            />
            {title && (
                <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded text-sm font-medium">
                    {title}
                </div>
            )}
        </div>
    );
}