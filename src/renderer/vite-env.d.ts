/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    getAppVersion: () => Promise<string>
    getWorkflows: () => Promise<any[]>
    getWorkflow: (id: number) => Promise<any>
    createWorkflow: (workflow: { name: string; description: string }) => Promise<any>
    updateWorkflow: (
      id: number,
      data: { name?: string; description?: string; status?: string }
    ) => Promise<any>
    deleteWorkflow: (id: number) => Promise<{ success: boolean }>
    listTestSuites: () => Promise<import('../shared/testRunnerTypes').ListedTestSuite[]>
    runTestSuite: (suiteId: string) => Promise<import('../shared/testRunnerTypes').TestRunResult>
    exportTestResult: (
      result: import('../shared/testRunnerTypes').TestRunResult
    ) => Promise<{ path?: string; canceled: boolean }>
    exportAllTestResults: (
      bundle: import('../shared/testRunnerTypes').TestRunBundle
    ) => Promise<{ path?: string; canceled: boolean }>
    listWorkflowDrafts: () => Promise<import('../core/workflows/workflowTypes').WorkflowDraft[]>
    getWorkflowDraft: (
      id: number
    ) => Promise<import('../core/workflows/workflowTypes').WorkflowDraft | null>
    createWorkflowDraft: (payload: {
      name: string
      description?: string
    }) => Promise<import('../core/workflows/workflowTypes').WorkflowDraft>
    updateWorkflowDraft: (
      id: number,
      input: import('../core/workflows/workflowTypes').WorkflowDraftUpdateInput
    ) => Promise<import('../core/workflows/workflowTypes').WorkflowDraft>
    autosaveWorkflowDraft: (
      id: number,
      content: import('../core/workflows/workflowTypes').WorkflowDraftContent
    ) => Promise<import('../core/workflows/workflowTypes').WorkflowDraft>
    deleteWorkflowDraft: (id: number) => Promise<{ success: boolean }>
    validateWorkflowDraft: (
      id: number
    ) => Promise<import('../core/workflows/workflowTypes').WorkflowDraftValidationResult>
    publishWorkflowDraft: (
      id: number
    ) => Promise<{
      workflow: import('../core/database').Workflow
      draft: import('../core/workflows/workflowTypes').WorkflowDraft
    }>
    listDocuments: () => Promise<import('../core/documents/documentRegistry').DocumentRecord[]>
    exportDocument: (
      payload: import('../core/documents/documentService').ExportDocumentPayload
    ) => Promise<{
      path: string
      record: import('../core/documents/documentRegistry').DocumentRecord
    }>
  }
}
