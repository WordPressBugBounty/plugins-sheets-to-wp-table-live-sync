import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Column from '../core/Column';
import Row from '../core/Row';
import Modal from './../core/Modal';
import { CopyIcon, Cross, DeleteIcon, EditIcon, TrashCan } from '../icons';

//styles
import '../styles/_table_item.scss';
import Title from '../core/Title';
import { toast } from 'react-toastify';
import { getNonce, getStrings } from '../Helpers';

function TableItem( {
	table,
	setCopiedTables,
	setTableCount,
	setTables,
	setLoader,
} ) {
	const confirmDeleteRef = useRef();
	const [ copySuccess, setCopySuccess ] = useState( false );
	const [ deleteModal, setDeleteModal ] = useState< boolean >( false );

	/* const handleCopyShortcode = async ( id ) => {
		const shortcode = `[gswpts_table id="${ id }"]`;

		try {
			await navigator.clipboard.writeText( shortcode );
			setCopySuccess( true );

			// Reset copySuccess state after 1 second
			setTimeout( () => {
				setCopySuccess( false );
			}, 1000 ); // 1000 milliseconds = 1 second
		} catch ( err ) {
			setCopySuccess( false );
		}
	}; */

	const handleCopyShortcode = async ( id ) => {
		// console.log(id);
		const shortcode = `[gswpts_table id="${ id }"]`;
		if ( navigator.clipboard && navigator.clipboard.writeText ) {
			try {
				await navigator.clipboard.writeText( shortcode );
				setCopySuccess( true );
				setTimeout( () => {
					setCopySuccess( false );
				}, 1000 );
			} catch ( err ) {
				console.error(
					'Failed to copy text using clipboard API: ',
					err
				);
				setCopySuccess( false );
			}
		} else {
			// Fallback method for unsupported browsers
			try {
				const textArea = document.createElement( 'textarea' );
				textArea.value = shortcode;
				textArea.style.position = 'fixed';
				textArea.style.opacity = '0';
				document.body.appendChild( textArea );
				textArea.select();
				textArea.setSelectionRange( 0, textArea.value.length );
				document.execCommand( 'copy' );
				document.body.removeChild( textArea );
				setCopySuccess( true );
				setTimeout( () => {
					setCopySuccess( false );
				}, 1000 );
			} catch ( err ) {
				console.error( 'Fallback copy method failed: ', err );
				setCopySuccess( false );
			}
		}
	};

	const handleClosePopup = () => {
		setDeleteModal( false );
	};

	const handleDeleteTable = () => {
		setDeleteModal( true );
	};
	/**
	 *
	 * @param id Copy Table
	 */
	const handleCopyTable = ( id ) => {
		wp.ajax.send( 'swptls_copy_table', {
			data: {
				nonce: getNonce(),
				id,
			},
			success() {
				setLoader( true );

				wp.ajax.send( 'swptls_get_tables', {
					data: {
						nonce: getNonce(),
					},
					success( { tables, tables_count } ) {
						setTables( tables );
						setCopiedTables( tables );
						setTableCount( tables_count );
						setLoader( false );

						toast.success(
							'Your table has been been duplicated !'
						);
					},
					error( error ) {
						console.error( error );
						toast.warn( 'Your table duplicated failed !' );
					},
				} );
			},
			error( error ) {
				console.error( error );
				toast.warn( 'Table duplicated failed !' );
			},
		} );
	};

	const ConfirmDeleteTable = ( id ) => {
		wp.ajax.send( 'swptls_delete_table', {
			data: {
				nonce: getNonce(),
				id,
			},
			success() {
				setDeleteModal( false );
				setLoader( true );

				wp.ajax.send( 'swptls_get_tables', {
					data: {
						nonce: getNonce(),
					},
					success( { tables, tables_count } ) {
						setTables( tables );
						setCopiedTables( tables );
						setTableCount( tables_count );
						setLoader( false );
					},
					error( error ) {
						console.error( error );
					},
				} );
			},
			error( error ) {
				console.error( error );
			},
		} );
	};

	/**
	 * Alert if clicked on outside of element
	 *
	 * @param  event
	 */
	function handleCancelOutside( event: MouseEvent ) {
		if (
			confirmDeleteRef.current &&
			! confirmDeleteRef.current.contains( event.target )
		) {
			handleClosePopup();
		}
	}

	useEffect( () => {
		document.addEventListener( 'mousedown', handleCancelOutside );
		return () => {
			document.removeEventListener( 'mousedown', handleCancelOutside );
		};
	}, [ handleCancelOutside ] );

	const maxLength = 80;
	const truncatedText =
		table.table_name.length > maxLength
			? table.table_name.substring( 0, maxLength ) + '...'
			: table.table_name;

	return (
		<div className="table_info-action_box_wrapper">
			{ deleteModal && (
				<Modal>
					<div
						className="delete-table-modal-wrap modal-content"
						ref={ confirmDeleteRef }
					>
						<div
							className="cross_sign"
							onClick={ () => handleClosePopup() }
						>
							{ Cross }
						</div>
						<div className="delete-table-modal">
							<div className="modal-media">{ TrashCan }</div>
							<h2>{ getStrings( 'are-you-sure-to-delete' ) }</h2>
							<p>
								{ getStrings( 'confirmation-about-to-delete' ) }
							</p>
							<div className="action-buttons">
								<button
									className="swptls-button cancel-button"
									onClick={ handleClosePopup }
								>
									{ getStrings( 'Cancel' ) }
								</button>
								<button
									className="swptls-button confirm-button"
									onClick={ () =>
										ConfirmDeleteTable( table.id )
									}
								>
									{ getStrings( 'Delete' ) }
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) }

			<div className="table_info-action_box">
				<div className="table-info-box">
					<div className="table-info">
						<Link
							to={ `/tables/edit/${ table.id }` }
							className="table-edit"
						>
							<Title tagName="h4">{ truncatedText }</Title>
						</Link>

						<Title tagName="p">ID: TB_{ table.id }</Title>
					</div>
				</div>
				<div className="table-action-box">
					<div className="tooltip-wrapper">
						<button
							className={ `copy-shortcode btn-shortcode ${
								! copySuccess ? '' : 'btn-success'
							}` }
							onClick={ () => handleCopyShortcode( table.id ) }
						>
							{ ! copySuccess ? (
								<>
									<span>{ `[gswpts_table="${ table.id }"]` }</span>
									<div className="icon">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="14"
											height="15"
											viewBox="0 0 14 15"
											fill="none"
										>
											<path
												d="M12.6 0.5H5.6C4.8279 0.5 4.2 1.1279 4.2 1.9V4.7H1.4C0.6279 4.7 0 5.3279 0 6.1V13.1C0 13.8721 0.6279 14.5 1.4 14.5H8.4C9.1721 14.5 9.8 13.8721 9.8 13.1V10.3H12.6C13.3721 10.3 14 9.6721 14 8.9V1.9C14 1.1279 13.3721 0.5 12.6 0.5ZM1.4 13.1V6.1H8.4L8.4014 13.1H1.4ZM12.6 8.9H9.8V6.1C9.8 5.3279 9.1721 4.7 8.4 4.7H5.6V1.9H12.6V8.9Z"
												fill="#666873"
											/>
										</svg>
									</div>
								</>
							) : (
								<>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 14 14"
										fill="none"
									>
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M9.67946 13.4688C8.83002 13.8207 7.91943 14.0012 7 14C6.08058 14.0012 5.16998 13.8206 4.32055 13.4688C3.47112 13.1169 2.69959 12.6007 2.0503 11.9497C1.39931 11.3004 0.883055 10.5289 0.531195 9.67946C0.179336 8.83002 -0.00118543 7.91943 5.85779e-06 7C-0.00116625 6.08058 0.179364 5.16998 0.531222 4.32055C0.88308 3.47112 1.39933 2.69959 2.0503 2.0503C2.69959 1.39933 3.47112 0.88308 4.32055 0.531222C5.16998 0.179364 6.08058 -0.00116625 7 5.85779e-06C7.91943 -0.00118543 8.83002 0.179336 9.67946 0.531195C10.5289 0.883055 11.3004 1.39931 11.9497 2.0503C12.6007 2.69959 13.1169 3.47112 13.4688 4.32055C13.8206 5.16998 14.0012 6.08058 14 7C14.0012 7.91943 13.8207 8.83002 13.4688 9.67946C13.1169 10.5289 12.6007 11.3004 11.9497 11.9497C11.3004 12.6007 10.5289 13.1169 9.67946 13.4688ZM10.995 5.39522C11.2683 5.12186 11.2683 4.67864 10.995 4.40527C10.7216 4.13191 10.2784 4.13191 10.005 4.40527L6.29999 8.1103L4.69497 6.50527C4.4216 6.2319 3.97839 6.2319 3.70502 6.50527C3.43165 6.77864 3.43165 7.22185 3.70502 7.49522L5.80502 9.59522C6.07838 9.86859 6.5216 9.86859 6.79497 9.59522L10.995 5.39522Z"
											fill="white"
										/>
									</svg>
									{ getStrings( 'tab-short-copy' ) }
								</>
							) }
						</button>
						<span className="tooltip-content">Copy shortcode</span>
					</div>

					<div className="tooltip-wrapper">
						<Link
							to={ `/tables/edit/${ table.id }` }
							className="table-edit"
						>
							{ EditIcon }
						</Link>
						<span className="tooltip-content">Edit table</span>
					</div>

					{ /* Table duplicate  */ }
					<div className="tooltip-wrapper">
						<button
							className="table-duplicate"
							onClick={ () => handleCopyTable( table.id ) }
							title="Duplicate table"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="17"
								height="18"
								viewBox="0 0 17 18"
								fill="none"
							>
								<path
									d="M3.6792 8.1751C3.6792 5.842 3.6792 4.67462 4.40437 3.95027C5.12872 3.2251 6.2961 3.2251 8.6292 3.2251H11.1042C13.4373 3.2251 14.6047 3.2251 15.329 3.95027C16.0542 4.67462 16.0542 5.842 16.0542 8.1751V12.3001C16.0542 14.6332 16.0542 15.8006 15.329 16.5249C14.6047 17.2501 13.4373 17.2501 11.1042 17.2501H8.6292C6.2961 17.2501 5.12872 17.2501 4.40437 16.5249C3.6792 15.8006 3.6792 14.6332 3.6792 12.3001V8.1751Z"
									stroke="#7E8AA1"
									stroke-width="1.3"
								/>
								<path
									d="M3.67922 14.775C3.02281 14.775 2.39329 14.5142 1.92913 14.0501C1.46498 13.5859 1.20422 12.9564 1.20422 12.3V7.35C1.20422 4.23893 1.20422 2.68297 2.17112 1.7169C3.1372 0.75 4.69315 0.75 7.80422 0.75H11.1042C11.7606 0.75 12.3902 1.01076 12.8543 1.47491C13.3185 1.93906 13.5792 2.56859 13.5792 3.225"
									stroke="#7E8AA1"
									stroke-width="1.3"
								/>
							</svg>
						</button>
						<span className="tooltip-content">Duplicate table</span>
					</div>

					<div className="tooltip-wrapper">
						<button
							className="table-delete"
							onClick={ handleDeleteTable }
						>
							{ DeleteIcon }
						</button>
						<span className="tooltip-content">Delete table</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TableItem;
