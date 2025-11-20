export interface Article {
  id: string;
  title: string;
  author: string;
  paragraphs: string[]; // Raw paragraphs
  segments?: string[]; // Sentences/phrases for gameplay
}

export interface GridCell {
  row: number;
  col: number;
  char: string;
  isTarget: boolean; // Is this part of the sentence?
  targetIndex: number; // If isTarget, which position (0, 1, 2...)?
  id: string; // Unique ID for key
}

export type Coordinate = {
  row: number;
  col: number;
};

export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED',
}

export interface LevelData {
  sentence: string;
  grid: GridCell[][];
  startPos: Coordinate;
}
