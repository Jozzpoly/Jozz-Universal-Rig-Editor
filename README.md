# Jozz Universal Rig Editor

JURE is an owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime or transient motion the authored truth.

JURE is not intended to be an agent-operated preprocessing utility. Its core product goal is to let the Owner personally carry a supported rig from exact SOURCE inspection through mechanical/representation authoring, direct adjustment, diagnostics, kinematic TEST/Reset, Save/Open and deterministic consumer export. The agent may build the tooling and difficult math, but should not be a required operator for ordinary rig creation or correction.

JV/JV-Web is the first demanding consumer/falsifier and the current program priority. JURE is an optional authoring donor: it should provide trustworthy authored neutral geometry, relations, provenance and correction workflows when they improve JV-Web, without becoming a mandatory dependency or absorbing runtime physics/dynamics authority.

## Repository authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / closed unmerged PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully machine-validated donor:** `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4` / `checkpoint/donor-03b-synthesis-ready-2026-08-25` / run `32846835489`;
- **latest validation review boundary:** closed evidence-only PR #8, never merge;
- **previous donor checkpoint:** `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24@2af0e789d22eb4284e65ab2342ca933d21fe9315` / run `32782422063`;
- **historical paused product boundary:** closed PR #4; it is not the current review boundary.

`main` does not move because CI is green. PR #3 remains an explicit Owner promotion decision. Validation/recovery PRs are evidence laboratories only. Resolve exact SHA/run and current open gaps from `docs/STATUS.md` before relying on product claims.

## What the active line now proves

Using the pinned exact JV one-sided suspension SOURCE, the validated line demonstrates both a coherent neutral four-relation wishbone and a normal Owner-correction path through the workbench.

Validated capability includes:

- free and exact-SOURCE-derived `RigElement` authoring;
- exact SOURCE -> owner-local `RigFrame` adoption;
- conservative geometry-derived construction points without invented orientation;
- self-resolving constructed-frame recipes using exact component locators;
- Owner-facing recipe authoring with visible origin/axes/provenance and Preview/Commit;
- neutral `revolute` and `spherical` relations with diagnostics and one ProjectSession Undo/Redo history;
- transient single-revolute TEST separated from authored neutral truth;
- deterministic Save/Open and exact SOURCE relink;
- **DONOR-03A coherent neutral wishbone:** 4 authored elements, 8 independently owner-local frames, 2 inboard revolutes + 2 outboard sphericals, clean neutral diagnostics and 11 exact SOURCE adoption receipts;
- **DONOR-03B deterministic candidate:** the canonical coherent project is emitted directly from the proven builder and independently reopened/verified by a fresh process;
- **DONOR-03B Owner correction path:** normal `Open Project -> exact SOURCE relink -> frame correction -> spherical warning/residual -> Undo -> exact neutral recovery` passed on Linux and Windows.

DONOR-03B proves **Owner-correctability**, not final physical mating truth. The X-min wheel-end frames remain provenance-backed candidates, not Owner-accepted ball-joint centers. There is still no general multi-relation mechanism solver/evaluator, and none is required for the current donor claim.

Exact SHA/run evidence, pinned SOURCE identity, candidate identity and semantic boundaries are in `docs/STATUS.md`.

Historical shadow state/history implementations and the active BIND-00 runtime/UI path remain removed. Git history preserves their evidence; they are not alternative APIs to extend.

The current UI is a working engineering harness, not final information architecture.

## Current program state — synthesis-ready donor

The JURE donor has reached its current stop point. JV-Web ingested the exact DONOR-03A/03B evidence into its provisional cross-project Inheritance Matrix at `Jozzpoly/JV-Box3D-Web-experiment@b6f78369b7d245f73532d58b41d23d98f52862e4`.

Recipient verdict: **JURE has earned influence, not ownership.**

Therefore there is no automatic next JURE feature slice. Do **not** freeze a JURE -> JV-Web consumer schema/export, extend the kernel, build hierarchy/general solver, Map integration, generic picking/SOURCE isolation or new mechanical domains merely to make the donor look more complete.

Next material JURE work is triggered only by one of:

1. **Owner Physical Mating Gate** — the Owner chooses to inspect/correct the upper/lower outboard mating candidates, or cross-project synthesis needs that physical judgement;
2. **JV_CORE G-RIG + JV-Web synthesis** — sealed evidence proves a concrete authored-rig/lowering requirement;
3. **independent JURE priority** explicitly chosen by the Owner after the JV-Web priority program allows it.

A future consumer fragment must be designed from the combination of exact JURE evidence, sealed JV_CORE G-RIG physical truth and the live JV-Web recipient contract. Do not derive it from JURE alone, and do not make JURE a required runtime/build dependency.

JURE must remain useful for native JV/VAW and future non-vehicle mechanisms when real needs justify them. Do not hardcode current JV topology, Box3D IDs, solver configuration or vehicle-specific dynamics into the authored kernel.

Foundation still exits only when the Owner can take a real mechanism and, without agent-side coordinate guessing:

`place/inspect exact SOURCE -> create authored elements/frames/mechanical intent -> fit/map representation -> kinematically test/reset -> correct -> save/reopen -> export a small consumer-facing result`

The current donor closure does not claim that full foundation exit has been reached.

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
