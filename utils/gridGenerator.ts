
import { GRID_SIZE, DISTRACTOR_CHARS } from '../constants';
import { GridCell, Coordinate } from '../types';

// Directions: Up, Down, Left, Right, and Diagonals (Moore neighborhood)
const DIRECTIONS = [
  { row: -1, col: 0 },  // Up
  { row: 1, col: 0 },   // Down
  { row: 0, col: -1 },  // Left
  { row: 0, col: 1 },   // Right
  { row: -1, col: -1 }, // Top-Left
  { row: -1, col: 1 },  // Top-Right
  { row: 1, col: -1 },  // Bottom-Left
  { row: 1, col: 1 },   // Bottom-Right
];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function isValid(pos: Coordinate, visited: boolean[][]): boolean {
  return (
    pos.row >= 0 &&
    pos.row < GRID_SIZE &&
    pos.col >= 0 &&
    pos.col < GRID_SIZE &&
    !visited[pos.row][pos.col]
  );
}

// Recursive Backtracking to find a valid path for the sentence
function generatePath(
  currentPos: Coordinate,
  currentIndex: number,
  sentenceLength: number,
  visited: boolean[][],
  path: Coordinate[]
): boolean {
  // Base case: If we placed all characters
  if (currentIndex === sentenceLength) {
    return true;
  }

  // Try all directions in random order
  const shuffledDirs = shuffle(DIRECTIONS);

  for (const dir of shuffledDirs) {
    const nextPos = {
      row: currentPos.row + dir.row,
      col: currentPos.col + dir.col,
    };

    if (isValid(nextPos, visited)) {
      visited[nextPos.row][nextPos.col] = true;
      path.push(nextPos);

      if (generatePath(nextPos, currentIndex + 1, sentenceLength, visited, path)) {
        return true;
      }

      // Backtrack
      path.pop();
      visited[nextPos.row][nextPos.col] = false;
    }
  }

  return false;
}

export function generateLevelData(sentence: string) {
  // 1. Initialize Grid
  let grid: GridCell[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => ({
      row: r,
      col: c,
      char: '',
      isTarget: false,
      targetIndex: -1,
      id: `cell-${r}-${c}`,
    }))
  );

  // 2. Determine Start Position (Center-ish)
  // 8x8 grid, center is roughly (3,3), (3,4), (4,3), (4,4)
  // We randomize slightly around the center
  const startRow = 3 + Math.floor(Math.random() * 2); // 3 or 4
  const startCol = 3 + Math.floor(Math.random() * 2); // 3 or 4
  const startPos: Coordinate = { row: startRow, col: startCol };

  // 3. Generate Path
  const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  visited[startPos.row][startPos.col] = true;
  
  const path: Coordinate[] = [startPos];
  
  // We need to place sentence characters [0...N-1]
  // startPos holds char at index 0.
  // We need to find path for 1...N-1
  const success = generatePath(startPos, 1, sentence.length, visited, path);

  if (!success) {
    // Fallback for path generation failure
    throw new Error("Failed to generate path");
  }

  // 4. Place Sentence Characters
  path.forEach((coord, index) => {
    grid[coord.row][coord.col] = {
      ...grid[coord.row][coord.col],
      char: sentence[index],
      isTarget: true,
      targetIndex: index,
    };
  });

  // 5. Fill Empty Cells with Distractors
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c].isTarget) {
        const randomChar = DISTRACTOR_CHARS[Math.floor(Math.random() * DISTRACTOR_CHARS.length)];
        grid[r][c].char = randomChar;
      }
    }
  }

  return { grid, startPos };
}
