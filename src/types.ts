// Game Center Types

export type GameType = 'home' | 'tictactoe' | 'snake' | 'memory' | 'tetris' | 'breakout'

export interface GameInfo {
  id: GameType
  title: string
  description: string
  color: string
}
