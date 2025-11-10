import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gamepad2, Grid3x3, Zap, Brain, Moon, Sun, Box, CircleDot, Layers, Bomb, Circle, Puzzle, Rocket } from 'lucide-react'

import { GameType } from '@/App'

interface GameCenterProps {
  onSelectGame: (game: GameType) => void
  theme: string
  toggleTheme: () => void
}

interface Game {
  id: GameType
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

export function GameCenter({ onSelectGame, theme, toggleTheme }: GameCenterProps) {
  const games: Game[] = [
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe',
      description: 'Classic X and O game. Play against the computer!',
      icon: <Grid3x3 className="w-12 h-12" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'snake',
      title: 'Snake',
      description: 'Eat the food and grow longer without hitting yourself!',
      icon: <Zap className="w-12 h-12" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'memory',
      title: 'Memory Game',
      description: 'Match pairs of cards to test your memory!',
      icon: <Brain className="w-12 h-12" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'Stack the falling blocks and clear lines!',
      icon: <Box className="w-12 h-12" />,
      color: 'from-indigo-500 to-violet-500'
    },
    {
      id: 'breakout',
      title: 'Breakout',
      description: 'Break all the bricks with your paddle and ball!',
      icon: <CircleDot className="w-12 h-12" />,
      color: 'from-rose-500 to-pink-500'
    },
    {
      id: 'game2048',
      title: '2048',
      description: 'Combine tiles to reach 2048! Slide and merge numbers.',
      icon: <Layers className="w-12 h-12" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'minesweeper',
      title: 'Minesweeper',
      description: 'Find all mines without hitting one! Use logic and flags.',
      icon: <Bomb className="w-12 h-12" />,
      color: 'from-yellow-500 to-amber-500'
    },
    { 

      id: 'connectfour',
      title: 'Connect Four',
      description: 'Drop tokens strategically to connect four before the computer!',
      icon: <Circle className="w-12 h-12" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'slidingpuzzle',
      title: 'Sliding Puzzle',
      description: 'Rearrange the tiles to restore order in this classic 15-puzzle challenge!',
      icon: <Puzzle className="w-12 h-12" />,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'spaceinvaders',
      title: 'Space Invaders',
      description: 'Defend Earth from alien invaders! Shoot them down before they reach you!',
      icon: <Rocket className="w-12 h-12" />,
      color: 'from-cyan-500 to-blue-500'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Gamepad2 className="w-16 h-16 text-primary mr-4" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Game Center
          </h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Choose your favorite game and have fun!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full auto-rows-fr">
        {games.map((game) => (
          <Card 
            key={game.id}
            className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden flex flex-col h-full"
            onClick={() => onSelectGame(game.id)}
          >
            <div className={`h-2 bg-gradient-to-r ${game.color}`} />
            <CardHeader className="text-center flex-grow">
              <div className={`mx-auto p-4 rounded-full bg-gradient-to-r ${game.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {game.icon}
              </div>
              <CardTitle className="text-2xl">{game.title}</CardTitle>
              <CardDescription className="text-base">
                {game.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <Button 
                className="w-full"
                size="lg"
              >
                Play Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-muted-foreground">
        <p className="text-sm">Built with React, TypeScript, and Tailwind CSS</p>
      </div>
    </div>
  )
}

