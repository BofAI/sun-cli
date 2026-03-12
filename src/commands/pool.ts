import { Command } from 'commander'
import { getNetwork } from '../lib/context'
import { readApiAction } from '../lib/command'
import { tryResolveTokenAddress } from '../lib/tokens'
import { TRX_ADDRESS, WTRX_MAINNET, WTRX_NILE } from '@bankofai/sun-kit'

function resolveTokenForPoolQuery(input: string | undefined, network: string): string | undefined {
  if (!input) return undefined

  const resolved = tryResolveTokenAddress(input, network)
  if (!resolved) return input

  if (resolved === TRX_ADDRESS) {
    return network === 'nile' ? WTRX_NILE : WTRX_MAINNET
  }
  return resolved
}

export function registerPoolCommands(program: Command) {
  const pool = program
    .command('pool')
    .description('Pool operations and analytics')

  pool
    .command('list')
    .description('Fetch pools')
    .option('--address <poolAddress>', 'Pool contract address')
    .option('--token <tokenOrAddress>', 'Filter by token (symbol like TRX/USDT or address)')
    .option('--protocol <protocol>', 'Protocol filter (V2, V3)')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .option('--sort <field>', 'Sort field')
    .option('--no-blacklist', 'Include blacklisted')
    .action(async (opts) => {
      const network = getNetwork()
      const tokenAddress = resolveTokenForPoolQuery(opts.token, network)

      await readApiAction({
        spinnerLabel: 'Fetching pools...',
        errorLabel: 'Failed to fetch pools',
        execute: (api) => api.getPools({
          poolAddress: opts.address,
          tokenAddress,
          protocol: opts.protocol,
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
          sort: opts.sort,
          filterBlackList: opts.blacklist !== false ? undefined : false,
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Pool', 'Token0', 'Token1', 'Protocol', 'TVL', 'APY'],
          toRow: (item: any) => [
            item.poolAddress || item.address || '-',
            item.tokenSymbolList?.[0] || item.token0Symbol || '-',
            item.tokenSymbolList?.[1] || item.token1Symbol || '-',
            item.protocol || '-',
            item.reserveUsd ? `$${Number(item.reserveUsd).toLocaleString()}` : item.tvl || '-',
            item.totalApr ? `${(item.totalApr * 100).toFixed(2)}%` : item.apy || '-',
          ],
        },
      })
    })

  pool
    .command('search <keyword>')
    .description('Search for pools')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (keyword: string, opts) => {
      await readApiAction({
        spinnerLabel: `Searching pools for "${keyword}"...`,
        errorLabel: 'Failed to search pools',
        execute: (api) => api.searchPools({
          query: keyword,
          protocol: opts.protocol,
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Pool', 'Token0', 'Token1', 'Protocol', 'TVL'],
          toRow: (item: any) => [
            item.poolAddress || '-',
            item.tokenSymbolList?.[0] || item.token0Symbol || '-',
            item.tokenSymbolList?.[1] || item.token1Symbol || '-',
            item.protocol || '-',
            item.reserveUsd ? `$${Number(item.reserveUsd).toLocaleString()}` : item.tvl || '-',
          ],
        },
      })
    })

  pool
    .command('top-apy')
    .description('List pools with the highest APY')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching top APY pools...',
        errorLabel: 'Failed to fetch top APY pools',
        execute: (api) => api.getTopApyPoolList({
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Pool', 'Token0', 'Token1', 'APY', 'TVL'],
          toRow: (item: any) => [
            item.poolAddress || '-',
            item.tokenSymbolList?.[0] || item.token0Symbol || '-',
            item.tokenSymbolList?.[1] || item.token1Symbol || '-',
            item.totalApr ? `${(item.totalApr * 100).toFixed(2)}%` : item.apy || '-',
            item.reserveUsd ? `$${Number(item.reserveUsd).toLocaleString()}` : item.tvl || '-',
          ],
        },
      })
    })

  pool
    .command('hooks')
    .description('Get pool hooks')
    .action(async () => {
      await readApiAction({
        spinnerLabel: 'Fetching pool hooks...',
        errorLabel: 'Failed to fetch pool hooks',
        execute: (api) => api.getPoolHooks(),
        transform: (result: any) => result.data || result,
      })
    })

  pool
    .command('vol-history <poolAddress>')
    .description('Get pool volume history')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async (poolAddress: string, opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching pool volume history...',
        errorLabel: 'Failed to fetch pool volume history',
        execute: (api) => api.getPoolVolHistory({
          poolAddress,
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

  pool
    .command('liq-history <poolAddress>')
    .description('Get pool liquidity history')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async (poolAddress: string, opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching pool liquidity history...',
        errorLabel: 'Failed to fetch pool liquidity history',
        execute: (api) => api.getPoolLiqHistory({
          poolAddress,
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
