(function() {
  const { GRID_SIZE, DISTRACTOR_CHARS } = window.GameApp.constants;

  // Directions: Up, Down, Left, Right, and Diagonals
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

  function shuffle(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  function isValid(pos, visited) {
    return (
      pos.row >= 0 &&
      pos.row < GRID_SIZE &&
      pos.col >= 0 &&
      pos.col < GRID_SIZE &&
      !visited[pos.row][pos.col]
    );
  }

  function generatePath(currentPos, currentIndex, sentenceLength, visited, path) {
    if (currentIndex === sentenceLength) {
      return true;
    }

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

        path.pop();
        visited[nextPos.row][nextPos.col] = false;
      }
    }

    return false;
  }

  function generateLevelData(sentence) {
    let grid = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => ({
        row: r,
        col: c,
        char: '',
        isTarget: false,
        targetIndex: -1,
        id: `cell-${r}-${c}`,
      }))
    );

    const startRow = 3 + Math.floor(Math.random() * 2); 
    const startCol = 3 + Math.floor(Math.random() * 2); 
    const startPos = { row: startRow, col: startCol };

    const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    visited[startPos.row][startPos.col] = true;
    
    const path = [startPos];
    
    const success = generatePath(startPos, 1, sentence.length, visited, path);

    if (!success) {
      console.warn("Failed to generate path, retrying might be needed");
      // Fallback basic path if complex generation fails? 
      // For now, just let it throw or return partial
    }

    path.forEach((coord, index) => {
      grid[coord.row][coord.col] = {
        ...grid[coord.row][coord.col],
        char: sentence[index],
        isTarget: true,
        targetIndex: index,
      };
    });

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!grid[r][c].isTarget) {
          const randomChar = DISTRACTOR_CHARS[Math.floor(Math.random() * DISTRACTOR_CHARS.length)];
          grid[r][c].char = randomChar;
        }
      }
    }

    return { grid, startPos, sentence };
  }

  window.GameApp.utils.generateLevelData = generateLevelData;
})();