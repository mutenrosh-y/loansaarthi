---
trigger: always_on
description: 
globs: 
---
# Loansaarthi Project Style Guide

This guide defines coding conventions and best practices for the Loansaarthi codebase, which uses Next.js 14 App Router, TypeScript, Prisma, PostgreSQL, NextAuth, Tailwind CSS, Radix UI, and Shadcn UI. Follow these rules to ensure code quality, maintainability, and consistency.

## Key Principles
- Use functional, declarative programming. Avoid classes.
- Prefer modular, reusable code over duplication.
- Use descriptive variable names (e.g., isLoading, hasError).
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components and helpers.
- Use the Receive an Object, Return an Object (RORO) pattern for functions with multiple params.

## TypeScript & JavaScript
- Use the `function` keyword for pure functions. Omit semicolons.
- Use TypeScript everywhere. Prefer interfaces over types for object shapes.
- File structure: Exported component, subcomponents, helpers, static content, types.
- Avoid unnecessary curly braces in single-line conditionals.
- Use concise, one-line syntax for simple conditionals (e.g., if (condition) doSomething())

## Error Handling
- Handle errors and edge cases at the start of functions (guard clauses).
- Use early returns for error conditions; avoid deep nesting.
- Place the happy path last in the function for readability.
- Avoid unnecessary else statements; use if-return pattern.
- Log errors and provide user-friendly error messages.
- Use custom error types or error factories for consistency.

## React/Next.js
- Use functional components and TypeScript interfaces.
- Use declarative JSX.
- Use `function`, not `const`, for components.
- Use Shadcn UI, Radix, and Tailwind CSS for UI and styling.
- Implement responsive design with Tailwind CSS (mobile-first).
- Place static content and interfaces at file end.
- Use content variables for static content outside render functions.
- Minimize 'use client', 'useEffect', and 'setState'. Favor React Server Components (RSC).
- Use Zod for form validation.
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: WebP format, size data, lazy loading.
- Use error boundaries for unexpected errors (error.tsx, global-error.tsx).
- Use useActionState with react-hook-form for form validation.
- Code in services/ dir always throws user-friendly errors that can be caught and shown to the user.
- Use next-safe-action for all server actions.
- Implement type-safe server actions with proper validation.
- Handle errors gracefully and return appropriate responses.

## Naming Conventions
- Booleans: Use auxiliary verbs (is, has, should, does) (e.g., isDisabled, hasError).
- Filenames: Use lowercase with dash separators (e.g., auth-wizard.tsx).
- File extensions: Use .config.ts, .test.ts, .context.tsx, .type.ts, .hook.ts as appropriate.

## Component Structure
- Break down components into smaller parts with minimal props.
- Use micro folder structure for components.
- Use composition to build complex components.
- Order: component declaration, styled components (if any), TypeScript types.

## Data Fetching & State Management
- Use React Server Components for data fetching when possible.
- Implement the preload pattern to prevent waterfalls.

## Styling
- Use Tailwind CSS (Utility First approach).
- Use Class Variance Authority (CVA) for managing component variants.

## Testing
- Write unit tests for utility functions and hooks.
- Use integration tests for complex components and pages.
- Implement end-to-end tests for critical user flows.

## Accessibility
- Ensure interfaces are keyboard navigable.
- Use proper ARIA labels and roles for components.
- Ensure color contrast ratios meet WCAG standards.

## Documentation
- Comment complex logic clearly.
- Use JSDoc comments for functions and components.
- Keep README up-to-date with setup instructions and project overview.
