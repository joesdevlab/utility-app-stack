# Bio-Swap

A Progressive Web App (PWA) for New Zealand consumers to find generic alternatives to brand-name medicines by scanning barcodes or searching.

## Features

- **Barcode Scanning**: Scan EAN-13 barcodes using device camera
- **Medicine Search**: Search medicines by name or ingredient
- **Alternative Finder**: Find cheaper generic equivalents with potential savings
- **Subsidy Info**: Shows PHARMAC subsidy eligibility for NZ medicines
- **Scan History**: Track previous medicine lookups
- **Favorites**: Save frequently checked medicines
- **Offline Support**: PWA with offline indicators

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Barcode**: html5-qrcode library
- **Testing**: Vitest + React Testing Library + Playwright

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd bio-swap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with required environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run database migrations and seed data (see `supabase/migrations/`)

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3002](http://localhost:3002)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── medicine/      # Medicine lookup endpoint
│   │   ├── medicines/     # Medicine search endpoint
│   │   └── health/        # Health check endpoint
│   ├── history/           # Scan history page
│   └── favorites/         # Saved medicines page
├── components/
│   ├── shared/            # Reusable UI components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   └── supabase/         # Supabase client setup
├── types/                 # TypeScript type definitions
└── test/                  # Test setup and utilities
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/medicine?barcode=` | GET | Lookup medicine by barcode |
| `/api/medicines/search?q=` | GET | Search medicines by name |

See [API Documentation](../docs/API.md) for full details.

## Scripts

```bash
npm run dev          # Start development server (port 3002)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
```

## Testing

Unit tests use Vitest and React Testing Library:
```bash
npm run test
```

E2E tests use Playwright (run from `e2e/` directory):
```bash
cd ../e2e
npm run test:bio-swap
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Database Schema

Key tables:
- `medicines` - Medicine catalog with pricing, alternatives
- `bioswap_scans` - User scan history
- `bioswap_favorites` - User favorite medicines

See `supabase/migrations/` for complete schema.

## Medicine Data

The database is seeded with 40+ common NZ medicines including:
- Pain relief (Paracetamol, Ibuprofen)
- Allergy medications (Loratadine, Cetirizine)
- Digestive health (Omeprazole, Ranitidine)
- Cold & flu medications

Data includes brand names, generic names, active ingredients, pricing, and PHARMAC subsidy status.

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Ensure linting passes: `npm run lint`
4. Submit a pull request

## License

Private - HoldCo Utility App Stack
