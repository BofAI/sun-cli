import { Command } from 'commander'
import { readApiAction } from '../lib/command'

export function registerTokenCommands(program: Command) {
  const token = program
    .command('token')
    .description('Token lookup and search')

  token
    .command('list')
    .description('Fetch tokens by address or protocol')
    .option('--address <tokenAddress>', 'Token contract address')
    .option('--protocol <protocol>', 'Protocol filter (e.g. V2, V3)')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .option('--sort <field>', 'Sort field')
    .option('--no-blacklist', 'Include blacklisted tokens')
    .action(async (opts) => {
      await readApiAction({
        spinnerLabel: 'Fetching tokens...',
        errorLabel: 'Failed to fetch tokens',
        execute: (api) => api.getTokens({
          tokenAddress: opts.address,
          protocol: opts.protocol,
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
          sort: opts.sort,
          filterBlackList: opts.blacklist !== false ? undefined : false,
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Symbol', 'Address', 'Volume (24h)', 'Price'],
          toRow: (item: any) => [
            item.symbol || item.tokenSymbol || '-',
            item.tokenAddress || item.address || '-',
            item.volume24h || item.vol24h || '-',
            item.priceInUsd || item.price || '-',
          ],
        },
      })
    })

  token
    .command('search <keyword>')
    .description('Fuzzy search for tokens')
    .option('--protocol <protocol>', 'Protocol filter')
    .option('--page <n>', 'Page number', '1')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (keyword: string, opts) => {
      await readApiAction({
        spinnerLabel: `Searching tokens for "${keyword}"...`,
        errorLabel: 'Failed to search tokens',
        execute: (api) => api.searchTokens({
          query: keyword,
          protocol: opts.protocol,
          pageNo: parseInt(opts.page),
          pageSize: parseInt(opts.pageSize),
        }),
        transform: (result: any) => result.data || result,
        tableConfig: {
          headers: ['Symbol', 'Address', 'Volume (24h)', 'Price'],
          toRow: (item: any) => [
            item.symbol || item.tokenSymbol || '-',
            item.tokenAddress || item.address || '-',
            item.volume24h || item.vol24h || '-',
            item.priceInUsd || item.price || '-',
          ],
        },
      })
    })
}
