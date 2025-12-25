
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  accentColor?: string;
  isDark?: boolean; // Added to handle theme specific styles
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', accentColor, isDark = true, style, onClick, ...props }) => {
  const baseStyles = "px-8 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm relative overflow-hidden group";
  
  // Sound Effect on Click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.05; // Reduced volume to prevent harsh overlap
      audio.play().catch(() => {});
      if (onClick) onClick(e);
  };

  let variantStyles = "";
  
  if (variant === 'primary') {
      // Primary: Solid Color (usually accent color)
      variantStyles = "text-white shadow-lg hover:shadow-xl border border-white/20";
  } else if (variant === 'secondary') {
      // Secondary: Glassy look
      if (isDark) {
          variantStyles = "bg-white/10 hover:bg-white/20 text-white border border-white/20";
      } else {
          // Light mode secondary: White bg with dark text and border
          variantStyles = "bg-white/80 hover:bg-white text-slate-800 border border-slate-200 shadow-sm";
      }
  } else {
      // Ghost
      variantStyles = isDark 
        ? "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
        : "bg-transparent hover:bg-black/5 text-slate-600 hover:text-slate-900";
  }

  const finalStyle = variant === 'primary' && accentColor 
    ? { backgroundColor: accentColor, ...style } 
    : style;
    
  // Default fallback if no accent color provided for primary
  const defaultPrimaryClass = (!accentColor && variant === 'primary') ? "bg-indigo-500 hover:bg-indigo-400" : "";

  return (
    <button 
        className={`${baseStyles} ${variantStyles} ${defaultPrimaryClass} ${className}`} 
        style={finalStyle}
        onClick={handleClick}
        {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; isDark?: boolean }> = ({ children, className = '', isDark = true }) => {
  const themeStyles = isDark 
    ? "bg-slate-900/40 border-white/10 text-white" 
    : "bg-white/60 border-white/40 text-slate-800 shadow-rose-100";

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl relative overflow-hidden ${themeStyles} ${className}`}>
      <div className={`absolute top-0 left-0 w-full h-1 opacity-50 bg-gradient-to-r from-transparent ${isDark ? 'via-white/20' : 'via-rose-400/20'} to-transparent`} />
      {children}
    </div>
  );
};
