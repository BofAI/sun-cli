describe('command helpers', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  function loadCommandModule() {
    const ensureWallet = jest.fn().mockResolvedValue(undefined)
    const getKit = jest.fn().mockResolvedValue({ kind: 'kit' })
    const getApi = jest.fn()
    const output = jest.fn()
    const outputError = jest.fn()
    const withSpinner = jest.fn().mockImplementation(async (_label, fn) => await fn())
    const isJsonMode = jest.fn().mockReturnValue(false)
    const confirm = jest.fn().mockResolvedValue(true)
    const printSummary = jest.fn()

    jest.doMock('../../src/lib/context', () => ({
      ensureWallet,
      getKit,
      getApi,
    }))

    jest.doMock('../../src/lib/output', () => ({
      output,
      outputError,
      withSpinner,
      isJsonMode,
    }))

    jest.doMock('../../src/lib/confirm', () => ({
      confirm,
      printSummary,
    }))

    const commandModule = require('../../src/lib/command')
    return {
      commandModule,
      ensureWallet,
      getKit,
      output,
      outputError,
      withSpinner,
      confirm,
      printSummary,
    }
  }

  it('adds a nile tronscan URL when a write action returns txid', async () => {
    const { commandModule, output } = loadCommandModule()

    await commandModule.writeAction({
      title: 'Swap Preview',
      summary: { Network: 'nile' },
      confirmMsg: 'Execute?',
      spinnerLabel: 'Executing...',
      errorLabel: 'Swap failed',
      execute: async () => ({
        txid: 'abc123',
        route: { amountOut: '1.23' },
      }),
    })

    expect(output).toHaveBeenCalledWith({
      txid: 'abc123',
      route: { amountOut: '1.23' },
      tronscanUrl: 'https://nile.tronscan.org/#/transaction/abc123',
    })
  })

  it('uses the result network when present for explorer links', async () => {
    const { commandModule, output } = loadCommandModule()

    await commandModule.writeAction({
      title: 'Contract Transaction',
      summary: { Network: 'mainnet' },
      confirmMsg: 'Execute?',
      spinnerLabel: 'Executing...',
      errorLabel: 'Send failed',
      execute: async () => ({
        txid: 'mainnet-tx',
        network: 'shasta',
      }),
    })

    expect(output).toHaveBeenCalledWith({
      txid: 'mainnet-tx',
      network: 'shasta',
      tronscanUrl: 'https://shasta.tronscan.org/#/transaction/mainnet-tx',
    })
  })
})
