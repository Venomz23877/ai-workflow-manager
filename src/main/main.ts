import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { WorkflowDatabase } from '../core/database'
import { ConfigService } from '../core/config/service'
import { CredentialVault } from '../core/credentials/vault'
import { ConnectorRegistry } from '../core/connectors/registry'
import { ManagedConnectorDefinition } from '../core/connectors/types'
import { getAppDatabasePath } from '../core/appPaths'
import { AuditLogService } from '../core/audit-log'
import { TestRunnerService } from './services/testRunner'
import { TestRunBundle, TestRunResult } from '../shared/testRunnerTypes'
import { FileConnector } from '../core/files/fileConnector'
import { WorkflowDraftService } from '../core/workflows/workflowDraftService'
import { WorkflowDraftContent, WorkflowDraftUpdateInput } from '../core/workflows/workflowTypes'
import { ValidationService } from '../core/workflows/validationService'
import { WorkflowRuntime } from '../core/workflows/workflowRuntime'
import { DocumentRegistry } from '../core/documents/documentRegistry'
import { DocumentService, ExportDocumentPayload } from '../core/documents/documentService'
import { WorkflowPublishService } from '../core/workflows/workflowPublishService'
import { LoggingService } from '../core/logging/loggingService'
import { TelemetryService } from '../core/logging/telemetryService'
import { NotificationPreferenceService } from '../core/notifications/notificationPreferenceService'
import { SchedulerService } from '../core/scheduler/schedulerService'
import { SchedulerRunner } from '../core/scheduler/schedulerRunner'
import { RetentionService } from '../core/ops/retentionService'
import { TemplateRegistry } from '../core/templates/templateRegistry'

let mainWindow: BrowserWindow | null = null
let db: WorkflowDatabase
let configService: ConfigService
let credentialVault: CredentialVault
let connectorRegistry: ConnectorRegistry
let auditLog: AuditLogService | null = null
let fileConnector: FileConnector
let workflowDraftService: WorkflowDraftService
let validationService: ValidationService
let workflowRuntime: WorkflowRuntime
let documentRegistry: DocumentRegistry
let documentService: DocumentService
let workflowPublishService: WorkflowPublishService
let loggingService: LoggingService
let telemetryService: TelemetryService
let notificationPrefs: NotificationPreferenceService
let schedulerService: SchedulerService
let schedulerRunner: SchedulerRunner
let retentionService: RetentionService
let templateRegistry: TemplateRegistry
const isDevelopment = process.env.NODE_ENV === 'development'
const testRunner = new TestRunnerService()

