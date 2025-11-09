import { useState, useEffect } from 'react'
import { GameCenter } from '@/components/GameCenter'
import { TicTacToe } from '@/components/games/TicTacToe'
import { Snake } from '@/components/games/Snake'
import { Memory } from '@/components/games/Memory'
import { Tetris } from '@/components/games/Tetris'
import { Breakout } from '@/components/games/Breakout'

export type GameType = 'home' | 'tictactoe' | 'snake' | 'memory' | 'tetris' | 'breakout'

function App() {
  const [theme, setTheme] = useState(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [currentGame, setCurrentGame] = useState<GameType>('home')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe':
        return <TicTacToe onBack={() => setCurrentGame('home')} />
      case 'snake':
        return <Snake onBack={() => setCurrentGame('home')} />
      case 'memory':
        return <Memory onBack={() => setCurrentGame('home')} />
      case 'tetris':
        return <Tetris onBack={() => setCurrentGame('home')} />
      case 'breakout':
        return <Breakout onBack={() => setCurrentGame('home')} />
      default:
        return <GameCenter onSelectGame={setCurrentGame} theme={theme} toggleTheme={toggleTheme} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 text-foreground">
      {renderGame()}
    </div>
  )
}

export default App
