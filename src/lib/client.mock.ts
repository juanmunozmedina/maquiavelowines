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
	let items = Object.values(products);
	if (options?.query?.collectionId) {
		const collectionId = options.query.collectionId;
		items = items.filter((product) => product.collectionIds?.includes(collectionId));
	}
	if (options?.query?.ids) {
		const ids = Array.isArray(options.query.ids) ? options.query.ids : [options.query.ids];
		items = items.filter((product) => ids.includes(product.id));
	}
	if (options?.query?.sort && options?.query?.order) {
		const { sort, order } = options.query;
		if (sort === 'price') {
			items = items.sort((a, b) => {
				return order === 'asc' ? a.price - b.price : b.price - a.price;
			});
		} else if (sort === 'name') {
			items = items.sort((a, b) => {
				return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
			});
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
	options: Options<GetCollectionByIdData, ThrowOnError>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
	const collection = collections[options.path.id];
	if (!collection) {
		const error = asError<GetCollectionByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
	}
	return asResult({ ...collection, products: [] });
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
		id: 'dk3fd0sak3d',
		number: 1001,
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
		//imageUrl: '/assets/maquiavelo.png',
		...collectionDefaults,
	},
	ancestral: {
		id: 'ancestral',
		name: 'Ancestral',
		description: 'Gusto por la tradición y orígenes.',
		slug: 'ancestral',
		//imageUrl: '/assets/ancestral.png',
		...collectionDefaults,
	},
	centhaurus: {
		id: 'centhaurus',
		name: 'Centhaurus',
		description: 'La mejor selección de espumosos.',
		slug: 'centhaurus',
		//imageUrl: '/assets/centhaurus.png',
		...collectionDefaults,
	},
};

const defaultVariant = {
	id: 'default',
	name: 'Default',
	stock: 200,
	options: {},
};

const apparelVariants = ['Pack 3 botellas', 'Pack 6 botellas', 'Pack 12 botellas'].map(
	(size, index) => ({
		id: size,
		name: size,
		stock: index * 10,
		options: {
			Tamaño: size,
		},
		priceVariant: 0,
	}),
);

