<script lang="ts">
	import SignMessage from '$lib/components/SignMessage.svelte';
	import SendTransaction from '$lib/components/SendTransaction.svelte';
	import { GradientHeading } from '@skeletonlabs/skeleton';
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center">
		<GradientHeading
			tag="h1"
			direction="bg-gradient-to-r"
			from="from-primary-500"
			to="to-accent-500">Basics</GradientHeading
		>
		<div class="text-center">
			<SignMessage />
			<SendTransaction />
		</div>
	</div>
</div>
