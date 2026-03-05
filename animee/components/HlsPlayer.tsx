'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  poster?: string;
}

export default function HlsPlayer({ src, poster }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
    }
  }, [src]);

  return (
    <video 
      ref={videoRef} 
      controls 
      autoPlay
      poster={poster}
      style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'black' }}
    />
  );
}
