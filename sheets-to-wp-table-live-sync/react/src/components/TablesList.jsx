import Card from '../core/Card';
import React, { useEffect } from 'react';
import AddNewTable from './AddNewTable';
import TableItem from './TableItem';

function TablesList( {
	copiedTables,
	tables,
	setCopiedTables,
	setTableCount,
	setTables,
	setLoader,
} ) {
	return (
		<>
			{ tables &&
				tables.map( ( table ) => (
					<TableItem
						key={ table.id }
						table={ table }
						setCopiedTables={ setCopiedTables }
						setTableCount={ setTableCount }
						setTables={ setTables }
						setLoader={ setLoader }
					/>
				) ) }
		</>
	);
}

export default TablesList;
