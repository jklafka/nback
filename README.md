# Dual N-Back

A cognitive training game that challenges your working memory. Track both visual positions and audio letters simultaneously, responding when either matches what appeared N steps back.

## What is Dual N-Back?

The dual n-back task is a scientifically-studied working memory exercise. During each trial:

- A position lights up on a 3x3 grid
- A letter is spoken aloud

Your job is to identify when the **current position** or **current letter** matches what appeared **N trials ago**.

## Features

- Configurable difficulty (1-back through 9-back)
- Adjustable trial count and timing
- Keyboard shortcuts (F for position, J for audio) or click the buttons
- Performance tracking with accuracy statistics
- Intelligent level recommendations based on your results
- Clean, responsive dark-themed interface

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone https://github.com/jklafka/nback.git
cd nback

# Install dependencies
bun install
# or
npm install
```

### Running

```bash
# Start development server
bun dev
# or
npm run dev
```

Open http://localhost:5173 in your browser.

### Building

```bash
bun run build
# or
npm run build
```

## How to Play

1. **Configure settings** - Choose your n-level, number of trials, and interval speed
2. **Press Start** - The game begins after a brief delay
3. **Watch and listen** - Each trial shows a grid position and plays a letter
4. **Respond when there's a match**:
   - Press **F** (or click "Position Match") if the position matches N trials ago
   - Press **J** (or click "Audio Match") if the letter matches N trials ago
5. **Review results** - See your accuracy and get a recommendation for your next session

## Settings

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| N-Level | 1-9 | 2 | How many trials back to compare |
| Trials | 10-50 | 20 | Number of stimuli per session |
| Interval | 1.5-5s | 3s | Time between each stimulus |

## Performance Metrics

After each session, you'll see:

- **Hits** - Correctly identified matches
- **Misses** - Matches you didn't respond to
- **False Alarms** - Responses when there was no match
- **Accuracy** - Percentage of correct responses

The game recommends increasing difficulty when both position and audio accuracy reach 90%, and decreasing (if above level 1) when either drops below 75%.

## Tech Stack

- React 19
- TypeScript
- Vite
- Web Speech API

## Project Structure

```
src/
├── main.tsx          # Entry point
├── App.tsx           # Main app component
├── App.css           # Styles
├── types.ts          # TypeScript interfaces
├── useGame.ts        # Game logic hook
└── components/
    ├── Settings.tsx  # Settings screen
    ├── Grid.tsx      # 3x3 grid display
    ├── Controls.tsx  # Response buttons
    └── Results.tsx   # Results screen
```

## License

MIT
