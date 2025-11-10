import { useMemo, useState } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MastermindProps {
  onBack: () => void
}

type GuessRecord = {
  guess: string[]
  exactMatches: number
  partialMatches: number
}

type GameStatus = 'playing' | 'won' | 'lost'

const CODE_LENGTH = 4
const MAX_ATTEMPTS = 10

type ColorOption = {
  id: string
  label: string
  swatchClass: string
  glowClass: string
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'ruby', label: 'Ruby Red', swatchClass: 'from-red-500 to-red-400', glowClass: 'shadow-red-500/40' },
  { id: 'azure', label: 'Azure Blue', swatchClass: 'from-blue-500 to-cyan-400', glowClass: 'shadow-blue-500/40' },
  { id: 'emerald', label: 'Emerald Green', swatchClass: 'from-emerald-500 to-green-400', glowClass: 'shadow-emerald-500/40' },
  { id: 'amber', label: 'Amber Gold', swatchClass: 'from-amber-500 to-yellow-400', glowClass: 'shadow-amber-500/40' },
  { id: 'violet', label: 'Vivid Violet', swatchClass: 'from-violet-500 to-purple-400', glowClass: 'shadow-violet-500/40' },
  { id: 'coral', label: 'Coral Sunset', swatchClass: 'from-rose-500 to-orange-400', glowClass: 'shadow-rose-500/40' }
]

const EMPTY_GUESS = Array<string | null>(CODE_LENGTH).fill(null)

const randomCode = () => {
  const selections: string[] = []
  for (let i = 0; i < CODE_LENGTH; i++) {
    const choice = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]
    selections.push(choice.id)
  }
  return selections
}

const evaluateGuess = (guess: string[], secret: string[]) => {
  let exactMatches = 0
  const secretRemainder: string[] = []
  const guessRemainder: string[] = []

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) {
      exactMatches++
    } else {
      secretRemainder.push(secret[i])
      guessRemainder.push(guess[i])
    }
  }

  let partialMatches = 0
  const colorCounts: Record<string, number> = {}

  for (const color of secretRemainder) {
    colorCounts[color] = (colorCounts[color] || 0) + 1
  }

  for (const color of guessRemainder) {
    if (colorCounts[color]) {
      partialMatches++
      colorCounts[color] -= 1
    }
  }

  return { exactMatches, partialMatches }
}

