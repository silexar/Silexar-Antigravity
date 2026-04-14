# Tailwind CSS 3 → 4 Migration Plan

> **Target version:** `tailwindcss@4.x`  
> **Current version:** `tailwindcss@3.4.17`  
> **Project:** Silexar Pulse (Next.js 16 + Turbopack)

## Overview

Tailwind CSS v4 is a complete architectural rewrite. It drops `tailwind.config.js` in favor of CSS-based configuration, replaces PostCSS plugin usage with a native `@import "tailwindcss"`, and changes how custom themes/plugins are registered.

---

## Phase 1 — Pre-flight checklist

Before touching the dependency, verify:

- [ ] All open branches/PRs merged or documented.
- [ ] `npm run build` passes on Vercel with current `tailwindcss@3.4.17`.
- [ ] Storybook builds successfully (uses Tailwind classes).
- [ ] Snapshot/screenshot tests recorded (visual regression safety net).

---

## Phase 2 — Install Tailwind 4

```bash
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@latest @tailwindcss/postcss
```

> **Why:** Tailwind 4 ships its own PostCSS plugin (`@tailwindcss/postcss`) and no longer uses the standalone `autoprefixer` dependency for the same purposes.

---

## Phase 3 — Delete legacy config files

Remove these files (they are incompatible with v4):

- `tailwind.config.js`
- `postcss.config.js`

> **Backup:** They are already in Git; we can revert if needed.

---

## Phase 4 — Create the new CSS entry file

Replace the contents of `src/app/globals.css` with the following structure.

### 4.1 Import Tailwind

```css
@import "tailwindcss";
```

### 4.2 Migrate custom theme tokens

In v4, customizations live inside `@theme` blocks. Port the tokens from the old `tailwind.config.js`:

```css
@theme {
  /* Colors from tailwind.config.js -> theme.extend.colors */
  --color-surface-base:   #F0EDE8;
  --color-surface-raised: #F5F2EE;
  --color-surface-inset:  #E8E5E0;

  --color-shadow-light: #FFFFFF;
  --color-shadow-dark:  #D4D1CC;

  --color-primary-50:  #EEF3FD;
  --color-primary-100: #D5E4FB;
  --color-primary-200: #AACAF7;
  --color-primary-300: #7FAFF3;
  --color-primary-400: #5495EF;
  --color-primary-500: #1D5AE8;
  --color-primary-600: #1648BA;
  --color-primary-700: #10368C;
  --color-primary-800: #0B245E;
  --color-primary-900: #051230;

  --color-success-50:  #EAF2E3;
  --color-success-100: #C6DDB0;
  --color-success-200: #9DC87A;
  --color-success-300: #74B244;
  --color-success-400: #4E901E;
  --color-success-500: #3B6D11;

  --color-warning-50:  #FEF6E8;
  --color-warning-100: #FDE4B5;
  --color-warning-200: #FBD07E;
  --color-warning-300: #F9BC47;
  --color-warning-400: #F4AB1E;
  --color-warning-500: #EF9F27;

  --color-danger-50:  #F7E6E6;
  --color-danger-100: #EDB5B5;
  --color-danger-200: #E08080;
  --color-danger-300: #D44B4B;
  --color-danger-400: #BF3535;
  --color-danger-500: #A32D2D;

  --color-ai-50:  #EDEAFF;
  --color-ai-100: #D3CFFE;
  --color-ai-200: #A49FFD;
  --color-ai-300: #766FFC;
  --color-ai-400: #6A60E8;
  --color-ai-500: #534AB7;

  --color-text-primary:   #2C2C2A;
  --color-text-secondary: #5F5E5A;
  --color-text-tertiary:  #888780;

  /* Box shadows */
  --shadow-neu-raised:    6px 6px 14px #D4D1CC, -6px -6px 14px #FFFFFF;
  --shadow-neu-raised-sm: 4px 4px 10px #D4D1CC, -4px -4px 10px #FFFFFF;
  --shadow-neu-raised-xs: 2px 2px 6px #D4D1CC,  -2px -2px 6px #FFFFFF;
  --shadow-neu-inset:     inset 3px 3px 8px #D4D1CC, inset -3px -3px 8px #FFFFFF;
  --shadow-neu-inset-sm:  inset 2px 2px 5px #D4D1CC, inset -2px -2px 5px #FFFFFF;
  --shadow-neu-pressed:   inset 2px 2px 5px #D4D1CC, inset -2px -2px 5px #FFFFFF;
  --shadow-neu-focus:     0 0 0 3px rgba(29, 90, 232, 0.25), 4px 4px 10px #D4D1CC, -4px -4px 10px #FFFFFF;
  --shadow-neu-flat:      0 0 0 transparent;
  --shadow-neu-dark-raised:  6px 6px 14px #0a0a0a, -6px -6px 14px #2a2a2a;
  --shadow-neu-dark-inset:   inset 3px 3px 8px #0a0a0a, inset -3px -3px 8px #2a2a2a;
  --shadow-neu-dark-pressed: inset 2px 2px 5px #0a0a0a, inset -2px -2px 5px #2a2a2a;

  /* Background colors */
  --color-neu-base:   #F0EDE8;
  --color-neu-raised: #F5F2EE;
  --color-neu-inset:  #E8E5E0;

  /* Border radius */
  --radius-neu:    16px;
  --radius-neu-sm: 12px;
  --radius-neu-xs: 8px;
  --radius-neu-lg: 24px;
  --radius-neu-xl: 32px;
}
```

