import { getProducts } from '../../src/lib/client.mock.ts';

export const handler = async () => {
	try {
		const response = await getProducts();

		const products = response?.data?.items;

		if (!Array.isArray(products)) {
			return {
				statusCode: 500,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ error: 'No se recibieron datos de productos' }),
			};
		}

		return {
			statusCode: 200,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(products),
		};
	} catch (error) {
		console.error('Error al obtener productos:', error);
		return {
			statusCode: 500,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ error: 'Error al obtener productos' }),
		};
	}
};
