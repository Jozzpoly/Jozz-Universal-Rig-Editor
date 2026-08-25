# Jozz Universal Rig Editor

JURE is an Owner-first local web workbench for authoring rig intent directly on real spatial assets without making SOURCE files, renderer state, consumer runtime or transient motion the authored truth.

JURE is not intended to be an agent-operated preprocessing utility. Its product goal is to let the Owner personally carry a supported rig from exact SOURCE inspection through authored elements/frames, mechanical and representation intent, direct correction, diagnostics, kinematic TEST/Reset, Save/Open and later deterministic consumer lowering. The agent may build the tooling and difficult math, but should not be a required operator for ordinary inspection or correction.

JV/JV-Web is the first demanding consumer/falsifier and the current program priority. JURE is an optional authoring donor: it should provide trustworthy neutral geometry, relations, provenance and correction workflows when they improve JV-Web, without becoming a mandatory dependency or absorbing runtime physics/dynamics authority.

## Repository authority

- **accepted baseline:** `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- **clean foundation candidate:** `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / closed unmerged PR #3;
- **active product work:** `work/real-jv-rig-elements`;
- **latest fully machine/browser-validated product:** `a8c27d246e95d666f4080c964db4238a14290a49` / `checkpoint/ux01-safe-inspect-2026-08-25` / run `32887238782`;
- **validated product tree:** `e0d020564c808467a05ac510c39d84c6943a56ec`;
- **frozen DONOR-03B geometry/correction boundary:** `53ce6cc31233cfe1b45d41081c7b58d4c8baa5c4` / `checkpoint/donor-03b-synthesis-ready-2026-08-25` / run `32846835489`;
- **Owner physical-mating prep:** `checkpoint/owner-mating-prep-2026-08-25@99c54d8311470791b60c2dfe849f66e5bb9feb6f` / run `32866147643`;
- **previous DONOR-03A checkpoint:** `checkpoint/donor-03a-coherent-neutral-wishbone-2026-08-24@2af0e789d22eb4284e65ab2342ca933d21fe9315` / run `32782422063`.

`main` does not move because CI is green. PR #3 remains an explicit Owner promotion decision. Validation/checkpoint branches are evidence boundaries only. Resolve exact live refs and `docs/STATUS.md` before treating any branch head as authority.

## What the validated line proves

Using the pinned exact JV one-sided suspension SOURCE, the validated line demonstrates a coherent neutral four-relation wishbone, deterministic persistence/relink, a normal Owner correction path and now a machine/browser-proven safe-inspection gate.

Validated capability includes:

- free and exact-SOURCE-derived `RigElement` authoring;
- exact SOURCE -> owner-local `RigFrame` adoption;
- conservative geometry-derived construction points without invented orientation;
- self-resolving constructed-frame recipes using exact component locators;
- Owner-facing neutral `revolute` and `spherical` relations with diagnostics and one `ProjectSession` Undo/Redo history;
- transient single-revolute TEST separated from authored neutral truth;
- deterministic Save/Open and exact SOURCE relink;
- **DONOR-03A coherent neutral wishbone:** 4 authored elements, 8 independently owner-local frames, 2 inboard revolutes + 2 outboard sphericals, clean neutral diagnostics and 11 exact SOURCE adoption receipts;
- **DONOR-03B correction path:** `Open Project -> exact SOURCE relink -> frame correction -> spherical warning/residual -> Undo -> exact neutral recovery` on Linux and Windows;
- **UX01-SAFE-INSPECT:** ordinary authored selection is inspection-only until the Owner explicitly chooses `Edit pose`; arming edit changes neither authored revision nor project history, while actual edits still use the existing ProjectSession path.

Exact SHA/run evidence, pinned SOURCE/candidate identity and semantic boundaries are in `docs/STATUS.md`.

## Owner usability evidence

The first manual physical-mating run on the frozen DONOR-03B package was blocked before a reliable physical verdict:

