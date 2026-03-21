/**
 * Command helpers — eliminate boilerplate in write/read command handlers.
 */

import type { SunKit, SunAPI } from '@bankofai/sun-kit'
import { getKit, getApi, ensureWallet } from './context'
import { output, outputError, withSpinner, isJsonMode } from './output'
import { confirm, printSummary } from './confirm'

// ---------------------------------------------------------------------------
// Dry-run state
// ---------------------------------------------------------------------------

let _dryRun = false

export function setDryRun(on: boolean) {
  _dryRun = on
}
export function isDryRun(): boolean {
  return _dryRun
}

function getTronscanBaseUrl(network?: string): string | null {
  switch (network) {
    case 'mainnet':
      return 'https://tronscan.org/#/transaction'
    case 'nile':
      return 'https://nile.tronscan.org/#/transaction'
    case 'shasta':
      return 'https://shasta.tronscan.org/#/transaction'
    default:
      return null
  }
}

function attachExplorerLink<T>(
  result: T,
  fallbackNetwork?: string,
): T | (T & { tronscanUrl: string }) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return result
  }

  const txid =
    typeof (result as Record<string, unknown>).txid === 'string'
      ? (result as Record<string, string>).txid
      : typeof (result as Record<string, unknown>).txID === 'string'
        ? (result as Record<string, string>).txID
        : null

  const network =
    typeof (result as Record<string, unknown>).network === 'string'
      ? (result as Record<string, string>).network
      : fallbackNetwork

  const baseUrl = txid ? getTronscanBaseUrl(network) : null
  if (!txid || !baseUrl) {
    return result
  }

  return {
    ...(result as Record<string, unknown>),
    tronscanUrl: `${baseUrl}/${txid}`,
  } as T & { tronscanUrl: string }
}

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
  onSuccess?: (result: T | (T & { tronscanUrl: string })) => void | Promise<void>
}

export async function writeAction<T>(opts: WriteActionOpts<T>): Promise<void> {
  try {
    await ensureWallet()
    const kit = await getKit()
    const network =
      typeof opts.summary.Network === 'string' ? String(opts.summary.Network) : undefined

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
    const enrichedResult = attachExplorerLink(result, network)
    output(enrichedResult)

    if (opts.onSuccess) {
      await opts.onSuccess(enrichedResult)
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
