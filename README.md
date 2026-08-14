# Jozz Universal Rig Editor

A small local web workbench for authoring rig intent without making source assets, renderer state, or runtime state the authored truth.

Current foundation candidate supports first-class rigid `RigElement` and local `RigFrame` authoring through one selection/preview/commit interaction path, one `origin-coincident` relation, undo/redo, deterministic RigDocument serialization, guarded local save, and an optional local glTF/GLB **SOURCE-only** reference layer with deterministic read-only node inspection.

## Run

Requires Node.js 22.12+.

```bash
npm install
npm run dev
```

Then open the local Vite URL in current Chrome or Edge. File System Access is used for guarded Open/Save/Save As.

Fast checks:

```bash
npm run test:core
npm run typecheck
```

Full checkpoint (typecheck + core tests + Vite production build):

```bash
npm run check
```

## Asset policy

Original assets authored by Jozzpoly remain the property of Jozzpoly. They may be used as part of this project and its development workflow, but are not granted for standalone resale, relicensing, or independent redistribution without the owner's permission. Third-party code/assets must retain their actual license and provenance.

No source asset becomes authored rig truth merely by being loaded into the Workbench.
