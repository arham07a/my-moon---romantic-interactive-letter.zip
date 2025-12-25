
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Flame, Music, Wind } from 'lucide-react';
import { Theme } from '../types';

interface AmbientPlayerProps {
  theme: Theme;
  accentColor: string;
  isExternalPlaying?: boolean;
}

const SOUNDS = [
  { id: 'space', name: 'Space Hum', icon: <Wind size={16} />, url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_24e2358826.mp3' },
  { id: 'rain', name: 'Gentle Rain', icon: <CloudRain size={16} />, url: 'https://cdn.pixabay.com/download/audio/2022/07/04/audio_32c25c6a18.mp3' },
  { id: 'fire', name: 'Fireplace', icon: <Flame size={16} />, url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_82c6504a4e.mp3' },
];

const AmbientPlayer: React.FC<AmbientPlayerProps> = ({ theme, accentColor, isExternalPlaying = false }) => {
  // Default to playing true, but volume low for "relaxing bg sound"
  const [isPlaying, setIsPlaying] = useState(true);
  const [userPaused, setUserPaused] = useState(false); // Track if user explicitly paused it
  const [volume, setVolume] = useState(0.15); // Low default volume
  const [currentSound, setCurrentSound] = useState(SOUNDS[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<any>(null);

  // Helper to smoothly fade volume
  const fadeVolume = (targetVol: number, onComplete?: () => void) => {
    if (!audioRef.current) return;
    
    // Clear any existing fade
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const step = 0.01; // Slower, smoother step
    const intervalTime = 40; // 40ms updates

    const fade = setInterval(() => {
        if (!audioRef.current) {
            clearInterval(fade);
            return;
        }

        let currentVol = audioRef.current.volume;
        
        // Tolerance for floating point comparison
        if (Math.abs(currentVol - targetVol) < step * 1.5) {
            audioRef.current.volume = targetVol;
            clearInterval(fade);
            fadeIntervalRef.current = null;
            if (onComplete) onComplete();
            return;
        }

        if (currentVol < targetVol) {
            audioRef.current.volume = Math.min(1, currentVol + step);
        } else {
            audioRef.current.volume = Math.max(0, currentVol - step);
        }
    }, intervalTime);

    fadeIntervalRef.current = fade;
  };

  // One-time listener to start audio context if autoplay was blocked
  useEffect(() => {
      const unlockAudio = () => {
          if (audioRef.current && isPlaying && !userPaused && !isExternalPlaying) {
              audioRef.current.play().catch(() => {
                  // Still blocked, wait for next interaction
              });
          }
      };

      document.addEventListener('click', unlockAudio, { once: true });
      return () => document.removeEventListener('click', unlockAudio);
  }, [isPlaying, userPaused, isExternalPlaying]);


  // Handle external interruptions (e.g., Main Playlist playing) with Fading
  useEffect(() => {
    if (!audioRef.current) return;

    if (isExternalPlaying) {
      // Fade out to 0, then pause
      fadeVolume(0, () => {
          if(audioRef.current) {
              audioRef.current.pause();
          }
      });
    } else {
      // If we are supposed to be playing, start playing and fade up to set volume
      if (isPlaying && !userPaused) {
        // Ensure we start from 0 if we were paused
        if (audioRef.current.paused) {
            audioRef.current.volume = 0;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                    fadeVolume(volume);
                })
                .catch(() => {
                    // Autoplay prevented
                });
            }
        } else {
            // Already playing, just adjust volume back up
            fadeVolume(volume);
        }
      }
    }
    
    return () => {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    }
  }, [isExternalPlaying, isPlaying, userPaused]);

  // Handle manual volume/sound changes
  useEffect(() => {
    if (audioRef.current && !isExternalPlaying) {
      // Direct volume update if not fading/external
      if (!fadeIntervalRef.current) {
          audioRef.current.volume = volume;
      }
      
      if (isPlaying && !userPaused) {
        audioRef.current.play().catch(() => {});
      } else if (!isExternalPlaying) {
        audioRef.current.pause();
      }
    }
  }, [volume, currentSound]);

  const togglePlay = () => {
      const newState = !isPlaying;
      setIsPlaying(newState);
      setUserPaused(!newState);
      
      if (newState && !isExternalPlaying && audioRef.current) {
          audioRef.current.volume = 0;
          audioRef.current.play().then(() => fadeVolume(volume)).catch(() => {});
      }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-rose-200';
  const textColor = isDark ? 'text-white' : 'text-slate-800';

  return (
    <div className={`fixed bottom-24 left-4 z-40 flex flex-col items-start gap-2 transition-all duration-300 ${isExpanded ? 'w-48' : 'w-12'}`}>
      <audio ref={audioRef} src={currentSound.url} loop crossOrigin="anonymous" />
      
      {/* Expanded Controls */}
      {isExpanded && (
        <div className={`${bgColor} backdrop-blur-md border rounded-xl p-3 shadow-xl flex flex-col gap-3 w-full animate-fadeIn mb-2`}>
          <div className="flex justify-between items-center border-b pb-2 border-current border-opacity-10">
            <span className={`text-xs font-medium uppercase tracking-wider ${textColor} opacity-70`}>Ambience</span>
          </div>

          <div className="flex gap-2 justify-between">
            {SOUNDS.map(sound => (
              <button
                key={sound.id}
                onClick={() => {
                  setCurrentSound(sound);
                  if (!isPlaying) {
                      setIsPlaying(true);
                      setUserPaused(false);
                  }
                }}
                className={`p-2 rounded-full transition-all ${
                  currentSound.id === sound.id 
                    ? 'text-white scale-110 shadow-lg' 
                    : `${isDark ? 'hover:bg-slate-700' : 'hover:bg-rose-100'} ${textColor} opacity-60`
                }`}
                style={currentSound.id === sound.id ? { backgroundColor: accentColor } : {}}
                title={sound.name}
              >
                {sound.icon}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
             <VolumeX size={14} className={textColor} />
             <input 
                type="range" 
                min="0" 
                max="0.6" // Cap max volume to keep it background
                step="0.01" 
                value={volume}
                onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setVolume(newVol);
                    if(audioRef.current && !isExternalPlaying) audioRef.current.volume = newVol;
                }}
                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: accentColor }}
             />
             <Volume2 size={14} className={textColor} />
          </div>
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            isPlaying && !userPaused && !isExternalPlaying ? 'text-white animate-pulse-slow' : `${bgColor} ${textColor}`
        }`}
        style={isPlaying && !userPaused && !isExternalPlaying ? { backgroundColor: accentColor } : {}}
      >
        {isExternalPlaying ? (
            <span className="text-[10px] font-bold animate-pulse">MUTE</span>
        ) : (
            <Music size={20} className={isPlaying && !userPaused ? 'animate-spin-slow' : ''} />
        )}
      </button>
    </div>
  );
};

export default AmbientPlayer;
