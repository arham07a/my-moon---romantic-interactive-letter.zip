import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, Image as ImageIcon } from 'lucide-react';
import { Theme, PuzzleConfig } from '../types';
import { Button } from './UIComponents';

// Fix for framer-motion type inference issues in strict environments
const MotionDiv = motion.div as any;

interface PuzzleGameProps {
  theme: Theme;
  onComplete?: () => void;
  accentColor: string;
}

const IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop", // Portrait
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=500&auto=format&fit=crop", // Love/Heart
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=500&auto=format&fit=crop"  // Car
];

const PuzzleGame: React.FC<PuzzleGameProps> = ({ theme, onComplete, accentColor }) => {
  const [config, setConfig] = useState<PuzzleConfig>({ gridSize: 3, image: IMAGES[1] });
  const [tiles, setTiles] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-slate-800';

  useEffect(() => {
    initializeGame();
  }, [config]);

  const initializeGame = () => {
    const totalTiles = config.gridSize * config.gridSize;
    let newTiles = Array.from({ length: totalTiles }, (_, i) => i);
    
    // Shuffle (Swap method ensures solvability if we just swap random pairs)
    // However, for pure swapping mechanics (not sliding), any shuffle is solvable.
    newTiles = newTiles.sort(() => Math.random() - 0.5);
    
    // Ensure it's not already solved
    while (newTiles.every((val, index) => val === index)) {
        newTiles = newTiles.sort(() => Math.random() - 0.5);
    }

    setTiles(newTiles);
    setIsSolved(false);
    setSelectedTileIndex(null);
  };

  const handleTileClick = (index: number) => {
    if (isSolved) return;

    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
    } else {
      // Swap tiles
      const newTiles = [...tiles];
      const temp = newTiles[index];
      newTiles[index] = newTiles[selectedTileIndex];
      newTiles[selectedTileIndex] = temp;
      
      setTiles(newTiles);
      setSelectedTileIndex(null);

      // Check win condition
      if (newTiles.every((val, idx) => val === idx)) {
        setIsSolved(true);
        if (onComplete) onComplete();
      }
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 rounded-3xl ${isDark ? 'bg-slate-800/50' : 'bg-white/50'} backdrop-blur-xl border border-white/20 shadow-2xl`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-serif-display ${textColor}`}>Piece of My Heart</h3>
        <Button variant="ghost" onClick={initializeGame} className="p-2">
           <RefreshCw size={18} />
        </Button>
      </div>

      <div className="flex gap-2 mb-4 justify-center">
         {IMAGES.map((img, i) => (
             <button 
                key={i}
                onClick={() => setConfig({...config, image: img})}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${config.image === img ? 'scale-110' : 'border-transparent opacity-50'}`}
                style={config.image === img ? { borderColor: accentColor } : {}}
             >
                 <img src={img} className="w-full h-full object-cover" />
             </button>
         ))}
      </div>

      <div className="flex justify-center gap-4 mb-6 text-sm">
         <button 
            onClick={() => setConfig({...config, gridSize: 3})} 
            className={`${config.gridSize === 3 ? 'font-bold' : 'text-slate-400'}`}
            style={config.gridSize === 3 ? { color: accentColor } : {}}
        >
            Easy (3x3)
         </button>
         <button 
            onClick={() => setConfig({...config, gridSize: 4})} 
            className={`${config.gridSize === 4 ? 'font-bold' : 'text-slate-400'}`}
            style={config.gridSize === 4 ? { color: accentColor } : {}}
        >
            Hard (4x4)
         </button>
      </div>

      <div 
        className="relative mx-auto aspect-square rounded-xl overflow-hidden shadow-inner bg-slate-200 border-2 border-slate-300/20"
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
            gap: '2px',
            width: '100%'
        }}
      >
        {tiles.map((tileIndex, positionIndex) => {
             // Calculate correct position of this tile piece in the original image
             const row = Math.floor(tileIndex / config.gridSize);
             const col = tileIndex % config.gridSize;
             const percentageX = (col * 100) / (config.gridSize - 1);
             const percentageY = (row * 100) / (config.gridSize - 1);

             const isSelected = selectedTileIndex === positionIndex;

             return (
                 <MotionDiv
                    key={positionIndex}
                    layout
                    onClick={() => handleTileClick(positionIndex)}
                    className={`relative cursor-pointer overflow-hidden transition-all duration-200 ${isSelected ? 'ring-4 z-10' : ''} ${isSolved ? 'border-none' : ''}`}
                    style={{
                        backgroundImage: `url(${config.image})`,
                        backgroundSize: `${config.gridSize * 100}%`,
                        backgroundPosition: `${percentageX}% ${percentageY}%`,
                        ...(isSelected ? { '--tw-ring-color': accentColor } as any : {})
                    }}
                    whileTap={{ scale: 0.95 }}
                 >
                 </MotionDiv>
             );
        })}
        
        {isSolved && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 animate-fadeIn">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                        <Check size={32} />
                    </div>
                    <p className="text-white font-bold text-xl">Perfect Match! ❤️</p>
                </div>
            </div>
        )}
      </div>
      
      <p className={`text-center text-xs mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
         Tap one piece, then another to swap them.
      </p>
    </div>
  );
};

export default PuzzleGame;