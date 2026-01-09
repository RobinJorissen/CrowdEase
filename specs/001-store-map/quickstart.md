# Quickstart: Store Map with Crowd Levels

**Feature**: 001-store-map | **Last Updated**: 2026-01-07

Quick reference for developers working on the CrowdEase store map feature.

---

## Prerequisites

- Node.js 18.17+ or 20.0+
- npm 9+ or yarn 1.22+
- Modern browser (Chrome 90+, Safari 14+, Firefox 88+)
- Git

---

## Initial Setup

### 1. Clone & Install

```bash
cd C:\Users\robin\Desktop\agileskills
npm install
```

### 2. Install Dependencies

```bash
npm install next@14.1.0 react@18 react-dom@18 typescript@5
npm install react-leaflet@4.2.1 leaflet@1.9.4
npm install @types/leaflet@1.9.8
npm install tailwindcss@3.4 postcss autoprefixer
npm install next-pwa@5.6.0
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

### 3. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

### 4. Install shadcn/ui

```bash
npx shadcn-ui@latest init
```

Select:

- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes

Then add components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
```

---

## Project Structure

See [plan.md](./plan.md) for full structure. Key directories:

```
app/             → Next.js App Router pages & API routes
components/      → React components
lib/             → Business logic & services
types/           → TypeScript interfaces
tests/           → Unit, integration, E2E tests
public/          → Static assets, PWA icons
```

---

## Development Commands

### Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm run start
```

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

---

## package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

---

## Configuration Files

### next.config.js

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Creating Mock Data

### lib/stores/mockStores.ts

```typescript
import { Store, StoreType } from '@/types/store';

export const mockStores: Store[] = [
  {
    id: 'store_001',
    name: 'Colruyt',
    type: StoreType.SUPERMARKT,
    address: {
      street: 'Veldstraat 10',
      city: 'Gent',
      postalCode: '9000',
    },
    coordinates: {
      lat: 51.0543,
      lng: 3.7174,
    },
    openingHours: {
      0: { open: '10:00', close: '20:00' }, // Sunday
      1: { open: '08:00', close: '22:00' }, // Monday
      2: { open: '08:00', close: '22:00' },
      3: { open: '08:00', close: '22:00' },
      4: { open: '08:00', close: '22:00' },
      5: { open: '08:00', close: '22:00' },
      6: { open: '08:00', close: '22:00' }, // Saturday
    },
  },
  // ... add 49 more stores
];
```

Generate more stores programmatically or use a script.

---

## Running the App

### First Time Setup

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open browser: http://localhost:3000
4. Grant location permission when prompted
5. Map should load with nearby stores

### Testing Locally

**With GPS**:

- Use browser's geolocation (allow permission)
- Or use Chrome DevTools → Sensors → Override geolocation

**Without GPS**:

- Deny location permission
- Enter address: "Korenmarkt, Gent"
- Map should center on entered location

**Submit Crowd Report**:

1. Click on store marker
2. Click "Druk" or "Rustig" button
3. Check localStorage in DevTools → Application → Local Storage
4. Verify report was saved with correct weight

---

## Debugging

### Common Issues

#### 1. Leaflet Not Loading (SSR Error)

**Error**: `window is not defined`

**Fix**: Ensure dynamic import in page component:

```typescript
const MapComponent = dynamic(() => import('@/components/map/StoreMap'), {
  ssr: false,
});
```

#### 2. Map Tiles Not Loading

**Error**: Blank gray map

**Fix**: Check network tab for tile requests. Ensure `<link>` to Leaflet CSS in `layout.tsx`:

```tsx
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossOrigin=""
/>
```

#### 3. localStorage Not Persisting

**Error**: Reports disappear on refresh

**Fix**: Check browser settings → Cookies and site data → Allow local data

---

## Testing Workflows

### Unit Test Example

```typescript
// lib/crowd/crowdCalculation.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCrowdLevel } from './crowdCalculation';

describe('calculateCrowdLevel', () => {
  it('should calculate weighted average for mixed reports', () => {
    const reports = [
      { crowdLevel: 'druk', reportWeight: 1.0 },
      { crowdLevel: 'rustig', reportWeight: 0.7 },
    ];

    const result = calculateCrowdLevel(reports);

    expect(result.level).toBe('matig');
    expect(result.source).toBe('real-time');
  });
});
```

Run: `npm test`

### E2E Test Example

```typescript
// tests/e2e/mapInteraction.spec.ts
import { test, expect } from '@playwright/test';

test('should display map with stores', async ({ page }) => {
  await page.goto('/');

  // Grant location permission
  await page.context().grantPermissions(['geolocation']);

  // Wait for map to load
  await expect(page.locator('[role="region"][aria-label*="Kaart"]')).toBeVisible();

  // Check for store markers
  const markers = page.locator('.leaflet-marker-icon');
  await expect(markers).toHaveCount(10, { timeout: 5000 });
});
```

Run: `npm run test:e2e`

---

## Environment Variables

Create `.env.local` (optional for MVP):

```env
NEXT_PUBLIC_APP_NAME=CrowdEase
NEXT_PUBLIC_APP_VERSION=1.0.0
```

Access in code:

```typescript
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

---

## Deployment (Vercel)

### 1. Connect GitHub Repo

```bash
git remote add origin <your-repo-url>
git push -u origin 001-store-map
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Or use Vercel dashboard: https://vercel.com/new

### 3. Configure Build

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

---

## Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Leaflet**: https://react-leaflet.js.org/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Troubleshooting

### Get Help

1. Check console for errors
2. Check Network tab for failed API calls
3. Check localStorage in DevTools
4. Verify geolocation permission in browser settings
5. Clear cache and hard reload (Ctrl+Shift+R)

### Reset State

Clear all localStorage:

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## Next Steps

1. ✅ Complete initial setup
2. ✅ Verify dev server runs
3. → Proceed to [tasks.md](./tasks.md) for implementation tasks
4. → Follow test-first approach per constitution

**Ready to code!** 🚀
