<script lang="ts">
	import * as anchor from '@project-serum/anchor';
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import { workspaceStore } from '$lib/stores/workspace-store';
	import { GradientHeading } from '@skeletonlabs/skeleton';
	import { toastStore } from '@skeletonlabs/skeleton';

	let color = '';
	let newBalance = '';
	let seed = '';
	let operation: string;
	let operationValue: string;
	let fetchedLedgerAccount;

	async function generateKeypair() {
		// Ensure that new wallet keypair has enough SOL
		let keypair = anchor.web3.Keypair.generate();
		// WITHOUT Store
		// await provider.connection.requestAirdrop(keypair.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
		// WITH Store
		await $workspaceStore.provider?.connection.requestAirdrop(
			keypair.publicKey,
			2 * anchor.web3.LAMPORTS_PER_SOL
		);
		// Sleep for devnet
		await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
		return keypair;
	}

	async function derivePda(color: string, pubkey: anchor.web3.PublicKey) {
		// NOTE This is key! We can derive PDA WITHOUT hitting our program!
		// Then we can use this PDA address in our functions as a check to see
		// whether there is a ledger account at this PDA address.
		// Then, MOST IMPORTANTLY, we can fetch the account's data from the CLIENT
		// and use its data.
		// NOTE pubkey is actually provider.wallet.publicKey
		let [pda, _] = await anchor.web3.PublicKey.findProgramAddress(
			[pubkey.toBuffer(), Buffer.from('_'), Buffer.from(color)],
			// WITH Store
			$workspaceStore.program?.programId as anchor.web3.PublicKey
			// WITHOUT Store
			// program.programId // The program that we want to OWN the PDA
		);

		return pda;
	}

	async function handleGetLedgerAccount(color: string, seed: string) {
		try {
			// NOTE For testing purposes only. Taking input text and converting to correct types.
			// NOTE Must convert string to type Publickey
			let pda = await derivePda(color, new anchor.web3.PublicKey(seed));
			let data = await $workspaceStore?.program?.account.ledger.fetch(pda);

			fetchedLedgerAccount = data;

			return data;
		} catch (error: any) {
			toastStore.trigger({
				message: 'Error fetching ledger account!',
				autohide: true,
				timeout: 3000,
				classes: 'bg-warning-500 text-on-warning-token'
			});

			console.log('error', `Fetch failed! ${error?.message}`);
			return;
		}
	}

	async function createLedgerAccount(
		color: string,
		pda: anchor.web3.PublicKey
		// wallet: anchor.web3.Keypair
	) {
		try {
			// Calls the program's on-chain create_ledger instruction function
			// to create a ledger account LOCATED at our generated PDA address!
			// NOTE This requires same args i.e., Context, color, system
			// NOTE We're technically creating a ledger account LOCATED at
			// this PDA address!
			const tx = await $workspaceStore?.program?.methods
				.createLedger(color)
				.accounts({
					ledgerAccount: pda,
					wallet: ($workspaceStore.provider as anchor.AnchorProvider).wallet.publicKey // OR: $walletStore.publicKey
					// NOTE Anchor automatically adds System Program (and other programs if required)
				})
				// NOTE FRONTEND: Don't need to pass signers() I guess....
				// .signers([wallet]) // Q: Need this? A: NO!
				.rpc();

			toastStore.trigger({
				message: 'Ledger account created!',
				autohide: true,
				timeout: 3000,
				action: {
					label: 'View on Explorer',
					response: () => open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, '_blank')
				}
			});
		} catch (error: any) {
			toastStore.trigger({
				message: 'Error creating ledger account!',
				autohide: true,
				timeout: 3000,
				classes: 'bg-warning-500 text-on-warning-token'
			});

			console.log('error', `Transaction failed! ${error?.message}`);
			return;
		}
	}

	async function handleCreateLedgerAccount() {
		let pda = await derivePda(
			color,
			($workspaceStore.provider as anchor.AnchorProvider).wallet.publicKey
		);

		// If testing on localnet:
		if ($workspaceStore.network == 'http://localhost:8899') {
			// Airdrop some SOL to the wallet
			const airdropRequest = await $workspaceStore.connection.requestAirdrop(
				$walletStore.publicKey as anchor.web3.PublicKey,
				anchor.web3.LAMPORTS_PER_SOL * 2
			);
			await $workspaceStore.connection.confirmTransaction(airdropRequest);
		}

		try {
			// Q: How to pass a Keypair from walletStore? I have the signers([wallet]) for the ix
			// REF: https://solana.stackexchange.com/questions/1984/anchor-signing-and-paying-for-transactions-to-interact-with-program
			// REF: https://stackoverflow.com/questions/72549145/how-to-sign-and-call-anchor-solana-smart-contract-from-web-app
			// REF: https://www.youtube.com/watch?v=vt8GUw_PDqM
			// UPDATE: Looks like I can pass the $walletStore OR $workspaceStore.provider.wallet
			// UPDATE: Looks like you DON'T pass signers([wallet]) call from frontend,
			// since it fails if I pass it inside the program.methods.createLedger() call
			await createLedgerAccount(
				color,
				pda
				// ($workspaceStore.provider as anchor.AnchorProvider).wallet
			); // WORKS
			// await createLedgerAccount(color, pda, $workspaceStore.provider.wallet); // WORKS

			const data = await $workspaceStore?.program?.account.ledger.fetch(pda);
			fetchedLedgerAccount = data;
		} catch (e) {
			console.error('handleCreateLedgerAccount::Error: ', e);
		}
	}

	async function modifyLedgerAccount(
		color: string,
		newBalance: number
		// wallet: anchor.web3.Keypair // Q: How to pass this with $walletStore????
	) {
		console.log('------------------------------------');
		// 1. Retrieve the PDA using helper
		// NOTE Don't pass pda address. Just pass color
		let data; // Is type Ledger

		let pda = await derivePda(
			color,
			($workspaceStore.provider as anchor.AnchorProvider).wallet.publicKey
		);

		// 2. Try to retreive PDA account data if it exists
		console.log(`Checking if account ${pda} exists for color: ${color}...`);
		try {
			// NOTE We're technically seeing if our PDA address has a
			// ledger account at its location (address)
			data = await $workspaceStore.program?.account.ledger.fetch(pda);
			fetchedLedgerAccount = data;
			console.log(`Account already exists!`);
		} catch (error: any) {
			// console.log(e);
			console.log(`Account ${pda} does NOT exist!`, error);
			toastStore.trigger({
				message: 'Ledger account does not exist! Creating account...',
				autohide: true,
				timeout: 3000,
				classes: 'bg-warning-500 text-on-warning-token'
			});

			// 1. Create account using helper that calls program instruction
			/* await createLedgerAccount(color, pda, wallet); */
			await createLedgerAccount(
				color,
				pda
				// Q: wallet arg needed on frontend? Testing yes, but on frontend??
				// ($workspaceStore.provider as anchor.AnchorProvider).wallet
			);
			// 2. Retrieve account data
			data = await $workspaceStore?.program?.account.ledger.fetch(pda);
			fetchedLedgerAccount = data;
		}

		console.log(`SUCCESS! Wallet: ${$walletStore.publicKey} -- PDA: ${pda} `);
		console.log('Our PDA has a ledger account with data:\n');
		console.log(`    Color: ${data?.color}   Balance: ${data?.balance}`);
		console.log(`Modifying balance of ${data?.color} from ${data?.balance} to ${newBalance}`);

		// 3. Make our modifications to the account using on-chain program function
		// NOTE This is another program function instruction
		// Q: Going to TEST whether other wallets can modify if they have the PDA...
		// A: NOPE! Error: Signature verification failed
		const tx = await $workspaceStore.program?.methods
			.modifyLedger(newBalance)
			.accounts({
				ledgerAccount: pda,
				wallet: ($workspaceStore.provider as anchor.AnchorProvider).wallet.publicKey
				// ledgerAccount: pdaFromOtherWallet, // CANNOT modify using a different wallet!
				// wallet: new anchor.web3.PublicKey(otherWalletInfo.wallet), // CANNOT modify using a different wallet!
			})
			// .signers([wallet]) // NOT needed on FRONTEND I THINK...
			.rpc();

		toastStore.trigger({
			message: 'Ledger account created!',
			autohide: true,
			timeout: 3000,
			action: {
				label: 'View on Explorer',
				response: () => open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, '_blank')
			}
		});

		// 4. Retrieve the updated data one last time
		data = await $workspaceStore.program?.account.ledger.fetch(pda);
		// data = await $workspaceStore.program?.account.ledger.fetch(pdaFromOtherWallet); // CANNOT modify using a different wallet!
		fetchedLedgerAccount = data;
		console.log(`UPDATED! Wallet: ${$walletStore.publicKey} -- PDA: ${pda} `);
		console.log('Our PDA has a ledger account with data:\n');
		console.log(`    Color: ${data?.color}   Balance: ${data?.balance}`);
		console.log('Successfully modified ledger account!');
	}

	async function handleModifyLedgerAccount() {
		try {
			// Q: How should I pass in type number? Use new BN() or new Number()?
			// A: Works using BN() and/or Number()!
			await modifyLedgerAccount(
				color,
				new anchor.BN(newBalance)
				// Q: wallet arg necessary in frontend?
				// ($workspaceStore.provider as anchor.AnchorProvider).wallet
			);
		} catch (e) {
			console.error(e);
		}
	}

	async function modifyLedgerAccountWithInstructionData(
		color: string,
		operation: number,
		operation_value: number
		// wallet: anchor.web3.Keypair
	) {
		console.log('------------------------------------');
		// 1. Retrieve the PDA using helper
		// NOTE Don't pass pda address. Just pass color
		let data; // Is type Ledger

		let pda = await derivePda(
			color,
			($workspaceStore.provider as anchor.AnchorProvider).wallet.publicKey
		);

		// 2. Try to retreive PDA account data if it exists
		console.log(`Checking if account ${pda} exists for color: ${color}...`);
		try {
			// NOTE We're technically seeing if our PDA address has a
			// ledger account at its location (address)
			data = await $workspaceStore.program?.account.ledger.fetch(pda);
			fetchedLedgerAccount = data;
			console.log(`Account already exists!`);
		} catch (e) {
			// console.log(e);
			console.log(`Account ${pda} does NOT exist!`);
			console.log('Creating account...');
			// 1. Create account using helper that calls program instruction
			/* await createLedgerAccount(color, pda, wallet); */
			await createLedgerAccount(
				color,
				pda
				// Q: wallet arg needed on frontend? Testing yes, but on frontend??
				// ($workspaceStore.provider as anchor.AnchorProvider).wallet
			);
			// 2. Retrieve account data
			data = await $workspaceStore?.program?.account.ledger.fetch(pda);
			fetchedLedgerAccount = data;
		}

		console.log(`SUCCESS! Wallet: ${$walletStore.publicKey} -- PDA: ${pda} `);
		console.log('Our PDA has a ledger account with data:\n');
		console.log(`    Color: ${data?.color}   Balance: ${data?.balance}`);

		// 3. Make our modifications to the account using on-chain program function
		// NOTE This is another program function instruction
		// console.log(
		// 	`We're going to ${await getStringForInstruction(
		// 		operation,
		// 		operation_value
		// 		// operationValue
		// 	)}`
		// );

		const tx = await $workspaceStore.program?.methods
			// Q: Is Buffer the right type for this when using Anchor?
			// REF: Check out the tic-tac-toe tests for the Tile (they pass object directly!)
			// A: NO! Passes without using the Buffer! Looks like Anchor's generated IDL does
			// the job for us!
			.modifyLedgerWithInstructionData({
				operation: operation,
				operationValue: operation_value
			}) // MUST match the IDL type for LedgerInstructions
			.accounts({
				ledgerAccount: pda,
				wallet: ($workspaceStore.provider as anchor.AnchorProvider).wallet.publicKey
			})
			// .signers([wallet]) // NOT needed on FRONTEND I THINK...
			.rpc();

		toastStore.trigger({
			message: 'Ledger account created!',
			autohide: true,
			timeout: 3000,
			action: {
				label: 'View on Explorer',
				response: () => open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, '_blank')
			}
		});

		// 4. Retrieve the updated data one last time
		data = await $workspaceStore?.program?.account.ledger.fetch(pda);
		fetchedLedgerAccount = data;
		console.log(`UPDATED! Wallet: ${$walletStore.publicKey} -- PDA: ${pda} `);
		console.log('Our PDA has a ledger account with data:\n');
		console.log(`    Color: ${data?.color}   Balance: ${data?.balance}`);
		console.log('Successfully modified ledger account!');
	}

	async function handleModifyLedgerAccountWithInstructionData() {
		try {
			// Q: How should I pass in type number? Use new BN() or new Number()?
			// A: Works using BN() and/or Number()!
			await modifyLedgerAccountWithInstructionData(
				color,
				new anchor.BN(operation),
				new anchor.BN(operationValue)
				// Q: wallet arg necessary in frontend?
				// $workspaceStore.provider?.wallet
			);
		} catch (e) {
			console.error(e);
		}
	}

	// $: {
	// 	console.log('operation: ', operation);
	// }
