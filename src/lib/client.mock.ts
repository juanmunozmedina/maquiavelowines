// This file contains mock functions for all storefront services.
// You can use this as a template to connect your own ecommerce provider.

import type { Options, RequestResult } from '@hey-api/client-fetch';
import type {
	Collection,
	CreateCustomerData,
	CreateCustomerError,
	CreateCustomerResponse,
	CreateOrderData,
	CreateOrderError,
	CreateOrderResponse,
	GetCollectionByIdData,
	GetCollectionByIdError,
	GetCollectionByIdResponse,
	GetCollectionsData,
	GetCollectionsError,
	GetCollectionsResponse,
	GetOrderByIdData,
	GetOrderByIdError,
	GetOrderByIdResponse,
	GetProductByIdData,
	GetProductByIdError,
	GetProductByIdResponse,
	GetProductsData,
	GetProductsError,
	GetProductsResponse,
	Order,
	Product,
} from './client.types.ts';

export * from './client.types.ts';

export const getProducts = async <ThrowOnError extends boolean = false>(
	options?: Options<GetProductsData, ThrowOnError>,
): Promise<RequestResult<GetProductsResponse, GetProductsError, ThrowOnError>> => {
	await loadProducts();

	let items =
		options?.query?.sort === 'random' ? shuffle(Object.values(products)) : Object.values(products);

	if (options?.query?.collectionId) {
		const collectionId = options.query.collectionId;
		items = items.filter((product) => product.collectionIds?.includes(collectionId));
	}
	if (options?.query?.ids) {
		const ids = Array.isArray(options.query.ids) ? options.query.ids : [options.query.ids];
		items = items.filter((product) => ids.includes(product.id));
	}

	if (options?.query?.sort && options.query.sort !== 'random' && options?.query?.order) {
		const { sort, order } = options.query;
		if (sort === 'price') {
			items = items.sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
		} else if (sort === 'name') {
			items = items.sort((a, b) =>
				order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
			);
		}
	}

	return asResult<GetProductsResponse, GetProductsError, ThrowOnError>({
		items,
		next: null,
	});
};

export const getProductById = async <ThrowOnError extends boolean = false>(
	options: Options<GetProductByIdData, ThrowOnError>,
): Promise<RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>> => {
	await loadProducts();

	const product = products[options.path.id];
	if (!product) {
		const error = asError<GetProductByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>;
	}
	return asResult<Product, GetProductByIdError, ThrowOnError>(product);
};

export const getCollections = <ThrowOnError extends boolean = false>(
	_options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
	return asResult({ items: Object.values(collections), next: null });
};

export const getCollectionById = async <ThrowOnError extends boolean = false>(
	options: Options<
		GetCollectionByIdData & {
			query?: { sort?: 'random' | 'name' | 'price' | 'updatedAt'; order?: 'asc' | 'desc' };
		},
		ThrowOnError
	>,
): Promise<RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>> => {
	await loadProducts();

	const collection = collections[options.path.id];
	if (!collection) {
		const error = asError<GetCollectionByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
	}

	let productsInCollection = Object.values(products).filter((product) =>
		product.collectionIds?.includes(collection.id),
	);

	const sort = options.query?.sort;
	const order = options.query?.order ?? 'asc';

	if (sort) {
		if (sort === 'random') {
			productsInCollection = shuffle(productsInCollection);
		} else if (sort === 'price') {
			productsInCollection = productsInCollection.sort((a, b) =>
				order === 'asc' ? a.price - b.price : b.price - a.price,
			);
		} else if (sort === 'name') {
			productsInCollection = productsInCollection.sort((a, b) =>
				order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
			);
		} else if (sort === 'updatedAt') {
			productsInCollection = productsInCollection.sort((a, b) =>
				order === 'asc'
					? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
					: new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			);
		}
	}

	return asResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>({
		...collection,
		products: productsInCollection,
	});
};

export const createCustomer = <ThrowOnError extends boolean = false>(
	options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
	if (!options?.body) throw new Error('No se proporcionó ningún cuerpo');
	return asResult({
		...options.body,
		id: options.body.id ?? 'customer-1',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	});
};

