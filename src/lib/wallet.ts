/**
 * Wallet abstraction — ported from sun-mcp-server/src/wallet/.
 * Supports Agent Wallet (encrypted) and Local Wallet (env-based).
 */

import type { Wallet } from '@bankofai/sun-kit'
import { getNetworkConfig, createReadonlyTronWeb } from '@bankofai/sun-kit'
import { TronWeb } from 'tronweb'
import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { HDKey } from '@scure/bip32'

export type { Wallet }

// ---------------------------------------------------------------------------
// Local wallet helpers
// ---------------------------------------------------------------------------

interface ConfiguredWallet {
  privateKey: string
  address: string
}

export function isLocalWalletConfigured(): boolean {
  return !!(process.env.TRON_PRIVATE_KEY || process.env.TRON_MNEMONIC)
}

export function getConfiguredLocalWallet(): ConfiguredWallet {
  const privateKey = process.env.TRON_PRIVATE_KEY
  const mnemonic = process.env.TRON_MNEMONIC
  const accountIndex = parseInt(process.env.TRON_ACCOUNT_INDEX || '0', 10)

  if (isNaN(accountIndex) || accountIndex < 0) {
    throw new Error(`Invalid TRON_ACCOUNT_INDEX: "${process.env.TRON_ACCOUNT_INDEX}"`)
  }

  if (privateKey) {
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey
    const address = TronWeb.address.fromPrivateKey(cleanKey)
    if (!address) throw new Error('Invalid private key in TRON_PRIVATE_KEY')
    return { privateKey: cleanKey, address }
  }

  if (mnemonic) {
    if (!bip39.validateMnemonic(mnemonic, wordlist)) {
      throw new Error('Invalid mnemonic in TRON_MNEMONIC')
    }
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const child = HDKey.fromMasterSeed(seed).derive(`m/44'/195'/0'/0/${accountIndex}`)
    if (!child.privateKey) throw new Error('Failed to derive key from mnemonic')
    const hex = Buffer.from(child.privateKey).toString('hex')
    const address = TronWeb.address.fromPrivateKey(hex) as string
    return { privateKey: hex, address }
  }

  throw new Error(
    'No wallet configured. Set TRON_PRIVATE_KEY, TRON_MNEMONIC, or AGENT_WALLET_PASSWORD.'
  )
}

// ---------------------------------------------------------------------------
// LocalWallet class
// ---------------------------------------------------------------------------

class LocalWallet implements Wallet {
  readonly type = 'local' as const
  private readonly privateKey: string
  private readonly _address: string
  private twCache = new Map<string, TronWeb>()

  constructor() {
    const { privateKey, address } = getConfiguredLocalWallet()
    this.privateKey = privateKey
    this._address = address
  }

  async getAddress() { return this._address }

  async getTronWeb(network = 'mainnet'): Promise<TronWeb> {
    const cached = this.twCache.get(network)
    if (cached) return cached
    const config = getNetworkConfig(network)
    const apiKey = process.env.TRONGRID_API_KEY || process.env.TRON_GRID_API_KEY
    const tw = new TronWeb({
      fullHost: config.fullNode,
      solidityNode: config.solidityNode,
      eventServer: config.eventServer,
      privateKey: this.privateKey,
      headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : undefined,
    })
    this.twCache.set(network, tw)
    return tw
  }

  async signAndBroadcast(unsignedTx: Record<string, unknown>, network = 'mainnet') {
    const tronWeb = await this.getTronWeb(network)
    const tx = (unsignedTx as any).transaction || unsignedTx
    const signed = await tronWeb.trx.sign(tx)
    const result = await tronWeb.trx.sendRawTransaction(signed)
    return { result: !!(result as any).result, txid: (result as any).txid }
  }

  async signMessage(message: string) {
    const tronWeb = await this.getTronWeb()
    return await tronWeb.trx.sign(message)
  }

  async signTypedData(
    _primaryType: string,
    domain: Record<string, unknown>,
    types: Record<string, unknown>,
    message: Record<string, unknown>,
  ) {
    const tronWeb = await this.getTronWeb()
    const sig = (tronWeb.trx as any)._signTypedData(domain, types, message)
    return sig.startsWith('0x') ? sig.slice(2) : sig
  }
}

// ---------------------------------------------------------------------------
// Agent Wallet
// ---------------------------------------------------------------------------

let agentProvider: any = null
let agentActiveWallet: any = null
let agentActiveAddress: string | null = null

export function isAgentWalletConfigured(): boolean {
  return !!process.env.AGENT_WALLET_PASSWORD
}

function getAgentWalletDir(): string {
  const { homedir } = require('os')
  const { join } = require('path')
  const dir = process.env.AGENT_WALLET_DIR || join(homedir(), '.agent-wallet')
  if (dir.startsWith('~/')) return join(homedir(), dir.slice(2))
  return dir
}

