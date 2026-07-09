# Orchestra AI - Frontend Dashboard

Welcome to the frontend interface for **Orchestra AI**, an automated software design blueprint and task-tracking ecosystem.

This repository specifically houses the **UI Shell and Dashboard Architecture**, meticulously built with React, Vite, and Tailwind CSS v4.

## 🚀 Features & Architecture

This repository serves as the foundational frontend interface for the platform, combining an engaging public landing page with a comprehensive, secure dashboard shell.

### Core Systems & Layout
- **Landing Page Integration**: A beautiful, scoped public landing page serving as the entry point for unauthenticated users, complete with custom cursors, animations, and feature showcases.
- **Scalable Layout Skeleton**: A responsive CSS Grid `AppShell` featuring a collapsible mobile sidebar and top header for seamless dashboard navigation.
- **Provider-Auth-First Flow**: Complete end-to-end OAuth integrations for **GitHub, Discord, and Google**. Users can authenticate directly via providers, bypassing legacy password pages for immediate dashboard access.
- **Reusable UI Components**: Core building blocks like `Card`, `PageHeader`, and `Badge` used to construct uniform pages rapidly.

### Interactive Functionality
- **Floating AI Chat**: A globally accessible, draggable, and persistent AI chat widget that provides continuous contextual assistance across the dashboard.
- **Profile & Skills Management**: An interactive user profile allowing users to seamlessly switch between Basic Info, Workspaces, Visibility, and Accounts tabs. Includes a dedicated **Skills Tab** for searching and managing technical proficiencies.
- **Workspace Integrations Hub**: Connecting and managing active integrations with external tools (Figma, GitHub, Discord).
- **Interactive Graph Engine**: A `@xyflow/react` powered node graph (`WorkflowCanvas`) integrated directly into the Dashboard to dynamically fetch and visualize complex developer workflows and task dependencies via AI endpoints.

### 🎨 Global Theming & Aesthetics
Our UI strictly adheres to a custom-designed core palette to ensure a stunning, premium aesthetic. The platform features robust support for both Light and Dark modes.

**Light Mode**:
- **Light Gray Base**: `#F8F9FA`
- **Parchment Surface**: `#F4F1EB`
- **Porcelain Secondary**: `#F3F7F1`
- **Carbon Black Text**: `#1D1E1B`
- **Sage Green Primary**: `#6B905F`

**Dark Mode**:
- **Zinc 950 Base**: `#09090B`
- **Zinc 900 Surface**: `#18181B`
- **Zinc 800 Border**: `#27272A`
- **Zinc 400 Text**: `#A1A1AA`
- **Sage Green Primary**: `#6B905F`

---

## 🛠 Getting Started

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

## 📁 Folder Structure

To help team members navigate the codebase:

```text
src/
├── components/
│   ├── layout/        # Core shell elements (AppShell, Header, Sidebar)
│   ├── ui/            # Reusable primitive elements (Card, Badge, PageHeader)
│   ├── FloatingAIChat.jsx # Persistent floating AI chat widget
│   └── WorkflowCanvas.jsx # Interactive React Flow graph component
├── pages/             # Route-level views (LandingPage, Dashboard, Profile, etc.)
├── styles/            # Global CSS containing Tailwind v4 design tokens
├── App.jsx            # Routing configuration
└── main.jsx           # React mounting point
```
