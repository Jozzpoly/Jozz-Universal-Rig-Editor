# Jozz Universal Rig Editor

JURE is an owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime or transient motion the authored truth.

## Repository authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` through draft PR #3;
- **active product work:** `work/real-jv-rig-elements` based exactly on that clean candidate;
- **active product review boundary:** draft PR #4;
- **latest frozen product checkpoint:** resolve the exact checkpoint named in `docs/STATUS.md` before relying on rendered/product claims.

`main` does not move because CI is green. PR #3 remains an explicit Owner promotion decision. PR #2 / `work/real-use-foundation-recovery` retains the full recovery/foundation evidence history and is not the ordinary product-work head.

## Current foundation

The active line now has one active project/state/history path and demonstrates:

- rigid `RigElement` and owner-local/root `RigFrame` authoring;
- free Owner-facing `RigElement` creation with deterministic identity, immediate selection and chronological Undo/Redo;
- **exact SOURCE datum -> new authored `RigElement` origin** with immutable source/adoption provenance;
- exact SOURCE datum -> authored owner-local `RigFrame` adoption;
- Move/Rotate, world/local, numeric XYZ-degree editing over quaternion storage;
- preview/commit/cancel;
- **one chronological `ProjectSession` Undo/Redo history** for SOURCE placement and authored project changes;
- exact immutable `SourceRevision` identity and independently placed `SourceInstance`s;
- read-only glTF/GLB SOURCE inspection with deterministic locators, marker/axes and independent SOURCE selection;
- deterministic logical project save/open and exact SOURCE relink boundaries;
- separate provisional mechanical-relation, representation and AUTHOR/TEST domains;
- viewport-first resizable/collapsible engineering workspace;
- reproducible npm dependency graph through committed `package-lock.json`;
- fast automated work validation plus explicit cross-platform real-source checkpoint gates.

The current exact real-JV checkpoint proves on Linux Chrome and Windows Chrome that an element can be created at `Chassis_Bottom`, then exact child `Socket_SingleDamperLower` can be adopted as its frame while preserving the glTF owner-local translation `[-1.125, 0, -0.8125]` even after moving the whole SOURCE instance. See `docs/STATUS.md` for the exact SHA/run evidence.

Historical shadow state/history implementations and the active BIND-00 runtime/UI path have been removed from the current tree. Git retains their evidence; they are not alternative APIs to extend.

The current UI is a working engineering harness, not final information architecture.

## Current product goal

The generic Owner-created-element and exact SOURCE-derived element-origin slices are now demonstrated. The next high-value slice is to identify the **smallest second real component/interface in the one-sided JV steering/suspension SOURCE** that supports one justified neutral mechanical relation.

Do not infer final mechanical meaning solely from node names or copy the current JV M6 topology into authored truth. First separate:

- exact SOURCE hierarchy/poses/axes;
- Owner evidence and current secondary semantic contracts;
- provisional JV runtime assumptions.

Start from exact existing SOURCE sockets/axes. Add arbitrary geometry picking or virtual/derived construction datums only when a concrete required JV hardpoint cannot be represented by those exact datums.

Do not simultaneously implement the whole suspension, final representation vocabulary, consumer export or a kinematic solver. Each new authored concept must earn its place against the real JV mechanism.

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
npm run test:core -- project-session source-frame-adoption source-element-adoption
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
