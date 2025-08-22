import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
	const body = JSON.parse(event.body || '{}');
	const password = body.password;

	if (!password || password !== process.env.ADMIN_PASSWORD) {
		return {
			statusCode: 401,
			body: JSON.stringify({ error: 'Contraseña incorrecta' }),
		};
	}

	// Opcional: emitir un "token" falso para usarse en el frontend (solo un string firmado básico)
	// Aquí simplemente devolvemos una cadena dummy que el frontend reutiliza
	return {
		statusCode: 200,
		body: JSON.stringify({ token: process.env.ADMIN_PASSWORD }),
	};
};
