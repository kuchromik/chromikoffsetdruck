import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = { 
	kit: { 
		adapter: adapter(),
		// Body-Limit auf 20 MB für PDF-Uploads erhöhen
		bodyParsingLimit: 20971520,
		csrf: {
			checkOrigin: false
		}
	}
};

export default config;
