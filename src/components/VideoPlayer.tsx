import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Settings, AlertCircle, Info } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  facultyName?: string;
  date?: string;
  onClose?: () => void;
}

export default function VideoPlayer({ videoUrl, title, facultyName, date, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsStatePlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup HLS or standard playbacks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasError(false);
    setIsLoading(true);

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().then(() => {
          setIsStatePlaying(true);
        }).catch(() => {
          // Playback blocked by browser autoplay rules, state remains paused nicely
          setIsStatePlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("Fatal network error in video stream. Retrying...");
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("Fatal media error. Recovering...");
              hls?.recoverMediaError();
              break;
            default:
              setHasError(true);
              setIsLoading(false);
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native support (Safari)
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().then(() => {
          setIsStatePlaying(true);
        }).catch(() => {
          setIsStatePlaying(false);
        });
      });

      video.addEventListener("error", () => {
        setHasError(true);
        setIsLoading(false);
      });
    } else {
      // Fallback
      setHasError(true);
      setIsLoading(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl]);

  // Handle updates
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsStatePlaying(false);
    } else {
      video.play().then(() => {
        setIsStatePlaying(true);
      });
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleDurationChange = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, 'a').replace('a', seconds.toString().padStart(2, '0'))}`;
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 animate-slide-up">
      {/* Video viewscreen container with relative ratio aspects */}
      <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
        
        {/* Actual HTML Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain pointer-events-auto"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          referrerPolicy="no-referrer"
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-400">Loading StudyIQ Stream...</span>
          </div>
        )}

        {/* Error Fallback (e.g. IVS CDN Down or CORS blocks) */}
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 to-slate-950 flex flex-col items-center justify-center p-6 text-center gap-4">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-md font-bold text-white mb-1">IVS Broadcast Stream Restricted</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                The StudyIQ live lecture DRM streaming node is secured. Simulating active player dashboard controls below.
              </p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg py-2 px-4 flex items-center gap-2 text-xs text-indigo-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>Streaming source is resolved to AWS masterpl.m3u8</span>
            </div>
          </div>
        )}

        {/* Custom controller skin triggered on group-hover */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 pointer-events-auto">
          {/* Progress Seek bar slider */}
          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="grow h-1.5 accent-indigo-500 rounded-lg cursor-pointer bg-slate-800/80 outline-none"
            />
            <span>{formatTime(duration || 1800)}</span>
          </div>

          {/* Quick controls pane */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1 text-slate-100 hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all outline-none"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="p-1 text-slate-400 hover:text-indigo-400 transition-colors outline-none"
                title="Restart Lecture"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-800"></div>

              {/* Muted toggle trigger */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 text-slate-400 hover:text-indigo-400 transition-colors outline-none"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback rate speed selector options */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 rounded-lg p-1 text-[10px] font-medium text-slate-400">
                {[1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-0.5 rounded transition-all outline-none ${
                      playbackRate === speed
                        ? "bg-indigo-600 text-white font-bold"
                        : "hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleFullscreen}
                className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors outline-none"
                title="Full-Screen Playback"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Under Stage Meta-info card */}
      <div className="p-5 border-t border-slate-850 bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Playing Stream
            </span>
            {date && <span className="text-[11px] text-slate-500 font-mono">{date}</span>}
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          {facultyName && (
            <p className="text-xs text-indigo-400 font-medium">
              Lecturer: <span className="font-semibold">{facultyName}</span> (StudyIQ Faculty)
            </p>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-slate-300 font-semibold rounded-lg text-xs transition-all pointer-events-auto"
          >
            Close Streaming Window
          </button>
        )}
      </div>
    </div>
  );
}
