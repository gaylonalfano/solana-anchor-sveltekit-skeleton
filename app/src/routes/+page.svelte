<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { workspaceStore } from '$lib/stores/workspace-store';
	import { balanceStore } from '$lib/stores/balance-store';
	import RequestAirdrop from '$lib/components/wallet/RequestAirdrop.svelte';
	import type { PublicKey } from '@solana/web3.js';
	import { GradientHeading } from '@skeletonlabs/skeleton';
  import PageShell from '$lib/components/ui/PageShell.svelte';

	$: $walletStore.connected &&
		balanceStore.getUserSOLBalance($walletStore.publicKey as PublicKey, $workspaceStore.connection);
</script>


<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center">
		<GradientHeading
			tag="h1"
			direction="bg-gradient-to-r"
			from="from-primary-500"
			to="to-accent-500">Solana+Anchor+Sveltekit+Skeleton</GradientHeading
		>
		<RequestAirdrop />

		{#if $walletStore?.connected}
			<p>SOL Balance: {($balanceStore.balance || 0).toLocaleString()}</p>
		{/if}

  </div>
</div>
