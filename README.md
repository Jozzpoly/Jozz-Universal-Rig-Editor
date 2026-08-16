# Jozz Universal Rig Editor

JURE is an owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime or transient motion the authored truth.

## Repository authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` through draft PR #3;
- **active product work:** `work/real-jv-rig-elements` based exactly on that clean candidate;
- **active product review boundary:** draft PR #4;
- **latest fully validated product checkpoint:** resolve the exact SHA/run recorded in `docs/STATUS.md` before relying on rendered/product claims.

`main` does not move because CI is green. PR #3 remains an explicit Owner promotion decision. PR #2 / `work/real-use-foundation-recovery` retains the full recovery/foundation evidence history and is not the ordinary product-work head.

## Current foundation

The active line has one project/state/history path and now demonstrates:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- free Owner-facing `RigElement` creation with deterministic identity, selection and chronological Undo/Redo;
- exact SOURCE datum -> new authored `RigElement` origin with immutable source/adoption provenance;
- exact SOURCE datum -> authored owner-local `RigFrame` adoption;
- conservative geometry-derived construction **points** that do not invent orientation;
- deterministic constructed rigid frames from origin point + radial endpoint + independent exact up span;
- versioned self-resolving construction-frame locators containing all exact component locators;
- exact runtime re-resolution of a constructed locator from linked SOURCE bytes;
- transactional constructed-frame adoption through the existing project history;
- deterministic Save/Open preserving construction provenance and exact relink/re-resolution without a parallel recipe database;
- Move/Rotate, world/local, numeric XYZ-degree editing over quaternion storage;
- preview/commit/cancel;
- **one chronological `ProjectSession` Undo/Redo history** for SOURCE placement and authored project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- separate provisional mechanical-relation, representation and AUTHOR/TEST domains;
- viewport-first resizable/collapsible engineering workspace;
- reproducible locked dependency graph and explicit cross-platform real-source checkpoint gates.

The latest validated real-JV checkpoint proves on Linux Chrome and Windows Chrome that the exact one-sided JV SOURCE can reconstruct upper/lower wishbone hinge frames from self-describing recipes. The lower recipe survives explicit frame adoption, Save/Open and exact SOURCE relink while preserving the same locator and re-resolving the same rigid frame. Earlier exact `Chassis_Bottom -> Socket_SingleDamperLower` owner-local evidence also remains protected. See `docs/STATUS.md` for exact SHA/run evidence.

Historical shadow state/history implementations and the active BIND-00 runtime/UI path have been removed from the current tree. Git retains their evidence; they are not alternative APIs to extend.

The current UI is a working engineering harness, not final information architecture.

## Current product goal

The domain/runtime side of evidence-backed construction frames is now demonstrated. The immediate product slice is the smallest **Owner-reviewable construction-frame workflow**:

`choose exact/derived evidence -> inspect resulting origin/axes/provenance -> explicit Preview -> Commit | Cancel`

The recipe UI must remain generic. It may not assume that max-X is always “inboard”, that a node name defines final mechanical truth, or that the current JV M6 topology is JURE authority. Fixture-specific ordering belongs to real JV evidence/tests; the Owner-facing tool exposes the evidence components explicitly.

After that workflow is rendered and validated, independently ground the second authored body/frame at one real wishbone hinge. Only then create one real neutral `revolute`. Do not create the relation merely because one side is already known.

Do not simultaneously implement the whole suspension, arbitrary CAD/vertex picking, final representation vocabulary, consumer export or a kinematic solver. Each new authored concept must earn its place against the real mechanism.

JV/JV-Web remains the first real consumer and falsifier. Native JV and later JV/VAW experiments — plus non-vehicle mechanisms such as rotors, pistons, springs and thrusters — must remain possible without making JURE vehicle-specific or turning it into a generic simulation framework.

Foundation exits only when the Owner can take a real mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

## Development loop

Requires Node.js `>=22.12.0`; canonical CI/checkpoint tooling currently uses Node `24.16.0` and npm `11.17.0`.

Restore the exact committed dependency graph and start development:

```bash
npm ci
npm run dev
```

Use `npm install` only when intentionally changing dependencies/lockfile.

Targeted core validation accepts filename substrings:

```bash
npm run test:core -- project-session source-frame-adoption construction-frame exact-source-datum
npm run typecheck
```

All core tests:

```bash
npm run test:core
```

Normal checkpoint-quality semantic validation:

```bash
npm run check
```

CI has two intentional speeds:

- **Work check** — `npm ci` + `npm run check` on `main` / `work/**`; normal development gate.
- **Checkpoint browser gate** — explicit `checkpoint/**` or manual run; canonical install/check plus the pinned exact JV SOURCE path on Linux Chrome and Windows Chrome.

Rendered interaction changes require browser evidence; a passing build alone is not a UI/interaction PASS.

`RUN_EDITOR.cmd` is intentionally a fast Owner launcher. If dependencies are missing it restores them with `npm ci`; it does not re-run the complete validation suite every time the Owner wants to open JURE.

## Canonical docs

Read in this order before changing code:

1. `README.md` — product/repository entrypoint;
2. `AGENTS.md` — operating, authority and validation contract;
3. `docs/ARCHITECTURE.md` — durable technical boundaries;
4. `docs/STATUS.md` — current evidence, limitations and next slice.

Keep these documents small and current. Update/delete stale statements instead of adding parallel plans, RFC piles or routine handoff documents.

## Asset policy

Original assets authored by Jozzpoly may be used normally across the Owner's projects for development/testing. They remain the Owner's property and are not granted for standalone resale, relicensing or unrelated asset-pack redistribution without permission. Third-party code/assets retain their actual licenses and provenance.

Loading SOURCE never makes it authored rig truth.
