import React, { useEffect, useRef } from 'react';
import Modal from '../../core/Modal';
import { Cross, LoaderIcon, TrashCan } from '../../icons';

/**
 * Small UI pieces shared by the MCP tab, styled like the rest of FlexTable.
 */

type NoticeType = 'info' | 'warn' | 'error';

const ICON_COLOR: Record< NoticeType, string > = {
	info: '#FC7E2A',
	warn: '#FC7E2A',
	error: '#D63638',
};

/**
 * Notice box in FlexTable's style (grey card with an info icon, like the
 * "Themes cannot be used…" notice in Theme settings).
 */
export const Notice = ( {
	type = 'info',
	children,
	className = '',
}: {
	type?: NoticeType;
	children: React.ReactNode;
	className?: string;
} ) => (
	<div className={ `mcp-notice mcp-notice--${ type } ${ className }` } role={ 'error' === type ? 'alert' : 'status' }>
		<span className="mcp-notice__icon" aria-hidden="true">
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
				<path
					d="M7 0.5C5.61553 0.5 4.26216 0.910543 3.11101 1.67971C1.95987 2.44888 1.06266 3.54213 0.532846 4.82122C0.00303299 6.1003 -0.13559 7.50776 0.134506 8.86563C0.404603 10.2235 1.07129 11.4708 2.05026 12.4497C3.02922 13.4287 4.2765 14.0954 5.63437 14.3655C6.99224 14.6356 8.3997 14.497 9.67879 13.9672C10.9579 13.4373 12.0511 12.5401 12.8203 11.389C13.5895 10.2378 14 8.88447 14 7.5C13.998 5.64409 13.2599 3.86475 11.9476 2.55242C10.6353 1.24009 8.85592 0.50196 7 0.5ZM6.73077 3.73077C6.89052 3.73077 7.04668 3.77814 7.1795 3.86689C7.31233 3.95564 7.41585 4.08178 7.47698 4.22937C7.53811 4.37696 7.55411 4.53936 7.52294 4.69603C7.49178 4.85271 7.41485 4.99663 7.3019 5.10959C7.18894 5.22254 7.04502 5.29947 6.88834 5.33063C6.73167 5.3618 6.56927 5.3458 6.42168 5.28467C6.27409 5.22354 6.14795 5.12001 6.0592 4.98719C5.97045 4.85437 5.92308 4.69821 5.92308 4.53846C5.92308 4.32425 6.00817 4.11881 6.15965 3.96734C6.31112 3.81586 6.51656 3.73077 6.73077 3.73077ZM7.53846 11.2692C7.25285 11.2692 6.97893 11.1558 6.77696 10.9538C6.575 10.7518 6.46154 10.4779 6.46154 10.1923V7.5C6.31873 7.5 6.18177 7.44327 6.08079 7.34229C5.97981 7.24131 5.92308 7.10435 5.92308 6.96154C5.92308 6.81873 5.97981 6.68177 6.08079 6.58079C6.18177 6.47981 6.31873 6.42308 6.46154 6.42308C6.74716 6.42308 7.02108 6.53654 7.22304 6.7385C7.425 6.94046 7.53846 7.21438 7.53846 7.5V10.1923C7.68127 10.1923 7.81823 10.249 7.91921 10.35C8.0202 10.451 8.07692 10.588 8.07692 10.7308C8.07692 10.8736 8.0202 11.0105 7.91921 11.1115C7.81823 11.2125 7.68127 11.2692 7.53846 11.2692Z"
					fill={ ICON_COLOR[ type ] }
				/>
			</svg>
		</span>
		<span className="mcp-notice__text">{ children }</span>
	</div>
);

/**
 * Inline spinner for buttons and short waits.
 */
export const Spinner = ( { label = '' }: { label?: string } ) => (
	<span className="mcp-loader" role="status" aria-label={ label || undefined }>
		{ LoaderIcon }
	</span>
);

/**
 * Skeleton lines (shimmer) while a section loads.
 */
export const Skeleton = ( { lines = 3, title = true }: { lines?: number; title?: boolean } ) => (
	<div className="mcp-skeleton" aria-hidden="true">
		{ title && <span className="mcp-skeleton__line mcp-skeleton__line--title" /> }
		{ Array.from( { length: lines } ).map( ( _, i ) => (
			<span key={ i } className={ `mcp-skeleton__line ${ i === lines - 1 ? 'mcp-skeleton__line--short' : '' }` } />
		) ) }
	</div>
);

/**
 * A whole card in its loading state.
 */
export const SkeletonCard = ( { lines = 3, label = '' }: { lines?: number; label?: string } ) => (
	<div className="mcp-card mcp-card--loading" role="status" aria-busy="true" aria-label={ label || undefined }>
		<Skeleton lines={ lines } />
	</div>
);

type ModalAction = {
	label: string;
	onClick: () => void;
	kind?: 'cancel' | 'confirm';
	disabled?: boolean;
};

/**
 * Confirmation modal with FlexTable's delete-modal design (cross, icon,
 * centred title and text, Cancel / confirm buttons). Closes on Esc and on a
 * click outside.
 */
export const ConfirmModal = ( {
	title,
	description,
	actions,
	onClose,
	busy = false,
}: {
	title: string;
	description: React.ReactNode;
	actions: ModalAction[];
	onClose: () => void;
	busy?: boolean;
} ) => {
	const ref = useRef< HTMLDivElement >( null );

	useEffect( () => {
		const onKey = ( e: KeyboardEvent ) => {
			if ( 'Escape' === e.key && ! busy ) {
				onClose();
			}
		};
		const onDown = ( e: MouseEvent ) => {
			if ( ! busy && ref.current && ! ref.current.contains( e.target as Node ) ) {
				onClose();
			}
		};
		document.addEventListener( 'keydown', onKey );
		document.addEventListener( 'mousedown', onDown );
		return () => {
			document.removeEventListener( 'keydown', onKey );
			document.removeEventListener( 'mousedown', onDown );
		};
	}, [ onClose, busy ] );

	return (
		<Modal>
			<div className="delete-table-modal-wrap modal-content mcp-confirm-modal" ref={ ref } role="dialog" aria-modal="true" aria-labelledby="mcp-confirm-title">
				<button type="button" className="cross_sign" onClick={ onClose } aria-label="Close" disabled={ busy }>
					{ Cross }
				</button>
				<div className="delete-table-modal">
					<div className="modal-media">{ TrashCan }</div>
					<h2 id="mcp-confirm-title">{ title }</h2>
					<p>{ description }</p>
					<div className="action-buttons">
						{ actions.map( ( action ) => (
							<button
								key={ action.label }
								type="button"
								className={ `swptls-button ${ 'confirm' === action.kind ? 'confirm-button' : 'cancel-button' }` }
								onClick={ action.onClick }
								disabled={ busy || action.disabled }
							>
								{ action.label }
							</button>
						) ) }
					</div>
				</div>
			</div>
		</Modal>
	);
};