async function saveJsonWithDialog(
  defaultFileName: string,
  data: unknown,
  title: string
): Promise<{ canceled: boolean; path?: string }> {
  const dialogOptions: Electron.SaveDialogOptions = {
    title,
    defaultPath: path.join(app.getPath('documents'), defaultFileName),
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  }

  const { canceled, filePath } = mainWindow
    ? await dialog.showSaveDialog(mainWindow, dialogOptions)
    : await dialog.showSaveDialog(dialogOptions)
  if (canceled || !filePath) {
    return { canceled: true }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  return { canceled: false, path: filePath }
}

function getPreloadPath(appBasePath: string) {
  return path.join(appBasePath, 'dist', 'preload', 'preload', 'preload.js')
}

function getRendererPath(appBasePath: string) {
  return path.join(appBasePath, 'dist', 'renderer', 'index.html')
}

function createWindow() {
  const appBasePath = app.getAppPath()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: getPreloadPath(appBasePath),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false, // Show when ready
    backgroundColor: '#1a1a1a'
  })

  // Load the app
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(getRendererPath(appBasePath))
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(async () => {
  const dbPath = getAppDatabasePath()
  db = new WorkflowDatabase(dbPath)
  auditLog = new AuditLogService(dbPath)
  configService = new ConfigService()
  credentialVault = new CredentialVault()
  connectorRegistry = new ConnectorRegistry(configService, credentialVault)
  fileConnector = new FileConnector()
  validationService = new ValidationService()
  workflowRuntime = new WorkflowRuntime(validationService)
  workflowDraftService = new WorkflowDraftService(configService, dbPath, validationService)
  documentRegistry = new DocumentRegistry(dbPath)
  documentService = new DocumentService(documentRegistry, fileConnector)
  workflowPublishService = new WorkflowPublishService(db, workflowDraftService, validationService)
  loggingService = new LoggingService()
  telemetryService = new TelemetryService(configService)
  notificationPrefs = new NotificationPreferenceService(configService)
  schedulerService = new SchedulerService(notificationPrefs, loggingService, dbPath)
  retentionService = new RetentionService(configService, loggingService)
  schedulerRunner = new SchedulerRunner(
    schedulerService,
    db,
    workflowRuntime,
    loggingService,
    notificationPrefs,
    retentionService
  )
  schedulerRunner.start()
  templateRegistry = new TemplateRegistry(dbPath)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  db?.close()
  auditLog?.close()
  workflowDraftService?.close()
  documentRegistry?.close()
  schedulerService?.close()
  schedulerRunner?.stop()
  templateRegistry?.close()
})

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('logging:get-path', () => loggingService.getLogPath())
ipcMain.handle('telemetry:get-enabled', () => telemetryService.isEnabled())
ipcMain.handle('telemetry:set-enabled', (_, enabled: boolean) => {
  telemetryService.setEnabled(enabled)
  return telemetryService.isEnabled()
})

ipcMain.handle('get-workflows', async () => {
  try {
    return db.getAllWorkflows()
  } catch (error) {
    console.error('Error getting workflows:', error)
    throw error
  }
})

ipcMain.handle('create-workflow', async (_, workflow: { name: string; description: string }) => {
  try {
    return db.createWorkflow(workflow.name, workflow.description)
  } catch (error) {
    console.error('Error creating workflow:', error)
    throw error
  }
})

ipcMain.handle(
  'update-workflow',
  async (_, id: number, data: { name?: string; description?: string; status?: string }) => {
    try {
      return db.updateWorkflow(id, data)
    } catch (error) {
      console.error('Error updating workflow:', error)
      throw error
    }
  }
)

