import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { connection, counterPda, program, wallet } from "./config";

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  const me = wallet.publicKey;
  switch (cmd) {
    case "status": {
      const bal = await connection.getBalance(me);
      console.log(`Wallet:  ${me.toBase58()}\nBalance: ${bal / LAMPORTS_PER_SOL} SOL\nProgram: ${program.programId.toBase58()}`);
      const c = await program.account.counter.fetchNullable(counterPda(me));
      console.log(c ? `Counter: ${c.count.toString()} (PDA ${counterPda(me).toBase58()})` : "Counter: not initialized yet");
      break;
    }
    case "airdrop": {
      const sig = await connection.requestAirdrop(me, Number(arg ?? 1) * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      console.log(`Airdropped ${arg ?? 1} SOL: ${sig}`);
      break;
    }
    case "init": {
      const sig = await program.methods.initialize().rpc();
      console.log(`Initialized counter: ${sig}`);
      break;
    }
    case "increment": {
      const owner = arg ? new PublicKey(arg) : me;
      const sig = await program.methods.increment().accountsPartial({ counter: counterPda(owner) }).rpc();
      const c = await program.account.counter.fetch(counterPda(owner));
      console.log(`Incremented to ${c.count.toString()}: ${sig}`);
      break;
    }
    default:
      console.log("Usage: npm run cli -- <status | airdrop [sol] | init | increment [owner-wallet]>");
  }
}

main().catch((e) => {
  const code = e?.error?.errorCode?.code;
  console.error(code ? `Error: ${code} - ${e.error.errorMessage}` : e);
  process.exit(1);
});
