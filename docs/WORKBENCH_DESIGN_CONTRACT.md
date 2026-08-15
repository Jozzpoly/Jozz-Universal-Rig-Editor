# JURE Workbench Design Contract

Status: `FC-9A PRODUCT / INFORMATION ARCHITECTURE CONTRACT`

This document is the compact design authority for the final JURE Rig Workspace redesign. It defines **what the owner must be able to see, distinguish and do** before any visual implementation is accepted. It does not freeze pixel layout, colors, typography, iconography or a physical `.jure` container format.

## 1. Product identity

JURE is an owner-first spatial engineering authoring workbench. Its first mature workspace is Rig, but the shell must remain capable of hosting a later Map Workspace without putting map concepts into `RigDocument` or introducing a speculative plugin framework.

The workbench is not:
- a Box3D parameter editor;
- a debug dashboard around a renderer/runtime;
- a collection of sliders for spatial problems;
- a set of disconnected wizard pages;
- a generic node/ECS/plugin framework built before real tools require one.

The primary loop is:

`inspect evidence -> author intended spatial/mechanical truth -> map representation -> test transiently -> diagnose -> correct -> save/export`

The persistent spatial viewport is the continuity anchor for that loop.

## 2. Authority must remain visible in the product

The UI must never visually collapse these meanings:

- **SOURCE** — exact external asset revision and its placed instances; read-only evidence unless explicitly adopted.
- **REFERENCE** — what an external consumer/runtime currently believes; may be provisional, stale or wrong.
- **AUTHORED** — explicit JURE owner intent in authored domain documents.
- **REPRESENTATION** — authored mapping from exact placed source data to authored rig datums.
- **EVALUATED** — transient TEST result; never authored truth and never written back automatically.

A user should be able to tell which meaning they are looking at without reading implementation details or guessing from color alone. Textual status/labels and interaction affordances must support the distinction.

## 3. Persistent workbench anatomy

The final workbench keeps one spatial/project context while task context changes.

### Workbench-level project surface

Always reachable:
- JURE identity and current workspace (`Rig`; later `Map` may coexist);
- project identity and dirty/save state;
- Open / Save / Save As / Export intent;
- exact project health summary: missing source, changed revision, stale reference, invalid authored data, unresolved representation/rebind, export blocker;
- access to all loaded SourceRevisions and placed SourceInstances;
- undo/redo availability when semantically valid.

Project actions must not compete visually with the primary authoring task. The current `TopBar` grouping is not preserved by default.

### Persistent viewport

The viewport remains mounted while switching Rig task context.

Preserve unless later falsified:
- free/unclamped inspection camera;
- Perspective / Front / Top / Side views;
- Focus / Fit behavior;
- direct authored selection and gizmo manipulation;
- independent SOURCE and authored selection/comparison;
- stable camera and visibility context across task switching where semantically safe.

The viewport must make authority layers inspectable without turning into a permanent overlay soup. Context decides which layers are foregrounded; visibility controls remain available.

### Rig task context switcher

Four explicit task contexts:

`Inspect | Author | Represent | Test`

This is not page navigation. Switching changes the task-oriented navigator, inspector and tools while preserving the project and viewport.

An active authored preview blocks switching until Commit or Cancel. TEST starts from authored truth and leaving TEST discards transient controls/results.

### Context browser / navigator

One primary navigation region changes its information architecture by task. Do not stack permanent full Rig + Source + Reference + Representation trees simultaneously.

The browser must support search/filter where the dataset can become large and must distinguish stable identity from display labels.

### Context inspector / action surface

The inspector follows the selected meaning in the active context. It contains exact metadata, editable properties only where authority permits, diagnostics and contextual actions.

Do not use one giant inspector that shows every SOURCE/REFERENCE/AUTHORED/REPRESENTATION/TEST property at once.

### Diagnostics / status surface

Persistent low-noise status reports project/editor health. Contextual diagnostics may expand from it. Warnings must say what authority is affected and whether they block Save, Test or Export.

## 4. Context contracts

### 4.1 Inspect

Purpose: understand exact SOURCE and CONSUMER REFERENCE without authority inversion, compare them spatially, and deliberately start authoring.

Primary browser content:
- SourceRevisions grouped by exact asset identity;
- SourceInstances as placed uses of revisions;
- selected source node/datum hierarchy;
- ConsumerReference snapshots and their consumer/revision identity;
- comparison visibility controls.

Viewport foreground:
- SOURCE geometry/datums;
- selected REFERENCE bodies/frames/joints/anchors when available;
- authored overlay may remain visible for comparison but is not the primary edit target.

