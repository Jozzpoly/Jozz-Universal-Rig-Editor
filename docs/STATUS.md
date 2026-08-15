# Status

## Current authority

Accepted product authority remains:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Active recovery/real-use branch:

`work/real-use-foundation-recovery`

Current source-reviewed owner-gate checkpoint before this STATUS update:

`b290a360d1ff0cf2f25f9dd48dc23ec29d7e5a70`

The branch started exactly from pre-FC-9 semantic checkpoint `fd2f2da49a5250cff7dec27ee5bc35b626819460`. The abandoned FC-9 visual-concept line is historical evidence only. `main` has not been promoted or modified by RU-1.

## Product purpose

JURE is an owner-first spatial engineering workbench whose durable job is:

> let the owner inspect real source assets, create/correct authored rig truth, express mechanical/representation intent and test it without an agent guessing geometry and without SOURCE, renderer or consumer runtime becoming authored truth.

JV/JV-Web is the first real consumer/falsifier, not a source of automatic authored truth.

## Durable architecture — KEEP unless real use falsifies it

- `RigDocument` is authored rig truth.
- `RigElement` and `RigFrame` use rigid position + quaternion rotation; no scale.
- SOURCE / AUTHORED / PREVIEW / EVALUATED / display runtime are different meanings.
- `SourceRevision` is exact immutable source identity (`sha256 + adapter identity`).
- `SourceInstance` is one independently placed use of a revision.
- `SourceAdoptionRecord` is immutable historical evidence of an explicit SOURCE -> AUTHORED decision.
- source provenance is not representation binding.
- Three/browser object URLs/file handles are disposable runtime state, never project truth.
- TEST/evaluator state is transient and must never silently write back to authored neutral.

Current mechanical relation vocabulary and `rigid | aim | span` representation vocabulary remain provisional. Do not defend their exact lists without real mechanism evidence.

## RU-0 — recovery from FC-9 / CLOSED

The semantic foundation before the visual-concept detour was retained. No product rollback to BIND-00 was required. The existing UI remains a working engineering harness rather than final visual authority.

Result: **RECOVERED WITHOUT PRODUCT ROLLBACK**.

## RU-1A — source adoption authority

Status: **IMPLEMENTED / SOURCE-REVIEWED / RUNTIME-UNVALIDATED**.

The previous live-pointer adoption model was falsified. Adoption now snapshots:

`sourceInstanceId + sourceRevisionId + sourceInstancePose-at-adoption + locator`

Consequences:

- moving/re-registering/removing the live SourceInstance never rewrites historical adoption evidence;
- exact authored provenance still fails closed when its SourceRevision disappears or disagrees;
- explicit Owner adoption creates `provenance: owner-authored`; source origin remains separately recorded by `frame.source` + `SourceAdoptionRecord`;
- adoption creation deep-copies placement and is centralized in project-domain code.

## RU-1B — project session, exact source runtime and persistence

Status: **IMPLEMENTED / SOURCE-REVIEWED / RUNTIME-UNVALIDATED**.

Owner decision: normal durable edits use **one chronological project Undo/Redo history**.

Example:

`Move SOURCE -> Move authored frame -> Undo frame -> Undo SOURCE -> Redo SOURCE -> Redo frame`

History boundary:

- IN: durable `JureProjectModel` and authored-document changes;
- OUT: selection, camera, panel/layout state, runtime source relink/object URLs, legacy representation preview and TEST/evaluator state.

`ProjectSession` is now the durable history owner used by `App`. The old rig-specific history implementation remains in the repository as legacy/harness code but is no longer the active App history path. Do not wire a second durable Undo stack underneath ProjectSession.

Additional implemented semantics:

- one exact SourceRevision can back multiple independently placed SourceInstances;
- registering exact bytes again reuses their revision identity instead of creating aliases;
- adding a new revision + first SourceInstance is one Owner action / one Undo;
- removing or re-registering a SourceInstance is blocked while authored representation bindings depend on it;
- historical adoption may survive removal of the live instance;
- runtime relink is keyed by exact revision and requires SHA-256 + adapter match;
- relink/unlink is workspace recovery only and creates no project history;
- SOURCE inspection may select non-rigid nodes, but only verified rigid-compatible nodes can cross into authored RigFrame truth;
- logical project Save/Open uses deterministic project serialization and guarded overwrite hashes;
- runtime `blob:` URLs are not persisted; saved projects may require exact source relink after reopen.

