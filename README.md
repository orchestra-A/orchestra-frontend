# Orchestra AI - Frontend Dashboard

Welcome to the frontend interface for **Orchestra AI**, an automated software design blueprint and task-tracking ecosystem.

This repository specifically houses the **UI Shell and Dashboard Architecture**, meticulously built with React, Vite, and Tailwind CSS v4.

## Features & Architecture

This repository serves as the foundational frontend interface for the platform, combining an engaging public landing page with a comprehensive, secure dashboard shell.

### Core Systems & Layout
- **Landing Page Integration**: A beautiful, scoped public landing page serving as the entry point for unauthenticated users, complete with custom cursors, animations, and feature showcases.
- **Scalable Layout Skeleton**: A responsive CSS Grid `AppShell` featuring a collapsible mobile sidebar and top header for seamless dashboard navigation. The sidebar dynamically expands and adapts when viewing specific or archived projects.
- **Provider-Auth-First Flow**: Complete end-to-end OAuth integrations for **GitHub, Discord, and Google**. Users can authenticate directly via providers, bypassing legacy password pages for immediate dashboard access.
- **Reusable UI Components**: Core building blocks like `Card`, `PageHeader`, and `Badge` used to construct uniform pages rapidly.

### Interactive Functionality
- **Interactive AI Assistant (Clover)**: A globally accessible, persistent AI chat widget that streams real-time responses. It seamlessly integrates with the UI by rendering actionable task cards that route you directly into your workflow when clicked.
- **Complete Project Lifecycle**: Create, modify, archive, restore, and delete projects. Manage tracked repositories and Discord channels in real-time. Archived projects are smartly siloed but easily accessible via a dedicated Archive dashboard and dynamic sidebar routing.
- **Deep Task & Team Routing**: Highly integrated sub-pages where clicking a team member instantly opens the Kanban board precisely filtered to only show their assigned workload, backed by robust alias matching.
- **Profile & Skills Management**: An interactive user profile allowing users to seamlessly switch between Basic Info, Workspaces, Visibility, and Accounts tabs. Includes a dedicated **Skills Tab** for searching and managing technical proficiencies.
- **Interactive Graph Engine**: A `@xyflow/react` powered node graph (`WorkflowCanvas`) integrated directly into the Dashboard to dynamically fetch and visualize complex developer workflows and task dependencies via AI endpoints.

### Global Theming & Aesthetics
Our UI strictly adheres to a custom-designed core palette to ensure a stunning, premium aesthetic. The platform features robust support for both Light and Dark modes.

**Light Mode**:
- **Light Gray Base**: `#F8F9FA`
- **Parchment Surface**: `#F4F1EB`
- **Porcelain Secondary**: `#F3F7F1`
- **Carbon Black Text**: `#1D1E1B`
- **Sage Green Primary**: `#6B905F`
- **Bright Green Accent**: `#7ED957`

**Dark Mode**:
- **Zinc 950 Base**: `#09090B`
- **Zinc 900 Surface**: `#18181B`
- **Zinc 800 Border**: `#27272A`
- **Zinc 400 Text**: `#A1A1AA`
- **Sage Green Primary**: `#6B905F`
- **Bright Green Accent**: `#7ED957`

---

## Getting Started

Follow these steps to run the dashboard locally on your machine:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up environment variables:**
   Create a `.env` file in the root directory and add your API key for Clover AI:
   ```env
   VITE_ORCHESTRA_AI_API_KEY=your_api_key_here
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173` (or the port specified in your terminal).

*Note: The application automatically respects your system's Dark/Light mode preference!*

---

## Folder Structure

To help team members navigate the codebase:

```text
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx        # Main application layout wrapper
│   │   ├── Header.jsx          # Top navigation and user menu
│   │   └── Sidebar.jsx         # Global collapsible sidebar
│   ├── ui/
│   │   ├── avatar.jsx          # Reusable avatar component
│   │   ├── badge.jsx           # Reusable badge component
│   │   ├── button.jsx          # Reusable button component
│   │   ├── dropdown-menu.jsx   # Accessible dropdowns
│   │   ├── input.jsx           # Form input component
│   │   └── utils.js            # UI utility functions
│   ├── workflow/
│   │   └── Nodes.jsx           # Custom React Flow node definitions
│   ├── FloatingAIChat.jsx      # Persistent floating AI chat widget
│   └── WorkflowCanvas.jsx      # Interactive React Flow graph component
├── context/
│   ├── AuthContext.jsx         # Global authentication state
│   ├── ProjectContext.jsx      # Global project state and data management
│   └── ThemeContext.jsx        # Dark/light mode switcher
├── pages/
│   ├── (Public/Auth)
│   │   ├── LandingPage.jsx   # Marketing/landing page
│   │   ├── Login.jsx         # User login
│   │   ├── Onboarding.jsx    # Account setup
│   │   └── OAuthCallback.jsx # OAuth verification handler
│   ├── (Global App)
│   │   ├── Dashboard.jsx     # Home page showing aggregate stats
│   │   ├── Projects.jsx      # Global directory of all projects
│   │   ├── Todo.jsx          # Global tasks assigned to the user
│   │   ├── Calendar.jsx      # Global calendar
│   │   ├── Archive.jsx       # Archived projects view
│   │   ├── Profile.jsx       # User profile management
│   │   ├── Settings.jsx      # Global app settings
│   │   ├── Workspaces.jsx    # Connected platforms (GitHub, Discord, Figma)
│   │   └── Help.jsx          # Help and about page
│   └── (Project-Specific)
│       ├── ProjectWorkflow.jsx # Kanban/Workflow board
│       ├── ProjectTasks.jsx    # List-view of tasks
│       ├── ProjectTeam.jsx     # Team members directory
│       ├── ProjectActivity.jsx # Activity/Events log
│       └── Blueprint.jsx       # Modify project configuration
├── services/
│   └── api.js                  # Centralized API and Clover AI fetch calls
├── index.css             # Global CSS containing Tailwind v4 design tokens
├── globals.css           # Additional global styling overrides
├── App.jsx               # Routing configuration
└── main.jsx              # React mounting point
```
