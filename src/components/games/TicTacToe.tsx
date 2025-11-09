import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface TicTacToeProps {
  onBack: () => void
}

type Player = 'X' | 'O' | null
type Board = Player[]

export function TicTacToe({ onBack }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<Player>(null)
  const [gameOver, setGameOver] = useState(false)

  const calculateWinner = (squares: Board): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const isBoardFull = (squares: Board): boolean => {
    return squares.every(square => square !== null)
  }

  const makeComputerMove = (currentBoard: Board) => {
    const emptySquares = currentBoard
      .map((square, index) => square === null ? index : null)
      .filter(val => val !== null) as number[]

    if (emptySquares.length > 0) {
      // Simple AI: random move
      const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)]
      return randomIndex
    }
    return null
  }

  useEffect(() => {
    const winner = calculateWinner(board)
    if (winner) {
      setWinner(winner)
      setGameOver(true)
      return
    }

    if (isBoardFull(board)) {
      setGameOver(true)
      return
    }

    if (!isXNext && !gameOver) {
      // Computer's turn
      setTimeout(() => {
        const move = makeComputerMove(board)
        if (move !== null) {
          handleClick(move, true)
        }
      }, 500)
    }
  }, [board, isXNext, gameOver])

  const handleClick = (index: number, isComputerMove = false) => {
    if (board[index] || gameOver || (!isComputerMove && !isXNext)) return

    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setGameOver(false)
  }

  const renderSquare = (index: number) => {
    const value = board[index]
    return (
      <button
        className={`
          w-24 h-24 text-4xl font-bold rounded-lg
          border-2 border-gray-300 dark:border-gray-600
          transition-all duration-200
          ${!value && !gameOver ? 'hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer' : ''}
          ${value === 'X' ? 'text-blue-600 dark:text-blue-400' : ''}
          ${value === 'O' ? 'text-red-600 dark:text-red-400' : ''}
          ${gameOver ? 'cursor-not-allowed opacity-75' : ''}
          bg-white dark:bg-gray-800
        `}
        onClick={() => handleClick(index)}
        disabled={gameOver || !isXNext}
      >
        {value}
      </button>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">Tic Tac Toe</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-6 text-center">
            {gameOver ? (
              <div className="text-2xl font-bold">
                {winner ? (
                  <span className={winner === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}>
                    {winner === 'X' ? 'You Win! 🎉' : 'Computer Wins! 🤖'}
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">It's a Draw! 🤝</span>
                )}
              </div>
            ) : (
              <div className="text-xl">
                {isXNext ? (
                  <span className="text-blue-600 dark:text-blue-400">Your Turn (X)</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Computer's Turn (O)</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderSquare(index))}
          </div>

          {gameOver && (
            <Button onClick={resetGame} size="lg" className="w-full">
              Play Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

