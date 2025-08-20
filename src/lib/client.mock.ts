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

export const getProducts = <ThrowOnError extends boolean = false>(
	options?: Options<GetProductsData, ThrowOnError>,
): RequestResult<GetProductsResponse, GetProductsError, ThrowOnError> => {
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

	return asResult({ items, next: null });
};

export const getProductById = <ThrowOnError extends boolean = false>(
	options: Options<GetProductByIdData, ThrowOnError>,
): RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError> => {
	const product = products[options.path.id];
	if (!product) {
		const error = asError<GetProductByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>;
	}
	return asResult(product);
};

export const getCollections = <ThrowOnError extends boolean = false>(
	_options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
	return asResult({ items: Object.values(collections), next: null });
};

export const getCollectionById = <ThrowOnError extends boolean = false>(
	options: Options<
		GetCollectionByIdData & {
			query?: { sort?: 'random' | 'name' | 'price' | 'updatedAt'; order?: 'asc' | 'desc' };
		},
		ThrowOnError
	>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
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
			// Shuffle products but keep a stable shuffle per session if quieres
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

	return asResult({
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

// Dynamically load all products from the folder src/data
const productModules = import.meta.glob('../data/*.json', { eager: true });

const products: Record<string, Product> = {};

for (const path in productModules) {
	const match = path.match(/\/([\w-]+)\.json$/);
	if (!match) continue;

	const slug = match[1];
	const product = productModules[path] as Product;

	if (product && product.id === slug) {
		products[slug] = product;
	} else {
		console.warn(
			`⚠️ Producto con slug "${slug}" no coincide con su ID interno o está mal formado.`,
		);
	}
}

function asResult<T>(data: T) {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function asError<T>(error: T) {
	return Promise.resolve({
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	});
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
