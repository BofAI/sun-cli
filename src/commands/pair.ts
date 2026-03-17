import { Command } from 'commander'
import { readApiAction } from '../lib/command'

export function registerPairCommands(program: Command) {
  const pair = program.command('pair').description('Token pair information')

  pair
    .command('info')
    .description('Get token pair info')
    .option('--token <tokenAddress>', 'Token address')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching pair info...',
        errorLabel: 'Failed to fetch pair info',
        execute: (api) =>
          api.getPairs({
            tokenAddress: opts.token,
            protocol: opts.protocol,
            pageNo: parseInt(opts.page),
            pageSize: parseInt(opts.pageSize),
          }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Pool', 'Token0', 'Token1', 'Protocol', 'TVL'],
          toRow: (item: any) => [
            item.poolAddress || item.pairAddress || '-',
            item.token0Symbol || '-',
            item.token1Symbol || '-',
            item.protocol || '-',
            item.tvl || item.liquidity || '-',
          ],
        },
      })
    })
}
