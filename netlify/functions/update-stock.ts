import { Handler } from '@netlify/functions';
import type { Product } from '../../src/lib/client.types';

type NetlifyIdentityUser = {
	sub: string;
	app_metadata?: {
		roles?: string[];
	};
	[key: string]: unknown;
};

// Función para validar el JWT (pasado en Authorization Bearer)
async function validateToken(token: string): Promise<NetlifyIdentityUser | null> {
	try {
		// Petición a la API de Netlify para validar token
		const res = await fetch('https://api.netlify.com/.netlify/identity/user', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) return null;

		const user = await res.json();
		return user as NetlifyIdentityUser;
	} catch {
		return null;
	}
}

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 405,
			body: JSON.stringify({ error: 'Solo se permite método POST' }),
		};
	}

	const authHeader = event.headers.authorization || event.headers.Authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: 'No autorizado: falta token Bearer' }),
		};
	}
	const token = authHeader.split(' ')[1];

	const user = await validateToken(token);
	if (!user) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: 'Token inválido o expirado' }),
		};
	}

	// (Opcional) validar rol de usuario, por ejemplo solo admin puede actualizar
	const roles = user.app_metadata?.roles || [];
	if (!roles.includes('admin')) {
		return {
			statusCode: 403,
			body: JSON.stringify({ error: 'Acceso denegado: rol insuficiente' }),
		};
	}

	const { productId, variantId, newStock } = JSON.parse(event.body || '{}');

	if (!productId || !variantId || typeof newStock !== 'number') {
		return {
			statusCode: 400,
			body: JSON.stringify({ error: 'Faltan parámetros o son inválidos' }),
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

		// Obtener archivo actual
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

		const variant = data.variants.find((v) => v.id === variantId);
		if (!variant) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: 'Variante no encontrada' }),
			};
		}

		variant.stock = newStock;

		const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

		// Actualizar en GitHub
		const updateRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${GITHUB_TOKEN}`,
				Accept: 'application/vnd.github.v3+json',
			},
			body: JSON.stringify({
				message: `Actualizar stock para variante ${variantId}`,
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
