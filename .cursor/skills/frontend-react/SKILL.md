---
name: react-frontend-architecture
description: Mandatory React frontend architecture and development standards for React, TypeScript, Vite, Tailwind CSS, shadcn/ui and NestJS backend integration. Use when creating, modifying, reviewing or refactoring frontend code.
---

# React Frontend Architecture & Development Standards

## 1. Purpose

This skill defines the mandatory architecture, coding standards and implementation guidelines for the React frontend application.

Follow these standards for:

- New feature development.
- Existing feature modifications.
- Bug fixes.
- Refactoring.
- API integration.
- UI implementation.
- Code reviews.

Always inspect the existing project before making changes.

Do not introduce unnecessary complexity or change existing working functionality without a good reason.

---

## 2. Technology Stack

Use the following technologies:

- React.js
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- @hookform/resolvers
- Lucide React

Use these technologies consistently.

Do not introduce additional libraries unless they provide a clear benefit and are necessary for the implementation.

---

## 3. Project Folder Structure

Follow this folder structure:

```text
frontend/
  src/
    components/
      ui/
      shared/
    features/
      users/
        components/
        hooks/
        services/
        types/
    layouts/
    pages/
    lib/
      axios.ts
      utils.ts
    routes/
    main.tsx
  package.json
  vite.config.ts
```

### Folder Responsibilities

#### components/

Contains reusable application-wide components.

- ui/: shadcn/ui components.
- shared/: Common application components such as headers, buttons, loaders, dialogs and navigation elements.

#### features/

Organize application functionality by feature.

Each feature should contain its own:

- components/: Feature-specific UI components.
- hooks/: Custom React hooks.
- services/: API communication and backend operations.
- types/: Feature-specific TypeScript interfaces and types.

Example:

```text
features/
  users/
    components/
      UserList.tsx
      UserForm.tsx
      UserDetails.tsx
    hooks/
      useUsers.ts
      useUser.ts
    services/
      userService.ts
    types/
      user.types.ts
```

Add new feature folders following the same convention.

#### layouts/

Contains shared page layouts, such as:

- MainLayout
- AuthLayout
- DashboardLayout

#### pages/

Contains application-level pages.

Examples:

- UsersPage
- UserDetailsPage
- LoginPage
- DashboardPage

Pages should compose reusable components rather than contain all UI and business logic themselves.

#### lib/

Contains shared libraries and utilities.

- axios.ts: Centralized Axios configuration.
- utils.ts: Shared utility functions.

#### routes/

Contains centralized application route definitions and route configuration.

---

## 4. Architecture Principles

### Clean Separation of Concerns

Maintain a clear separation between:

- Components
- Pages
- Business logic
- Custom hooks
- API services
- Type definitions

Responsibilities:

- Components focus on UI and presentation.
- Pages handle page-level composition.
- Hooks handle reusable React logic.
- Services handle API communication.
- Types define application data structures.

Never put complex business logic or direct API calls inside presentation components.

### Feature-Based Architecture

- Organize functionality by business feature.
- Keep feature-specific logic within its feature folder.
- Share common functionality through shared components and utilities.
- Avoid unnecessary cross-feature dependencies.
- Keep modules focused and maintainable.

### Avoid Overengineering

- Prefer simple solutions.
- Avoid unnecessary abstractions.
- Do not create unnecessary files.
- Do not duplicate existing functionality.
- Reuse existing components and utilities.
- Introduce patterns only when they provide real value.

---

## 5. TypeScript Standards

Use TypeScript strictly throughout the application.

Mandatory rules:

- Define proper interfaces and types for application data.
- Strongly type component props.
- Use typed API requests and responses.
- Avoid the `any` type.
- Avoid unnecessary type assertions.
- Reuse shared types where appropriate.
- Keep feature-specific types inside their respective types folders.
- Ensure API response types match the NestJS backend contracts.

Use descriptive type names.

Examples:

- User
- CreateUserDto
- UpdateUserDto
- UserResponse
- PaginatedResponse<T>

Do not use loosely typed objects when a proper interface or type can be defined.

---

## 6. Component Development Standards

- Use functional components.
- Use React hooks.
- Keep components small and focused.
- Build reusable components where appropriate.
- Avoid duplicated UI and logic.
- Separate presentation from business logic.
- Use shared components for common application functionality.
- Use shadcn/ui components whenever appropriate.
- Define clear component props.
- Follow accessibility best practices.

