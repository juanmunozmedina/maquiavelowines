import { RiSystemLoader2Line } from 'solid-icons/ri';
import type { ComponentProps, JSX, JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { twMerge } from 'tailwind-merge';

interface Props extends ComponentProps<'button'> {
	pending?: boolean;
}

export function Button(props: Props) {
	return (
		<button
			{...props}
			type={props.type ?? 'button'}
			class={twMerge(
				'flex h-12 items-center justify-center gap-3 bg-theme-base-900 px-4 text-sm font-semibold uppercase text-white transition dark:bg-theme-base-100 dark:text-theme-base-900 ',
				props.class,
				(props.disabled || props.pending) && 'opacity-50',
				!props.disabled && 'hover:bg-theme-base-600 dark:hover:bg-theme-base-200',
			)}
		>
			{props.pending ? <RiSystemLoader2Line class="animate-spin" /> : props.children}
		</button>
	);
}

interface SquareIconButtonProps {
	as?: 'button' | 'div';
	type?: 'button' | 'submit' | 'reset';
	class?: string;
	children?: JSXElement;
	onClick?: JSX.EventHandler<HTMLElement, MouseEvent>;
	disabled?: boolean;
}

export function SquareIconButton(props: SquareIconButtonProps) {
	return (
		<Dynamic
			component={props.as ?? 'button'}
			type={props.type ?? 'button'}
			onClick={props.onClick}
			disabled={props.disabled}
			class={`size-9 border border-theme-base-200 bg-theme-base-100 text-theme-base-900 transition grid-center hover:enabled:border-theme-base-400 hover:enabled:bg-theme-base-300 disabled:text-theme-base-400 data-[icon]:*:size-6 dark:border-theme-base-600 dark:bg-slate-700 dark:text-theme-base-100 dark:hover:enabled:border-theme-base-700 dark:hover:enabled:bg-theme-base-800 dark:disabled:bg-theme-base-500 dark:disabled:text-theme-base-300 ${props.class ?? ''}`}
		>
			{props.children}
		</Dynamic>
	);
}
