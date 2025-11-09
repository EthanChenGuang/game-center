import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Timer, Footprints } from 'lucide-react'

interface SlidingPuzzleProps {
  onBack: () => void
}

const GRID_SIZE = 4
const TILE_COUNT = GRID_SIZE * GRID_SIZE
const SOLVED_BOARD = Array.from({ length: TILE_COUNT }, (_, index) =>
  index === TILE_COUNT - 1 ? 0 : index + 1
)

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const getInversionCount = (board: number[]) => {
  let inversions = 0
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 0) continue
    for (let j = i + 1; j < board.length; j++) {
      if (board[j] === 0) continue
      if (board[i] > board[j]) {
        inversions++
      }
    }
  }
  return inversions
}

const isSolvable = (board: number[]) => {
  const inversions = getInversionCount(board)
  const blankRow = Math.floor(board.indexOf(0) / GRID_SIZE)
  const blankRowFromBottom = GRID_SIZE - blankRow

  if (GRID_SIZE % 2 !== 0) {
    return inversions % 2 === 0
  }

  if (blankRowFromBottom % 2 === 0) {
    return inversions % 2 === 1
  }

  return inversions % 2 === 0
}

const isSolved = (board: number[]) =>
  board.every((value, index) => value === SOLVED_BOARD[index])

const generateSolvableBoard = () => {
  let board = shuffleArray([...SOLVED_BOARD])
  do {
    board = shuffleArray([...SOLVED_BOARD])
  } while (!isSolvable(board) || isSolved(board))
  return board
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export function SlidingPuzzle({ onBack }: SlidingPuzzleProps) {
  const [board, setBoard] = useState<number[]>(generateSolvableBoard)
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [bestMoves, setBestMoves] = useState<number | null>(null)

  const solved = useMemo(() => isSolved(board), [board])

  useEffect(() => {
    if (solved) return
    const timer = setInterval(() => setTime(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [solved])

  useEffect(() => {
    if (!solved) return
    setBestTime(prev => {
      if (prev === null) return time
      return Math.min(prev, time)
    })
    setBestMoves(prev => {
      if (prev === null) return moves
      return Math.min(prev, moves)
    })
  }, [solved, time, moves])

  const resetGame = () => {
    setBoard(generateSolvableBoard())
    setMoves(0)
    setTime(0)
  }

  const handleTileClick = (index: number) => {
    if (solved) return

    setBoard(prevBoard => {
      const emptyIndex = prevBoard.indexOf(0)
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      const emptyRow = Math.floor(emptyIndex / GRID_SIZE)
      const emptyCol = emptyIndex % GRID_SIZE

      const distance = Math.abs(row - emptyRow) + Math.abs(col - emptyCol)
      if (distance !== 1) return prevBoard

      const newBoard = [...prevBoard]
      ;[newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]]
      setMoves(prev => prev + 1)
      return newBoard
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">Sliding Puzzle</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Timer className="w-5 h-5 text-primary mb-1" />
              <div className="text-2xl font-bold">{formatTime(time)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div className="flex flex-col items-center">
              <Footprints className="w-5 h-5 text-primary mb-1" />
              <div className="text-2xl font-bold">{moves}</div>
              <div className="text-sm text-muted-foreground">Moves</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Personal Best</div>
              <div className="text-sm">
                <div>{bestTime !== null ? `⏱ ${formatTime(bestTime)}` : '⏱ --:--'}</div>
                <div>{bestMoves !== null ? `👣 ${bestMoves}` : '👣 --'}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-4 border-slate-400 dark:border-slate-700 shadow-lg">
            <div className="grid grid-cols-4 gap-3">
              {board.map((value, index) => (
                <button
                  key={value === 0 ? 'empty' : value}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-lg text-3xl font-bold flex items-center justify-center transition-all duration-200 ${
                    value === 0
                      ? 'bg-slate-200 dark:bg-slate-800 cursor-default'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                  }`}
                  onClick={() => handleTileClick(index)}
                  disabled={value === 0}
                >
                  {value !== 0 ? value : ''}
                </button>
              ))}
            </div>
          </div>

          {solved && (
            <div className="w-full max-w-md text-center space-y-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                🎉 Puzzle Solved! 🎉
              </div>
              <div className="text-muted-foreground">
                You solved the puzzle in {moves} moves and {formatTime(time)}.
              </div>
              <Button onClick={resetGame} size="lg" className="w-full">
                Play Again
              </Button>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center max-w-xl">
            Slide numbered tiles into the empty space to arrange them in order from 1 to 15.
            Only tiles next to the empty space can move. Can you solve it quickly?
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


