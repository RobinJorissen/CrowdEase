# CrowdEase 🛒

**Vind rustige winkels in de buurt** - Een Progressive Web App voor het real-time monitoren van winkeldrukte in Gent.

[![Tests](https://img.shields.io/badge/tests-89%20passing-brightgreen)](./package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](./tsconfig.json)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](./package.json)

## 📋 Overzicht

CrowdEase helpt gebruikers om rustige winkels te vinden door:

- **Real-time drukte-informatie** te tonen op een interactieve kaart
- **Gebruikersrapportages** te verzamelen met gewogen betrouwbaarheid (GPS: 100%, handmatig: 70%)
- **Historische patronen** te analyseren voor betere voorspellingen
- **Privacy-first** benadering: geen persoonlijke data, alles client-side

### ✨ Kernfunctionaliteit

- 🗺️ **Kaart & Lijst Weergave**: Schakel tussen interactieve kaart en gesorteerde lijst
- 📍 Automatische locatiebepaling via GPS of adresinvoer
- 🎨 Visuele drukte-indicatoren (groen/geel/rood markers)
- ⭐ **Slimme Aanbevelingen**: Rustige winkels krijgen voorrang (badge + star icon)
- 📊 Gewogen rapportage systeem voor nauwkeurige data
- 🎁 **Check-in Systeem**: Verdien 10 punten per check-in (GPS-validatie binnen 100m)
- 💎 **Beloningssysteem**: Wissel punten in voor bonussen en kortingen
- 📱 PWA-ondersteuning met offline fallback
- ♿ WCAG 2.1 AA toegankelijk

## 🚀 Quick Start

### Vereisten

- Node.js 20+
- npm 10+

### Installatie

```bash
# Clone repository
git clone git@github.com:RobinJorissen/CrowdEase.git
cd CrowdEase

# Installeer dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

### Testen

```bash
# Unit tests (Vitest)
npm test

# E2E tests (Playwright)
npm run test:e2e

# Alle tests
npm run test:all
```

## 🏗️ Project Structuur

```
CrowdEase/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (map)/             # Map route group
│   │   │   └── page.tsx       # Hoofdpagina
│   │   ├── api/               # API routes
│   │   │   ├── stores/        # GET /api/stores
│   │   │   ├── crowd-reports/ # POST /api/crowd-reports
│   │   │   └── geocode/       # GET /api/geocode
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── map/               # Map components
│   │   ├── view/              # View switcher & list components
│   │   ├── points/            # Points & rewards UI
│   │   ├── checkin/           # Check-in button
│   │   ├── rewards/           # Rewards screen & cards
│   │   ├── crowd/             # Crowd reporting
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Business logic
│   │   ├── stores/            # Store services
│   │   ├── storage/           # localStorage (points, rewards)
│   │   ├── rewards/           # Rewards catalog
│   │   ├── crowd/             # Crowd calculation
│   │   ├── location/          # Geolocation & distance
│   │   └── utils/             # Utilities (recommendations, distance)
│   └── types/                 # TypeScript types
├── tests/
│   ├── e2e/                   # Playwright tests
│   └── setup.ts               # Test configuration
├── public/
│   ├── icons/                 # PWA icons
│   ├── manifest.json          # PWA manifest
│   └── offline.html           # Offline fallback
└── package.json
```

## 🔌 API Documentatie

### GET /api/stores

Haal winkels op binnen een straal van een locatie.

**Query Parameters:**

- `lat` (number, required): Latitude
- `lng` (number, required): Longitude
- `radius` (number, optional): Straal in km (default: 5)

**Response:**

```json
{
  "stores": [
    {
      "id": "store_001",
      "name": "Colruyt Gent Centrum",
      "type": "supermarkt",
      "coordinates": { "lat": 51.0543, "lng": 3.7174 },
      "distance": 0.5,
      "crowdData": {
        "level": "rustig",
        "message": "Rustig - 5 minuten geleden"
      }
    }
  ]
}
```

### POST /api/crowd-reports

Dien een drukte-rapportage in.

**Request Body:**

```json
{
  "storeId": "store_001",
  "level": "rustig",
  "location": { "lat": 51.0543, "lng": 3.7174 }
}
```

### GET /api/geocode

Converteer een adres naar coördinaten (België).

**Query Parameters:**

- `address` (string, required)

### POST /api/check-in

Check in bij een winkel om punten te verdienen.

**Request Body:**

```json
{
  "storeId": "store_001",
  "location": { "lat": 51.0543, "lng": 3.7174, "accuracy": 25 }
}
```

**Response (Success):**

```json
{
  "success": true,
  "pointsEarned": 10,
  "message": "Check-in succesvol! +10 punten",
  "checkIn": { "id": "...", "storeId": "...", "timestamp": 1704634800000 }
}
```

**Response (Out of Range):**

```json
{
  "success": false,
  "error": "Je bent te ver van de winkel (150m)...",
  "errorCode": "OUT_OF_RANGE",
  "distance": 150
}
```

### GET /api/rewards

Haal beschikbare beloningen op.

**Response:**

```json
{
  "rewards": [
    {
      "id": "reward-001",
      "title": "5% korting op volgende aankoop",
      "cost": 50,
      "category": "discount"
    }
  ]
}
```

### POST /api/rewards/redeem

Wissel een beloning in met punten.

**Request Body:**

```json
{
  "rewardId": "reward-001"
}
```

## 🧪 Testing

### Unit Tests (89 tests)

- Vitest met React Testing Library
- Locatie: `src/**/__tests__/`
- Coverage:
  - Storage services (points, rewards)
  - API routes (stores, check-in, rewards)
  - Distance & recommendation calculations
  - Crowd logic & reporting
  - View components (toggle button, list items)

### E2E Tests (13 tests)

- Playwright voor gebruikersflows
- Locatie: `tests/e2e/`
- Tests:
  - Map interaction & filtering
  - Check-in flow & GPS validation
  - Rewards redemption
  - View switcher (map ↔ list)
  - Store recommendations

### Run Tests

```bash
# Unit tests
npm test

# E2E tests (requires running dev server)
npm run test:e2e

# Specific test file
npm test -- recommendations.test.ts
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS 3.4
- **Maps**: React Leaflet 5.0
- **UI**: shadcn/ui components
- **Testing**: Vitest + Playwright
- **PWA**: next-pwa

## ♿ Toegankelijkheid

- WCAG 2.1 AA compliant
- Keyboard navigatie
- Screen reader optimalisatie
- `lang="nl"` voor Nederlandse content

## 🔒 Privacy

- Geen PII opgeslagen
- Geen GPS-coördinaten persistent
- Client-side only (localStorage)
- GDPR-compliant

## 📱 PWA

Installeerbaar op iOS 15+, Android 10+, Desktop.
Offline fallback beschikbaar.

## 🚧 Bekende Beperkingen

1. Mock data (fictieve winkels)
2. Geen backend database
3. Nominatim API rate limits
4. Openingstijden niet geïmplementeerd

## 🗺️ Roadmap

- [ ] Database integratie
- [ ] Openingstijden
- [ ] Push notificaties
- [ ] Multi-city support

## 📄 Licentie

MIT

---

**Gemaakt met ❤️ voor een rustiger winkelervaring** 🛒✨
