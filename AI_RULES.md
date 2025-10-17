# AI Development Rules

This document outlines the tech stack, libraries, and architectural patterns to be used when developing this application. Following these rules ensures consistency, maintainability, and adherence to the project's standards.

## Tech Stack

The application is built with the following technologies:

*   **Framework:** React with TypeScript for building the user interface.
*   **Build Tool:** Vite for fast development and optimized builds.
*   **Styling:** Tailwind CSS for all styling. Components are styled directly with utility classes.
*   **Routing:** React Router (`react-router-dom`) for client-side navigation.
*   **Backend:** Supabase (currently mocked in `services.ts`) for authentication and database services.
*   **State Management:** React Context API for managing global state (`AuthContext`, `BillsContext`).
*   **Icons:** Custom SVG components defined within the project.

## Development Rules & Library Usage

### 1. Styling & Components

*   **Styling:** All styling MUST be done using Tailwind CSS utility classes. Do not write custom CSS files.
*   **Component Structure:** All reusable components are located in `src/components.tsx`. Keep components small and focused. If a component becomes too complex, break it down into smaller sub-components.
*   **UI Primitives:** Use the existing components like `Button`, `Input`, `Card`, and `Modal` from `components.tsx` to maintain a consistent look and feel.

### 2. State Management

*   **Local State:** Use the `useState` and `useEffect` hooks for component-level state.
*   **Global State:** Use the existing React Contexts (`AuthContext`, `BillsContext`) for application-wide state. If new global state is needed, consider whether it fits into an existing context before creating a new one.
*   **Data Fetching:** Data fetching logic should be encapsulated within the provider components (e.g., `BillsProvider`).

### 3. Routing

*   **Library:** Use `react-router-dom` for all routing needs.
*   **Route Definitions:** All routes are defined in the `RouterWrapper` component in `src/App.tsx`. Keep all route definitions centralized there.
*   **Navigation:** Use the `<Link>` component for declarative navigation and the `useNavigate` hook for programmatic navigation.

### 4. Backend & Services

*   **Service Layer:** All external communication (e.g., with Supabase or other APIs) MUST be handled through the service objects defined in `src/services.ts`.
*   **Supabase:** The application is designed to work with Supabase. Although currently mocked, all new features should be built against the Supabase client interface provided in `supabaseService`.
*   **Types:** Define all data structures (like `User`, `Bill`, `Subscription`) in `src/types.ts`.

### 5. Icons

*   **Usage:** Use the icon components provided in `src/components.tsx` (e.g., `HomeIcon`, `TrashIcon`).
*   **Adding New Icons:** If a new icon is needed, add it as a new React component in `src/components.tsx`, following the existing pattern.

### 6. Code Structure

*   **`App.tsx`:** Contains the main application structure, providers, and routing setup.
*   **`components.tsx`:** Contains all reusable UI components and icons.
*   **`hooks.ts`:** Contains custom hooks for accessing context (`useAuth`, `useBills`).
*   **`services.ts`:** Contains logic for interacting with external APIs and services.
*   **`types.ts`:** Contains all TypeScript type and interface definitions.