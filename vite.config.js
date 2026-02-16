import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	
	build: {
		// CSS Code-Splitting für bessere Performance
		cssCodeSplit: true,
		// Chunk-Größe Warnungen bei 500kb
		chunkSizeWarningLimit: 500,
		// Optimierte Rollup-Optionen
		rollupOptions: {
			output: {
				// Manuelle Chunk-Strategie für besseres Caching
				manualChunks: (id) => {
					// Vendor-Chunks für externe Dependencies
					if (id.includes('node_modules')) {
						// Svelte separat
						if (id.includes('svelte')) {
							return 'vendor-svelte';
						}
						// Firebase separat
						if (id.includes('firebase')) {
							return 'vendor-firebase';
						}
						// Alle anderen node_modules
						return 'vendor';
					}
					// Komponenten-Chunks
					if (id.includes('/src/lib/components/')) {
						return 'components';
					}
				},
			},
		},
		// Minification optimieren mit esbuild (schneller und bereits enthalten)
		minify: 'esbuild',
		// Console.logs in Production entfernen
		esbuild: {
			drop: ['console', 'debugger'],
		},
	},
	
	// Optimized dependency handling
	optimizeDeps: {
		include: ['svelte', 'svelte/transition', 'svelte/animate'],
	},
	
	// Server-Konfiguration für Entwicklung
	server: {
		fs: {
			strict: true,
		},
	},
});
