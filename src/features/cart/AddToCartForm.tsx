import { actions } from 'astro:actions';
import type { LineItemInput, Product } from 'storefront:client';
import { createMutation } from '@tanstack/solid-query';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import { RiSystemCheckLine } from 'solid-icons/ri';
import { For, Match, Show, Switch, createEffect, createSignal, onCleanup } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { NumberInput } from '~/components/ui/NumberInput.tsx';
import { queryClient } from '~/lib/query.ts';
import { CartStore } from './store.ts';
import 'photoswipe/style.css';

export function AddToCartForm(props: { product: Product }) {
	const [selectedOptions, setSelectedOptions] = createSignal<Record<string, string>>({});
	const quantity = () => 1;
	const [unpickedVariantVisible, setUnpickedVariantVisible] = createSignal(false);

	// Initialize lightbox for medals
	let lightbox: PhotoSwipeLightbox;
	createEffect(() => {
		if (props.product.medal && props.product.medal.length > 0) {
			lightbox = new PhotoSwipeLightbox({
				gallery: '#medals',
				children: 'a',
				initialZoomLevel: 0.6,
				secondaryZoomLevel: 0.6,
				maxZoomLevel: 0.6,
				pswpModule: () => import('photoswipe'),
			});
			lightbox.init();
		}
	});
	onCleanup(() => lightbox?.destroy());

	createEffect(() => {
		// sometimes, the browser will pre-check an option if it was previously selected before a refresh,
		// so we'll look for checked inputs and select the corresponding variant
		for (const input of document.querySelectorAll('[data-product-option]')) {
			if (!(input instanceof HTMLInputElement)) continue;
			if (!input.checked) continue;

			const { productOption, productOptionValue } = input.dataset;
			if (!productOption || !productOptionValue) {
				continue;
			}

			setSelectedOptions((options) => ({
				...options,
				[productOption]: productOptionValue,
			}));
		}
	});

	const selectedVariant = () =>
		props.product.variants.find((variant) =>
			// this could just be isEqual but y'all decided lodash is evil and I'm lazy
			Object.entries(selectedOptions()).every(([key, value]) => variant.options[key] === value),
		);

	const mutation = createMutation(
		() => ({
			mutationKey: ['cart', 'items', 'add', props.product.id],
			mutationFn: async (input: LineItemInput) => {
				return await actions.cart.addItems.orThrow(input);
			},
			// we explicitly don't want an optimistic update here,
			// because we want to make sure the mutation succeeded
			// before showing the cart drawer or doing anything else
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				CartStore.openDrawer();
			},
		}),
		() => queryClient,
	);

	const productOptionValues = () => {
		const result = new Map<string, Set<string>>();
		for (const variant of props.product.variants) {
			for (const [option, value] of Object.entries(variant.options)) {
				const values = result.get(option) ?? new Set();
				values.add(value);
				result.set(option, values);
			}
		}
		return result;
	};

	return (
		<form
			class="grid gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				const productVariant = selectedVariant();
				if (productVariant) {
					mutation.mutate({ productVariantId: productVariant.id, quantity: quantity() });
				} else {
					setUnpickedVariantVisible(true);
				}
			}}
		>
			<Show when={props.product.medal && props.product.medal.length > 0}>
				<fieldset id="medals">
					<legend class="mb-2 text-slate-700 dark:text-theme-base-100">Medallas</legend>
					<ul class="inline-flex gap-2">
						<For each={props.product.medal}>
							{(url, i) =>
								url ? (
									<li>
										<a
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											ref={(el) => {
												const img = el.querySelector('img');
												if (img) {
													el.dataset.pswpWidth = img.naturalWidth.toString();
													el.dataset.pswpHeight = img.naturalHeight.toString();
												}
											}}
										>
											<img
												alt={`Medalla ${i() + 1}`}
												width="64"
												height="64"
												src={url}
												onLoad={(e) => {
													const img = e.currentTarget;
													const parent = img.parentElement;
													if (parent) {
														parent.dataset.pswpWidth = img.naturalWidth.toString();
														parent.dataset.pswpHeight = img.naturalHeight.toString();
													}
												}}
											/>
										</a>
									</li>
								) : null
							}
						</For>
					</ul>
				</fieldset>
			</Show>

			<Show when={props.product.variants.length > 1}>
				<For each={[...productOptionValues().entries()]}>
					{([option, values]) => (
						<fieldset>
							<legend class="mb-1 text-slate-700 dark:text-theme-base-100">
								{option ?? 'Variants'}
							</legend>
							<Show when={unpickedVariantVisible() && !selectedVariant()}>
								<p role="alert" class="mb-2 text-sm text-red-400">
									Por favor haga una selección.
								</p>
							</Show>
							<div class="flex flex-wrap gap-2">
								<For each={[...values]}>
									{(value) => (
										<label class="flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 border border-slate-300 bg-slate-100 px-3 text-center text-sm text-slate-600 transition hover:border-slate-500 has-[:checked]:border-slate-900 has-[:checked]:text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-theme-base-100 dark:hover:border-slate-600 dark:has-[:checked]:border-slate-300 dark:has-[:checked]:text-slate-300">
											<input
												type="radio"
												value={value}
												class="peer sr-only"
												checked={selectedOptions()[option] === value}
												onChange={() => {
													setSelectedOptions((options) => ({
														...options,
														[option]: value,
													}));
												}}
												data-product-option={option}
												data-product-option-value={value}
											/>
											<div>{value}</div>
											<RiSystemCheckLine class="hidden peer-checked:block" />
										</label>
									)}
								</For>
							</div>
						</fieldset>
					)}
				</For>
			</Show>

			<div class="mb-2 hidden">
				<label for="quantity" class="mb-2 block text-slate-700 dark:text-theme-base-100">
					Cantidad
				</label>
				<NumberInput id="quantity" value={quantity()} />
			</div>
			<div class="sticky bottom-0 mb-8 grid h-12 items-center gap-2 bg-white dark:bg-maquiavelo-dark">
				<Switch
					fallback={
						<Button type="submit" pending={mutation.isPending}>
							Añadir al carrito
						</Button>
					}
				>
					<Match when={Object.keys(selectedOptions()).length < productOptionValues().size}>
						<p class="text-red-800 dark:text-blue-300">¡Elige un pack!</p>
					</Match>
					<Match when={!props.product.stock}>
						<p class="text-red-800 dark:text-blue-300">Producto agotado.</p>
					</Match>
					<Match when={selectedVariant() == null}>
						<p class="text-red-800 dark:text-blue-300">Este pack no está disponible.</p>
					</Match>
				</Switch>
			</div>

			<Show when={mutation.isError}>
				<aside class="text-red-500">Lo siento, algo salió mal. Por favor inténtalo de nuevo.</aside>
			</Show>
		</form>
	);
}
