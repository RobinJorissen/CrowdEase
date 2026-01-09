# CrowdEase Constitution

## Core Principles

### I. MVP First, Validation Over Perfection

CrowdEase is a consultation MVP, not a production-ready application.  
Every feature must directly support validating the core hypothesis:  
_Can users quickly and confidently identify which nearby stores are busy and which are quiet?_

Features that do not contribute to value proposition validation, usability testing, or choice architecture are explicitly out of scope.

---

### II. Mock Data With Realistic System Behavior

All application data is mocked, but system behavior must be realistic.  
API interactions, latency simulation, validation rules, and error handling must behave as if backed by a real backend system.

Mock data may be intentionally manipulated to create consistent testing scenarios and to provoke meaningful user behavior during consultation.

---

### III. Test-First (NON-NEGOTIABLE)

Automated testing is mandatory.  
Features must be implemented only after defining how they will be tested.

At minimum, the project requires:

- unit tests
- integration tests

Manual testing during consultation complements automated tests but never replaces them.

---

### IV. Integration Over Isolation

Integration testing is required for all critical flows, including:

- location-based store discovery
- crowd level calculation and display
- check-in or crowd indication interactions
- points/rewards system with check-in validation
- aanbeveling (recommendation) logic for quietest stores

The MVP must prove that components work together as a system, not only in isolation.

---

### V. Accessibility and Clarity by Default

Accessibility and clarity are non-negotiable.  
All user-facing UI must adhere to WCAG guidelines appropriate for an MVP context.

The interface is expected to actively reduce choice overload by:

- guiding users toward better options
- using clear visual hierarchies
- avoiding neutral or ambiguous presentation

A clear, accessible experience always takes precedence over feature richness.

---

## Technology, Language & Privacy Constraints

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context
- **Persistence**: localStorage (client-side only)
- **Maps**: React Leaflet (OpenStreetMap)
- **Backend Simulation**: Next.js Route Handlers
- **Deployment Target**: Vercel

### Language Rules

- All user-facing UI text is written in **Dutch**.
- All AI agent interaction and reasoning is conducted in **Dutch**.
- All source code, comments, documentation, specifications, and commit messages are written in **English**.
- Mixing languages within a single concern is not allowed.

### Privacy & Location Handling

- User location data (GPS coordinates) is never stored, logged, or persisted.
- Location data is used only at runtime to calculate nearby stores or validate proximity-based actions.
- All location data is processed in-memory and discarded immediately after use.
- No historical or analytical location tracking of user movements is permitted.
- Users may optionally save their preferred address (not GPS coordinates) in localStorage for convenience.
- The system may store anonymized crowd level data (busy/quiet indicators) with timestamps and store IDs only.
- No personally identifiable information (name, phone ID, device ID) may be stored with crowd reports.

### Crowd Data Collection & Retention

- **GPS-verified reports**: Reports submitted with GPS verification (user within 100m of store) have weight 1.0 and are retained long-term for pattern analysis.
- **Non-GPS reports**: Reports submitted without GPS verification (e.g., address-based location) have weight 0.7 and are retained only for 24 hours.
- Only the following data may be persisted: `storeId`, `crowdLevel` (druk/rustig/matig), `timestamp`, `reportWeight` (0.7 or 1.0), `dayOfWeek`, `hourOfDay`.
- Historical patterns (e.g., "Saturdays 11:00-13:00 typically busy") are calculated from aggregated data and displayed to users.
- Individual report details beyond 7 days are aggregated into hourly patterns and raw data is deleted.

### Points & Rewards System

- Users earn points for validated actions (check-ins at stores when physically present).
- Points are stored in localStorage as `{ userId: string, points: number, lastUpdated: timestamp }`.
- Check-in validation requires GPS location within 100m of store coordinates.
- Points can be redeemed for mock bonuses/rewards displayed in the UI.
- No real monetary value or external rewards integration is implemented.
- Points data is client-side only and never synchronized to external systems.

### Explicit Exclusions

- No external databases
- No real user authentication
- No analytics or tracking
- No scalability or performance optimization beyond MVP needs

---

## Development & MVP Completion Rules

### Development Workflow

- Development is feature-driven and iterative.
- Each feature must:
  - be visible in the UI
  - be demonstrable in the PWA
  - support at least one validation goal (value, usability, or choice architecture)
- Demo mechanisms and “Wizard of Oz” techniques are explicitly allowed.

### MVP Completion Criteria

The MVP is considered finished when:

- The application is accessible as a PWA
- Users can see which nearby stores are busy and which are quiet
- Users can compare stores based on crowd level (map view and list view)
- The quietest/best matching store is visually highlighted as aanbeveling
- Users can indicate whether a store is busy or not
- Users can check-in at a store when physically present (validated by GPS)
- Users earn points for check-ins and can view accumulated points
- Users can view and redeem bonuses/rewards with points
- All core flows work without external dependencies

Once these criteria are met, no additional features may be added.

---

## Governance

This Constitution supersedes all informal agreements and conventions.

Deviations are allowed only when explicitly documented and motivated.  
Amendments require:

- documentation of the change
- a clear rationale
- a version update

All development decisions must remain compliant with this Constitution.

**Version**: 1.1.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
