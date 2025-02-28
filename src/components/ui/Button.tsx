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
	theme?: 'light' | 'dark';
	onClick?: JSX.EventHandler<HTMLElement, MouseEvent>;
	disabled?: boolean;
}

export function SquareIconButton(props: SquareIconButtonProps) {
	const theme = () => props.theme ?? 'light';
	return (
		<Dynamic
			component={props.as ?? 'button'}
			type={props.type ?? 'button'}
			onClick={props.onClick}
			disabled={props.disabled}
			classList={{
				'bg-theme-base-100 border-theme-base-200 text-theme-base-900 hover:enabled:border-theme-base-400 hover:enabled:bg-theme-base-300 dark:hover:enabled:bg-theme-base-800 disabled:text-theme-base-400 dark:bg-slate-700 dark:disabled:bg-theme-base-500 dark:disabled:text-theme-base-300 dark:border-theme-base-600 dark:text-theme-base-100':
					theme() === 'light',
				'bg-theme-base-800 border-theme-base-700 text-theme-base-100 hover:enabled:border-theme-base-700 hover:enabled:bg-theme-base-800 dark:hover:enabled:bg-theme-base-300 dark:disabled:text-theme-base-600 dark:bg-theme-base-100 dark:border-theme-base-200 dark:text-theme-base-900':
					theme() === 'dark',
			}}
			class={`size-9 border transition grid-center data-[icon]:*:size-6 ${props.class ?? ''}`}
		>
			{props.children}
		</Dynamic>
	);
}
