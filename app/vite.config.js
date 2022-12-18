import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
  optimizeDeps: {
    include: ['@project-serum/anchor', '@solana/web3.js', 'buffer'],
  },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
};

export default config;
