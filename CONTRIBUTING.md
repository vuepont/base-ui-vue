# Contributing to Base UI Vue

Thanks for contributing to Base UI Vue.

This repository contains the Vue component library, its docs site, and the supporting packages used to build and test it.

## Before you start

Make sure your local environment matches the workspace requirements:

- Node.js `>= 22.18.0`
- pnpm `10.30.3`

These versions are enforced by the workspace `engines` field in [`package.json`](./package.json).

## Project structure

- `packages/core/src/` — the core Vue component library
- `packages/plugins/` — framework integrations and plugins
- `docs/` — the VitePress documentation site
- `docs/content/` — documentation content
- `docs/components/demo/` — live docs demos

Public exports for the component library are managed from [`packages/core/src/index.ts`](./packages/core/src/index.ts).

## Getting set up

Install dependencies from the repository root:

```sh
pnpm install
```

Run the docs site locally:

```sh
pnpm docs:dev
```

## Common commands

Run these from the repository root.

### Lint

```sh
pnpm lint
```

Auto-fix lint issues when appropriate:

```sh
pnpm lint:fix
```

### Type check the core library

```sh
pnpm --filter base-ui-vue type-check
```

### Run the core test suite

```sh
pnpm --filter base-ui-vue test
```

### Run the workspace smoke test

```sh
pnpm test
```

### Build the docs site

```sh
pnpm docs:build
```

## Making changes

A few conventions help keep the codebase consistent:

- Use Vue 3 Composition API with `<script setup>` and TypeScript for new Vue components and composables.
- Prefer existing utilities and composition patterns before adding new abstractions.
- Keep behavior and accessibility semantics aligned with Base UI, but implement them in a Vue-native way.
- Keep public APIs explicit and strongly typed.
- Update exports when you add or move public functionality.

## Testing expectations

If you change behavior in `packages/core/src/`, include tests for it.

Current testing conventions:

- Vitest + Testing Library for Vue
- Co-located tests such as `*.test.ts`
- Interaction and accessibility expectations should be covered when behavior changes

## Documentation changes

If you update docs:

- keep examples aligned with the current Vue API surface
- prefer Vue-native explanations over cross-framework comparisons unless the comparison is necessary
- update demos when the page depends on live behavior
- run `pnpm docs:build` before finishing

## Commits and pull requests

This repository uses Conventional Commits. Examples:

- `feat(button): add loading prop`
- `fix(composite): correct roving focus`
- `docs(handbook): refine composition examples`

Keep each commit scoped to one logical change when possible.

Repository hooks also run through `lint-staged` and `commitlint`, so make sure your changes are ready before committing.

## Need help?

- Docs: [baseui-vue.com/docs/overview/quick-start](https://baseui-vue.com/docs/overview/quick-start)
- Issues and discussions: [github.com/vuepont/base-ui-vue](https://github.com/vuepont/base-ui-vue)
- Community: [Discord](https://discord.gg/SWzhwGMxsZ)
