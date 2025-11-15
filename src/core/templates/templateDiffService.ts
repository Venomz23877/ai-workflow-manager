import * as Diff from 'diff'

export interface DiffResultLine {
  value: string
  added?: boolean
  removed?: boolean
}

export class TemplateDiffService {
  diff(before: string, after: string): DiffResultLine[] {
    return Diff.diffLines(before, after)
  }
}

