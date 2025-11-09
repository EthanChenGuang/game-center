import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'

interface SnakeProps {
  onBack: () => void
}

type Position = { x: number; y: number }
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION: Direction = 'RIGHT'
const GAME_SPEED = 150

export function Snake({ onBack }: SnakeProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 15, y: 10 })
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [score, setScore] = useState(0)

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const checkCollision = (head: Position, body: Position[]): boolean => {
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    // Check self collision
    return body.some(segment => segment.x === head.x && segment.y === head.y)
  }

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] }

      switch (direction) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // Check collision with walls or self
      if (checkCollision(head, prevSnake)) {
        setGameOver(true)
        setIsPaused(true)
        return prevSnake
      }

      const newSnake = [head, ...prevSnake]

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood(newSnake))
        return newSnake
      }

      // Remove tail if no food eaten
      newSnake.pop()
      return newSnake
    })
  }, [direction, food, gameOver, isPaused, generateFood])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setDirection(prev => prev !== 'DOWN' ? 'UP' : prev)
          if (isPaused) setIsPaused(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          setDirection(prev => prev !== 'UP' ? 'DOWN' : prev)
          if (isPaused) setIsPaused(false)
          break
        case 'ArrowLeft':
          e.preventDefault()
          setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev)
          if (isPaused) setIsPaused(false)
          break
        case 'ArrowRight':
          e.preventDefault()
          setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev)
          if (isPaused) setIsPaused(false)
          break
        case ' ':
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver, isPaused])

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED)
    return () => clearInterval(gameLoop)
  }, [moveSnake])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood({ x: 15, y: 10 })
    setGameOver(false)
    setIsPaused(true)
    setScore(0)
  }

  const startGame = () => {
    setIsPaused(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">Snake</CardTitle>
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
        <CardContent className="flex flex-col items-center">
          <div className="mb-4 text-center">
            <div className="text-2xl font-bold mb-2">Score: {score}</div>
            {gameOver && (
              <div className="text-xl text-red-600 dark:text-red-400 font-bold mb-2">
                Game Over! 💀
              </div>
            )}
            {isPaused && !gameOver && (
              <div className="text-sm text-muted-foreground">
                Press arrow keys or click play to start
              </div>
            )}
          </div>

          <div 
            className="relative bg-green-100 dark:bg-green-900 border-4 border-green-600 dark:border-green-500 rounded-lg"
            style={{ 
              width: GRID_SIZE * CELL_SIZE, 
              height: GRID_SIZE * CELL_SIZE 
            }}
          >
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute ${index === 0 ? 'bg-green-600 dark:bg-green-400' : 'bg-green-500 dark:bg-green-500'} rounded-sm`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-red-500 dark:bg-red-400 rounded-full"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2
              }}
            />
          </div>

          <div className="mt-6 w-full space-y-2">
            {gameOver ? (
              <Button onClick={resetGame} size="lg" className="w-full">
                Play Again
              </Button>
            ) : isPaused ? (
              <Button onClick={startGame} size="lg" className="w-full">
                Start Game
              </Button>
            ) : null}
            <div className="text-sm text-muted-foreground text-center">
              Use arrow keys to control the snake
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

