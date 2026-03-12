# sun-cli

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Network](https://img.shields.io/badge/Network-TRON-red)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

CLI for SUN.IO / SUNSWAP on TRON, designed for both human operators and AI agents.

This project wraps `@bankofai/sun-kit` into a terminal-first interface for quoting swaps, sending swaps, managing liquidity, reading SUN.IO analytics, scanning protocol activity, and calling arbitrary TRON contracts. It supports both interactive usage and machine-friendly output modes.

## Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Global Flags](#global-flags)
- [Supported Token Symbols](#supported-token-symbols)
- [Command Reference](#command-reference)
  - [Wallet](#wallet)
  - [Price](#price)
  - [Token](#token)
  - [Pool](#pool)
  - [Swap](#swap)
  - [Liquidity](#liquidity)
  - [Protocol](#protocol)
  - [Farm](#farm)
  - [Position](#position)
  - [Pair](#pair)
  - [Transaction Scan](#transaction-scan)
  - [Contract](#contract)
- [Output Modes](#output-modes)
- [Agent Usage Notes](#agent-usage-notes)
- [Development](#development)
- [Security Notes](#security-notes)
- [License](#license)

## Overview

`sun-cli` exposes SUN.IO / SUNSWAP workflows as shell commands.

Primary use cases:

- Query token prices, pools, pairs, protocol metrics, and farm data from the SUN.IO API.
- Inspect wallet balances and user positions.
- Quote and execute swaps through the SunSwap routing stack.
- Add, remove, increase, decrease, and collect liquidity across V2, V3, and V4.
- Read or send arbitrary TRON contract calls when the higher-level command surface is not enough.
- Feed structured output to AI agents, shell pipelines, and automation systems.

## Quick Start

1. Install:

```bash
npm install -g @bankofai/sun-cli
```

2. Configure one wallet source if you need write operations:

```bash
export TRON_PRIVATE_KEY=your_private_key
# or
export TRON_MNEMONIC="word1 word2 word3 ..."
export TRON_MNEMONIC_ACCOUNT_INDEX=0
# or
export AGENT_WALLET_PASSWORD=your_agent_wallet_password
```

3. Optionally configure runtime settings:

```bash
export TRON_NETWORK=mainnet
export TRONGRID_API_KEY=your_trongrid_api_key
export TRON_RPC_URL=https://your-tron-rpc.example
```

4. Run a command:

```bash
sun price TRX
sun pool top-apy --page-size 5
sun wallet address
sun -p your_agent_wallet_password wallet address
```

Read-only commands can run without wallet credentials. Write operations such as swaps, liquidity updates, and `contract send` require wallet configuration.

## Prerequisites

- Node.js 20+
- Access to the TRON network
- A configured wallet source for write operations

## Installation

### Install From npm

```bash
npm install -g @bankofai/sun-cli
```

### Install From Source

```bash
git clone <repo-url>
cd sun-cli
npm install
npm run build
npm link
```

After `npm link`, the `sun` command is available globally.

## Configuration

### Wallet Configuration

`sun-cli` uses `agent-wallet` internally. Configure exactly one wallet source:

- `TRON_PRIVATE_KEY`
- `TRON_MNEMONIC` with optional `TRON_MNEMONIC_ACCOUNT_INDEX`
- `AGENT_WALLET_PASSWORD`

If more than one mode is set at the same time, the CLI throws an error.

You can provide wallet credentials in two ways:

- Environment variables
- Root-level command flags such as `-k`, `-m`, `-i`, `-p`, and `-d`

When both are present, command flags override environment variables for that invocation only.

### Environment Variables

| Variable                      | Description                                    | Required      |
| ----------------------------- | ---------------------------------------------- | ------------- |
| `TRON_PRIVATE_KEY`            | Private key used by agent-wallet               | For write ops |
| `TRON_MNEMONIC`               | Mnemonic used by agent-wallet                  | For write ops |
| `TRON_MNEMONIC_ACCOUNT_INDEX` | Mnemonic derivation index                      | No            |
| `AGENT_WALLET_PASSWORD`       | Password for agent-wallet managed wallet       | For write ops |
| `AGENT_WALLET_DIR`            | Wallet storage directory for agent-wallet      | No            |
| `TRON_NETWORK`                | Target network: `mainnet`, `nile`, `shasta`    | No            |
| `TRONGRID_API_KEY`            | TronGrid API key                               | No            |
| `TRON_GRID_API_KEY`           | Alias of `TRONGRID_API_KEY` used by some paths | No            |
| `TRON_RPC_URL`                | Custom TRON RPC endpoint                       | No            |

### Example `.env`

```env
TRON_NETWORK=mainnet
TRONGRID_API_KEY=your_api_key
TRON_PRIVATE_KEY=your_private_key
```

## Global Flags

All commands inherit the following root flags:

| Flag                                     | Description                                                |
| ---------------------------------------- | ---------------------------------------------------------- |
| `--output <format>`                      | Output format: `table`, `json`, `tsv`                      |
| `--json`                                 | Shortcut for JSON output                                   |
| `--fields <list>`                        | Comma-separated output field filter                        |
| `--network <network>`                    | Override `TRON_NETWORK`                                    |
| `-k, --private-key <key>`                | Override `TRON_PRIVATE_KEY` for this invocation            |
| `-m, --mnemonic <phrase>`                | Override `TRON_MNEMONIC` for this invocation               |
| `-i, --mnemonic-account-index <index>`   | Override `TRON_MNEMONIC_ACCOUNT_INDEX` for this invocation |
| `-p, --agent-wallet-password <password>` | Override `AGENT_WALLET_PASSWORD` for this invocation       |
| `-d, --agent-wallet-dir <dir>`           | Override `AGENT_WALLET_DIR` for this invocation            |
| `-y, --yes`                              | Skip confirmation prompts                                  |
| `--dry-run`                              | Print execution intent without sending writes              |

Examples:

```bash
sun --json price TRX
sun --output tsv pool top-apy --page-size 10
sun --fields address,network wallet address
sun -p your_agent_wallet_password wallet address
sun -k your_private_key swap TRX USDT 1000000
sun --yes swap TRX USDT 1000000
sun --dry-run contract send TContract transfer --args '["TRecipient","1000000"]'
```

## Supported Token Symbols

Many commands accept token symbols in addition to TRON addresses. Built-in symbols include:

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

## Command Reference

### Wallet

Inspect the currently configured wallet and fetch balances.

```bash
sun wallet address
sun wallet balances
sun wallet balances --owner TYourAddress --tokens TRX,TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

### Price

Fetch token prices from SUN.IO.

```bash
sun price TRX
sun price USDT
sun price --address TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

### Token

List or search token metadata.

```bash
sun token list --protocol V3
sun token list --address TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
sun token search USDT
```

### Pool

Discover pools and inspect pool-level analytics.

```bash
sun pool list --token TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
sun pool search "TRX USDT"
sun pool top-apy --page-size 10
sun pool hooks --pool <poolAddress>
sun pool vol-history <poolAddress> --start 2026-01-01 --end 2026-03-01
sun pool liq-history <poolAddress> --start 2026-01-01 --end 2026-03-01
```

### Swap

High-level swap commands plus lower-level quoting and exact-input execution.

```bash
sun swap TRX USDT 1000000 --slippage 0.005
sun swap:quote TRX USDT 1000000
sun swap:quote TRX USDT 1000000 --all
sun swap:quote-raw --router <routerAddress> --args '[...]'
sun swap:exact-input --router <routerAddress> --args '[...]' --value 1000000
```

Notes:

- `swap` is the preferred command for standard token swaps.
- `swap:quote` is read-only and can run without a wallet.
- `swap:quote-raw` and `swap:exact-input` are advanced commands for direct router interaction.

### Liquidity

Manage liquidity across V2, V3, and V4.

#### V2

```bash
sun liquidity v2:add --token-a TRX --token-b USDT --amount-a 1000000 --amount-b 290000
sun liquidity v2:add --token-a TRX --token-b USDT --amount-a 1000000
sun liquidity v2:remove --token-a TRX --token-b USDT --liquidity 500000
```

#### V3

```bash
sun liquidity v3:mint --token0 TRX --token1 USDT --amount0 1000000
sun liquidity v3:mint --token0 TRX --token1 USDT --fee 3000 --tick-lower -887220 --tick-upper 887220 --amount0 1000000
sun liquidity v3:increase --token-id 123 --amount0 500000
sun liquidity v3:decrease --token-id 123 --liquidity 1000
sun liquidity v3:collect --token-id 123
```

#### V4

```bash
sun liquidity v4:mint --token0 TRX --token1 USDT --amount0 1000000
sun liquidity v4:mint --token0 TRX --token1 USDT --amount0 1000000 --create-pool
sun liquidity v4:increase --token-id 123 --token0 TRX --token1 USDT --amount0 500000
sun liquidity v4:decrease --token-id 123 --liquidity 1000 --token0 TRX --token1 USDT
sun liquidity v4:collect --token-id 123
sun liquidity v4:info --pm <positionManager> --token-id 123
```

### Protocol

Fetch protocol-level snapshots and historical metrics.

```bash
sun protocol info
sun protocol vol-history --start 2026-01-01 --end 2026-03-01
sun protocol users-history --start 2026-01-01 --end 2026-03-01
sun protocol tx-history --start 2026-01-01 --end 2026-03-01
sun protocol pools-history --start 2026-01-01 --end 2026-03-01
sun protocol liq-history --start 2026-01-01 --end 2026-03-01
```

### Farm

Inspect farms, farm transactions, and user farm positions.

```bash
sun farm list
sun farm tx --owner TYourAddress --type stake
sun farm positions --owner TYourAddress
```

### Position

Inspect user liquidity positions and per-pool tick information.

```bash
sun position list --owner TYourAddress
sun position tick <poolAddress>
```

### Pair

Resolve pair information from a token.

```bash
sun pair info --token TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

### Transaction Scan

Scan transaction activity from SUN.IO.

```bash
sun tx scan --type swap --token TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t --start 2026-01-01 --end 2026-03-01
```

### Contract

Read or send arbitrary TRON contract calls.

```bash
sun contract read <contractAddress> balanceOf --args '["TYourAddress"]'
sun contract send <contractAddress> transfer --args '["TRecipient","1000000"]' --value 0
```

Use `contract send` when a higher-level command does not cover the operation you need.

## Output Modes

### Table

Default mode for human terminal usage.

```bash
sun pool top-apy --page-size 5
```

### JSON

Compact JSON to stdout, suitable for AI agents and scripts.

```bash
sun --json wallet address
sun --json swap:quote TRX USDT 1000000
```

### TSV

Tab-separated output for shell pipelines.

```bash
sun --output tsv pool top-apy --page-size 5
```

### Field Filtering

Restrict output to selected fields.

```bash
sun --json --fields address,network wallet address
sun --output tsv --fields symbol,priceInUsd price TRX
```

## Agent Usage Notes

`sun-cli` is usable from agents without wrapping another service layer.

Recommended flags for agent usage:

- `--json` for stable stdout
- `--fields` to minimize output size
- `--yes` to suppress confirmation prompts
- `--dry-run` when planning or simulating write actions

Example:

```bash
sun --json --yes swap TRX USDT 1000000 --slippage 0.005
```

## Development

```bash
npm install
npm run build
npm test
```

Run from source:

```bash
npm run dev -- price TRX
```

## Security Notes

- Treat `TRON_PRIVATE_KEY`, `TRON_MNEMONIC`, and `AGENT_WALLET_PASSWORD` as secrets.
- Prefer environment variables over command-line wallet flags when possible, because shell history and process lists may expose secrets.
- Prefer a dedicated wallet for automation instead of a primary treasury wallet.
- Use `--dry-run` before high-value state-changing operations.
- Review token addresses carefully when not using built-in symbols.
- Do not assume quoted output equals execution output in volatile markets.

## License

MIT
