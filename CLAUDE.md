# Portfolio Tracker

## Project Type
React + TypeScript web app for tracking investment portfolios (stocks & crypto)

## Quick Start
```bash
npm install      # Install dependencies
npm run dev      # Start dev server at http://localhost:5173
npm run test     # Run Vitest tests
npm run build    # Production build
```

## Current Status: Phase 3 Complete ✅
- **Completed**: Project setup, UI components, database, stores, layout, CRUD hooks, utilities, portfolio management UI
- **Next**: Phase 4 - Holdings Management UI (HoldingsTable, AddHoldingModal, CategoryPicker)
- See `STATUS.md` for detailed checklist

## Architecture
| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS (dark mode first) |
| Database | Dexie.js (IndexedDB, offline-first) |
| State | Zustand (persisted) |
| Charts | Recharts |
| Testing | Vitest + Testing Library |
| Icons | Lucide React |

## Key Files Structure
```
src/
├── components/
│   ├── ui/          # Button, Input, Modal, Card, Select, Toggle
│   └── layout/      # Header, Sidebar, Layout
├── db/
│   └── database.ts  # Dexie setup + initializeDatabase()
├── store/
│   ├── useSettingsStore.ts  # Theme, currency, exchange rates
│   └── useUIStore.ts        # Portfolio selection, view mode
├── types/
│   └── index.ts     # All TypeScript interfaces
└── test/
    └── phase1.test.tsx  # Phase 1 tests (12 passing)
```

## Data Models
- **Portfolio**: id, name, createdAt, updatedAt
- **Holding**: id, portfolioId, ticker, quantity, avgCost, currency, categoryId
- **Category**: id, name, color, isDefault (8 defaults: Crypto, Stock, ETF, Bond, Cash, Real Estate, Commodities, Options)
- **TickerMemory**: ticker, categoryId (remembers category for repeat tickers)
- **Settings**: displayCurrency, theme, exchangeRates, lastRateUpdate

## Currencies Supported
- USD, AUD, BTC
- Exchange rates from API (to be implemented in Phase 6)

## Development Patterns
1. Use `frontend-design` skill for all UI components
2. Phase-by-phase development with tests before moving forward
3. Update STATUS.md after each phase
4. Dark mode is default, Apple/Robinhood-inspired UX

## What's Next (Phase 4)
1. Create HoldingsTable component
2. Create HoldingRow component
3. Create AddHoldingModal
4. Create EditHoldingModal
5. Create CategoryPicker and CategoryBadge components
6. Implement cost toggle (avg per unit / total)
7. Add sorting to holdings table
8. Write Phase 4 tests

## Full Plan Reference
See `.claude/plans/groovy-soaring-fox.md` for complete 8-phase implementation plan
