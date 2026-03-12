import { Command } from 'commander'
import { readApiAction } from '../lib/command'

export function registerPriceCommand(program: Command) {
  program
    .command('price [token]')
    .description('Get token prices from SUN.IO')
    .option('--address <addresses>', 'Comma-separated token contract addresses')
    .option('--symbol <symbols>', 'Comma-separated token symbols (e.g. TRX,USDT,SUN)')
    .action(async (token: string | undefined, opts) => {
      let tokenAddress = opts.address
      let symbol = opts.symbol

      if (token && !tokenAddress && !symbol) {
        if (token.startsWith('T') && token.length > 30) {
          tokenAddress = token
        } else {
          symbol = token
        }
      }

      await readApiAction({
        spinnerLabel: 'Fetching prices...',
        errorLabel: 'Failed to get token price',
        execute: (api) => api.getPrice({ tokenAddress, symbol }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Token', 'Price (USD)'],
          toRow: ([key, val]: [string, any]) => [
            key,
            typeof val === 'object' ? val.priceInUsd || val.price || JSON.stringify(val) : String(val),
          ],
        },
      })
    })
}
