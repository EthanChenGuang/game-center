import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Flag } from 'lucide-react'

interface MinesweeperProps {
  onBack: () => void
}

type CellState = 'hidden' | 'revealed' | 'flagged'
type Cell = {
  isMine: boolean
  state: CellState
  adjacentMines: number
}

const BOARD_SIZE = 10
const MINE_COUNT = 15

export function Minesweeper({ onBack }: MinesweeperProps) {
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [firstClick, setFirstClick] = useState(true)
  const [flagsPlaced, setFlagsPlaced] = useState(0)
  const [cellsRevealed, setCellsRevealed] = useState(0)

  const initializeBoard = (excludeRow?: number, excludeCol?: number): Cell[][] => {
    const newBoard: Cell[][] = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => ({
            isMine: false,
            state: 'hidden' as CellState,
            adjacentMines: 0,
          }))
      )

    // Place mines randomly, excluding the first clicked cell
    let minesPlaced = 0
    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * BOARD_SIZE)
      const col = Math.floor(Math.random() * BOARD_SIZE)
      if (
        !newBoard[row][col].isMine &&
        !(row === excludeRow && col === excludeCol)
      ) {
        newBoard[row][col].isMine = true
        minesPlaced++
      }
    }

    // Calculate adjacent mines for each cell
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue
              const ni = i + di
              const nj = j + dj
              if (
                ni >= 0 &&
                ni < BOARD_SIZE &&
                nj >= 0 &&
                nj < BOARD_SIZE &&
                newBoard[ni][nj].isMine
              ) {
                count++
              }
            }
          }
          newBoard[i][j].adjacentMines = count
        }
      }
    }

    return newBoard
  }

  const revealCell = useCallback((row: number, col: number, currentBoard: Cell[][]) => {
    if (
      row < 0 ||
      row >= BOARD_SIZE ||
      col < 0 ||
      col >= BOARD_SIZE ||
      currentBoard[row][col].state === 'revealed' ||
      currentBoard[row][col].state === 'flagged'
    ) {
      return currentBoard
    }

    const newBoard = currentBoard.map(r => r.map(c => ({ ...c })))
    newBoard[row][col].state = 'revealed'

    // If it's a mine, game over
    if (newBoard[row][col].isMine) {
      return newBoard
    }

    // If no adjacent mines, reveal adjacent cells recursively
    if (newBoard[row][col].adjacentMines === 0) {
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue
          const newRow = row + di
          const newCol = col + dj
          if (
            newRow >= 0 &&
            newRow < BOARD_SIZE &&
            newCol >= 0 &&
            newCol < BOARD_SIZE
          ) {
            newBoard = revealCell(newRow, newCol, newBoard)
          }
        }
      }
    }

    return newBoard
  }, [])

  const handleCellClick = (row: number, col: number, isRightClick = false) => {
    if (gameOver || gameWon) return

    if (isRightClick) {
      // Toggle flag
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(r => r.map(c => ({ ...c })))
        const cell = newBoard[row][col]
        if (cell.state === 'hidden') {
          cell.state = 'flagged'
          setFlagsPlaced(prev => prev + 1)
        } else if (cell.state === 'flagged') {
          cell.state = 'hidden'
          setFlagsPlaced(prev => prev - 1)
        }
        return newBoard
      })
      return
    }

    // Left click
    if (board[row][col].state === 'flagged' || board[row][col].state === 'revealed') {
      return
    }

    let newBoard: Cell[][]

    if (firstClick) {
      // Initialize board on first click, ensuring the clicked cell is safe
      newBoard = initializeBoard(row, col)
      setFirstClick(false)
    } else {
      newBoard = board.map(r => r.map(c => ({ ...c })))
    }

    newBoard = revealCell(row, col, newBoard)

    // Check if clicked on a mine
    if (newBoard[row][col].isMine) {
      // Reveal all mines
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (newBoard[i][j].isMine) {
            newBoard[i][j].state = 'revealed'
          }
        }
      }
      setGameOver(true)
    } else {
      // Count revealed cells
      const revealed = newBoard.flat().filter(cell => cell.state === 'revealed').length
      setCellsRevealed(revealed)

      // Check win condition: all non-mine cells revealed
      const totalCells = BOARD_SIZE * BOARD_SIZE
      if (revealed === totalCells - MINE_COUNT) {
        setGameWon(true)
        // Flag all remaining mines
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (newBoard[i][j].isMine && newBoard[i][j].state !== 'flagged') {
              newBoard[i][j].state = 'flagged'
            }
          }
        }
        setFlagsPlaced(MINE_COUNT)
      }
    }

    setBoard(newBoard)
  }

  const resetGame = () => {
    setBoard(initializeBoard())
    setGameOver(false)
    setGameWon(false)
    setFirstClick(true)
    setFlagsPlaced(0)
    setCellsRevealed(0)
  }

  useEffect(() => {
    resetGame()
  }, [])

  const getCellColor = (adjacentMines: number): string => {
    const colors: Record<number, string> = {
      1: 'text-blue-600 dark:text-blue-400',
      2: 'text-green-600 dark:text-green-400',
      3: 'text-red-600 dark:text-red-400',
      4: 'text-purple-600 dark:text-purple-400',
      5: 'text-yellow-600 dark:text-yellow-400',
      6: 'text-pink-600 dark:text-pink-400',
      7: 'text-gray-600 dark:text-gray-400',
      8: 'text-orange-600 dark:text-orange-400',
    }
    return colors[adjacentMines] || 'text-gray-800 dark:text-gray-200'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">Minesweeper</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-6 flex gap-8 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Flags</div>
              <div className="text-2xl font-bold">{flagsPlaced}/{MINE_COUNT}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Revealed</div>
              <div className="text-2xl font-bold">{cellsRevealed}/{BOARD_SIZE * BOARD_SIZE - MINE_COUNT}</div>
            </div>
          </div>

          {gameWon && (
            <div className="mb-4 text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                🎉 Congratulations! 🎉
              </div>
              <div className="text-sm text-muted-foreground">
                You cleared all mines!
              </div>
            </div>
          )}

          {gameOver && (
            <div className="mb-4 text-center">
              <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                💥 Game Over! 💥
              </div>
              <div className="text-sm text-muted-foreground">
                You hit a mine!
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-10 gap-1">
              {board.map((row, i) =>
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j, false)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      handleCellClick(i, j, true)
                    }}
                    disabled={gameOver || gameWon || cell.state === 'revealed'}
                    className={`
                      w-8 h-8 text-xs font-bold rounded
                      transition-all duration-150
                      flex items-center justify-center
                      ${
                        cell.state === 'revealed'
                          ? cell.isMine
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                          : cell.state === 'flagged'
                          ? 'bg-yellow-400 dark:bg-yellow-600 text-red-600 dark:text-red-800'
                          : 'bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700'
                      }
                      ${cell.state === 'hidden' && !gameOver && !gameWon ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    {cell.state === 'flagged' ? (
                      <Flag className="w-4 h-4" />
                    ) : cell.state === 'revealed' ? (
                      cell.isMine ? (
                        '💣'
                      ) : cell.adjacentMines > 0 ? (
                        <span className={getCellColor(cell.adjacentMines)}>
                          {cell.adjacentMines}
                        </span>
                      ) : null
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>

          {(gameOver || gameWon) && (
            <Button onClick={resetGame} size="lg" className="w-full">
              Play Again
            </Button>
          )}

          <div className="text-sm text-muted-foreground text-center mt-4">
            Left click to reveal, right click to flag. Find all {MINE_COUNT} mines!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

