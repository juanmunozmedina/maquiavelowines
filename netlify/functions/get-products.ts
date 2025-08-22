import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			body: JSON.stringify({ error: 'Solo se permite método GET' }),
		};
	}

	// Puedes recibir la contraseña en headers o query string, aquí uso headers
	const password = event.headers['x-admin-password'];

	if (password !== process.env.ADMIN_PASSWORD) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: 'No autorizado: contraseña incorrecta' }),
		};
	}

	try {
		// Aquí lee y devuelve tus productos. Ejemplo si usas archivos JSON en GitHub:

		const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
		if (!GITHUB_TOKEN) {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: 'Token de GitHub no configurado' }),
			};
		}

		const REPO = 'juanmunozmedina/maquiavelowines';
		const BRANCH = 'main';

		// Listar archivos o cargar un índice con los productos.
		// Por simplicidad, supongamos que tienes un archivo 'products.json' con la lista:

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
		const content = Buffer.from(file.content, 'base64').toString('utf-8');
		const products = JSON.parse(content);

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
