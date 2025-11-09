# 📁 Project Structure

```
gaming-center/
├── 📄 index.html                 # Main HTML entry point
├── 📄 package.json              # Dependencies and scripts
├── 📄 README.md                 # Project documentation
├── 📄 FEATURES.md               # Detailed features overview
├── 📄 PROJECT_STRUCTURE.md      # This file
├── 📄 tailwind.config.js        # Tailwind CSS configuration
├── 📄 vite.config.ts            # Vite build configuration
├── 📄 tsconfig.json             # TypeScript configuration
│
├── 📁 public/                   # Static assets
│
└── 📁 src/                      # Source code
    ├── 📄 main.tsx              # Application entry point
    ├── 📄 App.tsx               # Main App component with routing
    ├── 📄 App.css               # Custom global styles
    ├── 📄 index.css             # Tailwind imports & theme variables
    ├── 📄 types.ts              # TypeScript type definitions
    │
    ├── 📁 components/           # React components
    │   ├── 📄 GameCenter.tsx    # Home screen with game selection
    │   │
    │   ├── 📁 games/            # Individual game components
    │   │   ├── 📄 TicTacToe.tsx # Tic Tac Toe game
    │   │   ├── 📄 Snake.tsx     # Snake game
    │   │   └── 📄 Memory.tsx    # Memory card game
    │   │
    │   └── 📁 ui/               # Reusable UI components (shadcn/ui)
    │       ├── 📄 button.tsx
    │       ├── 📄 card.tsx
    │       └── ...
    │
    └── 📁 lib/                  # Utility functions
        └── 📄 utils.ts          # Helper utilities
```

## 🎯 Key Files Description

### Root Configuration Files

- **`package.json`** - Project dependencies including React, TypeScript, Tailwind CSS, and shadcn/ui components
- **`vite.config.ts`** - Vite configuration for fast development and optimized builds
- **`tailwind.config.js`** - Tailwind CSS customization and theme settings
- **`tsconfig.json`** - TypeScript compiler options and path aliases

### Source Files

#### Core Application
- **`main.tsx`** - React app entry point, renders the root App component
- **`App.tsx`** - Main application logic with game routing and theme management
- **`types.ts`** - Shared TypeScript interfaces and types

#### Styling
- **`index.css`** - Tailwind directives and CSS custom properties for theming
- **`App.css`** - Additional custom styles for game-specific styling

#### Components

**GameCenter.tsx**
- Home screen component
- Displays game cards in a responsive grid
- Handles theme toggle
- Manages game selection

**games/TicTacToe.tsx**
- Complete Tic Tac Toe game logic
- Player vs Computer AI
- Win/draw detection
- Game state management

**games/Snake.tsx**
- Classic Snake game implementation
- Keyboard controls (arrow keys)
- Collision detection
- Score tracking
- Pause/resume functionality

**games/Memory.tsx**
- Memory card matching game
- Card flip animations
- Match detection
- Move counter
- Win condition checking

**ui/** (shadcn/ui components)
- Pre-built, customizable UI components
- Button, Card, Input, etc.
- Styled with Tailwind CSS
- Fully accessible

## 🔄 Data Flow

```
main.tsx
    ↓
App.tsx (manages current game state)
    ↓
    ├─→ GameCenter.tsx (game selection)
    │       ↓
    │   [User selects a game]
    │       ↓
    └─→ Game Component (TicTacToe/Snake/Memory)
            ↓
        [User plays game]
            ↓
        [Back button returns to GameCenter]
```

## 🎨 Styling Architecture

1. **Tailwind CSS** - Utility-first styling
2. **CSS Variables** - Theme colors in `index.css`
3. **Dark Mode** - Class-based dark mode with system preference detection
4. **Component Styles** - Inline Tailwind classes for component-specific styling
5. **Custom CSS** - Limited custom CSS in `App.css` for special effects

## 🚀 Development Workflow

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint for code quality
```

### Development Flow

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the dev server
3. Open `http://localhost:5173` in your browser
4. Edit files in `src/` - changes reflect immediately (HMR)
5. Build with `npm run build` when ready for production

## 📦 Dependencies Overview

### Core
- `react` & `react-dom` - UI library
- `typescript` - Type safety
- `vite` - Build tool

### Styling
- `tailwindcss` - CSS framework
- `tailwindcss-animate` - Animation utilities
- `class-variance-authority` - Component variants
- `tailwind-merge` - Merge Tailwind classes

### UI Components
- `@radix-ui/*` - Accessible component primitives
- `lucide-react` - Icon library

### Utilities
- `clsx` - Conditional classNames
- `next-themes` - Theme management

## 🎯 Component Patterns

All game components follow a consistent pattern:

1. **Props Interface**: Accept `onBack` callback
2. **State Management**: Local state with useState
3. **Game Logic**: Self-contained game rules
4. **Controls**: Keyboard/mouse event handlers
5. **UI Structure**: Card wrapper with header and content
6. **Navigation**: Back button to return home

This makes it easy to add new games following the same pattern!

