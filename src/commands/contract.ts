import { Command } from 'commander'
import { getNetwork } from '../lib/context'
import { writeAction, readAction } from '../lib/command'

export function registerContractCommands(program: Command) {
  const contract = program
    .command('contract')
    .description('Generic TRON smart contract interactions')

  contract
    .command('read <address> <functionName>')
    .description('Call a view/pure function on a TRON smart contract')
    .option('--args <json>', 'Arguments as JSON array', '[]')
    .option('--abi <json>', 'Optional contract ABI as JSON array')
    .action(async (address: string, functionName: string, opts) => {
      await readAction({
        spinnerLabel: `Reading ${functionName}...`,
        errorLabel: 'Contract read failed',
        execute: (kit) => kit.readContract(
          { address, functionName, args: JSON.parse(opts.args), abi: opts.abi ? JSON.parse(opts.abi) : undefined },
          getNetwork(),
        ),
        transform: (result) => ({ result }),
      })
    })

  contract
    .command('send <address> <functionName>')
    .description('Send a state-changing transaction to a TRON smart contract')
    .option('--args <json>', 'Arguments as JSON array', '[]')
    .option('--value <sun>', 'TRX call value in Sun')
    .option('--abi <json>', 'Optional contract ABI as JSON array')
    .action(async (address: string, functionName: string, opts) => {
      await writeAction({
        title: 'Contract Transaction',
        summary: {
          'Contract': address,
          'Function': functionName,
          'Args': opts.args,
          'Value': opts.value || '0',
          'Network': getNetwork(),
        },
        confirmMsg: 'Send this transaction?',
        spinnerLabel: `Sending ${functionName}...`,
        errorLabel: 'Contract send failed',
        execute: (kit) => kit.sendContractTx({
          address,
          functionName,
          args: JSON.parse(opts.args),
          value: opts.value,
          abi: opts.abi ? JSON.parse(opts.abi) : undefined,
          network: getNetwork(),
        }),
      })
    })
}
