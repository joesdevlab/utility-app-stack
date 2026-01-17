# Apprentice Log

A Progressive Web App (PWA) for New Zealand trade apprentices to record their daily work activities using voice-to-text transcription.

## Features

- **Voice Recording**: Record audio descriptions of daily work activities
- **AI Transcription**: OpenAI Whisper converts voice recordings to text
- **Smart Formatting**: AI structures transcripts into BCITO-compatible logbook entries
- **Entry Management**: View, edit, search, and filter logbook entries
- **Offline Support**: PWA with offline indicators and service worker caching
- **Accessibility**: WCAG AA compliant with screen reader support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **AI**: OpenAI Whisper (transcription) + GPT-4 (formatting)
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
   cd apprentice-log
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

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3001](http://localhost:3001)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── transcribe/    # Audio transcription endpoint
│   │   ├── format-entry/  # Entry formatting endpoint
│   │   └── health/        # Health check endpoint
│   ├── history/           # Entry history page
│   └── settings/          # User settings page
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
| `/api/transcribe` | POST | Transcribe audio to text |
| `/api/format-entry` | POST | Format transcript into logbook entry |

See [API Documentation](../docs/API.md) for full details.

## Scripts

```bash
npm run dev          # Start development server (port 3001)
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
npm run test:apprentice-log
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for transcription | Yes |

## Database Schema

Key tables:
- `apprentice_entries` - Logbook entries with tasks, hours, skills
- `profiles` - User profile information

See `supabase/migrations/` for complete schema.

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Ensure linting passes: `npm run lint`
4. Submit a pull request

## License

Private - HoldCo Utility App Stack
