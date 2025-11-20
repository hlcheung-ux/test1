(function() {
  const React = window.React;
  const { useState } = React;
  const { ArticleSelector, GameBoard } = window.GameApp.components;
  const { geminiService } = window.GameApp.services;
  const { GameState } = window.GameApp.types;

  const App = () => {
    const [view, setView] = useState(GameState.MENU);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [preparing, setPreparing] = useState(false);

    const handleSelectArticle = async (article) => {
      setPreparing(true);
      setView(GameState.LOADING);
      
      try {
        let segments = article.segments;
        if (!segments || segments.length === 0) {
          segments = await geminiService.segmentArticle(article);
        }

        setSelectedArticle({ ...article, segments });
        setView(GameState.PLAYING);
      } catch (e) {
        console.error("Failed to prepare article", e);
        setView(GameState.MENU);
      } finally {
        setPreparing(false);
      }
    };

    const handleBack = () => {
      setView(GameState.MENU);
      setSelectedArticle(null);
    };

    return (
      <div className="min-h-screen w-full bg-paper text-stone-900 font-serif selection:bg-stone-800 selection:text-white">
        {view === GameState.MENU && (
          <ArticleSelector onSelect={handleSelectArticle} />
        )}

        {view === GameState.LOADING && (
           <div className="flex flex-col items-center justify-center h-screen">
               <p className="text-xl font-serif animate-pulse text-stone-600">
                 {preparing ? "正在拆解文句..." : "載入中..."}
               </p>
           </div>
        )}

        {view === GameState.PLAYING && selectedArticle && (
          <GameBoard article={selectedArticle} onBack={handleBack} />
        )}
      </div>
    );
  };

  window.GameApp.App = App;
})();