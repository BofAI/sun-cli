# sun-cli

CLI for **SUN.IO / SUNSWAP** on TRON — built for humans and AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Swap** tokens via SunSwap Universal Router (V2/V3/V4 auto-routing)
- **Liquidity** management for V2, V3, and V4 pools (mint, increase, decrease, collect)
- **SunPump** meme token trading (buy, sell, quote, info)
- **Portfolio** — wallet balances, positions, farming rewards
- **Analytics** — token/pool discovery, protocol stats, transaction history
- **Generic contract calls** — read and send to any TRON contract
- **Multi-format output** — rich tables (human), compact JSON (agent), TSV (shell pipelines)
- **Agent-friendly** — `--json`, `--fields`, `--yes`, `--dry-run` for AI-agent integration

## Installation

```bash
npm install @bankofai/sun-cli

# Or from source
git clone <repo-url> && cd sun-cli
npm install
npm run build
npm link   # makes `sun` available globally
```

Requires **Node.js 20+**.

## Quick Start

```bash
# Check a token price
sun price TRX

# List top APY pools
sun pool top-apy --page-size 5

# Swap tokens (interactive confirmation)
sun swap <tokenIn> <tokenOut> 1000000 --slippage 0.005

# Same swap, agent mode (compact JSON, no prompts)
sun --json --yes swap <tokenIn> <tokenOut> 1000000
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `TRON_PRIVATE_KEY` | Hex private key for signing transactions | For write ops |
| `TRON_MNEMONIC` | BIP-39 mnemonic (alternative to private key) | For write ops |
| `TRON_ACCOUNT_INDEX` | HD derivation index (default: `0`) | No |
| `AGENT_WALLET_PASSWORD` | Enable agent-wallet encrypted mode | No |
| `AGENT_WALLET_DIR` | Agent-wallet keystore directory | No |
| `TRON_NETWORK` | Network: `mainnet`, `nile`, `shasta` (default: `mainnet`) | No |
| `TRONGRID_API_KEY` | TronGrid API key for higher rate limits | No |
| `TRON_RPC_URL` | Custom RPC endpoint | No |

**Wallet priority:** Agent Wallet > Local Wallet (private key / mnemonic). Read-only commands work without any wallet configured.

Create a `.env` file in the project root:

```env
TRON_NETWORK=mainnet
TRONGRID_API_KEY=your-api-key
TRON_PRIVATE_KEY=your-private-key
```

## Global Flags

| Flag | Description | Example |
|---|---|---|
| `--output <format>` | Output format: `table`, `json`, `tsv` | `--output tsv` |
| `--json` | Shorthand for `--output json` | `sun --json price TRX` |
| `--fields <list>` | Comma-separated fields to include | `--fields symbol,priceInUsd` |
| `--network <name>` | Target network | `--network nile` |
| `-y, --yes` | Skip confirmation prompts | `sun --yes swap ...` |
| `--dry-run` | Show what would execute, without running | `sun --dry-run swap ...` |

## Token Symbols

Most commands accept token symbols in addition to addresses. Supported symbols (mainnet):

| Symbol | Address | Decimals |
|--------|---------|----------|
| TRX | T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb | 6 |
| WTRX | TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR | 6 |
| USDT | TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t | 6 |
| USDC | TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8 | 6 |
| USDD | TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn | 18 |
| SUN | TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S | 18 |
| JST | TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9 | 18 |
| BTT | TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4 | 18 |
| WIN | TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7 | 6 |

Example:

```bash
# These are equivalent:
sun swap TRX USDT 1000000000
sun swap T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t 1000000000
```

## Commands

### Wallet

```bash
sun wallet address                           # Show active wallet address
sun wallet balances --tokens TRX,<TRC20>     # TRX and TRC20 balances
sun wallet list                              # List wallets (agent-wallet mode)
sun wallet select <name>                     # Switch wallet (agent-wallet mode)
```

### Token Prices

```bash
sun price TRX
sun price --symbol USDT,SUN
sun price --address TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

