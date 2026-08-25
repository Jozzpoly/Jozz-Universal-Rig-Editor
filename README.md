# Jozz Universal Rig Editor

JURE is an owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime or transient motion the authored truth.

JURE is not intended to be an agent-operated preprocessing utility. Its core product goal is to let the Owner personally carry a supported rig from exact SOURCE inspection through mechanical/representation authoring, direct adjustment, diagnostics, kinematic TEST/Reset, Save/Open and deterministic consumer export. The agent may build the tooling and difficult math, but should not be a required operator for ordinary rig creation or correction.

JV/JV-Web is the first demanding consumer/falsifier and the main near-term product partner. JURE should make it practical to build and repair exact vehicle rigs for JV — including part fit, suspension/steering relationships and moving representation such as dampers/springs — while JV remains responsible for runtime physics, force laws, solver state, controls and rendering integration. The same authoring architecture should remain usable for future vehicle rigs and, when real use justifies it, other mechanisms.

## Repository authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / closed unmerged PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully validated product:** `2af0e789d22eb4284e65ab2342ca933d21fe9315` / `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24` / run `32782422063`;
- **latest validation review boundary:** closed evidence-only PR #7, never merge;
- **historical paused product boundary:** closed PR #4; it is not the current review boundary.

`main` does not move because CI is green. PR #3 remains an explicit Owner promotion decision. Validation/recovery PRs are evidence laboratories only. Resolve exact SHA/run and current open gaps from `docs/STATUS.md` before relying on product claims.

## What the active line now proves

Using the pinned exact JV one-sided suspension SOURCE, the validated line demonstrates both a complete small Owner-operated hinge path and a coherent neutral four-relation wishbone at the model/evidence level.

Small Owner-operated hinge path:

`exact SOURCE -> authored bodies -> authored hinge frames -> Owner revolute -> diagnostic -> transient Owner TEST -> Reset -> exact AUTHORED -> Undo/Redo`

Validated capability now includes:

- free and exact-SOURCE-derived `RigElement` authoring;
- exact SOURCE -> owner-local `RigFrame` adoption;
- conservative geometry-derived construction points without invented orientation;
- self-resolving constructed-frame recipes using exact component locators;
- Owner-facing recipe authoring with visible origin/axes/provenance and Preview/Commit;
- a neutral `revolute` relation with origin/+Z residual diagnostics and Owner Undo/Redo;
- a replaceable single-revolute TEST evaluator whose moving element is disposable TEST configuration rather than durable parent/child semantics;
- Owner TEST `0° -> +30° -> Reset -> End TEST` without mutating authored neutral truth or durable history;
- neutral `spherical` semantics constraining shared origin only, with origin-residual diagnostics and Owner `+ Spherical` authoring;
- one chronological durable `ProjectSession` history;
- deterministic Save/Open and exact SOURCE relink;
- **coherent neutral wishbone:** 4 authored elements, 8 independently owner-local frames, 2 inboard revolutes + 2 outboard sphericals, clean neutral diagnostics, 11 exact SOURCE adoption receipts and deterministic Save/Open/relink.

DONOR-03A does **not** prove final physical ball-joint placement or closed-loop double-wishbone motion. The X-min wheel-end frames remain provenance-backed mating candidates until the Owner inspects or corrects them in the normal workbench. There is still no multi-relation mechanism solver/evaluator.

Exact SHA/run evidence, pinned SOURCE identity and detailed semantic boundaries are in `docs/STATUS.md`.

Historical shadow state/history implementations and the active BIND-00 runtime/UI path remain removed. Git history preserves their evidence; they are not alternative APIs to extend.

The current UI is a working engineering harness, not final information architecture.

## Immediate product goal

The next stage is **DONOR-03B — Owner Candidate Inspection & Correction**. Do not expand the kernel, hierarchy, solver or visibility tooling before this gate produces evidence.

1. derive a normal JURE project candidate directly from the already-validated coherent-wishbone serialization rather than reconstructing coordinates by hand;
2. validate the candidate file independently as canonical 4-element / 8-frame / 4-relation authored truth with exact provenance;
3. prove the normal browser path `Open Project -> exact SOURCE relink -> inspect/edit -> diagnostic warning -> Undo` on Linux and Windows;
4. present that machine-proven **CANDIDATE / NOT AUTHORITY** project to the Owner;
5. let the Owner accept, correct or identify a concrete blocker in the proposed outboard mating frames;
6. only a demonstrated blocker may justify the next minimal feature such as SOURCE isolate, better picking or clearer relation visualization;
7. only after Owner-accepted/corrected mating is saved/reopened/relinked should JURE freeze a small deterministic neutral donor fragment for JV.

The Friends public alpha remains a later controlled integration target, not the place to develop the authoring contract.

JURE must remain useful for native JV/VAW and non-vehicle mechanisms such as rotors, pistons, springs and thrusters. Do not hardcode current JV topology, Box3D IDs, solver configuration or vehicle-specific dynamics into the authored kernel.

Foundation exits when the Owner can take a real mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> fit/map representation -> kinematically test/reset -> correct -> save/reopen -> export a small consumer-facing result`

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
- **Checkpoint browser gate** — full pinned exact-JV Linux/Windows Chrome evidence on `checkpoint/**`, manual dispatch, and explicitly listed isolated `validation/**` PR bases used only as observable evidence laboratories.

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
