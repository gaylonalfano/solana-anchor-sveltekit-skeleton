<script lang="ts">
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { workspaceStore } from '$lib/stores/workspace-store';
	import { LAMPORTS_PER_SOL, type TransactionSignature, type PublicKey } from '@solana/web3.js';
  import { goto } from '$app/navigation';
	import { balanceStore } from '$lib/stores/balance-store';
	import { notificationStore } from '$lib/stores/notification-store';
	import { toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

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

			// Use Skeleton's Toast component & toastStore.trigger(t: ToastSettings)
			toastStore.trigger({
				message: 'Airdrop requested successfully!',
				autohide: true,
				timeout: 3000,
				action: {
					label: `${signature.slice(0, 8)}...`,
					response: () => open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, "_blank")
				}
			});

			// notificationStore.add({ type: 'success', message: 'Airdrop successful!', txid: signature });
			balanceStore.getUserSOLBalance(publicKey, connection);

		} catch (error: any) {

			toastStore.trigger({
				message: 'Airdrop request failed!',
				autohide: true,
				timeout: 3000,
				classes: 'bg-warning-500 text-on-warning-token'
			});

			notificationStore.add({
				type: 'error',
				message: `Airdrop failed!`,
				description: error?.message,
				txid: signature
			});
			console.log('error', `Airdrop failed! ${error?.message}`, signature);
		}
	}

	$: console.log($toastStore);
</script>

<div>
	<button class="btn btn-filled-primary btn-base animate-pulse" on:click={onClick}>
		<span>Airdrop 1</span>
		<span>◎</span>
	</button>
</div>
