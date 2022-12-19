<script lang="ts">
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { workspaceStore } from '$lib/stores/workspace-store';
	import { LAMPORTS_PER_SOL, type TransactionSignature, type PublicKey } from '@solana/web3.js';
	import { balanceStore } from '$lib/stores/balance-store';
	import { toastStore } from '@skeletonlabs/skeleton';

	async function handleRequestAirdrop() {
		if (!$walletStore.connected) {
			console.log('error', 'Wallet not connected!');

			toastStore.trigger({
				message: 'Wallet not connected!',
				autohide: true,
				timeout: 3000,
				classes: 'bg-warning-500 text-on-warning-token'
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
					response: () =>
						open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank')
				}
			});

			balanceStore.getUserSOLBalance(publicKey, connection);
		} catch (error: any) {
			toastStore.trigger({
				message: 'Airdrop request failed!',
				autohide: true,
				timeout: 3000,
				classes: 'bg-warning-500 text-on-warning-token'
			});

			console.log('error', `Airdrop failed! ${error?.message}`, signature);
		}
	}

	$: console.log($toastStore);
</script>

<div>
	<button
		class="btn btn-filled-primary btn-lg animate-pulse"
		on:click={handleRequestAirdrop}
		disabled={!$walletStore.publicKey}
	>
		<span>Airdrop 1</span>
		<span>◎</span>
	</button>
</div>