Inspector:
- exact SHA/revision/adapter/locator or consumer reference identity;
- rigid compatibility / missing or changed revision state;
- reference classification and explicit warning that REFERENCE is not authored truth;
- source/reference spatial readout.

Primary actions:
- Focus / Fit selection;
- create an authored proposal from an exact source datum;
- explicitly adopt a proposal into a RigElement/RigFrame;
- create a new authored datum without source provenance;
- open comparison with existing authored target.

Forbidden behavior:
- loading SOURCE or REFERENCE may not silently mutate AUTHORED data.

### 4.2 Author

Purpose: construct intended assembly geometry and neutral mechanical/kinematic intent.

Primary browser content:
- RigElements;
- owned/root RigFrames;
- RigRelations;
- compact diagnostics attached to affected authored identities.

Viewport foreground:
- AUTHORED elements, frames and relations;
- SOURCE/REFERENCE as optional comparison layers;
- transform gizmo and creation previews.

Inspector:
- element/frame identity and provenance;
- rigid pose with position + rotation only;
- numeric transform editing over quaternion storage;
- relation type and geometric limits;
- owner/local/world context where relevant;
- exact diagnostics/residuals.

Primary actions:
- create/delete/rename element or frame;
- create virtual frames that do not exist in SOURCE;
- Move / Rotate in World / Local;
- create/edit relation between frames;
- preview -> Commit / Cancel;
- undo / redo.

No mass, inertia, friction, motor force, Hertz/damping, solver or consumer runtime IDs belong in the normal authored mechanical inspector.

### 4.3 Represent

Purpose: persist how exact source visual data follows/deforms from authored rig datums without contaminating rigid mechanics.

Primary browser content:
- representation documents/mappings grouped by source instance and/or authored assembly target;
- unmapped / valid / warning / broken-rebind states;
- exact source target and authored target pairings.

Viewport foreground:
- placed source representation;
- authored frames/elements used by the selected mapping;
- visual correspondence guides for selected rigid/aim/span/roll mapping;
- ability to compare SOURCE rest evidence against driven result.

Inspector:
- mapping ID and type (`rigid`, `aim`, `span`, optional roll correspondence);
- exact SourceInstance + SourceRevision + target locator;
- authored target element/frame IDs;
- source/start/end/roll correspondence details;
- revision mismatch and rebind diagnostics.

Primary actions:
- create multiple simultaneous mappings;
- choose exact source target and authored correspondence;
- change mapping type only through explicit authoring;
- clear/rebind a broken mapping;
- Focus either source or authored side.

The final UI must not expose the old global BIND-00 singleton as if it were the representation architecture.

### 4.4 Test

Purpose: evaluate authored neutral intent transiently, inspect mechanism motion and diagnostics, then return exactly to AUTHORED truth.

Primary browser content:
- authored assembly tree in read-only form;
- evaluator/driver controls relevant to the active mechanism;
- evaluation diagnostics and constraint/limit readouts.

Viewport foreground:
- EVALUATED motion/result clearly distinguishable from authored neutral;
- optional ghost/neutral comparison;
- driven representation where available.

Inspector:
- selected authored identity shown as read-only authored baseline plus evaluated pose/readout;
- active driver/control values;
- diagnostics tied to current authored document revision.

Primary actions:
- set numeric controls/drivers;
- Evaluate / update transient state;
- Reset exactly;
- Focus moving mechanism/diagnostic target;
- leave TEST, discarding transient state.

Forbidden behavior:
- no authored transform gizmo or committed authored edits while TEST is active;
- evaluated state must never silently become authored neutral.

## 5. Persistence across task contexts

Persist when semantically safe:
- project and authored documents;
- loaded SOURCE revisions/instances and exact identity state;
- viewport camera/projection;
- layer visibility policy;
- authored selection if the same target remains meaningful;
- SOURCE selection if the exact instance/locator still exists;
- file/save session state.

Context-local / disposable:
- Inspect comparison focus/filter details;
- Author transform preview;
- Represent mapping draft/temporary pairing state;
- Test controls and evaluated result;
- context-specific expanded/collapsed groups where persistence adds no product value.

Hard rule: no context switch may reinterpret transient state as durable authored truth.

## 6. Failure and revision states that require first-class design

The final concept set must visibly cover, not hide behind generic toast messages:

- missing exact SourceRevision;
- SourceInstance now points to a different revision;
- source locator no longer exists after explicit re-registration/rebind attempt;
- stale or changed CONSUMER REFERENCE;
- authored validation error;
- invalid/reversed mechanical geometric limits;
- representation target/mapping invalid or unresolved;
- unresolved representation rebind;
- TEST result stale because authored revision changed;
- active authored preview blocks task-context switching;
- dirty project / save conflict / export blocked.

