<script>
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
  import { walletStore, getLocalStorage, setLocalStorage } from '@svelte-on-solana/wallet-adapter-core';
  import AnchorConnectionProvider from '$lib/components/AnchorConnectionProvider.svelte';
  import { WalletProvider, WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
	import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
  import { clusterApiUrl } from '@solana/web3.js';
  import idl from '../../../target/idl/solana_anchor_sveltekit_skeleton_starter.json';
	import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
  import { workspaceStore } from '$lib/stores/workspace-store';
  import { browser } from '$app/environment';


	const localStorageKey = 'walletAdapter';
  // const endpoint = WalletAdapterNetwork.Devnet;
  // const network = clusterApiUrl(endpoint);

	const network = 'http://localhost:8899';

	let wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

	// Q: Needed?
	let checked = Boolean(getLocalStorage('autoconnect', false));
	$: autoConnect = browser && setLocalStorage('autoconnect', checked);

</script>


<!-- WalletProvider & ConnectionProvider -->
<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider {network} {idl} />

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Skeleton</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a class="btn btn-sm btn-ghost-surface" href="https://discord.gg/EXqV7W8MtY" target="_blank" rel="noreferrer">Discord</a>
				<a class="btn btn-sm btn-ghost-surface" href="https://twitter.com/SkeletonUI" target="_blank" rel="noreferrer">Twitter</a>
				<a class="btn btn-sm btn-ghost-surface" href="https://github.com/skeletonlabs/skeleton" target="_blank" rel="noreferrer">GitHub</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
