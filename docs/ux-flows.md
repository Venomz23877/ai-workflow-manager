# Primary UX Elements & Flows

This document outlines the high-level user experience for AI Workflow Manager, aligning the renderer UI and CLI surface with the system architecture and user requirements.

## Core UX Elements

1. **Dashboard & Workflow Library**
   - From the moment the app opens, the user lands on a dashboard that feels like a control tower. Every workflow appears as a card with its status, last run, and quick actions. Notifications slide in along the top-right edge—“loop completed,” “document generated,” “credential expiring.” A prominent “Create Workflow” button invites exploration.

2. **Visual Workflow Designer**
   - Opening a workflow launches a canvas surrounded by a floating palette of node types. Users drag a node onto the grid, the node springs into place, and connectors light up when they hover near another node. Clicking a node reveals a side panel describing entry prompts, exit actions, and triggers in prose; errors are highlighted inline (“This transition needs a validator”). A mini-map fades in when the canvas grows large, helping users navigate sprawling flows.

3. **Action & Execution Console**
   - When a workflow runs, the interface shifts to an execution console. The active node is framed front and center with a timeline marching down the left (entry actions, AI prompts, validator checks). Buttons for node actions sit beside a command cheat-sheet, encouraging users to cross between UI and CLI. AI outputs stream in like chat bubbles; progress bars animate as documents render. A status ticker confirms triggers as they fire.

4. **Document Workspace**
   - Selecting a document node opens a gently lit workspace: tabs across the top switch between Markdown, HTML, JSON, etc. Each editor uses syntax-aware coloring; Markdown reveals a split preview, HTML renders live in a panel. Saving the document offers to regenerate dependent workflow steps. Export controls pop in at the bottom corner with options to open the file location or download a bundled zip of latest outputs.

5. **Settings & Connector Management**
   - The settings area reads like a wizard—each section focuses on one domain. Credential entries use masked inputs with “Test Connection” badges that pulse green when successful. Storage options show a friendly matrix (Local SQLite highlighted as default, remote connectors greyed with “Coming Soon” labels). A playground lets users send test prompts to the chosen LLM before saving. File sandbox settings resemble a file picker with breadcrumb navigation.

6. **CLI Companion**
   - The CLI mirrors the UI ethos: commands print ASCII cards summarizing workflows, with color-coded statuses. When a workflow runs, the CLI streams structured JSON logs—ideal for redirecting into automation pipelines. A help command narrates available actions in plain language (“Type `actions invoke <node> <action>` to run an in-node action”).

## Primary User Flows

### A. Designing a New Workflow

Sasha, a workflow architect, starts on the dashboard and clicks “Create Workflow.” She chooses a blank canvas and drags a Decision node into place; the palette gently nudges her toward connecting it to a WorkStep. As she clicks each node, the property inspector narrates what it needs—“Add an entry prompt to guide the AI decision.” Sasha watches validation hints disappear as she fills in triggers, and she hits “Save Draft” knowing she can export the definition later.

### B. Configuring Connectors & Credentials

Miguel opens the settings wizard to hook up his company’s AI providers. He selects ChatGPT as default, pastes the API key, and hits “Test Connection.” A green badge slides in: “Success! 100 tokens consumed in test.” He adds a fallback Claude key, sets it for a specific workflow, and whitelists the team’s project folder so document actions never stray outside approved directories.

### C. Running and Monitoring a Workflow

Priya launches an existing workflow for policy review. The execution console shows the current node with a timeline of actions below. An AI-generated summary streams into view, and validators mark the result as “Needs review.” Priya manually triggers the “Request alternative summary” action; the console updates with the new output and a satisfied validator. Once complete, a “View Summary” button opens the run’s highlights and document bundle.

### D. Editing Documents within a Workflow

Liam needs to tweak the onboarding guide template. From the WorkStep node, he opens the document workspace: Markdown on the left, rendered preview on the right. He edits the checklist, watches the preview update, and clicks “Save & Revalidate.” The workflow engine notes the template change and flags downstream nodes to regenerate outputs next run.

### E. CLI-Driven Execution

Jess scripts a nightly job using the CLI. She runs `ai-workflow-manager workflows run compliance-check --json` and pipes the output to a log file. As the workflow progresses, the terminal prints structured messages—entries for node actions, trigger firings, document paths. When she needs to intervene, she runs `ai-workflow-manager actions invoke loop-node force-next` and sees confirmation inline.

### F. Managing Workflow Templates

Nora curates templates for the support team. In the Templates panel, she duplicates the “Troubleshooting Guide” workflow, updates the metadata (“Version 2025-Q1”), and tags it for mobile products. She exports the template to share with contractors and marks the original as deprecated, prompting a banner in the designer reminding authors to upgrade.

## Interaction Guidelines

- **Consistency**: Keep node configuration UI consistent between visual designer and CLI prompts.
- **Feedback**: Provide real-time status updates (spinners, progress bars, toast notifications) for long-running operations.
- **Safety**: Confirm destructive actions (delete node, purge workflow, overwrite document).
- **Accessibility**: Support keyboard navigation, high-contrast mode, and screen reader tags.
- **Extensibility**: Design panels and property editors to accommodate new node types/actions without major redesign.

## Open UX Questions

- Collaboration model (multi-user editing, presence indicators).
- Mobile/Tablet adaptations for monitoring workflows.
- In-app tutorials or guided tours for onboarding.
- Visualization of workflow execution history (timeline vs table).

---

This UX reference should evolve alongside design prototypes and user testing results. Coordinate updates with `docs/architecture.md` and `docs/user-requirements.md` to keep documentation aligned.
