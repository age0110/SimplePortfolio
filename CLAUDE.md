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

## Current Status: Phase 4 Complete ✅
- **Completed**: Project setup, UI components, database, stores, layout, CRUD hooks, utilities, portfolio management UI, holdings management UI
- **Next**: Phase 5 - Visualizations (Recharts, pie charts, allocation views)
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

## What's Next (Phase 5)
1. Install and configure Recharts
2. Create base PieChart component
3. Create ChartByAsset view
4. Create ChartByCategory view
5. Create ChartByCurrency view
6. Create ChartToggle component
7. Integrate charts into dashboard
8. Write Phase 5 tests

## Full Plan Reference
See `.claude/plans/groovy-soaring-fox.md` for complete 8-phase implementation plan
