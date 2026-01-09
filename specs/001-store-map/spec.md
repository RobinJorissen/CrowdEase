# Feature Specification: Store Map with Crowd Levels

**Feature Branch**: `001-store-map`  
**Created**: 2026-01-07  
**Status**: Draft  
**Input**: User description: "Display nearby stores with crowd levels on map"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - View Nearby Stores on Map (Priority: P1)

As a user, I want to see which stores are within walking distance so I can decide where to go shopping.

**Why this priority**: This is the foundation of the MVP. Without a map showing nearby stores, users cannot make any decisions. This validates the core value proposition: "Can users quickly identify which stores are nearby?"

**Independent Test**: Can be fully tested by opening the PWA and verifying that stores appear on the map based on user location. Delivers immediate value even without crowd data.

**Acceptance Scenarios**:

1. **Given** I open the CrowdEase PWA for the first time, **When** I grant location permission, **Then** I see a map centered on my location with nearby stores displayed as markers
2. **Given** I am viewing the map, **When** I pan or zoom the map, **Then** the store markers remain visible and correctly positioned
3. **Given** location services are disabled or denied, **When** I open the app, **Then** I see an address input field with placeholder "Voer je adres in (bijv. Marktstraat 10, Amsterdam)" and a "Zoek" button
4. **Given** I enter a valid address and tap "Zoek", **When** geocoding completes, **Then** the map centers on that address and shows nearby stores (with optional "Bewaar dit adres" checkbox for future use)
5. **Given** I tap on a store marker, **When** the marker is selected, **Then** I see the store name and address in a popup

---

### User Story 2 - See Real-time Crowd Levels (Priority: P1)

As a user, I want to see which stores are busy and which are quiet so I can avoid crowded places.

**Why this priority**: This is the core hypothesis validation. This feature directly tests: "Can users quickly and confidently identify which stores are busy and which are quiet?"

**Independent Test**: Can be tested by viewing the map and verifying that crowd levels are visually distinct. Delivers the primary MVP value.

**Acceptance Scenarios**:

1. **Given** I am viewing the map with stores, **When** I look at store markers, **Then** I can clearly distinguish between druk (busy), matig (moderate), and rustig (quiet) stores through color coding
2. **Given** I tap on a store marker, **When** the popup opens, **Then** I see the current crowd level calculated from recent reports (last 30 min) combined with historical patterns (e.g., "Rustig - meestal rustig op dit tijdstip")
3. **Given** I tap on a store marker during a typically busy time (e.g., Saturday 11:00), **When** there are no recent reports, **Then** I see historical pattern indicator (e.g., "Meestal druk op zaterdagen tussen 11:00-13:00")
4. **Given** a store has no recent data AND no historical pattern, **When** I tap the marker, **Then** I see "Geen drukte-informatie beschikbaar"
5. **Given** crowd level is based on historical patterns only, **When** displayed, **Then** it shows with distinct visual indicator (e.g., dashed border, clock icon) to distinguish from real-time data

---

### User Story 3 - Compare Multiple Stores (Priority: P2)

As a user, I want to compare crowd levels across multiple stores so I can choose the quietest option.

**Why this priority**: This supports choice architecture validation. Testing whether visual comparison helps users make better decisions.

**Independent Test**: Can be tested by selecting multiple stores and verifying comparison view works independently of other features.

**Acceptance Scenarios**:

1. **Given** I see multiple stores on the map, **When** I select a store type filter (e.g., "Supermarkt"), **Then** only stores of that type are displayed
2. **Given** I am viewing stores of the same type, **When** I look at the map, **Then** the quietest stores are visually emphasized (e.g., green, larger icon)
3. **Given** I tap a store marker, **When** the popup opens, **Then** I see how this store compares to others nearby (e.g., "Rustiger dan 3 van 5 winkels in de buurt")
4. **Given** I am comparing stores, **When** stores have equal crowd levels, **Then** they are ranked by distance from my location

---

### User Story 4 - Indicate Store Crowdedness (Priority: P2)

As a user, I want to report whether a store is busy or quiet so others benefit from current information.

