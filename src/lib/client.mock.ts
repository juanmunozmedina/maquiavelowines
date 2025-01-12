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
		id: 'BMQ01W',
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

const defaultVariant = {
	id: 'default',
	name: 'Default',
	stock: 200,
	options: {},
};

/*const apparelVariants = ['Pack 3 botellas', 'Pack 6 botellas', 'Pack 12 botellas'].map(
	(size, index) => ({
		id: size,
		name: size,
		stock: index * 10,
		options: {
			Tamaño: size,
		},
		priceVariant: 0,
	}),
);*/

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
			'<div><p><b>Botella</b>: 75 cl.</p><p><b>Tipo de uva</b>: Sauvignon Blanc</p><p><b>Graduación</b>: 12% Alc. Vol.</p><p><b>Año</b>: 2021</p><p><b>Denominación de origen</b>: Jumilla (Protegida)</p></div><div><p><b>Descripción</b></p><p>Maquiavelo ADN Sauvignon Blanc es un vino blanco joven de la cosecha 2021 elaborado en su totalidad con selecta uva sauvignon blanc. Su sabor destaca por ser suave en paladar y con un toque semi seco en boca. Ideal para acompañar con cualquier tipo de pescados, mariscos, verduras, pastas con salsas suaves o incluso para degustar solo plácidamente. Un vino joven para los paladares que no te dejará indiferente.</p><p><b>Recomendaciones</b></p><p>Servir entre 7 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1070,
		imageUrl: '/assets/blanco.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'adn-sauvignon-blanc-3',
				name: 'ADN Sauvignon Blanc Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2140,
			},
			{
				id: 'adn-sauvignon-blanc-6',
				name: 'ADN Sauvignon Blanc Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 5350,
			},
			{
				id: 'adn-sauvignon-blanc-12',
				name: 'ADN Sauvignon Blanc Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Verdejo</p> <p><b>Graduación</b>: 12% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Descripción</b></p> <p>ADN 100% Verdejo. Ideal para acompañar con quesos azules, entrantes, pescados blancos, paella y arroces.</p> <p><b>Vista</b>: Limpio y fresco en que las notas herbáceas se unen a los aromas frutales, como sus matices a hinojo propios de la uva verdejo.<br> <b>Nariz</b>: Potente en nariz y con un largo retrogusto, es un vino ideal para acompañar platos de mar y también para degustar solo.<br> <b>Boca</b>: Vino extremadamente fresco con una vivacidad y prolongada persistencia floral.<br></p> <p><b>Recomendaciones</b></p> <p>Servir entre 7 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1070,
		imageUrl: '/assets/verdejo.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'adn-verdejo-3',
				name: 'ADN Verdejo Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2140,
			},
			{
				id: 'adn-verdejo-6',
				name: 'ADN Verdejo Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 5350,
			},
			{
				id: 'adn-verdejo-12',
				name: 'ADN Verdejo Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Año</b>: 2020</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Maquiavelo Crianza es un tinto de la cosecha 2020 elaborado en su totalidad con selecta uva monastrell. Su sabor destaca por ser muy suave y afrutado en boca. Conservado 12 meses en barrica de roble francés. Ideal para acompañar con cualquier tipo de carnes, pastas, verduras, quesos o incluso para degustar solo plácidamente. Una apuesta segura, un crianza apto para todos los paladares.</p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1180,
		imageUrl: '/assets/crianza.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'crianza-3',
				name: 'Crianza Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2360,
			},
			{
				id: 'crianza-6',
				name: 'Crianza Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 5900,
			},
			{
				id: 'crianza-12',
				name: 'Crianza Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 12980,
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell / Cabernet Sauvignon</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Año</b>: 2017</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Maquiavelo Premium es un vino tinto de la cosecha 2017 elaborado con selecta uva monastrell (85%) y una pequeña parte de uva cabernet sauvignon (15%). Su sabor destaca por ser suave en boca, con retrogusto floral y toques de madera. Acabado con un recubrimiento lacrado en bronce y conservado 18 meses en barrica de roble francés. Ideal para acompañar con cualquier tipo de carnes, especialmente carnes rojas, pastas, verduras o quesos curados. Sin duda, un auténtico placer para los paladares más exigentes.</p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1580,
		imageUrl: '/assets/premium.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'premium-3',
				name: 'Premium Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 3160,
			},
			{
				id: 'premium-6',
				name: 'Premium Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 7900,
			},
			{
				id: 'premium-12',
				name: 'Premium Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Moscatel y Pedro Ximénez</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Contenido de azúcares</b>: 130g/l de azúcares reductores.</p> </div> <div> <p><b>Descripción</b></p> <p>Vermut Maquiavelo tiene como base el vino Pedro Ximénez, referente en su categoría, dulce y suave mezclado con Moscatel, aromatizado con la mejor selección de notas herbales que dan como resultado este exclusivo Vermut.</p> <p><b>Notas de sabor</b>: De color ámbar brillante, su aroma es una mezcla de olores extraídos de la maceración del vino con los frutos y plantas que dan como resultado un todo homogéneo y constante. Muy agradable al paladar, su sabor es poco ácido, dulce y ligeramente amargo.</p> <p><b>Recomendaciones</b></p> <p>Consumir frío, solo o con hielo, mezclado con zumos de frutas, como arte principal de numerosas recetas de cócteles etc. Excelente aperitivo.</p></div>',
		price: 1190,
		imageUrl: '/assets/vermut.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'vermut-3',
				name: 'Vermut Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2380,
			},
			{
				id: 'vermut-6',
				name: 'Vermut Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 5950,
			},
			{
				id: 'vermut-12',
				name: 'Vermut Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Moscatel uva blanca</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Ingredientes</b>: Jengibre, canela, salvia seca, clavo, zumo de limón, piel de naranja y de limón, vainas de cardamomo.</p> </div> <div> <p><b>Descripción</b></p> <p>Moscatel uva blanca (vino base procedente de uva moscatel, debido al potencial aromático que aporta esta variedad), puro, añejo, sin más adición que la de infusiones, extractos y aromas de plantas. Estos vinos son típicamente europeos, con un aroma característico que les da una elegancia particular ideal para el aperitivo. Es una bebida tónica, versátil y aromática, se puede consumir de muchas maneras, aunque la mejor sola, con hielo y con un trozo de piel de naranja o de limón. Es uno de los ingredientes más importantes en la coctelería clásica.</p> <p><b>Notas de sabor</b>: Profundo aroma especiado con limón donde destacan notas de clavo y canela que se funden en un elegante amargor final.<br>Con tonos dulces avainillados, balsámicos y tostados; ligero toque de regaliz.<br>Además de su elegante color cobrizo, en boca se pueden sentir también matices de ajenjo, naranja, nuez moscada y quina. Sin duda, toda una experiencia para el paladar.</p> <p><b>Recomendaciones</b></p> <p>Consumir frío, solo o con hielo, mezclado con zumos de frutas, como arte principal de numerosas recetas de cócteles etc. Excelente aperitivo.</p></div>',
		price: 1190,
		imageUrl: '/assets/citrus.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'vermut-citrus-3',
				name: 'Vermut Citrus Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2380,
			},
			{
				id: 'vermut-citrus-6',
				name: 'Vermut Citrus Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 5950,
			},
			{
				id: 'vermut-citrus-12',
				name: 'Vermut Citrus Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell (Viñas Selectas)</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Año</b>: 2019</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Maquiavelo Viñas Selectas es un vino tinto joven de la cosecha 2019 elaborado con uva monastrell de viñas selectas. Un espectáculo de sabores que te dejará con la boca abierta. Cada uva ha sido seleccionada entre las mejores de cada viña y conservado 4 meses en barrica de roble francés. Ideal para acompañar con carnes, especialmente carnes rojas, pastas, verduras, quesos de cualquier tipo o degustar solo. Su mezcla de sabores te hará rememorar viejos recuerdos.</p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 775,
		imageUrl: '/assets/vinas.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'vinas-selectas-3',
				name: 'Viñas Selectas Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 1550,
			},
			{
				id: 'vinas-selectas-6',
				name: 'Viñas Selectas Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 3875,
			},
			{
				id: 'vinas-selectas-12',
				name: 'Viñas Selectas Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell Pie Franco</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Año</b>: 2019</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Descripción</b></p> <p>Vino seleccionado y escogido para ser embotellado a mano de una edición especial y limitada. Su tipo de elaboración, etiquetado y lacrado manual, hacen que en tus manos sostengas una pieza única procedente de viñedos centenarios.</p> <p><b>Vista</b>: Color picota oscuro con borde granate.<br> <b>Nariz</b>: Muy expresivo y con buena complejidad. Aromas de fruta roja y negra muy madura, casi mermelada, chocolate, especiados, café, recuerdos balsámicos y minerales.<br> <b>Boca</b>: Potencia controlada, sabroso, con la fruta madura predominando sobre las notas tostadas. Combinación de frescos balsámicos con agradables especiados. Taninos pulidos, final largo y gran persistencia.<br></p> <p><b>Recomendaciones</b></p> <p>Servir entre 16 y 18°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 3400,
		imageUrl: '/assets/ancestral_especial.png',
		collectionIds: ['ancestral'],
		variants: [
			{
				id: 'ancestral-monastrell-pie-franco-3',
				name: 'Ancestral Monastrell Pie Franco Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 6800,
			},
			{
				id: 'ancestral-monastrell-pie-franco-6',
				name: 'Ancestral Monastrell Pie Franco Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 17000,
			},
			{
				id: 'ancestral-monastrell-pie-franco-12',
				name: 'Ancestral Monastrell Pie Franco Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Monastrell Crianza</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Sub-zona</b>: Valle de la Flor</p> <p><b>Denominación de origen</b>: Jumilla (Protegida)</p> </div> <div> <p><b>Color</b>: Color cereza con borde violáceo.</p> <p><b>Bouquet</b></p> <p><b>Nariz</b>: En esta fase se muestra equilibrado, con aromas a fruta roja y hierbas silvestres.<br> <b>Boca:</b> Tinto sabroso y fácil de beber con una marcada sensación a fruta madura.</p> <p><b>Maridaje y consumo</b></p> <p>Ideal para acompañar, carnes de vacuno, caza y quesos fuertes curados.</br>Las proteínas de la carne y los taninos del vino hacen una perfecta sinergia dentro de la boca.</br>Vino seleccionado y escogido para ser embotellado a mano en una edición especial y limitada. Su tipo de elaboración, etiquetado y lacrado manual, hacen que en tus manos sostengas una pieza única procedente de viñedos centenarios.</p> <p><b>Altitud</b></p> <p>735 mts.</p> <p><b>Recomendaciones</b></p> <p>Recomendamos consumir este vino crianza en los diez años posteriores a su cosecha siendo la temperatura de servicio óptimo entre 16-18°C.</p> <p><b>Viñedos</b></p> <p>La vendimia se lleva a cabo a finales de septiembre y los racimos se transportan en contenedores de 1.500 kg. Después de un cuidadoso despalillado, la fermentación se realiza con levaduras naturales en depósitos de acero inoxidable a una temperatura controlada entre 24 y 27°C.</br>Para nuestro vino Ancestral se cuidan todos los detalles desde la brotación del viñedo hasta la recolección. Viñedos con una antigüedad mínima de 30 años. La vendimia se realiza en cajones de 200 kgs con una rigurosa selección en la entrada en bodega.</p> <p><b>Elaboración</b></p> <p>La Monastrell envejece durante 12 meses en barricas de roble francés y americano antes de su comercialización. Este tinto destaca por su perfil frutal y suave, y es una excelente representación del estilo de la bodega de vinos ligeros y finos.</p> <p><b>Envejecimiento en barrica</b></p> <p>Nuestro Ancestral Crianza Monastrell envejece durante 12 meses en barricas de roble francés y americano antes de su comercialización. Este tinto destaca por su perfil frutal y suave, y es una excelente representación del estilo de la bodega de vinos ligeros y finos.</p> <p><b>Enólogo</b></p> <p>Seleccionado por Fernando Galvañ, winemaker.</p> </div>',
		price: 1290,
		imageUrl: '/assets/ancestral_crianza.png',
		collectionIds: ['ancestral'],
		variants: [
			{
				id: 'ancestral-monastrell-crianza-3',
				name: 'Ancestral Monastrell Crianza Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2580,
			},
			{
				id: 'ancestral-monastrell-crianza-6',
				name: 'Ancestral Monastrell Crianza Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 6450,
			},
			{
				id: 'ancestral-monastrell-crianza-12',
				name: 'Ancestral Monastrell Crianza Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 14190,
			},
		],
	},
	'ancestral-alicante-bouschet': {
		...productDefaults,
		id: 'ancestral-alicante-bouschet',
		name: 'Ancestral Alicante bouschet',
		slug: 'ancestral-alicante-bouschet',
		tagline: 'Ancestral edición especial Alicante bouschet.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Garnacha Tintorera</p> <p><b>Graduación</b>: 15% Alc. Vol.</p> <p><b>Sub-zona</b>: Paraje de la Fuente la Negra</p> <p><b>Denominación de origen</b>: Varietal CLM Yecla & Fuente Álamo</p> </div> <div> <p><b>Color</b>: Limpio en fase visual de color rubí con alta capa de color.</p> <p><b>Bouquet</b></p> <p><b>Nariz</b>: Predominan los aromas de la Garnacha Tintorera muy madura, pomelo, pastel de higos, grosella y moras negras, mezclados con las notas balsámicas y ahumada de la crianza.<br> <b>Boca:</b> De entrada dulce, el equilibrio entre acidez y tanicidad acentúa su persistencia, la fuerza de la Garnacha Tintorera es patente y su final torrefacto lo hacen un vino largo, la sensación final es un complejo recuerdo de frutas rojas del bosque mezclado con toques de vainilla, café y tabaco.</p> <p><b>Descripción</b></p> <p>Vino seleccionado y escogido para ser embotellado a mano en una edición especial y limitada. Su tipo de elaboración, etiquetado y lacrado manual, hacen que en tus manos sostengas una pieza única procedente de viñedos centenarios.</p> <p><b>Maridaje y consumo</b></p> <p>Ideal para acompañar, carnes de vacuno, caza y quesos fuertes curados.</br>Las proteínas de la carne y los taninos del vino hacen una perfecta sinergia dentro de la boca.</p> <p><b>Altitud</b></p> <p>735 mts.</p> <p><b>Recomendaciones</b></p> <p>Recomendamos consumir este vino crianza en los diez años posteriores a su cosecha siendo la temperatura de servicio óptimo entre 16-18°C.</p> <p><b>Viñedos</b></p> <p>Los viñedos para la elaboración de nuestros embotellados son estrictamente seleccionados por nuestro equipo técnico, edad, bajo rendimiento y sanidad del viñedo así como parámetros físico-químicos de la uva son directrices en la búsqueda de la máxima calidad.</br>Para nuestro vino estrella se cuidan todos los detalles desde la brotación del viñedo hasta la recolección. Viñedos con una antigüedad mínima de 30 años. La vendimia se realiza en cajones de 200 kgs con una rigurosa selección en la entrada en bodega.</p> <p><b>Elaboración</b></p> <p>Vino elaborado a partir de Garnacha Tintorera "Alicante Bouschet".</br>La vinificación se realizó de modo tradicional con despalillado de uva, en depósitos de acero inoxidable con inyección de aire/nitrogeno. La temperatura de fermentación estuvo alrededor de 28°C, con un tiempo en contacto entre pieles y mosto de 10 días.</p> <p><b>Envejecimiento en barrica</b></p> <p>La fermentación maloláctica se realiza en una selección de barricas nuevas de roble francés de 500 litros de grano muy fino. Para permanecer en ellas un tiempo mínimo de 8 meses +8 meses en Guarda Botella, terminando el proceso con una ligera clarificación y estabilización por frío.</p> <p><b>Enólogo</b></p> <p>Seleccionado por Fernando Galvañ, winemaker.</p> </div>',
		price: 1590,
		imageUrl: '/assets/ancestral_bouschet.png',
		collectionIds: ['ancestral'],
		variants: [
			{
				id: 'ancestral-alicante-bouschet-3',
				name: 'Ancestral Alicante bouschet Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 3180,
			},
			{
				id: 'ancestral-alicante-bouschet-6',
				name: 'Ancestral Alicante bouschet Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 7950,
			},
			{
				id: 'ancestral-alicante-bouschet-12',
				name: 'Ancestral Alicante bouschet Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 17490,
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Macabeo</p> <p><b>Graduación</b>: 11% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Vino intenso donde predominan los aromas varietales con un fondo de cítricos y frutas tropicales.</p> <p>Un vino de gran frescura que se muestra agradable y expresivo en boca.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1570,
		imageUrl: '/assets/brut.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-brut-3',
				name: 'Espumoso Brut Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 3140,
			},
			{
				id: 'espumoso-brut-6',
				name: 'Espumoso Brut Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 7850,
			},
			{
				id: 'espumoso-brut-12',
				name: 'Espumoso Brut Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Macabeo</p> <p><b>Graduación</b>: 8% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Bebida aromatizada a base de vino.</p> <p>Fresco, afrutado con un bajo contenido en alcohol, ideal para todo tipo de comidas y eventos.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1190,
		imageUrl: '/assets/sweetgreen.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-dulce-blanco-3',
				name: 'Espumoso Dulce Blanco Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2380,
			},
			{
				id: 'espumoso-dulce-blanco-6',
				name: 'Espumoso Dulce Blanco Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 5950,
			},
			{
				id: 'espumoso-dulce-blanco-12',
				name: 'Espumoso Dulce Blanco Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Bobal</p> <p><b>Graduación</b>: 8% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Bebida aromatizada a base de vino.</p> <p>Fresco, afrutado con un bajo contenido en alcohol, ideal para todo tipo de comidas y eventos.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1190,
		imageUrl: '/assets/sweetred.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-dulce-rosado-3',
				name: 'Espumoso Dulce Rosado Pack 3 botellas',
				stock: 0,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 2380,
			},
			{
				id: 'espumoso-dulce-rosado-6',
				name: 'Espumoso Dulce Rosado Pack 6 botellas',
				stock: 0,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 5950,
			},
			{
				id: 'espumoso-dulce-rosado-12',
				name: 'Espumoso Dulce Rosado Pack 12 botellas',
				stock: 0,
				options: { Tamaño: 'Pack 12' },
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
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Macabeo</p> <p><b>Graduación</b>: 11% Alc. Vol.</p> <p><b>Año</b>: 2023</p> </div> <div> <p><b>Nota de cata</b></p> <p>Vino intenso donde predominan los aromas varietales con un fondo de cítricos y frutas tropicales.</p> <p>Un vino de gran frescura que se muestra agradable y expresivo en boca.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1570,
		imageUrl: '/assets/semidry.png',
		collectionIds: ['centhaurus'],
		variants: [
			{
				id: 'espumoso-semiseco-3',
				name: 'Espumoso Semiseco Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 3140,
			},
			{
				id: 'espumoso-semiseco-6',
				name: 'Espumoso Semiseco Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 7850,
			},
			{
				id: 'espumoso-semiseco-12',
				name: 'Espumoso Semiseco Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 17270,
			},
		],
	},
	'brut-rose-excellence-espumoso': {
		...productDefaults,
		id: 'brut-rose-excellence-espumoso',
		name: 'Brut Rosé Excellence Espumoso',
		slug: 'brut-rose-excellence-espumoso',
		tagline: 'Maquiavelo edición especial de vino espumoso brut rosé excellence.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Viura / Airen / Chardonay</p> <p><b>Graduación</b>: 11% Alc. Vol.</p> <p><b>Región</b>: Yecla</p> </div> <div> <p><b>Descripción</b></p> <p>Método tradicional champanoise. Baja intervención carbónica y sin azúcar añadido.</p> <p><b>Vista</b></p> <p>Rosado claro / Reflejos dorados / Numerosas burbujas / Suave espuma</p> <p><b>Nariz</b></p> <p>Aromas frutales amarillas / Frutos secos</p> <p><b>Boca</b></p> <p>Elegante / Buen equilibrio / Agradable / Ligera / Refrescante</p> <p><b>Maridajes</b></p> <p>Solo o con aperitivos. Productos del mar y carnes blancas.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1590,
		imageUrl: '/assets/brut_rose_excellence.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'brut-rose-excellence-espumoso-3',
				name: 'Brut Rosé Excellence Espumoso Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 3180,
			},
			{
				id: 'brut-rose-excellence-espumoso-6',
				name: 'Brut Rosé Excellence Espumoso Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 7950,
			},
			{
				id: 'brut-rose-excellence-espumoso-12',
				name: 'Brut Rosé Excellence Espumoso Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 17490,
			},
		],
	},
	'brut-excellence-espumoso': {
		...productDefaults,
		id: 'brut-excellence-espumoso',
		name: 'Brut Excellence Espumoso',
		slug: 'brut-excellence-espumoso',
		tagline: 'Maquiavelo edición especial de vino espumoso brut excellence.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Viura / Airen / Chardonay</p> <p><b>Graduación</b>: 11% Alc. Vol.</p> <p><b>Región</b>: Yecla</p> </div> <div> <p><b>Descripción</b></p> <p>Método tradicional champanoise. Baja intervención carbónica y sin azúcar añadido.</p> <p><b>Vista</b></p> <p>Amarillo claro / Reflejos dorados / Numerosas burbujas / Suave espuma</p> <p><b>Nariz</b></p> <p>Aromas frutales amarillas / Frutos secos</p> <p><b>Boca</b></p> <p>Elegante / Buen equilibrio / Agradable / Ligera / Refrescante</p> <p><b>Maridajes</b></p> <p>Productos del mar y carnes blancas.</p> <p><b>Recomendaciones</b></p> <p>Degustar entre 8 y 10°C. Conservar en posición horizontal. Una vez abierto, consumir preferentemente en un máximo de 2/3 días y tapar con el propio corcho.</p></div>',
		price: 1590,
		imageUrl: '/assets/brut_excellence.png',
		collectionIds: ['maquiavelo'],
		variants: [
			{
				id: 'brut-excellence-espumoso-3',
				name: 'Brut Excellence Espumoso Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 3180,
			},
			{
				id: 'brut-excellence-espumoso-6',
				name: 'Brut Excellence Espumoso Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 7950,
			},
			{
				id: 'brut-excellence-espumoso-12',
				name: 'Brut Excellence Espumoso Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 17490,
			},
		],
	},
	'ancestral-petit-verdot': {
		...productDefaults,
		id: 'ancestral-petit-verdot',
		name: 'Ancestral Petit Verdot',
		slug: 'ancestral-petit-verdot',
		tagline: 'Ancestral edición especial petit verdot.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Petit Verdot</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Denominación de origen</b>: Varietal CLM Yecla & Fuente Álamo</p> </div> <div> <p><b>Elaboración</b>: Se sitúa en la gama más alta de los vinos Ancestral.</br>Seleccionado por Fernando Galvañ, winemaker.</br>Este vino ha sido elaborado a través de una cuidadosa selección de uvas Petit Verdot, procedente de nuestras mejores viñas, y recolectado manualmente en su momento óptimo de maduración.</br>Elaborado con una prolongada maceración, manteniendo la temperatura de fermentación entre 23ºC y 25ºC.</br>Madurado en barricas nuevas de roble americano durante 18-20 meses.</p> <p><b>Maridaje</b>: Acompañar con embutidos y quesos curados, carne roja y blanca, guisos, asados y estofados.</p> <p><b>Servicio:</b> Entre 16º-18ºC.</p> <p><b>Nota de cata</b>: Color guinda picota muy intenso, intensas sensaciones de aromas a fruta negra madura (mermelada) finos tostados de madera bien integrada y balsámicos.</br>En boca es potente con una acidez correcta, goloso y bien estructurado.</p> </div>',
		price: 2400,
		imageUrl: '/assets/ancestral_verdot.png',
		collectionIds: ['ancestral'],
		variants: [
			{
				id: 'ancestral-petit-verdot-3',
				name: 'Ancestral Petit Verdot Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 4800,
			},
			{
				id: 'ancestral-petit-verdot-6',
				name: 'Ancestral Petit Verdot Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 12000,
			},
			{
				id: 'ancestral-petit-verdot-12',
				name: 'Ancestral Petit Verdot Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 26400,
			},
		],
	},
	'ancestral-cabernet': {
		...productDefaults,
		id: 'ancestral-cabernet',
		name: 'Ancestral Cabernet',
		slug: 'ancestral-cabernet',
		tagline: 'Ancestral edición especial cabernet.',
		description:
			'<div> <p><b>Botella</b>: 75 cl.</p> <p><b>Tipo de uva</b>: Cabernet Sauvignon</p> <p><b>Graduación</b>: 14% Alc. Vol.</p> <p><b>Denominación de origen</b>: Varietal CLM Yecla & Fuente Álamo</p> </div> <div> <p><b>Descripción</b>: De viñedos de más de 30 años situados a 735m. de altitud.</br>Seleccionado por Fernando Galvañ, winemaker.</p> <p><b>Vinificación</b></p> <p>Las uvas vendimiadas en su momento óptimo de maduración son despalilladas y sometidas a una maceración prefermentativa a 10 ºC para obtener mayor complejidad aromática. La fermentación y maceración tiene una duración de 14 días a una temperatura no superior a 25ºC, para potenciar las características varietales del vino. Tras la fermentación maloláctica, el vino permanece en barricas de roble francés y roble americano entre 18 meses para su crianza y redondez en sótano climatizado.</p> <p>Clarificación y filtración antes del embotellado, con posterior crianza durante un mínimo de 3 meses en botella para redondear y mantener el bouquet y características de este vino, en almacén climatizado entre 15 - 18 ºC.</p> <p><b>Nota de cata</b></p> <p>Intenso color rojo cereza. Afrutado y especiado, con toques minerales. En boca resulta suave y equilibrado.</p> <p><b>Temperatura</b></p> <p>Temperatura de servicio entre 14 y 16 ºC.</p> <p><b>Maridaje</b></p> <p>Ideal para acompañar con carnes, asados y quesos curados.</p> </div>',
		price: 1900,
		imageUrl: '/assets/ancestral_cabernet.png',
		collectionIds: ['ancestral'],
		variants: [
			{
				id: 'ancestral-cabernet-3',
				name: 'Ancestral Cabernet Pack 3 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 3' },
				priceVariant: 3800,
			},
			{
				id: 'ancestral-cabernet-6',
				name: 'Ancestral Cabernet Pack 6 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 6' },
				priceVariant: 9500,
			},
			{
				id: 'ancestral-cabernet-12',
				name: 'Ancestral Cabernet Pack 12 botellas',
				stock: 1000,
				options: { Tamaño: 'Pack 12' },
				priceVariant: 20900,
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
