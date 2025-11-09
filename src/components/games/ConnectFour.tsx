import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react'

interface ConnectFourProps {
  onBack: () => void
}

type Player = 'player' | 'computer'
type Cell = Player | null

const ROWS = 6
const COLS = 7
const CONNECT = 4

const createEmptyBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))

const cloneBoard = (board: Cell[][]): Cell[][] => board.map(row => [...row])

const getAvailableRow = (board: Cell[][], col: number): number | null => {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row][col]) {
      return row
    }
  }
  return null
}

const checkDirection = (board: Cell[][], row: number, col: number, deltaRow: number, deltaCol: number, player: Player) => {
  let count = 0
  let r = row
  let c = col

  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
    count++
    r += deltaRow
    c += deltaCol
  }

  return count
}

const checkWinFromCell = (board: Cell[][], row: number, col: number, player: Player) => {
  if (board[row][col] !== player) return false

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ]

  return directions.some(([deltaRow, deltaCol]) => {
    const forward = checkDirection(board, row, col, deltaRow, deltaCol, player)
    const backward = checkDirection(board, row, col, -deltaRow, -deltaCol, player) - 1
    return forward + backward >= CONNECT
  })
}

const checkWinner = (board: Cell[][], player: Player): boolean => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (checkWinFromCell(board, row, col, player)) {
        return true
      }
    }
  }
  return false
}

const isBoardFull = (board: Cell[][]) => board.every(row => row.every(cell => cell !== null))

const evaluateMove = (board: Cell[][], col: number, player: Player) => {
  const targetRow = getAvailableRow(board, col)
  if (targetRow === null) return null

  const nextBoard = cloneBoard(board)
  nextBoard[targetRow][col] = player

  return {
    board: nextBoard,
    row: targetRow
  }
}

const chooseComputerColumn = (board: Cell[][]): number | null => {
  const availableColumns = Array.from({ length: COLS }, (_, col) => col).filter(col => getAvailableRow(board, col) !== null)
  if (!availableColumns.length) return null

  // Winning move
  for (const col of availableColumns) {
    const potential = evaluateMove(board, col, 'computer')
    if (potential && checkWinner(potential.board, 'computer')) {
      return col
    }
  }

  // Block player's winning move
  for (const col of availableColumns) {
    const potential = evaluateMove(board, col, 'player')
    if (potential && checkWinner(potential.board, 'player')) {
      return col
    }
  }

  // Prefer central columns for better coverage
  const centerColumn = Math.floor(COLS / 2)
  availableColumns.sort((a, b) => Math.abs(a - centerColumn) - Math.abs(b - centerColumn))

  return availableColumns[0] ?? null
}

export function ConnectFour({ onBack }: ConnectFourProps) {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('player')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [playerWins, setPlayerWins] = useState(0)
  const [computerWins, setComputerWins] = useState(0)
  const [isThinking, setIsThinking] = useState(false)

  const availableColumns = useMemo(
    () => Array.from({ length: COLS }, (_, col) => col).filter(col => getAvailableRow(board, col) !== null),
    [board]
  )

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('player')
    setWinner(null)
    setIsThinking(false)
  }

  const handleMove = useCallback((col: number, player: Player) => {
    if (winner) {
      return
    }

    setBoard(prevBoard => {
      const row = getAvailableRow(prevBoard, col)
      if (row === null) return prevBoard

      const nextBoard = cloneBoard(prevBoard)
      nextBoard[row][col] = player

      if (checkWinner(nextBoard, player)) {
        setWinner(player)
        if (player === 'player') {
          setPlayerWins(prev => prev + 1)
        } else {
          setComputerWins(prev => prev + 1)
        }
        setIsThinking(false)
      } else if (isBoardFull(nextBoard)) {
        setWinner('draw')
        setIsThinking(false)
      } else {
        setCurrentPlayer(prev => (prev === 'player' ? 'computer' : 'player'))
      }

      return nextBoard
    })
  }, [winner])

  const handlePlayerMove = (col: number) => {
    if (currentPlayer !== 'player' || winner) return
    handleMove(col, 'player')
  }

  useEffect(() => {
    if (currentPlayer !== 'computer' || winner) return
    if (!availableColumns.length) return

    setIsThinking(true)
    const timeout = setTimeout(() => {
      const column = chooseComputerColumn(board)
      if (column !== null) {
        handleMove(column, 'computer')
      }
      setIsThinking(false)
    }, 700)

    return () => clearTimeout(timeout)
  }, [board, currentPlayer, winner, availableColumns, handleMove])

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl flex items-center gap-2">
              Connect Four
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{playerWins}</div>
              <div className="text-sm text-muted-foreground">Player Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">{computerWins}</div>
              <div className="text-sm text-muted-foreground">Computer Wins</div>
            </div>
          </div>

          <div className="text-center min-h-[40px]">
            {winner === 'player' && (
              <div className="text-xl font-bold text-green-600 dark:text-green-400">You connected four! 🎉</div>
            )}
            {winner === 'computer' && (
              <div className="text-xl font-bold text-red-600 dark:text-red-400">The computer connected four!</div>
            )}
            {winner === 'draw' && (
              <div className="text-xl font-bold text-blue-500 dark:text-blue-400">It&apos;s a draw!</div>
            )}
            {!winner && (
              <div className="text-sm text-muted-foreground">
                {currentPlayer === 'player'
                  ? 'Your turn! Click any column to drop a disc.'
                  : isThinking
                    ? 'Computer is planning its move...'
                    : 'Computer is playing.'}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-sky-100 dark:bg-sky-900 border-4 border-sky-500 dark:border-sky-400 shadow-lg">
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: COLS }, (_, colIndex) => (
                <button
                  key={colIndex}
                  className="group focus:outline-none disabled:opacity-60"
                  onClick={() => handlePlayerMove(colIndex)}
                  disabled={currentPlayer !== 'player' || !!winner || getAvailableRow(board, colIndex) === null}
                >
                  <div className="grid grid-rows-6 gap-3">
                    {Array.from({ length: ROWS }, (_, rowIndex) => {
                      const cell = board[rowIndex][colIndex]
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-sky-400 dark:border-sky-500 bg-white dark:bg-gray-800 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        >
                          <div
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-colors duration-300 ${
                              cell === 'player'
                                ? 'bg-rose-500 dark:bg-rose-400'
                                : cell === 'computer'
                                  ? 'bg-yellow-400 dark:bg-yellow-300'
                                  : 'bg-transparent'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {winner && (
            <Button onClick={resetGame} size="lg" className="w-full max-w-sm">
              Play Again
            </Button>
          )}

          <div className="text-sm text-muted-foreground text-center mt-2">
            Connect four discs in a row before the computer does!
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


