import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface Game2048Props {
  onBack: () => void
}

type Grid = number[][]

const GRID_SIZE = 4
const WIN_TILE = 2048

const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    2: 'bg-gray-100 dark:bg-gray-700',
    4: 'bg-gray-200 dark:bg-gray-600',
    8: 'bg-orange-200 dark:bg-orange-900',
    16: 'bg-orange-300 dark:bg-orange-800',
    32: 'bg-red-200 dark:bg-red-900',
    64: 'bg-red-300 dark:bg-red-800',
    128: 'bg-yellow-200 dark:bg-yellow-900',
    256: 'bg-yellow-300 dark:bg-yellow-800',
    512: 'bg-green-200 dark:bg-green-900',
    1024: 'bg-green-300 dark:bg-green-800',
    2048: 'bg-blue-300 dark:bg-blue-800',
  }
  return colors[value] || 'bg-gray-50 dark:bg-gray-800'
}

const getTextColor = (value: number): string => {
  return value <= 4 ? 'text-gray-800 dark:text-gray-200' : 'text-white'
}

export function Game2048({ onBack }: Game2048Props) {
  const [grid, setGrid] = useState<Grid>([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('2048-best-score') || '0')
  })
  const [gameWon, setGameWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const initializeGrid = (): Grid => {
    const newGrid: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
    addRandomTile(newGrid)
    addRandomTile(newGrid)
    return newGrid
  }

  const addRandomTile = (currentGrid: Grid): void => {
    const emptyCells: [number, number][] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) {
          emptyCells.push([i, j])
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      currentGrid[row][col] = Math.random() < 0.9 ? 2 : 4
    }
  }

  const moveLeft = (currentGrid: Grid): { grid: Grid; moved: boolean; scoreIncrease: number } => {
    const newGrid = currentGrid.map(row => [...row])
    let moved = false
    let scoreIncrease = 0

    for (let i = 0; i < GRID_SIZE; i++) {
      const row = newGrid[i].filter(val => val !== 0)
      const newRow: number[] = []
      let j = 0

      while (j < row.length) {
        if (j < row.length - 1 && row[j] === row[j + 1]) {
          const merged = row[j] * 2
          newRow.push(merged)
          scoreIncrease += merged
          j += 2
        } else {
          newRow.push(row[j])
          j++
        }
      }

      while (newRow.length < GRID_SIZE) {
        newRow.push(0)
      }

      if (JSON.stringify(newGrid[i]) !== JSON.stringify(newRow)) {
        moved = true
      }
      newGrid[i] = newRow
    }

    return { grid: newGrid, moved, scoreIncrease }
  }

  const rotateGrid = (currentGrid: Grid, times: number): Grid => {
    let rotated = currentGrid.map(row => [...row])
    for (let t = 0; t < times; t++) {
      rotated = rotated[0].map((_, i) => rotated.map(row => row[i]).reverse())
    }
    return rotated
  }

  const move = (direction: 'left' | 'right' | 'up' | 'down'): void => {
    if (gameOver) return

    let currentGrid = grid.map(row => [...row])
    let rotations = 0

    switch (direction) {
      case 'right':
        rotations = 2
        break
      case 'up':
        rotations = 3
        break
      case 'down':
        rotations = 1
        break
    }

    currentGrid = rotateGrid(currentGrid, rotations)
    const { grid: newGrid, moved, scoreIncrease } = moveLeft(currentGrid)
    const finalGrid = rotateGrid(newGrid, (4 - rotations) % 4)

    if (moved) {
      addRandomTile(finalGrid)
      setGrid(finalGrid)
      setScore(prev => {
        const newScore = prev + scoreIncrease
        if (newScore > bestScore) {
          setBestScore(newScore)
          localStorage.setItem('2048-best-score', newScore.toString())
        }
        return newScore
      })

      // Check for win
      if (!gameWon && finalGrid.some(row => row.some(cell => cell === WIN_TILE))) {
        setGameWon(true)
      }

      // Check for game over
      if (isGameOver(finalGrid)) {
        setGameOver(true)
      }
    }
  }

  const isGameOver = (currentGrid: Grid): boolean => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) return false
      }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = currentGrid[i][j]
        if (
          (i < GRID_SIZE - 1 && currentGrid[i + 1][j] === current) ||
          (j < GRID_SIZE - 1 && currentGrid[i][j + 1] === current)
        ) {
          return false
        }
      }
    }

    return true
  }

  const resetGame = () => {
    setGrid(initializeGrid())
    setScore(0)
    setGameWon(false)
    setGameOver(false)
  }

  useEffect(() => {
    setGrid(initializeGrid())
  }, [])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver && e.key !== 'r') return

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        move('left')
        break
      case 'ArrowRight':
        e.preventDefault()
        move('right')
        break
      case 'ArrowUp':
        e.preventDefault()
        move('up')
        break
      case 'ArrowDown':
        e.preventDefault()
        move('down')
        break
      case 'r':
      case 'R':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          resetGame()
        }
        break
    }
  }, [grid, gameOver])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">2048</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-6 flex gap-8 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Best</div>
              <div className="text-2xl font-bold">{bestScore}</div>
            </div>
          </div>

          {gameWon && !gameOver && (
            <div className="mb-4 text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                🎉 You reached 2048! 🎉
              </div>
              <div className="text-sm text-muted-foreground">
                Keep playing to reach a higher score!
              </div>
            </div>
          )}

          {gameOver && (
            <div className="mb-4 text-center">
              <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                Game Over! 😢
              </div>
              <div className="text-sm text-muted-foreground">
                Final Score: {score}
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-4 gap-2">
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`
                      w-20 h-20 rounded-lg flex items-center justify-center
                      font-bold text-xl
                      ${getTileColor(cell)}
                      ${getTextColor(cell)}
                      transition-all duration-200
                      ${cell === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'shadow-md'}
                    `}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <Button
              onClick={() => move('left')}
              disabled={gameOver}
              variant="outline"
              className="flex-1"
            >
              ← Left
            </Button>
            <Button
              onClick={() => move('up')}
              disabled={gameOver}
              variant="outline"
              className="flex-1"
            >
              ↑ Up
            </Button>
            <Button
              onClick={() => move('down')}
              disabled={gameOver}
              variant="outline"
              className="flex-1"
            >
              ↓ Down
            </Button>
            <Button
              onClick={() => move('right')}
              disabled={gameOver}
              variant="outline"
              className="flex-1"
            >
              → Right
            </Button>
          </div>

          {(gameOver || gameWon) && (
            <Button onClick={resetGame} size="lg" className="w-full">
              Play Again
            </Button>
          )}

          <div className="text-sm text-muted-foreground text-center mt-4">
            Use arrow keys or buttons to move tiles. Combine tiles with the same number to reach 2048!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

