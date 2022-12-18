<script lang="ts">
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { workspaceStore } from '$lib/stores/workspace-store';
	import { LAMPORTS_PER_SOL, type TransactionSignature, type PublicKey } from '@solana/web3.js';
	import { balanceStore } from '$lib/stores/balance-store';
	import { notificationStore } from '$lib/stores/notification-store';

	async function onClick() {
		if (!$walletStore.connected) {
			console.log('error', 'Wallet not connected!');
			notificationStore.add({
				type: 'error',
				message: 'error',
				description: 'Wallet not connected!'
			});
			return;
		}
		let signature: TransactionSignature = '';
		const { connection } = $workspaceStore;
		const publicKey = $walletStore.publicKey as PublicKey;

		try {
			signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);

			const latestBlockhash = await connection.getLatestBlockhash();
			const confirmedTx = await connection.confirmTransaction({
				blockhash: latestBlockhash.blockhash,
				lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
				signature: signature
			});
			console.log('confirmedTx: ', confirmedTx);

			notificationStore.add({ type: 'success', message: 'Airdrop successful!', txid: signature });
			balanceStore.getUserSOLBalance(publicKey, connection);
		} catch (error: any) {
			notificationStore.add({
				type: 'error',
				message: `Airdrop failed!`,
				description: error?.message,
				txid: signature
			});
			console.log('error', `Airdrop failed! ${error?.message}`, signature);
		}
	}
</script>

<div>
  <button class="btn btn-filled-primary btn-base animate-pulse" on:click={onClick}>
    <span>Airdrop 1</span>
    <span>◎</span>
  </button>
</div>
