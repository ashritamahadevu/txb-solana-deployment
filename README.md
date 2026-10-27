# Solana Anchor counter

Anchor **0.31.1** counter. Each wallet owns one counter PDA (`seeds = ["counter", authority]`). `initialize` sets `count` to 0. `increment` adds 1 and only that authority can call it.

Program ID (do not change): `FEdxfZUSTb9eUd74A4WiYbPkGjYxkdwGhSgbf1xWb9iB`

It is set in `counter/programs/counter/src/lib.rs`, `counter/Anchor.toml`, and `counter-client/src/idl/`.

| Path | What it is |
| --- | --- |
| `counter/` | Anchor program, TypeScript tests, `Anchor.toml` |
| `counter-client/` | Devnet CLI (`src/cli.ts`, `src/config.ts`, IDL) |

Do not commit wallet keypairs, `.so` binaries, `target/`, `node_modules/`, `test-ledger`, or `.anchor` logs.

## Local test

You need Rust, the Solana CLI, Anchor CLI 0.31.1, and Yarn. `Anchor.toml` sets `package_manager = "yarn"` and `cluster = "localnet"`. The provider wallet is `~/.config/solana/id.json` (created locally by `solana-keygen`; it is not in this repo).

```bash
cd counter
yarn install
anchor test
```

`anchor test` builds the program, starts a local validator, deploys `FEdxfZUSTb9eUd74A4WiYbPkGjYxkdwGhSgbf1xWb9iB`, and runs `tests/counter.ts`: initialize to 0, increment to 1, increment to 2, and reject an increment against another wallet's counter.

### Node 22

Use **Node.js 22** for `anchor test` if the test runner fails before any assertion. The script is `ts-mocha` with Anchor 0.31.1. Node 23 and newer often fail while loading those TypeScript tests (ts-node / mocha ESM errors). Node 22.23 is a known-good version:

```bash
nvm install 22
nvm use 22
cd counter
yarn install
anchor test
```

### Build tools version

Anchor 0.31.1 matches Solana platform-tools **v1.47** (Solana CLI 2.1). A newer `cargo-build-sbf` on `PATH` defaults to a later tools release. That build either fails or emits an ELF the local validator cannot load.

If `anchor build` or `anchor test` dies inside `cargo-build-sbf`, pin the tools version and skip a second build:

```bash
cd counter
cargo build-sbf --manifest-path programs/counter/Cargo.toml --sbf-out-dir target/deploy --tools-version v1.47
anchor test --skip-build
```

`anchor build -- --tools-version v1.47` is the same pin when this Anchor CLI forwards arguments after `--` to `cargo-build-sbf`.

## CLI

`counter-client` signs with `WALLET` (default `~/.config/solana/id.json`) and talks to `RPC_URL` (default `https://api.devnet.solana.com`). Point `RPC_URL` at `http://127.0.0.1:8899` to use a local validator instead. Airdrops work on localnet and devnet only.

```bash
cd counter-client
npm install
npm run cli -- status
npm run cli -- airdrop 1
npm run cli -- init
npm run cli -- increment
npm run cli -- increment <owner-wallet>
```

- `status` prints the wallet, SOL balance, program id, and this wallet's counter, or `not initialized yet`.
- `airdrop [sol]` requests an airdrop (default 1 SOL).
- `init` creates this wallet's counter at 0.
- `increment` increments your counter. An optional owner pubkey targets that wallet's PDA. The program returns `Unauthorized` unless you are that authority.
