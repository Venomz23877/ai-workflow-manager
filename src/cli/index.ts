#!/usr/bin/env node

import { Command } from 'commander'
import path from 'path'
import { WorkflowDatabase } from '../core/database'
import { getAppDatabasePath } from '../core/appPaths'
import { AuditLogService } from '../core/audit-log'
import { ConfigService } from '../core/config/service'
import { CredentialVault } from '../core/credentials/vault'
import { ConnectorRegistry } from '../core/connectors/registry'
import { WorkflowDraftService } from '../core/workflows/workflowDraftService'
import { WorkflowPublishService } from '../core/workflows/workflowPublishService'
import { ValidationService } from '../core/workflows/validationService'
import { DocumentRegistry } from '../core/documents/documentRegistry'
import { DocumentService } from '../core/documents/documentService'
import { FileConnector } from '../core/files/fileConnector'
import { LoggingService } from '../core/logging/loggingService'
import { TelemetryService } from '../core/logging/telemetryService'
import { SchedulerService } from '../core/scheduler/schedulerService'
import { NotificationPreferenceService } from '../core/notifications/notificationPreferenceService'
import { BackupService } from '../core/ops/backupService'
import { SecurityScanner } from '../core/ops/securityScanner'
import { TemplateRegistry } from '../core/templates/templateRegistry'
import { TemplateDiffService } from '../core/templates/templateDiffService'
import fs from 'fs'

const program = new Command()
const auditLog = new AuditLogService(getAppDatabasePath())
const configService = new ConfigService()
const credentialVault = new CredentialVault()
const connectorRegistry = new ConnectorRegistry()
const workflowDb = new WorkflowDatabase(getAppDatabasePath())
const validationService = new ValidationService()
const workflowDraftService = new WorkflowDraftService(configService)
const workflowPublishService = new WorkflowPublishService(
  workflowDb,
  workflowDraftService,
  validationService
)
const documentRegistry = new DocumentRegistry()
const fileConnector = new FileConnector()
const documentService = new DocumentService(documentRegistry, fileConnector)
const loggingService = new LoggingService()
const telemetryService = new TelemetryService(configService)
const notificationPrefs = new NotificationPreferenceService(configService)
const schedulerService = new SchedulerService(notificationPrefs, loggingService)
const backupService = new BackupService(loggingService)
const securityScanner = new SecurityScanner(loggingService)
const templateRegistry = new TemplateRegistry()
const templateDiffService = new TemplateDiffService()
const workflowCommand = program.command('workflow').description('Workflow operations')

const draftCommand = workflowCommand.command('draft').description('Manage workflow drafts')

draftCommand
  .command('list')
  .description('List workflow drafts')
  .action(() => {
    const drafts = workflowDraftService.listDrafts()
    if (!drafts.length) {
      console.log('\nℹ️  No drafts yet.\n')
      return
    }
    drafts.forEach((draft) => {
      console.log(`[${draft.id}] ${draft.name} v${draft.version} (${draft.status})`)
    })
  })

draftCommand
  .command('create')
  .description('Create a workflow draft')
  .argument('<name>')
  .option('-d, --description <description>', 'Draft description', '')
  .action((name, options) => {
    const draft = workflowDraftService.createDraft(name, options.description)
    console.log(`✅ Draft created [${draft.id}] ${draft.name}`)
  })

draftCommand
  .command('publish')
  .description('Validate and publish a workflow draft into workflows table')
  .argument('<id>')
  .action((id) => {
    const result = workflowPublishService.publishDraft(parseInt(id, 10))
    console.log(`🚀 Published draft ${result.draft.id} as workflow ${result.workflow.id}`)
  })

draftCommand
  .command('validate')
  .description('Validate a workflow draft')
  .argument('<id>')
  .action((id) => {
    const result = workflowDraftService.validateDraft(parseInt(id, 10))
    if (result.valid) {
      console.log('✅ Draft valid')
      if (result.warnings.length) {
        console.log('⚠️  Warnings:')
        result.warnings.forEach((warning) => console.log(` - ${warning}`))
      }
    } else {
      console.error('❌ Draft invalid:')
      result.errors.forEach((error) => console.error(` - ${error}`))
    }
  })

