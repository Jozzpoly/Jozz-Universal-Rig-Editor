# Jozz Universal Rig Editor

JURE is an owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime or transient motion the authored truth.

## Repository authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **active development authority:** `work/real-use-foundation-recovery` through draft PR #2;
- **latest frozen clean takeover checkpoint:** `checkpoint/foundation-clean-takeover-2026-08-16`;
- **final promotion-readiness checkpoint:** resolve the current checkpoint named in `docs/STATUS.md` before acting on promotion claims.

Normal continuation belongs on the active development line until the Owner explicitly promotes PR #2. Do not start a new branch merely because a new conversation started, and do not silently move `main` because CI is green.

Closed PR #1, old work branches, recovery packs, chats, JV M5/M6 and BIND-00 are historical evidence only. Current truth comes from the active branch plus the four canonical documents below.

## Current foundation

The active line now has one active project/state/history path:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- Move/Rotate, world/local, numeric XYZ-degree editing over quaternion storage;
- preview/commit/cancel;
- **one chronological `ProjectSession` Undo/Redo history** for SOURCE placement and authored project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- read-only glTF/GLB SOURCE inspection with deterministic locators, marker/axes and independent SOURCE selection;
- explicit verified SOURCE datum -> authored `RigFrame` adoption with immutable historical evidence;
- deterministic logical project save/open and exact SOURCE relink boundaries;
- separate provisional mechanical-relation, representation and AUTHOR/TEST domains;
- viewport-first resizable/collapsible engineering workspace;
- reproducible npm dependency graph through committed `package-lock.json`;
- fast automated work validation plus explicit cross-platform real-source checkpoint gates.

Historical shadow state/history implementations and the active BIND-00 runtime/UI path have been removed from the current tree. Git retains their evidence; they are not alternative APIs to extend.

The current UI is a working engineering harness, not final information architecture.

## Current product goal

The next high-value product slice is to stop relying on synthetic pre-existing rig elements and let the Owner begin constructing a real JV mechanism from exact SOURCE evidence:

**create authored `RigElement`s -> add/adopt their frames -> express only the mechanical intent the real mechanism requires.**

JV/JV-Web is the first real consumer and falsifier. Native JV and later JV/VAW experiments should remain possible without making JURE vehicle-specific or turning it into a generic framework/mini-JES.

Foundation exits only when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> map representation -> kinematically test/reset -> save/reopen -> export a small consumer-facing result`

## Development loop

Requires Node.js `>=22.12.0`.

Restore the exact committed dependency graph and start development:

```bash
npm ci
npm run dev
```

Use `npm install` only when intentionally changing dependencies/lockfile.

Targeted core validation accepts filename substrings:

```bash
npm run test:core -- project-session source-frame-adoption
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
- **Checkpoint browser gate** — explicit `checkpoint/**` or manual run; locked canonical install/check plus the pinned real JV SOURCE browser path on Linux Chrome and Windows Chrome.

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
