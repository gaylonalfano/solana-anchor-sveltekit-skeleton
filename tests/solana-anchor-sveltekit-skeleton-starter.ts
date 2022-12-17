import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaAnchorSveltekitSkeletonStarter } from "../target/types/solana_anchor_sveltekit_skeleton_starter";

describe("solana-anchor-sveltekit-skeleton-starter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaAnchorSveltekitSkeletonStarter as Program<SolanaAnchorSveltekitSkeletonStarter>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
