
import React, { useEffect, useState } from 'react';
import { Theme } from '../types';

interface StarBackgroundProps {
  theme: Theme;
}

const StarBackground: React.FC<StarBackgroundProps> = ({ theme }) => {
  const [stars, setStars] = useState<{ id: number; left: number; top: number; size: number; duration: number; delay: number }[]>([]);
  const [smallMoons, setSmallMoons] = useState<{ id: number; left: number; top: number; size: number; rotation: number; duration: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }));
    setStars(newStars);

    const moons = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360,
      duration: Math.random() * 10 + 10
    }));
    setSmallMoons(moons);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className={`stars-container pointer-events-none fixed inset-0 z-0 transition-colors duration-1000 ${isDark ? 'bg-[#0B1026]' : 'bg-rose-50'}`}>
       
       {/* Gradient Overlay - Changes based on theme */}
       <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-[#0B1026] to-[#050510]' : 'opacity-100 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white via-rose-100/50 to-indigo-50'}`} />

       {/* The Main Moon - Glows differently in Light Mode */}
       {/* In Light Mode, it is now a white 'Day Moon' instead of a yellow sun */}
       <div className={`fixed top-12 right-8 md:top-16 md:right-16 transition-all duration-1000 
            ${isDark 
              ? 'w-32 h-32 md:w-48 md:h-48 bg-slate-200 shadow-[0_0_60px_rgba(255,255,255,0.3)]' 
              : 'w-24 h-24 md:w-32 md:h-32 bg-white/90 shadow-[0_0_40px_rgba(200,200,255,0.6)] border border-white'
            } rounded-full animate-[glow_4s_ease-in-out_infinite]`}>
          <div className="absolute inset-0 rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          
          {/* Craters - Now visible in BOTH modes to ensure it looks like a Moon, not a sun */}
          <>
            <div className={`absolute top-8 left-8 w-6 h-6 rounded-full opacity-50 ${isDark ? 'bg-slate-300' : 'bg-slate-100'}`}></div>
            <div className={`absolute bottom-10 right-10 w-10 h-10 rounded-full opacity-40 ${isDark ? 'bg-slate-300' : 'bg-slate-100'}`}></div>
            <div className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full opacity-60 ${isDark ? 'bg-slate-300' : 'bg-slate-100'}`}></div>
          </>
       </div>

      {/* Stars - Visible mostly in dark mode, faint in light mode */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full transition-opacity duration-1000 ${isDark ? 'bg-white opacity-70' : 'bg-indigo-300 opacity-30'}`}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s infinite ${star.delay}s`,
          }}
        />
      ))}

      {/* Floating Small Moons/Elements */}
      {smallMoons.map((moon) => (
        <div
            key={`moon-${moon.id}`}
            className={`absolute transition-colors duration-1000 ${isDark ? 'text-indigo-200/20' : 'text-indigo-300/40'}`}
            style={{
                left: `${moon.left}%`,
                top: `${moon.top}%`,
                fontSize: `${moon.size}px`,
                transform: `rotate(${moon.rotation}deg)`,
                animation: `float ${moon.duration}s ease-in-out infinite alternate`
            }}
        >
            {isDark ? '🌙' : '✨'}
        </div>
      ))}
      
      {/* Bottom Glow */}
      <div className={`fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t pointer-events-none transition-colors duration-1000 ${isDark ? 'from-[#0B1026] to-transparent' : 'from-rose-50 to-transparent'}`} />
    </div>
  );
};

export default StarBackground;
