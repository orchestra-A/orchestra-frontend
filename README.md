# Clover AI - Frontend Dashboard

Welcome to the frontend interface for **Clover AI**, an automated software design blueprint and task-tracking ecosystem.

This repository specifically houses the **UI Shell and Dashboard Architecture**, meticulously built with React, Vite, and Tailwind CSS v4.

## Project Overview (Week 1 Phase)

The frontend team is divided into two specialized roles to ensure rapid parallel development without merge conflicts. This specific codebase represents the foundational work for **Member 6 (Interface Developer)**.

### What is included here:
- **Scalable Layout Skeleton**: A responsive CSS Grid `AppShell` featuring a collapsible mobile sidebar and top header.
- **Design Tokens**: Centralized Tailwind v4 `@theme` configuration enforcing our brand colors, dark mode, and spacing.
- **Reusable UI Components**: Core building blocks like `Card`, `PageHeader`, and `Badge` used to construct uniform pages rapidly.
- **Routing**: Client-side navigation powered by React Router.
- **Interactive Graph Engine**: A `@xyflow/react` powered node graph (`WorkflowCanvas`) integrated directly into the Dashboard to visualize developer workflow and task dependencies.

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
├── pages/             # Route-level views (Dashboard, Projects, Team, Settings)
├── styles/            # Global CSS containing Tailwind v4 design tokens
├── App.jsx            # Routing configuration
└── main.jsx           # React mounting point
```