draftCommand
  .command('delete')
  .description('Delete a workflow draft')
  .argument('<id>')
  .action((id) => {
    workflowDraftService.deleteDraft(parseInt(id, 10))
    console.log(`🗑️  Deleted draft ${id}`)
  })

const documentCommand = program.command('document').description('Document workspace operations')

documentCommand
  .command('list')
  .description('List exported documents')
  .action(() => {
    const docs = documentService.listDocuments()
    if (!docs.length) {
      console.log('\nℹ️  No documents exported yet.\n')
      return
    }
    docs.forEach((doc) => {
      console.log(`[${doc.id}] ${doc.name} (${doc.type}) -> ${doc.path}`)
    })
  })

documentCommand
  .command('export')
  .description('Export a document from provided content')
  .argument('<name>')
  .option('-f, --format <format>', 'docx|pdf|markdown', 'markdown')
  .option('--file <path>', 'Path to content file')
  .option('--content <content>', 'Inline content string')
  .action(async (name, options) => {
    const allowedFormats = ['docx', 'pdf', 'markdown']
    if (!allowedFormats.includes(options.format)) {
      console.error('❌ Invalid format. Use docx, pdf, or markdown.')
      process.exit(1)
    }
    let content = options.content ?? ''
    if (options.file) {
      const contentPath = path.resolve(options.file)
      if (!fs.existsSync(contentPath)) {
        console.error('❌ Content file not found.')
        process.exit(1)
      }
      content = fs.readFileSync(contentPath, 'utf-8')
    }
    if (!content.trim()) {
      console.error('❌ Provide --content or --file with content to export.')
      process.exit(1)
    }
    const result = await documentService.exportDocument({
      name,
      format: options.format,
      content
    })
    console.log(`✅ Document saved: ${result.path}`)
  })

const opsCommand = program.command('ops').description('Operations utilities')

const telemetryCommand = opsCommand.command('telemetry').description('Telemetry controls')

telemetryCommand
  .command('enable')
  .description('Enable telemetry queueing')
  .action(() => {
    telemetryService.setEnabled(true)
    console.log('✅ Telemetry enabled')
  })

telemetryCommand
  .command('disable')
  .description('Disable telemetry queueing')
  .action(() => {
    telemetryService.setEnabled(false)
    console.log('ℹ️  Telemetry disabled')
  })

telemetryCommand
  .command('send')
  .description('Flush queued telemetry events to a diagnostics file')
  .action(() => {
    const output = telemetryService.flush()
    if (output) {
      console.log(`✅ Telemetry written to ${output}`)
    } else {
      console.log('ℹ️  No telemetry queued or telemetry disabled.')
    }
  })

opsCommand
  .command('logs')
  .description('Print current log file path')
  .action(() => {
    console.log(loggingService.getLogPath())
  })

const backupCommand = opsCommand.command('backup').description('Backup utilities')

backupCommand
  .command('create')
  .action(() => {
    const file = backupService.createBackup()
    console.log(`✅ Backup created at ${file}`)
  })

backupCommand
  .command('list')
  .action(() => {
    backupService.listBackups().forEach((file) => console.log(file))
  })

backupCommand
  .command('restore')
  .argument('<file>')
  .action((file) => {
    backupService.restoreBackup(file)
    console.log('♻️  Backup restored')
  })

opsCommand
  .command('security-scan')
  .description('Run npm audit and store report')
  .action(() => {
    const result = securityScanner.runScan()
    console.log(`Scan status: ${result.status} (${result.outputPath})`)
  })

const scheduleCommand = program.command('schedule').description('Workflow scheduler commands')

scheduleCommand
  .command('add')
  .description('Add a schedule for a workflow')
  .argument('<workflowId>')
  .argument('<cron>', 'cron expression placeholder (stored only)')
  .action((workflowId, cron) => {
    const schedule = schedulerService.addSchedule(parseInt(workflowId, 10), cron)
    console.log(`✅ Schedule ${schedule.id} created for workflow ${workflowId}`)
  })

scheduleCommand
  .command('list')
  .description('List schedules')
  .action(() => {
    const schedules = schedulerService.list()
    schedules.forEach((schedule) => {
      console.log(
        `[${schedule.id}] workflow ${schedule.workflowId} status ${schedule.status} next ${schedule.nextRunAt}`
      )
    })
  })

