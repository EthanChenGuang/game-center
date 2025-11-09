import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'

interface BreakoutProps {
  onBack: () => void
}

type Position = { x: number; y: number }
type Brick = { x: number; y: number; color: string; hits: number; maxHits: number }

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 500
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 15
const BALL_RADIUS = 8
const BRICK_WIDTH = 58
const BRICK_HEIGHT = 20
const BRICK_ROWS = 5
const BRICK_COLS = 10
const BRICK_PADDING = 2

const BRICK_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
]

export function Breakout({ onBack }: BreakoutProps) {
  const [paddle, setPaddle] = useState<Position>({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 })
  const [ball, setBall] = useState<Position>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 })
  const [ballVelocity, setBallVelocity] = useState({ x: 4, y: -4 })
  const [bricks, setBricks] = useState<Brick[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [gameWon, setGameWon] = useState(false)
  const mouseXRef = useRef(CANVAS_WIDTH / 2)
  const gameLoopRef = useRef<number>()

  const initBricks = useCallback((levelNum: number) => {
    const newBricks: Brick[] = []
    const rows = Math.min(BRICK_ROWS + Math.floor(levelNum / 2), 8)
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const maxHits = Math.min(Math.floor((levelNum + row) / 2) + 1, 3)
        newBricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + 50,
          color: BRICK_COLORS[row % BRICK_COLORS.length],
          hits: 0,
          maxHits: maxHits
        })
      }
    }
    setBricks(newBricks)
  }, [])

  const resetBall = useCallback(() => {
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 })
    const angle = (Math.random() * 60 - 30) * Math.PI / 180
    const speed = 4 + level * 0.5
    setBallVelocity({
      x: speed * Math.sin(angle),
      y: -speed * Math.cos(angle)
    })
  }, [level])

  const resetGame = useCallback(() => {
    setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 })
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameOver(false)
    setGameWon(false)
    setIsPaused(true)
    initBricks(1)
    resetBall()
  }, [initBricks, resetBall])

  const nextLevel = useCallback(() => {
    const newLevel = level + 1
    setLevel(newLevel)
    initBricks(newLevel)
    resetBall()
    setIsPaused(true)
    setGameWon(false)
  }, [level, initBricks, resetBall])

  useEffect(() => {
    initBricks(1)
  }, [initBricks])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameOver || isPaused) return
      const rect = document.getElementById('breakout-canvas')?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        mouseXRef.current = Math.max(PADDLE_WIDTH / 2, Math.min(CANVAS_WIDTH - PADDLE_WIDTH / 2, x))
      }
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        if (!gameOver && !gameWon) {
          setIsPaused(prev => !prev)
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [gameOver, isPaused, gameWon])

  const checkCollision = useCallback((ballPos: Position, ballVel: { x: number; y: number }) => {
    let newVelX = ballVel.x
    let newVelY = ballVel.y
    let newBricks = [...bricks]
    let scoreIncrease = 0

    // Wall collision
    if (ballPos.x - BALL_RADIUS <= 0 || ballPos.x + BALL_RADIUS >= CANVAS_WIDTH) {
      newVelX = -newVelX
    }
    if (ballPos.y - BALL_RADIUS <= 0) {
      newVelY = -newVelY
    }

    // Paddle collision
    if (
      ballPos.y + BALL_RADIUS >= paddle.y &&
      ballPos.y - BALL_RADIUS <= paddle.y + PADDLE_HEIGHT &&
      ballPos.x >= paddle.x &&
      ballPos.x <= paddle.x + PADDLE_WIDTH
    ) {
      // Calculate bounce angle based on where ball hits paddle
      const hitPos = (ballPos.x - paddle.x) / PADDLE_WIDTH
      const angle = (hitPos - 0.5) * Math.PI * 0.6
      const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY)
      newVelX = speed * Math.sin(angle)
      newVelY = -Math.abs(speed * Math.cos(angle))
    }

    // Bottom boundary (lose life)
    if (ballPos.y - BALL_RADIUS > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1
        if (newLives <= 0) {
          setGameOver(true)
          setIsPaused(true)
        } else {
          resetBall()
        }
        return newLives
      })
    }

    // Brick collision
    newBricks = newBricks.filter(brick => {
      const brickLeft = brick.x
      const brickRight = brick.x + BRICK_WIDTH
      const brickTop = brick.y
      const brickBottom = brick.y + BRICK_HEIGHT

      if (
        ballPos.x + BALL_RADIUS >= brickLeft &&
        ballPos.x - BALL_RADIUS <= brickRight &&
        ballPos.y + BALL_RADIUS >= brickTop &&
        ballPos.y - BALL_RADIUS <= brickBottom
      ) {
        // Determine collision side
        const overlapLeft = ballPos.x + BALL_RADIUS - brickLeft
        const overlapRight = brickRight - (ballPos.x - BALL_RADIUS)
        const overlapTop = ballPos.y + BALL_RADIUS - brickTop
        const overlapBottom = brickBottom - (ballPos.y - BALL_RADIUS)

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          newVelX = -newVelX
        } else {
          newVelY = -newVelY
        }

        brick.hits++
        scoreIncrease += 10 * brick.maxHits

        return brick.hits < brick.maxHits
      }
      return true
    })

    if (scoreIncrease > 0) {
      setScore(prev => prev + scoreIncrease)
    }

    if (newBricks.length === 0 && !gameWon) {
      setGameWon(true)
      setIsPaused(true)
    }

    setBricks(newBricks)
    return { x: newVelX, y: newVelY }
  }, [bricks, paddle, resetBall, gameWon])

  useEffect(() => {
    if (isPaused || gameOver) return

    const gameLoop = () => {
      // Update paddle position
      setPaddle(prev => ({
        ...prev,
        x: mouseXRef.current - PADDLE_WIDTH / 2
      }))

      // Update ball position
      setBall(prevBall => {
        const newBall = {
          x: prevBall.x + ballVelocity.x,
          y: prevBall.y + ballVelocity.y
        }
        return newBall
      })

      // Check collisions and update velocity
      setBallVelocity(prevVel => {
        const currentBall = {
          x: ball.x + prevVel.x,
          y: ball.y + prevVel.y
        }
        return checkCollision(currentBall, prevVel)
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [isPaused, gameOver, ballVelocity, ball, checkCollision])

  const startGame = () => {
    setIsPaused(false)
  }

  const getBrickOpacity = (brick: Brick) => {
    const opacity = 1 - (brick.hits / brick.maxHits) * 0.6
    return opacity
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">Breakout</CardTitle>
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
          <div className="mb-4 flex gap-8 justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-2xl font-bold">{'❤️'.repeat(lives)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="text-2xl font-bold">{level}</div>
            </div>
          </div>

          {gameOver && (
            <div className="text-xl text-red-600 dark:text-red-400 font-bold mb-2">
              Game Over! 💔
            </div>
          )}
          {gameWon && (
            <div className="text-xl text-green-600 dark:text-green-400 font-bold mb-2">
              Level Complete! 🎉
            </div>
          )}
          {isPaused && !gameOver && !gameWon && (
            <div className="text-sm text-muted-foreground mb-2">
              Move your mouse to control the paddle
            </div>
          )}

          <div 
            id="breakout-canvas"
            className="relative bg-gray-900 border-4 border-gray-700 rounded-lg overflow-hidden cursor-none"
            style={{ 
              width: CANVAS_WIDTH, 
              height: CANVAS_HEIGHT 
            }}
          >
            {/* Bricks */}
            {bricks.map((brick, index) => (
              <div
                key={index}
                className={`absolute ${brick.color} rounded`}
                style={{
                  left: brick.x,
                  top: brick.y,
                  width: BRICK_WIDTH,
                  height: BRICK_HEIGHT,
                  opacity: getBrickOpacity(brick)
                }}
              />
            ))}

            {/* Paddle */}
            <div
              className="absolute bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              style={{
                left: paddle.x,
                top: paddle.y,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT
              }}
            />

            {/* Ball */}
            <div
              className="absolute bg-white rounded-full shadow-lg shadow-white/50"
              style={{
                left: ball.x - BALL_RADIUS,
                top: ball.y - BALL_RADIUS,
                width: BALL_RADIUS * 2,
                height: BALL_RADIUS * 2
              }}
            />
          </div>

          <div className="mt-6 w-full space-y-2 max-w-md">
            {gameOver ? (
              <Button onClick={resetGame} size="lg" className="w-full">
                Play Again
              </Button>
            ) : gameWon ? (
              <Button onClick={nextLevel} size="lg" className="w-full">
                Next Level
              </Button>
            ) : isPaused ? (
              <Button onClick={startGame} size="lg" className="w-full">
                Start Game
              </Button>
            ) : null}
            <div className="text-sm text-muted-foreground text-center">
              {!gameOver && !gameWon && 'Move your mouse to control the paddle • Press Space to pause'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

