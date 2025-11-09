// Game Center Types
export type GameType = 'home' | 'tictactoe' | 'snake' | 'memory' | 'game2048' | 'minesweeper' | 'tetris' | 'breakout'

export interface GameInfo {
  id: GameType
  title: string
  description: string
  color: string
}
