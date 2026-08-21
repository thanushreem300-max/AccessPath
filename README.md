# AccessPath

**Accessible route guidance for travelers with disabilities**

AccessPath is our proposed software solution for **Omnikon National Hackathon 2026** under problem statement **Omni_Tourism_7 – Accessible Navigation for Travelers with Disabilities**.

## Problem

Travelers with disabilities often cannot find reliable and updated accessibility information at tourist destinations. Regular navigation applications usually recommend the shortest route without considering stairs, steep slopes, narrow paths, uneven surfaces, broken lifts, blocked ramps, or temporary barriers.

## Proposed Solution

AccessPath recommends a suitable route based on the traveler’s selected accessibility profile and recently verified pathway information.

The application is designed for:

* Wheelchair users
* Travelers with low vision
* Travelers with hearing impairment
* Elderly travelers
* People with temporary injuries

## Key Features

* Profile-based accessible route recommendation
* Different routes for different accessibility needs
* Explainable route acceptance and rejection
* Last-verified timestamps and confidence indicators
* Crowd-sourced barrier reporting
* Automatic rerouting when a ramp, lift, or path becomes unavailable
* Voice, high-contrast visual, and vibration guidance
* Camera-based obstacle warning as an advisory Phase-2 feature

## Example

A 250-metre route containing stairs may be the shortest route, but it is rejected in Wheelchair Mode. AccessPath can instead recommend a 310-metre route containing a ramp and wide, flat pathways, while clearly explaining the reason for its decision.

## Proposed Technology Stack

* **Frontend:** React.js Progressive Web Application
* **Maps:** Leaflet with OpenStreetMap
* **Backend:** FastAPI using Python
* **Database:** Supabase PostgreSQL with PostGIS
* **Routing:** Custom Dijkstra or A* with accessibility constraints
* **Deployment:** Vercel and Render
* **Advisory Camera Feature:** Lightweight object detection

## Prototype Scope

The initial prototype will focus on one tourist destination or campus. Accessibility information for the pilot location will be manually surveyed and verified. The first development priority is accessible routing, live barrier reporting, and automatic rerouting. The camera warning feature will be implemented only after the core workflow is functional.

## Planned Demonstration

1. Select Wheelchair Mode.
2. Choose a destination.
3. Compare available routes.
4. Reject a shorter route containing stairs.
5. Recommend a slightly longer accessible route.
6. Report a blocked ramp.
7. Automatically calculate an alternative route.
8. Update voice and visual guidance.

## System Limitation

Route guidance depends on available and recently verified accessibility data. Camera-based obstacle alerts are advisory and do not guarantee safety.

## Team INNOVISION

* Thanushree M
* Akepati Spurthi

## Current Status

This repository contains the completed Phase 2 working prototype, featuring an explainable custom routing engine (FastAPI) and an interactive accessibility map dashboard (React/Vite/Leaflet).

## Phase 2 Development

### Project Structure
```
AccessPath/
├── frontend/             # React + TypeScript + Vite Frontend UI
│   ├── src/
│   │   ├── pages/        # Welcome, Profiles, Destination, Map Planner
│   │   ├── App.tsx       # Main layout & route mappings
│   │   ├── App.css       # Core design system & high-contrast styles
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/              # FastAPI Backend API Server
│   ├── app/
│   │   ├── main.py       # API router and endpoints
│   │   ├── schemas.py    # Pydantic validation structures
│   │   ├── graph.py      # Cubbon Park graph & in-memory store
│   │   └── router.py     # Dijkstra routing & score evaluator
│   ├── tests/
│   │   └── test_backend.py # Pytest automated test coverage
│   └── README.md
├── docs/                 # Hackathon Documentation
│   ├── architecture.md
│   ├── demo-script.md
│   └── sample-data-limitations.md
├── README.md             # Updated root README
├── LICENSE               # MIT License
└── .gitignore            # Git ignored files
```

### Installation and Setup

#### Backend setup:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic pytest httpx
   ```
3. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will start on: [http://localhost:8000](http://localhost:8000)*

#### Frontend setup:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on: [http://localhost:5173](http://localhost:5173)*

---

### Local URLs & API Endpoints

- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Endpoints:**
  - `GET /api/health` — API health check
  - `GET /api/profiles` — List accessibility profiles
  - `GET /api/destinations` — List pilot destinations
  - `GET /api/destinations/{id}` — Accessibility attributes of pilot site
  - `POST /api/routes/compare` — Compare path alternatives against selected profile
  - `POST /api/barriers` — Submit dynamic barrier reports
  - `GET /api/barriers` — Fetch list of active barriers
  - `DELETE /api/barriers/demo-reset` — Restore defaults (removes barriers)
  - `GET /api/guidance/{route_id}` — Get voice guidance steps for selected route

---

### Implemented Features

1. **Accessibility Profile Routing:** Tailored Dijkstra calculations considering width, slopes, steps, and lighting for Wheelchair, Low Vision, Hearing Support, Elderly, and Injured travelers.
2. **Explainable Routing Decisions:** Plain-English explanations written in the Route matrix explaining why segments were recommended or rejected.
3. **Dynamic Barrier Rerouting:** Crowdsourced barrier reporting (like blocked ramps) forces automatic real-time route calculation and updates markers on the Leaflet map.
4. **Step-by-Step Voice Guidance:** Visual prompt alerts and HTML5 Web Speech API spoken guidance (with mute options).
5. **Universal Design UI:** Accessible HTML elements, focus rings, High-Contrast stylesheet toggle, and Large-Text font scaling.

---

### Prototype Limitations & Sample-Data Disclaimer
Route coordinates, elevations, and pathway ratings are **simulated sample data** for the Cubbon Park pilot site. Field verification is pending. This software must not be used for real-world travel safety navigation.

Confidence scores (High, Medium, Low) are calculated depending on survey age. If information freshness is older than 7 days, overall route confidence degrades, cautioning the user.

---

### Future Integration Plans

1. **Supabase PostgreSQL & PostGIS:** Transition from in-memory routing to native spatial database queries. Routes will be stored as PostGIS `LineString` elements, enabling fast geo-fencing and intersection lookups.
2. **Planned Deployments:** Vercel for frontend hosting; Render for backend container deployment.
3. **Advisory Camera Feature:** In Phase 3, travelers will be able to verify path obstructions using local device cameras. An object-detection model will flags temporary blockages. This feature will be strictly advisory and require traveler confirmation before changing paths.

