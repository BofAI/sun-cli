import { Command } from 'commander'
import { getNetwork } from '../lib/context'
import { writeAction, readAction } from '../lib/command'
import { isJsonMode } from '../lib/output'

export function registerSwapCommands(program: Command) {
  program
    .command('swap <tokenIn> <tokenOut> <amountIn>')
    .description('Swap tokens via Universal Router (high-level, finds best route)')
    .option('--slippage <n>', 'Slippage tolerance as decimal (e.g. 0.005 for 0.5%)', '0.005')
    .action(async (tokenIn: string, tokenOut: string, amountIn: string, opts) => {
      const slippage = parseFloat(opts.slippage)
      await writeAction({
        title: 'Swap Preview',
        summary: {
          'Token In': tokenIn,
          'Token Out': tokenOut,
          'Amount In': amountIn,
          'Slippage': `${(slippage * 100).toFixed(2)}%`,
          'Network': getNetwork(),
        },
        confirmMsg: 'Execute this swap?',
        spinnerLabel: 'Executing swap...',
        errorLabel: 'Swap failed',
        execute: (kit) => kit.swap({ tokenIn, tokenOut, amountIn, slippage, network: getNetwork() }),
        onSuccess: async (result: any) => {
          if (!isJsonMode()) {
            const chalk = (await import('chalk')).default
            console.log()
            console.log(chalk.green('Swap executed successfully'))
            console.log(`  TxID: ${chalk.bold(result.txid)}`)
            if (result.route) {
              console.log(`  Route: ${result.route.symbols?.join(' → ')}`)
              console.log(`  Amount Out: ${result.route.amountOut}`)
              console.log(`  Price Impact: ${result.route.impact}`)
            }
          }
        },
      })
    })

  program
    .command('swap:quote')
    .description('Quote an exact-input swap via smart router (read-only)')
    .requiredOption('--router <address>', 'Smart router contract address')
    .option('--fn <name>', 'Quote function name', 'quoteExactInput')
    .requiredOption('--args <json>', 'Arguments as JSON array')
    .option('--abi <json>', 'Optional router ABI as JSON array')
    .action(async (opts) => {
      await readAction({
        spinnerLabel: 'Quoting swap...',
        errorLabel: 'Quote failed',
        execute: (kit) => kit.quoteExactInput({
          network: getNetwork(),
          routerAddress: opts.router,
          functionName: opts.fn,
          args: JSON.parse(opts.args),
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
        }),
        transform: (result) => ({ result }),
      })
    })

  program
    .command('swap:exact-input')
    .description('Execute a low-level swapExactInput via smart router')
    .requiredOption('--router <address>', 'Smart router contract address')
    .option('--fn <name>', 'Swap function name', 'swapExactInput')
    .requiredOption('--args <json>', 'Arguments as JSON array')
    .option('--value <sun>', 'TRX call value in Sun')
    .option('--abi <json>', 'Optional router ABI as JSON array')
    .action(async (opts) => {
      await writeAction({
        title: 'SwapExactInput',
        summary: {
          'Router': opts.router,
          'Function': opts.fn,
          'Args': opts.args,
          'Value': opts.value || '0',
        },
        confirmMsg: 'Execute this swap?',
        spinnerLabel: 'Executing swap...',
        errorLabel: 'SwapExactInput failed',
        execute: (kit) => kit.swapExactInput({
          network: getNetwork(),
          routerAddress: opts.router,
          functionName: opts.fn,
          args: JSON.parse(opts.args),
          value: opts.value,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
        }),
      })
    })
}
