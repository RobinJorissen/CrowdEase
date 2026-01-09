# Implementation Plan: Store Map with Crowd Levels

**Branch**: `001-store-map` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-store-map/spec.md`

## Summary

Build an interactive PWA map showing nearby stores with real-time and historical crowd levels. Users can view stores via GPS or address input, compare crowd levels visually, and submit crowd reports. The system uses weighted reporting (GPS: 1.0, non-GPS: 0.7) with different retention policies (7 days vs 24 hours) to build historical patterns. All data stored client-side with strict privacy constraints - no PII, no GPS coordinate persistence.

## Technical Context

**Language/Version**: TypeScript 5.0+ with strict mode enabled  
**Primary Dependencies**: Next.js 15.1+ (App Router), React 19+, React Leaflet 4.2+, Tailwind CSS 3.4+, shadcn/ui components  
**Storage**: localStorage for crowd reports & historical patterns, sessionStorage for map state, no backend database  
**Testing**: Vitest for unit tests, Playwright for integration tests, React Testing Library for component tests  
**Target Platform**: Modern browsers (Chrome 90+, Safari 14+, Firefox 88+), PWA on iOS 15+ and Android 10+  
**Project Type**: Web application (Next.js App Router, single project structure)  
**Performance Goals**: <3s initial load, <5s to submit crowd report, offline-capable with service worker  
**Constraints**: No external APIs except OpenStreetMap tiles & Nominatim geocoding, client-side only, WCAG 2.1 AA compliant  
**Scale/Scope**: MVP for usability testing, ~60 mock stores in Gent, target 100 test users, <5000 lines of code

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Compliance Summary

| Principle                                | Status  | Notes                                                                                             |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| MVP First, Validation Over Perfection    | ✅ PASS | Feature directly tests core hypothesis: "Can users quickly identify which stores are busy/quiet?" |
| Mock Data With Realistic System Behavior | ✅ PASS | All store data is mocked, API latency simulated (200-500ms), realistic validation                 |
| Test-First (NON-NEGOTIABLE)              | ✅ PASS | Unit + integration tests required per spec, test scenarios defined in acceptance criteria         |
| Integration Over Isolation               | ✅ PASS | Tests cover location→store discovery→crowd display→reporting flow                                 |
| Accessibility and Clarity by Default     | ✅ PASS | WCAG 2.1 AA required (FR-017), clear visual hierarchy for crowd levels (SC-004)                   |
| Technology Stack                         | ✅ PASS | Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, React Leaflet as specified                |
| Language Rules                           | ✅ PASS | Dutch UI (all text), English code/docs/specs                                                      |
| Privacy & Location Handling              | ✅ PASS | No GPS coordinates stored, only crowd data (storeId, level, timestamp, weight)                    |
| Crowd Data Retention                     | ✅ PASS | GPS reports: 7 days→patterns, Non-GPS: 24 hours only, no PII                                      |
| Explicit Exclusions                      | ✅ PASS | No external DB, no auth, no analytics, localStorage only                                          |

### 🟡 Considerations

- **External API Usage**: Using Nominatim for geocoding is acceptable as it's a free OSM service with no data persistence
- **Service Worker Complexity**: PWA offline capability adds complexity but is MVP completion criterion per constitution
- **Historical Pattern Storage**: Long-term aggregated data is acceptable as it contains no PII and serves core hypothesis validation

**Gate Decision**: ✅ **APPROVED** - All constitutional requirements met, no violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-store-map/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technical research on React Leaflet, geocoding, PWA
├── data-model.md        # Phase 1: Entity definitions, localStorage schema, weighted reporting logic
├── quickstart.md        # Phase 1: Setup instructions, dev server, test commands
├── contracts/           # Phase 1: API contracts for route handlers
│   ├── stores.md        # GET /api/stores - Nearby stores with crowd levels
│   ├── crowd-report.md  # POST /api/crowd-report - Submit crowd indication
│   └── geocode.md       # GET /api/geocode - Address to coordinates
└── tasks.md             # Phase 2: Detailed task breakdown (NOT created yet)
```

### Source Code (repository root)

```text
app/
├── (map)/               # Main map route group
│   ├── page.tsx         # Map page with store markers
│   └── layout.tsx       # Map-specific layout
├── api/                 # Next.js Route Handlers
│   ├── stores/
│   │   └── route.ts     # GET stores near location
│   ├── crowd-report/
│   │   └── route.ts     # POST crowd report
│   └── geocode/
│       └── route.ts     # GET address geocoding
├── layout.tsx           # Root layout with Dutch metadata
├── globals.css          # Tailwind CSS imports
└── manifest.json        # PWA manifest

components/
├── map/
│   ├── StoreMap.tsx           # Main Leaflet map component
│   ├── StoreMarker.tsx        # Individual store marker with popup
│   ├── LocationInput.tsx      # Address input + GPS button
│   └── CrowdLevelIndicator.tsx # Visual crowd level display
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
└── providers/
    └── MapStateProvider.tsx   # React Context for map state

lib/
├── stores/
│   ├── mockStores.ts          # Mock store data (~50 stores)
│   └── storeService.ts        # Business logic for store queries
├── crowd/
│   ├── crowdReportService.ts  # Weighted reporting logic
│   ├── historicalPatterns.ts  # Pattern detection & aggregation
│   └── crowdCalculation.ts    # Combine real-time + historical
├── location/
│   ├── geolocation.ts         # Browser Geolocation API wrapper
│   ├── geocoding.ts           # Nominatim integration
│   └── distance.ts            # Haversine distance calculation
├── storage/
│   ├── crowdStorage.ts        # localStorage CRUD for crowd reports
│   ├── patternStorage.ts      # localStorage for historical patterns
│   └── addressStorage.ts      # localStorage for saved address
└── utils/
    ├── dateTime.ts            # Day/hour extraction, formatting
    └── validation.ts          # Input validation, proximity checks

types/
├── store.ts             # Store, StoreType interfaces
├── crowd.ts             # CrowdReport, CrowdLevel, HistoricalPattern
├── location.ts          # UserLocation, SavedAddress
└── map.ts               # MapState, MarkerData

public/
├── icons/               # PWA icons (192x192, 512x512)
└── offline.html         # Offline fallback page

tests/
├── unit/
│   ├── crowdCalculation.test.ts
│   ├── historicalPatterns.test.ts
│   ├── distance.test.ts
│   └── validation.test.ts
├── integration/
│   ├── storeDiscovery.test.ts      # Location → stores flow
│   ├── crowdReporting.test.ts      # Submit → update → display
│   └── addressGeocoding.test.ts    # Address input → map center
└── e2e/
    ├── mapInteraction.spec.ts       # Playwright: map navigation
    └── crowdReportFlow.spec.ts      # Playwright: full user journey

next.config.js           # Next.js config with PWA plugin
tailwind.config.ts       # Tailwind + shadcn/ui theme
tsconfig.json            # TypeScript strict mode
vitest.config.ts         # Vitest configuration
playwright.config.ts     # Playwright E2E configuration
package.json             # Dependencies & scripts
```

**Structure Decision**: Next.js 15 App Router with TypeScript, organized by feature domain (map, stores, crowd, location). Route Handlers simulate backend API with latency. All client-side logic in `lib/` with clear separation of concerns. PWA configured via next-pwa plugin.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