> **OWNER-MATING-01 = BLOCKED_TASK_CLARITY / INFORMATION_ARCHITECTURE**

A later controlled clarity falsifier kept the frozen candidate/SOURCE/product unchanged and asked the Owner only to inspect the known upper/lower outboard mating pairs. The recording directly demonstrated a narrower causal blocker: ordinary selection immediately exposed transform authoring, and an inspection-only session accumulated five durable authored revisions. The run therefore established:

> **BLOCKED_SAFE_INSPECTION — directly demonstrated**

The Owner also reported that the four large authored element proxies appeared to be in the expected places relative to SOURCE. This is positive **coarse placement evidence**, not yet exact acceptance of the two spherical X-min mating coordinates.

SAFE-INSPECT was implemented as the smallest response to that evidence and passed the full checkpoint browser gate on Linux and Windows at `a8c27d24...`. No kernel, SOURCE authority, ProjectSession, relation semantics, project schema or JV-Web runtime contract was changed.

## Current program state — SAFE-INSPECT validated, broader UX conditional

The next step is **not** to automatically implement the rest of the earlier UX-01 proposal.

The next high-information gate is a real Owner recheck on the exact validated SAFE-INSPECT build using the unchanged frozen DONOR-03B candidate and exact SOURCE:

1. Open/relink the frozen project.
2. Orbit and select authored elements/frames without pressing `Edit pose`.
3. Confirm that ordinary selection remains non-authoring and the project revision/history stays unchanged.
4. Reattempt the physical upper/lower outboard mating judgement.
5. Only if a real correction is desired, enter `Edit pose` explicitly and verify correction/Undo remains understandable.

What happens after that depends on evidence:

- if physical judgement is now possible, record it and stop expanding JURE UX by default;
- if relation pairing remains unclear, consider the smallest relation-readability slice;
- if visibility, selection or representation is the proven blocker, address only that blocker;
- if no dominant cause emerges, classify the result as inconclusive rather than bundling multiple UI changes.

`WorkspaceTaskContext`, general relation overlays, generic picking/visibility systems and full representation binding are therefore **hypotheses**, not a fixed roadmap.

Physical X-min mating remains Owner-open until a clean relation-specific judgement is obtained and later challenged against sealed JV_CORE G-RIG evidence. Machine zero residual is not physical authority.

## Cross-project boundary

JV-Web has ingested the DONOR-03A/03B evidence into its provisional Inheritance Matrix. Recipient verdict remains:

> **JURE has earned influence, not ownership.**

Do not use JURE as a reason to freeze a shared schema, direct `RigDocument` runtime intake, a general solver or a mandatory Web dependency. Future consumer lowering must be designed from exact JURE evidence + sealed JV_CORE physical/mechanical evidence + the live JV-Web recipient contract.

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
- **Checkpoint browser gate** — full pinned exact-JV Linux/Windows Chrome evidence on `checkpoint/**`, manual dispatch, and explicitly listed isolated validation PR bases used only as observable evidence laboratories.

Rendered interaction changes require browser evidence; a passing build alone is not a UI/interaction PASS.

`RUN_EDITOR.cmd` remains a fast Owner launcher. It may restore missing locked dependencies with `npm ci`; it does not rerun the full validation suite every time the Owner opens JURE.

## Canonical docs

Read in this order before changing code:

1. `README.md`;
2. `AGENTS.md`;
3. `docs/ARCHITECTURE.md`;
4. `docs/STATUS.md`.

Update stale statements rather than adding parallel plans or routine handoff documents. A new conversation should continue from the active work line and current `docs/STATUS.md`; do not create a new branch solely because chat changed.

## Asset policy

Original assets authored by Jozzpoly may be used normally across the Owner's projects for development/testing. They remain the Owner's property and are not granted for standalone resale, relicensing or unrelated asset-pack redistribution without permission. Third-party code/assets retain their actual licenses and provenance.

Loading SOURCE never makes it authored rig truth.
