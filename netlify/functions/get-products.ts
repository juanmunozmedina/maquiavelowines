import type { Handler } from '@netlify/functions';

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
	const password = headers['x-admin-password'];

	if (password !== process.env.ADMIN_PASSWORD) {
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

		const res = await fetch(
			`https://api.github.com/repos/${REPO}/contents/src/data/products.json?ref=${BRANCH}`,
			{
				headers: {
					Authorization: `Bearer ${GITHUB_TOKEN}`,
					Accept: 'application/vnd.github.v3+json',
				},
			},
		);

		if (!res.ok) {
			return {
				statusCode: res.status,
				body: JSON.stringify({ error: 'Error al obtener lista de productos' }),
			};
		}

		const file = await res.json();
		let products;
		try {
			const content = Buffer.from(file.content, 'base64').toString('utf-8');
			products = JSON.parse(content);
		} catch {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: 'Error al parsear productos' }),
			};
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