</script>

<!-- Using Skeleton source as guide -->
<div class="page-container space-y-10 p-4">
	<header class="space-y-4">
		<GradientHeading
			tag="h1"
			direction="bg-gradient-to-r"
			from="from-primary-500"
			to="to-accent-500">Create, Fetch & Modify Ledgers using PDAs</GradientHeading
		>
		<p>
			Experiment with Solana Program Derived Accounts (PDAs) by creating Ledger accounts stored
			inside PDAs using custom seeds. Each PDA is derived using <code>findProgramAddress()</code> helper
			method.
		</p>
	</header>

	<!-- Single Form Card -->
	<div class="card">
		<header class="card-header space-y-4">
			<h2>Create Ledger</h2>
			<p>Each ledger account is saved inside a PDA with a account structure of <code>color: string, balance: number</code> and with unique <code>seeds</code> to later fetch and modify account data.</p>
		</header>
		<div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
			<form class="space-y-4" on:submit|preventDefault={handleCreateLedgerAccount}>
				<label for="color">
					<span>Color</span>
					<input type="text" id="color" bind:value={color} minlength="2" required />
				</label>

				<button class="btn btn-ringed-primary" type="submit">
					<span>💀</span>
					<span>Create Ledger</span>
					<span>🦴</span>
				</button>
			</form>
		</div>
	</div>

	<!-- Split Two Columns Forms -->
	<section class="grid grid-cols-2 gap-4">
		<div class="card">
			<header class="card-header space-y-4">
				<h2>Fetch Ledger</h2>
				<p>Pass wallet address for <code>seed</code></p>
			</header>
			<form
				class="p-4 space-y-4"
				on:submit|preventDefault={() => handleGetLedgerAccount(color, seed)}
			>
				<label for="color">
					<span>Color</span>
					<input type="text" id="color" bind:value={color} minlength="2" required />
				</label>

				<label for="seed">
					<span>Seed</span>
					<input type="text" id="seed" bind:value={seed} minlength="2" required />
				</label>

				<button class="btn btn-filled-accent" type="submit">
					<span>💀</span>
					<span>Get Ledger</span>
					<span>🦴</span>
				</button>
			</form>
		</div>

		<div class="card">
			<header class="card-header space-y-4">
				<h2>Modify Ledger</h2>
				<p>Enter new balance amount</p>
			</header>
			<form class="p-4 space-y-4" on:submit|preventDefault={handleModifyLedgerAccount}>
				<label for="color">
					<span>Color</span>
					<input type="text" id="color" bind:value={color} minlength="2" required />
				</label>

				<label for="new-balance">
					<span>New Balance</span>
					<input type="text" id="new-balance" bind:value={newBalance} minlength="1" required />
				</label>

				<button class="btn btn-filled-surface">
					<span>💀</span>
					<span>Modify Ledger</span>
					<span>🦴</span>
				</button>
			</form>
		</div>
	</section>

	<!-- Single Form Card -->
	<div class="card">
		<header class="card-header space-y-4">
			<h2>Modify Ledgers with Instructions</h2>
			<p>
				This uses custom program instructions (<code>LedgerInstructions</code>), which allows user
				to perform different computational operations on the current ledger account balance.
			</p>
		</header>
		<div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
			<form
				class="space-y-4"
				on:submit|preventDefault={handleModifyLedgerAccountWithInstructionData}
			>
				<label for="color">
					<span>Color</span>
					<input type="text" id="color" bind:value={color} minlength="2" required />
				</label>

				<label for="operation">
					<span>Operation</span>
					<select name="operation" id="operation" bind:value={operation}>
            <option value="1" selected>+</option>
						<option value="2">-</option>
						<option value="3">*</option>
						<option value="4">Reset</option>
					</select>
				</label>

				<label for="operation-value">
					<span>Operation Value</span>
					<input type="text" id="operation-value" bind:value={operationValue} minlength="1" required />
				</label>

				<button class="btn btn-ghost-primary" type="submit">
					<span>💀</span>
					<span>Modify w/ Instructions</span>
					<span>🦴</span>
				</button>
			</form>
		</div>
	</div>
</div>
