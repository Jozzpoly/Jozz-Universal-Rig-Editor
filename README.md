# Jozz Universal Rig Editor

JURE is an owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime or transient motion the authored truth.

## Repository authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` through draft PR #3;
- **active product work:** `work/real-jv-rig-elements` based exactly on that clean candidate;
- **active product review boundary:** draft PR #4;
- **latest fully validated product checkpoint:** resolve the exact SHA/run recorded in `docs/STATUS.md` before relying on product claims.

`main` does not move because CI is green. PR #3 remains an explicit Owner promotion decision. PR #2 retains the full recovery/foundation evidence history and is not the ordinary product-work head.

## What the active line now proves

JURE has crossed from foundation plumbing into the first real authored mechanism cycle. Using the exact current JV one-sided suspension SOURCE, the validated line demonstrates:

`exact SOURCE -> authored bodies -> constructed hinge frames -> neutral revolute -> diagnostic -> transient TEST motion -> Reset -> exact AUTHORED`

The active architecture now includes:

- free and exact-SOURCE-derived `RigElement` authoring;
- exact SOURCE -> owner-local `RigFrame` adoption;
- conservative geometry-derived construction points;
- self-resolving constructed-frame recipes using exact component locators;
- Owner-facing recipe authoring with visible origin/axes/provenance and Preview/Commit;
- one physical lower-wishbone hinge represented on two independently authored bodies using the same measured recipe;
- a neutral `revolute` relation with no consumer dynamics or solver fields;
- non-solving revolute residual diagnostics for common origin and signed local `+Z` axis;
- a replaceable single-revolute TEST evaluator whose moving element is explicit disposable TEST configuration rather than durable parent/child semantics;
- transient real lower-arm rotation around the authored hinge and exact Reset to AUTHORED;
- deterministic Save/Open/relink and one chronological durable `ProjectSession` history.

Exact SHA/run evidence and the current limitations are in `docs/STATUS.md`.

Historical shadow state/history implementations and the active BIND-00 runtime/UI path remain removed. Git history preserves their evidence; they are not alternative APIs to extend.

The current UI is a working engineering harness, not final information architecture.

## Immediate product goal

Do **not** expand to the whole suspension yet. The next step is to make the already-proven mechanical cycle fully Owner-operable:

1. Owner-facing `revolute` creation over two authored frames, with neutral residual/axis diagnostics visible before commit;
2. relation creation as one existing `ProjectSession` action with Undo/Redo;
3. rendered exact-JV proof of that relation flow;
4. then a small TEST control for one selected revolute with explicit disposable moving-element choice;
5. rendered `0° -> +30° -> Reset`, with TEST controls never entering project history or AUTHORED truth.

Only after this local authoring/test loop is complete should JURE export a small neutral consumer payload and let private JV-Web become the next falsifier. The Friends public alpha remains a later controlled integration target, not the place to develop the authoring contract.

JURE must remain useful for native JV/VAW and non-vehicle mechanisms such as rotors, pistons, springs and thrusters. Do not hardcode current JV topology, Box3D IDs, solver configuration or vehicle-specific dynamics into the authored kernel.

Foundation exits when the Owner can take a real mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

## Development loop

Requires Node.js `>=22.12.0`; canonical CI/checkpoint tooling currently uses Node `24.16.0` and npm `11.17.0`.

```bash
npm ci
npm run dev
```

Use `npm install` only when intentionally changing dependencies/lockfile.

Targeted core validation accepts filename substrings, for example:

```bash
npm run test:core -- construction-frame revolute evaluation
npm run typecheck
```

Normal checkpoint-quality semantic validation:

```bash
npm run check
```

CI has two intentional speeds:

- **Work check** — `npm ci` + `npm run check` on `main` / `work/**`;
- **Checkpoint browser gate** — explicit `checkpoint/**` or manual run, including the pinned exact JV SOURCE and Linux/Windows Chrome probes.

Rendered interaction changes require browser evidence; a passing build alone is not a UI/interaction PASS.

`RUN_EDITOR.cmd` remains a fast Owner launcher. It may restore missing locked dependencies with `npm ci`; it does not rerun the full validation suite every time the Owner opens JURE.

## Canonical docs

Read in this order before changing code:

1. `README.md`;
2. `AGENTS.md`;
3. `docs/ARCHITECTURE.md`;
4. `docs/STATUS.md`.

Update stale statements rather than adding parallel plans or routine handoff documents.

## Asset policy

Original assets authored by Jozzpoly may be used normally across the Owner's projects for development/testing. They remain the Owner's property and are not granted for standalone resale, relicensing or unrelated asset-pack redistribution without permission. Third-party code/assets retain their actual licenses and provenance.

Loading SOURCE never makes it authored rig truth.