scheduleCommand
  .command('pause')
  .argument('<id>')
  .action((id) => {
    schedulerService.pause(parseInt(id, 10))
    console.log(`⏸️  Schedule ${id} paused`)
  })

scheduleCommand
  .command('resume')
  .argument('<id>')
  .action((id) => {
    schedulerService.resume(parseInt(id, 10))
    console.log(`▶️  Schedule ${id} resumed`)
  })

const notificationsCommand = program
  .command('notifications')
  .description('Notification preference commands')

notificationsCommand
  .command('get')
  .action(() => {
    console.log(JSON.stringify(notificationPrefs.getPreferences(), null, 2))
  })

notificationsCommand
  .command('set')
  .option('--quiet-start <time>', 'Quiet hours start (HH:mm)')
  .option('--quiet-end <time>', 'Quiet hours end (HH:mm)')
  .option('--channels <channels>', 'Comma-separated channels')
  .action((options) => {
    const prefs = notificationPrefs.getPreferences()
    if (options.quietStart) {
      prefs.quietHours.start = options.quietStart
    }
    if (options.quietEnd) {
      prefs.quietHours.end = options.quietEnd
    }
    if (options.channels) {
      prefs.channels = options.channels.split(',').map((c: string) => c.trim())
    }
    notificationPrefs.savePreferences(prefs)
    console.log('✅ Preferences updated')
  })

const templateCommand = program.command('template').description('Template registry commands')

templateCommand
  .command('create')
  .argument('<name>')
  .option('-d, --description <description>', 'Description', '')
  .option('--document <path>', 'Document path')
  .option('--workflow-version <id>', 'Workflow version id', '')
  .action((name, options) => {
    const template = templateRegistry.createTemplate({
      name,
      description: options.description,
      documentPath: options.document,
      workflowVersionId: options.workflowVersion ? parseInt(options.workflowVersion, 10) : undefined
    })
    console.log(`✅ Template ${template.id} created`)
  })

templateCommand
  .command('list')
  .action(() => {
    templateRegistry.listTemplates().forEach((tpl) => {
      console.log(`[${tpl.id}] ${tpl.name} v${tpl.version}`)
    })
  })

templateCommand
  .command('diff')
  .description('Diff two text files to generate revision notes')
  .argument('<oldFile>')
  .argument('<newFile>')
  .action((oldFile, newFile) => {
    const oldContent = fs.readFileSync(path.resolve(oldFile), 'utf-8')
    const newContent = fs.readFileSync(path.resolve(newFile), 'utf-8')
    const diff = templateDiffService.diff(oldContent, newContent)
    diff.forEach((line) => {
      const prefix = line.added ? '+' : line.removed ? '-' : ' '
      process.stdout.write(prefix + line.value)
    })
  })

const cleanup = () => {
  try {
    auditLog.close()
  } catch {
    // ignore
  }
  try {
    workflowDraftService.close()
  } catch {
    // ignore
  }
  try {
    workflowDb.close()
  } catch {
    // ignore
  }
  try {
    documentRegistry.close()
  } catch {
    // ignore
  }
  try {
    schedulerService.close()
  } catch {
    // ignore
  }
  try {
    templateRegistry.close()
  } catch {
    // ignore
  }
}

process.on('exit', cleanup)
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})

program.name('ai-workflow-manager').description('AI Workflow Manager CLI').version('0.1.0')

// List all workflows
program
  .command('list')
  .alias('ls')
  .description('List all workflows')
  .action(() => {
    const db = new WorkflowDatabase(getAppDatabasePath())
    const workflows = db.getAllWorkflows()

    if (workflows.length === 0) {
      console.log('No workflows found.')
      return
    }

    console.log('\n📋 Workflows:\n')
    workflows.forEach((workflow) => {
      const statusEmoji =
        {
          draft: '📝',
          active: '✅',
          paused: '⏸️',
          completed: '✔️'
        }[workflow.status] || '❓'

      console.log(`${statusEmoji} [${workflow.id}] ${workflow.name}`)
      console.log(`   Status: ${workflow.status}`)
      console.log(`   Description: ${workflow.description || 'No description'}`)
      console.log(`   Created: ${new Date(workflow.created_at).toLocaleString()}`)
      console.log()
    })

    db.close()
  })

