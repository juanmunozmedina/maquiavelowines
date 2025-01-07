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
					<Button disabled type="submit">
						El pedido mínimo para el envío es de 60€
					</Button>
				</Show>
			</div>
		</Drawer>
	);
}
