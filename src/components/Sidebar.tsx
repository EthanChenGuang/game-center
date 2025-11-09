import { Home, Grid3x3, Snake as SnakeIcon, Brain } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Game } from '@/App'

interface SidebarProps {
  currentGame: Game
  onGameSelect: (game: Game) => void
}

const menuItems = [
  { id: 'home' as Game, name: 'Home', icon: Home },
  { id: 'tic-tac-toe' as Game, name: 'Tic Tac Toe', icon: Grid3x3 },
  { id: 'snake' as Game, name: 'Snake', icon: SnakeIcon },
  { id: 'memory' as Game, name: 'Memory', icon: Brain },
]

export function Sidebar({ currentGame, onGameSelect }: SidebarProps) {
  return (
    <aside className={cn(
      "w-64 h-screen p-4",
      "bg-background border-r border-border",
      "transition-colors duration-300",
      "overflow-y-auto"
    )}>
      <h2 className="text-xl font-bold mb-4 text-foreground">Games</h2>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id} className="mb-2">
            <button
              onClick={() => onGameSelect(item.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-accent",
                "transition-colors duration-200",
                currentGame === item.id && "bg-accent text-foreground font-medium"
              )}
            >
              <item.icon className="mr-3" size={20} />
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