// Create a new workflow
program
  .command('create')
  .alias('new')
  .description('Create a new workflow')
  .argument('<name>', 'workflow name')
  .option('-d, --description <description>', 'workflow description', '')
  .action((name, options) => {
    const db = new WorkflowDatabase(getAppDatabasePath())
    const workflow = db.createWorkflow(name, options.description)
    auditLog.logEvent({
      actor: 'cli',
      source: 'cli',
      action: 'workflow.create',
      target: `workflow:${workflow.id}`,
      metadata: { name: workflow.name }
    })

    console.log(`\n✅ Created workflow: ${workflow.name} (ID: ${workflow.id})`)
    console.log(`   Status: ${workflow.status}`)
    console.log(`   Description: ${workflow.description || 'No description'}\n`)

    db.close()
  })

// Show workflow details
program
  .command('show')
  .alias('info')
  .description('Show workflow details')
  .argument('<id>', 'workflow ID')
  .action((id) => {
    const db = new WorkflowDatabase(getAppDatabasePath())
    const workflow = db.getWorkflow(parseInt(id))

    if (!workflow) {
      console.error(`❌ Workflow with ID ${id} not found.`)
      db.close()
      process.exit(1)
    }

    const statusEmoji =
      {
        draft: '📝',
        active: '✅',
        paused: '⏸️',
        completed: '✔️'
      }[workflow.status] || '❓'

    console.log('\n📋 Workflow Details:\n')
    console.log(`${statusEmoji} ${workflow.name}`)
    console.log(`   ID: ${workflow.id}`)
    console.log(`   Status: ${workflow.status}`)
    console.log(`   Description: ${workflow.description || 'No description'}`)
    console.log(`   Created: ${new Date(workflow.created_at).toLocaleString()}`)
    console.log(`   Updated: ${new Date(workflow.updated_at).toLocaleString()}`)
    console.log()

    db.close()
  })

// Update workflow
program
  .command('update')
  .description('Update a workflow')
  .argument('<id>', 'workflow ID')
  .option('-n, --name <name>', 'new name')
  .option('-d, --description <description>', 'new description')
  .option('-s, --status <status>', 'new status (draft|active|paused|completed)')
  .action((id, options) => {
    const db = new WorkflowDatabase(getAppDatabasePath())
    const updateData: any = {}

    if (options.name) updateData.name = options.name
    if (options.description) updateData.description = options.description
    if (options.status) {
      if (!['draft', 'active', 'paused', 'completed'].includes(options.status)) {
        console.error('❌ Invalid status. Use: draft, active, paused, or completed')
        db.close()
        process.exit(1)
      }
      updateData.status = options.status
    }

    if (Object.keys(updateData).length === 0) {
      console.error('❌ No updates specified. Use --name, --description, or --status')
      db.close()
      process.exit(1)
    }

    const workflow = db.updateWorkflow(parseInt(id), updateData)

    if (!workflow) {
      console.error(`❌ Workflow with ID ${id} not found.`)
      db.close()
      process.exit(1)
    }

    console.log(`\n✅ Updated workflow: ${workflow.name} (ID: ${workflow.id})`)
    console.log(`   Status: ${workflow.status}`)
    console.log(`   Description: ${workflow.description || 'No description'}\n`)

    auditLog.logEvent({
      actor: 'cli',
      source: 'cli',
      action: 'workflow.update',
      target: `workflow:${workflow.id}`,
      metadata: updateData
    })

    db.close()
  })

// Delete workflow
program
  .command('delete')
  .alias('rm')
  .description('Delete a workflow')
  .argument('<id>', 'workflow ID')
  .option('-y, --yes', 'skip confirmation')
  .action((id, options) => {
    const db = new WorkflowDatabase(getAppDatabasePath())
    const workflow = db.getWorkflow(parseInt(id))

    if (!workflow) {
      console.error(`❌ Workflow with ID ${id} not found.`)
      db.close()
      process.exit(1)
    }

    if (!options.yes) {
      console.log(`⚠️  Warning: This will delete workflow "${workflow.name}" (ID: ${id})`)
      console.log('   Use -y flag to skip this confirmation.')
      db.close()
      process.exit(0)
    }

    db.deleteWorkflow(parseInt(id))
    console.log(`\n✅ Deleted workflow: ${workflow.name} (ID: ${id})\n`)

    auditLog.logEvent({
      actor: 'cli',
      source: 'cli',
      action: 'workflow.delete',
      target: `workflow:${id}`,
      metadata: { name: workflow.name }
    })

    db.close()
  })