## RU-1C — first SOURCE -> AUTHORED owner gate

Status: **WIRED IN WORKBENCH / SOURCE-REVIEWED / RUNTIME-UNVALIDATED / OWNER VALIDATION NEXT**.

The current harness now exposes one complete vertical slice:

`open/import project`
`-> open exact SOURCE`
`-> create/reuse placed SourceInstance`
`-> Move/Rotate SOURCE placement with the viewport gizmo`
`-> inspect exact SOURCE nodes`
`-> select an existing authored RigElement`
`-> Preview adopted SOURCE datum as a new owned RigFrame`
`-> Commit or Cancel`
`-> unified Undo/Redo`
`-> Save/Open logical project`
`-> exact SOURCE relink`

Important UI authority language:

- exact loaded source asset = **READ ONLY**;
- `SourceInstance.pose` = **editable project placement**;
- adoption preview = transient;
- Commit is the explicit crossing into authored truth.

The renderer applies SourceInstance pose outside the glTF root and keeps SOURCE separate from rig `TransformTarget`; SOURCE placement is not disguised as a RigElement.

### Deliberate first-gate limits

This slice does **not** prove the final JURE workflow. Current deliberate limits are:

- UI exposes one active SourceInstance at a time; multi-instance project semantics exist but no full instance browser yet;
- frame adoption targets an already existing RigElement; element creation is not bundled into this slice;
- no surface/vertex picking for missing source datums yet;
- no free virtual-frame creation/derived construction datum workflow yet;
- BIND-00 remains only a legacy transient representation proof;
- final representation workflow and kinematic TEST/solver are not implemented by this gate;
- current panels/layout are not final visual design.

Do not expand these limits before the owner tests the vertical slice unless a hard correctness blocker is found.

## Validation boundary

Pre-FC-9 synthetic foundation harness: **42/42 PASS** for only the invariants it actually tested.

RU-1A/RU-1B/RU-1C changes after that checkpoint are **not included in that PASS count**. They are source-reviewed only in the current orchestration environment.

A direct isolated repository fetch/install attempt again failed because the environment could not resolve `github.com`. Global TypeScript 5.8.3 exists locally, but reconstructing the repository around a noncanonical compiler would not provide a trustworthy project validation, so no workaround chain was used.

There is still no canonical new `npm run check` claim and no owner/browser gate claim for `b290a360...`.

## Immediate next gate

Do not add another feature pile.

Next step is a real browser/owner validation of RU-1C with the actual `OneSided_Steering_Suspension_Rig.gltf` (or another explicitly chosen real mechanism) and an authored rig containing a meaningful target element.

Validate at minimum:

1. exact SOURCE opens/relinks and is visibly read-only while placement remains editable;
2. placed SOURCE Move/Rotate is spatially correct and Undo/Redo feels chronological;
3. SOURCE datum marker follows instance placement exactly;
4. adoption preview appears at the correct project-world point and correct owner-local pose;
5. Cancel leaves no authored frame/history entry;
6. Commit creates one authored frame + one adoption record + one Undo step;
7. Undo removes the adopted frame without stale UI selection; Redo restores it;
8. Save/Open preserves SourceInstance placement, authored frame and adoption while runtime bytes require/accept exact relink.

Only after this gate should the next capability be selected from observed friction: likely virtual frame creation, geometry picking/construction datums, multi-instance browser, or the next real representation requirement.

## Foundation exit criterion

Foundation is done only when the owner can take a real JV mechanism and, without agent-side coordinate guessing:

- place/inspect exact source assets;
- author/adopt required elements, frames and mechanical intent;
- map real visual representation;
- move/test the mechanism kinematically with useful diagnostics;
- Reset exactly to authored neutral;
- save/reopen;
- export a small consumer-facing result;

then return to the normal cadence:

`small need -> small vertical slice -> targeted test -> owner-visible gate -> next`.
