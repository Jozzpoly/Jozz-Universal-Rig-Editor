# Status

## Current authority

Accepted product authority remains:

`main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Active recovery/real-use branch:

`work/real-use-foundation-recovery`

Last code checkpoint before this STATUS update:

`70b7a5cb2955a9cd0a3e30186400fe2160fe793f`

The branch started from pre-FC-9 semantic checkpoint `fd2f2da49a5250cff7dec27ee5bc35b626819460`. The abandoned FC-9 visual-concept line is historical evidence only. `main` has not been promoted or modified by RU-1.

## Product purpose

JURE is an owner-first spatial engineering workbench whose durable job is:

> let the owner inspect real source assets, create/correct authored rig truth, express mechanical/representation intent and test it without an agent guessing geometry and without SOURCE, renderer or consumer runtime becoming authored truth.

JV/JV-Web is the first real consumer/falsifier, not automatic authored truth.

## Durable architecture — current KEEP

- `RigDocument` is authored rig truth.
- `RigElement` / `RigFrame` are rigid authored identities using position + quaternion rotation; no scale in mechanical pose.
- SOURCE / AUTHORED / PREVIEW / EVALUATED / display runtime are different meanings.
- `SourceRevision` is exact immutable source identity: exact SHA-256 + adapter identity/version, addressed by a project revision ID.
- `SourceInstance` is one independently placed use of an exact SourceRevision.
- filename/label/URI/visual similarity are not source identity.
- `SourceAdoptionRecord` is immutable historical evidence of an explicit SOURCE -> AUTHORED decision.
- runtime object URLs/file handles are disposable state, never project truth.
- TEST/evaluator state is transient and never silently writes back to authored neutral.
- current relation vocabulary and `rigid | aim | span` representation vocabulary remain provisional.

## RU-0 — FC-9 recovery / CLOSED

The pre-FC9 semantic foundation was retained; no product rollback to BIND-00 was required. Existing UI remains an engineering harness, not visual authority.

Result: **RECOVERED WITHOUT PRODUCT ROLLBACK**.

## RU-1A — source adoption authority

Status: **IMPLEMENTED / SOURCE-REVIEWED / RUNTIME-UNVALIDATED**.

The previous live-pointer adoption model was falsified. Adoption now snapshots:

`sourceInstanceId + sourceRevisionId + sourceInstancePose-at-adoption + locator`

Consequences:

- moving/re-registering/removing the live SourceInstance never rewrites historical adoption evidence;
- exact authored provenance fails closed when its SourceRevision disappears or disagrees;
- explicit Owner adoption creates `provenance: owner-authored`; source origin remains separately recorded by `frame.source` + `SourceAdoptionRecord`;
- adoption creation deep-copies placement and is centralized outside React.

## RU-1B — ProjectSession, exact source runtime and persistence

Status: **IMPLEMENTED / SOURCE-REVIEWED / RUNTIME-UNVALIDATED**.

Owner decision: normal durable edits use **one chronological project Undo/Redo history**.

Example:

`Move SOURCE -> Move authored frame -> Undo frame -> Undo SOURCE -> Redo SOURCE -> Redo frame`

History boundary:

- IN: durable `JureProjectModel` and authored-document changes;
- OUT: selection, camera, panel/layout state, runtime source relink/object URLs, legacy representation preview and TEST/evaluator state.

`ProjectSession` is the durable history owner used by `App`. Do not reintroduce a second rig-specific Undo stack underneath it.

Additional implemented semantics:

- one exact SourceRevision can back several independent SourceInstances;
- same exact bytes + adapter reuse the existing revision identity;
- same filename with different bytes is a different SourceRevision;
- new revision + first SourceInstance is one Owner action / one Undo;
- remove/re-register SourceInstance fails closed while live representation depends on it;
- historical adoption may survive removal of the live instance;
- runtime relink requires exact SHA-256 + adapter identity and creates no project history;
- SOURCE inspection may select non-rigid nodes, but only verified rigid-compatible nodes can cross into rigid authored truth;
- logical project Save/Open is deterministic and guarded against stale overwrite;
- runtime `blob:` URLs are not persisted; reopen may require exact relink.

## RU-1C — first SOURCE -> AUTHORED owner gate

Status: **WIRED / CANONICAL WINDOWS VALIDATION IN PROGRESS / TYPECHECK BLOCKER FIXED / OWNER RERUN REQUIRED**.

Current workbench vertical slice:

`open/import project`
`-> open exact SOURCE`
`-> create/reuse placed SourceInstance`
`-> Move/Rotate SOURCE placement`
`-> inspect exact SOURCE nodes`
`-> select existing RigElement`
`-> Preview SOURCE datum as owned RigFrame`
`-> Commit/Cancel`
`-> unified Undo/Redo`
`-> Save/Open`
`-> exact SOURCE relink`

Deliberate limits remain:

- one active SourceInstance in current UI; no full instance browser yet;
- adoption targets an existing RigElement; element creation is outside this gate;
- no arbitrary surface/vertex picking;
- no free virtual/derived construction datum workflow yet;
- BIND-00 is legacy transient representation evidence;
- final representation workflow and kinematic TEST are not part of this gate;
- current panel/layout design is not final authority.

## 2026-08-15 owner-gate evidence correction

The first RU-1C Windows gate correctly stopped before npm/browser validation because the script required the historical BIND-00 fixture hash for the current canonical JV source file.

Owner evidence from the disposable gate:

- reviewed branch head matched exactly: `2f95a9ecf5cb2c61b220999e8e7f6aa45c63ca31`;
- Node `v24.16.0`, npm `11.17.0`;
- downloaded `OneSided_Steering_Suspension_Rig.gltf` size: 64,264 bytes;
- actual SHA-256: `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`;
- old script expected historical BIND fixture: `fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`;
- gate stopped before dependency install/check/browser run. No existing owner project folder was modified.

Repository history resolves the mismatch:

### Historical BIND-00 exact fixture

`OneSided_Steering_Suspension_Rig.gltf`

SHA-256:

`fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1`

Accepted `main` documentation explicitly recorded this as an **external exact SOURCE file not stored canonically in JURE**. BIND-00 proof remains scoped to these exact historical bytes. The exact file is not currently available in this orchestration session.

### Canonical current JV/native source

Repo/path:

`Jozzpoly/Box3d_FunProject/assets/source/OneSided_Steering_Suspension_Rig.gltf`

Git blob:

`06d5c66f6d13fb64863ab15a660f060358872291`

Owner-gate SHA-256:

`57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`

Git history shows this same blob was introduced in July and remains the current blob. Therefore `fc1e...` is not proven to be an older revision of the canonical Box3d_FunProject file. These are two different exact SourceRevisions sharing a filename/closely related structure.

### Required policy

Do **not** weaken exact relink after this incident.

- current RU-1C real-use gate should use the canonical current JV revision `57cda...`;
- historical exact BIND reproduction still requires `fc1e...` if that old proof is intentionally rerun;
- same filename or compatible node geometry must never substitute for exact identity;
- different bytes = different SourceRevision / explicit registration or rebind.

## Canonical test-gate correction

During incident review a more serious validation gap was found: `scripts/test-core.mjs` still contained a manual FC8-era allow-list and therefore did **not run several new RU-1 test files** even though they existed in `tests/core`.

Commit:

`94772304c02b91e6f00e73b5a11521d891c3e977`

corrects this by:

- discovering every `tests/core/*.test.mjs` file deterministically;
- failing if no core tests are found;
- compiling the same core TypeScript boundary first;
- adding an explicit SourceRevision identity regression test proving:
  - same filename + different SHA -> new SourceRevision, not relink;
  - same exact SHA + adapter -> relink without durable mutation;
  - same bytes + different adapter version -> different SourceRevision.

This correction makes the next successful `npm run check` meaningful for the full current RU-1 core set rather than only the old manually listed subset.

## 2026-08-15 Owner Gate V2 — first canonical Windows check

Owner ran V2 in an isolated disposable Downloads workspace against exact reviewed head:

`0d30b040e966007086417ec01dc72367f7d814ab`

Environment/evidence:

- Node `v24.16.0`;
- npm `11.17.0`;
- exact JURE head check: PASS;
- canonical JV SOURCE Git blob `06d5c66f6d13fb64863ab15a660f060358872291`: PASS;
- downloaded SOURCE size 64,264 bytes: PASS;
- SHA-256 `57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750`: PASS;
- expected 15-node/socket/axis-marker structure: PASS;
- `npm install`: PASS, 32 packages added, 0 vulnerabilities reported by that run;
- `npm run check`: BLOCKED during canonical `tsc -b` before core tests/build.

TypeScript found exactly two App wiring errors:

1. `sourceRuntime.selection` could be re-read as null after optional-chain narrowing;
2. the `ProjectAuthoringOperation` discriminated-union narrowing was lost when `authoring.activeOperation` was re-read inside the adoption-preview callback.

Commit:

`70b7a5cb2955a9cd0a3e30186400fe2160fe793f`

fixes both without casts/non-null assertions and without changing project semantics: the checked `selection` and `activeOperation` values are snapshotted locally before their existing narrowings. Commit review confirms the diff contains only those two local narrowing changes.

**No `npm run check` PASS is claimed yet.** Core tests and app build have still not executed on the corrected head; the Owner must rerun the canonical gate.

## Validation boundary

Pre-FC9 synthetic foundation evidence remains **42/42 PASS** only for its historical tested invariants.

RU-1A/B/C are not covered by that count. Current stronger evidence is:

- exact current JV source identity: verified in the Owner Windows gate;
- canonical dependency install: verified on Windows/Node 24.16.0/npm 11.17.0;
- canonical TypeScript gate: V2 exposed two real wiring errors and therefore correctly BLOCKED;
- those two errors are source-reviewed as fixed at `70b7a5cb...`;
- full core-test set, application build and manual browser workflow remain unvalidated until the next Owner run.

The orchestration environment still cannot clone/install the repo because it cannot resolve `github.com`; do not replace the Owner's canonical environment with the available noncanonical local compiler.

## Immediate next gate

Do not add another feature pile.

Rerun RU-1C on the corrected recovery head and validate:

1. automated exact branch/source identity checks;
2. canonical TypeScript check;
3. all discovered `tests/core/*.test.mjs` tests;
4. application build;
5. SOURCE opens/relinks read-only while SourceInstance placement is editable;
6. placed SOURCE Move/Rotate is spatially correct and Undo/Redo is chronological;
7. selected datum marker follows SourceInstance placement exactly;
8. adoption preview lands at the correct project-world point / correct owner-local pose;
9. Cancel creates no durable frame/history;
10. Commit creates one authored frame + adoption evidence + one Undo step;
11. Undo/Redo removes/restores it without stale selection;
12. Save/Open preserves placement, authored frame and adoption; relink accepts only the same exact revision.

Only after this gate should the next capability be selected from observed Owner friction — likely virtual frame creation, arbitrary geometry picking/construction datums, multi-instance browsing, or the next real representation need.

## Foundation exit criterion

Foundation is done only when the Owner can take a real JV mechanism and, without agent-side coordinate guessing:

- place/inspect exact source assets;
- author/adopt required elements, frames and mechanical intent;
- map real visual representation;
- move/test the mechanism kinematically with useful diagnostics;
- Reset exactly to authored neutral;
- save/reopen;
- export a small consumer-facing result;

then return to:

`small need -> small vertical slice -> targeted test -> owner-visible gate -> next`.
