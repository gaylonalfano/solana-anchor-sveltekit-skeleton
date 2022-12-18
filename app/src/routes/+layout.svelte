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
	import { Toast } from '@skeletonlabs/skeleton';

	const localStorageKey = 'walletAdapter';
	// const endpoint = WalletAdapterNetwork.Devnet;
	// const network = clusterApiUrl(endpoint);

	const network = 'http://localhost:8899';

	let wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

	$: autoConnect = browser && Boolean(getLocalStorage('autoconnect', false));
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
				<a class="btn btn-sm btn-ghost-surface" href="/basics">Basics</a>
				<a
					class="btn btn-sm btn-ghost-surface"
					href="https://twitter.com/SkeletonUI"
					target="_blank"
					rel="noreferrer">Twitter</a
				>
				<a
					class="btn btn-sm btn-ghost-surface"
					href="https://github.com/skeletonlabs/skeleton"
					target="_blank"
					rel="noreferrer">GitHub</a
				>
				<WalletMultiButton maxNumberOfWallets={5} />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
	<Toast />
	<NotificationList />
	<svelte:fragment slot="footer">
		<div class="logo-cloud grid-cols-1 sm:grid-cols-3 gap-1">
      <a class="logo-item" href="https://svelte.dev/" target="_blank" rel="noreferrer">
					<!-- <span><SvgIcon name="svelte" width="w-8" height="h-8" /></span> -->
					<span>Svelte</span>
				</a>
				<a class="logo-item" href="https://tailwindcss.com/" target="_blank" rel="noreferrer">
					<!-- <span><SvgIcon name="tailwind" width="w-6" height="h-6" /></span> -->
					<span>Tailwind</span>
				</a>
				<a class="logo-item" href="https://github.com/" target="_blank" rel="noreferrer">
					<!-- <span><SvgIcon name="github" width="w-6" height="h-6" /></span> -->
					<span>Github</span>
				</a>
		</div>
	</svelte:fragment>
</AppShell>
