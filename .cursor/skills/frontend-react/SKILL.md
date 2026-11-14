---
name: frontend-react
description: Build, review, and test maintainable React TypeScript features using feature-based organization, reusable components, hooks, contexts only when justified, accessible UI, and backend-driven data fetching. Use for React pages, components, hooks, contexts, API clients, forms, and frontend tests.
---

# React + TypeScript Frontend Engineering Skill

## Purpose
Build a small, reliable React interface for demonstrating the SEC Filings API. The frontend is a client of the NestJS backend. Keep the UI within assignment scope and follow the existing React setup and conventions.

## Before changing code
1. Inspect the current React version, build tool, router, styling system, state/data-fetching libraries, test setup, and existing folder conventions.
2. Reuse installed dependencies and existing patterns where they are sound. Do not add libraries or replace the stack without explaining why.
3. Identify the feature, affected files, and expected user behavior before implementation.
4. Do not call SEC endpoints directly from the browser. All SEC access must go through the NestJS API.
5. Keep changes focused; do not build unrelated dashboards, authentication, complex design systems, or global state infrastructure.

## Feature-based structure
Prefer organizing code by user-facing/business feature rather than creating large global folders of unrelated files. Adapt to the existing project; do not move the whole codebase just to match an ideal structure.

A possible structure, only if compatible with the existing app:

```text
src/
  app/
    App.tsx
    router/
    providers/
  features/
    companies/
      pages/
      components/
      hooks/
      services/
      types/
    filings/
      pages/
      components/
      hooks/
      services/
      types/
  shared/
    components/
    hooks/
    contexts/
    services/
    types/
    utils/
```

- Keep feature-specific pages, components, hooks, services, and types inside that feature.
- Put a component in `shared/components` only when it is genuinely reusable across multiple features and has a stable, generic API.
- Keep feature-only components local to their feature.
- Keep shared utilities small and framework-agnostic where possible.
- Avoid barrel files that create circular dependencies or obscure imports.
- Avoid creating empty folders or placeholder abstractions.
- Use the existing routing approach; do not add a router if the application does not need one.

## Component responsibilities
- Pages compose feature components and coordinate page-level state.
- Components render UI and expose clear props; avoid embedding API transport logic in presentation components.
- Hooks encapsulate reusable stateful behavior or feature-specific orchestration.
- Services/API clients handle HTTP communication and response parsing.
- Context is for state or dependencies genuinely needed by multiple distant parts of the tree, not a default state-management tool.
- Avoid giant components, prop drilling across many levels, and overly fragmented components.
- Keep components focused and small enough to understand, but do not split every JSX fragment into its own component.
- Prefer controlled form inputs for filters and search when that improves predictable behavior.
- Keep derived values derived; do not duplicate them in state.

## React and TypeScript practices
- Use function components and hooks.
- Follow the installed React version's recommended APIs and existing project patterns.
- Use stable, meaningful keys when rendering lists; never use array indexes as keys for changing lists.
- Avoid unnecessary `useEffect`. Do not use effects to calculate values that can be derived during render or to respond to user events.
- Use `useMemo` and `useCallback` only when there is a measured or clear referential-stability need; do not add them everywhere.
- Keep state as close as possible to where it is used.
- Use discriminated unions or explicit state models for loading, success, empty, and error states where useful.
- Avoid `any`; type API responses and component props.
- Do not duplicate backend contract definitions inconsistently. Define frontend API types that match the documented NestJS response contract.
- Avoid unsafe casts and non-null assertions. Narrow optional values.
- Keep components accessible: semantic HTML, associated labels, keyboard operation, visible focus, appropriate button types, and useful error messages.
- Do not use clickable `div` elements where a button or link is appropriate.

## Data fetching and API boundaries
- Centralize the base URL and HTTP behavior in an API client/service.
- Read configuration from the existing environment setup. Do not hardcode deployment URLs.
- Use feature services such as company and filing API functions; do not fetch from components directly.
- Handle non-2xx responses explicitly and expose useful typed errors.
- Handle loading, empty, success, and error states in the UI.
- Prevent stale responses from overwriting newer searches. Use the project's existing query library or cancellation mechanism if available; do not add one without justification.
- Avoid duplicate requests caused by unnecessary effects or unstable dependencies.
- Keep pagination, filter, and sort state synchronized with the backend API contract. Reset page to 1 when filters change if that is the expected UX.
- Do not silently swallow errors or show fake/sample data as if it came from the API.
- Never call SEC endpoints directly from React.

## SEC Filings UI scope
The interface should demonstrate:
1. Search/select one of the six supported tickers: AAPL, META, GOOGL, AMZN, NFLX, GS.
2. Show company details returned by the backend.
3. List filings newest first.
4. Filter by form type and start/end date.
5. Navigate paginated results.
6. Open the primary document URL on sec.gov.
7. Show loading, empty, and error states.

Keep the interface straightforward and responsive. Avoid unnecessary charts, authentication, user accounts, saved searches, or other features not requested.

## State management
- Prefer local component state for local UI state.
- Use URL query parameters for shareable/searchable page state if the existing router makes this straightforward and useful.
- Use Context only for genuinely cross-cutting state or providers.
- Do not create a context for every feature or every piece of state.
- Do not introduce Redux or another global state library for this small assignment unless the existing application already uses it or a concrete requirement justifies it.

## Testing
- Follow the existing test framework.
- Test user-visible behavior: search, filter changes, pagination, loading, empty results, errors, and opening document links.
- Mock the NestJS API boundary; frontend unit tests should not depend on live SEC.
- Test hooks independently only when their logic is non-trivial and the test setup supports it.
- Prefer accessible queries and user interactions over implementation-detail assertions.
- Run tests, lint, and typecheck where available. Report exact commands and actual outcomes.

## Performance and maintainability
- Avoid premature optimization.
- Keep bundle additions minimal.
- Avoid unnecessary context providers and deeply nested provider trees.
- Clean up subscriptions, event listeners, and asynchronous work when needed.
- Do not mutate state directly.
- Keep styling consistent with the existing design system or styling approach.
- Ensure responsive behavior without introducing a new UI framework unnecessarily.

## Implementation workflow
For each task:
1. Summarize the requirement and acceptance criteria.
2. Inspect relevant feature and shared code.
3. Propose the smallest change set.
4. Implement one feature or behavior at a time.
5. Explain important decisions and trade-offs.
6. Add or update tests.
7. Run relevant checks and report exact results.
8. Update `NOTES.md` with actual frontend decisions, assumptions, limitations, and test outcomes.
9. Preserve the automatic prompt log. Never fabricate prompts, timestamps, tool calls, or AI actions.

## Do not
- Put SEC API calls in the browser.
- Put all pages/components/hooks into one global folder regardless of feature ownership.
- Put feature-specific components into shared folders without a reuse case.
- Create Context or global state by default.
- Use effects for derived state or event handling.
- suppress TypeScript errors to make the build pass.
- fabricate API responses, test results, or completion claims.