// Database info
program
  .command('db-path')
  .description('Show database file path')
  .action(() => {
    console.log(`\n📁 Database path: ${getAppDatabasePath()}\n`)
  })

const connectorCommand = program.command('connector').description('Manage connectors')

connectorCommand
  .command('list')
  .description('List registered connectors')
  .action(() => {
    const connectors = connectorRegistry.listConnectors()
    if (!connectors.length) {
      console.log('\nℹ️  No connectors registered yet.\n')
      return
    }
    console.log('\n🔌 Connectors:\n')
    connectors.forEach((connector) => {
      console.log(
        `${connector.id} — ${connector.name} (${connector.kind}) [${connector.status.toUpperCase()}]`
      )
      console.log(`   Version: ${connector.version}`)
      if (connector.description) {
        console.log(`   ${connector.description}`)
      }
      console.log()
    })
  })

connectorCommand
  .command('info')
  .description('Show connector details')
  .argument('<id>', 'Connector id')
  .action((id) => {
    const connector = connectorRegistry.getConnector(id)
    if (!connector) {
      console.error(`\n❌ Connector "${id}" not found.\n`)
      process.exit(1)
    }
    console.log(`\n🔌 ${connector.name} (${connector.kind})`)
    console.log(`ID: ${connector.id}`)
    console.log(`Version: ${connector.version}`)
    if (connector.description) {
      console.log(`Description: ${connector.description}`)
    }
    if (connector.capabilities.length) {
      console.log('\nCapabilities:')
      connector.capabilities.forEach((cap) => {
        console.log(` - ${cap.name}: ${cap.description}`)
      })
    }
    if (connector.lastHealthCheck) {
      console.log('\nLast Health Check:')
      console.log(
        ` Status: ${connector.lastHealthCheck.status.toUpperCase()} (${connector.lastHealthCheck.message ?? 'n/a'})`
      )
    }
    console.log()
  })

connectorCommand
  .command('test')
  .description('Run connector health check')
  .argument('<id>', 'Connector id')
  .action(async (id) => {
    try {
      const result = await connectorRegistry.testConnector(id)
      console.log(
        `\n✅ Connector ${id} responded with status ${result.status.toUpperCase()}${result.message ? ` — ${result.message}` : ''}\n`
      )
    } catch (error) {
      console.error(
        `\n❌ Failed to test connector "${id}": ${error instanceof Error ? error.message : String(error)}\n`
      )
      process.exit(1)
    }
  })

const configCommand = program.command('config').description('Manage configuration settings')

configCommand
  .command('get')
  .description('Get config value by path (dot notation)')
  .argument('<path>')
  .action((pathArg) => {
    const value = configService.get(pathArg)
    console.log(JSON.stringify(value, null, 2))
  })

configCommand
  .command('set')
  .description('Set config value by path; value interpreted as JSON')
  .argument('<path>')
  .argument('<value>')
  .action(async (pathArg, valueArg) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(valueArg)
    } catch {
      parsed = valueArg
    }
    await configService.set(pathArg, parsed)
    auditLog.logEvent({
      actor: 'cli',
      source: 'config',
      action: 'config.set',
      target: pathArg,
      metadata: { value: parsed }
    })
    console.log(`✅ Updated ${pathArg}`)
  })

const credentialsCommand = program.command('credentials').description('Manage stored credentials')

