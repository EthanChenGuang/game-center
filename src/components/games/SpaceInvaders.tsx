import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'

interface SpaceInvadersProps {
  onBack: () => void
}

type Position = { x: number; y: number }
type Enemy = Position & { id: number }
type Bullet = Position
type EnemyBullet = Position

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 500
const PLAYER_WIDTH = 50
const PLAYER_HEIGHT = 30
const PLAYER_SPEED = 5
const BULLET_SPEED = 8
const ENEMY_BULLET_SPEED = 4
const ENEMY_SPEED = 2.5
const ENEMY_WIDTH = 40
const ENEMY_HEIGHT = 30
const ENEMY_ROWS = 3
const ENEMY_COLS = 8
const ENEMY_SPACING = 60
const ENEMY_START_Y = 50
const GAME_SPEED = 16 // ~60 FPS

export function SpaceInvaders({ onBack }: SpaceInvadersProps) {
  const [playerX, setPlayerX] = useState(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2)
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [enemyBullets, setEnemyBullets] = useState<EnemyBullet[]>([])
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [enemyDirection, setEnemyDirection] = useState<'left' | 'right'>('right')
  const enemyDirectionRef = useRef<'left' | 'right'>('right')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [level, setLevel] = useState(1)
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const lastShotTime = useRef<number>(0)
  const enemyMoveCounter = useRef<number>(0)
  const enemyShootCounter = useRef<number>(0)
  const SHOOT_COOLDOWN = 200 // milliseconds
  const ENEMY_MOVE_INTERVAL = 15 // Move enemies every 15 frames (~0.25 seconds at 60fps)
  const ENEMY_SHOOT_INTERVAL = 60 // Enemies shoot every 60 frames (~1 second at 60fps)

  const initializeEnemies = useCallback((): Enemy[] => {
    const newEnemies: Enemy[] = []
    const startX = (CANVAS_WIDTH - (ENEMY_COLS * ENEMY_SPACING)) / 2
    let id = 0
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        newEnemies.push({
          id: id++,
          x: startX + col * ENEMY_SPACING,
          y: ENEMY_START_Y + row * 40
        })
      }
    }
    return newEnemies
  }, [])

  const shootBullet = useCallback(() => {
    const now = Date.now()
    if (now - lastShotTime.current < SHOOT_COOLDOWN) {
      return
    }
    lastShotTime.current = now
    setBullets(prev => [...prev, { x: playerX + PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10 }])
  }, [playerX])

  const checkCollisions = useCallback(() => {
    // Check bullet-enemy collisions
    setBullets(prevBullets => {
      const newBullets: Bullet[] = []
      const bulletsToRemove = new Set<number>()
      
      setEnemies(prevEnemies => {
        const newEnemies: Enemy[] = []
        
        prevBullets.forEach((bullet, bulletIdx) => {
          prevEnemies.forEach((enemy) => {
            if (
              bullet.x >= enemy.x &&
              bullet.x <= enemy.x + ENEMY_WIDTH &&
              bullet.y >= enemy.y &&
              bullet.y <= enemy.y + ENEMY_HEIGHT
            ) {
              bulletsToRemove.add(bulletIdx)
              setScore(prev => prev + 10)
            }
          })
        })

        // Remove hit enemies
        prevEnemies.forEach(enemy => {
          let hit = false
          prevBullets.forEach((bullet, bulletIdx) => {
            if (
              bullet.x >= enemy.x &&
              bullet.x <= enemy.x + ENEMY_WIDTH &&
              bullet.y >= enemy.y &&
              bullet.y <= enemy.y + ENEMY_HEIGHT
            ) {
              hit = true
            }
          })
          if (!hit) {
            newEnemies.push(enemy)
          }
        })

        return newEnemies
      })

      // Keep bullets that didn't hit anything
      prevBullets.forEach((bullet, idx) => {
        if (!bulletsToRemove.has(idx) && bullet.y > 0) {
          newBullets.push(bullet)
        }
      })

      return newBullets
    })
  }, [])

  const shootEnemyBullet = useCallback(() => {
    setEnemies(prevEnemies => {
      if (prevEnemies.length === 0) return prevEnemies
      
      // Find enemies in the bottom row (highest y value)
      const bottomRowY = Math.max(...prevEnemies.map(e => e.y))
      const bottomRowEnemies = prevEnemies.filter(e => e.y === bottomRowY)
      
      if (bottomRowEnemies.length > 0) {
        // Randomly select one enemy from the bottom row to shoot
        const shootingEnemy = bottomRowEnemies[Math.floor(Math.random() * bottomRowEnemies.length)]
        setEnemyBullets(prev => [...prev, { 
          x: shootingEnemy.x + ENEMY_WIDTH / 2, 
          y: shootingEnemy.y + ENEMY_HEIGHT 
        }])
      }
      
      return prevEnemies
    })
  }, [])

  const checkEnemyBulletCollisions = useCallback(() => {
    setEnemyBullets(prevBullets => {
      const newBullets: EnemyBullet[] = []
      
      prevBullets.forEach(bullet => {
        // Check if bullet hit player
        const hitPlayer = 
          bullet.x >= playerX &&
          bullet.x <= playerX + PLAYER_WIDTH &&
          bullet.y >= CANVAS_HEIGHT - PLAYER_HEIGHT - 10 &&
          bullet.y <= CANVAS_HEIGHT - 10
        
        if (hitPlayer) {
          setLives(prev => {
            const newLives = prev - 1
            if (newLives <= 0) {
              setGameOver(true)
              setIsPaused(true)
            }
            return newLives
          })
        } else if (bullet.y < CANVAS_HEIGHT) {
          // Keep bullet if it hasn't hit player and is still on screen
          newBullets.push(bullet)
        }
      })
      
      return newBullets
    })
  }, [playerX])

  const checkEnemyCollisions = useCallback(() => {
    setEnemies(prevEnemies => {
      // Check if enemy reached bottom
      const reachedBottom = prevEnemies.some(enemy => enemy.y + ENEMY_HEIGHT >= CANVAS_HEIGHT - PLAYER_HEIGHT - 20)
      if (reachedBottom) {
        setGameOver(true)
        setIsPaused(true)
        return prevEnemies
      }

      // Check if enemy hit player
      const hitPlayer = prevEnemies.some(enemy =>
        enemy.x + ENEMY_WIDTH >= playerX &&
        enemy.x <= playerX + PLAYER_WIDTH &&
        enemy.y + ENEMY_HEIGHT >= CANVAS_HEIGHT - PLAYER_HEIGHT - 10
      )
      if (hitPlayer) {
        setLives(prev => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameOver(true)
            setIsPaused(true)
          }
          return newLives
        })
        // Reset enemies position
        return initializeEnemies()
      }

      return prevEnemies
    })
  }, [playerX, initializeEnemies])

  const moveEnemies = useCallback(() => {
    setEnemies(prevEnemies => {
      if (prevEnemies.length === 0) {
        // Level complete - clear enemy bullets
        setEnemyBullets([])
        setLevel(prev => prev + 1)
        return initializeEnemies()
      }

      const newEnemies = prevEnemies.map(enemy => ({ ...enemy }))
      const speed = ENEMY_SPEED + (level - 1) * 1.0
      const currentDirection = enemyDirectionRef.current

      // Check if enemies hit boundary BEFORE moving
      let hitBoundary = false
      if (currentDirection === 'right') {
        const rightmostEnemy = Math.max(...newEnemies.map(e => e.x + ENEMY_WIDTH))
        // Check if moving right would exceed boundary (with margin)
        if (rightmostEnemy + speed > CANVAS_WIDTH - 20) {
          hitBoundary = true
        }
      } else {
        const leftmostEnemy = Math.min(...newEnemies.map(e => e.x))
        // Check if moving left would exceed boundary (with margin)
        if (leftmostEnemy - speed < 20) {
          hitBoundary = true
        }
      }

      if (hitBoundary) {
        // Change direction and move down
        const newDirection = currentDirection === 'right' ? 'left' : 'right'
        enemyDirectionRef.current = newDirection
        setEnemyDirection(newDirection)
        newEnemies.forEach(enemy => {
          enemy.y += 20
        })
      } else {
        // Move horizontally
        newEnemies.forEach(enemy => {
          enemy.x += currentDirection === 'right' ? speed : -speed
        })
      }

      return newEnemies
    })
  }, [level, initializeEnemies])

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return

    // Move player
    if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
      setPlayerX(prev => Math.max(0, prev - PLAYER_SPEED))
    }
    if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
      setPlayerX(prev => Math.min(CANVAS_WIDTH - PLAYER_WIDTH, prev + PLAYER_SPEED))
    }

    // Move player bullets (upward)
    setBullets(prev => prev.map(bullet => ({ ...bullet, y: bullet.y - BULLET_SPEED })).filter(bullet => bullet.y > 0))

    // Move enemy bullets (downward)
    setEnemyBullets(prev => prev.map(bullet => ({ ...bullet, y: bullet.y + ENEMY_BULLET_SPEED })).filter(bullet => bullet.y < CANVAS_HEIGHT))

    // Move enemies only every N frames
    enemyMoveCounter.current += 1
    if (enemyMoveCounter.current >= ENEMY_MOVE_INTERVAL) {
      enemyMoveCounter.current = 0
      moveEnemies()
    }

    // Enemies shoot periodically
    enemyShootCounter.current += 1
    if (enemyShootCounter.current >= ENEMY_SHOOT_INTERVAL) {
      enemyShootCounter.current = 0
      shootEnemyBullet()
    }

    // Check collisions
    checkCollisions()
    checkEnemyCollisions()
    checkEnemyBulletCollisions()
  }, [gameOver, isPaused, keys, moveEnemies, checkCollisions, checkEnemyCollisions, checkEnemyBulletCollisions, shootEnemyBullet])

  useEffect(() => {
    if (!isPaused && !gameOver) {
      const intervalId = setInterval(gameLoop, GAME_SPEED)
      return () => clearInterval(intervalId)
    }
  }, [gameLoop, isPaused, gameOver])

  useEffect(() => {
    setEnemies(initializeEnemies())
  }, [initializeEnemies])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver && e.key !== 'r' && e.key !== 'R') return

      setKeys(prev => new Set(prev).add(e.key))

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        if (!isPaused && !gameOver) {
          shootBullet()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key)
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPaused, gameOver, shootBullet])

  const resetGame = () => {
    setPlayerX(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2)
    setBullets([])
    setEnemyBullets([])
    setEnemies(initializeEnemies())
    enemyDirectionRef.current = 'right'
    setEnemyDirection('right')
    setScore(0)
    setLives(3)
    setGameOver(false)
    setIsPaused(true)
    setLevel(1)
    enemyMoveCounter.current = 0
    enemyShootCounter.current = 0
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
            <CardTitle className="text-3xl">Space Invaders</CardTitle>
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
          <div className="mb-4 flex gap-8 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Lives</div>
              <div className="text-2xl font-bold">{lives}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Level</div>
              <div className="text-2xl font-bold">{level}</div>
            </div>
          </div>

          {gameOver && (
            <div className="mb-4 text-center">
              <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                Game Over! 💥
              </div>
              <div className="text-sm text-muted-foreground">
                Final Score: {score} | Level: {level}
              </div>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="mb-4 text-center">
              <div className="text-sm text-muted-foreground">
                Press arrow keys or click play to start
              </div>
            </div>
          )}

          <div 
            className="relative bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 dark:from-black dark:via-purple-950 dark:to-black border-4 border-purple-600 dark:border-purple-500 rounded-lg overflow-hidden"
            style={{ 
              width: CANVAS_WIDTH, 
              height: CANVAS_HEIGHT 
            }}
          >
            {/* Stars background */}
            <div className="absolute inset-0 opacity-30">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle ${2 + Math.random() * 2}s infinite`
                  }}
                />
              ))}
            </div>

            {/* Enemies */}
            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute bg-red-500 dark:bg-red-600 rounded-t-lg"
                style={{
                  left: enemy.x,
                  top: enemy.y,
                  width: ENEMY_WIDTH,
                  height: ENEMY_HEIGHT,
                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  👾
                </div>
              </div>
            ))}

            {/* Player Bullets */}
            {bullets.map((bullet, index) => (
              <div
                key={index}
                className="absolute bg-yellow-400 dark:bg-yellow-300 rounded-full"
                style={{
                  left: bullet.x - 3,
                  top: bullet.y,
                  width: 6,
                  height: 12
                }}
              />
            ))}

            {/* Enemy Bullets */}
            {enemyBullets.map((bullet, index) => (
              <div
                key={`enemy-${index}`}
                className="absolute bg-red-400 dark:bg-red-500 rounded-full"
                style={{
                  left: bullet.x - 3,
                  top: bullet.y,
                  width: 6,
                  height: 12
                }}
              />
            ))}

            {/* Player */}
            <div
              className="absolute bg-blue-500 dark:bg-blue-400 rounded-t-lg"
              style={{
                left: playerX,
                bottom: 10,
                width: PLAYER_WIDTH,
                height: PLAYER_HEIGHT
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                🚀
              </div>
            </div>
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
              Use ← → or A/D to move, Space to shoot. Destroy all enemies!
            </div>
          </div>
        </CardContent>
      </Card>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

