'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const commander_1 = require('commander')
const wallet_1 = require('../../src/commands/wallet')
const price_1 = require('../../src/commands/price')
const swap_1 = require('../../src/commands/swap')
const token_1 = require('../../src/commands/token')
const pool_1 = require('../../src/commands/pool')
const protocol_1 = require('../../src/commands/protocol')
const tx_1 = require('../../src/commands/tx')
const position_1 = require('../../src/commands/position')
const pair_1 = require('../../src/commands/pair')
const farm_1 = require('../../src/commands/farm')
const liquidity_1 = require('../../src/commands/liquidity')
const contract_1 = require('../../src/commands/contract')
function getCommandNames(program) {
  return program.commands.map((cmd) => cmd.name())
}
function getSubcommandNames(program, parentName) {
  const parent = program.commands.find((c) => c.name() === parentName)
  if (!parent) return []
  return parent.commands.map((cmd) => cmd.name())
}
describe('command registration', () => {
  let program
  beforeEach(() => {
    program = new commander_1.Command()
    program.exitOverride() // prevent process.exit
  })
  it('registers all top-level command groups', () => {
    ;(0, wallet_1.registerWalletCommands)(program)
    ;(0, price_1.registerPriceCommand)(program)
    ;(0, swap_1.registerSwapCommands)(program)
    ;(0, token_1.registerTokenCommands)(program)
    ;(0, pool_1.registerPoolCommands)(program)
    ;(0, protocol_1.registerProtocolCommands)(program)
    ;(0, tx_1.registerTxCommands)(program)
    ;(0, position_1.registerPositionCommands)(program)
    ;(0, pair_1.registerPairCommands)(program)
    ;(0, farm_1.registerFarmCommands)(program)
    ;(0, liquidity_1.registerLiquidityCommands)(program)
    ;(0, contract_1.registerContractCommands)(program)
    const names = getCommandNames(program)
    expect(names).toContain('wallet')
    expect(names).toContain('price')
    expect(names).toContain('swap')
    expect(names).toContain('token')
    expect(names).toContain('pool')
    expect(names).toContain('protocol')
    expect(names).toContain('tx')
    expect(names).toContain('position')
    expect(names).toContain('pair')
    expect(names).toContain('farm')
    expect(names).toContain('liquidity')
    expect(names).toContain('contract')
  })
  it('registers wallet subcommands', () => {
    ;(0, wallet_1.registerWalletCommands)(program)
    const subs = getSubcommandNames(program, 'wallet')
    expect(subs).toContain('address')
    expect(subs).toContain('balances')
  })
  it('registers liquidity subcommands including V3 collect and V4', () => {
    ;(0, liquidity_1.registerLiquidityCommands)(program)
    const subs = getSubcommandNames(program, 'liquidity')
    // V2
    expect(subs).toContain('v2:add')
    expect(subs).toContain('v2:remove')
    // V3
    expect(subs).toContain('v3:mint')
    expect(subs).toContain('v3:increase')
    expect(subs).toContain('v3:decrease')
    expect(subs).toContain('v3:collect')
    // V4
    expect(subs).toContain('v4:mint')
    expect(subs).toContain('v4:increase')
    expect(subs).toContain('v4:decrease')
    expect(subs).toContain('v4:collect')
    expect(subs).toContain('v4:info')
  })
  it('registers pool subcommands', () => {
    ;(0, pool_1.registerPoolCommands)(program)
    const subs = getSubcommandNames(program, 'pool')
    expect(subs).toContain('list')
    expect(subs).toContain('search')
    expect(subs).toContain('top-apy')
    expect(subs).toContain('hooks')
    expect(subs).toContain('vol-history')
    expect(subs).toContain('liq-history')
  })
  it('registers contract subcommands', () => {
    ;(0, contract_1.registerContractCommands)(program)
    const subs = getSubcommandNames(program, 'contract')
    expect(subs).toContain('read')
    expect(subs).toContain('send')
  })
})
//# sourceMappingURL=registration.test.js.map
