<script lang="ts">
  // IMPORTANT: Attempting to just copy the wallet-adapter-ui package
  // so I can make customize.
  // REF: https://github.com/svelte-on-solana/wallet-adapter/tree/master/packages/ui
	import type { Adapter } from '@solana/wallet-adapter-base';
	import { initialize } from '@svelte-on-solana/wallet-adapter-core';
	import type { WalletError } from '@solana/wallet-adapter-base';

	export let localStorageKey: string,
		wallets: Adapter[],
		autoConnect = false,
		onError = (error: WalletError) => console.error(error);

	$: wallets && initialize({ wallets, autoConnect, localStorageKey, onError });
</script>

<svelte:head>
	<script>
		window.global = window;
	</script>
</svelte:head>
