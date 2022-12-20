<script lang="ts">
	// IMPORTANT: Attempting to just copy the wallet-adapter-ui package
	// so I can make customize.
	// REF: https://github.com/svelte-on-solana/wallet-adapter/tree/master/packages/ui
	export let disabled: boolean = false;
	let className: string = '';
	export { className as class };
</script>

<button
	class="wallet-adapter-button {className}"
	style={`justify-content: space-between;`}
	{disabled}
	on:click
>
	{#if $$slots['start-icon']}
		<i class="wallet-adapter-button-start-icon">
			<slot name="start-icon" />
		</i>
	{/if}
	<slot />
	<span>
		<slot name="status" />
	</span>
</button>

<style>
  .wallet-button-custom {
    --tw-bg-opacity: 1 !important;
    background-color: rgb(var(--color-surface-500) / var(--tw-bg-opacity)) !important;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    padding-top: 9px;
    padding-bottom: 9px;
    font-size: 1rem;
    line-height: 1.5rem;
    white-space: nowrap;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

</style>
