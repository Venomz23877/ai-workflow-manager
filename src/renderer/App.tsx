interface ConnectorSummary {
  id: string
  name: string
  kind: string
  status: string
  version: string
  description?: string
  lastHealthCheck?: {
    status: string
    message?: string
    latencyMs?: number
  }
}
interface DocumentRecord {
  id: number
  name: string
  type: 'docx' | 'pdf' | 'markdown'
  path: string
  version: number
  updatedAt: string
}

interface NotificationPreferences {
  quietHours: {
    start: string
    end: string
  }
  channels: string[]
}

interface ScheduleRecord {
  id: number
  workflowId: number
  cron: string
  timezone: string | null
  status: 'active' | 'paused'
  nextRunAt?: string | null
  lastRunAt?: string | null
  profile?: string | null
}

interface WorkflowDraftRecord {
  id: number
  name: string
  description: string
  status: string
  version: number
  createdAt: string
  updatedAt: string
  nodes: unknown[]
  transitions: unknown[]
}

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './App.css'
import { ListedTestSuite, TestRunBundle, TestRunResult } from '../shared/testRunnerTypes'

interface Workflow {
  id: number
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
}

type TabId = 'workflows' | 'tests' | 'diagnostics'

function App() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' })
  const [appVersion, setAppVersion] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('workflows')
  const [testSuites, setTestSuites] = useState<ListedTestSuite[]>([])
  const [testSuitesLoading, setTestSuitesLoading] = useState(false)
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null)
  const [testRunResult, setTestRunResult] = useState<TestRunResult | null>(null)
  const [runningSuiteId, setRunningSuiteId] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [connectors, setConnectors] = useState<ConnectorSummary[]>([])
  const [connectorLoading, setConnectorLoading] = useState(false)
  const [connectorError, setConnectorError] = useState<string | null>(null)
  const [showConnectorForm, setShowConnectorForm] = useState(false)
  const [connectorForm, setConnectorForm] = useState({
    id: '',
    name: '',
    kind: 'integration',
    version: '1.0.0',
    description: '',
    capabilities: '',
    requiresSecrets: ''
  })
  const [connectorSubmitting, setConnectorSubmitting] = useState(false)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [drafts, setDrafts] = useState<WorkflowDraftRecord[]>([])
  const [draftsLoading, setDraftsLoading] = useState(false)
  const [draftActionId, setDraftActionId] = useState<number | null>(null)
  const [documentForm, setDocumentForm] = useState({
    name: '',
    format: 'markdown' as DocumentRecord['type'],
    content: ''
  })
  const [isExportingDocument, setIsExportingDocument] = useState(false)
  const [logPath, setLogPath] = useState('')
  const [telemetryEnabled, setTelemetryEnabledState] = useState(false)
  const [telemetryUpdating, setTelemetryUpdating] = useState(false)
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null)
  const [notificationForm, setNotificationForm] = useState({
    quietStart: '',
    quietEnd: '',
    channels: ''
  })
  const [notificationSaving, setNotificationSaving] = useState(false)
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false)

  const loadTestSuites = useCallback(async () => {
    try {
      setTestSuitesLoading(true)
      const suites = await window.electronAPI.listTestSuites()
      setTestSuites(suites)
      setSelectedSuiteId((prev) => prev ?? suites[0]?.id ?? null)
    } catch (error) {
      console.error('Failed to load test suites:', error)
    } finally {
      setTestSuitesLoading(false)
    }
  }, [])

  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true)
      const records = await window.electronAPI.listDocuments()
      setDocuments(records)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

  const loadDrafts = useCallback(async () => {
    try {
      setDraftsLoading(true)
      const data = await window.electronAPI.listWorkflowDrafts()
      setDrafts(data)
    } catch (error) {
      console.error('Failed to load drafts:', error)
    } finally {
      setDraftsLoading(false)
    }
  }, [])

  const loadDiagnostics = useCallback(async () => {
    try {
      setDiagnosticsLoading(true)
      setSchedulesLoading(true)
      const [path, telemetry, prefs, scheduleRecords] = await Promise.all([
        window.electronAPI.getLogPath(),
        window.electronAPI.getTelemetryEnabled(),
        window.electronAPI.getNotificationPreferences(),
        window.electronAPI.listSchedules()
      ])
      setLogPath(path)
      setTelemetryEnabledState(telemetry)
      setNotifications(prefs)
      setNotificationForm({
        quietStart: prefs.quietHours.start,
        quietEnd: prefs.quietHours.end,
        channels: prefs.channels.join(', ')
      })
      setSchedules(scheduleRecords)
    } catch (error) {
      console.error('Failed to load diagnostics:', error)
    } finally {
      setDiagnosticsLoading(false)
      setSchedulesLoading(false)
    }
  }, [])

  const refreshSchedules = useCallback(async () => {
    try {
      setSchedulesLoading(true)
      const scheduleRecords = await window.electronAPI.listSchedules()
      setSchedules(scheduleRecords)
    } catch (error) {
      console.error('Failed to load schedules:', error)
    } finally {
      setSchedulesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWorkflows()
    loadAppVersion()
    loadTestSuites()
    loadConnectors()
    loadDocuments()
    loadDrafts()
    loadDiagnostics()
  }, [loadTestSuites, loadDocuments, loadDrafts, loadDiagnostics])

  useEffect(() => {
    if (!selectedSuiteId && testSuites.length > 0) {
      setSelectedSuiteId(testSuites[0].id)
    } else if (selectedSuiteId && !testSuites.some((suite) => suite.id === selectedSuiteId)) {
      setSelectedSuiteId(testSuites[0]?.id ?? null)
    }
  }, [testSuites, selectedSuiteId])

  const loadAppVersion = async () => {
    const version = await window.electronAPI.getAppVersion()
    setAppVersion(version)
  }

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      const data = await window.electronAPI.getWorkflows()
      setWorkflows(data)
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkflow.name.trim()) return

    try {
      await window.electronAPI.createWorkflow(newWorkflow)
      setNewWorkflow({ name: '', description: '' })
      setShowCreateForm(false)
      loadWorkflows()
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  const handleDeleteWorkflow = async (id: number) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await window.electronAPI.deleteWorkflow(id)
        loadWorkflows()
      } catch (error) {
        console.error('Failed to delete workflow:', error)
      }
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await window.electronAPI.updateWorkflow(id, { status })
      loadWorkflows()
    } catch (error) {
      console.error('Failed to update workflow:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981'
      case 'paused':
        return '#f59e0b'
      case 'completed':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const handleRunSuite = async (suiteId: string) => {
    setRunningSuiteId(suiteId)
    setTestError(null)
    setTestRunResult(null)
    try {
      const result = await window.electronAPI.runTestSuite(suiteId)
      setTestRunResult(result)
      await loadTestSuites()
    } catch (error) {
      console.error('Failed to run suite:', error)
      setTestError(error instanceof Error ? error.message : 'Failed to run test suite')
    } finally {
      setRunningSuiteId(null)
    }
  }

  const loadConnectors = async () => {
    try {
      setConnectorLoading(true)
      setConnectorError(null)
      const data = await window.electronAPI.listConnectors()
      setConnectors(data)
    } catch (error) {
      console.error('Failed to load connectors:', error)
      setConnectorError(error instanceof Error ? error.message : 'Failed to load connectors')
    } finally {
      setConnectorLoading(false)
    }
  }

  const resetConnectorForm = () => {
    setConnectorForm({
      id: '',
      name: '',
      kind: 'integration',
      version: '1.0.0',
      description: '',
      capabilities: '',
      requiresSecrets: ''
    })
  }

  const handleConnectorFormChange = (field: keyof typeof connectorForm, value: string) => {
    setConnectorForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegisterConnector = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!connectorForm.id.trim() || !connectorForm.name.trim()) {
      alert('Connector ID and name are required.')
      return
    }
    try {
      setConnectorSubmitting(true)
      const capabilities = connectorForm.capabilities
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [name, desc] = entry.split(':')
          return { name: name.trim(), description: desc ? desc.trim() : undefined }
        })
      const requiresSecrets = connectorForm.requiresSecrets
        .split(',')
        .map((secret) => secret.trim())
        .filter(Boolean)
      await window.electronAPI.registerConnector({
        id: connectorForm.id,
        name: connectorForm.name,
        kind: connectorForm.kind as ConnectorSummary['kind'],
        version: connectorForm.version,
        description: connectorForm.description,
        capabilities,
        requiresSecrets
      })
      await loadConnectors()
      resetConnectorForm()
      setShowConnectorForm(false)
    } catch (error) {
      console.error('Failed to register connector:', error)
      alert('Failed to register connector.')
    } finally {
      setConnectorSubmitting(false)
    }
  }

  const handleRemoveConnector = async (id: string) => {
    if (!confirm(`Remove connector "${id}"?`)) return
    try {
      await window.electronAPI.removeConnector(id)
      await loadConnectors()
    } catch (error) {
      console.error('Failed to remove connector:', error)
      alert('Failed to remove connector.')
    }
  }

  const handleTestConnector = async (id: string) => {
    try {
      setConnectorLoading(true)
      await window.electronAPI.testConnector(id)
      await loadConnectors()
    } catch (error) {
      console.error('Connector test failed:', error)
      setConnectorError(error instanceof Error ? error.message : 'Connector test failed')
    } finally {
      setConnectorLoading(false)
    }
  }

  const handleDocumentFormChange = (field: 'name' | 'format' | 'content', value: string) => {
    setDocumentForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCopyLogPath = async () => {
    if (!logPath) return
    try {
      await navigator.clipboard.writeText(logPath)
      alert('Log path copied to clipboard.')
    } catch (error) {
      console.error('Failed to copy log path:', error)
      alert('Failed to copy log path.')
    }
  }

  const handleTelemetryToggle = async () => {
    try {
      setTelemetryUpdating(true)
      const updated = await window.electronAPI.setTelemetryEnabled(!telemetryEnabled)
      setTelemetryEnabledState(updated)
    } catch (error) {
      console.error('Failed to update telemetry setting:', error)
      alert('Failed to update telemetry setting.')
    } finally {
      setTelemetryUpdating(false)
    }
  }

  const handleNotificationInputChange = (
    field: 'quietStart' | 'quietEnd' | 'channels',
    value: string
  ) => {
    setNotificationForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!notifications) return
    try {
      setNotificationSaving(true)
      const channels = notificationForm.channels
        .split(',')
        .map((channel) => channel.trim())
        .filter(Boolean)
      const payload = {
        quietHours: {
          start: notificationForm.quietStart || notifications.quietHours.start,
          end: notificationForm.quietEnd || notifications.quietHours.end
        },
        channels: channels.length ? channels : notifications.channels
      }
      const updated = await window.electronAPI.setNotificationPreferences(payload)
      setNotifications(updated)
      setNotificationForm({
        quietStart: updated.quietHours.start,
        quietEnd: updated.quietHours.end,
        channels: updated.channels.join(', ')
      })
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      alert('Failed to save notification preferences.')
    } finally {
      setNotificationSaving(false)
    }
  }

  const handleValidateDraft = async (id: number) => {
    try {
      setDraftActionId(id)
      const result = await window.electronAPI.validateWorkflowDraft(id)
      if (result.valid) {
        alert(
          result.warnings.length
            ? `Valid with warnings:\n${result.warnings.join('\n')}`
            : 'Draft valid'
        )
      } else {
        alert(`Draft invalid:\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      console.error('Failed to validate draft:', error)
      alert('Failed to validate draft.')
    } finally {
      setDraftActionId(null)
    }
  }

  const handlePublishDraft = async (id: number) => {
    try {
      setDraftActionId(id)
      const result = await window.electronAPI.publishWorkflowDraft(id)
      alert(`Published workflow #${result.workflow.id}`)
      await loadWorkflows()
      await loadDrafts()
    } catch (error) {
      console.error('Failed to publish draft:', error)
      alert('Publish failed. Check validation errors in CLI/logs.')
    } finally {
      setDraftActionId(null)
    }
  }

  const handleDeleteDraft = async (id: number) => {
    if (!confirm('Delete this draft?')) {
      return
    }
    try {
      setDraftActionId(id)
      await window.electronAPI.deleteWorkflowDraft(id)
      await loadDrafts()
    } catch (error) {
      console.error('Failed to delete draft:', error)
      alert('Failed to delete draft.')
    } finally {
      setDraftActionId(null)
    }
  }

  const handleExportDocument = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!documentForm.name.trim() || !documentForm.content.trim()) {
      alert('Provide a document name and content before exporting.')
      return
    }
    try {
      setIsExportingDocument(true)
      const result = await window.electronAPI.exportDocument({
        name: documentForm.name,
        format: documentForm.format,
        content: documentForm.content
      })
      alert(`✅ Document saved to ${result.path}`)
      setDocumentForm({ name: '', format: documentForm.format, content: '' })
      await loadDocuments()
    } catch (error) {
      console.error('Failed to export document:', error)
      alert('Document export failed. Check logs for details.')
    } finally {
      setIsExportingDocument(false)
    }
  }

  const handleRunAllSuites = async () => {
    if (!testSuites.length) {
      return
    }
    setRunningSuiteId('all')
    setTestError(null)
    setTestRunResult(null)
    try {
      let lastResult: TestRunResult | null = null
      for (const suite of testSuites) {
        const result = await window.electronAPI.runTestSuite(suite.id)
        lastResult = result
        await loadTestSuites()
      }
      if (lastResult) {
        setTestRunResult(lastResult)
      }
    } catch (error) {
      console.error('Failed to run all suites:', error)
      setTestError(error instanceof Error ? error.message : 'Failed to run all suites')
    } finally {
      setRunningSuiteId(null)
    }
  }

  const currentSuite = selectedSuiteId
    ? (testSuites.find((suite) => suite.id === selectedSuiteId) ?? null)
    : null

  const currentResult =
    testRunResult && currentSuite && testRunResult.suiteId === currentSuite.id
      ? testRunResult
      : (currentSuite?.lastRun ?? null)

  const canExportAllResults = useMemo(
    () => testSuites.some((suite) => suite.lastRun !== null),
    [testSuites]
  )

  const buildTestRunBundle = useCallback((): TestRunBundle | null => {
    if (!testSuites.length) {
      return null
    }
    const suites = testSuites.map((suite) => ({
      suiteId: suite.id,
      suiteName: suite.name,
      result: suite.lastRun
    }))
    const totalCompleted = suites.filter((entry) => entry.result !== null).length
    if (totalCompleted === 0) {
      return null
    }
    return {
      generatedAt: new Date().toISOString(),
      totalSuites: suites.length,
      totalCompleted,
      suites
    }
  }, [testSuites])

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return '—'
    const seconds = durationMs / 1000
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Number((seconds % 60).toFixed(0))
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatTimestamp = (value?: string | null) => {
    if (!value) return '—'
    return new Date(value).toLocaleString()
  }

  const formatScheduleTime = (value?: string | null) => {
    if (!value) return '—'
    return new Date(value).toLocaleString()
  }

  const getSuiteStatusLabel = (suite: ListedTestSuite) => {
    if (suite.isRunning) return 'Running...'
    if (!suite.lastRun) return 'Never run'
    return suite.lastRun.status === 'passed' ? 'Passed' : 'Needs attention'
  }

  const getSuiteStatusClass = (suite: ListedTestSuite) => {
    if (suite.isRunning) return 'status-running'
    if (!suite.lastRun) return 'status-idle'
    return suite.lastRun.status === 'passed' ? 'status-passed' : 'status-failed'
  }

  const handleExportResult = async () => {
    if (!currentResult) return
    try {
      const response = await window.electronAPI.exportTestResult(currentResult)
      if (response.canceled || !response.path) {
        return
      }
      alert(`✅ Test result saved to ${response.path}`)
    } catch (error) {
      console.error('Failed to export test result:', error)
      alert('Failed to export test result. Check logs for details.')
    }
  }

  const handleExportAllResults = async () => {
    const bundle = buildTestRunBundle()
    if (!bundle) {
      alert('Run at least one suite before exporting combined results.')
      return
    }
    try {
      setIsExportingAll(true)
      const response = await window.electronAPI.exportAllTestResults(bundle)
      if (response.canceled || !response.path) {
        return
      }
      alert(`✅ All test results saved to ${response.path}`)
    } catch (error) {
      console.error('Failed to export all test results:', error)
      alert('Failed to export all test results. Check logs for details.')
    } finally {
      setIsExportingAll(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🤖 AI Workflow Manager</h1>
          <span className="version">v{appVersion}</span>
        </div>
      </header>

      <main className="main">
        <div className="toolbar">
          <div className="tab-switcher">
            <button
              className={`tab-button ${activeTab === 'workflows' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab('workflows')}
            >
              Workflows
            </button>
            <button
              className={`tab-button ${activeTab === 'tests' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setActiveTab('tests')
                if (!testSuites.length) {
                  loadTestSuites()
                }
              }}
            >
              Test Console
            </button>
            <button
              className={`tab-button ${activeTab === 'diagnostics' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setActiveTab('diagnostics')
                loadDiagnostics()
              }}
            >
              Diagnostics
            </button>
          </div>
          {activeTab === 'workflows' && (
            <button
              className="btn-primary"
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? '✕ Cancel' : '+ New Workflow'}
            </button>
          )}
        </div>

        {activeTab === 'workflows' && (
          <>
            <section className="draft-section">
              <div className="draft-header">
                <div>
                  <h3>Workflow Drafts</h3>
                  <p>Validate and publish drafts before activating workflows.</p>
                </div>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={loadDrafts}
                  disabled={draftsLoading}
                >
                  {draftsLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
              {draftsLoading ? (
                <div className="loading small">Loading drafts…</div>
              ) : drafts.length === 0 ? (
                <div className="empty-state compact">
                  <p>No drafts yet. Use the CLI or API to create workflow drafts.</p>
                </div>
              ) : (
                <div className="draft-grid">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="draft-card">
                      <div className="draft-card-header">
                        <div>
                          <h4>{draft.name}</h4>
                          <small>
                            v{draft.version} · {draft.status}
                          </small>
                        </div>
                        <span className="draft-updated">
                          Updated {new Date(draft.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="draft-actions">
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => handleValidateDraft(draft.id)}
                          disabled={draftActionId === draft.id}
                        >
                          {draftActionId === draft.id ? 'Working…' : 'Validate'}
                        </button>
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => handlePublishDraft(draft.id)}
                          disabled={draftActionId === draft.id}
                        >
                          Publish
                        </button>
                        <button
                          className="btn-danger"
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={draftActionId === draft.id}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {showCreateForm && (
              <div className="create-form">
                <h2>Create New Workflow</h2>
                <form onSubmit={handleCreateWorkflow}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={newWorkflow.name}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                      placeholder="Enter workflow name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={newWorkflow.description}
                      onChange={(e) =>
                        setNewWorkflow({ ...newWorkflow, description: e.target.value })
                      }
                      placeholder="Enter workflow description"
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Create Workflow
                  </button>
                </form>
              </div>
            )}

            <div className="workflows-container">
              {loading ? (
                <div className="loading">Loading workflows...</div>
              ) : workflows.length === 0 ? (
                <div className="empty-state">
                  <p>No workflows yet. Create your first workflow to get started!</p>
                </div>
              ) : (
                <div className="workflows-grid">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="workflow-card">
                      <div className="workflow-header">
                        <h3>{workflow.name}</h3>
                        <div
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(workflow.status) }}
                        >
                          {workflow.status}
                        </div>
                      </div>
                      <p className="workflow-description">
                        {workflow.description || 'No description'}
                      </p>
                      <div className="workflow-meta">
                        <small>Created: {new Date(workflow.created_at).toLocaleDateString()}</small>
                      </div>
                      <div className="workflow-actions">
                        <select
                          value={workflow.status}
                          onChange={(e) => handleStatusChange(workflow.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <section className="connector-section">
              <div className="connector-header">
                <h3>Connector Health</h3>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={loadConnectors}
                  disabled={connectorLoading}
                >
                  {connectorLoading ? 'Refreshing…' : 'Refresh'}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setShowConnectorForm((prev) => !prev)}
                >
                  {showConnectorForm ? 'Cancel' : 'Add Connector'}
                </button>
              </div>
              {showConnectorForm && (
                <div classnamed="connector-form-card">
                  <form className="notification-form" onSubmit={handleRegisterConnector}>
                    <div className="form-group">
                      <label htmlFor="connector-id">ID</label>
                      <input
                        id="connector-id"
                        value={connectorForm.id}
                        onChange={(e) => handleConnectorFormChange('id', e.target.value)}
                        placeholder="storage.local"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="connector-name">Name</label>
                      <input
                        id="connector-name"
                        value={connectorForm.name}
                        onChange={(e) => handleConnectorFormChange('name', e.target.value)}
                        placeholder="Local Storage"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="connector-kind">Kind</label>
                      <select
                        id="connector-kind"
                        value={connectorForm.kind}
                        onChange={(e) => handleConnectorFormChange('kind', e.target.value)}
                      >
                        <option value="integration">Integration</option>
                        <option value="storage">Storage</option>
                        <option value="document">Document</option>
                        <option value="llm">LLM</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="connector-version">Version</label>
                      <input
                        id="connector-version"
                        value={connectorForm.version}
                        onChange={(e) => handleConnectorFormChange('version', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="connector-description">Description</label>
                      <input
                        id="connector-description"
                        value={connectorForm.description}
                        onChange={(e) => handleConnectorFormChange('description', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="connector-capabilities">Capabilities (csv, name:desc)</label>
                      <input
                        id="connector-capabilities"
                        value={connectorForm.capabilities}
                        onChange={(e) => handleConnectorFormChange('capabilities', e.target.value)}
                        placeholder="read storage:Provides access"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="connector-secrets">Requires Secrets (csv)</label>
                      <input
                        id="connector-secrets"
                        value={connectorForm.requiresSecrets}
                        onChange={(e) =>
                          handleConnectorFormChange('requiresSecrets', e.target.value)
                        }
                        placeholder="connector:storage:api"
                      />
                    </div>
                    <button className="btn-primary" type="submit" disabled={connectorSubmitting}>
                      {connectorSubmitting ? 'Saving…' : 'Register Connector'}
                    </button>
                  </form>
                </div>
              )}
              {connectorError && <div className="test-error">{connectorError}</div>}
              {connectorLoading ? (
                <div className="loading small">Loading connectors…</div>
              ) : connectors.length === 0 ? (
                <div className="empty-state compact">
                  <p>No connectors registered.</p>
                </div>
              ) : (
                <div className="connector-grid">
                  {connectors.map((connector) => (
                    <div key={connector.id} className="connector-card">
                      <div className="connector-card-header">
                        <div>
                          <h4>{connector.name}</h4>
                          <small>
                            {connector.kind} · v{connector.version}
                          </small>
                        </div>
                        <span
                          className={`suite-status ${connector.status === 'ready' ? 'status-passed' : connector.status === 'error' ? 'status-failed' : 'status-idle'}`}
                        >
                          {connector.status.toUpperCase()}
                        </span>
                      </div>
                      {connector.description && <p>{connector.description}</p>}
                      {connector.lastHealthCheck && (
                        <div className="connector-health">
                          <strong>{connector.lastHealthCheck.status.toUpperCase()}</strong>
                          <span>{connector.lastHealthCheck.message ?? 'OK'}</span>
                        </div>
                      )}
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => handleTestConnector(connector.id)}
                        disabled={connectorLoading}
                      >
                        Run Health Check
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => handleRemoveConnector(connector.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="document-section">
              <div className="document-header">
                <h3>Document Workspace</h3>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={loadDocuments}
                  disabled={documentsLoading}
                >
                  {documentsLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
              <div className="document-grid">
                <div className="document-form-card">
                  <h4>Export Document</h4>
                  <form onSubmit={handleExportDocument}>
                    <div className="form-group">
                      <label htmlFor="doc-name">Name</label>
                      <input
                        id="doc-name"
                        type="text"
                        value={documentForm.name}
                        onChange={(e) => handleDocumentFormChange('name', e.target.value)}
                        placeholder="Sprint summary"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="doc-format">Format</label>
                      <select
                        id="doc-format"
                        value={documentForm.format}
                        onChange={(e) =>
                          handleDocumentFormChange(
                            'format',
                            e.target.value as DocumentRecord['type']
                          )
                        }
                      >
                        <option value="markdown">Markdown</option>
                        <option value="docx">DOCX</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="doc-content">Content</label>
                      <textarea
                        id="doc-content"
                        rows={5}
                        value={documentForm.content}
                        onChange={(e) => handleDocumentFormChange('content', e.target.value)}
                        placeholder="## Release Notes..."
                      />
                    </div>
                    <button className="btn-primary" type="submit" disabled={isExportingDocument}>
                      {isExportingDocument ? 'Exporting…' : 'Export Document'}
                    </button>
                  </form>
                </div>
                <div className="document-list-card">
                  <h4>Recent Documents</h4>
                  {documentsLoading ? (
                    <div className="loading small">Loading documents…</div>
                  ) : documents.length === 0 ? (
                    <div className="empty-state compact">
                      <p>No documents exported yet.</p>
                    </div>
                  ) : (
                    <div className="document-list">
                      {documents.map((doc) => (
                        <div key={doc.id} className="document-card">
                          <div>
                            <strong>{doc.name}</strong>
                            <span className="doc-meta">
                              {doc.type.toUpperCase()} · v{doc.version}
                            </span>
                          </div>
                          <small>Updated: {new Date(doc.updatedAt).toLocaleString()}</small>
                          <code className="doc-path">{doc.path}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'tests' && (
          <div className="test-console">
            <div className="test-console-panels">
              <div className="test-suite-list">
                {testSuitesLoading ? (
                  <div className="loading small">Loading suites...</div>
                ) : testSuites.length === 0 ? (
                  <div className="empty-state">
                    <p>No suites configured yet.</p>
                  </div>
                ) : (
                  testSuites.map((suite) => (
                    <button
                      key={suite.id}
                      className={`suite-card ${selectedSuiteId === suite.id ? 'selected' : ''}`}
                      type="button"
                      onClick={() => setSelectedSuiteId(suite.id)}
                    >
                      <div className="suite-card-header">
                        <div>
                          <h3>{suite.name}</h3>
                          <p>{suite.description}</p>
                        </div>
                        <span className={`suite-status ${getSuiteStatusClass(suite)}`}>
                          {getSuiteStatusLabel(suite)}
                        </span>
                      </div>
                      <div className="suite-tags">
                        {suite.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <small className="suite-meta">
                        Last run: {suite.lastRun ? formatTimestamp(suite.lastRun.finishedAt) : '—'}
                      </small>
                    </button>
                  ))
                )}
              </div>

              <div className="test-suite-details">
                {currentSuite ? (
                  <>
                    <div className="test-suite-details-header">
                      <div>
                        <h2>{currentSuite.name}</h2>
                        <p>{currentSuite.description}</p>
                      </div>
                      <div className="test-suite-actions">
                        <div className="run-all-group">
                          <button
                            className="btn-secondary run-all"
                            type="button"
                            onClick={handleRunAllSuites}
                            disabled={runningSuiteId !== null}
                          >
                            {runningSuiteId === 'all' ? 'Running All…' : 'Run All Suites'}
                          </button>
                          <button
                            className="btn-secondary download-all"
                            type="button"
                            onClick={handleExportAllResults}
                            disabled={
                              !canExportAllResults || isExportingAll || runningSuiteId !== null
                            }
                          >
                            {isExportingAll ? 'Saving...' : 'Download Results'}
                          </button>
                        </div>
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => handleRunSuite(currentSuite.id)}
                          disabled={runningSuiteId === currentSuite.id || runningSuiteId === 'all'}
                        >
                          {runningSuiteId === currentSuite.id ? 'Running...' : 'Run Selected Tests'}
                        </button>
                      </div>
                    </div>

                    <div className="test-suite-meta">
                      <div>
                        <span>Status</span>
                        <strong>
                          {currentResult ? currentResult.status.toUpperCase() : 'NOT RUN'}
                        </strong>
                      </div>
                      <div>
                        <span>Last finished</span>
                        <strong>
                          {currentResult ? formatTimestamp(currentResult.finishedAt) : '—'}
                        </strong>
                      </div>
                      <div>
                        <span>Duration</span>
                        <strong>
                          {currentResult ? formatDuration(currentResult.durationMs) : '—'}
                        </strong>
                      </div>
                    </div>

                    {testError && <div className="test-error">{testError}</div>}

                    <div className="test-logs">
                      {currentResult ? (
                        <>
                          <div className="test-logs-actions">
                            <button
                              className="btn-secondary"
                              type="button"
                              onClick={handleExportResult}
                            >
                              Export Result
                            </button>
                          </div>
                          {currentResult.logs.map((line, index) => (
                            <div key={`${currentResult.suiteId}-${index}`} className="log-line">
                              {line}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="empty-state compact">
                          <p>Select a suite and run tests to see output.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <p>Select a test suite to view details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="diagnostics-grid">
            <section className="diagnostic-card">
              <div className="diagnostic-card-header">
                <div>
                  <h3>Logging</h3>
                  <p>Current application log destination.</p>
                </div>
                <div className="diagnostic-actions">
                  <button className="btn-secondary" type="button" onClick={loadDiagnostics}>
                    Refresh
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={handleCopyLogPath}
                    disabled={!logPath}
                  >
                    Copy Path
                  </button>
                </div>
              </div>
              {diagnosticsLoading && !logPath ? (
                <div className="loading small">Loading log path…</div>
              ) : (
                <code className="log-path">{logPath || 'Log path unavailable'}</code>
              )}
            </section>

            <section className="diagnostic-card">
              <div className="diagnostic-card-header">
                <div>
                  <h3>Telemetry</h3>
                  <p>Opt-in diagnostic payload generation.</p>
                </div>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={handleTelemetryToggle}
                  disabled={telemetryUpdating}
                >
                  {telemetryUpdating
                    ? 'Updating…'
                    : telemetryEnabled
                      ? 'Disable Telemetry'
                      : 'Enable Telemetry'}
                </button>
              </div>
              <p className="diagnostic-subtext">
                Status:{' '}
                <strong className={telemetryEnabled ? 'status-enabled' : 'status-disabled'}>
                  {telemetryEnabled ? 'Enabled' : 'Disabled'}
                </strong>
              </p>
            </section>

            <section className="diagnostic-card">
              <div className="diagnostic-card-header">
                <div>
                  <h3>Notification Preferences</h3>
                  <p>Quiet hours and delivery channels.</p>
                </div>
              </div>
              {!notifications ? (
                <div className="loading small">Loading notification preferences…</div>
              ) : (
                <form className="notification-form" onSubmit={handleNotificationSave}>
                  <div className="form-group inline">
                    <label htmlFor="quiet-start">Quiet Start</label>
                    <input
                      id="quiet-start"
                      type="time"
                      value={notificationForm.quietStart}
                      onChange={(e) => handleNotificationInputChange('quietStart', e.target.value)}
                    />
                  </div>
                  <div className="form-group inline">
                    <label htmlFor="quiet-end">Quiet End</label>
                    <input
                      id="quiet-end"
                      type="time"
                      value={notificationForm.quietEnd}
                      onChange={(e) => handleNotificationInputChange('quietEnd', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="channels">Channels (comma-separated)</label>
                    <input
                      id="channels"
                      type="text"
                      value={notificationForm.channels}
                      onChange={(e) => handleNotificationInputChange('channels', e.target.value)}
                    />
                  </div>
                  <button className="btn-primary" type="submit" disabled={notificationSaving}>
                    {notificationSaving ? 'Saving…' : 'Save Preferences'}
                  </button>
                </form>
              )}
            </section>

            <section className="diagnostic-card span-2">
              <div className="diagnostic-card-header">
                <div>
                  <h3>Schedules</h3>
                  <p>Upcoming workflow runs from SchedulerService.</p>
                </div>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={refreshSchedules}
                  disabled={schedulesLoading}
                >
                  {schedulesLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
              {schedulesLoading && !schedules.length ? (
                <div className="loading small">Loading schedules…</div>
              ) : schedules.length === 0 ? (
                <div className="empty-state compact">
                  <p>No schedules created yet.</p>
                </div>
              ) : (
                <div className="diagnostic-table-wrapper">
                  <table className="diagnostic-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Workflow</th>
                        <th>Cron</th>
                        <th>Timezone</th>
                        <th>Next Run</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td>#{schedule.id}</td>
                          <td>{schedule.workflowId}</td>
                          <td>{schedule.cron}</td>
                          <td>{schedule.timezone ?? 'UTC'}</td>
                          <td>{formatScheduleTime(schedule.nextRunAt)}</td>
                          <td>
                            <span
                              className={`suite-status ${schedule.status === 'active' ? 'status-passed' : 'status-idle'}`}
                            >
                              {schedule.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
