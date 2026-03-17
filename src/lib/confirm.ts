/**
 * Confirmation prompt for destructive operations.
 * Skipped when --yes flag is set or in --json mode.
 */

import * as readline from 'readline'
import chalk from 'chalk'
import { isJsonMode } from './output'

let _autoConfirm = false

export function setAutoConfirm(on: boolean) {
  _autoConfirm = on
}
export function isAutoConfirm(): boolean {
  return _autoConfirm
}

export async function confirm(message: string): Promise<boolean> {
  if (_autoConfirm || isJsonMode()) return true

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  })

  return new Promise((resolve) => {
    rl.question(chalk.yellow(`${message} [y/N] `), (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}

export function printSummary(title: string, details: Record<string, unknown>) {
  if (isJsonMode()) return

  console.error()
  console.error(chalk.bold.underline(title))
  const maxKey = Math.max(...Object.keys(details).map((k) => k.length))
  for (const [key, value] of Object.entries(details)) {
    if (value !== undefined && value !== null && value !== '') {
      console.error(`  ${chalk.bold(key.padEnd(maxKey))}  ${value}`)
    }
  }
  console.error()
}
