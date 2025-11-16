import { CronExpressionParser } from 'cron-parser'

export interface CronOptions {
  timezone?: string
}

export const computeNextRunIso = (expression: string, options: CronOptions = {}) => {
  try {
    const cron = CronExpressionParser.parse(expression, { tz: options.timezone ?? 'UTC' })
    return cron.next().toISOString()
  } catch (error) {
    throw new Error(`Invalid cron expression "${expression}": ${(error as Error).message}`)
  }
}

export const validateCron = (expression: string, options: CronOptions = {}) => {
  computeNextRunIso(expression, options)
}
