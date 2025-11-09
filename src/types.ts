// Game Center Types

export type GameType = 'home' | 'tictactoe' | 'snake' | 'memory'

export interface GameInfo {
  id: GameType
  title: string
  description: string
  color: string
}
