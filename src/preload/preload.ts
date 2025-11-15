import { contextBridge, ipcRenderer } from 'electron'
import { ListedTestSuite, TestRunResult, TestRunBundle } from '../shared/testRunnerTypes'
import { Workflow } from '../core/database'
import { ConnectorSummary, HealthCheckResult } from '../core/connectors/types'
import {
  WorkflowDraft,
  WorkflowDraftContent,
  WorkflowDraftUpdateInput,
  WorkflowDraftValidationResult
} from '../core/workflows/workflowTypes'
import { DocumentRecord } from '../core/documents/documentRegistry'
import { ExportDocumentPayload } from '../core/documents/documentService'
import { NotificationPreferences } from '../core/notifications/notificationPreferenceService'
import { ScheduleRecord } from '../core/scheduler/schedulerService'
import { TemplateRecord } from '../core/templates/templateRegistry'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Workflow operations
  getWorkflows: () => ipcRenderer.invoke('get-workflows'),
  getWorkflow: (id: number) => ipcRenderer.invoke('get-workflow', id),
  createWorkflow: (workflow: { name: string; description: string }) =>
    ipcRenderer.invoke('create-workflow', workflow),
  updateWorkflow: (id: number, data: { name?: string; description?: string; status?: string }) =>
    ipcRenderer.invoke('update-workflow', id, data),
  deleteWorkflow: (id: number) => ipcRenderer.invoke('delete-workflow', id),

  // Test console
  listTestSuites: (): Promise<ListedTestSuite[]> => ipcRenderer.invoke('list-test-suites'),
  runTestSuite: (suiteId: string): Promise<TestRunResult> =>
    ipcRenderer.invoke('run-test-suite', suiteId),

  // Connectors
  listConnectors: (): Promise<ConnectorSummary[]> => ipcRenderer.invoke('connectors:list'),
  getConnectorDetails: (id: string): Promise<ConnectorSummary | null> =>
    ipcRenderer.invoke('connectors:details', id),
  testConnector: (id: string): Promise<HealthCheckResult> =>
    ipcRenderer.invoke('connectors:test', id),

  // Config
  getConfigValue: (path: string): Promise<unknown> => ipcRenderer.invoke('config:get', path),
  setConfigValue: (path: string, value: unknown): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('config:set', path, value),
  listConfigSections: (): Promise<string[]> => ipcRenderer.invoke('config:list-sections'),

  // Test results export
  exportTestResult: (result: TestRunResult): Promise<{ path?: string; canceled: boolean }> =>
    ipcRenderer.invoke('test-results:export', result),
  exportAllTestResults: (bundle: TestRunBundle): Promise<{ path?: string; canceled: boolean }> =>
    ipcRenderer.invoke('test-results:export-batch', bundle),

  // Workflow drafts
  listWorkflowDrafts: (): Promise<WorkflowDraft[]> => ipcRenderer.invoke('workflow-drafts:list'),
  getWorkflowDraft: (id: number): Promise<WorkflowDraft | null> =>
    ipcRenderer.invoke('workflow-drafts:get', id),
  createWorkflowDraft: (payload: { name: string; description?: string }): Promise<WorkflowDraft> =>
    ipcRenderer.invoke('workflow-drafts:create', payload),
  updateWorkflowDraft: (id: number, input: WorkflowDraftUpdateInput): Promise<WorkflowDraft> =>
    ipcRenderer.invoke('workflow-drafts:update', id, input),
  autosaveWorkflowDraft: (id: number, content: WorkflowDraftContent): Promise<WorkflowDraft> =>
    ipcRenderer.invoke('workflow-drafts:autosave', id, content),
  deleteWorkflowDraft: (id: number): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('workflow-drafts:delete', id),
  validateWorkflowDraft: (id: number): Promise<WorkflowDraftValidationResult> =>
    ipcRenderer.invoke('workflow-drafts:validate', id),
  publishWorkflowDraft: (id: number) => ipcRenderer.invoke('workflow-drafts:publish', id),

  // Documents
  listDocuments: (): Promise<DocumentRecord[]> => ipcRenderer.invoke('documents:list'),
  exportDocument: (payload: ExportDocumentPayload) => ipcRenderer.invoke('documents:export', payload),

  // Notifications & Scheduler
  getNotificationPreferences: () => ipcRenderer.invoke('notifications:get-preferences'),
  setNotificationPreferences: (prefs: NotificationPreferences) =>
    ipcRenderer.invoke('notifications:set-preferences', prefs),
  addSchedule: (workflowId: number, cron: string) => ipcRenderer.invoke('scheduler:add', workflowId, cron),
  listSchedules: () => ipcRenderer.invoke('scheduler:list'),
  pauseSchedule: (id: number) => ipcRenderer.invoke('scheduler:pause', id),
  resumeSchedule: (id: number) => ipcRenderer.invoke('scheduler:resume', id),
  createTemplate: (payload: {
    name: string
    description?: string
    documentPath?: string
    workflowVersionId?: number
  }) => ipcRenderer.invoke('templates:create', payload),
  listTemplates: () => ipcRenderer.invoke('templates:list'),
  listTemplateRevisions: (templateId: number) => ipcRenderer.invoke('templates:revisions', templateId)
})

