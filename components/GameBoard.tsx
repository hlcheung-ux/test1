(function() {
  const React = window.React;
  const { useState, useEffect, useCallback, useRef } = React;
  const { generateLevelData } = window.GameApp.utils;
  const { GRID_SIZE } = window.GameApp.constants;

  const GameBoard = ({ article, onBack }) => {
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [levelData, setLevelData] = useState(null);
    const [userPath, setUserPath] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [shakeId, setShakeId] = useState(null);
    
    const gridRef = useRef(null);
    const [cellSize, setCellSize] = useState(0);

    const segments = article.segments || [];
    const currentSegment = segments[currentSegmentIndex] || '';

    useEffect(() => {
      if (!currentSegment) return;
      try {
        const data = generateLevelData(currentSegment);
        setLevelData(data);
        setUserPath([0]);
        setShowHint(false);
        setCompleted(false);
      } catch (e) {
        console.error("Level generation error", e);
        if (currentSegmentIndex < segments.length - 1) {
          setCurrentSegmentIndex(prev => prev + 1);
        }
      }
    }, [currentSegment, currentSegmentIndex, segments.length]);

    useEffect(() => {
      if (gridRef.current) {
        const firstCell = gridRef.current.querySelector('button');
        if (firstCell) {
          setCellSize(firstCell.offsetWidth);
        }
      }
      const handleResize = () => {
        if (gridRef.current) {
           const firstCell = gridRef.current.querySelector('button');
           if(firstCell) setCellSize(firstCell.offsetWidth);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [levelData]);

    const handleCellClick = useCallback((cell) => {
      if (!levelData || completed) return;

      const nextIndex = userPath.length;
      
      if (cell.isTarget && cell.targetIndex === nextIndex) {
        const lastCharIndex = nextIndex - 1;
        
        let lastRow = -1, lastCol = -1;
        if (lastCharIndex === -1) {
            lastRow = levelData.startPos.row;
            lastCol = levelData.startPos.col;
        } else {
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
        
        const isAdjacent = dx <= 1 && dy <= 1;

        if (isAdjacent) {
          const newPath = [...userPath, nextIndex];
          setUserPath(newPath);

          if (newPath.length === currentSegment.length) {
            setCompleted(true);
            setTimeout(() => {
              if (currentSegmentIndex < segments.length - 1) {
                setCurrentSegmentIndex(prev => prev + 1);
              } else {
                alert("恭喜！整篇文章已背誦完成。");
                onBack();
              }
            }, 1500);
          }
        } else {
          triggerShake(cell.id);
        }
      } else {
        triggerShake(cell.id);
      }
    }, [levelData, userPath, completed, currentSegment.length, currentSegmentIndex, segments.length, onBack]);

    const triggerShake = (id) => {
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

    const getCenter = (r, c) => {
      const gap = 4; 
      const step = cellSize + gap;
      const offset = cellSize / 2;
      return {
        x: c * step + offset,
        y: r * step + offset
      };
    };

    return (
      <div className="flex flex-col h-screen max-w-2xl mx-auto bg-paper relative overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b-2 border-stone-200 z-10 bg-paper">
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

        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="relative">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-visible">
               {levelData && userPath.length > 1 && userPath.map((idx, i) => {
                  if (i === 0) return null;
                  let currR=0, currC=0, prevR=0, prevC=0;
                  levelData.grid.flat().forEach(cell => {
                    if (cell.isTarget && cell.targetIndex === idx) { currR = cell.row; currC = cell.col; }
                    if (cell.isTarget && cell.targetIndex === idx - 1) { prevR = cell.row; prevC = cell.col; }
                  });
                  const start = getCenter(prevR, prevC);
                  const end = getCenter(currR, currC);
                  
                  return (
                    <line
                      key={`line-${i}`}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="rgba(41, 37, 36, 0.6)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-draw"
                    />
                  );
               })}
            </svg>

            <div 
              ref={gridRef}
              className="grid gap-1 bg-stone-800 p-2 rounded shadow-xl z-10 relative"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` 
              }}
            >
              {levelData.grid.map((row, rIndex) => (
                row.map((cell, cIndex) => {
                  const isSelected = userPath.includes(cell.targetIndex) && cell.isTarget;
                  const isNext = showHint && cell.isTarget && cell.targetIndex === userPath.length;
                  const isStart = cell.isTarget && cell.targetIndex === 0;
                  const isShaking = shakeId === cell.id;
                  const isCurrentHead = cell.isTarget && cell.targetIndex === userPath.length - 1;

                  let bgClass = "bg-stone-100 text-stone-800"; 
                  if (isSelected) bgClass = "bg-stone-300 text-stone-900";
                  if (isCurrentHead) bgClass = "bg-stone-900 text-stone-100";
                  if (isStart && !isCurrentHead) bgClass = "bg-stone-400 text-stone-900";
                  if (isNext) bgClass = "bg-amber-100 text-stone-900 ring-2 ring-amber-400"; 

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
                        z-30
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
        </div>

        <div className="p-6 bg-stone-100 border-t border-stone-300 z-30">
          <div className="flex justify-center mb-4 min-h-[3rem]">
            <div className="flex flex-wrap justify-center gap-1">
               {Array.from(currentSegment).map((char, idx) => (
                 <span 
                   key={idx}
                   className={`
                     w-8 h-8 flex items-center justify-center border border-stone-300 bg-white font-serif transition-colors duration-300
                     ${idx < userPath.length ? 'text-stone-900 font-bold bg-stone-200' : 'text-transparent'}
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

  window.GameApp.components.GameBoard = GameBoard;
})();