Do not create unnecessary reusable abstractions for components that have no meaningful reuse or shared behavior.

---

## 7. API Integration with NestJS

The frontend communicates with the NestJS backend through centralized API services.

### Axios Configuration

Use a centralized Axios instance in:

src/lib/axios.ts

Requirements:

- Configure the backend API base URL using environment variables.
- Configure common headers.
- Handle common HTTP errors consistently.
- Support authentication headers when authentication is implemented.
- Avoid creating multiple Axios instances unnecessarily.

Example:

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### API Services

Keep API calls inside feature-specific service files.

Example:

features/users/services/userService.ts

```typescript
import { apiClient } from "@/lib/axios";
import type { User } from "../types/user.types";

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>("/users");
  return response.data;
};
```

Rules:

- Never call Axios directly inside UI components.
- Never hardcode API URLs inside components.
- Organize services by feature.
- Use typed requests and responses.
- Follow the actual NestJS API endpoints.
- Follow the backend DTOs and Swagger documentation.
- Do not invent backend endpoints or response structures.
- Do not use mock responses when a real backend endpoint exists.

### TanStack Query

Use TanStack Query for server-state management.

Use it for:

- Fetching data.
- Caching.
- Mutations.
- Refetching.
- Loading states.
- Error handling.
- Query invalidation.

Keep query logic in custom hooks whenever appropriate.

Example:

