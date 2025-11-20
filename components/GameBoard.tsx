
import React, { useEffect, useState, useCallback } from 'react';
import { Article, GridCell, LevelData } from '../types';
import { generateLevelData } from '../utils/gridGenerator';
import { GRID_SIZE } from '../constants';

interface GameBoardProps {
  article: Article;
  onBack: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ article, onBack }) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [userPath, setUserPath] = useState<number[]>([]); // Array of indices in the sentence
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const segments = article.segments || [];
  const currentSegment = segments[currentSegmentIndex] || '';

  // Initialize level when segment changes
  useEffect(() => {
    if (!currentSegment) return;
    try {
      const data = generateLevelData(currentSegment);
      setLevelData(data);
      setUserPath([0]); // Start with first char selected
      setShowHint(false);
      setCompleted(false);
    } catch (e) {
      console.error("Level generation error", e);
      // Skip bad segment
      if (currentSegmentIndex < segments.length - 1) {
        setCurrentSegmentIndex(prev => prev + 1);
      }
    }
  }, [currentSegment, currentSegmentIndex, segments.length]);

  const handleCellClick = useCallback((cell: GridCell) => {
    if (!levelData || completed) return;

    // 1. Check if this is the next character in the sequence
    const nextIndex = userPath.length;
    
    if (cell.isTarget && cell.targetIndex === nextIndex) {
      // 2. Check adjacency (Moore neighborhood / 9-grid)
      const lastCharIndex = nextIndex - 1;
      
      // Find coordinates of the last added character
      let lastRow = -1, lastCol = -1;
      if (lastCharIndex === -1) {
          // Should not happen as we init with 0, but for safety
          lastRow = levelData.startPos.row;
          lastCol = levelData.startPos.col;
      } else {
          // Find the cell in the grid that corresponds to the last index
           outerLoop:
           for(let r=0; r<GRID_SIZE; r++){
               for(let c=0; c<GRID_SIZE; c++){
                   if(levelData.grid[r][c].isTarget && levelData.grid[r][c].targetIndex === lastCharIndex){
                       lastRow = r;
                       lastCol = c;
                       break outerLoop;
                   }
               }
           }
      }

      const dx = Math.abs(cell.col - lastCol);
      const dy = Math.abs(cell.row - lastRow);
      
      // Allow horizontal, vertical, and diagonal moves (distance <= 1)
      // Since cell.targetIndex !== lastCharIndex, we don't need to check if it's the same cell
      const isAdjacent = dx <= 1 && dy <= 1;

      if (isAdjacent) {
        // Success: Add to path
        const newPath = [...userPath, nextIndex];
        setUserPath(newPath);

        // Check Completion
        if (newPath.length === currentSegment.length) {
          setCompleted(true);
          setTimeout(() => {
            if (currentSegmentIndex < segments.length - 1) {
              setCurrentSegmentIndex(prev => prev + 1);
            } else {
              // Article Complete
              alert("恭喜！整篇文章已背誦完成。");
              onBack();
            }
          }, 1000);
        }
      } else {
        // Correct char, wrong position (not adjacent)
        triggerShake(cell.id);
      }
    } else {
      // Wrong char
      triggerShake(cell.id);
    }
  }, [levelData, userPath, completed, currentSegment.length, currentSegmentIndex, segments.length, onBack]);

  const triggerShake = (id: string) => {
    setShakeId(id);
    setTimeout(() => setShakeId(null), 500);
  };

  const handleSkip = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else {
      onBack();
    }
  };

  if (!levelData) return <div className="p-10 text-center font-serif">準備墨寶中...</div>;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-paper relative">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b-2 border-stone-200">
        <button onClick={onBack} className="text-stone-500 hover:text-stone-900 font-serif">
          ← 返回
        </button>
        <div className="text-center">
          <h2 className="text-xl font-serif font-bold text-stone-800">{article.title}</h2>
          <span className="text-xs text-stone-500 font-serif">
            句 {currentSegmentIndex + 1} / {segments.length}
          </span>
        </div>
        <button 
            onClick={handleSkip}
            className="text-stone-400 hover:text-stone-700 text-sm font-serif"
        >
          跳過
        </button>
      </div>

      {/* Grid Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="grid gap-1 bg-stone-800 p-2 rounded shadow-xl"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` 
          }}
        >
          {levelData.grid.map((row, rIndex) => (
            row.map((cell, cIndex) => {
              // State Calculations
              const isSelected = userPath.includes(cell.targetIndex) && cell.isTarget;
              const isNext = showHint && cell.isTarget && cell.targetIndex === userPath.length;
              const isStart = cell.isTarget && cell.targetIndex === 0;
              const isShaking = shakeId === cell.id;

              let bgClass = "bg-stone-100 text-stone-800"; // Default
              if (isSelected) bgClass = "bg-stone-900 text-stone-100"; // Selected
              else if (isNext) bgClass = "bg-amber-100 text-stone-900 ring-2 ring-amber-400"; // Hint

              // Font size logic for responsiveness
              const fontSize = "text-lg sm:text-xl md:text-2xl";

              return (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(cell)}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 
                    flex items-center justify-center 
                    font-serif font-bold ${fontSize}
                    rounded-sm transition-all duration-200
                    ${bgClass}
                    ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}
                    ${isStart ? 'ring-2 ring-stone-400 ring-offset-1' : ''}
                    hover:brightness-95 active:scale-95
                  `}
                  disabled={isSelected || completed}
                >
                  {cell.char}
                </button>
              );
            })
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 bg-stone-100 border-t border-stone-300">
        <div className="flex justify-center mb-4 min-h-[3rem]">
          <div className="flex flex-wrap justify-center gap-1">
             {/* Show progress of sentence */}
             {Array.from(currentSegment).map((char, idx) => (
               <span 
                 key={idx}
                 className={`
                   w-8 h-8 flex items-center justify-center border border-stone-300 bg-white font-serif
                   ${idx < userPath.length ? 'text-stone-900 font-bold' : 'text-transparent'}
                 `}
               >
                 {char}
               </span>
             ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
           <button
             onClick={() => setShowHint(true)}
             className="px-6 py-2 bg-white border border-stone-300 rounded shadow-sm text-stone-600 font-serif hover:bg-stone-50 hover:border-stone-400 transition-colors"
             disabled={completed}
           >
             提示
           </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};
