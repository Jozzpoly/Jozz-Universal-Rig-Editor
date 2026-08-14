# Status

Current: **element/frame interaction and read-only SOURCE spatial inspection OWNER ACCEPTED; foundation still open for UX, binding and motion semantics**.

Implemented:
- dependency-free RigDocument kernel with globally unique stable IDs;
- rigid `RigElement` pose + owner-local `RigFrame` pose;
- one shared element/frame selection + transform preview/commit path;
- resolved world view and `origin-coincident` residual diagnostics;
- preview/cancel + undo/redo;
- Move/Rotate, world/local and element/frame inspectors;
- guarded local RigDocument save/open;
- local glTF/GLB SOURCE reference with SHA-256 + deterministic read-only node inspection/locators;
- independent authored/SOURCE selection, SOURCE datum marker/axes, Focus Source and Fit Source/Rig/All.

Owner gates accepted 2026-08-14:
- element selection/move/rotate, owned-frame propagation, independent frame editing, world/local, undo/redo, Esc cancellation and free camera inspection;
- real `OneSided_Steering_Suspension_Rig.gltf` SOURCE inspection, including spatial `Socket_WheelCenter` verification and independent read-only SOURCE selection.

Not yet claimed:
- foundation accepted;
- source registration/adoption/rebind contract frozen;
- representation binding from source geometry to authored `RigElement`;
- representation stretch/deformation;
- kinematic Author/Test evaluation path;
- JV lower mating solved;
- native JV or VAW adapters.

Next foundation work: UX/workspace structure first, then explicit source/adoption + representation binding, then a minimal kinematic evaluated-motion proof. No physics solver is part of this foundation.