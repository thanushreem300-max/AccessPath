# AccessPath Frontend Prototype

This is the React + TypeScript frontend for the **AccessPath** accessibility routing system. It interfaces with the FastAPI backend for graph calculations, explainable decisions, and barrier reporting.

## Key Features

1. **Accessibility Profile Selection:** Special filters for Wheelchair, Low Vision, Hearing Support, Elderly, and Temporary Injury.
2. **Interactive Map:** Powered by Leaflet.js directly using OpenStreetMap tile layers. Draws dynamic polylines based on route safety status (teal for Recommended, orange/dashed for Caution, and red for Rejected).
3. **Route Comparison Panel:** Matrix comparing distance, estimated rolling time, stairs counts, slopes, lighting, and natural-language explanations.
4. **Dynamic Barrier Submission:** Submitting an obstruction segment posts a dynamic record to the backend and immediately triggers visual, speech, and coordinate recalculation on the map.
5. **Speech Synthesis Guidance:** Integrated voice navigation using the HTML5 Web Speech API (with mute toggling and captions).
6. **A11y Enhancements:** Skip-to-content anchors, focus indicators, High-Contrast stylesheet mode, Large-Text font scaling, and semantic HTML tags.

## Installation & Setup

1. Make sure you have [Node.js](https://nodejs.org) installed.
2. Navigate to this directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

## Development Commands

- `npm run dev`: Launch the Vite dev server with proxy settings forwarding `/api` to the backend.
- `npm run build`: Compile TypeScript and run the Vite bundle compiler to verify build stability.