credentialsCommand
  .command('add')
  .description('Store a credential secret')
  .argument('<key>', 'Credential key (e.g., connector:llm:openai)')
  .option('-s, --secret <secret>', 'Secret value (omit to read from STDIN)')
  .action(async (key, options) => {
    let secret: string | undefined = options.secret
    if (!secret) {
      if (!process.stdin.isTTY) {
        secret = await readSecretFromStdin()
      }
    }
    if (!secret) {
      console.error('❌ Please provide a secret via --secret or pipe input.')
      process.exit(1)
    }
    await credentialVault.storeSecret({ key, value: secret })
    auditLog.logEvent({
      actor: 'cli',
      source: 'credentials',
      action: 'credential.add',
      target: key
    })
    console.log(`✅ Stored secret for ${key}`)
  })

credentialsCommand
  .command('list')
  .description('List credential entries (keys only)')
  .option('-p, --prefix <prefix>', 'Filter by key prefix')
  .action(async (options) => {
    const entries = await credentialVault.listSecrets(options.prefix)
    if (!entries.length) {
      console.log('\nℹ️  No credentials found.\n')
      return
    }
    console.log('\n🔑 Credentials:\n')
    entries.forEach((entry) => {
      console.log(`- ${entry.key}`)
      if (entry.metadata && Object.keys(entry.metadata).length) {
        console.log(`   metadata: ${JSON.stringify(entry.metadata)}`)
      }
    })
  })

credentialsCommand
  .command('remove')
  .description('Delete a credential secret')
  .argument('<key>')
  .action(async (key) => {
    await credentialVault.deleteSecret(key)
    auditLog.logEvent({
      actor: 'cli',
      source: 'credentials',
      action: 'credential.remove',
      target: key
    })
    console.log(`✅ Removed secret for ${key}`)
  })

const documentCommand = program.command('doc').description('Document operations')

documentCommand
  .command('list')
  .description('List documents in registry')
  .action(() => {
    const docs = documentRegistry.list()
    if (!docs.length) {
      console.log('\nℹ️  No documents found.\n')
      return
    }
    docs.forEach((doc) => {
      console.log(`[${doc.id}] ${doc.name} (${doc.type}) v${doc.version} — ${doc.path}`)
    })
  })

documentCommand
  .command('export')
  .description('Export document content to file')
  .argument('<name>', 'Document name')
  .argument('<type>', 'docx|pdf|markdown')
  .argument('<content>', 'Raw content')
  .action(async (name, type, content) => {
    let builder
    if (type === 'docx') {
      builder = new DocxBuilder()
    } else if (type === 'pdf') {
      builder = new PdfBuilder()
    } else {
      builder = new MarkdownBuilder()
    }
    const buffer = await builder.build(content)
    const relativePath = path.join(
      'documents',
      `${name}-${Date.now()}.${type === 'markdown' ? 'md' : type}`
    )
    const savedPath = fileConnector.writeFile(relativePath, buffer)
    const record = documentRegistry.add({
      name,
      type,
      path: savedPath,
      version: 1
    })
    auditLog.logEvent({
      actor: 'cli',
      source: 'documents',
      action: 'document.export',
      target: `document:${record.id}`,
      metadata: { path: savedPath, type }
    })
    console.log(`✅ Exported document to ${savedPath}`)
  })

program
  .command('audit')
  .description('Audit log operations')
  .option('-l, --limit <number>', 'number of entries to show', '20')
  .option('-a, --actor <actor>', 'filter by actor')
  .option('-s, --source <source>', 'filter by source')
  .option('-t, --action <action>', 'filter by action')
  .action((options) => {
    const limit = Math.max(parseInt(options.limit, 10) || 20, 1)
    const entries = auditLog.listEntries({
      limit,
      actor: options.actor,
      source: options.source,
      action: options.action
    })

    if (!entries.length) {
      console.log('\nℹ️  No audit log entries found.\n')
      return
    }

    console.log(`\n📜 Showing latest ${entries.length} audit events:\n`)
    entries.forEach((entry) => {
      const timestamp = new Date(entry.timestamp).toLocaleString()
      console.log(`[${timestamp}] (${entry.source}) ${entry.actor} → ${entry.action}`)
      if (entry.target) {
        console.log(`   target: ${entry.target}`)
      }
      if (entry.metadata && Object.keys(entry.metadata).length) {
        console.log(`   metadata: ${JSON.stringify(entry.metadata)}`)
      }
    })
    console.log()
  })

program.parse()

function readSecretFromStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    process.stdin.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8').trim()))
    process.stdin.on('error', reject)
  })
}
