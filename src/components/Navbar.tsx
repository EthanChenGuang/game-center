import { Moon, Sun, Gamepad2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  return (
    <nav className="bg-background shadow-md p-4 border-b border-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Game Center</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
      </div>
    </nav>
  )
}
