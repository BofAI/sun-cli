import { Command } from 'commander'
import { readApiAction } from '../lib/command'

export function registerFarmCommands(program: Command) {
  const farm = program
    .command('farm')
    .description('Farming pools and positions')

  farm
    .command('list')
    .description('List farming pools')
    .option('--farm <farmAddress>', 'Farm address filter')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching farms...',
        errorLabel: 'Failed to fetch farms',
        execute: (api) => api.getFarms({
          farmAddress: opts.farm,
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Farm', 'Token0', 'Token1', 'APR', 'TVL'],
          toRow: (item: any) => [
            item.farmAddress || item.address || '-',
            item.token0Symbol || '-',
            item.token1Symbol || '-',
            item.apr || '-',
            item.tvl || '-',
          ],
        },
      })
    })

  farm
    .command('tx')
    .description('Farm transaction history')
    .option('--owner <address>', 'Owner address')
    .option('--farm <farmAddress>', 'Farm address')
    .option('--type <farmTxType>', 'Transaction type')
    .option('--start <time>', 'Start time')
    .option('--end <time>', 'End time')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching farm transactions...',
        errorLabel: 'Failed to fetch farm transactions',
        execute: (api) => api.getFarmTransactions({
          userAddress: opts.owner,
          farmAddress: opts.farm,
          farmTxType: opts.type,
          startTime: opts.start,
          endTime: opts.end,
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
        }),
        transform: (result: any) => result.data || result,
      })
    })

  farm
    .command('positions')
    .description('User farming positions')
    .option('--owner <address>', 'Owner address')
    .option('--farm <farmAddress>', 'Farm address')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching farm positions...',
        errorLabel: 'Failed to fetch farm positions',
        execute: (api) => api.getFarmPositions({
          userAddress: opts.owner,
          farmAddress: opts.farm,
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
        }),
        transform: (result: any) => result.data || result,
      })
    })
}
