<script>
  import '@skeletonlabs/skeleton/themes/theme-gold-nouveau.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
  import { getLocalStorage } from '@svelte-on-solana/wallet-adapter-core';
  import AnchorConnectionProvider from '$lib/components/AnchorConnectionProvider.svelte';
  import { WalletProvider, WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
	import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
  import idl from '../../../target/idl/solana_anchor_sveltekit_skeleton_starter.json';
  import { browser } from '$app/environment';
	import NotificationList from '$lib/components/NotificationList.svelte';


	const localStorageKey = 'walletAdapter';
  // const endpoint = WalletAdapterNetwork.Devnet;
  // const network = clusterApiUrl(endpoint);

	const network = 'http://localhost:8899';

	let wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  $: autoConnect = browser && Boolean(getLocalStorage('autoconnect', false))

</script>


<!-- WalletProvider & ConnectionProvider -->
<WalletProvider {localStorageKey} {wallets} {autoConnect} />
<AnchorConnectionProvider {network} {idl} />

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/"><strong class="text-xl uppercase">Solana + Sveltekit</strong></a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a class="btn btn-sm btn-ghost-surface" href="/basics" >Basics</a>
				<a class="btn btn-sm btn-ghost-surface" href="https://twitter.com/SkeletonUI" target="_blank" rel="noreferrer">Twitter</a>
				<a class="btn btn-sm btn-ghost-surface" href="https://github.com/skeletonlabs/skeleton" target="_blank" rel="noreferrer">GitHub</a>
        <WalletMultiButton maxNumberOfWallets={5} />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
  <NotificationList />
</AppShell>
