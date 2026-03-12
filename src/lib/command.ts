/**
 * Command helpers — eliminate boilerplate in write/read command handlers.
 */

import type { SunKit, SunAPI } from '@bankofai/sun-kit'
import { getKit, getApi, ensureWallet, getNetwork } from './context'
import { output, outputError, withSpinner, isJsonMode } from './output'
import { confirm, printSummary } from './confirm'

// ---------------------------------------------------------------------------
// Dry-run state
// ---------------------------------------------------------------------------

let _dryRun = false

export function setDryRun(on: boolean) { _dryRun = on }
export function isDryRun(): boolean { return _dryRun }

// ---------------------------------------------------------------------------
// writeAction — for state-changing commands (swap, liquidity, contract:send)
// ---------------------------------------------------------------------------

export interface WriteActionOpts<T> {
  /** Title shown in the pre-execution summary */
  title: string
  /** Key-value pairs displayed in summary */
  summary: Record<string, unknown>
  /** Confirmation prompt text */
  confirmMsg: string
  /** Spinner label during execution */
  spinnerLabel: string
  /** The async operation that calls kit methods */
  execute: (kit: SunKit) => Promise<T>
  /** Error label prefix for outputError */
  errorLabel: string
  /** Optional post-success callback (e.g. extra human-friendly output) */
  onSuccess?: (result: T) => void | Promise<void>
}

export async function writeAction<T>(opts: WriteActionOpts<T>): Promise<void> {
  try {
    await ensureWallet()
    const kit = await getKit()

    if (_dryRun) {
      output({ dryRun: true, action: opts.title, params: opts.summary })
      return
    }

    printSummary(opts.title, opts.summary)

    const confirmed = await confirm(opts.confirmMsg)
    if (!confirmed) {
      if (!isJsonMode()) console.log('Cancelled.')
      return
    }

    const result = await withSpinner(opts.spinnerLabel, () => opts.execute(kit))
    output(result)

    if (opts.onSuccess) {
      await opts.onSuccess(result)
    }
  } catch (err: any) {
    outputError(opts.errorLabel, err)
  }
}

// ---------------------------------------------------------------------------
// readAction — for read commands that need SunKit (balances, contract:read)
// ---------------------------------------------------------------------------

export interface ReadActionOpts<T> {
  /** Spinner label */
  spinnerLabel: string
  /** The async operation */
  execute: (kit: SunKit) => Promise<T>
  /** Table config for human-readable output */
  tableConfig?: { headers: string[]; toRow: (item: any) => string[] }
  /** Error label prefix */
  errorLabel: string
  /** Optional transform before output */
  transform?: (result: T) => unknown
}

export async function readAction<T>(opts: ReadActionOpts<T>): Promise<void> {
  try {
    const kit = await getKit()

    const result = await withSpinner(opts.spinnerLabel, () => opts.execute(kit))
    const data = opts.transform ? opts.transform(result) : result
    output(data, opts.tableConfig)
  } catch (err: any) {
    outputError(opts.errorLabel, err)
  }
}

// ---------------------------------------------------------------------------
// readApiAction — for read commands using SunAPI only (no wallet init)
// ---------------------------------------------------------------------------

export interface ReadApiActionOpts<T> {
  /** Spinner label */
  spinnerLabel: string
  /** The async operation */
  execute: (api: SunAPI) => Promise<T>
  /** Table config for human-readable output */
  tableConfig?: { headers: string[]; toRow: (item: any) => string[] }
  /** Error label prefix */
  errorLabel: string
  /** Optional transform before output */
  transform?: (result: T) => unknown
}

export async function readApiAction<T>(opts: ReadApiActionOpts<T>): Promise<void> {
  try {
    const api = getApi()

    const result = await withSpinner(opts.spinnerLabel, () => opts.execute(api))
    const data = opts.transform ? opts.transform(result) : result
    output(data, opts.tableConfig)
  } catch (err: any) {
    outputError(opts.errorLabel, err)
  }
}