// Type definitions for TypeScript
export type ElectronAPI = {
  getAppVersion: () => Promise<string>
  getWorkflows: () => Promise<any[]>
  getWorkflow: (id: number) => Promise<any>
  createWorkflow: (workflow: { name: string; description: string }) => Promise<any>
  updateWorkflow: (
    id: number,
    data: { name?: string; description?: string; status?: string }
  ) => Promise<any>
  deleteWorkflow: (id: number) => Promise<{ success: boolean }>
  listTestSuites: () => Promise<ListedTestSuite[]>
  runTestSuite: (suiteId: string) => Promise<TestRunResult>
  listConnectors: () => Promise<ConnectorSummary[]>
  getConnectorDetails: (id: string) => Promise<ConnectorSummary | null>
  testConnector: (id: string) => Promise<HealthCheckResult>
  getConfigValue: (path: string) => Promise<unknown>
  setConfigValue: (path: string, value: unknown) => Promise<{ success: boolean }>
  listConfigSections: () => Promise<string[]>
  exportTestResult: (result: TestRunResult) => Promise<{ path?: string; canceled: boolean }>
  exportAllTestResults: (bundle: TestRunBundle) => Promise<{ path?: string; canceled: boolean }>
  listWorkflowDrafts: () => Promise<WorkflowDraft[]>
  getWorkflowDraft: (id: number) => Promise<WorkflowDraft | null>
  createWorkflowDraft: (payload: { name: string; description?: string }) => Promise<WorkflowDraft>
  updateWorkflowDraft: (id: number, input: WorkflowDraftUpdateInput) => Promise<WorkflowDraft>
  autosaveWorkflowDraft: (id: number, content: WorkflowDraftContent) => Promise<WorkflowDraft>
  deleteWorkflowDraft: (id: number) => Promise<{ success: boolean }>
  validateWorkflowDraft: (id: number) => Promise<WorkflowDraftValidationResult>
  publishWorkflowDraft: (id: number) => Promise<{ workflow: Workflow; draft: WorkflowDraft }>
  listDocuments: () => Promise<DocumentRecord[]>
  exportDocument: (payload: ExportDocumentPayload) => Promise<{ path: string; record: DocumentRecord }>
  getNotificationPreferences: () => Promise<NotificationPreferences>
  setNotificationPreferences: (prefs: NotificationPreferences) => Promise<NotificationPreferences>
  addSchedule: (workflowId: number, cron: string) => Promise<ScheduleRecord>
  listSchedules: () => Promise<ScheduleRecord[]>
  pauseSchedule: (id: number) => Promise<{ success: boolean }>
  resumeSchedule: (id: number) => Promise<{ success: boolean }>
  createTemplate: (
    payload: { name: string; description?: string; documentPath?: string; workflowVersionId?: number }
  ) => Promise<TemplateRecord>
  listTemplates: () => Promise<TemplateRecord[]>
  listTemplateRevisions: (templateId: number) => Promise<any[]>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
