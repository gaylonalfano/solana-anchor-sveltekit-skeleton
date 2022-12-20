import { writable } from 'svelte/store';
import { LAMPORTS_PER_SOL, type PublicKey, type Connection } from '@solana/web3.js';

type BalanceStore = {
	balance: number;
};

function createBalanceStore() {
	const { subscribe, set } = writable<BalanceStore>({ balance: 0 });

	return {
		subscribe,
		getUserSOLBalance: async (publicKey: PublicKey, connection: Connection) => {

			let balance = 0;

			try {

        console.log('balance BEFORE getBalance(): ', balance);
				balance = await connection.getBalance(publicKey, 'confirmed');
        console.log('balance AFTER getBalance(): ', balance);
				balance = balance / LAMPORTS_PER_SOL;
        // console.log('balanceStore.balance: ', balance);
				set({ balance });

			} catch (e) {

				console.log(`error getting balance: `, e);

			}
		}
	};
}

export const balanceStore = createBalanceStore();