### Token & Pool Discovery

```bash
sun token list --protocol V3
sun token search USDT
sun pool list --token <address>
sun pool search "USDT TRX"
sun pool top-apy --page-size 10
sun pool hooks --pool <address>
sun pool vol-history <poolAddress> --start 2026-01-01
sun pool liq-history <poolAddress> --start 2026-01-01
```

### Swaps

```bash
# High-level swap (auto-routes via Universal Router)
sun swap <tokenIn> <tokenOut> <amount> --slippage 0.005

# Quote only (read-only, no wallet needed)
sun swap:quote <tokenIn> <tokenOut> <amount>
sun swap:quote <tokenIn> <tokenOut> <amount> --all    # Show all routes

# Low-level commands (for advanced users)
sun swap:quote-raw --router <addr> --args '[...]'     # Quote via contract call
sun swap:exact-input --router <addr> --args '[...]' --value 1000000
```

### Liquidity — V2

```bash
# Add liquidity using token symbols (TRX, USDT, SUN, etc.)
sun liquidity v2:add --token-a TRX --token-b USDT --amount-a 1000000000 --amount-b 290000000

# Single-token input: auto-calculate other amount based on pool ratio
sun liquidity v2:add --token-a TRX --token-b USDT --amount-a 1000000000
sun liquidity v2:add --token-a TRX --token-b USDT --amount-b 290000000

# Remove liquidity
sun liquidity v2:remove --token-a TRX --token-b USDT --liquidity 500000
```

### Liquidity — V3

```bash
# Mint position (PM auto-detected, tick/fee auto-computed, single-token input)
sun liquidity v3:mint --token0 TRX --token1 USDT --amount0 1000000

# With explicit tick range and fee
sun liquidity v3:mint --token0 TRX --token1 USDT --fee 3000 \
                      --tick-lower -887220 --tick-upper 887220 --amount0 1000000

# Increase/Decrease/Collect
sun liquidity v3:increase --token-id 123 --amount0 500000
sun liquidity v3:decrease --token-id 123 --liquidity 1000
sun liquidity v3:collect --token-id 123
```

### Liquidity — V4

```bash
# Mint position (tick range auto-computed, single-token input, supports --create-pool)
sun liquidity v4:mint --token0 TRX --token1 USDT --amount0 1000000
sun liquidity v4:mint --token0 TRX --token1 USDT --amount0 1000000 --create-pool  # Create pool if needed

# With explicit tick range
sun liquidity v4:mint --token0 TRX --token1 USDT --fee 500 \
                      --tick-lower -100 --tick-upper 100 --amount0 1000000

# Increase/Decrease/Collect
sun liquidity v4:increase --token-id 123 --token0 TRX --token1 USDT --amount0 500000
sun liquidity v4:decrease --token-id 123 --liquidity 1000 --token0 TRX --token1 USDT
sun liquidity v4:collect --token-id 123
sun liquidity v4:info --pm <addr> --token-id 123
```

### SunPump (Meme Token Trading)

```bash
# Buy / Sell
sun sunpump buy  <tokenAddress> --trx-amount 1000000
sun sunpump sell <tokenAddress> --token-amount 5000000

# Quote (read-only)
sun sunpump quote:buy  <tokenAddress> --trx-amount 1000000
sun sunpump quote:sell <tokenAddress> --token-amount 5000000

# Token info
sun sunpump info  <tokenAddress>     # Full info (state, price, reserves)
sun sunpump state <tokenAddress>     # State: NOT_EXIST / TRADING / LAUNCHED
sun sunpump price <tokenAddress>     # Current price
```

### Protocol Analytics

```bash
sun protocol info
sun protocol vol-history   --start 2026-01-01 --end 2026-03-01
sun protocol users-history
sun protocol tx-history
sun protocol pools-history
sun protocol liq-history
```