ipcMain.handle('delete-workflow', async (_, id: number) => {
  try {
    db.deleteWorkflow(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting workflow:', error)
    throw error
  }
})

ipcMain.handle('get-workflow', async (_, id: number) => {
  try {
    return db.getWorkflow(id)
  } catch (error) {
    console.error('Error getting workflow:', error)
    throw error
  }
})

ipcMain.handle('connectors:list', () => {
  return connectorRegistry.listConnectors()
})

ipcMain.handle('connectors:details', (_, id: string) => {
  return connectorRegistry.getConnector(id) ?? null
})

ipcMain.handle('connectors:test', async (_, id: string) => {
  return connectorRegistry.testConnector(id)
})

ipcMain.handle('connectors:register', async (_, definition: ManagedConnectorDefinition) => {
  return connectorRegistry.addManagedConnector(definition)
})

ipcMain.handle('connectors:remove', async (_, id: string) => {
  await connectorRegistry.removeManagedConnector(id)
  return { success: true }
})

ipcMain.handle('test-results:export', async (_, result: TestRunResult) => {
  const fileName = `test-result-${result.suiteId}-${Date.now()}.json`
  return saveJsonWithDialog(fileName, result, 'Save Test Result')
})

ipcMain.handle('test-results:export-batch', async (_, bundle: TestRunBundle) => {
  const fileName = `test-run-${Date.now()}.json`
  return saveJsonWithDialog(fileName, bundle, 'Save Test Results')
})

ipcMain.handle('config:get', (_, targetPath: string) => {
  return configService.get(targetPath)
})

ipcMain.handle('config:set', async (_, targetPath: string, value: unknown) => {
  await configService.set(targetPath, value)
  return { success: true }
})

ipcMain.handle('config:list-sections', () => {
  return configService.listSections()
})

ipcMain.handle('workflow-drafts:list', () => workflowDraftService.listDrafts())

ipcMain.handle('workflow-drafts:get', (_, id: number) => workflowDraftService.getDraft(id) ?? null)

ipcMain.handle('workflow-drafts:create', (_, payload: { name: string; description?: string }) => {
  if (!payload.name?.trim()) {
    throw new Error('Draft name is required')
  }
  return workflowDraftService.createDraft(payload.name.trim(), payload.description)
})

ipcMain.handle('workflow-drafts:update', (_, id: number, input: WorkflowDraftUpdateInput) =>
  workflowDraftService.updateDraft(id, input)
)

ipcMain.handle('workflow-drafts:autosave', (_, id: number, content: WorkflowDraftContent) =>
  workflowDraftService.autosaveDraft(id, content)
)

ipcMain.handle('workflow-drafts:delete', (_, id: number) => {
  workflowDraftService.deleteDraft(id)
  return { success: true }
})

ipcMain.handle('workflow-drafts:validate', (_, id: number) =>
  workflowDraftService.validateDraft(id)
)

ipcMain.handle('workflow-drafts:publish', (_, id: number) => {
  const result = workflowPublishService.publishDraft(id)
  loggingService.log({
    category: 'workflow',
    action: 'publish',
    metadata: { draftId: id, workflowId: result.workflow.id }
  })
  telemetryService.enqueue({
    type: 'workflow.publish',
    payload: { workflowId: result.workflow.id }
  })
  return result
})

ipcMain.handle('documents:list', () => documentService.listDocuments())

ipcMain.handle('documents:export', async (_, payload: ExportDocumentPayload) => {
  const result = await documentService.exportDocument(payload)
  auditLog?.logEvent({
    actor: 'renderer',
    source: 'document-service',
    action: 'document.export',
    target: `document:${result.record.id}`,
    metadata: {
      name: result.record.name,
      type: result.record.type,
      path: result.path
    }
  })
  loggingService.log({
    category: 'documents',
    action: 'export',
    metadata: { documentId: result.record.id, format: result.record.type }
  })
  telemetryService.enqueue({
    type: 'document.export',
    payload: { format: result.record.type }
  })
  return result
})

ipcMain.handle('notifications:get-preferences', () => notificationPrefs.getPreferences())

ipcMain.handle('notifications:set-preferences', (_, prefs) => {
  notificationPrefs.savePreferences(prefs)
  return notificationPrefs.getPreferences()
})

ipcMain.handle('scheduler:add', (_, workflowId: number, cron: string, options) =>
  schedulerService.addSchedule(workflowId, cron, options ?? {})
)

ipcMain.handle('scheduler:list', () => schedulerService.list())

ipcMain.handle('scheduler:pause', (_, id: number) => {
  schedulerService.pause(id)
  return { success: true }
})

ipcMain.handle('scheduler:resume', (_, id: number) => {
  schedulerService.resume(id)
  return { success: true }
})

ipcMain.handle('scheduler:delete', (_, id: number) => {
  schedulerService.delete(id)
  return { success: true }
})

ipcMain.handle('templates:create', (_, payload) => templateRegistry.createTemplate(payload))
ipcMain.handle('templates:list', () => templateRegistry.listTemplates())
ipcMain.handle('templates:revisions', (_, templateId: number) =>
  templateRegistry.listRevisions(templateId)
)

ipcMain.handle('list-test-suites', () => {
  return testRunner.listSuites()
})

ipcMain.handle('run-test-suite', async (_, suiteId: string) => {
  const result = await testRunner.runSuite(suiteId)
  try {
    auditLog?.logEvent({
      actor: 'renderer',
      source: 'test-console',
      action: result.status === 'passed' ? 'test.run' : 'test.run.failed',
      target: `suite:${suiteId}`,
      metadata: {
        durationMs: result.durationMs,
        exitCode: result.exitCode,
        logs: result.logs.slice(-3)
      }
    })
  } catch (error) {
    console.error('Failed to log test run event', error)
  }
  return result
})
