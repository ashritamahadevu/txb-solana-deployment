import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { assert } from "chai";

describe("counter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.counter as Program<Counter>;
  const me = provider.wallet.publicKey;
  const pda = (k: anchor.web3.PublicKey) =>
    anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("counter"), k.toBuffer()], program.programId)[0];

  it("initializes to 0", async () => {
    await program.methods.initialize().rpc();
    const c = await program.account.counter.fetch(pda(me));
    assert.equal(c.count.toNumber(), 0);
    assert.ok(c.authority.equals(me));
  });

  it("increments to 1", async () => {
    await program.methods.increment().rpc();
    assert.equal((await program.account.counter.fetch(pda(me))).count.toNumber(), 1);
  });

  it("increments again to 2", async () => {
    await program.methods.increment().rpc();
    assert.equal((await program.account.counter.fetch(pda(me))).count.toNumber(), 2);
  });

  it("rejects incrementing someone else's counter", async () => {
    const other = anchor.web3.Keypair.generate();
    try {
      await program.methods.increment().accountsPartial({ counter: pda(other.publicKey) }).rpc();
      assert.fail("should have failed");
    } catch (e: any) {
      assert.match(String(e), /ConstraintSeeds|AccountNotInitialized/);
    }
  });
});