function getAgentProvider() {
  if (agentProvider) return agentProvider
  const { WalletFactory } = require('@bankofai/agent-wallet')
  agentProvider = WalletFactory({
    secretsDir: getAgentWalletDir(),
    password: process.env.AGENT_WALLET_PASSWORD!,
  })
  return agentProvider
}

async function getActiveAgentWallet() {
  if (agentActiveWallet) return agentActiveWallet
  const p = getAgentProvider()
  agentActiveWallet = await p.getActive()
  agentActiveAddress = await agentActiveWallet.getAddress()
  return agentActiveWallet
}

export async function getAgentOwnerAddress(): Promise<string> {
  if (agentActiveAddress) return agentActiveAddress
  const w = await getActiveAgentWallet()
  agentActiveAddress = await w.getAddress()
  return agentActiveAddress!
}

export async function listAgentWallets() {
  const p = getAgentProvider()
  const wallets = await p.listWallets()
  const result: Array<{ id: string; type: string; address: string }> = []
  for (const w of wallets) {
    const wallet = await p.getWallet(w.id)
    result.push({ id: w.id, type: w.type, address: await wallet.getAddress() })
  }
  return result
}

export function getActiveWalletId(): string | null {
  return getAgentProvider().getActiveId()
}

export async function selectAgentWallet(walletId: string) {
  const p = getAgentProvider()
  p.setActive(walletId)
  const wallet = await p.getWallet(walletId)
  const address = await wallet.getAddress()
  agentActiveWallet = wallet
  agentActiveAddress = address
  return { id: walletId, address }
}

async function agentSignTransaction(unsignedTx: Record<string, unknown>) {
  const wallet = await getActiveAgentWallet()
  return JSON.parse(await wallet.signTransaction(unsignedTx))
}

async function agentBuildSignBroadcast(unsignedTx: Record<string, unknown>, network = 'mainnet') {
  const signedTx = await agentSignTransaction(unsignedTx)
  const tronWeb = await createReadonlyTronWeb(network)
  const result = await tronWeb.trx.sendRawTransaction(signedTx as any)
  if (result.result) return result.txid
  throw new Error(`Broadcast failed: ${JSON.stringify(result)}`)
}

class AgentWalletAdapter implements Wallet {
  readonly type = 'agent-wallet' as const

  async getAddress() { return getAgentOwnerAddress() }

  async getTronWeb(network = 'mainnet'): Promise<TronWeb> {
    const tronWeb = await createReadonlyTronWeb(network)
    const owner = await getAgentOwnerAddress()
    const hex = typeof (tronWeb as any).address?.toHex === 'function'
      ? (tronWeb as any).address.toHex(owner) : owner
    const base58 = typeof (tronWeb as any).address?.fromHex === 'function'
      ? (tronWeb as any).address.fromHex(hex) : owner
    ;(tronWeb as any).defaultAddress = { hex, base58 }
    return tronWeb
  }

  async signAndBroadcast(unsignedTx: Record<string, unknown>, network = 'mainnet') {
    const tx = (unsignedTx as any).transaction || unsignedTx
    const txid = await agentBuildSignBroadcast(tx, network)
    return { result: true, txid }
  }

  async signMessage(message: string) {
    const wallet = await getActiveAgentWallet()
    return await wallet.signMessage(Buffer.from(message, 'utf-8'))
  }

  async signTypedData(
    primaryType: string,
    domain: Record<string, unknown>,
    types: Record<string, unknown>,
    message: Record<string, unknown>,
  ) {
    const wallet = await getActiveAgentWallet()
    const sig = await wallet.signTypedData({
      domain,
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        ...types,
      },
      primaryType,
      message,
    })
    return sig.startsWith('0x') ? sig.slice(2) : sig
  }
}

// ---------------------------------------------------------------------------
// Global singleton
// ---------------------------------------------------------------------------

let _wallet: Wallet | null = null

export async function initWallet(): Promise<void> {
  if (isAgentWalletConfigured()) {
    _wallet = new AgentWalletAdapter()
    return
  }
  if (isLocalWalletConfigured()) {
    _wallet = new LocalWallet()
    return
  }
  _wallet = null
}

export function getWallet(): Wallet {
  if (!_wallet) {
    throw new Error(
      'No wallet configured. Set AGENT_WALLET_PASSWORD, TRON_PRIVATE_KEY, or TRON_MNEMONIC.'
    )
  }
  return _wallet
}

export function isWalletConfigured(): boolean {
  return _wallet !== null
}

export async function getWalletAddress(): Promise<string> {
  return getWallet().getAddress()
}
