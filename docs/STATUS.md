# Status

Current: **element/frame interaction foundation OWNER ACCEPTED; SOURCE foundation in progress**.

Implemented:
- dependency-free RigDocument kernel with globally unique stable IDs;
- rigid `RigElement` pose + owner-local `RigFrame` pose;
- one shared element/frame selection + transform preview/commit path;
- resolved world view and `origin-coincident` residual diagnostics;
- preview/cancel + undo/redo;
- Move/Rotate, world/local and element/frame inspectors;
- guarded local RigDocument save/open;
- local glTF/GLB SOURCE reference with SHA-256 + deterministic read-only node inspection/locators, not authored adoption.

Owner gate accepted 2026-08-14: element selection/move/rotate, owned-frame propagation, independent frame editing, world/local, undo/redo, Esc cancellation and free camera inspection all passed in the real browser build.

Not yet claimed:
- foundation accepted;
- source adapter/locator/provenance/rebind contract frozen;
- representation stretch/deformation;
- JV lower mating solved;
- motion/runtime validation;
- native JV or VAW adapters.

Current SOURCE slice is bounded to read-only inspection and exact locator/provenance semantics. Explicit source registration/adoption/rebind and representation stretch remain separate later slices.
