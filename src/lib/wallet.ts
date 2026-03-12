import type { Wallet } from '@bankofai/sun-kit'
import { createReadonlyTronWeb } from '@bankofai/sun-kit'
import { resolveWalletProvider, type BaseWallet, type Eip712Capable } from '@bankofai/agent-wallet'
import { TronWeb } from 'tronweb'

export type { Wallet }

let _wallet: Wallet | null = null

export async function initWallet(): Promise<void> {
  const privateKey = process.env.TRON_PRIVATE_KEY?.trim() ?? ''
  const mnemonic = process.env.TRON_MNEMONIC?.trim() ?? ''
  const accountIndex = process.env.TRON_MNEMONIC_ACCOUNT_INDEX?.trim() ?? ''
  const walletPassword = process.env.AGENT_WALLET_PASSWORD?.trim() ?? ''
  const walletDir = process.env.AGENT_WALLET_DIR?.trim() ?? ''
  const configuredModes = [privateKey, mnemonic, walletPassword].filter(Boolean).length

  if (configuredModes > 1) {
    throw new Error('Set only one of TRON_PRIVATE_KEY, TRON_MNEMONIC, or AGENT_WALLET_PASSWORD.')
  }
  if (configuredModes === 0) {
    _wallet = null
    return
  }

  process.env.AGENT_WALLET_PRIVATE_KEY = privateKey
  process.env.AGENT_WALLET_MNEMONIC = mnemonic
  process.env.AGENT_WALLET_MNEMONIC_ACCOUNT_INDEX = accountIndex
  process.env.AGENT_WALLET_PASSWORD = walletPassword
  process.env.AGENT_WALLET_DIR = walletDir

  const provider = resolveWalletProvider({ network: 'tron' })
  const activeWallet = await provider.getActiveWallet()
  _wallet = new AgentWalletAdapter(activeWallet)
}

export function getWallet(): Wallet {
  if (!_wallet) {
    throw new Error(
      'No wallet configured. Set TRON_PRIVATE_KEY, TRON_MNEMONIC, or AGENT_WALLET_PASSWORD for agent-wallet.',
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

class AgentWalletAdapter implements Wallet {
  readonly type = 'agent-wallet' as const

  constructor(private readonly agentWallet: BaseWallet) {}

  async getAddress(): Promise<string> {
    return await this.agentWallet.getAddress()
  }

  async getTronWeb(network = 'mainnet'): Promise<TronWeb> {
    const tronWeb = await createReadonlyTronWeb(network)
    const ownerAddress = await this.agentWallet.getAddress()
    const ownerHex =
      typeof (tronWeb as any).address?.toHex === 'function'
        ? (tronWeb as any).address.toHex(ownerAddress)
        : ownerAddress
    const ownerBase58 =
      typeof (tronWeb as any).address?.fromHex === 'function'
        ? (tronWeb as any).address.fromHex(ownerHex)
        : ownerAddress

    ;(tronWeb as any).defaultAddress = { hex: ownerHex, base58: ownerBase58 }
    return tronWeb
  }

  async signAndBroadcast(
    unsignedTx: Record<string, unknown>,
    network = 'mainnet',
  ): Promise<{ result: boolean; txid: string }> {
    const tx = (unsignedTx as any).transaction || unsignedTx
    const txid = await this.buildSignBroadcast(tx, network)
    return { result: true, txid }
  }

  async buildSignBroadcast(
    unsignedTx: Record<string, unknown>,
    network = 'mainnet',
  ): Promise<string> {
    const signedTx = await this.signTransaction(unsignedTx)
    const tronWeb = await createReadonlyTronWeb(network)
    const result = await tronWeb.trx.sendRawTransaction(signedTx as any)

    if (result.result) {
      return result.txid
    }

    throw new Error(`Broadcast failed: ${JSON.stringify(result)}`)
  }

  async signTransaction(unsignedTx: Record<string, unknown>): Promise<any> {
    const signedJson = await this.agentWallet.signTransaction(unsignedTx)
    return JSON.parse(signedJson)
  }

  async signMessage(message: string): Promise<string> {
    return await this.agentWallet.signMessage(Buffer.from(message, 'utf-8'))
  }

  async signTypedData(
    primaryType: string,
    domain: Record<string, unknown>,
    types: Record<string, unknown>,
    message: Record<string, unknown>,
  ): Promise<string> {
    const signer = this.agentWallet as unknown as Eip712Capable
    const sig = await signer.signTypedData({
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
