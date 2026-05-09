# NagrikAI — Project Progress Tracker

> A civic intelligence platform that exposes ghost infrastructure and tracks government project progress across India.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Integrations](#api-integrations)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Ghost Detection Logic](#ghost-detection-logic)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The **Project Progress Tracker** is a core module of NagrikAI that pulls real government infrastructure data — roads, schools, health centres, Anganwadis, bridges — and cross-references claimed completion against on-ground evidence to flag **Ghost Projects**.

---

## Features

- 🔍 Search projects by name, district, or scheme
- 📊 Visual progress bar per project (% completion detected)
- 👻 Ghost Suspected / Delayed / On Track status badges
- 🗺️ Map view with project pins via Google Maps
- 📡 Live scheme and project data from data.gov.in
- 🗄️ Project records and user data stored in Supabase
- 📄 One-click PDF report generation per project

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TailwindCSS |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Maps | Google Maps API |
| Government Data | data.gov.in Open API |
| Build Tool | Vite |

---

## API Integrations

### 1. Supabase

Used for database storage, authentication, and real-time updates.

**Docs:** https://supabase.com/docs

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

// Fetch all projects
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false })

// Filter by district
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('district', 'Patna')

// Fetch single project
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .single()
```

**Tables used:**

| Table | Purpose |
|---|---|
| `projects` | All infrastructure project records |
| `ghost_reports` | Ghost detection flags and scores |
| `users` | Auth + citizen profiles |
| `schemes` | Government scheme metadata |

**Supabase SQL setup — run in your SQL editor:**

```sql
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  district text,
  state text,
  scheme text,
  amount_claimed numeric,
  claimed_date date,
  progress_pct integer default 0,
  status text default 'On Track',
  lat numeric,
  lng numeric,
  image_url text,
  created_at timestamp default now()
);

create table ghost_reports (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id),
  ghost_score integer,
  flags text[],
  reported_by uuid references auth.users(id),
  created_at timestamp default now()
);
```

---

### 2. Google Maps API

Used for rendering project locations on a map and geocoding district/village names to coordinates.

**Console:** https://console.cloud.google.com

**APIs to enable:**
- Maps JavaScript API
- Geocoding API

```javascript
// Initialize map with your Map ID
const map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: 20.5937, lng: 78.9629 },
  zoom: 5,
  mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID
})

// Add a project pin
const marker = new google.maps.marker.AdvancedMarkerElement({
  map,
  position: { lat: 25.5941, lng: 85.1376 },
  title: 'PMGSY Road Phulwari-Khairi'
})

// Geocode district name to coordinates
const geocoder = new google.maps.Geocoder()
geocoder.geocode(
  { address: 'Phulwari Khairi, Patna, Bihar, India' },
  (results, status) => {
    if (status === 'OK') {
      const location = results[0].geometry.location
      console.log(location.lat(), location.lng())
    }
  }
)
```

**Load Maps script in index.html:**
```html
<script
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=marker"
  async defer
></script>
```

---

### 3. data.gov.in API

India's Open Government Data platform — free live infrastructure project data.

**Register for API key:** https://data.gov.in/user/register

```javascript
// src/lib/dataGov.js

const BASE_URL = 'https://api.data.gov.in/resource'

