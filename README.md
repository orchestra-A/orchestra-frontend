# Orchestra AI - Frontend Dashboard

Welcome to the frontend interface for **Orchestra AI**, an automated software design blueprint and task-tracking ecosystem.

This repository specifically houses the **UI Shell and Dashboard Architecture**, meticulously built with React, Vite, and Tailwind CSS v4.

## Project Overview (Week 1 Phase)

This repository serves as the foundational frontend interface for the project, combining landing page components with a comprehensive dashboard shell.

### What is included here:
- **Landing Page Integration**: A beautiful, scoped public landing page serving as the entry point for unauthenticated users, complete with custom cursors, animations, and feature showcases.
- **Authentication Flow**: Login and Signup pages integrated via an `AuthContext` to redirect unauthenticated users away from the dashboard and authenticated users into it.
- **Scalable Layout Skeleton**: A responsive CSS Grid `AppShell` featuring a collapsible mobile sidebar and top header.
- **Design Tokens**: Centralized Tailwind v4 `@theme` configuration enforcing our brand colors, dark mode, and spacing.
- **Reusable UI Components**: Core building blocks like `Card`, `PageHeader`, and `Badge` used to construct uniform pages rapidly.
- **Routing**: Client-side navigation powered by React Router with protected and public routes.
- **Interactive Graph Engine**: A `@xyflow/react` powered node graph (`WorkflowCanvas`) integrated directly into the Dashboard to visualize developer workflow and task dependencies.

### 🌟 Recent Updates

**1. Landing Page Integration & Styling:**
- **Landing Page Port**: Converted `orchestra-landing.html` into a fully functioning React component (`LandingPage.jsx`).
- **Scoped Styles**: Integrated the landing page's custom CSS using a scoped `.orch-landing` wrapper to prevent styles from leaking into the main dashboard UI.
- **Routing & Auth Flow**:
  - Configured `/landing` as the default public entry point for unauthenticated users.
  - Linked the "Get Started" and "Sign in" buttons directly to the app's native `/signup` and `/login` routes respectively.
  - Updated `ProtectedRoute` to redirect logged-out users to `/landing` rather than `/login`.
- **Integrations Marquee Re-design**: 
  - Reduced the scrolling integrations to strictly show Discord, GitHub, Git, and Figma with updated exact SVG icons.
  - Redesigned the marquee layout to scroll seamlessly within a short, centered restricted-width ribbon with smooth edge-fading gradients, rather than spanning the full screen.

**2. Profile Page Overhaul:**
- **Interactive Tab Navigation**: Implemented conditional rendering for seamless switching between Basic Info, Profile Details, Platform, Visibility, and Accounts tabs.
- **Dynamic Content & Layouts**: Added state-driven toggle switches, functional inputs, and a uniform layout for external platform links (Figma, Discord, Github).
- **Backend Wiring**: Wrote backend logic in `AuthContext` to connect the "Change Password" and "Delete Account" actions, enabling real persistent local updates and session management.

**3. Settings Page Refactor:**
- **Pixel-Perfect UI Match**: Rebuilt the Settings interface to accurately match the required design specifications, incorporating a clean split-view layout.
- **Functional Configuration**: Added interactive sidebar navigation for Account, Notifications, Security, and Appearance settings tabs with populated layouts.
- **Profile Context Integration**: Hooked up the Account tab's "Save Changes" button with a new `updateProfile` context method to actively update the user's display name across the app.

---

## Current Status (Week 2 and 3 Tasks)

- **Member 5 (Frontend)**: Binds the visual graph rendering canvas directly to the backend database endpoints to replace static mock files.
- **Member 6 (Frontend)**: Implements the "Connect Workspaces" view UI, integrating the authentication screens for a team's tools.
  - *They build the visible screens where users can click around to manage their team profiles. They also hook up the reactflowlayout to the backend, so the AI's generated task steps suddenly render as a gorgeous, interactive roadmap on the screen.*

---

## Getting Started

Follow these steps to run the dashboard locally on your machine:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:5173` (or the port specified in your terminal).

*Note: The application automatically respects your system's Dark/Light mode preference!*

---

## Folder Structure

To help team members navigate the codebase:

```text
src/
├── components/
│   ├── layout/        # Core shell elements (AppShell, Header, Sidebar)
│   ├── ui/            # Reusable primitive elements (Card, Badge, PageHeader)
│   └── WorkflowCanvas.jsx # Interactive React Flow graph component
├── pages/             # Route-level views (LandingPage, Dashboard, Projects, Team, Settings)
├── styles/            # Global CSS containing Tailwind v4 design tokens
├── App.jsx            # Routing configuration
└── main.jsx           # React mounting point
```
