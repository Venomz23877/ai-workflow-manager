export type TestRunStatus = 'passed' | 'failed' | 'error'

export interface TestSuiteDefinition {
  id: string
  name: string
  description: string
  tags: string[]
  steps: string[]
  estimatedDurationMs: number
  command?: string
  args?: string[]
  cwd?: string
}

export interface TestRunResult {
  suiteId: string
  status: TestRunStatus
  logs: string[]
  startedAt: string
  finishedAt: string
  durationMs: number
  exitCode: number | null
  errorMessage?: string
}

export interface ListedTestSuite extends TestSuiteDefinition {
  lastRun: TestRunResult | null
  isRunning: boolean
}

export interface TestRunBundleEntry {
  suiteId: string
  suiteName: string
  result: TestRunResult | null
}

export interface TestRunBundle {
  generatedAt: string
  totalSuites: number
  totalCompleted: number
  suites: TestRunBundleEntry[]
}
