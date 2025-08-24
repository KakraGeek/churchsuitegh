# ChurchSuite Ghana

Mobile-first PWA for Ghanaian churches - Member management, MoMo giving, attendance tracking.

## Tech Stack

- **Framework:** React + Vite
- **UI:** TailwindCSS + shadcn/ui
- **Auth:** Clerk
- **Database:** Neon Postgres + Drizzle ORM
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel

## Quick Start

1. **Clone and install:**
   ```bash
   git clone <repo>
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp env.example .env
   # Edit .env with your actual keys
   ```

3. **Database setup:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Development:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:smoke` - Run smoke tests
- `npm run test:e2e` - Run e2e tests
- `npm run lint` - Run ESLint

## Environment Variables

See `env.example` for required environment variables:

- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `VITE_DATABASE_URL` - Neon Postgres connection
- `DATABASE_URL` - Same as above for Drizzle

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Utilities and configurations
├── test/          # Test files
└── App.tsx        # Main app component
```

## Testing

- **Unit tests:** Vitest with React Testing Library
- **Smoke tests:** Critical user flows
- **E2E tests:** Playwright for full app testing

## Deployment

Configured for Vercel deployment with:
- Automatic deploys from main branch
- Preview deployments for PRs
- Environment variables in Vercel dashboard

## Features (Planned)

- [x] Authentication (Clerk)
- [x] Basic dashboard
- [ ] Member management
- [ ] Attendance tracking
- [ ] MoMo payments integration
- [ ] Event scheduling
- [ ] Communications

---

Built with ❤️ for Ghanaian churches
