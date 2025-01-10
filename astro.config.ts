import netlify from '@astrojs/netlify';
import solidJs from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import { defineConfig, envField } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind({ applyBaseStyles: false }), icon(), solidJs(), sitemap()],
	// Update to your storefront URL
	site: 'https://maquiavelowines.netlify.app',
	output: 'server',
	adapter: netlify({ imageCDN: true }),
	vite: {
		build: {
			assetsInlineLimit(filePath) {
				return filePath.endsWith('css');
			},
		},
	},
	image: {
		// Update to your own image domains
		domains: [
			'localhost',
			'maquiavelowines.com',
			'maquiavelowines.vercel.app',
			'maquiavelowines.netlify.app',
		],
	},
	redirects: {
		'/vinos/adn-sauvignon-blanc': '/products/adn-sauvignon-blanc',
		'/vinos/adn-verdejo': '/products/adn-verdejo',
		'/especial/ancestral': '/products/ancestral-monastrell-pie-franco',
		'/vinos/crianza': '/products/crianza',
		'/vinos/premium': '/products/premium',
		'/vinos/vermut': '/products/vermut',
		'/vinos/vermut-citrus': '/products/vermut-citrus',
		'/vinos/vinas-selectas': '/products/vinas-selectas',
		'/espumosos/espumoso-brut': '/products/espumoso-brut',
		'/espumosos/espumoso-dulce-blanco': '/products/espumoso-dulce-blanco',
		'/espumosos/espumoso-dulce-rosado': '/products/espumoso-dulce-rosado',
		'/espumosos/espumoso-semiseco': '/products/espumoso-semiseco',
		'/vinos': '/collections/maquiavelo',
		'/espumosos': '/collections/centhaurus',
		'/ancestral-edicion-especial': '/collections/ancestral',
		'/politica-de-cookies': '/cookies',
		'/aviso-legal': '/legal',
		'/condiciones-de-privacidad': '/privacidad',
		'/condiciones-de-venta': '/venta',
	},
	experimental: {
		env: {
			schema: {
				STRIPE_SECRET_KEY: envField.string({
					context: 'server',
					access: 'secret',
					// This is a random test key
					//default: 'sk_test_CGGvfNiIPwLXiDwaOfZ3oX6Y',
				}),
				FATHOM_SITE_ID: envField.string({
					context: 'client',
					access: 'public',
					optional: true,
				}),
				GOOGLE_GEOLOCATION_SERVER_KEY: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				GOOGLE_MAPS_BROWSER_KEY: envField.string({
					context: 'client',
					access: 'public',
					optional: true,
				}),
				LOOPS_API_KEY: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				LOOPS_SHOP_TRANSACTIONAL_ID: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				LOOPS_FULFILLMENT_TRANSACTIONAL_ID: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				LOOPS_FULFILLMENT_EMAIL: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				// Used by the Astro team for our internal backend
				SHOP_API_URL: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				SHOP_API_KEY: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				/*ES_SHIPPING_RATE_ID: envField.string({
                    context: 'server',
                    access: 'secret',
                }),
                INTERNATIONAL_SHIPPING_RATE_ID: envField.string({
                    context: 'server',
                    access: 'secret',
                }),*/
			},
		},
	},
});
