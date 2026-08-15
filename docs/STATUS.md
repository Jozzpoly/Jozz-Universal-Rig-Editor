# Status

## Current authority

Accepted product authority remains:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

The active recovery/design line is:

`work/real-use-foundation-recovery`

It was created exactly from `fd2f2da49a5250cff7dec27ee5bc35b626819460`, the last semantic/state checkpoint before the FC-9 visual-concept detour.

The later `work/foundation-convergence-v1` FC-9 commits are historical design evidence only. From `fd2f2da...` to the abandoned FC-9 head they changed only `docs/STATUS.md` and added `docs/WORKBENCH_DESIGN_CONTRACT.md`; no product/kernel/runtime code was introduced there.

## Recovery verdict

JURE does **not** need to be rolled back to the old BIND-00 baseline. The convergence work before FC-9 produced several useful implementation seams. It does, however, need to stop treating provisional vocabularies and UI task contexts as if they were already the final product design.

The project now returns to its actual purpose:

> let the owner build, inspect, correct, represent and kinematically test a real rig on real assets without an agent guessing the geometry and without SOURCE, renderer or consumer-runtime state becoming authored truth.

JV/JV-Web is the first real consumer/falsifier. Current JV explicitly leaves lower wishbone/mating and final steering geometry unresolved and expects reliable mating points/frames to be authored in JURE rather than guessed in JV.

## Strong foundation — KEEP unless a real consumer falsifies it

### Authored truth

- `RigDocument` remains authored rig truth.
- `RigElement` is stable rigid authored identity.
- `RigFrame` is a rigid datum local to an element or rig root.
- rigid authored poses remain position + quaternion rotation; no scale.
- source provenance is not representation binding.
- SOURCE / AUTHORED / preview / EVALUATED / display-runtime remain different meanings.

### Authoring interaction

- Move/Rotate, world/local, numeric degree editing over quaternion storage;
- preview/commit/cancel;
- undo/redo;
- free/unclamped inspection camera + Focus/Fit;
- independent authored and SOURCE selection.

### Project/evidence boundary

The thin project-level separation is retained as a strong candidate:

- `SourceRevision` — exact immutable source identity;
- `SourceInstance` — one placed use of an exact source revision;
- `ConsumerReferenceSnapshot` — external consumer evidence, never authored truth;
- `SourceAdoptionRecord` — explicit record connecting a placed source datum to authored output.

This is a logical project contract, **not** an asset database. Physical `.jure`/ZIP packaging remains deferred.

### AUTHOR / TEST boundary

The evaluator seam is retained:

`RigDocument + transient controls -> RigEvaluationResult -> evaluated pose view`

Evaluated poses are revision-bound overlays only. Invalid/stale results fail closed. Reset removes evaluator influence; TEST never silently writes back to authored neutral.

### State ownership

Keep the explicit non-domain state owners introduced before FC-9:

- `RigAuthoringState` — authored session/selection/preview/history;
- `SourceRuntimeState` — loaded SOURCE runtime asset + SOURCE selection;
- `RigTestState` — transient TEST controls/result.

`App` should remain composition/orchestration glue instead of becoming the owner of new domain semantics.

## Provisional foundation — useful evidence, NOT frozen product truth

### Mechanical relation vocabulary

Current candidate types are:

`origin-coincident | revolute | prismatic | spherical | distance | distance-range`

For revolute/prismatic relations, current candidate semantics use RigFrame origin as anchor and local `+Z` as the primary DOF axis.

These types are intentionally free of mass, inertia, friction, damping, motors, solver settings and Box3D IDs. That separation is KEEP.

The **exact list and detailed semantics are still provisional** until walked through real owner workflows for suspension, steering, wheel spin, damper, cardan and non-vehicle counterexamples.

### Representation vocabulary

A separate authored representation domain remains the leading architecture because representation can be non-rigid and depends on placed source instances while `RigDocument` should not.

Current candidate mapping types are:

`rigid | aim | span (+ optional roll correspondence)`

The separation itself is KEEP. The exact vocabulary is **not yet final**. BIND-00 proves one narrow skin-joint path and falsifies singleton storage; it does not prove that these three mapping types cover the final product.

### Rig task contexts

`inspect | author | represent | test` is a useful orchestration/state experiment, not a final navigation or UI contract.

The durable requirement is simpler:

- spatial/camera/project continuity must survive changes in task;
- active authored previews must never be silently reinterpreted;
- TEST is transient and resettable;
- the UI must serve real work rather than force the owner to think in internal architecture names.

Current panel placement and the old FC-9 visual concepts are not authority.

## RU-0 — recovery from FC-9 visual detour / CLOSED

Evidence:

- `main` is unchanged and safe;
- exact pre-FC-9 semantic checkpoint is `fd2f2da49a5250cff7dec27ee5bc35b626819460`;
- the seven later FC-9 commits changed documentation only;
- Apixel/image-generation output is not needed for this month's work and is removed as a project dependency;
- the current owner-tested UI remains a working engineering harness while real workflows mature.

Result: **RECOVERED WITHOUT PRODUCT ROLLBACK**.

## RU-1 — real-use foundation design / ACTIVE

The next work is **not** another visual redesign and **not** a feature pile.

Design and falsify the complete owner workflow on realistic rigging problems first:

`open/create project`
`-> add/place exact SOURCE assets`
`-> inspect source geometry/datums`
`-> create/adopt authored elements + frames`
`-> define mechanical intent`
`-> map real representation`
`-> direct authoring + diagnostics`
`-> kinematic TEST`
`-> exact Reset`
`-> save/reopen`
`-> export through a small consumer adapter`

The design must survive at least these real-use families:

1. JV double-wishbone + steering corner;
2. wheel/hub/steering-member separation;
3. spring/damper length-changing visual representation;
4. cardan/shaft orientation + length behavior;
5. repeated source revision used by several independent instances;
6. virtual owner-authored frames that do not exist in SOURCE;
7. a simple piston/slider;
8. a rotor/gimbal/thruster-style non-vehicle counterexample.

Do not import current M5/M6 geometry as truth. Current JV is consumer reference and evidence only.

### RU-1 questions to resolve before the next major UI implementation

- What is the smallest project/session model the owner actually manipulates?
- What actions create authored truth from SOURCE versus create it freely from scratch?
- When is representation bound to an element, a frame, two frames, or something else?
- Which relation semantics are genuinely needed by the full owner workflow?
- What is a TEST driver/DOF from the owner's point of view?
- What diagnostics are required to author mating/axes/lengths without guesswork?
- What must Save persist, and what remains disposable workspace state?
- What is the smallest consumer-export boundary JV needs?

Resolve these through concrete scenarios and small executable falsifiers, not through a large framework or another stack of design documents.

## UI / Build Web Apps direction after recovery

The owner has explicitly abandoned Apixel for this month. No image-generation gate blocks progress.

Use the existing owner-tested viewport-first UI as a **working harness**, not final visual authority. Preserve proven interaction mechanics while real workflows are implemented. Product UX should now be driven by repeated real use:

`perform task -> observe friction -> repair the exact interaction -> repeat`

A later visual/polish pass may reorganize the complete workbench once the workflow is mature. Do not cosmetically freeze today's panels and do not invent a design system/framework before the real interaction requires it.

## Security / trust boundary

JURE is a local owner tool, not a remote multi-user service. Do not inflate security into a parallel project.

Meaningful trust boundaries are local imported files and parsed source/project data. Continue to:

- treat imported JSON/glTF as untrusted input;
- validate/canonicalize before treating data as project state;
- fail closed on unknown schema/relation/representation kinds and source revision mismatches;
- keep guarded file overwrite behavior;
- avoid dynamic code execution/plugin loading from source files.

No security framework is required without a real new attack surface.

## Validation boundary

Synthetic foundation harness at the pre-FC-9 checkpoint: **42/42 PASS** for the exact invariants it tests.

This is not a claim of canonical full `npm run check` in the current execution environment. The previous direct disposable install attempt failed because the environment could not resolve `github.com`; no workaround chain was pursued.

There is still no `package-lock.json`. Create it from a canonical successful install; do not block RU-1 product design on it.

## Foundation exit criterion

Foundation is done when the owner can take a real JV mechanism and, without agent-side coordinate guessing:

- place/inspect exact source assets;
- author or adopt the needed elements, frames and mechanical intent;
- map the real visual representation;
- move/test the mechanism kinematically and understand diagnostics;
- Reset exactly to authored neutral;
- save/reopen the work;
- export a small consumer-facing result;

and then a normal new capability can be added as:

`small need -> small vertical slice -> targeted test -> owner-visible gate -> next`.

At that point foundation stops being the main subject of the project.