export async function fetchGovtProjects({ state, district, limit = 20, offset = 0 }) {
  const params = new URLSearchParams({
    'api-key': import.meta.env.VITE_GOVT_API_KEY,
    format: 'json',
    limit,
    offset,
    ...(state    && { 'filters[state_name]':    state }),
    ...(district && { 'filters[district_name]': district }),
  })

  const res = await fetch(
    `${BASE_URL}/${import.meta.env.VITE_GOVT_RESOURCE_ID}?${params}`
  )

  if (!res.ok) throw new Error('data.gov.in request failed')

  const json = await res.json()
  return json.records
}
```

**Useful Resource IDs:**

| Scheme | Resource ID |
|---|---|
| PMGSY Road Projects | `9ef84268-d588-465a-a308-a864a43d0070` |
| Anganwadi Centres (ICDS) | `6176ee09-3d56-4a3e-8b97-2a24f7c58a34` |
| Primary Schools (UDISE) | `7d714010-549a-4d5d-a5e4-0e7c7b71b8c9` |
| Rural Health Centres | `4a5c7e00-5678-4c3a-8f28-c1e2f3d4e5f6` |

> Set your chosen resource ID as `VITE_GOVT_RESOURCE_ID` in `.env`

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (free tier works)
- Google Maps API key (Maps JS + Geocoding enabled)
- data.gov.in API key (free registration)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/nagrik-ai.git
cd nagrik-ai

# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env

# Start dev server
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Supabase — Vite client-side (safe to expose)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_MAPS_ENABLED=true
VITE_GOOGLE_MAPS_MAP_ID=your_map_id

# App
FRONTEND_URL=https://your-app-url.com
ENVIRONMENT=production

# data.gov.in
GOVT_YOUR_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
GOVT_API_KEY=your_data_gov_api_key
```

> ⚠️ Never commit `.env` — add it to `.gitignore`
> ✅ Only `VITE_` prefixed variables are exposed to the browser in Vite

---

## Project Structure

```
nagrik-ai/
├── src/
│   ├── components/
│   │   ├── ProjectCard.jsx       # Card with progress bar + status badge
│   │   ├── GhostBadge.jsx        # "Ghost Suspected" / "Delayed" badge
│   │   ├── ProjectMap.jsx        # Google Maps with project pins
│   │   └── SearchBar.jsx         # Filter by name, district, scheme
│   ├── pages/
│   │   ├── Tracker.jsx           # Main Project Progress Tracker page
│   │   └── ProjectDetail.jsx     # Single project deep-dive
│   ├── lib/
│   │   ├── supabase.js           # Supabase client init
│   │   ├── dataGov.js            # data.gov.in API calls
│   │   └── maps.js               # Google Maps helpers
│   ├── hooks/
│   │   ├── useProjects.js        # Fetches projects from Supabase
│   │   └── useGhostScore.js      # Computes ghost probability score
│   └── main.jsx
├── .env                          # Your keys — never commit this
├── .env.example                  # Template for teammates
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Ghost Detection Logic

A project is flagged **Ghost Suspected** when its score reaches 50+:

```javascript
// src/hooks/useGhostScore.js

export function computeGhostScore(project) {
  let score = 0
  const flags = []

  const claimedDate = new Date(project.claimed_date)
  const now = new Date()
  const monthsPast = (now - claimedDate) / (1000 * 60 * 60 * 24 * 30)

  // Low progress despite claiming completion
  if (project.progress_pct < 30 && claimedDate < now) {
    score += 40
    flags.push('Claimed complete but less than 30% progress detected')
  }

  // Old claim with near-zero progress
  if (monthsPast > 12 && project.progress_pct < 20) {
    score += 30
    flags.push('Over 12 months past claim date with minimal progress')
  }

  // Almost no physical progress at all
  if (project.progress_pct < 10) {
    score += 20
    flags.push('Less than 10% physical progress detected')
  }

  const status =
    score >= 50 ? 'Ghost Suspected' :
    score >= 20 ? 'Delayed' :
    'On Track'

  return { score, status, flags }
}
```

**Status thresholds:**

| Score | Badge | Colour |
|---|---|---|
| >= 50 | Ghost Suspected | Red |
| 20-49 | Delayed | Orange |
| < 20 | On Track | Green |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: your change"`
4. Push and open a Pull Request

---

## Data Sources

- [data.gov.in](https://data.gov.in) — Open Government Data Platform, India
- [Supabase](https://supabase.com) — Database, Auth, and Realtime
- [Google Maps Platform](https://developers.google.com/maps)

---

> Built for the people, by the people.
> **NagrikAI** — Governance, Reimagined.
