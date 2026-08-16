# Jozz Universal Rig Editor

JURE is an owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime, or transient motion the authored truth.

## Repository authority

JURE deliberately distinguishes an accepted baseline from active unmerged development:

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **active development line:** `work/real-use-foundation-recovery` through draft PR #2;
- **latest fully validated product checkpoint:** `7253b50f9f41ee9467dda6399c8c7e8e58757c23`;
- **frozen checkpoint for that validated state:** `checkpoint/ru1c-source-adoption-cross-platform-green-2026-08-16`.

Normal continuation work belongs on the active development line unless the task is explicitly a promotion/reconstruction audit. `main` must not be silently treated as containing the newer RU-1 project/source workflow until PR #2 is explicitly promoted.

Closed PR #1, old `work/*` branches, recovery ZIPs, old chats, JV M5/M6 and BIND-00 are historical evidence only. Do not reconstruct current truth from them when the active branch and canonical docs answer the question.

## What currently works

The active development line contains:

- rigid `RigElement` and owner-local `RigFrame` authoring;
- Move/Rotate, world/local, numeric XYZ-degree editing over quaternion storage;
- preview/commit/cancel and one chronological project Undo/Redo history;
- deterministic logical project save/open;
- exact `SourceRevision` identity and independently placed `SourceInstance`s;
- read-only glTF/GLB SOURCE inspection with deterministic locators, marker/axes and independent SOURCE selection;
- explicit SOURCE datum -> authored `RigFrame` adoption with immutable provenance/evidence;
- exact SOURCE relink boundaries;
- separate experimental mechanical-relation, representation and AUTHOR/TEST boundaries;
- viewport-first resizable/collapsible engineering workspace;
- automated real-source browser regression on Linux and Windows Chrome.

The current UI is a working engineering harness, not final information architecture. BIND-00 remains historical proof only and is quarantined from the normal owner workflow.

## Current product goal

The next high-value step is to stop relying on synthetic pre-existing rig elements and let the Owner begin constructing a real JV mechanism from exact SOURCE evidence: create authored `RigElement`s, add/adopt the frames they need, then grow mechanical intent only where the real mechanism demands it.

JV/JV-Web is the first real consumer and falsifier. Native JV and later JV/VAW experiments should remain possible without turning JURE into a generic framework or mini-JES.

Foundation exits only when the Owner can take a real JV mechanism and, without agent-side coordinate guessing, inspect/place SOURCE, author the required rig, map representation, kinematically test/reset, save/reopen and produce a small consumer-facing result.

## Development loop

Requires Node.js `>=22.12.0`.

```bash
npm install
npm run dev
```

Fast targeted core validation accepts filename substrings:

```bash
npm run test:core -- project-session source-frame-adoption
npm run typecheck
```

Run all core tests with:

```bash
npm run test:core
```

Checkpoint validation:

```bash
npm run check
```

Rendered interaction changes require browser evidence; a passing build alone is not a UI/interaction PASS. The active branch CI also exercises the real `OneSided_Steering_Suspension_Rig.gltf` owner path on Linux and Windows Chrome.

There is currently no committed `package-lock.json`; direct dependencies are exact-pinned, but transitive installs are not yet fully reproducible. Add a lockfile only from a known-good canonical install rather than manufacturing one manually.

## Canonical docs

Read in this order before changing code:

1. `README.md` — product and repository entrypoint;
2. `AGENTS.md` — working/validation/authority rules;
3. `docs/ARCHITECTURE.md` — durable technical boundaries;
4. `docs/STATUS.md` — current evidence, limitations and next slice.

Keep these documents small and current. Update or delete stale statements instead of adding parallel roadmaps, RFC piles or handoff documents.

## Asset policy

Original assets authored by Jozzpoly remain the property of Jozzpoly and may be used normally across the owner's projects for development/testing. They are not granted for standalone resale, relicensing or unrelated asset-pack redistribution without permission. Third-party code/assets retain their actual licenses and provenance.

Loading a source asset never makes it authored rig truth.
