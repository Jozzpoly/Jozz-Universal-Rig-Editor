# Status

Current: **the compact workspace/UI baseline and SOURCE inspection are OWNER ACCEPTED; BIND-00 passed as a useful single-binding proof and simultaneously falsified the singleton binding model. The project is intentionally stopping at a handoff boundary before fundamental design of JURE as a practical universal rig editor for the owner's projects.**

Implemented and owner accepted as current baseline:
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

Owner observations accepted 2026-08-14/15:
- element selection/move/rotate, owned-frame propagation, independent frame editing, world/local, undo/redo, Esc cancellation and free camera inspection work for the tested scope;
- real `OneSided_Steering_Suspension_Rig.gltf` SOURCE inspection works, including spatial datum verification and independent read-only SOURCE selection;
- the workspace baseline works with real SOURCE data, panel resize/collapse, RIG/SOURCE layer controls, degree editing and non-overlapping panel rails;
- this UI is a usable engineering baseline, **not the final design of the future universal rig editor**. Its information architecture and interaction model are expected to evolve during the next fundamental design phase.

BIND-00 owner result:
- **narrow proof PASS**: one selected authored `RigElement` can be transiently bound to one rigid SOURCE skin joint; the bound skinned representation can follow element Move/Rotate while the read-only SOURCE reference remains fixed;
- SOURCE Geometry and RIG Bound visibility are independent enough to verify the two layers;
- the real skinned asset demonstrates that driving an exact source joint can produce useful hierarchy/deformation rather than merely moving the entire asset as one rigid object;
- **important falsification**: BIND-00 stores only one global `representationBinding`. Creating a second binding replaces the first, so the previous bound joint returns to the unmodified source pose. This is expected from the prototype implementation and proves that a singleton binding is not a viable final model;
- BIND-00 remains transient / not serialized. No persistent representation-binding schema was frozen from this prototype.

Durable conclusions from BIND-00:
- source provenance (`RigElement.source` / `RigFrame.source`) and visual/mechanical representation binding are different semantics and must not be conflated;
- SOURCE reference must remain independently inspectable/read-only even when one or more representations are driven by authored/evaluated rig state;
- final JURE must support a real mechanism composed of **multiple simultaneous bindings**, not a single current pair;
- the representation layer must eventually support rigid parts plus non-rigid/length-changing presentation such as springs, dampers and cardans without putting scale into rigid `RigElement` / `RigFrame` pose;
- the future motion/test path remains kinematic first: authored neutral truth must stay separate from transient evaluated motion and Reset must restore it exactly;
- do not patch the current singleton into an ad-hoc multi-binding feature before the next design pass. Use the prototype as evidence when designing the real representation/assembly model.

Still intentionally open:
- fundamental product/interaction design of JURE as the owner's practical universal rig editor for JV-Web, native/core JV and potentially later JV/VAW work;
- persistent `SourceRevision` vs placed source instance/registration model;
- many-binding representation model and how source geometry/joints are mapped to `RigElement`s;
- explicit source datum -> authored frame adoption/rebind workflow;
- representation stretch/deformation;
- kinematic AUTHOR / TEST evaluator contract and first real mechanism test;
- full owner-authored car rig: suspension, steering members, wheels, body, springs/dampers, cardans and other JV parts;
- JV lower mating resolution;
- native JV or VAW adapters.

Next-chat instruction: **do not continue by simply turning the current `representationBinding` state into an array.** First reconstruct the current evidence and revisit the product as a whole: the owner needs a visual, direct-manipulation rigging workbench where he can attach a rig to real assets, author frames/pivots/hardpoints/relations, bind multiple pieces of representation, and later test the mechanism kinematically in motion. Preserve the proven small kernel and SOURCE/AUTHORED separation unless a real falsifier requires change, but treat the final assembly/binding/motion UX and representation model as the next fundamental design problem. The current BIND-00 branch is evidence/prototype, not final architecture.
