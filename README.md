# Orchestra AI - Frontend Dashboard

Welcome to the frontend interface for **Orchestra AI**, an automated software design blueprint and task-tracking ecosystem.

This repository specifically houses the **UI Shell and Dashboard Architecture**, meticulously built with React, Vite, and Tailwind CSS v4.

## Project Overview (Week 1 Phase)

This repository serves as the foundational frontend interface for the project, combining landing page components with a comprehensive dashboard shell.

### What is included here:
- **Landing Page Integration**: A beautiful, scoped public landing page serving as the entry point for unauthenticated users, complete with custom cursors, animations, and feature showcases.
- **Authentication Flow**: Login and Signup pages integrated via an `AuthContext` to redirect unauthenticated users away from the dashboard and authenticated users into it.
- **Scalable Layout Skeleton**: A responsive CSS Grid `AppShell` featuring a collapsible mobile sidebar and top header.
- **Design Tokens**: Centralized Tailwind v4 `@theme` configuration enforcing our brand colors, responsive light/dark modes, and spacing.
- **Reusable UI Components**: Core building blocks like `Card`, `PageHeader`, and `Badge` used to construct uniform pages rapidly.
- **Routing**: Client-side navigation powered by React Router with protected and public routes.
- **Interactive Graph Engine**: A `@xyflow/react` powered node graph (`WorkflowCanvas`) integrated directly into the Dashboard to visualize developer workflow and task dependencies.

### 🎨 Brand Colors & Aesthetics
Our UI strictly adheres to the following core palette to ensure a stunning, premium aesthetic in both light and dark modes:
- **Radioactive Grass**: `#51DD15`
- **Sage Green**: `#6B905F`
- **Carbon Black**: `#1D1E1B`
- **Parchment**: `#F4F1EB`
- **Porcelain**: `#F3F7F1`

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

**4. Global Theming & Light Mode Support:**
- **Full Light Mode**: Added comprehensive Light theme styling across all components (`Sidebar`, `Header`, `Profile`, `WorkflowCanvas`, etc.) alongside the existing deep dark mode.
- **Dynamic Backgrounds**: Fine-tuned dashboard kanban columns and backgrounds to be perfectly visible and branded in both environments.

**5. Workspace Integrations & OAuth (Render Backend):**
- **OAuth Callback Flow**: Implemented `OAuthCallback.jsx` to catch and handle authentication redirects from the live Render backend.
- **Workspace UI**: Added `WorkspaceDetail.jsx` and updated `Workspaces.jsx` with loading, connected, and empty states.

**6. AI Graph Rendering:**
- **Dynamic Workflows**: Hooked up `WorkflowCanvas` and `ProjectContext` to fetch and render dynamic graph node definitions directly from an AI endpoint API.

---

## Current Status (Week 4 and 5 Tasks)

With the **Week 2 and Week 3 (Stage 2)** tasks officially complete, the frontend team is currently focused on:

- **Member 5 (Frontend)**: Expanding the node canvas capabilities and managing the complex state of active tasks.
- **Member 6 (Frontend)**: 
  - **Live Team Profiles**: Hooking up the `Team.jsx` interface to the backend `/members` API.
  - **Clover Chat Panel**: Building the global, slide-out Clover AI assistant chat drawer and integrating it with the `/chat` endpoint.

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
