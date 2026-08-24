# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ePAD JS is a React-based DICOM medical imaging viewer and annotation platform. It enables radiologists to view medical images from PACS systems, create/manage annotations (AIMs), and generate clinical reports.

## Commands

```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests (Jest + jsdom)
```

No lint script is defined. Tests use `react-app-rewired test --env=jsdom`.

To run a single test file:
```bash
npm test -- --testPathPattern=<filename>
```

## Architecture

### Tech Stack
- **React 16** (class components predominate, some hooks)
- **Redux + redux-thunk** for state management
- **React Router v4** for routing
- **Cornerstone.js** for DICOM image rendering
- **Keycloak** (v4.0.0-beta.2) for OAuth/OIDC authentication
- **Axios** for HTTP, with auth interceptors in `src/services/httpService.js`

### Routing (`src/App.js`)
All routes except `/login`/`/logout` are wrapped in `ProtectedRoute`:
- `/display` — DICOM viewer (main imaging workflow)
- `/list/:pid` — Patient/study search (SearchView)
- `/flex/:pid` — Flexible layout view
- `/anotate` — Annotation creation
- `/progress` — Upload progress tracking
- `/management` — Admin panel
- `/annotationSearch` — Cross-project annotation search

### Redux Store (`src/reducers.js`)
Three combined reducers:
- **`annotationsListReducer`** — Core viewer state: `openSeries[]`, `aimsList{}`, selected project/patients/studies, `projectMap{}`, AIM templates, UI toggles (`showAnnotations`, `showLabels`, etc.)
- **`searchViewReducer`** — Study list state, user-selected studies, Cornerstone instances
- **`managementReducer`** — Admin/management UI state

### Service Layer (`src/services/`)
19 service modules wrapping the backend API. Key ones:
- `httpService.js` — Axios instance with auth header injection; reads `apiUrl`/`wadoUrl` from `sessionStorage`
- `annotationServices.js` — AIM CRUD
- `seriesServices.js` / `studyServices.js` — DICOM data fetching
- `authService.js` — Keycloak integration
- `projectServices.js` — Project management

### Key Component Modules (`src/components/`)
- **`display/`** — DICOM viewer; `displayView.jsx` is the largest file (~116KB). Contains Cornerstone tool integration (Arrow, Circle, Line, Bidirectional, Freehand, Probe, segmentation)
- **`searchView/`** — Patient/study search with reporting (ADLA, RECIST, Waterfall), filters, and a drag-drop study grid
- **`annotationsList/`** — Annotation management with Redux reducer/actions; includes `annotationDock/`
- **`sideBar/`** — Left navigation: patient/project tree, worklist integration
- **`ToolMenu/`** — Drawing/measurement tool palette including SmartBrush for segmentation
- **`management/`** — Project/user/permission administration
- **`aimEditor/`** — AIM annotation editor with tag editing (`tagEditor/`)
- **`MediaExport/`** — GIF and PowerPoint export
- **`common/`** — Shared UI: `protectedRoute.jsx`, modals, `SelectModalMenu.jsx`

### Session & Persistence
- **`sessionStorage`**: API credentials (`apiUrl`, `wadoUrl`, `username`, tokens), operating mode (`lite` vs standard)
- **`localStorage`**: Tree data, PHI visibility preferences, filters

### Build Configuration
- `react-app-rewired` overrides CRA config via `config-overrides.js` — adds Node.js polyfills (`NodePolyfillPlugin`) for crypto/Buffer, TypeScript resolution, and `fs: false` fallback
- `jsconfig.json` sets `baseUrl: "src"` so imports can be relative to `src/` (e.g., `import X from 'components/...'`)
- Babel: `@babel/preset-env`, `@babel/react`, Emotion plugin

### Deployment
Docker multi-stage build: Node 11 Alpine for build → Nginx for serving. Nginx proxies:
- `/api` → `epad_lite:8080` (backend)
- `/pacs` → `epad_dicomweb:8090` (DICOM server)
- `/keycloak` → Keycloak auth server
- WADO images cached for 60 minutes
