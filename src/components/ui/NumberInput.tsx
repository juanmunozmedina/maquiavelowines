import { Show, type JSX } from 'solid-js';

export function NumberInput(props: NumberInputProps) {
	return (
		<Show when={props.value > 1}>
			<div
				{...props}
				class={`flex w-fit text-slate-600 dark:text-theme-base-100 ${props.class ?? ''}`}
			>
				<span class="font-medium">Cantidad:</span>
				<span class="ml-2">{props.value}</span>
			</div>
		</Show>
	);
}
