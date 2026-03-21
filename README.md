# sun-cli

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Network](https://img.shields.io/badge/Network-TRON-red)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

A CLI for AI-driven and human-operated DeFi workflows on the TRON network through the SUN.IO / SUNSWAP ecosystem.

## Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
  - [Install](#install)
  - [Example Commands](#example-commands)
  - [Wallet Configuration](#wallet-configuration)
  - [Runtime Configuration](#runtime-configuration)
- [Command Guide](#command-guide)
  - [Wallet & Portfolio](#wallet--portfolio)
  - [Price & Discovery](#price--discovery)
  - [Swap](#swap)
  - [Liquidity](#liquidity)
  - [Protocol & History](#protocol--history)
  - [Generic Contract](#generic-contract)
- [Global Flags](#global-flags)
- [Output Modes](#output-modes)
- [Built-In Token Symbols](#built-in-token-symbols)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Development](#development)
- [License](#license)

## Overview

Connect your terminal, scripts, or AI agents to SUN.IO through a single CLI. With `@bankofai/sun-cli`, you can:

- **Query** token prices, pools, protocol metrics, farm data, positions, and transaction history
- **Quote** swap routes across SUNSwap routing paths
- **Execute** swaps, liquidity management, and contract writes with a configured wallet
- **Automate** machine-friendly workflows with compact JSON, field filtering, dry-run mode, and no-prompt execution

The CLI supports both interactive terminal usage and automation-oriented invocation patterns. Without wallet credentials, read-only commands still work.

## Quick Start

### Install

Install from npm:

```bash
npm install -g @bankofai/sun-cli
```

### Example Commands

Read-only:

```bash
$ sun price TRX
```

Example response for `sun price TRX`:

```text
✔ Fetching prices...
┌───────┬────────────────┐
│ Token │ Price (USD)    │
├───────┼────────────────┤
│ TRX   │ 0.301739439813 │
└───────┴────────────────┘
```

```bash
$ sun pool top-apy --page-size 5
```

Example response for `sun pool top-apy --page-size 5`:

```text
✔ Fetching top APY pools...
┌────────────────────────────────────┬────────┬─────────┬────────┬────────────────┐
│ Pool                               │ Token0 │ Token1  │ APY    │ TVL            │
├────────────────────────────────────┼────────┼─────────┼────────┼────────────────┤
│ TXX1i3BWKBuTxUmTERCztGyxSSpRagEcjX │ TRX    │ USDCOLD │ 29.13% │ $215,543.763   │
├────────────────────────────────────┼────────┼─────────┼────────┼────────────────┤
│ TDJUxxbmxwC5gUHXm2on4ZHJwjzwkBcJ8s │ TEM    │ WTRX    │ 27.50% │ $168,679.435   │
├────────────────────────────────────┼────────┼─────────┼────────┼────────────────┤
│ TVrZ3PjjFGbnp44p6SGASAKrJWAUjCHmCA │ TRX    │ ETH     │ 14.61% │ $286,068.322   │
├────────────────────────────────────┼────────┼─────────┼────────┼────────────────┤
│ TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE │ TRX    │ USDT    │ 13.60% │ $1,179,854.455 │
├────────────────────────────────────┼────────┼─────────┼────────┼────────────────┤
│ TDR7rpU33hToG8qo9i676V56bzcjkpjqox │ WTRX   │ SUNDOG  │ 8.38%  │ $782,507.15    │
└────────────────────────────────────┴────────┴─────────┴────────┴────────────────┘
```

```bash
$ sun swap:quote TRX USDT 1000000 --network nile
```

Example response for `sun swap:quote TRX USDT 1000000 --network nile`:

```text
✔ Fetching quote...

Found 3 route(s) for swap:

  Path:         TRX → WIN → USDJ → USDT
  Pools:        v1 → v2 → old3pool
  Amount In:    1.000000
  Amount Out:   66.028258
  Price Impact: -0.183279

  (2 more route(s) available, use --all to see them)
```

Wallet-aware:

```bash
$ sun wallet address
```

Example response for `sun wallet address`:

```json
{ "address": "TNmoJ3Be59WFEq5dsW6eCkZjveiL3G8HVB", "network": "mainnet" }
```

```bash
$ sun swap TRX USDT 1000000 --network nile --yes
```

Example response for `sun swap TRX USDT 1000000 --network nile --yes`:

```text
Swap Preview
  Token In   TRX (T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb)
  Token Out  USDT (TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf)
  Amount In  1000000
  Slippage   0.50%
  Network    nile

✔ Executing swap...
{"txid":"4b2ae5186666d30c9f034489813a43ad8edc771f7228759b5e6145a6f134834e","route":{"amountIn":"1.000000","amountOut":"66.028258","symbols":["TRX","WIN","USDJ","USDT"],"poolVersions":["v1","v2","old3pool"],"impact":"-0.183279"},"tronscanUrl":"https://nile.tronscan.org/#/transaction/4b2ae5186666d30c9f034489813a43ad8edc771f7228759b5e6145a6f134834e"}

Swap executed successfully
  TxID: 4b2ae5186666d30c9f034489813a43ad8edc771f7228759b5e6145a6f134834e
  Tronscan: https://nile.tronscan.org/#/transaction/4b2ae5186666d30c9f034489813a43ad8edc771f7228759b5e6145a6f134834e
  Route: TRX → WIN → USDJ → USDT
  Amount Out: 66.028258
  Price Impact: -0.183279
```

Write operations such as `swap`, `liquidity`, and `contract send` require wallet credentials.

### Wallet Configuration

**Option 1 (Recommended): [Agent Wallet](https://github.com/BofAI/agent-wallet#cli)** — password-protected encrypted keystore, purpose-built for AI agents. Private keys are never stored in plaintext.

```bash
export AGENT_WALLET_PASSWORD=your_wallet_password
export AGENT_WALLET_DIR=/absolute/path/to/.agent   # optional, defaults to ~/.agent
```

**Option 2: Private key**

```bash
export AGENT_WALLET_PRIVATE_KEY=your_private_key
```

**Option 3: Mnemonic**

```bash
export AGENT_WALLET_MNEMONIC="word1 word2 word3 ..."

export AGENT_WALLET_MNEMONIC_ACCOUNT_INDEX=0   # optional, default 0
```

> **Note**
> You can also override these per invocation with root-level flags such as `-k`, `-m`, `-i`, `-p`, and `-d`.

### Runtime Configuration

Optional environment variables:

```bash
export TRON_NETWORK=mainnet
export TRONGRID_API_KEY=your_api_key
export TRON_RPC_URL=https://your-tron-rpc.example
```

The CLI auto-loads `.env` files via `dotenv`, so you can keep these values in a local `.env` file as well.

## Command Guide

### Wallet & Portfolio

Inspect the active wallet and balances:

```bash
sun wallet address
sun wallet balances
sun wallet balances --owner TYourAddress --tokens TRX,TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

Related read-only portfolio commands:

```bash
sun position list --owner TYourAddress
sun position tick <poolAddress>
sun farm positions --owner TYourAddress
```

### Price & Discovery

Token prices:

```bash
sun price TRX
sun price USDT
sun price --address TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

Token, pool, pair, and farm discovery:

```bash
sun token list --protocol V3
sun token search USDT
sun pool list --token TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
sun pool search "TRX USDT"
sun pool top-apy --page-size 10
sun pool hooks
sun pair info --token TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
sun farm list
```

### Swap

High-level swap execution:

```bash
sun swap TRX USDT 1000000 --slippage 0.005
sun -k your_private_key --network nile --yes swap TRX USDT 1000000
```

Read-only quote:

```bash
sun swap:quote TRX USDT 1000000
sun swap:quote TRX USDT 1000000 --all
```

Low-level router interaction:

```bash
sun swap:quote-raw --router <routerAddress> --args '[...]'
sun swap:exact-input --router <routerAddress> --args '[...]' --value 1000000
```

Successful broadcast responses include:

- `txid`
- route details when available
- `tronscanUrl` based on the selected network

### Liquidity

V2:

```bash
sun liquidity v2:add --token-a TRX --token-b USDT --amount-a 1000000 --amount-b 290000
sun liquidity v2:remove --token-a TRX --token-b USDT --liquidity 500000
```

V3:

```bash
sun liquidity v3:mint --token0 TRX --token1 USDT --amount0 1000000
sun liquidity v3:increase --token-id 123 --amount0 500000
sun liquidity v3:decrease --token-id 123 --liquidity 1000
sun liquidity v3:collect --token-id 123
```

V4:

```bash
sun liquidity v4:mint --token0 TRX --token1 USDT --amount0 1000000
sun liquidity v4:mint --token0 TRX --token1 USDT --amount0 1000000 --create-pool
sun liquidity v4:increase --token-id 123 --token0 TRX --token1 USDT --amount0 500000
sun liquidity v4:decrease --token-id 123 --liquidity 1000 --token0 TRX --token1 USDT
sun liquidity v4:collect --token-id 123
sun liquidity v4:info --pm <positionManager> --token-id 123
```

### Protocol & History

Protocol analytics:

```bash
sun protocol info
sun protocol vol-history --start 2026-01-01 --end 2026-03-01
sun protocol users-history --start 2026-01-01 --end 2026-03-01
sun protocol tx-history --start 2026-01-01 --end 2026-03-01
sun protocol pools-history --start 2026-01-01 --end 2026-03-01
sun protocol liq-history --start 2026-01-01 --end 2026-03-01
```

Pool and transaction history:

```bash
sun pool vol-history <poolAddress> --start 2026-01-01 --end 2026-03-01
sun pool liq-history <poolAddress> --start 2026-01-01 --end 2026-03-01
sun tx scan --type swap --token TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t --start 2026-01-01
```

### Generic Contract

Read from or write to arbitrary TRON smart contracts:

```bash
sun contract read <contractAddress> balanceOf --args '["TYourAddress"]'
sun contract send <contractAddress> transfer --args '["TRecipient","1000000"]' --value 0
```

`contract send` also returns `tronscanUrl` when a transaction is broadcast successfully.

## Global Flags

All commands inherit these root-level flags:

| Flag                                     | Description                                               |
| ---------------------------------------- | --------------------------------------------------------- |
| `--output <format>`                      | Output format: `table`, `json`, `tsv`                     |
| `--json`                                 | Shortcut for JSON output                                  |
| `--fields <list>`                        | Comma-separated output field filter                       |
| `--network <network>`                    | Override `TRON_NETWORK`                                   |
| `-k, --private-key <key>`                | Provide a private key for this invocation only            |
| `-m, --mnemonic <phrase>`                | Provide a mnemonic for this invocation only               |
| `-i, --mnemonic-account-index <index>`   | Provide a mnemonic account index for this invocation only |
| `-p, --agent-wallet-password <password>` | Override `AGENT_WALLET_PASSWORD` for this invocation      |
| `-d, --agent-wallet-dir <dir>`           | Override `AGENT_WALLET_DIR` for this invocation           |
| `-y, --yes`                              | Skip confirmation prompts                                 |
| `--dry-run`                              | Print intent without sending the write action             |

Examples:

```bash
sun --json price TRX
sun --output tsv pool top-apy --page-size 10
sun --fields address,network wallet address
sun -p your_agent_wallet_password wallet address
sun -k your_private_key --network nile --yes swap TRX USDT 1000000
sun --dry-run contract send TContract transfer --args '["TRecipient","1000000"]'
```

## Output Modes

`sun-cli` supports three output modes:

- **table** — default, human-friendly terminal output
- **json** — compact machine-readable JSON
- **tsv** — tab-separated values for shell pipelines

Examples:

```bash
sun pool top-apy --page-size 5
sun --json wallet address
sun --output tsv token list --protocol V3
sun --json --fields txid,tronscanUrl swap TRX USDT 1000000
```

## Built-In Token Symbols

Many commands accept token symbols in addition to TRON addresses.

| Symbol | Address                              | Decimals |
| ------ | ------------------------------------ | -------- |
| `TRX`  | `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` | 6        |
| `WTRX` | `TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR` | 6        |
| `USDT` | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` | 6        |
| `USDC` | `TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8` | 6        |
| `USDD` | `TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn` | 18       |
| `SUN`  | `TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S` | 18       |
| `JST`  | `TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9` | 18       |
| `BTT`  | `TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4` | 18       |
| `WIN`  | `TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7` | 6        |

Example:

```bash
sun swap TRX USDT 1000000
sun swap T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t 1000000
```

## Troubleshooting

### `unknown command 'nile'`

Root flags must be placed before the subcommand:

```bash
sun --network nile swap TRX USDT 1000000
```

When using npm scripts, pass arguments after `--`:

```bash
npm run start -- --network nile swap TRX USDT 1000000
```

### `No wallet configured`

Set exactly one wallet source:

- `AGENT_WALLET_PRIVATE_KEY`
- `AGENT_WALLET_MNEMONIC`
- `AGENT_WALLET_PASSWORD`

Or provide the equivalent root-level flag for that invocation.

### `Swap failed`

Common causes:

- wallet not configured
- unsupported token symbol
- insufficient balance
- RPC / router API failure
- stale or invalid route parameters

Use `swap:quote` first and then retry with `--yes` only after the quote looks correct.

## Security Considerations

- Treat `AGENT_WALLET_PRIVATE_KEY`, `AGENT_WALLET_MNEMONIC`, and `AGENT_WALLET_PASSWORD` as secrets.
- Prefer environment variables over command-line wallet flags when possible, because shell history and process lists may expose secrets.
- Use a dedicated wallet for automation instead of a primary treasury wallet.
- Run `--dry-run` before high-value writes.
- Verify token addresses carefully when not using built-in symbols.
- Do not treat quotes as guaranteed execution results in volatile markets.

## Development

```bash
npm install
npm run build
npm test
npm run lint
```

Run from source:

```bash
npm run dev -- price TRX
```

## License

MIT
