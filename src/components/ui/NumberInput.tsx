import type { JSX } from 'solid-js';

type NumberInputProps = {
	value: number;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function NumberInput(props: NumberInputProps) {
	return (
		<div
			{...props}
			class={`flex w-fit text-slate-600 dark:text-theme-base-100 ${props.class ?? ''}`}
		>
			<span class="font-medium">Cantidad:</span>
			<span class="ml-2">{props.value}</span>
		</div>
	);
}
