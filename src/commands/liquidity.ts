import { Command } from 'commander'
import { getNetwork } from '../lib/context'
import { writeAction, readAction } from '../lib/command'
import { printKeyValue } from '../lib/output'

export function registerLiquidityCommands(program: Command) {
  const liq = program
    .command('liquidity')
    .description('V2, V3, and V4 liquidity management')

  // ---------------------------------------------------------------------------
  // V2
  // ---------------------------------------------------------------------------

  liq
    .command('v2:add')
    .description('Add liquidity to a SUNSWAP V2 pool')
    .requiredOption('--router <address>', 'V2 router contract address')
    .requiredOption('--token-a <address>', 'Token A contract address')
    .requiredOption('--token-b <address>', 'Token B contract address')
    .requiredOption('--amount-a <raw>', 'Desired amount of token A (raw units)')
    .requiredOption('--amount-b <raw>', 'Desired amount of token B (raw units)')
    .option('--min-a <raw>', 'Minimum amount of token A')
    .option('--min-b <raw>', 'Minimum amount of token B')
    .option('--to <address>', 'Recipient for LP tokens (default: active wallet)')
    .option('--deadline <timestamp>', 'Unix timestamp deadline')
    .option('--abi <json>', 'Optional router ABI as JSON array')
    .action(async (opts) => {
      await writeAction({
        title: 'V2 Add Liquidity',
        summary: {
          'Router': opts.router,
          'Token A': opts.tokenA,
          'Token B': opts.tokenB,
          'Amount A': opts.amountA,
          'Amount B': opts.amountB,
          'Network': getNetwork(),
        },
        confirmMsg: 'Add V2 liquidity?',
        spinnerLabel: 'Adding V2 liquidity...',
        errorLabel: 'V2 add liquidity failed',
        execute: (kit) => kit.addLiquidityV2({
          network: getNetwork(),
          routerAddress: opts.router,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
          tokenA: opts.tokenA,
          tokenB: opts.tokenB,
          amountADesired: opts.amountA,
          amountBDesired: opts.amountB,
          amountAMin: opts.minA,
          amountBMin: opts.minB,
          to: opts.to,
          deadline: opts.deadline,
        }),
      })
    })

  liq
    .command('v2:remove')
    .description('Remove liquidity from a SUNSWAP V2 pool')
    .requiredOption('--router <address>', 'V2 router contract address')
    .requiredOption('--token-a <address>', 'Token A contract address')
    .requiredOption('--token-b <address>', 'Token B contract address')
    .requiredOption('--liquidity <raw>', 'LP tokens to burn')
    .option('--min-a <raw>', 'Minimum amount of token A to receive')
    .option('--min-b <raw>', 'Minimum amount of token B to receive')
    .option('--to <address>', 'Recipient of underlying tokens')
    .option('--deadline <timestamp>', 'Unix timestamp deadline')
    .option('--abi <json>', 'Optional router ABI as JSON array')
    .action(async (opts) => {
      await writeAction({
        title: 'V2 Remove Liquidity',
        summary: {
          'Router': opts.router,
          'Token A': opts.tokenA,
          'Token B': opts.tokenB,
          'LP Tokens': opts.liquidity,
          'Network': getNetwork(),
        },
        confirmMsg: 'Remove V2 liquidity?',
        spinnerLabel: 'Removing V2 liquidity...',
        errorLabel: 'V2 remove liquidity failed',
        execute: (kit) => kit.removeLiquidityV2({
          network: getNetwork(),
          routerAddress: opts.router,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
          tokenA: opts.tokenA,
          tokenB: opts.tokenB,
          liquidity: opts.liquidity,
          amountAMin: opts.minA,
          amountBMin: opts.minB,
          to: opts.to,
          deadline: opts.deadline,
        }),
      })
    })

  // ---------------------------------------------------------------------------
  // V3
  // ---------------------------------------------------------------------------

  liq
    .command('v3:mint')
    .description('Mint a new SUNSWAP V3 concentrated liquidity position')
    .requiredOption('--pm <address>', 'V3 NonfungiblePositionManager address')
    .requiredOption('--token0 <address>', 'Token0 contract address')
    .requiredOption('--token1 <address>', 'Token1 contract address')
    .requiredOption('--fee <n>', 'Pool fee tier (e.g. 500, 3000)')
    .requiredOption('--tick-lower <n>', 'Lower tick')
    .requiredOption('--tick-upper <n>', 'Upper tick')
    .requiredOption('--amount0 <raw>', 'Desired amount of token0')
    .requiredOption('--amount1 <raw>', 'Desired amount of token1')
    .option('--min0 <raw>', 'Minimum amount of token0')
    .option('--min1 <raw>', 'Minimum amount of token1')
    .option('--recipient <address>', 'NFT recipient')
    .option('--deadline <timestamp>', 'Unix timestamp deadline')
    .option('--abi <json>', 'Optional PM ABI as JSON array')
    .action(async (opts) => {
      await writeAction({
        title: 'V3 Mint Position',
        summary: {
          'Position Manager': opts.pm,
          'Token0': opts.token0,
          'Token1': opts.token1,
          'Fee': opts.fee,
          'Tick Range': `[${opts.tickLower}, ${opts.tickUpper}]`,
          'Amount0': opts.amount0,
          'Amount1': opts.amount1,
        },
        confirmMsg: 'Mint V3 position?',
        spinnerLabel: 'Minting V3 position...',
        errorLabel: 'V3 mint failed',
        execute: (kit) => kit.mintPositionV3({
          network: getNetwork(),
          positionManagerAddress: opts.pm,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
          token0: opts.token0,
          token1: opts.token1,
          fee: parseInt(opts.fee),
          tickLower: parseInt(opts.tickLower),
          tickUpper: parseInt(opts.tickUpper),
          amount0Desired: opts.amount0,
          amount1Desired: opts.amount1,
          amount0Min: opts.min0,
          amount1Min: opts.min1,
          recipient: opts.recipient,
          deadline: opts.deadline,
        }),
      })
    })

  liq
    .command('v3:increase')
    .description('Increase liquidity of an existing V3 position')
    .requiredOption('--pm <address>', 'V3 NonfungiblePositionManager address')
    .requiredOption('--token-id <id>', 'Position NFT token ID')
    .requiredOption('--amount0 <raw>', 'Additional amount of token0')
    .requiredOption('--amount1 <raw>', 'Additional amount of token1')
    .requiredOption('--min0 <raw>', 'Minimum amount of token0')
    .requiredOption('--min1 <raw>', 'Minimum amount of token1')
    .requiredOption('--deadline <timestamp>', 'Unix timestamp deadline')
    .option('--abi <json>', 'Optional PM ABI as JSON array')
    .action(async (opts) => {
      await writeAction({
        title: 'V3 Increase Liquidity',
        summary: {
          'Position Manager': opts.pm,
          'Token ID': opts.tokenId,
          'Amount0': opts.amount0,
          'Amount1': opts.amount1,
        },
        confirmMsg: 'Increase V3 liquidity?',
        spinnerLabel: 'Increasing V3 liquidity...',
        errorLabel: 'V3 increase liquidity failed',
        execute: (kit) => kit.increaseLiquidityV3({
          network: getNetwork(),
          positionManagerAddress: opts.pm,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
          tokenId: opts.tokenId,
          amount0Desired: opts.amount0,
          amount1Desired: opts.amount1,
          amount0Min: opts.min0,
          amount1Min: opts.min1,
          deadline: opts.deadline,
        }),
      })
    })

  liq
    .command('v3:decrease')
    .description('Decrease liquidity of an existing V3 position')
    .requiredOption('--pm <address>', 'V3 NonfungiblePositionManager address')
    .requiredOption('--token-id <id>', 'Position NFT token ID')
    .requiredOption('--liquidity <raw>', 'Amount of liquidity to remove')
    .requiredOption('--min0 <raw>', 'Minimum amount of token0 to receive')
    .requiredOption('--min1 <raw>', 'Minimum amount of token1 to receive')
    .requiredOption('--deadline <timestamp>', 'Unix timestamp deadline')
    .option('--abi <json>', 'Optional PM ABI as JSON array')
    .action(async (opts) => {
      await writeAction({
        title: 'V3 Decrease Liquidity',
        summary: {
          'Position Manager': opts.pm,
          'Token ID': opts.tokenId,
          'Liquidity': opts.liquidity,
        },
        confirmMsg: 'Decrease V3 liquidity?',
        spinnerLabel: 'Decreasing V3 liquidity...',
        errorLabel: 'V3 decrease liquidity failed',
        execute: (kit) => kit.decreaseLiquidityV3({
          network: getNetwork(),
          positionManagerAddress: opts.pm,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
          tokenId: opts.tokenId,
          liquidity: opts.liquidity,
          amount0Min: opts.min0,
          amount1Min: opts.min1,
          deadline: opts.deadline,
        }),
      })
    })

  liq
    .command('v3:collect')
    .description('Collect accrued fees from an existing V3 position')
    .requiredOption('--pm <address>', 'V3 NonfungiblePositionManager address')
    .requiredOption('--token-id <id>', 'Position NFT token ID')
    .option('--recipient <address>', 'Fee recipient (default: active wallet)')
    .option('--abi <json>', 'Optional PM ABI as JSON array')
    .action(async (opts) => {
      await writeAction({
        title: 'V3 Collect Fees',
        summary: {
          'Position Manager': opts.pm,
          'Token ID': opts.tokenId,
          'Recipient': opts.recipient || '(active wallet)',
          'Network': getNetwork(),
        },
        confirmMsg: 'Collect V3 fees?',
        spinnerLabel: 'Collecting V3 fees...',
        errorLabel: 'V3 collect failed',
        execute: (kit) => kit.collectPositionV3({
          network: getNetwork(),
          positionManagerAddress: opts.pm,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
          tokenId: opts.tokenId,
          recipient: opts.recipient,
        }),
      })
    })

  // ---------------------------------------------------------------------------
  // V4
  // ---------------------------------------------------------------------------

  liq
    .command('v4:mint')
    .description('Mint a new SUNSWAP V4 concentrated liquidity position')
    .requiredOption('--token0 <address>', 'Token0 contract address')
    .requiredOption('--token1 <address>', 'Token1 contract address')
    .option('--fee <n>', 'Pool fee tier (e.g. 500)')
    .option('--tick-lower <n>', 'Lower tick (auto-computed if omitted)')
    .option('--tick-upper <n>', 'Upper tick (auto-computed if omitted)')
    .option('--amount0 <raw>', 'Desired amount of token0')
    .option('--amount1 <raw>', 'Desired amount of token1')
    .option('--slippage <n>', 'Slippage tolerance as decimal (e.g. 0.01 for 1%)')
    .option('--recipient <address>', 'NFT recipient')
    .option('--deadline <timestamp>', 'Unix timestamp deadline')
    .option('--sqrt-price <value>', 'Initial sqrtPriceX96 (for pool creation)')
    .action(async (opts) => {
      await writeAction({
        title: 'V4 Mint Position',
        summary: {
          'Token0': opts.token0,
          'Token1': opts.token1,
          'Fee': opts.fee || '(auto)',
          'Tick Range': opts.tickLower && opts.tickUpper ? `[${opts.tickLower}, ${opts.tickUpper}]` : '(auto)',
          'Amount0': opts.amount0 || '-',
          'Amount1': opts.amount1 || '-',
          'Slippage': opts.slippage ? `${(parseFloat(opts.slippage) * 100).toFixed(2)}%` : '(default)',
          'Network': getNetwork(),
        },
        confirmMsg: 'Mint V4 position?',
        spinnerLabel: 'Minting V4 position...',
        errorLabel: 'V4 mint failed',
        execute: (kit) => kit.mintPositionV4({
          network: getNetwork(),
          token0: opts.token0,
          token1: opts.token1,
          fee: opts.fee ? parseInt(opts.fee) : undefined,
          tickLower: opts.tickLower ? parseInt(opts.tickLower) : undefined,
          tickUpper: opts.tickUpper ? parseInt(opts.tickUpper) : undefined,
          amount0Desired: opts.amount0,
          amount1Desired: opts.amount1,
          slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
          recipient: opts.recipient,
          deadline: opts.deadline,
          sqrtPriceX96: opts.sqrtPrice,
        }),
      })
    })

  liq
    .command('v4:increase')
    .description('Increase liquidity of an existing V4 position')
    .requiredOption('--token-id <id>', 'Position NFT token ID')
    .requiredOption('--token0 <address>', 'Token0 contract address')
    .requiredOption('--token1 <address>', 'Token1 contract address')
    .option('--fee <n>', 'Pool fee tier')
    .option('--amount0 <raw>', 'Additional amount of token0')
    .option('--amount1 <raw>', 'Additional amount of token1')
    .option('--slippage <n>', 'Slippage tolerance as decimal')
    .option('--deadline <timestamp>', 'Unix timestamp deadline')
    .action(async (opts) => {
      await writeAction({
        title: 'V4 Increase Liquidity',
        summary: {
          'Token ID': opts.tokenId,
          'Token0': opts.token0,
          'Token1': opts.token1,
          'Amount0': opts.amount0 || '-',
          'Amount1': opts.amount1 || '-',
          'Network': getNetwork(),
        },
        confirmMsg: 'Increase V4 liquidity?',
        spinnerLabel: 'Increasing V4 liquidity...',
        errorLabel: 'V4 increase liquidity failed',
        execute: (kit) => kit.increaseLiquidityV4({
          network: getNetwork(),
          tokenId: opts.tokenId,
          token0: opts.token0,
          token1: opts.token1,
          fee: opts.fee ? parseInt(opts.fee) : undefined,
          amount0Desired: opts.amount0,
          amount1Desired: opts.amount1,
          slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
          deadline: opts.deadline,
        }),
      })
    })

  liq
    .command('v4:decrease')
    .description('Decrease liquidity of an existing V4 position')
    .requiredOption('--token-id <id>', 'Position NFT token ID')
    .requiredOption('--liquidity <raw>', 'Amount of liquidity to remove')
    .requiredOption('--token0 <address>', 'Token0 contract address')
    .requiredOption('--token1 <address>', 'Token1 contract address')
    .option('--fee <n>', 'Pool fee tier')
    .option('--min0 <raw>', 'Minimum amount of token0 to receive')
    .option('--min1 <raw>', 'Minimum amount of token1 to receive')
    .option('--slippage <n>', 'Slippage tolerance as decimal')
    .option('--deadline <timestamp>', 'Unix timestamp deadline')
    .action(async (opts) => {
      await writeAction({
        title: 'V4 Decrease Liquidity',
        summary: {
          'Token ID': opts.tokenId,
          'Liquidity': opts.liquidity,
          'Token0': opts.token0,
          'Token1': opts.token1,
          'Network': getNetwork(),
        },
        confirmMsg: 'Decrease V4 liquidity?',
        spinnerLabel: 'Decreasing V4 liquidity...',
        errorLabel: 'V4 decrease liquidity failed',
        execute: (kit) => kit.decreaseLiquidityV4({
          network: getNetwork(),
          tokenId: opts.tokenId,
          liquidity: opts.liquidity,
          token0: opts.token0,
          token1: opts.token1,
          fee: opts.fee ? parseInt(opts.fee) : undefined,
          amount0Min: opts.min0,
          amount1Min: opts.min1,
          slippage: opts.slippage ? parseFloat(opts.slippage) : undefined,
          deadline: opts.deadline,
        }),
      })
    })

  liq
    .command('v4:collect')
    .description('Collect accrued fees from an existing V4 position')
    .requiredOption('--token-id <id>', 'Position NFT token ID')
    .option('--token0 <address>', 'Token0 contract address')
    .option('--token1 <address>', 'Token1 contract address')
    .option('--fee <n>', 'Pool fee tier')
    .option('--deadline <timestamp>', 'Unix timestamp deadline')
    .action(async (opts) => {
      await writeAction({
        title: 'V4 Collect Fees',
        summary: {
          'Token ID': opts.tokenId,
          'Token0': opts.token0 || '(auto)',
          'Token1': opts.token1 || '(auto)',
          'Network': getNetwork(),
        },
        confirmMsg: 'Collect V4 fees?',
        spinnerLabel: 'Collecting V4 fees...',
        errorLabel: 'V4 collect failed',
        execute: (kit) => kit.collectPositionV4({
          network: getNetwork(),
          tokenId: opts.tokenId,
          token0: opts.token0,
          token1: opts.token1,
          fee: opts.fee ? parseInt(opts.fee) : undefined,
          deadline: opts.deadline,
        }),
      })
    })

  liq
    .command('v4:info')
    .description('Get details of an existing V4 position (read-only)')
    .requiredOption('--pm <address>', 'V4 CLPositionManager address')
    .requiredOption('--token-id <id>', 'Position NFT token ID')
    .action(async (opts) => {
      await readAction({
        spinnerLabel: 'Fetching V4 position info...',
        errorLabel: 'V4 position info failed',
        execute: (kit) => kit.getV4PositionInfo(opts.pm, opts.tokenId, getNetwork()),
        transform: (result) => {
          if (!result) return { error: 'Position not found' }
          return {
            currency0: result.poolKey.currency0,
            currency1: result.poolKey.currency1,
            fee: result.poolKey.fee,
            tickSpacing: result.poolKey.tickSpacing,
            tickLower: result.tickLower,
            tickUpper: result.tickUpper,
            liquidity: result.liquidity,
          }
        },
      })
    })
}
