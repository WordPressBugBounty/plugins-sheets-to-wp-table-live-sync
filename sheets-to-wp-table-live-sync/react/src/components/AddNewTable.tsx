import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
	getNonce,
	getTables,
	getTableCount,
	convertToSlug,
	getStrings,
	isProActive,
	displayProPopup,
} from './../Helpers';
import { GrayPlusIcon } from '../icons';
import { toast } from 'react-toastify';

function AddNewTable() {
	const [tableCount, setTableCount] = useState(getTableCount());

	useEffect(() => {
		wp.ajax.send('gswpts_get_tables', {
			data: {
				nonce: getNonce(),
			},
			success(response) {
				setTableCount(response.tables_count);
			},
			error(error) {
				console.error(error);
			},
		});
	}, []);

	const constructCreateTableUrl = () => {
		// Get the current full URL
		const currentUrl = window.location.href;
		// Get the base URL (before the hash)
		const baseUrl = currentUrl.split('#')[0];
		let newUrl = `${baseUrl}`;
		newUrl += '#/tables/create';
		return newUrl;
	};


	const handleCreateTable = () => {
		const newUrl = constructCreateTableUrl();
		window.location.href = newUrl;
	};

	const tableLimitReached = !isProActive() && tableCount >= 3;

	return (
		<>
			<button
				className={`add-new-table btn add-new-table-btn${tableLimitReached ? ` disabled swptls-pro-lock` : ``}`}
				onClick={tableLimitReached ? displayProPopup : handleCreateTable}
			>
				{GrayPlusIcon}
				{getStrings('add-new-table')}
			</button>
		</>
	);
}

export default AddNewTable;
