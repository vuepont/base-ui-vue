<!-- markdownlint-disable MD038 -->

# Repository Guidelines

This repository is a Vue 3 port of Base UI. Keep guidance practical, executable, and aligned with current monorepo scripts.

## Project structure

- Core component library code lives in `packages/core/src/`.
- Nuxt integration/plugin code lives in `packages/plugins/`.
- Documentation site lives in `docs/` (VitePress), with content in `docs/content/` and demos in `docs/components/demo/`.
- Public exports are managed from `packages/core/src/index.ts`; keep exports and implementation in sync.

## Coding guidelines

- Use Vue 3 Composition API with `<script setup>` and TypeScript for new Vue components/composables.
- Reuse existing utilities/composables before adding new abstractions; keep APIs close to Base UI semantics unless Vue adaptation requires changes.
- Prefer explicit, strongly typed public APIs; avoid unnecessary casts (especially `as any`).
- Keep component behavior and accessibility logic close to source counterparts, but implement with Vue idioms (refs, composables, provide/inject).

## Validation commands

Run the smallest relevant checks first, then broaden when needed:

- Lint: `pnpm lint` (or `pnpm lint:fix` when appropriate).
- Core type check: `pnpm --filter base-ui-vue type-check`.
- Core tests: `pnpm --filter base-ui-vue test`.
- Workspace smoke check: `pnpm test`.
- Docs local preview when docs changed: `pnpm docs:dev`.

## Testing conventions

- Test stack is Vitest + Testing Library for Vue (`@testing-library/vue`).
- Co-locate tests with source using existing patterns (`*.test.ts` or `*.test.tsx` as already used in this repo).
- Any behavior change in `packages/core/src/` should include updated or new tests covering interaction/accessibility expectations.

## Commit conventions

- Commits must pass repository hooks (`lint-staged`, `commitlint`).
- Follow Conventional Commits style, e.g. `feat(button): add loading prop` or `fix(composite): correct roving focus`.
- Keep each commit scoped to one logical change.
