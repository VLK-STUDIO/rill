# Agent coding guidelines

## Package manager

The package manager in this app is `bun`. Use `bun install <package>` to add new dependencies and `bun run <script>` to run scripts defined in `package.json`.

## Coding guidelines

- NEVER write comments unless the code is not obvious at all
- NEVER use `any` type
- Prefer `const` over `let` when possible
- NEVER use types or function by dynamically importing stuff for no reason. add a proper import line.

## Folder structure guidelines

- Use folders instead of flat files when a module has private submodules that shouldn’t be imported from the outside. Put private pieces (collections/helpers/internal types) next to the implementation, and re-export only the public API from an `index.ts`. This applies to components, composables, utilities, types, and stores. Example for stores: stores with private submodules MUST be folders using this shape: `app/stores/<name>/store.ts` + `app/stores/<name>/index.ts` (only exports store/composables), while `collections.ts`/helpers stay un-exported.
- You don't have to create files for everything. For example, if a composable needs some small utilities that are only used by that composable, you can define them inside the same file. Only create separate files for utilities that are used in multiple places.

## UI Guidelines

- ALWAYS use Nuxt UI components where possible. Search online if you want to know if a component exists and its usage
- ALWAYS use CSS variables from the Nuxt UI theme (documented below)

### Theme variables

- colors: text-default, text-primary, text-secondary, text-success, text-info, text-warning, text-error
- text: text-dimmed, text-muted, text-toned, text-default, text-highlighted, text-inverted
- bg: bg-default, bg-muted, bg-elevated, bg-accented, bg-inverted
- border: border-default, border-muted, border-accented, border-inverted