### Farming

```bash
sun farm list
sun farm tx --owner <address> --type stake
sun farm positions --owner <address>
```

### Positions & Pairs

```bash
sun position list --owner <address>
sun position tick <poolAddress>
sun pair info --token <address>
```

### Transactions

```bash
sun tx scan --type swap --token <address> --start 2026-01-01
```

### Generic Contract Calls

```bash
# Read (view/pure function)
sun contract read <contractAddress> balanceOf --args '["TAddress"]'

# Send (state-changing, requires wallet)
sun contract send <contractAddress> transfer --args '["TRecipient", "1000000"]' --value 0
```

## Output Formats

### Table (default)

Human-readable tables with colors. Best for interactive terminal use.

```bash
sun pool top-apy --page-size 3
```

### JSON (`--json` or `--output json`)

Compact single-line JSON to stdout. Designed for AI agents and programmatic consumption.

```bash
sun --json price TRX --fields symbol,priceInUsd
# → {"symbol":"TRX","priceInUsd":"0.27"}
```

Errors produce structured JSON with machine-readable codes:

```json
{"error":"Wallet required","code":"WALLET_NOT_CONFIGURED","detail":"Set TRON_PRIVATE_KEY"}
```

Error codes: `WALLET_NOT_CONFIGURED`, `INVALID_PARAMS`, `TX_FAILED`, `NETWORK_ERROR`, `NOT_FOUND`, `UNKNOWN_ERROR`.

### TSV (`--output tsv`)

Tab-separated values to stdout. Ideal for shell pipelines with `awk`, `cut`, `sort`.

```bash
sun --output tsv pool top-apy --page-size 5 | sort -t$'\t' -k3 -nr
```

## AI Agent Integration

sun-cli is designed as a first-class tool for AI agents (Claude, GPT, Cursor, etc.).

### Recommended Agent Flags

```bash
sun --json --yes --fields <relevant-fields> <command>
```

- `--json` — structured output, no spinners or color
- `--yes` — skip confirmation prompts for write operations
- `--fields` — minimize token usage by requesting only needed fields
- `--dry-run` — preview write operations without executing

### Example Agent Workflow

```bash
# 1. Check balance
sun --json wallet balances --tokens TRX --fields balance

# 2. Get price
sun --json price USDT --fields priceInUsd

# 3. Get swap quote (read-only)
sun --json swap:quote TR7NHq... T9yD14... 1000000

# 4. Preview swap (dry-run)
sun --json --dry-run swap TR7NHq... T9yD14... 1000000

# 5. Execute swap
sun --json --yes swap TR7NHq... T9yD14... 1000000

# 6. Verify new balance
sun --json wallet balances --tokens TRX --fields balance
```

### Skill File

A `SKILL.md` file is included for agent frameworks that support skill-based tool discovery (e.g., Cursor, Claude Code). It teaches agents how to use sun-cli efficiently.

## Command Reference