const productDefaults = {
	description: '',
	images: [],
	variants: [defaultVariant],
	discount: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const products: Record<string, Product> = {
	'adn-sauvignon-blanc': {
		...productDefaults,
		id: 'adn-sauvignon-blanc',
		name: 'ADN Sauvignon Blanc',
		slug: 'adn-sauvignon-blanc',
		tagline: 'Identidad propia del vino blanco.',
		description:
			'<div><p><b>Botella</b>: 75 cl.</p><p><b>Tipo de uva</b>: Sauvignon Blanc</p><p><b>Graduación</b>: 12% Alc. Vol.</p><p><b>Año</b>: 2021</p><p><b>Denominación de origen</b>: Jumilla (Protegida)</p></div><div><p><b>Descripción</b></p><p>Maquiavelo ADN Sauvignon Blanc es un vino blanco joven de la cosecha 2021 elaborado en su totalidad con selecta uva sauvignon blanc. Su sabor destaca por ser suave en paladar y con un toque semi seco en boca. Ideal para acompañar con cualquier tipo de pescados, mariscos, verduras, pastas con salsas suaves o incluso para degustar solo plácidamente. Un vino joven para los paladares que no te dejará indiferente.</p><p><b>Recomendaciones</b></p><p>Servir entre 7 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p><div></div></div>',
		price: 1070,
		imageUrl: '/assets/blanco.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'adn-sauvignon-blanc-3',
				name: 'ADN Sauvignon Blanc',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 2140,
			},
			{
				id: 'adn-sauvignon-blanc-6',
				name: 'ADN Sauvignon Blanc',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 5350,
			},
			{
				id: 'adn-sauvignon-blanc-12',
				name: 'ADN Sauvignon Blanc',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 11770,
			},
		],
	},
	'adn-verdejo': {
		...productDefaults,
		id: 'adn-verdejop',
		name: 'ADN Verdejo',
		slug: 'adn-verdejo',
		tagline: '100% Verdejo.',
		description: '',
		price: 1070,
		imageUrl: '/assets/verdejo.png',
		collectionIds: ['maquiavelo'],
		variants: apparelVariants,
	},
	crianza: {
		...productDefaults,
		id: 'crianza',
		name: 'Crianza',
		slug: 'crianza',
		tagline: 'Una experiencia enológica diferente.',
		description: '',
		price: 1180,
		imageUrl: '/assets/crianza.png',
		collectionIds: ['maquiavelo'],
		variants: apparelVariants,
	},
	premium: {
		...productDefaults,
		id: 'premium',
		name: 'Premium',
		slug: 'premium',
		tagline: 'El vino secreto de Maquiavelo.',
		description: '',
		price: 1580,
		imageUrl: '/assets/premium.png',
		collectionIds: ['maquiavelo'],
		variants: apparelVariants,
	},
	vermut: {
		...productDefaults,
		id: 'vermut',
		name: 'Vermut',
		slug: 'vermut',
		tagline: 'Maquiavelo y Pedro Ximénez.',
		description: '',
		price: 1190,
		imageUrl: '/assets/vermut.png',
		collectionIds: ['maquiavelo'],
		variants: apparelVariants,
	},
	'vermut-citrus': {
		...productDefaults,
		id: 'vermut-citrus',
		name: 'Vermut Citrus',
		slug: 'vermut-citrus',
		tagline: 'Maquiavelo y limones de Murcia.',
		description: '',
		price: 1190,
		imageUrl: '/assets/citrus.png',
		collectionIds: ['maquiavelo'],
		variants: apparelVariants,
	},
	'vinas-selectas': {
		...productDefaults,
		id: 'vinas-selectas',
		name: 'Viñas Selectas',
		slug: 'vinas-selectas',
		tagline: 'El vino selecto de Maquiavelo.',
		description: '',
		price: 775,
		imageUrl: '/assets/vinas.png',
		collectionIds: ['maquiavelo'],
		variants: apparelVariants,
	},
	'ancestral-monastrell-pie-franco': {
		...productDefaults,
		id: 'ancestral-monastrell-pie-franco',
		name: 'Ancestral Monastrell Pie Franco',
		slug: 'ancestral-monastrell-pie-franco',
		tagline: 'Ancestral edición especial monastrell pie franco.',
		description: '',
		price: 3400,
		imageUrl: '/assets/ancestral_especial.png',
		collectionIds: ['ancestral'],
		variants: apparelVariants,
	},
	'ancestral-monastrell-crianza': {
		...productDefaults,
		id: 'ancestral-monastrell-crianza',
		name: 'Ancestral Monastrell Crianza',
		slug: 'ancestral-monastrell-crianza',
		tagline: 'Ancestral edición especial crianza.',
		description: '',
		price: 1580,
		imageUrl: '/assets/ancestral_crianza.png',
		collectionIds: ['ancestral'],
		variants: apparelVariants,
	},
	'ancestral-alicante-bouschet': {
		...productDefaults,
		id: 'ancestral-alicante-bouschet',
		name: 'Ancestral Alicante bouschet',
		slug: 'ancestral-alicante-bouschet',
		tagline: 'Ancestral edición especial Alicante bouschet.',
		description: '',
		price: 1580,
		imageUrl: '/assets/ancestral_bouschet.png',
		collectionIds: ['ancestral'],
		variants: apparelVariants,
	},
	'espumoso-brut': {
		...productDefaults,
		id: 'espumoso-brut',
		name: 'Espumoso Brut',
		slug: 'espumoso-brut',
		tagline: 'Maquiavelo edición especial de vino espumoso brut.',
		description: '',
		price: 1570,
		imageUrl: '/assets/brut.png',
		collectionIds: ['centhaurus'],
		variants: apparelVariants,
	},
	'espumoso-dulce-blanco': {
		...productDefaults,
		id: 'espumoso-dulce-blanco',
		name: 'Espumoso Dulce Blanco',
		slug: 'espumoso-dulce-blanco',
		tagline: 'Maquiavelo edición especial de vino espumoso dulce blanco.',
		description: '',
		price: 1190,
		imageUrl: '/assets/sweetgreen.png',
		collectionIds: ['centhaurus'],
		variants: apparelVariants,
	},
	'espumoso-dulce-rosado': {
		...productDefaults,
		id: 'espumoso-dulce-rosado',
		name: 'Espumoso Dulce Rosado',
		slug: 'espumoso-dulce-rosado',
		tagline: 'Maquiavelo edición especial de vino espumoso dulce rosado.',
		description: '',
		price: 1190,
		imageUrl: '/assets/sweetred.png',
		collectionIds: ['centhaurus'],
		variants: apparelVariants,
	},
	'espumoso-semiseco': {
		...productDefaults,
		id: 'espumoso-semiseco',
		name: 'Espumoso Semiseco',
		slug: 'espumoso-semiseco',
		tagline: 'Maquiavelo edición especial de vino espumoso semiseco.',
		description: '',
		price: 1570,
		imageUrl: '/assets/semidry.png',
		collectionIds: ['centhaurus'],
		variants: apparelVariants,
	},
};

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
