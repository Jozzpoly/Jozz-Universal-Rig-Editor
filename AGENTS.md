# Agent rules

## Start here

- `main` is the canonical current project state. Read `README.md`, this file, `docs/ARCHITECTURE.md`, then `docs/STATUS.md` before changing code.
- Historical work/checkpoint branches are evidence, not current authority. Do not reconstruct the project from old branches, chats, M5/M6, or handoff packs unless current evidence requires it.

## Product direction

- JURE is a practical visual, direct-manipulation rigging workbench for the owner's projects. JV is the first real consumer; native JV and later JV/VAW use should remain possible without turning JURE into a generic framework.
- The owner should make geometric/interaction decisions in the tool; agents should handle implementation, math, adapters, diagnostics, and integration rather than guessing rig geometry from screenshots.

## Invariants

- Authored truth is `RigDocument`; SOURCE assets, Three objects, preview state, evaluated motion, and runtime observations are inputs/projections, never automatic authored truth.
- Keep `src/kernel` independent of React, Three, browser APIs, and consumer runtimes.
- `RigElement` / `RigFrame` rigid poses do not contain scale. Visual stretch/deformation belongs to representation/evaluation semantics.
- Source provenance and representation binding are different meanings. Never overload one to stand for the other.
- Source revision changes fail closed for exact binding/provenance claims; never silently retarget authored data.
- Camera/navigation is inspection infrastructure and must remain free of gameplay camera clamps.
- Owner acceptance is scoped only to what was actually inspected.

## Working style

- Normal work is: small vertical slice -> targeted tests for real risk -> owner-visible gate when interaction matters -> small commit.
- Do not add a plugin system, ECS, asset database, generic hierarchy, physics framework, or other infrastructure without a real consumer.
- Borrow useful code/mechanics from JV, JES, VAW, HomeScan, or other owner repos when it saves work, but borrowed code never imports borrowed authority or ontology.
- Keep documentation small and canonical. Update/delete `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, or `docs/STATUS.md` instead of adding parallel plans/RFCs/handoffs.
- If access to one exact file is blocking useful work, ask the owner for that file early instead of spending a long time bypassing connector/environment limits.
