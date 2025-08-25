import type { Handler } from '@netlify/functions';

interface Variant {
	id: string;
	name: string;
	options: Record<string, string>;
	priceVariant: number;
}

interface Product {
	id: string;
	name: string;
	slug: string;
	tagline: string;
	description: string;
	price: number;
	imageUrl: string;
	collectionIds: string[];
	variants: Variant[];
	images: unknown[]; // Puedes ajustar si sabes el tipo exacto
	stock: boolean;
	discount: number;
	createdAt: string; // o Date si luego haces `new Date(...)`
	updatedAt: string;
	deletedAt: string | null;
}

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			body: JSON.stringify({ error: 'Solo se permite método GET' }),
		};
	}

	const headers = Object.fromEntries(
		Object.entries(event.headers).map(([k, v]) => [k.toLowerCase(), v]),
	);
	const token = headers['x-admin-token'];

	if (token !== process.env.ADMIN_PASSWORD) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: 'No autorizado: contraseña incorrecta' }),
		};
	}

	try {
		const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
		if (!GITHUB_TOKEN) {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: 'Token de GitHub no configurado' }),
			};
		}

		const REPO = 'juanmunozmedina/maquiavelowines';
		const BRANCH = 'main';
		const PRODUCTS_DIR = '/data';

		// 1. Listar archivos en la carpeta de productos
		const listRes = await fetch(
			`https://api.github.com/repos/${REPO}/contents/${PRODUCTS_DIR}?ref=${BRANCH}`,
			{
				headers: {
					Authorization: `Bearer ${GITHUB_TOKEN}`,
					Accept: 'application/vnd.github.v3+json',
				},
			},
		);

		if (!listRes.ok) {
			return {
				statusCode: listRes.status,
				body: JSON.stringify({ error: 'Error al listar productos' }),
			};
		}

		const files: Array<{ name: string; type: string; download_url: string }> = await listRes.json();

		const products: Product[] = [];

		for (const file of files) {
			if (file.type === 'file' && file.name.endsWith('.json')) {
				const fileRes = await fetch(file.download_url);
				if (fileRes.ok) {
					const product: Product = await fileRes.json();
					products.push(product);
				} else {
					console.warn(`Error cargando ${file.name}: ${fileRes.status}`);
				}
			}
		}

		return {
			statusCode: 200,
			body: JSON.stringify(products),
		};
	} catch (err) {
		console.error('Error obteniendo productos:', err);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Error interno del servidor' }),
		};
	}
};