> **Class-name mapping change:**  
> In v3 we used `bg-neu-base`, `shadow-neu-raised`, `rounded-neu`, etc.  
> In v4 the automatic prefixing changes. With the `@theme` block above, the generated utility classes become:
> - `bg-neu-base`  → maps to `--color-neu-base`
> - `shadow-neu-raised` → maps to `--shadow-neu-raised`
> - `rounded-neu`  → maps to `--radius-neu`
>
> Tailwind v4 automatically wires `--color-*` to `bg-*`, `text-*`, `border-*`, etc., and `--shadow-*` to `shadow-*`. No extra `backgroundColor` or `borderRadius` extends are needed.

### 4.3 Preserve HSL variable fallback styles

Keep the existing `:root` CSS variables and `.neo-*` helper classes at the bottom of `globals.css` **after** the `@theme` block. They are used by non-Tailwind custom components.

```css
:root {
  --background: 36 17% 93%;
  --foreground: 217 33% 14%;
  /* ... keep the rest exactly as-is ... */
}

.neo-surface { /* ... */ }
.neo-card    { /* ... */ }
/* etc. */
```

### 4.4 Dark mode

Tailwind v4 supports `darkMode: 'class'` via the `dark` variant. If we still need the class-based toggle, keep the `.dark` class on `<html>` and ensure the `:root` variables are duplicated inside `.dark` if components read them directly. Tailwind’s own `dark:` prefix works automatically once `dark` class is present.

---

## Phase 5 — Content scanning

Tailwind v4 scans by default, but in a Next.js project we should verify it picks up all files.

Create a minimal `postcss.config.mjs` (v4 format):

```js
/** @type {import('@tailwindcss/postcss').Config} */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

If v4 does **not** auto-detect all `src/**` paths (rare in Next.js 16 but possible), add a `tailwind.config.ts` **stub** with only `content`:

```ts
import type { Config } from 'tailwindcss';
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
} satisfies Config;
```

> Most v4 setups do **not** need this file, but it is a safe fallback if auto-scan misses dynamic imports.

---

## Phase 6 — Find and replace known breaking patterns

Run a project-wide search for these v3-specific patterns and update them:

| v3 Pattern | v4 Equivalent |
|---|---|
| `@tailwind base;` | `@import "tailwindcss";` |
| `@tailwind components;` | (removed / included in import) |
| `@tailwind utilities;` | (removed / included in import) |
| `theme('colors.primary.500')` in arbitrary values | `var(--color-primary-500)` |
| `bg-opacity-*` / `text-opacity-*` | Use `bg-primary-500/50` syntax (already works in v3, but `bg-opacity` is removed in v4) |

Search commands to run before migration:

```bash
# Find old @tailwind directives outside globals.css
grep -r "@tailwind" src/ --include="*.css" --include="*.scss"

# Find bg-opacity / text-opacity usage
grep -r "bg-opacity-" src/ --include="*.tsx" --include="*.ts"
grep -r "text-opacity-" src/ --include="*.tsx" --include="*.ts"
```

---

## Phase 7 — Build verification

```bash
npm run build
```

Common v4 failures and fixes:

1. **`@apply` with custom utilities** — v4 restricts `@apply` to utilities that exist in the CSS output. If a custom utility class (e.g., `.neo-card`) is applied via `@apply`, move it to a real CSS rule or use the underlying properties directly.
2. **Missing colors** — If `bg-neu-base` suddenly is missing, check that `--color-neu-base` is declared inside `@theme`.
3. **Font-size / spacing tokens** — If you overrode `fontSize` or `spacing` in v3, port them to `--text-*` and `--spacing-*` inside `@theme`.

---

## Phase 8 — Storybook & visual tests

Run:

```bash
npm run storybook
```

Ensure:
- All custom colors render correctly.
- Neuromorphic shadows appear on cards/buttons.
- Dark-mode toggle still works.

---

## Quick-reference: one-liner install script

```bash
# Safe execution order
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@latest @tailwindcss/postcss
rm tailwind.config.js postcss.config.js
# Then manually edit src/app/globals.css according to Phase 4
```

---

## Risk assessment

| Risk | Mitigation |
|---|---|
| Visual regression (colors/shadows lost) | Keep `:root` variables as fallback; test Storybook first |
| Build time increase | v4 is generally faster, but Turbopack + v4 is still bleeding edge; test on Vercel |
| `shadcn/ui` components break | Most `shadcn` components use standard Tailwind classes; only custom extended ones need `@theme` migration |
| `neo-*` custom classes vanish | They are plain CSS classes, not Tailwind utilities; they survive as long as they stay in `globals.css` |

---

**Last updated:** 2026-04-14
