import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: { exclude: ["@laihoe/demoparser2-linux-x64-gnu", "@laihoe/demoparser2"] },
});
