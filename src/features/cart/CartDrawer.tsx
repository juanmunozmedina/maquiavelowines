import { createQuery } from '@tanstack/solid-query';
import { Show } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { Drawer } from '~/components/ui/Drawer.tsx';
import { CartSummary } from '~/features/cart/CartSummary.tsx';
import { cartQueryOptions } from '~/features/cart/cart.queries.ts';
import { queryClient } from '~/lib/query.ts';
import { CartButton } from './CartButton.tsx';
import { CartStore } from './store.ts';

export function CartDrawer() {
	const query = createQuery(
		() => cartQueryOptions(),
		() => queryClient,
	);

	const subtotal = () =>
	query.data.items.reduce(
		(total, item) =>
			total +
			(item.productVariant.product.price +
				item.productVariant.priceVariant -
				(item.productVariant.product.discount ?? 0)) *
				item.quantity,
		0,
	);

	return (
		<Drawer
			title="Carrito"
			open={CartStore.drawerOpen}
			onOpenChange={CartStore.setDrawerOpen}
			trigger={<CartButton as="div" />}
		>
			<div class="flex h-full flex-col py-4">
				<CartSummary />
				<Show when={subtotal() / 100 >= 60}>
					<form method="post" action="/api/checkout" class="contents" data-astro-reload>
						<Button type="submit">Verificar</Button>
					</form>
				</Show>
				<Show when={subtotal() / 100 < 60}>
					<aside class="mt-3 text-balance text-center text-sm font-medium text-theme-base-500">
						El pedido mínimo para el envío es de 60€.
					</aside>
				</Show>
			</div>
		</Drawer>
	);
}