**Why this priority**: This validates the Wizard of Oz approach and tests user engagement with crowd reporting. Also builds the mock data foundation.

**Independent Test**: Can be tested by reporting crowd level and verifying the UI updates without requiring other stories to be complete.

**UX Flow**:

1. User taps on store marker → popup opens showing store name and current crowd level
2. Popup displays three action buttons: "Rustig" (green), "Matig" (yellow), "Druk" (red)
3. User taps one of the buttons → confirmation modal appears
4. Modal shows: "[Selected level], wil je de melding verzenden?" with "OK" and "Annuleren" buttons
5. User taps "OK" → report is submitted, modal closes, marker updates with new crowd level
6. User taps "Annuleren" → modal closes, no report is sent

**Acceptance Scenarios**:

1. **Given** I am viewing a store marker, **When** I tap it, **Then** I see a popup with the store name and three clearly labeled buttons: "Rustig" (green), "Matig" (yellow), and "Druk" (red)
2. **Given** the popup is open, **When** I tap "Rustig", **Then** a confirmation modal appears asking "Rustig, wil je de melding verzenden?" with "OK" and "Annuleren" buttons
3. **Given** the confirmation modal is open with GPS enabled and I'm within 100m, **When** I tap "OK", **Then** I see "Bedankt! Je melding helpt anderen." and the report is saved with weight 1.0 for long-term pattern analysis
4. **Given** the confirmation modal is open without GPS or using address-based location, **When** I tap "OK", **Then** I see "Bedankt! Je melding telt minder zwaar maar helpt wel." and the report is saved with weight 0.7 for next 24 hours only
5. **Given** the confirmation modal is open with GPS enabled but I'm more than 100m away, **When** I tap "OK", **Then** I see "Je bent te ver weg. Je melding telt minder zwaar." and report is saved with weight 0.7
6. **Given** the confirmation modal is open, **When** I tap "Annuleren", **Then** the modal closes and no report is sent
7. **Given** I have already reported for any store in the last 30 minutes, **When** I tap a store marker, **Then** the crowd level buttons are disabled with message "Je hebt recent al een melding gedaan"
8. **Given** I successfully submit a report, **When** the submission completes, **Then** the map refreshes and the store marker updates to reflect the new crowd level immediately

### Edge Cases

- What happens when user denies location permission? System shows address input field with clear Dutch instructions "Voer je adres in om winkels in de buurt te zien".
- What if entered address cannot be geocoded? Show error "Adres niet gevonden. Probeer een ander adres of postcode."
- What if user saves address but moves to different location? Provide "Gebruik huidige locatie" button when GPS is available.
- How does system handle no stores within 5km? Display message "Geen winkels in de buurt gevonden" with suggestion to zoom out.
- What if geolocation is inaccurate (>100m)? Accept location but treat reports as weight 0.7 (non-GPS equivalent).
- How to aggregate conflicting crowd reports? Use weighted average: (sum of level × weight) / (sum of weights) within 30-minute window.
- What if localStorage is full? Clear non-GPS reports first (24hr old), then GPS reports older than 7 days, then oldest hourly aggregates.
- How does historical pattern detection work with insufficient data? Require minimum 5 reports per time slot before showing pattern.
- What if user submits many low-weight reports to manipulate data? Limit to 1 report per user per 30 minutes across all stores.
- How to handle stores that are temporarily closed? Show with distinct "Gesloten" marker, historical patterns still visible but marked as "Normaal gesproken...".
- What if system clock is wrong affecting pattern matching? Use server-simulation time from Next.js API for consistency.
- How does map perform on slow connections? Show loading state, use lightweight tile provider, cache tiles in service worker, show cached historical patterns immediately.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST request user location permission on first app load using browser Geolocation API
- **FR-002**: System MUST provide address input field with geocoding (using Nominatim OpenStreetMap API) when GPS is unavailable or denied
- **FR-003**: System MUST allow users to optionally save their address (street + city only, not coordinates) to localStorage for convenience
- **FR-004**: System MUST display an interactive map using React Leaflet with OpenStreetMap tiles
- **FR-005**: System MUST show store markers within 5km of user location or entered address by default
- **FR-006**: System MUST visually differentiate crowd levels using color coding (red=druk, yellow=matig, green=rustig)
- **FR-007**: System MUST distinguish real-time data from historical patterns using visual indicators (solid vs dashed borders, clock icon)
- **FR-008**: System MUST display all UI text in Dutch as per constitution language rules
- **FR-009**: System MUST persist crowd reports with ONLY: storeId, crowdLevel, timestamp, reportWeight, dayOfWeek, hourOfDay (no PII)
- **FR-010**: System MUST assign weight 1.0 to GPS-verified reports (<100m) and weight 0.7 to non-GPS reports
- **FR-011**: System MUST retain GPS-verified reports (weight 1.0) for 7 days before aggregating into hourly patterns
- **FR-012**: System MUST retain non-GPS reports (weight 0.7) for maximum 24 hours only
- **FR-013**: System MUST calculate historical patterns from minimum 5 weighted reports per time slot (day-of-week + hour)
- **FR-014**: System MUST combine recent reports (last 30 min, weighted average) with historical patterns when displaying crowd levels
- **FR-015**: System MUST prevent users from submitting more than 1 report per 30 minutes across all stores
- **FR-016**: System MUST work offline for viewing previously loaded data and cached historical patterns (PWA requirement)
- **FR-017**: System MUST provide accessible map controls meeting WCAG 2.1 AA standards (keyboard navigation, screen reader support)
- **FR-018**: System MUST simulate API latency (200-500ms) for realistic backend behavior even with mock data
- **FR-019**: System MUST clear GPS coordinates from memory immediately after calculating nearby stores (privacy requirement)
- **FR-020**: System MUST show store name, address, current crowd level, data source (real-time/historical), and last update time in marker popup

