import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'

interface TetrisProps {
  onBack: () => void
}

type Position = { x: number; y: number }
type Tetromino = {
  shape: number[][]
  color: string
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 30

// Tetromino shapes
const TETROMINOES: Tetromino[] = [
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' }, // I
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-orange-500' }, // L
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-blue-500' }, // J
]

type Board = (string | null)[][]

export function Tetris({ onBack }: TetrisProps) {
  const [board, setBoard] = useState<Board>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  )
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null)
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [level, setLevel] = useState(1)
  const dropIntervalRef = useRef<number>(1000)

  const getRandomPiece = useCallback((): Tetromino => {
    return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
  }, [])

  const spawnPiece = useCallback(() => {
    const piece = getRandomPiece()
    const startX = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2)
    setCurrentPiece(piece)
    setCurrentPosition({ x: startX, y: 0 })
    return { piece, position: { x: startX, y: 0 } }
  }, [getRandomPiece])

  const isValidMove = useCallback((piece: Tetromino, position: Position, board: Board): boolean => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = position.x + col
          const newY = position.y + row
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }
          if (newY >= 0 && board[newY][newX]) {
            return false
          }
        }
      }
    }
    return true
  }, [])

  const rotatePiece = useCallback((piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    )
    return { ...piece, shape: rotated }
  }, [])

  const mergePiece = useCallback((piece: Tetromino, position: Position, board: Board): Board => {
    const newBoard = board.map(row => [...row])
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const y = position.y + row
          const x = position.x + col
          if (y >= 0) {
            newBoard[y][x] = piece.color
          }
        }
      }
    }
    return newBoard
  }, [])

  const clearLines = useCallback((board: Board): { newBoard: Board; linesCleared: number } => {
    let linesCleared = 0
    const newBoard = board.filter(row => {
      const isFull = row.every(cell => cell !== null)
      if (isFull) linesCleared++
      return !isFull
    })

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }

    return { newBoard, linesCleared }
  }, [])

  const movePieceDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const newPosition = { x: currentPosition.x, y: currentPosition.y + 1 }
    
    if (isValidMove(currentPiece, newPosition, board)) {
      setCurrentPosition(newPosition)
    } else {
      // Lock piece
      const newBoard = mergePiece(currentPiece, currentPosition, board)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
      
      setBoard(clearedBoard)
      setLines(prev => prev + linesCleared)
      setScore(prev => prev + linesCleared * 100 * level)

      // Spawn new piece
      const { piece: nextPiece, position: nextPosition } = spawnPiece()
      
      // Check game over
      if (!isValidMove(nextPiece, nextPosition, clearedBoard)) {
        setGameOver(true)
        setIsPaused(true)
      }
    }
  }, [currentPiece, currentPosition, board, gameOver, isPaused, isValidMove, mergePiece, clearLines, spawnPiece, level])

  const movePieceHorizontal = useCallback((direction: 'left' | 'right') => {
    if (!currentPiece || gameOver || isPaused) return

    const newPosition = {
      x: currentPosition.x + (direction === 'left' ? -1 : 1),
      y: currentPosition.y
    }

    if (isValidMove(currentPiece, newPosition, board)) {
      setCurrentPosition(newPosition)
    }
  }, [currentPiece, currentPosition, board, gameOver, isPaused, isValidMove])

  const rotatePieceAction = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = rotatePiece(currentPiece)
    if (isValidMove(rotated, currentPosition, board)) {
      setCurrentPiece(rotated)
    }
  }, [currentPiece, currentPosition, board, gameOver, isPaused, rotatePiece, isValidMove])

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let newPosition = { ...currentPosition }
    while (isValidMove(currentPiece, { x: newPosition.x, y: newPosition.y + 1 }, board)) {
      newPosition.y++
    }
    setCurrentPosition(newPosition)
    setTimeout(movePieceDown, 50)
  }, [currentPiece, currentPosition, board, gameOver, isPaused, isValidMove, movePieceDown])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          movePieceHorizontal('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          movePieceHorizontal('right')
          break
        case 'ArrowDown':
          e.preventDefault()
          movePieceDown()
          break
        case 'ArrowUp':
          e.preventDefault()
          rotatePieceAction()
          break
        case ' ':
          e.preventDefault()
          if (!isPaused) {
            hardDrop()
          }
          break
        case 'p':
        case 'P':
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver, movePieceHorizontal, movePieceDown, rotatePieceAction, hardDrop, isPaused])

  useEffect(() => {
    // Update drop speed based on level
    dropIntervalRef.current = Math.max(100, 1000 - (level - 1) * 100)
  }, [level])

  useEffect(() => {
    // Update level based on lines cleared
    const newLevel = Math.floor(lines / 10) + 1
    if (newLevel !== level) {
      setLevel(newLevel)
    }
  }, [lines, level])

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!isPaused && !gameOver) {
        movePieceDown()
      }
    }, dropIntervalRef.current)
    return () => clearInterval(gameLoop)
  }, [movePieceDown, isPaused, gameOver])

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      spawnPiece()
    }
  }, [currentPiece, gameOver, spawnPiece])

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)))
    setCurrentPiece(null)
    setCurrentPosition({ x: 0, y: 0 })
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(true)
  }

  const startGame = () => {
    setIsPaused(false)
  }

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row])
    
    // Draw current piece
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const y = currentPosition.y + row
            const x = currentPosition.x + col
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = currentPiece.color
            }
          }
        }
      }
    }

    return displayBoard
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">Tetris</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} disabled={gameOver}>
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={resetGame}>
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            {gameOver && (
              <div className="text-xl text-red-600 dark:text-red-400 font-bold mb-2">
                Game Over! 🎮
              </div>
            )}
            {isPaused && !gameOver && (
              <div className="text-sm text-muted-foreground mb-2">
                Press play or arrow keys to start
              </div>
            )}

            <div 
              className="relative bg-gray-900 border-4 border-gray-700 rounded-lg"
              style={{ 
                width: BOARD_WIDTH * CELL_SIZE, 
                height: BOARD_HEIGHT * CELL_SIZE 
              }}
            >
              {renderBoard().map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`border border-gray-800 ${cell || 'bg-gray-950'}`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-[200px]">
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Score:</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Lines:</span>
                  <span className="font-bold">{lines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Level:</span>
                  <span className="font-bold">{level}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Controls:</h3>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>← → : Move</div>
                <div>↑ : Rotate</div>
                <div>↓ : Soft Drop</div>
                <div>Space : Hard Drop</div>
                <div>P : Pause</div>
              </div>
            </Card>

            {gameOver ? (
              <Button onClick={resetGame} size="lg" className="w-full">
                Play Again
              </Button>
            ) : isPaused ? (
              <Button onClick={startGame} size="lg" className="w-full">
                Start Game
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

