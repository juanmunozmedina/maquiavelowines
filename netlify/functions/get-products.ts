import { getProducts } from '../../src/lib/client.mock.ts';

export const handler = async () => {
	try {
		const response = await getProducts();

		if (!response?.data?.items) {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: 'No se recibieron datos de productos' }),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify(response.data.items),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Error al obtener productos' }),
		};
	}
};
