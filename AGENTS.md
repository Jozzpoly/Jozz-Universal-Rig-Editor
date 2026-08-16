# Agent rules

## Entry protocol

Before changing code:

1. resolve live refs for `main`, draft PR #3 / `promotion/foundation-ready-squash-2026-08-16`, the active product work branch named in `docs/STATUS.md`, and the latest checkpoint named there;
2. read `README.md`, this file, `docs/ARCHITECTURE.md`, then `docs/STATUS.md` from the **active product work line**;
3. compare the active head with the latest frozen checkpoint so documentation/workflow changes are not confused with new product behavior;
4. only then choose one small next slice.

Repository authority is deliberately layered:

- `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425` is the accepted baseline until explicit Owner promotion;
- `promotion/foundation-ready-squash-2026-08-16@4db04eee4da0216f6bd3df6b6b0c82aa20afab5a` / draft PR #3 is the clean one-commit foundation candidate, not accepted `main`;
- `work/real-jv-rig-elements` is the current isolated product-work line based exactly on that clean candidate;
- the current frozen product checkpoint is named in `docs/STATUS.md` and must be resolved live before relying on it.

PR #2 / `work/real-use-foundation-recovery` retains the full recovery/foundation evidence history. It is no longer the ordinary product-work head; use it when historical evidence is required.

Do not create a new branch merely because a new conversation started. Continue the active line unless the task genuinely requires isolation. Do not merge/ready PR #3, rewrite the recovery evidence, or move `main` without explicit Owner promotion.

Closed PR #1, old branches/chats/handoff packs, JV M5/M6 and BIND-00 are evidence only. Read them only when current code/docs leave a concrete question unanswered.

## Product direction

JURE is a practical direct-manipulation spatial rigging workbench for the Owner's projects. JV/JV-Web is the first real consumer/falsifier; native JV and later JV/VAW use should remain possible without turning JURE into a generic framework.

The Owner defines product intent, spatial/mechanical meaning and validates how the tool feels/behaves. The agent owns technical analysis, implementation, math, adapters, diagnostics, tests and repository hygiene. Do not make the Owner reconstruct coordinates or debug compiler/runtime failures that automation can reproduce.

**Owner end-to-end authoring is a product invariant.** JURE must not settle into an agent-operated preprocessing step where the Owner can only describe the desired rig and an agent must repeatedly edit coordinates or consumer code to realize it. For mechanisms JURE claims to support, the Owner should be able to load/inspect exact SOURCE, create and adjust authored parts/frames/relations, fit representation, inspect diagnostics, kinematically test/reset, correct the rig, save/reopen and export the deterministic authored result through JURE itself. The agent may build the tooling, derive difficult math, automate repetition and help investigate failures, but it must not remain a mandatory rig-authoring operator. Repeated difficult rigging operations should become inspectable Owner workflows.

JV and JURE are intentionally complementary. Near-term JURE product work should be driven by the real needs of the JV vehicle rig: exact part fit, suspension/steering mechanisms, representation mappings and moving assemblies such as dampers/springs. JV remains authority for runtime physics, forces, solver state, controls and rendering integration.

## Durable invariants

- `RigDocument` is authored rig truth. SOURCE assets, Three objects, preview state, evaluated motion and consumer/runtime observations never become authored truth automatically.
- Keep `src/kernel` independent of React, Three, browser APIs and consumer runtimes.
- `RigElement` / `RigFrame` mechanical poses are rigid position + quaternion rotation only. Scale/stretch/deformation belongs to representation/evaluation semantics.
- Source provenance, SourceInstance placement, historical adoption evidence and representation mapping are different meanings. Never overload one field/model to stand for another.
- Exact SOURCE claims use exact bytes + adapter identity/version; filename, URI and visual similarity are not identity. Revision changes fail closed instead of silently retargeting authored data.
- `ProjectSession` is the **single durable preview/history owner** for active JURE project workflows. Do not introduce a second rig-only Undo/Redo stack.
- `RigCommand` is only a pure authored-rig mutation contract; it is not a session/history abstraction.
- Camera/navigation is inspection infrastructure and remains free of gameplay camera clamps.
- Owner acceptance is scoped only to what was actually inspected. Automated/browser PASS and Owner-observed PASS are different evidence classes.

## Active ownership map

Current active state paths are intentionally singular:

- `src/kernel/*` — authored rig types, validation, math, resolution, serialization;
- `src/project/*` — project authority, SourceRevision/SourceInstance, commands, `ProjectSession`, adoption;
- `src/editor/rig-command.ts` + `transform-target.ts` — pure rig command/transform contracts only;
- `src/features/rig-elements/*` — pure authored `RigElement` creation mutations;
- `src/representation/*` — separate provisional representation domain;
- `src/evaluation/*` — transient TEST/evaluator boundary;
- `src/app/state/project-authoring.ts` — active operation + selection + ProjectSession orchestration;
- `src/app/state/rig-element-workflow.ts` — Owner element ID allocation + project-level creation orchestration;
- `src/app/state/project-source-runtime.ts` — exact linked SOURCE bytes, active instance and SOURCE selection;
- `src/app/state/source-workflow.ts` — Open Source planning/identity workflow;
- `src/io/*` — project/source/legacy-rig browser I/O;
- `src/render/*` — Three/display interaction bridge;
- `src/app/workspace/*` — disposable presentation/workspace UI.