| Command | Type | Description |
|---|---|---|
| `wallet address` | read | Show active wallet address |
| `wallet balances` | read | TRX and TRC20 token balances |
| `wallet list` | read | List available wallets |
| `wallet select <name>` | write | Switch active wallet |
| `price` | read | Token price lookup |
| `swap` | write | Auto-routed token swap |
| `swap:quote` | read | Get swap quote (high-level, auto-routing) |
| `swap:quote-raw` | read | Quote via contract call (low-level) |
| `swap:exact-input` | write | Low-level exact input swap |
| `token list` | read | List tokens by protocol |
| `token search <query>` | read | Search tokens by name/symbol |
| `pool list` | read | List pools |
| `pool search <query>` | read | Search pools |
| `pool top-apy` | read | Top pools by APY |
| `pool hooks` | read | Pool hooks info |
| `pool vol-history` | read | Pool volume history |
| `pool liq-history` | read | Pool liquidity history |
| `liquidity v2:add` | write | Add V2 liquidity |
| `liquidity v2:remove` | write | Remove V2 liquidity |
| `liquidity v3:mint` | write | Mint V3 position |
| `liquidity v3:increase` | write | Increase V3 liquidity |
| `liquidity v3:decrease` | write | Decrease V3 liquidity |
| `liquidity v3:collect` | write | Collect V3 fees |
| `liquidity v4:mint` | write | Mint V4 position |
| `liquidity v4:increase` | write | Increase V4 liquidity |
| `liquidity v4:decrease` | write | Decrease V4 liquidity |
| `liquidity v4:collect` | write | Collect V4 fees |
| `liquidity v4:info` | read | V4 position details |
| `sunpump buy` | write | Buy SunPump meme token |
| `sunpump sell` | write | Sell SunPump meme token |
| `sunpump quote:buy` | read | Quote SunPump buy |
| `sunpump quote:sell` | read | Quote SunPump sell |
| `sunpump info` | read | SunPump token info |
| `sunpump state` | read | SunPump token state |
| `sunpump price` | read | SunPump token price |
| `protocol info` | read | Protocol overview |
| `protocol vol-history` | read | Protocol volume history |
| `protocol users-history` | read | Protocol user count history |
| `protocol tx-history` | read | Protocol transaction history |
| `protocol pools-history` | read | Protocol pool count history |
| `protocol liq-history` | read | Protocol liquidity history |
| `tx scan` | read | Scan transactions |
| `position list` | read | List user positions |
| `position tick` | read | Position tick data |
| `pair info` | read | Token pair info |
| `farm list` | read | List farming pools |
| `farm tx` | read | Farming transactions |
| `farm positions` | read | Farming positions |
| `contract read` | read | Call view/pure contract function |
| `contract send` | write | Send state-changing transaction |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- price TRX

# Build
npm run build

# Run tests
npm test

# Type check
npx tsc --noEmit
```

### Project Structure

```
sun-cli/
├── bin/sun                    # CLI entry point
├── src/
│   ├── bin.ts                 # Commander.js program setup & global flags
│   ├── commands/              # Command registrations (one file per group)
│   │   ├── wallet.ts
│   │   ├── swap.ts
│   │   ├── liquidity.ts       # V2, V3, V4
│   │   ├── sunpump.ts
│   │   ├── price.ts
│   │   ├── token.ts
│   │   ├── pool.ts
│   │   ├── protocol.ts
│   │   ├── position.ts
│   │   ├── pair.ts
│   │   ├── farm.ts
│   │   ├── tx.ts
│   │   └── contract.ts
│   └── lib/
│       ├── command.ts         # writeAction / readAction / readApiAction helpers
│       ├── output.ts          # Multi-format output (table / json / tsv)
│       ├── confirm.ts         # Interactive confirmation with --yes bypass
│       ├── context.ts         # Network & env context
│       └── wallet.ts          # Wallet initialization (agent-wallet / local)
├── test/
│   ├── commands/
│   │   └── registration.test.ts
│   └── lib/
│       ├── output.test.ts
│       └── confirm.test.ts
├── SKILL.md                   # Agent skill descriptor
├── jest.config.js
├── tsconfig.json
└── package.json
```

### Architecture

sun-cli is a thin CLI layer on top of two packages:

- **`@bankofai/sun-kit`** — Core SDK. `SunAPI` for read-only HTTP queries, `SunKit` for wallet-dependent on-chain operations.
- **`@bankofai/agent-wallet`** — Encrypted keystore management for AI agent use cases.

Command handlers use three helper functions to eliminate boilerplate:

| Helper | Use Case | Wallet Required |
|---|---|---|
| `writeAction` | State-changing transactions | Yes |
| `readAction` | On-chain reads via SunKit | Yes |
| `readApiAction` | HTTP API queries via SunAPI | No |

## License

[MIT](LICENSE)
