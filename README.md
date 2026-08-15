# Jozz Universal Rig Editor

JURE is a local web workbench for visually authoring rig intent on real assets without making source files, renderer state, or runtime state the authored truth.

`main` is the canonical current state. The owner-tested foundation already includes rigid `RigElement` / local `RigFrame` authoring, Move/Rotate with preview/commit/cancel, world/local transforms, undo/redo, deterministic RigDocument save/open, read-only glTF/GLB SOURCE inspection, independent authored/SOURCE selection, and a viewport-first resizable workspace.

The repository also contains **BIND-00**, a deliberately limited transient proof that one exact glTF skin joint can be driven by an authored `RigElement` while SOURCE remains fixed. The real owner test passed that narrow claim and also falsified the prototype's single-global-binding model. BIND-00 is evidence for the next design phase, not the final representation architecture. See `docs/STATUS.md`.

## Project direction

The next fundamental problem is to design JURE as a practical universal rigging workbench for the owner's current projects: first JV/JV-Web, later potentially native JV and JV/VAW experiments. The tool must let the owner attach rig intent to real assets, author frames/pivots/hardpoints/relations, map multiple pieces of representation, and later test the mechanism kinematically without mutating authored neutral truth.

Do **not** continue BIND-00 by merely turning its singleton state into an array. Revisit the complete assembly/binding/motion workflow first.

## Run

Requires Node.js 22.12+.

```bash
npm install
npm run dev
```

Open the local Vite URL in current Chrome or Edge. File System Access is used for guarded Open/Save/Save As.

Fast checks:

```bash
npm run test:core
npm run typecheck
```

Checkpoint validation:

```bash
npm run check
```

## Canonical project docs

- `AGENTS.md` — project rules and working discipline.
- `docs/ARCHITECTURE.md` — durable technical boundaries.
- `docs/STATUS.md` — current evidence, open design questions, and next direction.

Do not create parallel roadmap/handoff documents unless there is a concrete recovery need that cannot be represented in these files.

## Asset policy

Original assets authored by Jozzpoly remain the property of Jozzpoly. They may be used normally for this project and its development, but are not granted for standalone resale, relicensing, or independent redistribution without the owner's permission. Third-party code/assets retain their actual licenses and provenance.

Loading a source asset never makes it authored rig truth.