export function Mastermind({ onBack }: MastermindProps) {
  const [secretCode, setSecretCode] = useState<string[]>(() => randomCode())
  const [currentGuess, setCurrentGuess] = useState<(string | null)[]>(() => [...EMPTY_GUESS])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [guesses, setGuesses] = useState<GuessRecord[]>([])
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS)
  const [status, setStatus] = useState<GameStatus>('playing')

  const colorMap = useMemo(() => {
    const map = new Map<string, ColorOption>()
    for (const option of COLOR_OPTIONS) {
      map.set(option.id, option)
    }
    return map
  }, [])

  const handleSelectSlot = (index: number) => {
    setSelectedIndex(index)
  }

  const handlePickColor = (colorId: string) => {
    if (status !== 'playing') return

    const updatedGuess = [...currentGuess]
    updatedGuess[selectedIndex] = colorId
    setCurrentGuess(updatedGuess)

    // Move focus to the next empty slot, if available
    const nextEmptyIndex = updatedGuess.findIndex((value, idx) => value === null && idx !== selectedIndex)
    if (nextEmptyIndex !== -1) {
      setSelectedIndex(nextEmptyIndex)
    }
  }

  const handleClearSelected = () => {
    if (status !== 'playing') return
    setCurrentGuess(prev => {
      if (!prev[selectedIndex]) return prev
      const updated = [...prev]
      updated[selectedIndex] = null
      return updated
    })
  }

  const handleClearGuess = () => {
    if (status !== 'playing') return
    setCurrentGuess([...EMPTY_GUESS])
    setSelectedIndex(0)
  }

  const resetGame = () => {
    setSecretCode(randomCode())
    setCurrentGuess([...EMPTY_GUESS])
    setSelectedIndex(0)
    setGuesses([])
    setAttemptsLeft(MAX_ATTEMPTS)
    setStatus('playing')
  }

  const isGuessReady = currentGuess.every(Boolean)

  const handleSubmitGuess = () => {
    if (!isGuessReady || status !== 'playing') return

    const finalizedGuess = currentGuess.map(slot => slot!) // safe due to guard
    const result = evaluateGuess(finalizedGuess, secretCode)

    const updatedAttempts = attemptsLeft - 1
    setGuesses(prev => [...prev, { guess: finalizedGuess, ...result }])
    setAttemptsLeft(updatedAttempts)

    if (result.exactMatches === CODE_LENGTH) {
      setStatus('won')
    } else if (updatedAttempts === 0) {
      setStatus('lost')
    }

    setCurrentGuess([...EMPTY_GUESS])
    setSelectedIndex(0)
  }

  const revealCode = status === 'lost'

  const statusBanner = (() => {
    if (status === 'won') {
      return (
        <div className="rounded-lg border border-green-500/40 bg-green-50 px-4 py-3 text-green-700 shadow-sm dark:bg-green-500/10 dark:text-green-200">
          <p className="text-lg font-semibold">Code cracked!</p>
          <p className="text-sm">Brilliant deduction. Try a new code to keep the challenge going.</p>
        </div>
      )
    }

    if (status === 'lost') {
      return (
        <div className="rounded-lg border border-red-500/40 bg-red-50 px-4 py-3 text-red-700 shadow-sm dark:bg-red-500/10 dark:text-red-200">
          <p className="text-lg font-semibold">Out of attempts!</p>
          <p className="text-sm">The vault remains sealed. Study the code and give it another shot.</p>
        </div>
      )
    }

    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground dark:border-primary/20">
        Crack the four-color code in {MAX_ATTEMPTS} attempts. Exact matches are correct color in the correct slot. Partial matches are correct color in the wrong slot.
      </div>
    )
  })()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <CardTitle className="text-3xl">Mastermind</CardTitle>
              <p className="text-sm text-muted-foreground">Decode the secret sequence before you run out of attempts.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={resetGame}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {statusBanner}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-muted-foreground/10 bg-muted/30 px-4 py-3 dark:bg-muted/10">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Attempts Remaining</div>
              <div className="text-2xl font-semibold">{attemptsLeft}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground text-right">Status</div>
              <div className="text-base font-medium">
                {status === 'playing' ? 'Cracking...' : status === 'won' ? 'Solved' : 'Sealed'}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Previous Guesses</div>
            <div className="space-y-3">
              {guesses.length === 0 && (
                <div className="rounded-lg border border-muted-foreground/10 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                  No guesses yet. Use the palette below to build your first attempt.
                </div>
              )}
              {guesses.map((record, index) => (
                <div
                  key={`${record.guess.join('-')}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-muted-foreground/10 bg-card px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">#{index + 1}</span>
                    <div className="flex items-center gap-2">
                      {record.guess.map((colorId, slotIndex) => {
                        const option = colorMap.get(colorId)
                        return (
                          <div
                            key={`${colorId}-${slotIndex}`}
                            className={`h-8 w-8 rounded-full border border-white/40 bg-gradient-to-br ${option?.swatchClass ?? ''} shadow-md`}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 font-medium text-green-600 dark:text-green-300">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {record.exactMatches} exact
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 font-medium text-amber-600 dark:text-amber-300">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      {record.partialMatches} partial
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Current Guess</div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {currentGuess.map((colorId, index) => {
                const option = colorMap.get(colorId ?? '')
                const isSelected = selectedIndex === index
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSlot(index)}
                    className={`relative h-14 w-14 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? 'border-primary shadow-lg shadow-primary/30' : 'border-muted-foreground/20'}`}
                  >
                    <div
                      className={`absolute inset-1 rounded-full bg-gradient-to-br ${option ? option.swatchClass : 'from-muted/60 to-muted'} ${option ? `shadow-md ${option.glowClass}` : ''}`}
                    />
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={handleClearSelected} disabled={status !== 'playing'}>
                Clear Selected Slot
              </Button>
              <Button variant="outline" onClick={handleClearGuess} disabled={status !== 'playing'}>
                Clear Guess
              </Button>
              <Button onClick={handleSubmitGuess} disabled={!isGuessReady || status !== 'playing'}>
                Submit Guess
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Color Palette</div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {COLOR_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handlePickColor(option.id)}
                  disabled={status !== 'playing'}
                  className={`group relative flex flex-col items-center gap-2 rounded-lg border border-transparent bg-gradient-to-br ${option.swatchClass} p-3 text-center text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className={`h-12 w-12 rounded-full bg-white/10 shadow-lg ${option.glowClass}`} />
                  <span className="text-xs font-medium drop-shadow-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {revealCode && (
            <div>
              <div className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Secret Code</div>
              <div className="flex items-center justify-center gap-4">
                {secretCode.map((colorId, index) => {
                  const option = colorMap.get(colorId)
                  return (
                    <div
                      key={`${colorId}-reveal-${index}`}
                      className={`h-12 w-12 rounded-full border border-white/40 bg-gradient-to-br ${option?.swatchClass ?? ''} shadow-lg ${option?.glowClass ?? ''}`}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


