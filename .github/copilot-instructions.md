# Copilot Instructions -- Azure Status Dashboard

## Project Overview

This is a Single Page Application (SPA) built with **Vite + React + TypeScript + Tailwind CSS + shadcn/ui**, deployed on **GitHub Pages**. It is an Azure services dashboard that displays real-time health status, incident timelines, region status, and Azure updates using only publicly available Azure data feeds (RSS/Atom).

## Design Principles -- SOLID

All code in this project must adhere to the SOLID principles:

### Single Responsibility Principle (SRP)

- Every module, class, component, and function must have exactly **one reason to change**.
- React components must only handle rendering and UI interaction. Business logic, data fetching, and data transformation belong in dedicated hooks, services, or utility modules.
- Do **not** mix data fetching with presentation. Use custom hooks (e.g., `useAzureStatus`) for data, and pass results to presentational components via props.
- Each file should export a single primary concern. If a file grows beyond ~150 lines, consider splitting it.

### Open/Closed Principle (OCP)

- Code must be **open for extension but closed for modification**.
- Use composition over inheritance. Favor React component composition patterns (render props, children, slots) over modifying existing components.
- Configuration and feature flags should drive behavior changes rather than editing existing logic.
- Data source adapters (RSS parsers, API clients) must implement a common interface so new sources can be added without modifying consumers.

### Liskov Substitution Principle (LSP)

- Any component that accepts a base type or interface must work correctly with any subtype or implementation of that interface.
- TypeScript interfaces and types must be designed so that substituting one implementation for another does not break consumers.
- Avoid type assertions (`as`) and non-null assertions (`!`) -- prefer proper type narrowing and guards.

### Interface Segregation Principle (ISP)

- Do **not** create large, monolithic prop interfaces. Split them into focused, composable interfaces.
- Hooks should return only what their consumers need. If a hook returns many values, consider splitting it into smaller hooks.
- Service interfaces should be narrow and purpose-specific. A `StatusService` should not also handle `Updates` -- those are separate concerns.

### Dependency Inversion Principle (DIP)

- High-level modules (components, pages) must **not** depend directly on low-level modules (fetch calls, RSS parsing).
- All external data access must go through abstract service interfaces. Components depend on hooks, hooks depend on service interfaces, services implement the interfaces.
- Use dependency injection patterns where appropriate (React Context for services, factory functions for testability).

## Architecture

```
src/
  components/       # Reusable UI components (presentational)
    ui/             # shadcn/ui base components
  features/         # Feature-specific modules (each feature is self-contained)
    service-health/
    incident-timeline/
    region-status/
    azure-updates/
  hooks/            # Shared custom hooks
  services/         # Data access layer (interfaces + implementations)
  types/            # Shared TypeScript types and interfaces
  lib/              # Utility functions and helpers
  config/           # App configuration and constants
```

### Feature Module Structure

Each feature module in `features/` should follow this internal structure:

```
features/<feature-name>/
  components/       # Feature-specific components
  hooks/            # Feature-specific hooks
  types.ts          # Feature-specific types (if needed beyond shared types)
  index.ts          # Public API barrel export
```

## Coding Standards

### General

- **Language**: TypeScript with strict mode enabled. No `any` types unless absolutely unavoidable and documented.
- **No emojis**: Do not use emojis anywhere in the codebase -- not in code, comments, UI text, commit messages, or documentation.
- **Naming**: Use `PascalCase` for components and types, `camelCase` for functions, variables, and hooks, `UPPER_SNAKE_CASE` for constants, and `kebab-case` for file and directory names.
- **Exports**: Prefer named exports over default exports for better refactoring support and IDE discoverability.
- **Imports**: Use path aliases (`@/`) for imports from the `src/` root. Prefer absolute imports over relative imports that traverse more than one parent directory.

### React

- Use **functional components** exclusively. No class components.
- Use **hooks** for all state management and side effects.
- Presentational components must be **pure** -- given the same props, they produce the same output with no side effects.
- Memoize expensive computations with `useMemo` and callbacks with `useCallback` only when there is a measurable performance benefit. Do not prematurely optimize.
- Props interfaces must be explicitly defined and exported alongside the component.

### Styling

- Use **Tailwind CSS** utility classes as the primary styling method.
- Use **CSS variables** for theming (dark/light mode support).
- Do not use inline `style` attributes unless dynamically computed values require it.
- Follow the shadcn/ui component patterns for consistency.

### Data Fetching

- All data fetching must go through the service layer in `src/services/`.
- Services must be defined as TypeScript interfaces first, then implemented.
- Use a CORS proxy or pre-processed data approach for RSS feeds that do not support CORS from GitHub Pages.
- Handle loading, error, and empty states explicitly in every data-consuming component.
- Cache responses where appropriate to reduce redundant network requests.

### Error Handling

- Never silently swallow errors. Every catch block must either handle the error meaningfully or propagate it.
- Display user-friendly error messages in the UI. Never show raw error objects or stack traces to users.
- Use error boundaries for catastrophic rendering failures.
- Log errors to the console in development. Structure error information consistently.

### Testing

- Write tests for service implementations, utility functions, and custom hooks.
- Use **Vitest** as the test runner (bundled with Vite).
- Use **React Testing Library** for component tests.
- Tests should verify behavior, not implementation details.
- Aim for tests on all service/data-transformation logic. UI tests should focus on critical user interactions.

### Accessibility

- All interactive elements must be keyboard accessible.
- Use semantic HTML elements (`nav`, `main`, `section`, `article`, `header`, `footer`).
- Provide `aria-label` attributes where the visual context is not sufficient for screen readers.
- Ensure sufficient color contrast in both light and dark themes.
- Status indicators must not rely solely on color -- include text or icons that convey meaning.

### Performance

- Lazy load feature modules using `React.lazy` and `Suspense`.
- Minimize bundle size: import only what is needed from libraries.
- Use `React.memo` for components that re-render frequently with unchanged props.
- Avoid unnecessary re-renders by keeping state as local as possible.

## Deployment

- The application is deployed to **GitHub Pages** via GitHub Actions.
- The build output is a fully static site (no server-side rendering, no API routes).
- All data must be fetched client-side from publicly accessible endpoints.
- The base path must be configurable for GitHub Pages subdirectory deployment.

## Git Conventions

- Commit messages must follow **Conventional Commits** format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`
- No emojis in commit messages.
- Keep commits atomic -- one logical change per commit.