features/users/hooks/useUsers.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../services/userService";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};
```

---

## 8. Loading, Error and Empty States

Every data-driven page or component MUST handle the following states:

### Loading State

- Display a loading indicator while fetching data.
- Use skeleton loaders where appropriate.
- Prevent confusing or blank UI during loading.

### Error State

- Display a clear error message when an API request fails.
- Handle backend validation errors appropriately.
- Provide retry functionality where useful.
- Do not expose technical stack traces to users.

### Empty State

- Display a meaningful message when no data is available.
- Provide a useful action when appropriate.
- Do not leave empty tables or lists without explanation.

### Success State

- Display the fetched data correctly.
- Provide appropriate success feedback for mutations.

### Mutation State

- Show loading feedback during create, update and delete operations.
- Prevent accidental duplicate submissions.
- Display success and error notifications.

Never leave users with a blank screen when an API request fails or returns no data.

---

## 9. Forms and Validation

Use:

- React Hook Form for form management.
- Zod for validation schemas.
- @hookform/resolvers for integration.

Mandatory rules:

- Define validation schemas separately where appropriate.
- Validate user input before submitting requests.
- Display clear field-level validation messages.
- Handle backend validation errors.
- Disable submit buttons while submitting.
- Prevent duplicate form submissions.
- Show success and error feedback.
- Reuse form components where appropriate.
- Use strongly typed form values.

Follow the NestJS backend DTO validation requirements.

---

## 10. UI and Design Standards

### Component Library

Use shadcn/ui as the primary UI component library.

Use Tailwind CSS for styling.

Use Lucide React for icons.

### Design Principles

The application should have a:

- Modern appearance.
- Clean and professional design.
- Consistent color palette.
- Consistent typography.
- Consistent spacing.
- Clear visual hierarchy.
- Simple navigation.
- User-friendly interaction patterns.

### UI Guidelines

- Prefer reusable UI components.
- Use existing shadcn/ui components whenever possible.
- Avoid unnecessary custom CSS.
- Avoid inline styles unless necessary.
- Maintain consistent spacing and sizing.
- Use appropriate dialogs, dropdowns and notifications.
- Provide hover, focus and disabled states.
- Follow accessibility best practices.

Do not introduce inconsistent visual styles across pages.

---

## 11. Responsive Design

All pages and components MUST be responsive.

Support:

- Mobile devices.
- Tablets.
- Desktop screens.

Requirements:

- Use Tailwind CSS responsive utilities.
- Avoid fixed widths that break smaller screens.
- Ensure forms work on mobile.
- Ensure tables have appropriate mobile handling.
- Ensure dialogs and dropdowns fit smaller screens.
- Ensure navigation adapts to screen size.
- Maintain consistent spacing across screen sizes.
- Prevent horizontal overflow.

Responsive behavior is mandatory, not optional.

---

## 12. Naming Conventions

Follow consistent naming conventions throughout the project.

### Components

Use PascalCase.

Examples:

- UserList.tsx
- UserForm.tsx
- MainLayout.tsx

### Hooks

Use camelCase with the `use` prefix.

Examples:

- useUsers.ts
- useUser.ts
- useCreateUser.ts

### Services

Use camelCase.

Examples:

- userService.ts
- authService.ts

### Types

Use PascalCase.

Examples:

- User
- CreateUserDto
- UpdateUserDto

### Functions and Variables

Use camelCase.

Examples:

- getUsers
- createUser
- isLoading

### Constants

Use UPPER_SNAKE_CASE where appropriate.

Examples:

- API_BASE_URL
- DEFAULT_PAGE_SIZE

### Folders

Use lowercase or kebab-case consistently.

Avoid inconsistent naming patterns and unnecessary abbreviations.

---

## 13. Routing and Layouts

Use React Router for navigation.

Requirements:

- Keep route definitions centralized.
- Use layouts for shared page structures.
- Use nested routes where appropriate.
- Keep page components separate from route configuration.
- Handle unknown routes with a 404 page.
- Implement protected routes only when authentication is required.

Avoid putting all route configuration inside a single page component.

---

## 14. Environment Configuration

Use environment variables for environment-specific configuration.

Example:

.env

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Rules:

- Never hardcode environment-specific API URLs.
- Never commit secrets or private credentials.
- Keep frontend environment variables prefixed with VITE\_.
- Provide an appropriate example environment file when needed.

---

## 15. Implementation Workflow

Before implementing any task, follow these steps:

1. Inspect the existing project structure.
2. Understand the existing implementation.
3. Identify relevant features, components and services.
4. Check existing types and API contracts.
5. Review NestJS Swagger documentation when API details are needed.
6. Identify reusable components and utilities.
7. Plan the smallest clean implementation.
8. Implement using the architecture defined in this skill.
9. Verify the implementation and check for regressions.

Do not blindly create files or rewrite existing working code.

---

## 16. Mandatory Final Implementation Checklist

Before considering any task complete, verify the following:

### Architecture

- [ ] Correct folder structure is followed.
- [ ] Components, pages and API services are separated.
- [ ] Business logic is properly organized.
- [ ] Existing components and utilities are reused where appropriate.

### TypeScript

- [ ] Proper interfaces and types are defined.
- [ ] Component props are strongly typed.
- [ ] API requests and responses are typed.
- [ ] No unnecessary use of `any`.

### Components

- [ ] Components are reusable where appropriate.
- [ ] Components have focused responsibilities.
- [ ] No unnecessary duplicated code.

### API Integration

- [ ] NestJS backend integration follows actual API contracts.
- [ ] Axios uses the centralized configuration.
- [ ] API services are organized by feature.
- [ ] TanStack Query is used appropriately.
- [ ] API errors are handled correctly.

### User Experience

- [ ] Loading states are implemented.
- [ ] Error states are implemented.
- [ ] Empty states are implemented.
- [ ] Success feedback is implemented where appropriate.
- [ ] Forms have proper validation.
- [ ] Duplicate form submissions are prevented.

### UI

- [ ] shadcn/ui and Tailwind CSS are used consistently.
- [ ] Design is clean and professional.
- [ ] Mobile responsiveness is implemented.
- [ ] Accessibility is considered.
- [ ] No broken layouts or horizontal overflow.

### Code Quality

- [ ] Naming conventions are consistent.
- [ ] No unnecessary dependencies.
- [ ] No unnecessary abstractions.
- [ ] No broken functionality introduced.
- [ ] No TypeScript errors.
- [ ] Existing functionality remains intact.

---

## 17. Mandatory Rules for Cursor

For every task:

1. Read and follow this skill.
2. Inspect existing code before making changes.
3. Apply these architecture and coding standards consistently.
4. Do not skip loading, error or empty states.
5. Do not bypass TypeScript typing.
6. Do not put API calls directly inside UI components.
7. Do not duplicate existing components or functionality.
8. Do not introduce unnecessary dependencies.
9. Do not overengineer simple requirements.
10. Follow the actual NestJS backend contracts.
11. Keep the implementation maintainable and easy to understand.
12. Run available type checks and relevant tests after implementation.

If an existing project constraint conflicts with this skill, explain the conflict and choose the smallest safe adaptation.

These standards apply to all new features, modifications, bug fixes and refactoring tasks.
