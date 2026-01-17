# Salvage Scout

A Progressive Web App (PWA) for listing and finding free salvage building materials in New Zealand, promoting reuse and reducing construction waste.

## Features

- **Material Listings**: Post free building materials with photos and descriptions
- **AI Analysis**: OpenAI Vision analyzes material photos to suggest titles and categories
- **Search & Filter**: Find materials by category, condition, and distance
- **Saved Listings**: Bookmark interesting materials for later
- **My Listings**: Manage posted materials with status updates
- **User Profiles**: View and manage profile information
- **Offline Support**: PWA with offline indicators and service worker caching
- **Accessibility**: WCAG AA compliant with screen reader support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Storage**: Supabase Storage for listing images
- **AI**: OpenAI GPT-4 Vision for material analysis
- **Testing**: Vitest + React Testing Library + Playwright

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd salvage-scout
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with required environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run database migrations (see `supabase/migrations/`)

5. Create Supabase Storage bucket named `listing-images`

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3003](http://localhost:3003)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── analyze/       # Image analysis endpoint
│   │   └── health/        # Health check endpoint
│   ├── my-listings/       # User's posted listings
│   ├── saved/             # Saved/bookmarked listings
│   └── profile/           # User profile page
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
| `/api/analyze` | POST | Analyze material image with AI |

See [API Documentation](../docs/API.md) for full details.

## Scripts

```bash
npm run dev          # Start development server (port 3003)
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
npm run test:salvage-scout
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for image analysis | Yes |

## Database Schema

Key tables:
- `salvage_listings` - Material listings with images, categories, conditions
- `salvage_claims` - Tracks claimed/pending materials
- `salvage_favorites` - User saved listings

See `supabase/migrations/` for complete schema.

## Material Categories

- Timber
- Metal
- Fixtures
- Paint
- Electrical
- Plumbing
- Roofing
- Insulation
- Flooring
- Other

## Listing Conditions

- New
- Like New
- Good
- Fair
- Salvage

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Ensure linting passes: `npm run lint`
4. Submit a pull request

## License

Private - HoldCo Utility App Stack
