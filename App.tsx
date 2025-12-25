
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Moon, Sparkles, Gamepad2, Lock, Unlock, Settings, ArrowLeft, Mail, ArrowRight, Play, Pause, SkipForward, SkipBack, Star, Music, Volume2, AlertTriangle } from 'lucide-react';
import { AppContent, AppStage, Theme } from './types';
import { DEFAULT_CONTENT } from './constants';
import { decodeContentData } from './utils';
import StarBackground from './components/StarBackground';
import AmbientPlayer from './components/AmbientPlayer';
import ChatWidget from './components/ChatWidget';
import PuzzleGame from './components/PuzzleGame';
import QuizGame from './components/QuizGame';
import { Button, Card } from './components/UIComponents';
import Editor from './components/Editor';
import AdminLogin from './components/AdminLogin';

// Fix for framer-motion type inference issues in strict environments
const MotionDiv = motion.div as any;
const MotionP = motion.p as any;
const MotionImg = motion.img as any;

const STAGE_ORDER = [
  AppStage.WELCOME,
  AppStage.LETTER,
  AppStage.PLAYLIST,
  AppStage.PUZZLE,
  AppStage.QUIZ,
  AppStage.CARDS,
  AppStage.FINAL,
  AppStage.SEALED
];

const App: React.FC = () => {
  // Theme State (Default: Light)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'light';
  });

  const [stage, setStage] = useState<AppStage>(AppStage.WELCOME);
  const [content, setContent] = useState<AppContent>(DEFAULT_CONTENT);
  const [hasDataError, setHasDataError] = useState(false);
  
  // Admin & Editing State
  const [showLogin, setShowLogin] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Game/Interaction State
  const [revealedCards, setRevealedCards] = useState<string[]>([]);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  // Load content from URL
  useEffect(() => {
    try {
        const params = new URLSearchParams(window.location.search);
        const encodedData = params.get('data');
        if (encodedData) {
            const decoded = decodeContentData(encodedData);
            if (decoded) {
                setContent(decoded);
            } else {
                console.warn("Could not decode data, likely truncated.");
                setHasDataError(true);
            }
        }
    } catch(e) {
        console.error("URL parsing error", e);
    }
  }, []);

  // Show toast if data error
  useEffect(() => {
      if(hasDataError) {
          setTimeout(() => setHasDataError(false), 5000);
      }
  }, [hasDataError]);

  const currentSong = content.songs[currentSongIndex];
  // Determine if we should use the Spotify Embed or Custom Audio Player
  const isSpotifyEmbed = currentSong.spotifyUrl && currentSong.spotifyUrl.includes('spotify.com');

  // Audio Effect for Song Player
  useEffect(() => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(e => {
                console.error("Autoplay prevented", e);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, currentSongIndex]);

  // Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const subTextColor = isDark ? 'text-indigo-200' : 'text-slate-500';
  const accentColor = content.accentColor || '#6366f1'; 

  // Play a "Swoosh" sound on stage change
  const playTransitionSound = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1360/1360-preview.mp3');
      audio.volume = 0.05; // Reduced volume for subtle effect
      audio.play().catch(() => {});
  }

  const handleNextStage = (nextStage: AppStage) => {
    playTransitionSound();
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    playTransitionSound();
    const currentIndex = STAGE_ORDER.indexOf(stage);
    if (currentIndex > 0) {
      setStage(STAGE_ORDER[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % content.songs.length);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + content.songs.length) % content.songs.length);
  };
  
  const handleCardClick = (id: string) => {
    // Play flip sound with reduced volume
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    audio.volume = 0.05;
    audio.play().catch(()=>{});
    
    if (revealedCards.includes(id)) {
        setRevealedCards(revealedCards.filter(c => c !== id));
    } else {
        setRevealedCards([...revealedCards, id]);
    }
  };

  const handleRestart = () => {
      setStage(AppStage.WELCOME);
      setRevealedCards([]);
      setIsEnvelopeOpen(false);
      setIsPlaying(false);
      setCurrentSongIndex(0);
  }

  const handleAdminLogin = () => {
      setIsEditorOpen(true);
      setShowLogin(false);
  }

  // --- RENDERERS ---

  const renderWelcome = () => (
    <MotionDiv 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-8 max-w-lg mx-auto p-8 relative z-10 w-full"
    >
      <div className="relative inline-block mb-4">
         <div 
            className="absolute inset-0 blur-[40px] opacity-30 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
         ></div>
         <Moon size={100} className={`drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] relative z-10 mx-auto transition-colors duration-500`} style={{ color: isDark ? '#e0e7ff' : accentColor }} strokeWidth={0.5} fill={isDark ? "rgba(255,255,255,0.1)" : `${accentColor}20`} />
         <Sparkles className="absolute -top-4 -right-4 text-yellow-200 animate-bounce" size={24} />
      </div>
      
      <div className="space-y-6">
        <MotionDiv 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: isDark ? '#a5b4fc' : accentColor }}>{content.welcomeTitle}</h2>
          <h1 className={`text-5xl md:text-7xl font-handwriting drop-shadow-xl transition-colors ${textColor}`}>{content.recipientName}</h1>
        </MotionDiv>
        
        <MotionP 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`font-light text-lg leading-relaxed max-w-sm mx-auto ${subTextColor}`}
        >
          {content.welcomeSubtitle}
        </MotionP>
      </div>

      <MotionDiv
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Button onClick={() => handleNextStage(AppStage.LETTER)} className="mt-8 text-lg px-10 py-4" accentColor={accentColor} isDark={isDark}>
          Open My Heart <Heart className="ml-2 fill-current" size={18} />
        </Button>
      </MotionDiv>
    </MotionDiv>
  );

  const renderLetter = () => (
    <MotionDiv 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto w-full px-4"
    >
        {!isEnvelopeOpen ? (
            <div 
                className="cursor-pointer group perspective-1000 mx-auto max-w-md w-full"
                onClick={() => { 
                    setIsEnvelopeOpen(true); 
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2412/2412-preview.mp3');
                    audio.volume = 0.1;
                    audio.play().catch(()=>{}); 
                }}
            >
                <MotionDiv 
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-slate-200 relative w-full aspect-[4/3] rounded-lg shadow-2xl flex items-center justify-center overflow-hidden border-t-2 border-white/50 ${!isDark && 'shadow-rose-100'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-100 to-slate-300" />
                    {/* Envelope Flap */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50 to-slate-200 shadow-md origin-top transform group-hover:scale-y-90 transition-transform duration-500 z-10" style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>
                    
                    <div className="z-20 text-center space-y-3 mt-12">
                        <div className="w-16 h-16 bg-white/50 backdrop-blur rounded-full flex items-center justify-center mx-auto shadow-inner">
                             <Mail size={32} style={{ color: accentColor }} />
                        </div>
                        <p className="text-slate-500 font-serif-display text-2xl italic">For {content.recipientName}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] animate-pulse" style={{ color: accentColor }}>Tap to Unseal</p>
                    </div>
                </MotionDiv>
            </div>
        ) : (
            <MotionDiv 
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
            >
                <Card isDark={isDark} className={`text-slate-800 border-none relative overflow-hidden max-w-2xl mx-auto ${isDark ? 'bg-[#fffefb] shadow-[0_0_60px_rgba(255,255,255,0.2)]' : 'bg-white shadow-xl shadow-rose-100'}`}>
                    {/* Decorative Moon */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-60 pointer-events-none blur-2xl" style={{ backgroundColor: `${accentColor}20` }} />
                    
                    <div className="relative z-10 space-y-6 text-center md:text-left p-2 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 justify-center md:justify-between border-b border-indigo-100 pb-4">
                            <span className="font-serif-display text-2xl text-slate-800">{content.letterTitle}</span>
                            <div className="flex gap-2" style={{ color: accentColor }}>
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                                <Star size={14} fill="currentColor" />
                            </div>
                        </div>
                        
                        <p className="font-handwriting text-2xl md:text-3xl leading-relaxed text-slate-700 whitespace-pre-wrap">
                            {content.letterContent}
                        </p>
                        
                        <div className="pt-10 flex flex-col items-end gap-2">
                             <p className="text-xs text-slate-400 uppercase tracking-widest">Sent from the stars by</p>
                             <p className="font-handwriting text-3xl" style={{ color: accentColor }}>{content.senderName}</p>
                        </div>
                    </div>
                </Card>
                <div className="flex justify-center mt-8">
                     <Button onClick={() => handleNextStage(AppStage.PLAYLIST)} variant="secondary" isDark={isDark}>
                        Our Playlist <ArrowRight size={18} className="ml-2" />
                     </Button>
                </div>
            </MotionDiv>
        )}
    </MotionDiv>
  );

  const renderPlaylist = () => {
    return (
      <MotionDiv 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="max-w-xl mx-auto w-full space-y-8 text-center px-4"
      >
        <div className="space-y-2">
            <h2 className={`text-3xl font-serif-display drop-shadow-md ${textColor}`}>{content.playlistTitle}</h2>
            <p className={`${subTextColor} text-sm`}>Listen to the rhythm of the moon</p>
        </div>

        <div className={`backdrop-blur-3xl border border-white/20 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group ${isDark ? 'bg-black/30' : 'bg-white/40'}`}>
            
            {/* Spotify Embed */}
            {isSpotifyEmbed ? (
                <div className="w-full relative z-10 space-y-4">
                     <iframe 
                        style={{ borderRadius: '24px' }}
                        src={`https://open.spotify.com/embed/track/${currentSong.spotifyUrl?.split('/').pop()?.split('?')[0]}?utm_source=generator`} 
                        width="100%" 
                        height="352" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                        className="shadow-2xl border border-white/10"
                     ></iframe>
                     
                     <div className="flex items-center justify-between pt-4 px-4">
                        <button onClick={prevSong} className={`transition transform hover:scale-110 active:scale-95 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                            <SkipBack size={28} />
                        </button>
                        <span className={`text-xs uppercase tracking-widest opacity-50 font-medium ${textColor}`}>Track {currentSongIndex + 1} / {content.songs.length}</span>
                        <button onClick={nextSong} className={`transition transform hover:scale-110 active:scale-95 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                            <SkipForward size={28} />
                        </button>
                     </div>
                </div>
            ) : (
                /* Custom Vinyl Player */
                <>
                    {/* Background Visualizer Animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                         {isPlaying && Array.from({length: 12}).map((_, i) => (
                             <MotionDiv 
                                key={i}
                                className="w-4 bg-white/20 mx-1 rounded-full"
                                animate={{ height: [20, Math.random() * 100 + 40, 20] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                                style={{ backgroundColor: accentColor }}
                             />
                         ))}
                    </div>

                    <div className="relative z-10 flex flex-col items-center space-y-10">
                        {/* Vinyl Record */}
                        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                            {/* The Record Disk */}
                            <MotionDiv 
                                key={currentSong.id}
                                className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] border-[8px] border-slate-900 bg-black overflow-hidden"
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            >
                                {/* Grooves */}
                                <div className="absolute inset-0 rounded-full border-[1px] border-white/10 opacity-30 scale-95" />
                                <div className="absolute inset-0 rounded-full border-[1px] border-white/10 opacity-30 scale-75" />
                                <div className="absolute inset-0 rounded-full border-[1px] border-white/10 opacity-30 scale-50" />
                                <div className="absolute inset-0 rounded-full border-[1px] border-white/10 opacity-30 scale-25" />
                                
                                {/* Album Art (Label) */}
                                <img 
                                    src={currentSong.coverUrl} 
                                    alt="Album Art" 
                                    className="absolute inset-[25%] w-[50%] h-[50%] object-cover rounded-full border-4 border-slate-800"
                                />
                                {/* Center Hole */}
                                <div className="absolute inset-0 m-auto w-3 h-3 bg-white rounded-full border border-slate-400 z-10" />
                            </MotionDiv>
                        </div>

                        <div className="space-y-2 text-center">
                            <h3 className={`text-2xl font-bold tracking-wide line-clamp-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentSong.title}</h3>
                            <p className="font-medium opacity-80" style={{ color: accentColor }}>{currentSong.artist}</p>
                        </div>

                        {/* Controls */}
                        <div className="w-full space-y-6 px-4">
                            {/* Progress Bar */}
                            <div className={`w-full h-1.5 rounded-full overflow-hidden backdrop-blur cursor-pointer group-hover:h-2 transition-all ${isDark ? 'bg-slate-500/20' : 'bg-slate-300'}`}>
                                <MotionDiv 
                                    className="h-full rounded-full relative"
                                    style={{ backgroundColor: accentColor }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: isPlaying ? "100%" : "0%" }}
                                    transition={{ duration: isPlaying ? 30 : 0, ease: "linear" }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                                </MotionDiv>
                            </div>
                            
                            <div className="flex items-center justify-center gap-10">
                                <button onClick={prevSong} className={`transition transform hover:scale-110 active:scale-95 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                                    <SkipBack size={32} />
                                </button>
                                <button 
                                    onClick={togglePlay}
                                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105 active:scale-95 text-white ring-4 ring-offset-2 ring-offset-transparent"
                                    style={{ backgroundColor: accentColor, '--tw-ring-color': accentColor } as React.CSSProperties}
                                >
                                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                </button>
                                <button onClick={nextSong} className={`transition transform hover:scale-110 active:scale-95 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                                    <SkipForward size={32} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>

        <Button variant="primary" accentColor={accentColor} onClick={() => handleNextStage(AppStage.PUZZLE)} isDark={isDark}>
            Play A Game <Gamepad2 size={18} className="ml-2" />
        </Button>
      </MotionDiv>
    );
  };

  const renderPuzzle = () => (
     <MotionDiv 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-xl mx-auto w-full text-center space-y-8 px-4"
     >
        <div className="space-y-2">
            <h2 className={`text-3xl font-serif-display ${textColor}`}>Unlock My Heart</h2>
            <p className={`${subTextColor}`}>Complete the puzzle to move forward</p>
        </div>
        
        <PuzzleGame theme={theme} onComplete={() => {}} accentColor={accentColor} />

        <Button onClick={() => handleNextStage(AppStage.QUIZ)} variant="secondary" className="mt-8" isDark={isDark}>
            Next Challenge <ArrowRight size={18} className="ml-2" />
        </Button>
     </MotionDiv>
  );

  const renderQuiz = () => (
    <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-xl mx-auto w-full text-center space-y-8 px-4"
    >
        <div className="space-y-2">
            <h2 className={`text-3xl font-serif-display ${textColor}`}>{content.quizConfig?.title || "Love Quiz"}</h2>
            <p className={`${subTextColor}`}>Answer correctly to proceed</p>
        </div>

        <QuizGame 
            theme={theme} 
            config={content.quizConfig!} 
            onComplete={() => handleNextStage(AppStage.CARDS)}
            accentColor={accentColor}
        />
    </MotionDiv>
  );

  const renderCards = () => (
     <MotionDiv 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-6xl mx-auto w-full text-center space-y-10 px-4 pb-20"
      >
        <div className="space-y-2">
            <h2 className={`text-3xl font-serif-display ${textColor}`}>{content.cardsTitle}</h2>
            <p className={`${subTextColor}`}>Tap a card to reveal the moonlight hidden within</p>
        </div>

        {/* Improved Masonry-style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
            {content.memoryCards.map((card, index) => (
                <div key={card.id} className="h-80 perspective-1000 cursor-pointer group" onClick={() => handleCardClick(card.id)}>
                    <MotionDiv
                        className="relative w-full h-full transition-all duration-700 transform-style-3d"
                        animate={{ rotateY: revealedCards.includes(card.id) ? 180 : 0 }}
                    >
                        {/* Front */}
                        <div className={`absolute inset-0 backface-hidden backdrop-blur-sm rounded-2xl border p-6 flex flex-col items-center justify-center gap-6 shadow-xl transition-colors ${isDark ? 'bg-slate-800/80 border-white/10' : 'bg-white border-slate-200'}`} style={{ borderColor: isDark ? '' : `${accentColor}40` }}>
                            <div className="w-full h-40 rounded-xl overflow-hidden shadow-inner bg-slate-100">
                                <img src={card.imageUrl} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className={`text-xl font-medium tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.frontText}</h3>
                                <div className="text-xs mt-2 flex items-center justify-center gap-1 opacity-70" style={{ color: accentColor }}>
                                    <Sparkles size={12} /> Tap to see
                                </div>
                            </div>
                        </div>

                        {/* Back */}
                        <div 
                            className={`absolute inset-0 backface-hidden rounded-2xl border p-6 flex flex-col items-center justify-center text-center shadow-lg ${isDark ? 'bg-gradient-to-b from-slate-800 to-slate-900' : 'bg-gradient-to-b from-white to-slate-50'}`}
                            style={{ transform: "rotateY(180deg)", borderColor: accentColor }}
                        >
                            <Moon className="mb-4 opacity-50" size={24} style={{ color: accentColor }} />
                            <p className={`font-serif-display text-lg leading-relaxed ${isDark ? 'text-indigo-100' : 'text-slate-900 font-medium'}`}>
                                {card.backText}
                            </p>
                        </div>
                    </MotionDiv>
                </div>
            ))}
        </div>

        {revealedCards.length > 0 && (
            <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
                <Button onClick={() => handleNextStage(AppStage.FINAL)} className="animate-pulse shadow-2xl" accentColor={accentColor} isDark={isDark}>
                    Open Final Letter <Mail size={18} className="ml-2" />
                </Button>
            </MotionDiv>
        )}
     </MotionDiv>
  );

  const renderFinal = () => (
      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-xl mx-auto w-full px-4 relative"
      >
        {/* Falling Petals Animation */}
        <div className="absolute inset-0 pointer-events-none -top-40 h-[150%] overflow-hidden z-0">
            {Array.from({ length: 20 }).map((_, i) => (
                <MotionDiv
                    key={i}
                    className="absolute text-xl"
                    initial={{ y: -50, x: Math.random() * 400 - 200, rotate: 0 }}
                    animate={{ y: 800, rotate: 360 }}
                    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                >
                    {i % 2 === 0 ? '🌸' : '❤️'}
                </MotionDiv>
            ))}
        </div>

        <Card isDark={isDark} className={`border-none shadow-2xl relative z-10 ${isDark ? 'bg-[#fffbf0]' : 'bg-white shadow-rose-200'}`}>
             <div className="text-center space-y-8 p-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 animate-bounce-slow text-white" style={{ backgroundColor: accentColor }}>
                    <Moon fill="currentColor" size={32} />
                </div>
                
                <h2 className="text-3xl font-serif-display text-slate-900">{content.finalTitle}</h2>
                
                <div className="w-24 h-1 mx-auto rounded-full" style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />
                
                <p className="font-handwriting text-3xl leading-loose text-slate-700 whitespace-pre-wrap">
                    {content.finalContent}
                </p>
                
                <div className="pt-10">
                     <Button onClick={() => handleNextStage(AppStage.SEALED)} accentColor={accentColor} className="w-full md:w-auto" isDark={isDark}>
                        {content.closingNote} <Heart size={18} className="ml-2 fill-current" />
                     </Button>
                </div>
             </div>
        </Card>
      </MotionDiv>
  );

  const renderSealed = () => (
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-8 relative"
      >
         <div className="text-8xl animate-bounce drop-shadow-2xl">💌</div>
         <h2 className={`text-4xl font-serif-display ${textColor}`}>Letter Sealed with Love</h2>
         <p className={subTextColor}>For {content.recipientName}</p>
         <p className="text-sm opacity-50 text-slate-400 font-mono tracking-widest">{new Date().toLocaleDateString()}</p>
         
         <div className="flex gap-4 justify-center pt-8">
            <Button onClick={handleRestart} variant="secondary" isDark={isDark}>Experience Again</Button>
            {/* If we had a share feature here */}
         </div>
      </MotionDiv>
  );

  // Determine if we should show the mini player (Playing and not in playlist)
  const showMiniPlayer = isPlaying && stage !== AppStage.PLAYLIST && !isSpotifyEmbed;

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#0B1026]' : 'bg-rose-50'}`}>
      
      {/* Error Toast */}
      <AnimatePresence>
        {hasDataError && (
             <MotionDiv initial={{y: -100}} animate={{y: 20}} exit={{y: -100}} className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none">
                 <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
                     <AlertTriangle size={18} /> Link data was corrupted or incomplete.
                 </div>
             </MotionDiv>
        )}
      </AnimatePresence>
      
      {/* Background Elements */}
      <StarBackground theme={theme} />
      
      {/* Ambient Audio Player (Auto-mutes when Main Player is Active) */}
      <AmbientPlayer theme={theme} accentColor={accentColor} isExternalPlaying={isPlaying} />
      
      {/* GLOBAL AUDIO PLAYER (For MP3s/Custom Links) */}
      {!isSpotifyEmbed && (
         <audio 
            ref={audioRef}
            src={currentSong.spotifyUrl /* Use field as fallback for URL */} 
            onEnded={nextSong}
            onError={(e) => console.log("Audio Error", e)}
        />
      )}

      {/* MINI PLAYER (Visible when navigating away) */}
      <AnimatePresence>
        {showMiniPlayer && (
            <MotionDiv 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-20 right-4 z-40 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 flex items-center gap-3 shadow-xl"
            >
                <div className="animate-spin-slow">
                    <Music size={14} style={{ color: accentColor }} />
                </div>
                <div className="text-xs text-white max-w-[100px] truncate">
                    {currentSong.title}
                </div>
                <button 
                    onClick={togglePlay} 
                    className="p-1 rounded-full hover:bg-white/10 text-white"
                >
                    <Pause size={14} fill="currentColor" />
                </button>
            </MotionDiv>
        )}
      </AnimatePresence>
      
      {/* Navigation Controls */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
         {stage !== AppStage.WELCOME && (
             <button 
                onClick={handleBack}
                className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all flex items-center gap-2 ${isDark ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
             >
                <ArrowLeft size={20} />
                <span className="hidden md:inline text-xs font-medium uppercase tracking-widest">Back</span>
             </button>
         )}
      </div>

      <div className="fixed top-4 right-4 z-50 flex gap-2">
         {/* Theme Toggle */}
         <button 
           onClick={() => { toggleTheme(); playTransitionSound(); }} 
           className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all ${isDark ? 'bg-slate-800/50 text-yellow-300 hover:bg-slate-700' : 'bg-white text-indigo-600 hover:bg-slate-100 border border-slate-200'}`}
         >
           {isDark ? '☀️' : '🌑'}
         </button>

         {/* Admin Lock Button */}
         <button 
           onClick={() => setShowLogin(true)}
           className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all ${isDark ? 'bg-slate-800/50 text-slate-400 hover:text-white' : 'bg-white text-slate-500 hover:text-indigo-600 border border-slate-200'}`}
         >
           <Settings size={20} />
         </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center py-20">
        <AnimatePresence mode="wait">
          {stage === AppStage.WELCOME && renderWelcome()}
          {stage === AppStage.LETTER && renderLetter()}
          {stage === AppStage.PLAYLIST && renderPlaylist()}
          {stage === AppStage.PUZZLE && renderPuzzle()}
          {stage === AppStage.QUIZ && renderQuiz()}
          {stage === AppStage.CARDS && renderCards()}
          {stage === AppStage.FINAL && renderFinal()}
          {stage === AppStage.SEALED && renderSealed()}
        </AnimatePresence>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget theme={theme} recipientName={content.recipientName} accentColor={accentColor} />

      {/* Footer */}
      <div className={`absolute bottom-4 w-full text-center text-xs opacity-40 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
         Made with ❤️ by Khushter
      </div>

      {/* Modals */}
      {showLogin && (
        <AdminLogin 
            onLogin={handleAdminLogin} 
            onClose={() => setShowLogin(false)} 
            accentColor={accentColor}
        />
      )}
      
      {isEditorOpen && (
        <Editor 
          initialContent={content} 
          onSave={(newContent) => {
             setContent(newContent);
          }} 
          onClose={() => setIsEditorOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