### Key Entities

- **Store**: Represents a physical retail location with properties: id, name, address, coordinates (lat/lng), type (supermarkt, apotheek, etc.), opening hours
- **CrowdReport**: Represents a user-submitted crowd indication with properties: storeId, crowdLevel (druk/rustig/matig), timestamp, reportWeight (0.7 or 1.0), dayOfWeek (0-6), hourOfDay (0-23). NO PII stored.
- **HistoricalPattern**: Aggregated crowd data with properties: storeId, dayOfWeek, hourOfDay, averageCrowdLevel (weighted), reportCount, lastUpdated
- **UserLocation**: Runtime-only entity with properties: lat, lng, accuracy, timestamp, source (gps/geocoded) - NEVER persisted per privacy constraints
- **SavedAddress**: Optional user preference with properties: street, city, postalCode (coordinates derived at runtime, not stored)
- **MapState**: Client-side state with properties: center coordinates, zoom level, selected store, active filters - persisted in sessionStorage only

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can identify the crowd level of a store within 3 seconds of opening the app (target: <3s from app load to visible crowd indicators)
- **SC-002**: Users can successfully submit a crowd report within 5 seconds when standing near a store (target: <5s from button tap to confirmation)
- **SC-003**: Users without GPS can find stores by entering address within 10 seconds (target: address input to map display)
- **SC-004**: 90% of users correctly interpret crowd level colors without reading text labels (usability test: color coding validation)
- **SC-005**: 85% of users can distinguish real-time data from historical patterns (usability test: visual indicator effectiveness)
- **SC-006**: Map loads and displays markers for at least 10 nearby stores on 3G connection within 5 seconds
- **SC-007**: Zero GPS coordinates or PII persisted to localStorage (privacy audit: manual inspection, only allowed fields: storeId, crowdLevel, timestamp, weight, dayOfWeek, hourOfDay)
- **SC-008**: Historical patterns emerge correctly after minimum 5 weighted reports per time slot (data validation test)
- **SC-009**: Weighted reporting system correctly assigns 1.0 to GPS-verified and 0.7 to non-GPS reports (unit test validation)
- **SC-010**: Users can distinguish between busy and quiet stores when presented with 5 options simultaneously (choice architecture validation)
- **SC-011**: PWA installs successfully on iOS and Android devices and works offline with cached historical patterns
- **SC-012**: All interactive elements meet WCAG 2.1 AA contrast ratios and keyboard navigation standards (automated accessibility audit)
