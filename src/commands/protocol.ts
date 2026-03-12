import { Command } from 'commander'
import { readApiAction } from '../lib/command'

export function registerProtocolCommands(program: Command) {
  const proto = program
    .command('protocol')
    .description('Protocol metrics and history')

  proto
    .command('info')
    .description('Get protocol snapshot')
    .option('--protocol <protocol>', 'Protocol filter')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching protocol info...',
        errorLabel: 'Failed to fetch protocol info',
        execute: (api) => api.getProtocol({ protocol: opts.protocol }),
        transform: (result: any) => result.data || result,
      })
    })

  proto
    .command('vol-history')
    .description('Protocol volume history')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching volume history...',
        errorLabel: 'Failed to fetch volume history',
        execute: (api) => api.getVolHistory({
          protocol: opts.protocol,
          startDate: opts.start,
          endDate: opts.end,
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Date', 'Volume'],
          toRow: (item: any) => [item.date || item.timestamp || '-', item.volume || item.vol || '-'],
        },
      })
    })

  proto
    .command('users-history')
    .description('Protocol users count history')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching users history...',
        errorLabel: 'Failed to fetch users history',
        execute: (api) => api.getUsersCountHistory({
          protocol: opts.protocol,
          startDate: opts.start,
          endDate: opts.end,
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Date', 'Users'],
          toRow: (item: any) => [item.date || item.timestamp || '-', item.usersCount || item.users || '-'],
        },
      })
    })

  proto
    .command('tx-history')
    .description('Protocol transaction count history')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching transaction history...',
        errorLabel: 'Failed to fetch transaction history',
        execute: (api) => api.getTransactionsHistory({
          protocol: opts.protocol,
          startDate: opts.start,
          endDate: opts.end,
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Date', 'Transactions'],
          toRow: (item: any) => [item.date || item.timestamp || '-', item.transactionsCount || item.txCount || '-'],
        },
      })
    })

  proto
    .command('pools-history')
    .description('Protocol pools count history')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching pools history...',
        errorLabel: 'Failed to fetch pools history',
        execute: (api) => api.getPoolsCountHistory({
          protocol: opts.protocol,
          startDate: opts.start,
          endDate: opts.end,
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Date', 'Pools'],
          toRow: (item: any) => [item.date || item.timestamp || '-', item.poolsCount || item.pools || '-'],
        },
      })
    })

  proto
    .command('liq-history')
    .description('Protocol liquidity history')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching liquidity history...',
        errorLabel: 'Failed to fetch liquidity history',
        execute: (api) => api.getLiqHistory({
          protocol: opts.protocol,
          startDate: opts.start,
          endDate: opts.end,
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Date', 'Liquidity'],
          toRow: (item: any) => [item.date || item.timestamp || '-', item.liquidity || item.liq || '-'],
        },
      })
    })
}
