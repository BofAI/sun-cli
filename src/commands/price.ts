import { Command } from 'commander'
import { getNetwork } from '../lib/context'
import { readApiAction } from '../lib/command'
import { resolveTokenAddress, getSymbolOrAddress, listKnownSymbols } from '../lib/tokens'

function extractPrice(val: any): string {
  if (typeof val === 'number') return val.toString()
  if (typeof val === 'string') return val
  if (val?.quote?.USD?.price) return val.quote.USD.price
  if (val?.priceInUsd) return val.priceInUsd
  if (val?.price) return val.price
  return JSON.stringify(val)
}

export function registerPriceCommand(program: Command) {
  program
    .command('price [token]')
    .description('Get token prices from SUN.IO')
    .option('--address <addresses>', 'Comma-separated token contract addresses')
    .action(async (token: string | undefined, opts) => {
      const network = getNetwork()
      let tokenAddress = opts.address

      if (token && !tokenAddress) {
        try {
          tokenAddress = resolveTokenAddress(token, network)
        } catch (err: any) {
          console.error(err.message)
          process.exitCode = 1
          return
        }
      }

      if (!tokenAddress) {
        console.error('Please specify a token symbol or --address')
        console.error('Known symbols: ' + listKnownSymbols(network).join(', '))
        process.exitCode = 1
        return
      }

      await readApiAction({
        spinnerLabel: 'Fetching prices...',
        errorLabel: 'Failed to get token price',
        execute: (api) => api.getPrice({ tokenAddress }),
        transform: (result: any) => {
          const data = result.data || result
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            return Object.entries(data)
          }
          return data
        },
        tableConfig: {
          headers: ['Token', 'Price (USD)'],
          toRow: ([address, val]: [string, any]) => {
            const symbol = getSymbolOrAddress(address, network)
            return [symbol, extractPrice(val)]
          },
        },
      })
    })
}
