// Define interfaces globally for TS validation (runtime they are erased)
// We assume window.GameApp exists
// Enums need to be attached to window

interface Article {
  id: string;
  title: string;
  author: string;
  paragraphs: string[];
  segments?: string[];
}

interface GridCell {
  row: number;
  col: number;
  char: string;
  isTarget: boolean;
  targetIndex: number;
  id: string;
}

interface LevelData {
  sentence: string;
  grid: GridCell[][];
  startPos: { row: number; col: number };
}

interface GameState {
    MENU: string;
    LOADING: string;
    PLAYING: string;
    COMPLETED: string;
}

interface GameAppNamespace {
    App: any;
    types: {
        GameState: GameState;
    };
    constants: {
        DISTRACTOR_CHARS: string;
        FIXED_ARTICLES: Article[];
        GRID_SIZE: number;
    };
    utils: {
        generateLevelData: (sentence: string) => LevelData;
    };
    services: {
        geminiService: {
            segmentArticle: (article: Article) => Promise<string[]>;
            simpleSegment: (text: string) => string[];
        };
    };
    components: {
        ArticleSelector: any;
        GameBoard: any;
    };
}

// Extend the global Window interface
interface Window {
    GameApp: GameAppNamespace;
    React: any;
    ReactDOM: any;
}

(function() {
  // Initialize window.GameApp if it doesn't exist to prevent runtime errors
  if (!window.GameApp) {
    window.GameApp = {
      App: null,
      types: {} as any,
      constants: {} as any,
      utils: {} as any,
      services: {} as any,
      components: {} as any,
    };
  }

  window.GameApp.types.GameState = {
    MENU: 'MENU',
    LOADING: 'LOADING',
    PLAYING: 'PLAYING',
    COMPLETED: 'COMPLETED',
  };
})();
