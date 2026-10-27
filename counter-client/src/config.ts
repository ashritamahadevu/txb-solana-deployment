import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import os from "os";
import path from "path";
import idl from "./idl/counter.json";
import type { Counter } from "./idl/counter";

export const RPC_URL = process.env.RPC_URL ?? "https://api.devnet.solana.com";
const walletPath = process.env.WALLET ?? path.join(os.homedir(), ".config/solana/id.json");

export const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf8"))));
export const connection = new Connection(RPC_URL, "confirmed");
export const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), { commitment: "confirmed" });
export const program = new anchor.Program<Counter>(idl as Counter, provider);

export const counterPda = (owner: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("counter"), owner.toBuffer()], program.programId)[0];