const orders: Record<string, Order> = {};

export const createOrder = <ThrowOnError extends boolean = false>(
	options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
	if (!options?.body) throw new Error('No se proporcionó ningún cuerpo');
	const order: Order = {
		...options.body,
		id: crypto.randomUUID(),
		number: Date.now(),
		lineItems: options.body.lineItems.map((lineItem) => ({
			...lineItem,
			id: crypto.randomUUID(),
			productVariant: getProductVariantFromLineItemInput(lineItem.productVariantId),
		})),
		billingAddress: getAddress(options.body.billingAddress),
		shippingAddress: getAddress(options.body.shippingAddress),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	};
	orders[order.id] = order;
	return asResult(order);
};

export const getOrderById = <ThrowOnError extends boolean = false>(
	options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
	const order = orders[options.path.id];
	if (!order) {
		const error = asError<GetOrderByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
	}
	return asResult(order);
};

const collectionDefaults = {
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const collections: Record<string, Collection> = {
	maquiavelo: {
		id: 'maquiavelo',
		name: 'Maquiavelo',
		description: 'Identidad propia del vino.',
		slug: 'maquiavelo',
		imageUrl: '/assets/maquiavelo.png',
		...collectionDefaults,
	},
	ancestral: {
		id: 'ancestral',
		name: 'Ancestral',
		description: 'Gusto por la tradición y orígenes.',
		slug: 'ancestral',
		imageUrl: '/assets/ancestral.png',
		...collectionDefaults,
	},
	centhaurus: {
		id: 'centhaurus',
		name: 'Centhaurus',
		description: 'La mejor selección de espumosos.',
		slug: 'centhaurus',
		imageUrl: '/assets/centhaurus.png',
		...collectionDefaults,
	},
};

function shuffle<T>(array: T[]): T[] {
	return array
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
}

const products: Record<string, Product> = {};
let productsLoaded = false;

async function loadProducts() {
	if (productsLoaded) return;

	try {
		const res = await fetch('/data/index.json');
		if (!res.ok) throw new Error('No se pudo cargar index.json');
		const slugs = (await res.json()) as string[];

		await Promise.all(
			slugs.map(async (slug) => {
				try {
					const productRes = await fetch(`/data/${slug}.json`);
					if (!productRes.ok) throw new Error(`No se pudo cargar ${slug}.json`);
					const product = (await productRes.json()) as Product;

					if (product.id === slug) {
						products[slug] = product;
					} else {
						console.warn(`⚠️ ID de producto no coincide con slug: ${slug}`);
					}
				} catch (err) {
					console.error(`Error cargando ${slug}.json:`, err);
				}
			}),
		);

		productsLoaded = true;
	} catch (err) {
		console.error('Error cargando productos:', err);
	}
}

function asResult<T, E = unknown, ThrowOnError extends boolean = false>(
	data: T,
): RequestResult<T, E, ThrowOnError> {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	}) as RequestResult<T, E, ThrowOnError>;
}

function asError<T, E = unknown, ThrowOnError extends boolean = false>(
	error: E,
): RequestResult<T, E, ThrowOnError> {
	return {
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	} as unknown as RequestResult<T, E, ThrowOnError>;
}

function getAddress(address: Required<CreateOrderData>['body']['shippingAddress']) {
	return {
		line1: address?.line1 ?? '',
		line2: address?.line2 ?? '',
		city: address?.city ?? '',
		country: address?.country ?? '',
		province: address?.province ?? '',
		postal: address?.postal ?? '',
		phone: address?.phone ?? null,
		company: address?.company ?? null,
		firstName: address?.firstName ?? null,
		lastName: address?.lastName ?? null,
	};
}

function getProductVariantFromLineItemInput(
	variantId: string,
): NonNullable<Order['lineItems']>[number]['productVariant'] {
	for (const product of Object.values(products)) {
		for (const variant of product.variants) {
			if (variant.id === variantId) {
				return { ...variant, product };
			}
		}
	}
	throw new Error(`Variante de producto ${variantId} no encontrada`);
}
