import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind({ applyBaseStyles: false }),
		icon(),
		solidJs(),
		sitemap({
			customPages: [
				'https://maquiavelowines.com/products/adn-sauvignon-blanc',
				'https://maquiavelowines.com/products/adn-verdejo',
				'https://maquiavelowines.com/products/ancestral-monastrell-pie-franco',
				'https://maquiavelowines.com/products/crianza',
				'https://maquiavelowines.com/products/premium',
				'https://maquiavelowines.com/products/vermut',
				'https://maquiavelowines.com/products/vermut-citrus',
				'https://maquiavelowines.com/products/vinas-selectas',
				'https://maquiavelowines.com/products/brut-rose-excellence-espumoso',
				'https://maquiavelowines.com/products/brut-excellence-espumoso',
				'https://maquiavelowines.com/products/ancestral-monastrell-crianza',
				'https://maquiavelowines.com/products/ancestral-alicante-bouschet',
				'https://maquiavelowines.com/products/ancestral-petit-verdot',
				'https://maquiavelowines.com/products/ancestral-cabernet',
				'https://maquiavelowines.com/products/espumoso-brut',
				'https://maquiavelowines.com/products/espumoso-dulce-blanco',
				'https://maquiavelowines.com/products/espumoso-dulce-rosado',
				'https://maquiavelowines.com/products/espumoso-semiseco',
				'https://maquiavelowines.com/collections/maquiavelo',
				'https://maquiavelowines.com/collections/ancestral',
				'https://maquiavelowines.com/collections/centhaurus',
			],
		}),
	],
	// Update to your storefront URL
	site: 'https://maquiavelowines.com',
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
		'/es/vinos/adn-sauvignon-blanc': '/products/adn-sauvignon-blanc',
		'/es/vinos/adn-verdejo': '/products/adn-verdejo',
		'/es/especial/ancestral': '/products/ancestral-monastrell-pie-franco',
		'/es/vinos/crianza': '/products/crianza',
		'/es/vinos/premium': '/products/premium',
		'/es/vinos/vermut': '/products/vermut',
		'/es/vinos/vermut-citrus': '/products/vermut-citrus',
		'/es/vinos/vinas-selectas': '/products/vinas-selectas',
		'/es/espumosos/espumoso-brut': '/products/espumoso-brut',
		'/es/espumosos/espumoso-dulce-blanco': '/products/espumoso-dulce-blanco',
		'/es/espumosos/espumoso-dulce-rosado': '/products/espumoso-dulce-rosado',
		'/es/espumosos/espumoso-semiseco': '/products/espumoso-semiseco',
		'/es/vinos': '/collections/maquiavelo',
		'/es/espumosos': '/collections/centhaurus',
		'/es/ancestral-edicion-especial': '/collections/ancestral',
		'/es/politica-de-cookies': '/cookies',
		'/es/aviso-legal': '/legal',
		'/es/condiciones-de-privacidad': '/privacidad',
		'/es/condiciones-de-venta': '/venta',
		'/es/maquiavelo': '/',
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
