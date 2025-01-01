import React, { useState, useEffect, useRef } from 'react';

const ThemeFields = ({ tableSettings }) => {
	const theme = tableSettings?.table_settings?.table_style || 'default-style';
	const themeColors =
		tableSettings?.table_settings?.import_styles_theme_colors?.[theme] ||
		{};
	const defaultThemes = [
		'default-style',
		'style-1',
		'style-2',
		'style-3',
		'style-4',
		'style-5',
		'style-6',
		'style-7',
		'style-8',
	];

	// Skip rendering for default themes
	if (defaultThemes.includes(theme)) {
		// return null;

		return (
			<div className="theme-fields">
				<input
					className="pagination_center"
					type="hidden"
					id="pagination_center"
					name="pagination_center"
					value={themeColors.pagination_center}
					checked={themeColors?.pagination_center}
				/>

				<input
					className="paginationStyle"
					type="hidden"
					id="pagination-style"
					placeholder="10px"
					name="paginationStyle"
					value={
						themeColors.paginationStyle || 'default_pagination'
					}
				/>

				<input
					className="paginationAciveBtnColor"
					type="hidden"
					id="paginationAciveBtnColor"
					placeholder="10px"
					name="paginationAciveBtnColor"
					value={themeColors.paginationAciveBtnColor || '#2F80ED'}
				/>

				<input
					className="enable_fixed_headers"
					type="hidden"
					id="enable_fixed_headers"
					name="enable_fixed_headers"
					checked={tableSettings.table_settings?.fixed_headers || false}
				/>

				<input
					className="header_offset"
					type="hidden"
					id="header_offset"
					name="header_offset"
					value={tableSettings.table_settings?.header_offset || 0}

				/>

				<input
					className="enable_fixed_columns"
					type="hidden"
					id="enable_fixed_columns"
					name="enable_fixed_columns"
					checked={tableSettings.table_settings?.enable_fixed_columns || false}
				/>

				<input
					className="left_columns"
					type="hidden"
					id="left_columns"
					name="left_columns"
					value={tableSettings.table_settings?.left_columns || 0}
				/>

				<input
					className="right_columns"
					type="hidden"
					id="right_columns"
					name="right_columns"
					value={tableSettings.table_settings?.right_columns || 0}
				/>

			</div>
		);
	}

	return (
		<div className="theme-fields">
			<input
				type="hidden"
				id="headerBGColor"
				className="color-picker headerBGColor"
				value={themeColors.headerBGColor || '#ffffff'}
			/>
			<input
				type="hidden"
				id="headerTextColor"
				className="color-picker headerTextColor"
				value={themeColors.headerTextColor || '#000000'}
			/>
			<input
				type="hidden"
				id="bodyTextColorCol_1"
				className="color-picker bodyTextColorCol_1"
				value={themeColors.bodyTextColorCol_1 || '#333333'}
			/>
			<input
				type="hidden"
				id="bodyTextColorColRest"
				className="color-picker bodyTextColorColRest"
				value={themeColors.bodyTextColorColRest || '#6b6b6b'}
			/>
			<input
				type="hidden"
				id="bodyBGColor"
				className="color-picker bodyBGColor"
				value={themeColors.bodyBGColor || '#ffffff'}
			/>
			<input
				type="hidden"
				id="bodyBGColorEven"
				className={`color-picker bodyBGColorEven ${themeColors.activeColumnColor ? 'activeColumnColor' : ''
					}`}
				value={themeColors.bodyBGColorEven || '#f5f5f5'}
			/>
			<input
				type="hidden"
				id="bodyBGColorOdd"
				className={`color-picker bodyBGColorOdd ${themeColors.activeColumnColor ? 'activeColumnColor' : ''
					}`}
				value={themeColors.bodyBGColorOdd || '#ffffff'}
			/>
			<input
				type="hidden"
				id="bodyBGColorEven"
				className={`color-picker bodyBGColorEven ${themeColors.activeRowColor ? 'activeRowColor' : ''
					}`}
				value={themeColors.bodyBGColorEven || '#f5f5f5'}
			/>
			<input
				type="hidden"
				id="bodyBGColorOdd"
				className={`color-picker bodyBGColorOdd ${themeColors.activeRowColor ? 'activeRowColor' : ''
					}`}
				value={themeColors.bodyBGColorOdd || ''}
			/>
			<input
				type="hidden"
				id="hoverBGColor"
				className={`color-picker hoverBGColor ${themeColors.hoverModeNone
					? 'hoverModeNone'
					: themeColors.hoverModeRow
						? 'hoverModeRow'
						: themeColors.hoverModeColumn
							? 'hoverModeColumn'
							: ''
					}`}
				value={themeColors.hoverBGColor || ''}
			/>
			<input
				type="hidden"
				id="hoverTextColor"
				className="color-picker hoverTextColor"
				value={themeColors.hoverTextColor || '#e8e8e8'}
			/>
			<input
				type="hidden"
				id="borderColor"
				className="color-picker borderColor"
				value={themeColors.borderColor || '#000000'}
			/>
			<input
				type="hidden"
				id="outsideborderColor"
				className="color-picker outsideborderColor"
				value={themeColors.outsideborderColor || '#ffffff'}
			/>
			<input
				className="borderType"
				type="hidden"
				id="border-type"
				placeholder="10px"
				name="borderType"
				value={themeColors.borderType || 'rounded'}
			/>
			<input
				className="borderRadius"
				type="hidden"
				id="border-radius"
				placeholder="10px"
				name="borderRadius"
				value={themeColors.borderRadius || '10px'}
			/>

			<input
				className="paginationStyle"
				type="hidden"
				id="pagination-style"
				placeholder="10px"
				name="paginationStyle"
				value={themeColors.paginationStyle || 'default_pagination'}
			/>

			<input
				className="paginationAciveBtnColor"
				type="hidden"
				id="paginationAciveBtnColor"
				placeholder="10px"
				name="paginationAciveBtnColor"
				value={themeColors.paginationAciveBtnColor || '#2F80ED'}
			/>
			<input
				className="pagination_center"
				type="hidden"
				id="pagination_center"
				name="pagination_center"
				value={themeColors.pagination_center}
				checked={themeColors?.pagination_center}
			/>

			{/* Sticky  */}
			<input
				className="enable_fixed_headers"
				type="hidden"
				id="enable_fixed_headers"
				name="enable_fixed_headers"
				checked={tableSettings.table_settings?.fixed_headers || false}
			/>

			<input
				className="header_offset"
				type="hidden"
				id="header_offset"
				name="header_offset"
				value={tableSettings.table_settings?.header_offset || 0}

			/>

			<input
				className="enable_fixed_columns"
				type="hidden"
				id="enable_fixed_columns"
				name="enable_fixed_columns"
				checked={tableSettings.table_settings?.enable_fixed_columns || false}
			/>

			<input
				className="left_columns"
				type="hidden"
				id="left_columns"
				name="left_columns"
				value={tableSettings.table_settings?.left_columns || 0}
			/>

			<input
				className="right_columns"
				type="hidden"
				id="right_columns"
				name="right_columns"
				value={tableSettings.table_settings?.right_columns || 0}
			/>


		</div>
	);
};

export default ThemeFields;