Historical `RigAuthoringState`, singleton `SourceRuntimeState`, FC-8 workspace state, `EditorSession` and active BIND-00 runtime/UI have been removed from the current tree. Do not reconstruct them as convenient alternatives; use Git history only when investigating their historical evidence.

## Dependency/toolchain discipline

`package-lock.json` is generated from the canonical Node 24.16.0 / npm 11.17.0 environment and is part of repository truth.

Normal environment restoration uses:

```bash
npm ci
```

Use `npm install` only when intentionally changing dependencies/lockfile. Do not delete/regenerate the lockfile merely to fix a local install problem; first classify whether the toolchain or dependency declaration actually changed.

Minimum supported Node remains `>=22.12.0`; CI is the canonical reproducibility environment.

## Development loop

Permanent target rhythm:

`real need -> smallest vertical slice -> targeted validation -> rendered/Owner gate only when it adds information -> small commit -> next`

### Targeted local validation

For a semantic change, run the smallest relevant core set first:

```bash
npm run test:core -- project-session
npm run test:core -- source-frame-adoption project-authoring
```

Add `npm run typecheck` when TypeScript/application boundaries changed.

Do not weaken tests to preserve an implementation. A failing test may encode a stale architecture; classify the invariant before changing product code.

### Work check

Normal `main` / `work/**` pushes run the lightweight GitHub **Work check**:

`npm ci -> npm run check`

This is the default automation for ordinary development. It deliberately does not run Linux+Windows browser probes on every commit.

### Rendered interaction and checkpoint validation

A build is not sufficient evidence for viewport/React/gizmo/browser-I/O behavior.

For meaningful interaction changes:

- define the exact user flow;
- reproduce a pre-fix failure when practical;
- exercise the rendered path;
- treat runtime fault, `pageerror` and unexpected `console.error` as failures;
- keep permanent browser regression only for real recurring invariants/demonstrated bugs.

The GitHub **Checkpoint browser gate** runs on `checkpoint/**` (or manual dispatch). It performs locked canonical validation plus the pinned real JV SOURCE path on Linux Chrome and Windows Chrome.

Use an explicit checkpoint when making a takeover/promotion claim or after a meaningful interaction boundary—not after every tiny commit.

Do not repeatedly use the Owner's Windows machine as compiler/debugger when automation can establish the fact.

## Scope discipline

- Do not add a plugin system, ECS, asset database, generic hierarchy, physics framework, custom renderer, collaboration backend or other infrastructure without a demonstrated consumer.
- Prefer one real JV problem over speculative completeness. Use VAW/piston/rotor/cardans/etc. as falsifiers, not reasons to implement every consumer now.
- Existing relation and representation vocabularies are provisional. Preserve the domain boundaries; do not defend exact enum lists without real-use evidence.
- BIND-00 proved one narrow skin-joint bridge and falsified singleton storage. Its active implementation is gone. Do not recreate it or solve it by merely changing a singleton to an array.
- Current workspace is an engineering harness, not final UI authority. Preserve interaction mechanics that real Owner tests validated; change information architecture when real work justifies it.

## Reuse from other Owner projects

Borrow useful mechanics/code from JV, JES, VAW, HomeScan or other Owner repos when it saves work, but inspect assumptions first.

Borrowed code never imports borrowed truth:

- JV M5/M6 does not become rig authority;
- JES ontology does not become JURE ontology;
- VAW Blueprint does not become `RigDocument`;
- renderer/runtime IDs do not become authored identity.

Prefer a small copied/adapted component with local tests over runtime dependencies between experimental repositories.

## Documentation and recovery

Canonical docs are only:

- `README.md`;
- `AGENTS.md`;
- `docs/ARCHITECTURE.md`;
- `docs/STATUS.md`.

Update/delete stale statements instead of adding `PLAN_FINAL_V2`, parallel roadmaps, RFC piles or routine handoff packs. Git/PR/checkpoints are the historical archive.

Keep long work recovery-safe with small coherent commits. Before a risky phase, make sure the current completed checkpoint is recoverable through Git/PR; do not write a large handoff as a substitute for repository hygiene.

If access to one exact source file blocks useful work, ask the Owner for that exact file/payload early instead of spending a long time bypassing connector/environment limits.

## Stop/ask conditions

Stop and involve the Owner when the next action would:

- promote/merge the active line to `main`;
- redefine a fundamental authored semantic rather than a provisional implementation detail;
- overwrite/reinterpret existing Owner-accepted evidence;
- require a genuinely missing exact asset/data decision;
- publish third-party/private material with unclear rights.

Otherwise make the technical decision, validate it and continue.
