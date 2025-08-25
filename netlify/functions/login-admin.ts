import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
	const body = JSON.parse(event.body || '{}');
	const password = body.password;

	if (!password || password !== process.env.ADMIN_PASSWORD) {
		return {
			statusCode: 401,
			headers: {
				'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
				'Surrogate-Control': 'no-store',
			},
			body: JSON.stringify({ error: 'Contraseña incorrecta' }),
		};
	}

	// Retornamos un token dummy (la contraseña en este caso)
	return {
		statusCode: 200,
		headers: {
			'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
			Pragma: 'no-cache',
			Expires: '0',
			'Surrogate-Control': 'no-store',
		},
		body: JSON.stringify({ token: process.env.ADMIN_PASSWORD }),
	};
};