Severity language must distinguish `informational`, `warning`, and `blocking` conditions. A warning is not automatically an error and a REFERENCE mismatch is not automatically an authored defect.

## 7. Real JV round-trip walkthrough

The information architecture is only acceptable if this workflow is clear without agent-side coordinate guessing:

1. An agent/adapter prepares one logical JURE project containing exact vehicle source assets, several placed SourceInstances, current JV rig/reference evidence and any existing authored JURE data.
2. Owner opens it and immediately sees project/source/reference health rather than a flat imported "rig".
3. In **Inspect**, owner compares the current provisional FL suspension/steering reference against exact source datums and existing authored data.
4. Owner explicitly adopts useful datums or creates better virtual frames.
5. In **Author**, owner corrects mating points, axes and neutral relations without editing JV dynamics.
6. In **Represent**, owner maps wheel/wishbones/damper/cardan/skin visual targets to authored datums using several simultaneous mappings.
7. In **Test**, owner drives relevant kinematic controls, inspects motion/diagnostics and uses exact Reset.
8. Owner saves/exports authored geometry/kinematics + representation. A small JV adapter combines that output with JV-owned masses, friction, damping, motors, tire/contact/solver/drive behavior.

If the workbench forces the owner to remember hidden authority differences, copy coordinates manually between pages, lose the camera during the loop, or use consumer runtime fields to solve spatial authoring, the design fails.

## 8. Counterexample validation

### Four wheels from one source revision

One `SourceRevision` may back four `SourceInstances`. The workbench must show instance identity/placement separately from exact asset revision and representation mappings must bind to the correct instance.

### Alternate suspension

The Author context must permit freely created elements/frames/relations instead of assuming the source hierarchy or current JV corner topology is the assembly ontology.

### Piston

A piston can be authored with the same frame/prismatic mechanics and later tested with a suitable driver. No vehicle-specific UI primitive is required.

### Rotor / thruster

Rotor mechanical intent can use a revolute relation; a thruster may be primarily a frame/direction + later consumer/actuator semantics rather than a joint. The workbench must not force every future functional concept into `RigRelation` or a vehicle-specific panel.

### Future Map Workspace

Map authoring may share project/source/file/viewport infrastructure but requires different authored documents, navigator and tools. The persistent shell must therefore be compositional, while the Rig Workspace remains concrete rather than implementing a generic plugin system today.

## 9. Visual direction constraints for FC-9B

The concepts should feel like a serious modern engineering/creative tool rather than a sci-fi HUD or consumer dashboard.

Required qualities:
- viewport-first;
- medium information density with strong hierarchy and readable technical text;
- restrained surfaces/borders, not nested card grids;
- low ornament and no decorative metrics/badges/pills;
- high-confidence distinction between authority layers without relying on neon color coding alone;
- controls sized for long desktop sessions;
- clear selected/hover/disabled/blocking states;
- typography designed for both spatial canvas chrome and dense inspector metadata;
- practical React/CSS implementation, not concept art impossible to build.

Exact palette, typography, icon family, radii, spacing tokens and component geometry are intentionally **not frozen in FC-9A**. They are selected from coordinated FC-9B concepts.

## 10. FC-9B concept inventory

Generate coordinated concepts from one design system, not four unrelated mockups:

1. **Inspect primary screen** — project with multiple source instances + consumer reference, exact identity/health visible, source/reference comparison in viewport.
2. **Author primary screen** — authored corner assembly selected, Move/Rotate + world/local, element/frame/relation navigator, technical inspector and relation diagnostics.
3. **Represent primary screen** — several valid mappings plus one broken revision/rebind state, selected span/roll correspondence visible in viewport.
4. **Test primary screen** — authored editing visibly locked, transient steering/suspension-style controls, evaluated vs neutral comparison and exact Reset.
5. **Failure/detail concept** — revision mismatch/rebind + export-blocking health shown at readable scale if it is not clear enough in the four primary screens.

Use a normal desktop-editor viewport (target around 1440x900 or 1600x1000). A compact-laptop adaptation is reviewed after the primary system is coherent; phone is not a primary JURE authoring target in this gate.

## 11. FC-9 exit logic

- FC-9A closes when this contract survives the JV round trip and listed counterexamples.
- FC-9B closes only when the four coordinated concepts are readable, mutually consistent and implementable.
- FC-9C begins only after owner review/acceptance of the visual concept.
- Only then extract design tokens/component ownership and start replacing the old shell in small browser-validated slices.

Until FC-9C acceptance, **do not wire the new task contexts into the old shell as the final UI and do not start a cosmetic retrofit**.
