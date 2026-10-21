'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const VIDEO_ID = 'hSgiQQ3vEo8';

export function HeroBackground() {
  const playerRef = useRef<any>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const w = window as any;
    let destroyed = false;

    const createPlayer = () => {
      if (destroyed || !w.YT?.Player) return;
      playerRef.current = new w.YT.Player('epn-hero-video', {
        videoId: VIDEO_ID,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          playlist: VIDEO_ID
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            e.target.playVideo();
          }
        }
      });
    };

    if (w.YT?.Player) {
      createPlayer();
    } else {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        createPlayer();
      };
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }

    return () => {
      destroyed = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // player may already be gone on fast unmounts
      }
    };
  }, []);

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) {
      p.unMute();
      p.setVolume?.(60);
    } else {
      p.mute();
    }
    setMuted(!muted);
  };

  return (
    <>
      {/* Cover-sized video area (16:9 cover technique) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 w-full h-full min-w-[177.78vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2">
          <div id="epn-hero-video" />
        </div>
        {/* Readability overlays */}
        <div className="absolute inset-0 bg-white/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/85" />
      </div>

      {/* Sound toggle (starts muted to satisfy browser autoplay policy) */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-[11px] font-semibold text-slate-700 backdrop-blur transition-colors"
        aria-label={muted ? 'Turn video sound on' : 'Mute video sound'}
      >
        {muted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-sky-600" />}
        <span>{muted ? 'Play with sound' : 'Mute background video'}</span>
      </button>
    </>
  );
}
