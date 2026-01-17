# HoldCo Utility App Stack

A collection of three Progressive Web Apps (PWAs) built for New Zealand users, sharing a common technical foundation (golden-chassis) based on Next.js 16, TypeScript, Tailwind CSS 4, and Supabase.

## Applications

| App | Description | Status |
|-----|-------------|--------|
| **[Apprentice-Log](./apprentice-log)** | Voice-to-text daily logbook for trade apprentices | 70% Complete |
| **[Bio-Swap](./bio-swap)** | Medicine barcode scanner to find generic alternatives | 70% Complete |
| **[Salvage-Scout](./salvage-scout)** | Marketplace for free salvage building materials | 70% Complete |

## Tech Stack

All apps share a common foundation:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Vercel (recommended)

## Project Structure

```
utility-app-stack/
├── apprentice-log/      # Voice recording & transcription app
├── bio-swap/            # Medicine barcode scanner app
├── salvage-scout/       # Building materials marketplace
├── golden-chassis/      # Shared component templates
├── e2e/                 # Playwright E2E tests
├── docs/                # Documentation
│   ├── API.md          # API endpoint documentation
│   └── DEPLOYMENT.md   # Deployment guide
└── DEVELOPMENT_ROADMAP.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- OpenAI API key (for Apprentice-Log and Salvage-Scout)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd utility-app-stack
   ```

2. Install dependencies for each app:
   ```bash
   cd apprentice-log && npm install && cd ..
   cd bio-swap && npm install && cd ..
   cd salvage-scout && npm install && cd ..
   ```

3. Configure environment variables (see each app's README)

4. Start development servers:
   ```bash
   # Terminal 1
   cd apprentice-log && npm run dev  # Port 3001

   # Terminal 2
   cd bio-swap && npm run dev        # Port 3002

   # Terminal 3
   cd salvage-scout && npm run dev   # Port 3003
   ```

## Documentation

- **[API Documentation](./docs/API.md)** - All API endpoints
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment
- **[Development Roadmap](./DEVELOPMENT_ROADMAP.md)** - Progress tracking

## Testing

### Unit Tests (Vitest)

```bash
# Run tests for a specific app
cd apprentice-log && npm run test
```

### E2E Tests (Playwright)

```bash
cd e2e
npm install
npm run test
```

## Development Ports

| App | Development Port |
|-----|-----------------|
| Apprentice-Log | 3001 |
| Bio-Swap | 3002 |
| Salvage-Scout | 3003 |

## Key Features by App

### Apprentice-Log
- Voice recording with real-time feedback
- OpenAI Whisper transcription
- AI-powered entry formatting (BCITO-compatible)
- Entry history with search/filter/pagination
- Manual entry option

### Bio-Swap
- Camera barcode scanning (EAN-13)
- Medicine search by name/ingredient
- Generic alternative recommendations
- PHARMAC subsidy information
- Scan history and favorites

### Salvage-Scout
- Material listing with photo upload
- AI-powered image analysis
- Category/condition/distance filtering
- Listing management (status updates)
- Saved listings and user profiles

## Accessibility

All apps meet WCAG AA standards:
- Keyboard navigation support
- Screen reader compatibility
- Skip-to-content links
- Proper heading hierarchy
- ARIA labels on interactive elements
- Color contrast compliance

## PWA Features

- Installable on mobile and desktop
- Offline indicator
- Service worker caching
- Custom offline fallback page

## License

Private - HoldCo Utility App Stack
