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
		id: 'adn-verdejo',
		name: 'ADN Verdejo',
		slug: 'adn-verdejo',
		tagline: '100% Verdejo.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Verdejo</p> <p><b>Graduación</b>: 12% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Descripción</b></p> <p>ADN 100% Verdejo. Ideal para acompañar con quesos azules, entrantes, pescados blancos, paella y arroces.</p> <p><b>Vista</b>: Limpio y fresco en que las notas herbáceas se unen a los aromas frutales, como sus matices a hinojo propios de la uva verdejo.<br> <b>Nariz</b>: Potente en nariz y con un largo retrogusto, es un vino ideal para acompañar platos de mar y también para degustar solo.<br> <b>Boca</b>: Vino extremadamente fresco con una vivacidad y prolongada persistencia floral.<br></p> <p><b>Recomendaciones</b></p> <p>Servir entre 7 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div></div></div>',
		price: 1070,
		imageUrl: '/assets/verdejo.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'adn-verdejo-3',
				name: 'ADN Verdejo',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 2140,
			},
			{
				id: 'adn-verdejo-6',
				name: 'ADN Verdejo',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 5350,
			},
			{
				id: 'adn-verdejo-12',
				name: 'ADN Verdejo',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 11770,
			},
		],
	},
	crianza: {
		...productDefaults,
		id: 'crianza',
		name: 'Crianza',
		slug: 'crianza',
		tagline: 'Una experiencia enológica diferente.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Año</b>: 2020</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Maquiavelo Crianza es un tinto de la cosecha 2020 elaborado en su totalidad con selecta uva monastrell. Su sabor destaca por ser muy suave y afrutado en boca. Conservado 12 meses en barrica de roble francés. Ideal para acompañar con cualquier tipo de carnes, pastas, verduras, quesos o incluso para degustar solo plácidamente. Una apuesta segura, un crianza apto para todos los paladares.</p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div> </div></div>',
		price: 1180,
		imageUrl: '/assets/crianza.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'crianza-3',
				name: 'Crianza',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 2140,
			},
			{
				id: 'crianza-6',
				name: 'Crianza',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 5350,
			},
			{
				id: 'crianza-12',
				name: 'Crianza',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 11770,
			},
		],
	},
	premium: {
		...productDefaults,
		id: 'premium',
		name: 'Premium',
		slug: 'premium',
		tagline: 'El vino secreto de Maquiavelo.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell / Cabernet Sauvignon</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Año</b>: 2017</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Maquiavelo Premium es un vino tinto de la cosecha 2017 elaborado con selecta uva monastrell (85%) y una pequeña parte de uva cabernet sauvignon (15%). Su sabor destaca por ser suave en boca, con retrogusto floral y toques de madera. Acabado con un recubrimiento lacrado en bronce y conservado 18 meses en barrica de roble francés. Ideal para acompañar con cualquier tipo de carnes, especialmente carnes rojas, pastas, verduras o quesos curados. Sin duda, un auténtico placer para los paladares más exigentes.</p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> </div>',
		price: 1580,
		imageUrl: '/assets/premium.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'premium-3',
				name: 'Premium',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 3160,
			},
			{
				id: 'premium-6',
				name: 'Premium',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 7900,
			},
			{
				id: 'premium-12',
				name: 'Premium',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 17380,
			},
		],
	},
	vermut: {
		...productDefaults,
		id: 'vermut',
		name: 'Vermut',
		slug: 'vermut',
		tagline: 'Maquiavelo y Pedro Ximénez.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Moscatel y Pedro Ximénez</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Contenido de azúcares</b>: 130g/l de azúcares reductores.</p> </div> <div> <p><b>Descripción</b></p> <p>Vermut Maquiavelo tiene como base el vino Pedro Ximénez, referente en su categoría, dulce y suave mezclado con Moscatel, aromatizado con la mejor selección de notas herbales que dan como resultado este exclusivo Vermut.</p> <p><b>Notas de sabor</b>: De color ámbar brillante, su aroma es una mezcla de olores extraídos de la maceración del vino con los frutos y plantas que dan como resultado un todo homogéneo y constante. Muy agradable al paladar, su sabor es poco ácido, dulce y ligeramente amargo.</p> <p><b>Recomendaciones</b></p> <p>Consumir frío, solo o con hielo, mezclado con zumos de frutas, como arte principal de numerosas recetas de cócteles etc. Excelente aperitivo.</p> <div></div></div>',
		price: 1190,
		imageUrl: '/assets/vermut.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'premium-3',
				name: 'Premium',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 2380,
			},
			{
				id: 'premium-6',
				name: 'Premium',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 5950,
			},
			{
				id: 'premium-12',
				name: 'Premium',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 13090,
			},
		],
	},
	'vermut-citrus': {
		...productDefaults,
		id: 'vermut-citrus',
		name: 'Vermut Citrus',
		slug: 'vermut-citrus',
		tagline: 'Maquiavelo y limones de Murcia.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Moscatel uva blanca</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Ingredientes</b>: Jengibre, canela, salvia seca, clavo, zumo de limón, piel de naranja y de limón, vainas de cardamomo.</p> </div> <div> <p><b>Descripción</b></p> <p>Moscatel uva blanca (vino base procedente de uva moscatel, debido al potencial aromático que aporta esta variedad), puro, añejo, sin más adición que la de infusiones, extractos y aromas de plantas. Estos vinos son típicamente europeos, con un aroma característico que les da una elegancia particular ideal para el aperitivo. Es una bebida tónica, versátil y aromática, se puede consumir de muchas maneras, aunque la mejor sola, con hielo y con un trozo de piel de naranja o de limón. Es uno de los ingredientes más importantes en la coctelería clásica.</p> <p><b>Notas de sabor</b>: Profundo aroma especiado con limón donde destacan notas de clavo y canela que se funden en un elegante amargor final.<br>Con tonos dulces avainillados, balsámicos y tostados; ligero toque de regaliz.<br>Además de su elegante color cobrizo, en boca se pueden sentir también matices de ajenjo, naranja, nuez moscada y quina. Sin duda, toda una experiencia para el paladar.</p> <p><b>Recomendaciones</b></p> <p>Consumir frío, solo o con hielo, mezclado con zumos de frutas, como arte principal de numerosas recetas de cócteles etc. Excelente aperitivo.</p> <div></div></div>',
		price: 1190,
		imageUrl: '/assets/citrus.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'vermut-citrus-3',
				name: 'Vermut Citrus',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 2380,
			},
			{
				id: 'vermut-citrus-6',
				name: 'Vermut Citrus',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 5950,
			},
			{
				id: 'vermut-citrus-12',
				name: 'Vermut Citrus',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 13090,
			},
		],
	},
	'vinas-selectas': {
		...productDefaults,
		id: 'vinas-selectas',
		name: 'Viñas Selectas',
		slug: 'vinas-selectas',
		tagline: 'El vino selecto de Maquiavelo.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell (Viñas Selectas)</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Año</b>: 2019</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Maquiavelo Viñas Selectas es un vino tinto joven de la cosecha 2019 elaborado con uva monastrell de viñas selectas. Un espectáculo de sabores que te dejará con la boca abierta. Cada uva ha sido seleccionada entre las mejores de cada viña y conservado 4 meses en barrica de roble francés. Ideal para acompañar con carnes, especialmente carnes rojas, pastas, verduras, quesos de cualquier tipo o degustar solo. Su mezcla de sabores te hará rememorar viejos recuerdos.</p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div></div></div>',
		price: 775,
		imageUrl: '/assets/vinas.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'vinas-selectas-3',
				name: 'Viñas Selectas',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 1550,
			},
			{
				id: 'vinas-selectas-6',
				name: 'Viñas Selectas',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 3875,
			},
			{
				id: 'vinas-selectas-12',
				name: 'Viñas Selectas',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 8525,
			},
		],
	},
	'ancestral-monastrell-pie-franco': {
		...productDefaults,
		id: 'ancestral-monastrell-pie-franco',
		name: 'Ancestral Monastrell Pie Franco',
		slug: 'ancestral-monastrell-pie-franco',
		tagline: 'Ancestral edición especial monastrell pie franco.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell Pie Franco</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Año</b>: 2019</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Vino seleccionado y escogido para ser embotellado a mano de una edición especial y limitada. Su tipo de elaboración, etiquetado y lacrado manual, hacen que en tus manos sostengas una pieza única procedente de viñedos centenarios.</p> <p><b>Vista</b>: Color picota oscuro con borde granate.<br> <b>Nariz</b>: Muy expresivo y con buena complejidad. Aromas de fruta roja y negra muy madura, casi mermelada, chocolate, especiados, café, recuerdos balsámicos y minerales.<br> <b>Boca</b>: Potencia controlada, sabroso, con la fruta madura predominando sobre las notas tostadas. Combinación de frescos balsámicos con agradables especiados. Taninos pulidos, final largo y gran persistencia.<br></p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div> </div></div>',
		price: 3400,
		imageUrl: '/assets/ancestral_especial.png',
		collectionIds: ['ancestral'],
		variants: [
			{
				id: 'ancestral-monastrell-pie-franco-3',
				name: 'Ancestral Monastrell Pie Franco',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 6800,
			},
			{
				id: 'ancestral-monastrell-pie-franco-6',
				name: 'Ancestral Monastrell Pie Franco',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 17000,
			},
			{
				id: 'ancestral-monastrell-pie-franco-12',
				name: 'Ancestral Monastrell Pie Franco',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 37400,
			},
		],
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
		variants: [
			{
				id: 'ancestral-monastrell-crianza-3',
				name: 'Ancestral Monastrell Crianza',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 3160,
			},
			{
				id: 'ancestral-monastrell-crianza-6',
				name: 'Ancestral Monastrell Crianza',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 7900,
			},
			{
				id: 'ancestral-monastrell-crianza-12',
				name: 'Ancestral Monastrell Crianza',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 17380,
			},
		],
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
		variants: [
			{
				id: 'ancestral-alicante-bouschet-3',
				name: 'Ancestral Alicante bouschet',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 3160,
			},
			{
				id: 'ancestral-alicante-bouschet-6',
				name: 'Ancestral Alicante bouschet',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 7900,
			},
			{
				id: 'ancestral-alicante-bouschet-12',
				name: 'Ancestral Alicante bouschet',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 17380,
			},
		],
	},
	'espumoso-brut': {
		...productDefaults,
		id: 'espumoso-brut',
		name: 'Espumoso Brut',
		slug: 'espumoso-brut',
		tagline: 'Maquiavelo edición especial de vino espumoso brut.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Macabeo</p> <p><b>Graduación</b>: 11% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Vino intenso donde predominan los aromas varietales con un fondo de cítricos y frutas tropicales.</p> <p>Un vino de gran frescura que se muestra agradable y expresivo en boca.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div></div></div>',
		price: 1570,
		imageUrl: '/assets/brut.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-brut-3',
				name: 'Espumoso Brut',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 3140,
			},
			{
				id: 'espumoso-brut-6',
				name: 'Espumoso Brut',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 7850,
			},
			{
				id: 'espumoso-brut-12',
				name: 'Espumoso Brut',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 17270,
			},
		],
	},
	'espumoso-dulce-blanco': {
		...productDefaults,
		id: 'espumoso-dulce-blanco',
		name: 'Espumoso Dulce Blanco',
		slug: 'espumoso-dulce-blanco',
		tagline: 'Maquiavelo edición especial de vino espumoso dulce blanco.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Macabeo</p> <p><b>Graduación</b>: 8% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Bebida aromatizada a base de vino.</p> <p>Fresco, afrutado con un bajo contenido en alcohol, ideal para todo tipo de comidas y eventos.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div></div></div>',
		price: 1190,
		imageUrl: '/assets/sweetgreen.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-dulce-blanco-3',
				name: 'Espumoso Dulce Blanco',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 2380,
			},
			{
				id: 'espumoso-dulce-blanco-6',
				name: 'Espumoso Dulce Blanco',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 5950,
			},
			{
				id: 'espumoso-dulce-blanco-12',
				name: 'Espumoso Dulce Blanco',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 13090,
			},
		],
	},
	'espumoso-dulce-rosado': {
		...productDefaults,
		id: 'espumoso-dulce-rosado',
		name: 'Espumoso Dulce Rosado',
		slug: 'espumoso-dulce-rosado',
		tagline: 'Maquiavelo edición especial de vino espumoso dulce rosado.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Bobal</p> <p><b>Graduación</b>: 8% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Bebida aromatizada a base de vino.</p> <p>Fresco, afrutado con un bajo contenido en alcohol, ideal para todo tipo de comidas y eventos.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div></div></div>',
		price: 1190,
		imageUrl: '/assets/sweetred.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-dulce-rosado-3',
				name: 'Espumoso Dulce Rosado',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 2380,
			},
			{
				id: 'espumoso-dulce-rosado-6',
				name: 'Espumoso Dulce Rosado',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 5950,
			},
			{
				id: 'espumoso-dulce-rosado-12',
				name: 'Espumoso Dulce Rosado',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 13090,
			},
		],
	},
	'espumoso-semiseco': {
		...productDefaults,
		id: 'espumoso-semiseco',
		name: 'Espumoso Semiseco',
		slug: 'espumoso-semiseco',
		tagline: 'Maquiavelo edición especial de vino espumoso semiseco.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Macabeo</p> <p><b>Graduación</b>: 11% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Vino intenso donde predominan los aromas varietales con un fondo de cítricos y frutas tropicales.</p> <p>Un vino de gran frescura que se muestra agradable y expresivo en boca.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p> <div></div></div>',
		price: 1570,
		imageUrl: '/assets/semidry.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-semiseco-3',
				name: 'Espumoso Semiseco',
				stock: 1000,
				options: { Tamaño: 'Pack 3 botellas' },
				priceVariant: 3140,
			},
			{
				id: 'espumoso-semiseco-6',
				name: 'Espumoso Semiseco',
				stock: 1000,
				options: { Tamaño: 'Pack 6 botellas' },
				priceVariant: 7850,
			},
			{
				id: 'espumoso-semiseco-12',
				name: 'Espumoso Semiseco',
				stock: 1000,
				options: { Tamaño: 'Pack 12 botellas' },
				priceVariant: 17270,
			},
		],
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
