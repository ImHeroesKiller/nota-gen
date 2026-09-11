# PERADA Tools — Style System Audit & Cleanup

Date: 12 Sep 2026

## Audit conclusion

The UI inconsistencies were caused by style architecture, not by individual Tailwind components alone. The application loaded six overlapping CSS layers at runtime (`global.css`, `erp-modern.css`, `tool-workspace.css`, `all-tools-modern.css`, `tool-workspace-v4.css`, and `recruitment-pipeline.css`) plus duplicate token files. Several layers used broad descendant selectors and `!important` rules against every label, input, button, heading, rounded card, table, max-width wrapper, and utility class inside `.erp-tool-stage`.

This created cascade collisions: authored component spacing was overwritten, compact controls expanded, headers duplicated, search/input compositions broke, table/card density changed unpredictably, and one tool often required another override file to repair the previous override.

## Removed legacy layers

- `src/styles/global.css` — old glassmorphism system and duplicated root tokens
- `src/styles/erp-modern.css` — superseded shell implementation
- `src/styles/tool-workspace.css` — broad legacy-tool normalization
- `src/styles/all-tools-modern.css` — second broad normalization layer
- `src/styles/tool-workspace-v4.css` — third compatibility/override layer
- `src/styles/recruitment-pipeline.css` — temporary page-specific repair for cascade conflicts
- `src/styles/design-tokens.css` — duplicate CSS tokens
- `src/styles/erp-tokens.css` — duplicate ERP tokens
- `src/styles/designTokens.ts` — unused duplicate TypeScript tokens

## New architecture

There is now one stylesheet source of truth:

`src/styles/perada-erp.css`

It owns only the application shell and shared ERP directory/workspace primitives:

- sidebar
- topbar
- global search
- suite/module/tool directory cards
- tool shell header
- layout tokens
- light/dark theme variables
- responsive shell behavior
- print shell behavior

`src/index.css` now only loads Tailwind and `perada-erp.css`, plus a few explicit utility animations/scroll helpers.

## Important design rule

The new system intentionally does **not** style generic descendants such as:

- `.erp-tool-stage input`
- `.erp-tool-stage button`
- `.erp-tool-stage label`
- `.erp-tool-stage table`
- `.erp-tool-stage .rounded-xl`
- `.erp-tool-stage [class*=bg-white]`

Tool UIs must keep their authored component styles. Shared visual primitives should be explicit classes/components, not inferred from Tailwind utility names.

Only structural embedding fixes remain in the shell, such as preventing nested `100vh` tool roots and hiding redundant direct-child legacy headers when a tool is embedded under the canonical tool shell.

## Result

The cleanup removes 4,310 lines of legacy/duplicate styling and replaces the stack with a single 615-line ERP stylesheet plus a small base `index.css`. This materially reduces specificity wars and makes future tool-by-tool redesign deterministic.

## Verification

- Vercel preview build: READY
- No missing style imports after deleting all legacy style files
- No backend/database changes
- Existing Suite → Module → Tool navigation retained

## Rule for future tool revamps

Do not add another global override stylesheet. For each tool:

1. design the component structure intentionally;
2. use Tailwind/component-local classes or explicit reusable ERP primitives;
3. avoid `!important` unless required for print/browser behavior;
4. never target utility-class fragments globally;
5. test desktop, tablet, mobile, dark mode, modal/dropdown overflow, and print where relevant.
