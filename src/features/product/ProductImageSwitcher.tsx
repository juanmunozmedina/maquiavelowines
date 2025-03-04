import type { GetImageResult } from 'astro';
import { RiSystemCheckLine } from 'solid-icons/ri';
import { For, Show, createSignal } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import Card from '~/components/ui/Card.tsx';

interface ProductImageSwitcherProps {
	productImages: GetImageResult[];
}

export function ProductImageSwitcher(props: ProductImageSwitcherProps) {
	const [currentImageIndex, setCurrentImageIndex] = createSignal(0);
	const currentImage = () => {
		const img = props.productImages[currentImageIndex() % props.productImages.length];
		if (!img) throw new Error('Índice de imágenes del producto fuera de límites.');
		return img;
	};

	return (
		<div class="flex aspect-[10/9] items-stretch gap-2">
			<div class="relative flex flex-shrink-0 flex-col gap-[inherit] overflow-hidden will-change-scroll">
				<For each={props.productImages}>
					{(image, index) => (
						<button
							onClick={() => {
								setCurrentImageIndex(index());
							}}
							class={twMerge(
								'relative aspect-square h-20 flex-shrink-0 border border-theme-base-900 bg-theme-base-100 p-1 first:mt-auto last:mb-auto dark:border-theme-base-600 dark:bg-slate-700',
								index() === currentImageIndex() && 'border-theme-base-900',
							)}
							type="button"
						>
							<img
								{...image.attributes}
								alt=""
								src={image.src}
								srcset={image.srcSet.attribute}
								class="h-full w-full object-contain"
							/>
							<Show when={index() === currentImageIndex()}>
								<RiSystemCheckLine
									class="pointer-events-none absolute right-1 top-1 text-theme-base-900"
									aria-hidden
								/>
							</Show>
						</button>
					)}
				</For>
			</div>
			<Card class="aspect-square">
				<img
					{...currentImage().attributes}
					alt=""
					src={currentImage().src}
					srcset={currentImage().srcSet.attribute}
					class="h-full w-full rounded-lg object-contain"
				/>
			</Card>
		</div>
	);
}
