import type { Handler } from '@netlify/functions';
import type { Product } from '../../src/lib/client.types';

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 405,
			body: JSON.stringify({ error: 'Solo se permite método POST' }),
		};
	}

	let body: { password?: string; productId?: string; stock?: boolean } = {};
	try {
		body = JSON.parse(event.body || '{}');
	} catch {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: 'Body JSON inválido' }),
		};
	}

	if (typeof body.password !== 'string' || body.password !== process.env.ADMIN_PASSWORD) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: 'No autorizado: contraseña incorrecta' }),
		};
	}

	const { productId, stock } = body;

	if (!productId || typeof stock !== 'boolean') {
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: 'Parámetros inválidos: se requiere productId y stock booleano',
			}),
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
		const FILE_PATH = `src/data/${productId}.json`;
		const BRANCH = 'main';

		const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`,
				Accept: 'application/vnd.github.v3+json',
			},
		});

		if (!res.ok) {
			return {
				statusCode: res.status,
				body: JSON.stringify({ error: 'Error al obtener el archivo del producto desde GitHub' }),
			};
		}

		const file = await res.json();
		const content = Buffer.from(file.content, 'base64').toString('utf-8');
		const data = JSON.parse(content) as Product;

		data.stock = stock;

		const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

		const updateRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`,
				Accept: 'application/vnd.github.v3+json',
			},
			body: JSON.stringify({
				message: `Actualizar stock (disponibilidad) de producto ${productId}`,
				content: updatedContent,
				sha: file.sha,
				branch: BRANCH,
			}),
		});

		if (!updateRes.ok) {
			const errorBody = await updateRes.json();
			return {
				statusCode: updateRes.status,
				body: JSON.stringify({
					error: 'Error al actualizar el archivo en GitHub',
					detalles: errorBody,
				}),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({ success: true }),
		};
	} catch (err) {
		console.error('Error actualizando stock:', err);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Error interno del servidor' }),
		};
	}
};
