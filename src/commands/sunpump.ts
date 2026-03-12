import { Command } from 'commander'
import { getNetwork } from '../lib/context'
import { writeAction, readAction } from '../lib/command'
import { printKeyValue, isJsonMode } from '../lib/output'

const STATE_LABELS: Record<number, string> = {
  0: 'NOT_EXIST',
  1: 'TRADING',
  2: 'LAUNCHED',
}

export function registerSunpumpCommands(program: Command) {
  const sp = program
    .command('sunpump')
    .description('SunPump meme token trading')

  // ---------------------------------------------------------------------------
  // Write commands
  // ---------------------------------------------------------------------------

  sp
    .command('buy <tokenAddress>')
    .description('Buy a SunPump meme token with TRX')
    .requiredOption('--trx-amount <raw>', 'Amount of TRX to spend (in sun, 1 TRX = 1000000)')
    .option('--min-token-out <raw>', 'Minimum tokens to receive')
    .option('--slippage <n>', 'Slippage tolerance as decimal (e.g. 0.05 for 5%)', '0.05')
    .action(async (tokenAddress: string, opts) => {
      await writeAction({
        title: 'SunPump Buy',
        summary: {
          'Token': tokenAddress,
          'TRX Amount': opts.trxAmount,
          'Slippage': `${(parseFloat(opts.slippage) * 100).toFixed(1)}%`,
          'Min Token Out': opts.minTokenOut || '(auto)',
          'Network': getNetwork(),
        },
        confirmMsg: 'Execute SunPump buy?',
        spinnerLabel: 'Buying token...',
        errorLabel: 'SunPump buy failed',
        execute: (kit) => kit.sunpumpBuy({
          tokenAddress,
          trxAmount: opts.trxAmount,
          minTokenOut: opts.minTokenOut,
          slippage: parseFloat(opts.slippage),
          network: getNetwork(),
        }),
        onSuccess: async (result: any) => {
          if (!isJsonMode()) {
            const chalk = (await import('chalk')).default
            console.log()
            console.log(chalk.green('Buy executed successfully'))
            if (result.expectedTokens) console.log(`  Expected tokens: ${result.expectedTokens}`)
            if (result.trxSpent) console.log(`  TRX spent: ${result.trxSpent}`)
          }
        },
      })
    })

  sp
    .command('sell <tokenAddress>')
    .description('Sell a SunPump meme token for TRX')
    .requiredOption('--token-amount <raw>', 'Amount of tokens to sell (raw units)')
    .option('--min-trx-out <raw>', 'Minimum TRX to receive')
    .option('--slippage <n>', 'Slippage tolerance as decimal (e.g. 0.05 for 5%)', '0.05')
    .action(async (tokenAddress: string, opts) => {
      await writeAction({
        title: 'SunPump Sell',
        summary: {
          'Token': tokenAddress,
          'Token Amount': opts.tokenAmount,
          'Slippage': `${(parseFloat(opts.slippage) * 100).toFixed(1)}%`,
          'Min TRX Out': opts.minTrxOut || '(auto)',
          'Network': getNetwork(),
        },
        confirmMsg: 'Execute SunPump sell?',
        spinnerLabel: 'Selling token...',
        errorLabel: 'SunPump sell failed',
        execute: (kit) => kit.sunpumpSell({
          tokenAddress,
          tokenAmount: opts.tokenAmount,
          minTrxOut: opts.minTrxOut,
          slippage: parseFloat(opts.slippage),
          network: getNetwork(),
        }),
        onSuccess: async (result: any) => {
          if (!isJsonMode()) {
            const chalk = (await import('chalk')).default
            console.log()
            console.log(chalk.green('Sell executed successfully'))
            if (result.expectedTrx) console.log(`  Expected TRX: ${result.expectedTrx}`)
            if (result.tokensSold) console.log(`  Tokens sold: ${result.tokensSold}`)
          }
        },
      })
    })

  // ---------------------------------------------------------------------------
  // Read commands
  // ---------------------------------------------------------------------------

  sp
    .command('quote:buy <tokenAddress>')
    .description('Quote how many tokens you would receive for a given TRX amount')
    .requiredOption('--trx-amount <raw>', 'Amount of TRX (in sun)')
    .action(async (tokenAddress: string, opts) => {
      await readAction({
        spinnerLabel: 'Quoting buy...',
        errorLabel: 'SunPump quote buy failed',
        execute: (kit) => kit.sunpumpQuoteBuy(tokenAddress, opts.trxAmount, getNetwork()),
      })
    })

  sp
    .command('quote:sell <tokenAddress>')
    .description('Quote how much TRX you would receive for a given token amount')
    .requiredOption('--token-amount <raw>', 'Amount of tokens (raw units)')
    .action(async (tokenAddress: string, opts) => {
      await readAction({
        spinnerLabel: 'Quoting sell...',
        errorLabel: 'SunPump quote sell failed',
        execute: (kit) => kit.sunpumpQuoteSell(tokenAddress, opts.tokenAmount, getNetwork()),
      })
    })

  sp
    .command('info <tokenAddress>')
    .description('Get full info for a SunPump token (state, price, reserves)')
    .action(async (tokenAddress: string) => {
      await readAction({
        spinnerLabel: 'Fetching token info...',
        errorLabel: 'SunPump info failed',
        execute: (kit) => kit.getSunPumpTokenInfo(tokenAddress, getNetwork()),
        transform: (result: any) => ({
          ...result,
          stateLabel: STATE_LABELS[result.state] || `UNKNOWN(${result.state})`,
        }),
      })
    })

  sp
    .command('state <tokenAddress>')
    .description('Get the current state of a SunPump token (NOT_EXIST / TRADING / LAUNCHED)')
    .action(async (tokenAddress: string) => {
      await readAction({
        spinnerLabel: 'Fetching token state...',
        errorLabel: 'SunPump state failed',
        execute: (kit) => kit.getSunPumpTokenState(tokenAddress, getNetwork()),
        transform: (state: any) => ({
          tokenAddress,
          state: Number(state),
          stateLabel: STATE_LABELS[Number(state)] || `UNKNOWN(${state})`,
        }),
      })
    })

  sp
    .command('price <tokenAddress>')
    .description('Get the current price of a SunPump token')
    .action(async (tokenAddress: string) => {
      await readAction({
        spinnerLabel: 'Fetching token price...',
        errorLabel: 'SunPump price failed',
        execute: (kit) => kit.getSunPumpTokenPrice(tokenAddress, getNetwork()),
        transform: (price: any) => ({
          tokenAddress,
          price: String(price),
        }),
      })
    })
}
