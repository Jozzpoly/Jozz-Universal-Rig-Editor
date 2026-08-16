# Agent rules

## Entry protocol

Before changing code:

1. resolve the live refs for `main`, `work/real-use-foundation-recovery`, draft PR #2 and the latest checkpoint named in `docs/STATUS.md`;
2. read `README.md`, this file, `docs/ARCHITECTURE.md`, then `docs/STATUS.md` from the **active development line**;
3. inspect the diff from the latest validated product checkpoint to the active head so docs-only changes are not confused with new product behavior;
4. only then choose one small next slice.

Repository authority is intentionally layered:

- `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425` is the accepted product baseline;
- `work/real-use-foundation-recovery` / draft PR #2 is the active unmerged development authority;
- `checkpoint/ru1c-source-adoption-cross-platform-green-2026-08-16` freezes the latest fully validated product state (`7253b50f...`).

Do not start a new branch merely because a new conversation started. Continue the active line unless the task genuinely needs isolation or is an explicit promotion experiment. Do not merge/ready PR #2 or move `main` without explicit Owner promotion.

Closed PR #1, old work branches, old chats, handoff packs, M5/M6 and BIND-00 are evidence only. Read them only when the current repo leaves a concrete question unanswered.

## Product direction

JURE is a practical direct-manipulation spatial rigging workbench for the Owner's projects. JV/JV-Web is the first real consumer/falsifier; native JV and later JV/VAW use should remain possible without turning JURE into a generic framework.

The Owner defines product intent, spatial/mechanical meaning and validates how the tool feels/behaves. The agent owns technical analysis, implementation, math, adapters, diagnostics, tests and repository hygiene. Do not make the Owner reconstruct coordinates or debug compiler/runtime failures that can be reproduced automatically.

## Durable invariants

- `RigDocument` is authored rig truth. SOURCE assets, Three objects, preview state, evaluated motion and consumer/runtime observations never become authored truth automatically.
- Keep `src/kernel` independent of React, Three, browser APIs and consumer runtimes.
- `RigElement` / `RigFrame` mechanical poses are rigid position + quaternion rotation only. Scale/stretch/deformation belongs to representation/evaluation semantics.
- Source provenance, SourceInstance placement, historical adoption evidence and representation mapping are different meanings. Never overload one field/model to stand for another.
- Exact SOURCE claims use exact bytes + adapter identity/version; filename, URI and visual similarity are not identity. Revision changes fail closed instead of silently retargeting authored data.
- Camera/navigation is inspection infrastructure and remains free of gameplay camera clamps.
- Owner acceptance is scoped only to what was actually inspected. Automated/browser PASS and Owner-observed PASS are different evidence classes.

## Development loop

Default loop after foundation work:

`real need -> smallest vertical slice -> targeted validation -> rendered/Owner gate only when needed -> small commit -> next`

### 1. Targeted validation

For a local semantic change, run the smallest relevant core set first. `scripts/test-core.mjs` accepts filename substrings:

```bash
npm run test:core -- project-session
npm run test:core -- source-frame-adoption project-authoring
```

Add `npm run typecheck` when TypeScript/application boundaries changed.

Do not weaken tests to preserve an implementation. A failing test may be a stale assumption; classify the invariant before changing product code.

### 2. Rendered interaction changes

A build is not sufficient evidence for UI/interaction behavior. For changes involving viewport, React state transitions, gizmos, panels or browser I/O:

- define the exact user flow under test;
- reproduce the pre-fix failure when practical;
- exercise the rendered flow in Chrome/Playwright/available Browser tooling;
- capture runtime/page errors and verify the visible result;
- keep a permanent browser regression only when it protects a real recurring product invariant or a demonstrated bug.

Do not repeatedly use the Owner's Windows machine as the compiler/debugger when CI/browser automation can establish the same fact.

### 3. Checkpoint validation

Use:

```bash
npm run check
```

for kernel/schema/history/project-boundary changes and before meaningful checkpoint/promotion claims. The active CI additionally runs the real-source owner path on Linux and Windows Chrome.

Docs-only edits do not need a full browser gate.

## Scope discipline

- Do not add a plugin system, ECS, asset database, generic hierarchy, physics framework, own renderer, collaboration backend or other infrastructure without a demonstrated consumer.
- Prefer one real JV problem over speculative completeness. Use VAW/piston/rotor/cardans/etc. as falsifiers, not as reasons to implement every consumer now.
- Existing relation and representation vocabularies are provisional. Preserve the separation of domains; do not defend exact enum lists without real-use evidence.
- BIND-00 proved one narrow skin-joint bridge and falsified singleton storage. Do not revive it as current architecture or solve it by merely changing a singleton to an array.
- Current workspace layout is an engineering harness, not final UI authority. Preserve interaction mechanics that real Owner tests validated; change information architecture when real work justifies it.

## Reuse from other owner projects

Borrow useful mechanics/code from JV, JES, VAW, HomeScan or other Owner repos when it saves work, but inspect assumptions first.

Borrowed code never imports borrowed truth:

- JV M5/M6 does not become rig authority;
- JES ontology does not become JURE ontology;
- VAW Blueprint does not become `RigDocument`;
- renderer/runtime IDs do not become authored identity.

Prefer a small copied/adapted component with local tests over creating runtime dependencies between experimental repositories.

## Documentation and recovery

Canonical docs are only:

- `README.md`;
- `AGENTS.md`;
- `docs/ARCHITECTURE.md`;
- `docs/STATUS.md`.

Update/delete stale statements instead of adding `PLAN_FINAL_V2`, parallel roadmaps, RFC piles or routine handoff packs. Git/PR history is the historical archive.

Keep long work recovery-safe with small coherent commits. If a session can end unexpectedly, ensure `docs/STATUS.md` or PR #2 describes the last completed checkpoint before starting a risky next phase.

If access to one exact source file is blocking useful work, ask the Owner for that exact file/payload early instead of spending a long time bypassing connector/environment limits.

## Stop/ask conditions

Stop and involve the Owner when the next action would:

- promote/merge the active recovery line to `main`;
- redefine a fundamental authored semantic rather than a provisional implementation detail;
- overwrite or reinterpret existing Owner-accepted evidence;
- require a genuinely missing exact asset/data decision;
- publish third-party/private material with unclear rights.

Otherwise, make the technical decision, validate it and continue.
