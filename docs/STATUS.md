# Status

Current: **UI/UX Foundation OWNER ACCEPTED; BIND-00 transient representation-binding proof is implemented and awaiting the real browser Owner gate**.

Implemented and owner accepted:
- dependency-free RigDocument kernel with globally unique stable IDs;
- rigid `RigElement` pose + owner-local `RigFrame` pose;
- one shared element/frame selection + transform preview/commit path;
- resolved world view and `origin-coincident` residual diagnostics;
- preview/cancel + undo/redo;
- Move/Rotate, world/local and human-facing XYZ degree editing over quaternion storage;
- guarded local RigDocument save/open;
- local glTF/GLB SOURCE reference with SHA-256 + deterministic read-only node inspection/locators;
- independent authored/SOURCE selection, SOURCE datum marker/axes, Focus Source and Fit Source/Rig/All;
- viewport-first resizable/collapsible workspace with separate RIG/SOURCE navigator panes and presentation-layer visibility controls.

Owner gates accepted 2026-08-14/15:
- element selection/move/rotate, owned-frame propagation, independent frame editing, world/local, undo/redo, Esc cancellation and free camera inspection;
- real `OneSided_Steering_Suspension_Rig.gltf` SOURCE inspection, including spatial datum verification and independent read-only SOURCE selection;
- final UI/UX workspace foundation: panel resize/collapse, RIG/SOURCE layer controls, degree editing, real SOURCE workflow and non-overlapping panel rails.

Current BIND-00 candidate:
- transient `RepresentationBindingDraft` is exact-SHA-qualified and stores a rigid rest pose between a `RigElement` and one rigid SOURCE skin joint;
- binding starts without a spatial jump and follows `visibleDocument` during authored preview/commit/cancel;
- SOURCE reference remains a separate read-only ghost;
- renderer loads a separate bound skinned representation and resolves the exact glTF node through GLTFLoader node-index associations rather than name matching;
- `Bound` is a workspace presentation layer;
- BIND-00 is deliberately not serialized and does not change kernel/schema/source provenance.

Not yet claimed:
- BIND-00 Owner PASS on the real skinned asset;
- persistent `SourceInstance` / representation-binding schema frozen;
- source adoption/rebind persistence contract frozen;
- representation stretch/deformation;
- kinematic Author/Test evaluation path;
- JV lower mating solved;
- native JV or VAW adapters.

Next foundation gate: on the real `OneSided_Steering_Suspension_Rig.gltf`, select an authored `RigElement` plus a rigid skin joint (for example `Chassis_Bottom` or `Socket_WheelCenter`), create the transient bound preview, and verify that the bound visual does not jump at bind time, follows element Move/Rotate live, SOURCE stays fixed, Esc restores the bound visual with authored preview cancellation, and hiding SOURCE Geometry leaves the bound representation independently visible. If this proof passes, persist the smallest truthful `SourceInstance` + `RepresentationBinding` contract; if it fails, fix the representation mechanics before changing the schema.
