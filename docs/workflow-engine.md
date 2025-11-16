# Workflow Engine — Node Definitions

This document captures the initial workflow node taxonomy for AI Workflow Manager. Each node type defines:

- **Entry actions**: predefined procedures invoked automatically when entering the node (driven by AI prompts or connector logic).
- **Interactive actions**: operations the user can trigger via CLI or future UI controls while the workflow remains in the node.
- **Exit actions**: cleanup or follow-on tasks invoked when leaving the node via a transition.
- **Triggers**: events that cause transitions to fire immediately (subject to validators).
- **Validators**: checks that must pass before a trigger can advance the workflow.

## Node Types

### 1. Decision Node

- **Purpose**: Evaluate conditions or AI reasoning to choose the next path.
- **Entry actions**:
  - Gather context (load prior outputs, metadata).
  - Run decision prompt via selected LLM connector.
- **Interactive actions**:
  - Inspect AI recommendation(s).
  - Override or confirm choice manually.
  - Request alternative recommendations.
- **Exit actions**:
  - Record selected branch and rationale.
- **Triggers**:
  - `ai-decision`: fires when AI returns a confident choice.
  - `manual-selection`: user picks a branch explicitly.
- **Validators**:
  - `confidence-threshold`: ensure AI confidence meets configured threshold.
  - `policy-check`: confirm selected path meets business rules.

### 2. WorkStep Node

- **Purpose**: Execute a concrete task or sequence (e.g., generate content, run an integration call).
- **Entry actions**:
  - Load task-specific configuration.
  - Kick off primary AI procedure or connector call.
- **Interactive actions**:
  - Pause/resume in-flight operations.
  - Rerun step with adjusted parameters.
  - Capture notes or artifacts produced during the step.
- **Exit actions**:
  - Persist outputs to local/remote storage.
  - Emit completion summary for downstream nodes.
- **Triggers**:
  - `task-complete`: fires when the main action finishes successfully.
  - `manual-advance`: user forces completion (e.g., after reviewing results).
- **Validators**:
  - `output-validation`: ensure required artifacts exist and pass basic checks.
  - `error-free`: verify no unrecovered errors remain before exit.

### 3. Loop Node

- **Purpose**: Repeat a sub-process until a condition is met (e.g., iterate on drafts, polling external systems).
- **Entry actions**:
  - Initialize loop counter/state.
  - Set up monitoring prompts or timers.
- **Interactive actions**:
  - Force next iteration.
  - Adjust loop parameters (max iterations, exit criteria).
  - Break the loop manually.
- **Exit actions**:
  - Persist final aggregated result.
  - Reset loop state and counters.
- **Triggers**:
  - `iteration-complete`: fires after each pass, normally returning to the same node.
  - `condition-met`: advances to the next node when exit criteria are satisfied.
  - `manual-break`: user stops the loop and advances to a fallback path.
- **Validators**:
  - `iteration-limit`: ensure iteration count stays within configured bounds.
  - `exit-condition`: confirm the loop should terminate when `condition-met` fires.

## Next Steps

- Formalize these node definitions in TypeScript interfaces (e.g., `DecisionNodeConfig`, `WorkStepNodeConfig`, `LoopNodeConfig`) under `src/core/workflow/`.
- Extend the CLI to allow creating and editing nodes with their associated actions, triggers, and validators.
- Update the future visual designer requirements to include palettes and property panels for each node type.
