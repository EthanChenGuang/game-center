import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface MemoryProps {
  onBack: () => void
}

interface MemoryCard {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

const CARD_EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺']

export function Memory({ onBack }: MemoryProps) {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  const initializeGame = () => {
    const cardPairs = [...CARD_EMOJIS, ...CARD_EMOJIS]
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }))
    setCards(shuffled)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setGameWon(false)
  }

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    if (matches === CARD_EMOJIS.length) {
      setGameWon(true)
    }
  }, [matches])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards
      const firstCard = cards.find(card => card.id === firstId)
      const secondCard = cards.find(card => card.id === secondId)

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          )
          setFlippedCards([])
          setMatches(prev => prev + 1)
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  const handleCardClick = (id: number) => {
    const card = cards.find(c => c.id === id)
    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return
    }

    setCards(prevCards =>
      prevCards.map(c =>
        c.id === id ? { ...c, isFlipped: true } : c
      )
    )

    setFlippedCards(prev => {
      const newFlipped = [...prev, id]
      if (newFlipped.length === 2) {
        setMoves(moves + 1)
      }
      return newFlipped
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl">Memory Game</CardTitle>
            <Button variant="ghost" size="icon" onClick={initializeGame}>
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-6 flex gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">{moves}</div>
              <div className="text-sm text-muted-foreground">Moves</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{matches}/{CARD_EMOJIS.length}</div>
              <div className="text-sm text-muted-foreground">Matches</div>
            </div>
          </div>

          {gameWon && (
            <div className="mb-6 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                🎉 Congratulations! 🎉
              </div>
              <div className="text-lg text-muted-foreground">
                You won in {moves} moves!
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-6">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped}
                className={`
                  w-20 h-20 text-4xl rounded-lg
                  transition-all duration-300 transform
                  ${card.isFlipped || card.isMatched
                    ? 'bg-white dark:bg-gray-700 scale-100'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105'
                  }
                  ${card.isMatched ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  border-2 border-gray-300 dark:border-gray-600
                  shadow-lg hover:shadow-xl
                `}
              >
                {card.isFlipped || card.isMatched ? card.value : '?'}
              </button>
            ))}
          </div>

          {gameWon && (
            <Button onClick={initializeGame} size="lg" className="w-full">
              Play Again
            </Button>
          )}

          <div className="text-sm text-muted-foreground text-center mt-4">
            Click on cards to flip them and find matching pairs
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

