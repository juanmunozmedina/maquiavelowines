# Tienda online (Bodegas Maquiavelo)

Su escaparate merece el mejor rendimiento de su clase sin la curva de aprendizaje.

Astro ha pasado años construyendo las bases adecuadas para sitios web basados ​​en contenido y, naturalmente, el comercio electrónico es la próxima frontera. Este repositorio muestra las funciones principales que nuestra comunidad utiliza para realizar envíos con confianza:

- [Arquitectura de islas](https://docs.astro.build/en/concepts/islands/) con [SolidJS](https://docs.astro.build/en/guides/integrations-guide/solid-js/) para obtener el menor coste de tiempo de ejecución posible.
- [Renderizado bajo demanda](https://docs.astro.build/en/guides/server-side-rendering/) con almacenamiento en caché CDN para entregar páginas a la velocidad de HTML.
- [`astro:actions`](https://docs.astro.build/en/guides/actions/) para crear puntos finales simples y con seguridad de tipos para administrar la sesión del usuario.
- [`astro:assets`](https://docs.astro.build/en/guides/images/#image--astroassets) para optimización de imágenes bajo demanda. Respaldado por Netlify CDN, Sharp o su proveedor de imágenes favorito.
- [`astro:env`](https://docs.astro.build/en/reference/configuration-reference/#experimentalenv) para gestión de variables de entorno y seguridad de tipos.

Astro Storefront impulsa [maquiavelowines.com](https://maquiavelowines.com) hoy, y nuestra elección de servicios y bibliotecas testarudas lo refleja. Esperamos que este repositorio sea el comienzo de una nueva plataforma para satisfacer las necesidades de su tienda.

## Estructura del proyecto

Los directorios principales del proyecto se describen a continuación:

```sh
├── public/
├── src/
│   └── actions/
│   └── components/
│       └── ui/
│   └── features/
│   └── pages/
└── package.json
```

`actions/` contiene funciones de backend llamadas desde el cliente para administrar el carrito de un cliente. Estos se denominan del lado del cliente y están respaldados por actualizaciones optimistas.

`components/ui/` contiene componentes reutilizables para elementos comunes de la interfaz de usuario, incluidos botones, cajones y entradas. Estos se prueban para cumplir con las pautas de accesibilidad modernas.

`features/` contiene componentes específicos del dominio y administración del estado, organizados por conceptos comunes de comercio electrónico:

- `product/`: se utiliza en la página de destino del producto (PDP) y en los carruseles de recomendaciones.
- `collection/`: se utiliza para mostrar colecciones de productos con lógica de clasificación.
- `cart/`: se utiliza para administrar el menú desplegable del carrito y el estado relacionado del lado del cliente.

`pages/` contiene rutas basadas en archivos para su escaparate.

- `pages/api/` gestiona el pago del cliente mediante Stripe.
- `pages/orders/` muestra el recibo del cliente en caso de pago exitoso.
- `pages/collections/` muestra colecciones de productos con filtrado dinámico.
- `pages/*` muestra todas las demás rutas de nivel base.

## Servicios

Este repositorio se conecta a servicios relacionados para impulsar pagos, correos electrónicos e incrustaciones de mapas. Visite el archivo [`astro.config.ts`](https://github.com/juanmunozmedina/maquiavelowines/blob/main/astro.config.ts) para obtener una descripción general de todas las variables de entorno y los permisos de acceso necesarios para cada una.

Le invitamos a cambiar o eliminar por completo cualquiera de estos servicios para satisfacer sus necesidades.

### API de escaparate

[maquiavelowines.com](https://maquiavelowines.com) utiliza una API personalizada para gestionar productos y gestionar pedidos.

Este cliente no está disponible para uso público hoy, aunque proporcionamos una versión "simulada" de todas las funciones API en `src/lib/client.mock.ts`. Recomendamos utilizar este archivo como una forma de estandarizar las solicitudes para el proveedor de comercio electrónico de su elección.

Para usar la API simulada, actualice la entrada [`tsconfig.json`](https://github.com/juanmunozmedina/maquiavelowines/blob/main/tsconfig.json) para el módulo `storefront:client`:

```diff
{
	"compilerOptions": {
		"paths": {
			"~/*": ["./src/*"],
-			"storefront:client": ["./src/lib/client.ts"]
+			"storefront:client": ["./src/lib/client.mock.ts"]
		},
	}
}
```

### Stripe

[La API de Stripe](https://docs.stripe.com/api) se utiliza para aceptar pagos y gestionar el flujo de pago.

#### Variables de entorno

- `STRIPE_SECRET_KEY`: una clave API de Stripe [utilizada para autenticar solicitudes] (https://docs.stripe.com/keys).

### Bucles

[Loops.so](https://loops.so/) es un servicio de envío de correo electrónico que se utiliza para enviar un correo electrónico de confirmación al cliente después de realizar el pago correctamente.

#### Variables de entorno

- `LOOPS_API_KEY`: una clave API de Loops [generada a través de su consola de administración] (https://loops.so/docs/api-reference/intro).
- `LOOPS_SHOP_TRANSACTIONAL_ID`: el ID de un [correo electrónico de transacción de Loops](https://loops.so/docs/transactional/guide) para enviar a un cliente cuando se realiza un pedido. Consulte `src/lib/emails.ts` para obtener datos de plantillas de correo electrónico relacionados.
- `LOOPS_FULFILLMENT_TRANSACTIONAL_ID`: el ID de un [correo electrónico de transacción de Loops](https://loops.so/docs/transactional/guide) que se enviará a _usted_ (el vendedor) para el cumplimiento del pedido. Consulte `src/lib/emails.ts` para obtener datos de plantillas de correo electrónico relacionados.
- `LOOPS_FULFILLMENT_EMAIL`: la dirección de correo electrónico del vendedor para recibir un recibo de cumplimiento.

### Google Maps

[La plataforma Google Maps](https://developers.google.com/maps) se utiliza para insertar un mapa con la dirección de envío del cliente en la página de detalles del pedido.

#### Variables de entorno

- `GOOGLE_GEOLOCATION_SERVER_KEY`: una clave API de Google con permisos para utilizar la API de geolocalización. Esta clave solo se usa en el lado del servidor y se puede [crear con una restricción de aplicación de dirección IP](https://developers.google.com/maps/api-security-best-practices#restricting-api-keys).
- `GOOGLE_MAPS_BROWSER_KEY`: una clave API de Google con permisos para utilizar la "API de JavaScript de Maps". Esta clave está **disponible públicamente en el cliente** y debe [crearse con una restricción de aplicación del sitio web](https://developers.google.com/maps/api-security-best-practices#restricting-api-keys) para permitir solo el acceso desde la URL de implementación de su proyecto.

## Comandos

Este proyecto utiliza [pnpm](https://pnpm.io/) para gestionar las dependencias. Asegúrese de instalar esta herramienta y luego ejecute los comandos de inicio desde su terminal:

| Command             | Action                                               |
| :------------------ | :--------------------------------------------------- |
| `pnpm install`      | Instala dependencias                                 |
| `pnpm dev`          | Inicia el servidor de desarrollo local               |
| `pnpm build`        | Construya su sitio de producción para `./dist/`      |
| `pnpm astro ...`    | Ejecute comandos CLI como `astro add`, `astro check` |
| `pnpm astro --help` | Obtenga ayuda para usar Astro CLI                    |
