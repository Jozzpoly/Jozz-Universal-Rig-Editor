# Agent rules

## Start here

- `main` is the canonical current project state. Read `README.md`, this file, `docs/ARCHITECTURE.md`, then `docs/STATUS.md` before changing code.
- Historical work/checkpoint branches are evidence, not current authority. Do not reconstruct the project from old branches, chats, M5/M6, or handoff packs unless current evidence requires it.
- When an explicit experimental branch/PR is active, resolve its exact purpose and base before writing. Do not transfer experimental authority back to `main` until the experiment is accepted and merged.

## Product direction

- JURE is a practical visual direct-manipulation authoring workbench for the owner's projects. Rig authoring remains an accepted product line; an experimental Map authoring lane may develop alongside it without turning JURE into a generic editor framework.
- JV/JV-Web are the first real rig and map consumers/falsifiers. Native JV and later JV/VAW use should remain possible without importing consumer runtime ontology into JURE authored truth.
- The owner should make geometric/interaction decisions in the tool; agents should handle implementation, math, adapters, diagnostics, and integration rather than guessing authored geometry from screenshots.

## Invariants

- Authored truth is document-specific. `RigDocument` owns authored rig truth; `MapDocument` owns authored map truth. SOURCE assets, Three objects, preview state, evaluated motion, and runtime observations are inputs/projections, never automatic authored truth.
- Keep `src/kernel` as the rig kernel independent of React, Three, browser APIs, and consumer runtimes. Do not move map ontology into the rig kernel merely to share names.
- `RigElement` / `RigFrame` rigid poses do not contain scale. Map entity placement is also rigid; primitive dimensions belong to geometry rather than transform scale.
- Source provenance and representation binding are different meanings. Never overload one to stand for the other.
- Source revision changes fail closed for exact binding/provenance claims; never silently retarget authored data.
- Camera/navigation is inspection infrastructure and must remain free of gameplay camera clamps.
- Owner acceptance is scoped only to what was actually inspected.
- `JvWorldData`, Box3D identities, Three scene objects and current JV scene packages are consumer/runtime representations, not JURE Map authored schemas.

## Working style

- Normal work is: small vertical slice -> targeted tests for real risk -> owner-visible gate when interaction matters -> small commit.
- Do not add a plugin system, ECS, asset database, generic hierarchy, physics framework, universal viewport, generic scene graph, or other infrastructure without a real second consumer proving the need.
- Share mechanics only after real consumers demonstrate the same invariant. The revisioned editor session is currently a justified shared mechanic; Rig and Map authored models remain separate.
- Borrow useful code/mechanics from JV, JES, VAW, HomeScan, or other owner repos when it saves work, but borrowed code never imports borrowed authority or ontology.
- Keep documentation small and canonical. Update/delete `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, or `docs/STATUS.md` instead of adding parallel plans/RFCs/handoffs.
- If access to one exact file is blocking useful work, ask the owner for that file early instead of spending a long time bypassing connector/environment limits.
- A build/typecheck is not an owner-visible interaction proof. For Map viewport work, keep source/tests/build evidence separate from browser rendering and owner manipulation evidence.
