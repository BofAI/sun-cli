import { Command } from 'commander'
import { getNetwork } from '../lib/context'
import { readAction } from '../lib/command'
import {
  getWalletAddress,
  isWalletConfigured,
  isAgentWalletConfigured,
  isLocalWalletConfigured,
  getConfiguredLocalWallet,
  listAgentWallets,
  getActiveWalletId,
  selectAgentWallet,
  initWallet,
} from '../lib/wallet'
import { output, outputError, printKeyValue } from '../lib/output'

export function registerWalletCommands(program: Command) {
  const wallet = program
    .command('wallet')
    .description('Wallet management')

  wallet
    .command('address')
    .description('Show the active TRON wallet address')
    .action(async () => {
      try {
        await initWallet()
        const address = await getWalletAddress()
        const network = getNetwork()
        output({ address, network })
      } catch (err: any) {
        outputError('Failed to get wallet address', err)
      }
    })

  wallet
    .command('balances')
    .description('Get TRX and TRC20 balances')
    .option('--owner <address>', 'Wallet address (default: active wallet)')
    .option('--tokens <tokens>', 'Comma-separated: TRX,<TRC20_ADDRESS>,...', 'TRX')
    .action(async (opts) => {
      const tokenList = opts.tokens.split(',').map((t: string) => {
        const trimmed = t.trim()
        if (trimmed.toUpperCase() === 'TRX') {
          return { address: opts.owner || '', type: 'TRX' as const }
        }
        return { address: opts.owner || '', type: 'TRC20' as const, tokenAddress: trimmed }
      })

      await readAction({
        spinnerLabel: 'Fetching balances...',
        errorLabel: 'Failed to get balances',
        execute: (kit) => kit.getBalances({
          network: getNetwork(),
          ownerAddress: opts.owner,
          tokens: tokenList,
        }),
        tableConfig: {
          headers: ['Type', 'Token Address', 'Balance'],
          toRow: (item: any) => [
            item.type,
            item.tokenAddress || 'TRX (native)',
            item.balance,
          ],
        },
      })
    })

  wallet
    .command('list')
    .description('List all available wallets')
    .action(async () => {
      try {
        await initWallet()

        if (isAgentWalletConfigured()) {
          const wallets = await listAgentWallets()
          const activeId = getActiveWalletId()
          output(
            { wallets, activeWalletId: activeId, mode: 'agent-wallet' },
            {
              headers: ['ID', 'Type', 'Address', 'Active'],
              toRow: (item: any) =>
                item.wallets
                  ? ['', '', '', '']
                  : [item.id, item.type, item.address, item.id === activeId ? '●' : ''],
            }
          )

          if (!program.opts().json) {
            const { default: chalk } = await import('chalk')
            console.log(chalk.gray(`\nMode: agent-wallet`))
            for (const w of wallets) {
              const marker = w.id === activeId ? chalk.green(' ● active') : ''
              console.log(`  ${chalk.bold(w.id)}  ${w.address}${marker}`)
            }
          }
          return
        }

        if (isLocalWalletConfigured()) {
          const { address } = getConfiguredLocalWallet()
          output(
            { wallets: [{ id: 'default', type: 'env_configured', address }], activeWalletId: 'default', mode: 'local' }
          )

          if (!program.opts().json) {
            const { default: chalk } = await import('chalk')
            console.log(chalk.gray(`\nMode: local (env-configured)`))
            console.log(`  ${chalk.bold('default')}  ${address}  ${chalk.green('● active')}`)
          }
          return
        }

        output({ wallets: [], message: 'No wallet configured.' })
        if (!program.opts().json) {
          const { default: chalk } = await import('chalk')
          console.log(chalk.yellow('No wallet configured. Set AGENT_WALLET_PASSWORD or TRON_PRIVATE_KEY.'))
        }
      } catch (err: any) {
        outputError('Failed to list wallets', err)
      }
    })

  wallet
    .command('select <walletId>')
    .description('Switch the active wallet (agent-wallet mode only)')
    .action(async (walletId: string) => {
      try {
        await initWallet()
        if (!isAgentWalletConfigured()) {
          throw new Error('select is only available in agent-wallet mode.')
        }
        const result = await selectAgentWallet(walletId)
        output({ ...result, message: `Switched to "${result.id}".` })

        if (!program.opts().json) {
          const { default: chalk } = await import('chalk')
          console.log(chalk.green(`✓ Switched active wallet to "${result.id}" (${result.address})`))
        }
      } catch (err: any) {
        outputError('Failed to select wallet', err)
      }
    })
}
