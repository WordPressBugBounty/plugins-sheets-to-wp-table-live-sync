<?php

/**
 * Responsible for managing template content related functionalities.
 *
 * @since 2.13.1
 * @package SWPTLS
 */

namespace SWPTLS\Elementor;  // phpcs:ignore

use SWPTLS\Elementor\TableSettings;  // phpcs:ignore

// If direct access than exit the file.
defined( 'ABSPATH' ) || exit;

/**
 * Responsible for managing template content related functionalities.
 *
 * @since 2.13.1
 */
class TemplateContent {


	/**
	 * Render template js script.
	 *
	 * @since 2.13.1
	 */
	public function render_template_js() {
		?>
		<# jQuery(document).ready(function($) { $.ajax({ type: "post" , url: "<?php echo esc_url(admin_url( 'admin-ajax.php' )); ?>" , data: { action: 'gswpts_sheet_fetch' , id: settings.choose_table, nonce: "<?php echo esc_attr( wp_create_nonce( 'gswpts_sheet_nonce_action' ) ); ?>" }, success: ( response )=> {
			let sheet_container = $($('#elementor-preview-iframe')[0].contentWindow.document.getElementById(settings.choose_table).querySelector("#spreadsheet_container"));
			if (response.data.type == 'invalid_action' || response.data.type == 'invalid_request') {
			sheet_container.html(`
			<div class="gswpts_create_table_container" style="margin-right: 0px;">
				<div class="block_initializer">
					<div class="ui green message" style="width:70%; margin: 0 auto;text-align: center; font-weight: bold;">
						{{{response.data.output}}}
					</div>
				</div>
			</div>
			`);
			return;
			}
			if (response.data.type == 'success') {
			let mainContainer = $($('#elementor-preview-iframe')[0].contentWindow.document.querySelector(`.gswpts_table_${settings.choose_table}`));
			let tableSettings = response.data.table_settings;
			if(mainContainer.find('h3').length == 0){
			if(tableSettings.table_title == 'true'){
			mainContainer.prepend(`<h3 class="gswpts_table_title.active">${response.data.table_name}</h3>`)
			} else {
			mainContainer.prepend(`<h3 class="gswpts_table_title">${response.data.table_name}</h3>`)
			}
			} else {
			if(tableSettings.table_title == 'true'){
			mainContainer.find('h3').addClass('gswpts_table_title active');
			}else{
			mainContainer.find('h3').removeClass('active');
			}
			}

			if(mainContainer.find('.gswpts_table_settings').length == 0) {
			mainContainer.append(`
			<div>
				<a href="<?php echo esc_url(admin_url( 'admin.php?page=gswpts-dashboard#/tables/edit/' )); ?>${settings.choose_table}" class="gswpts_table_settings" style="background-color: #21ba45; color: #fff; padding: 10px 15px;">Table Settings
				</a>
			</div>
			`);
			}

			mainContainer.find('.table_customizer_link').hide(100)

			sheet_container.html(response.data.output);

			changeCellFormat(tableSettings.cell_format, mainContainer)

			openTableSettings(mainContainer, tableSettings);

			return;
			}
			},
			complete: (res) => {
			if(!res) return;
			let table_settings = JSON.parse(res.responseText).data.table_settings;
			let table_name = JSON.parse(res.responseText).data.table_name;
			let dom = `<"filtering_input"${table_settings.show_x_entries=='true' ? 'l' : '' }${table_settings.search_bar=='true' ? 'f' : '' }>rt<"bottom_options"${table_settings.show_info_block=='true' ? 'i' : '' }p>`;
					let swap_filter_inputs = table_settings.swap_filter_inputs == 'true' ? true : false;
					let swap_bottom_options = table_settings.swap_bottom_options == 'true' ? true : false;

					let table =
					$($('#elementor-preview-iframe')[0].contentWindow.document.getElementById(settings.choose_table).querySelector('#create_tables'));

					table.DataTable({
					dom: dom,
					"order": [],
					"responsive": true,
					buttons: table_settings.table_export,

					"lengthMenu": [
					[1, 5, 10, 15, 25, 50, 100, -1],
					[1, 5, 10, 15, 25, 50, 100, "All"],
					],
					"pageLength": parseInt(table_settings.default_rows_per_page),
					"lengthChange": true,
					"ordering": table_settings.allow_sorting == 'true' ? true : false,
					"destroy": true,
					"scrollX": true,
					"scrollY": table_settings.vertical_scroll != 'default' ? `${table_settings.vertical_scroll}px`: null
					});

					},
					error: (err) => {
					console.log(err);
					alert('Table data fetching could not be completed');
					let sheet_container =
					$($('#elementor-preview-iframe')[0].contentWindow.document.getElementById(settings.choose_table).querySelector("#spreadsheet_container"));
					sheet_container.html('');
					}
					});


					<!-- Open settings popup -->
					function openTableSettings(mainContainer, table_settings){

					let tableID;

					mainContainer.find('.gswpts_table_settings').on('click', (e) => {
					e.preventDefault();

					window.location = e.target.href.toString();
					})

					}


					function saveSettings(mainSelector, tableID){
					let settings = tableSettingsObject(mainSelector),
					tableName = mainSelector.find('.gswpts_table_title').text();
					$.ajax({
					url: "<?php echo esc_url(admin_url( 'admin-ajax.php' )); ?>",

					data: {
					action: "gswpts_sheet_create",
					table_name: tableName,
					table_settings: settings,
					id: tableID,
					type: 'save_changes',
					gutenberg_req: true
					},

					type: "post",

					success: (res) => {
					console.log(res);
					},
					error: (err) => {
					console.log(err);
					alert("Something went wrong. Check developer console");
					},
					});
					}

					function grabElements(mainSelector){

					let table_title = mainSelector.find('#show_title'),
					infoBlock = mainSelector.find('#info_block'),
					showEntries = mainSelector.find('#show_entries'),
					swapFilters = mainSelector.find('#swap_filter_inputs'),
					swapBottomElements = mainSelector.find('#swap_bottom_options'),
					responsiveStyles = mainSelector.find('#responsive_style'),
					rowsPerPage = mainSelector.find('#rows_per_page'),
					tableHeight = mainSelector.find('#vertical_scrolling'),
					cellFormat = mainSelector.find('#cell_format'),
					redirectionType = mainSelector.find('#redirection_type'),
					allowSorting = mainSelector.find('#sorting'),
					searchTable = mainSelector.find('#search_table'),
					tableCache = mainSelector.find('#table_cache'),
					importStyles = mainSelector.find('#import_styles');

					return [
					table_title,
					infoBlock,
					showEntries,
					swapFilters,
					swapBottomElements,
					responsiveStyles,
					rowsPerPage,
					tableHeight,
					cellFormat,
					redirectionType,
					allowSorting,
					searchTable,
					tableCache,
					importStyles
					];

					}

					<!-- Change the table settings when tables loads from database -->
					function changeSettingsValues(mainSelector, settings){

					let [
					table_title,
					infoBlock,
					showEntries,
					swapFilters,
					swapBottomElements,
					responsiveStyles,
					rowsPerPage,
					tableHeight,
					cellFormat,
					redirectionType,
					allowSorting,
					searchTable,
					tableCache,
					importStyles
					] = grabElements(mainSelector);


					<!-- Change the input values according to saved values from databse -->
					table_title.prop("checked", settings.table_title);
					infoBlock.prop("checked", settings.show_info_block);
					showEntries.prop("checked", settings.show_x_entries);
					swapFilters.prop("checked", settings.swap_filter_inputs);
					swapBottomElements.prop("checked",settings.swap_bottom_options);
					responsiveStyles.val(settings.responsive_style).change();
					rowsPerPage.val(settings.default_rows_per_page == "-1" ? "all" :
					settings.default_rows_per_page).change();
					tableHeight.val(settings.vertical_scroll).change();
					cellFormat.val(settings.cell_format).change();
					redirectionType.val(settings.redirection_type).change();
					allowSorting.prop("checked", settings.allow_sorting);
					searchTable.prop("checked", settings.search_bar);
					tableCache.prop("checked", settings.table_cache);
					importStyles.prop("checked", settings.import_styles)
					}

					<!-- Grab all settings value as an object -->
					function tableSettingsObject(mainSelector){

					let [
					table_title,
					infoBlock,
					showEntries,
					swapFilters,
					swapBottomElements,
					responsiveStyles,
					rowsPerPage,
					tableHeight,
					cellFormat,
					redirectionType,
					allowSorting,
					searchTable,
					tableCache,
					importStyles
					] = grabElements(mainSelector);


					let settings = {
					'table_title': table_title.prop("checked"),
					'defaultRowsPerPage': rowsPerPage.val() == "all" ? -1 : rowsPerPage.val(),
					'showInfoBlock': infoBlock.prop("checked"),
					'showXEntries': showEntries.prop("checked"),
					'swapFilterInputs': swapFilters.prop("checked"),
					'swapBottomOptions': swapBottomElements.prop("checked"),
					'allowSorting': allowSorting.prop("checked"),
					'searchBar': searchTable.prop("checked"),
					'responsiveStyle': responsiveStyles.val(),
					'verticalScroll': tableHeight.val(),
					'cellFormat': cellFormat.val(),
					'redirectionType': redirectionType.val(),
					'tableCache': tableCache.prop("checked"),
					'importStyles' : importStyles.prop("checked")
					};

					return settings;

					}

					<!-- update the table when table settings changes -->
					function udpateTableByChanges(mainSelector){
					grabElements(mainSelector).forEach(element => {
					element.on('change', (e) => {
					let target = $(e.currentTarget),
					inputValue = target.val(),
					inputID = target.attr('id'),
					tableSettings = tableSettingsObject(mainSelector);
					console.log(tableSettings);

					<!-- Show the table title on elementor page -->
					if(inputID == 'show_title' && target.prop('checked') == true){
					mainSelector.find('h3')[0].style.display = 'block';
					}
					<!-- Hide the table title on elementor page -->
					if(inputID == 'show_title' && target.prop('checked') == false){
					mainSelector.find('h3')[0].style.display = 'none';
					}

					if (
					inputID == "search_table" ||
					inputID == "rows_per_page" ||
					inputID == "sorting" ||
					inputID == "show_entries" ||
					inputID == "info_block" ||
					inputID == "vertical_scrolling" ||
					inputID == "cell_format"
					) {

					changeCellFormat(tableSettings.cellFormat, mainSelector);

					reFormatTable(mainSelector, tableSettings);
					}

					<!-- Swaping Filter Inputs  -->
					if (inputID == "swap_filter_inputs") {
					swap_filter_inputs(target.prop("checked"), mainSelector);
					}

					<!-- Swaping bottom elements -->
					if (inputID == "swap_bottom_options") {
					swap_bottom_options(target.prop("checked"), mainSelector);
					}

					<!-- Changing the link redirection type -->
					if (inputID == "redirection_type") {
					changeRedirectionType(tableSettings.redirectionType, mainSelector);
					}
					})
					});
					}

					function reFormatTable(mainSelector, tableSettings) {

					let dom = `B<"filtering_input"${tableSettings.showXEntries ? "l" : "" }${ tableSettings.searchBar ? "f" : "" }>rt<"bottom_options"${tableSettings.showInfoBlock ? "i" : "" }p>`;

							let table_name = mainSelector.find('.gswpts_table_title').text();
							table_changer(table_name, tableSettings, dom, mainSelector);
							}


							<!-- Change the cell format in table -->
							function changeCellFormat(formatStyle, mainSelector) {
							let tableCell = mainSelector.find('table th, td');

							switch (formatStyle) {
							case "wrap":
							$.each(tableCell, function (i, cell) {
							$(cell).removeClass("clip_style");
							$(cell).removeClass("expanded_style");
							$(cell).addClass("wrap_style");
							});
							break;

							case "expand":
							$.each(tableCell, function (i, cell) {
							$(cell).removeClass("clip_style");
							$(cell).removeClass("wrap_style");
							$(cell).addClass("expanded_style");
							});
							break;

							default:
							break;
							}
							}

							<!-- Swap the place of filter input -->
							function swap_filter_inputs(state, mainSelector) {
							if (state) {
							mainSelector.find('.filtering_input').css("flex-direction", "row-reverse");
							mainSelector.find('#create_tables_length').css({
							"margin-right": "0",
							"margin-left": "auto",
							});
							mainSelector.find('#create_tables_filter').css({
							"margin-left": "0",
							"margin-right": "auto",
							});
							} else {
							mainSelector.find('.filtering_input').css("flex-direction", "row");
							mainSelector.find('#create_tables_length').css({
							"margin-right": "auto",
							"margin-left": "0",
							});
							mainSelector.find('#create_tables_filter').css({
							"margin-left": "auto",
							"margin-right": "0",
							});
							}
							}

							<!-- Swap the places of botttom elements -->
							function swap_bottom_options(state, mainSelector) {
							let style = {
							flex_direction: "row-reverse",
							table_info_style: {
							margin_right: 0,
							margin_left: "auto",
							},
							table_paginate_style: {
							margin_right: "auto",
							margin_left: 0,
							},
							};
							if (state) {
							bottom_option_style(style, mainSelector);
							} else {
							style["flex_direction"] = "row";

							style.table_info_style["margin_left"] = 0;
							style.table_info_style["margin_right"] = "auto";

							style.table_paginate_style["margin_left"] = "auto";
							style.table_paginate_style["margin_right"] = 0;

							bottom_option_style(style, mainSelector);
							}
							}

							<!-- Swap the bottom options by changing css style -->
							function bottom_option_style($arg, mainSelector) {
							mainSelector.find('.bottom_options').css("flex-direction", $arg["flex_direction"]);
							mainSelector.find('#create_tables_info').css({
							"margin-left": $arg["table_info_style"]["margin_left"],
							"margin-right": $arg["table_info_style"]["margin_right"],
							});
							mainSelector.find('#create_tables_paginate').css({
							"margin-left": $arg["table_paginate_style"]["margin_left"],
							"margin-right": $arg["table_paginate_style"]["margin_right"],
							});
							}

							<!-- Change the redirection type of links that are in inside table cell -->
							function changeRedirectionType(type, mainSelector) {
							let links = mainSelector.find('#create_tables a');
							if (!links.length) return;
							$.each(links, function (i, link) {
							$(link).attr("target", type);
							});
							}


							function table_changer(table_name, table_settings, dom, mainSelector) {
							mainSelector.find('#create_tables').DataTable(table_object(table_name, dom,
							table_settings));
							}


							function table_object(table_name, dom, table_settings) {
							let obj = {
							dom: dom,
							order: [],
							responsive: true,
							lengthMenu: [
							[1, 5, 10, 15],
							[1, 5, 10, 15],
							],
							pageLength: parseInt(table_settings.defaultRowsPerPage),
							lengthChange: true,
							ordering: table_settings.allowSorting,
							destroy: true,
							scrollX: true,
							};

							obj.lengthMenu = [
							[1, 5, 10, 15, 25, 50, 100, -1],
							[1, 5, 10, 15, 25, 50, 100, "All"],
							];

							if (table_settings.verticalScroll != "default") {
							obj.scrollY = `${table_settings.verticalScroll}px`;
							}

							return obj;
							}



							<!-- Settings modal -->
							function settingsModal(tableID){
							<?php $settings_class = new TableSettings(); ?>
							return `
							<div class="modal_wrapper" style="min-height: 740px;">
								<div class="modal_container">

									<div class="settings_container">
										<span class="large_promo_close">
											<?php require SWPTLS_BASE_PATH . 'assets/public/images/promo-close.svg'; ?>
										</span>
										<div class="tabs">

											<input type="radio" id="tab1" name="tab-control" checked>
											<input type="radio" id="tab2" name="tab-control">
											<input type="radio" id="tab3" name="tab-control">
											<ul>
												<li title="Display Settings">
													<label for="tab1" role="button">
														<span>
															<?php require SWPTLS_BASE_PATH . 'assets/public/icons/cogs-solid.svg'; ?>
														</span>
														<span><?php esc_html_e( 'Display Settings', 'sheetstowptable' ); ?></span>
													</label>
												</li>
												<li title="Sort & Filter">
													<label for="tab2" role="button">
														<span>
															<?php require SWPTLS_BASE_PATH . 'assets/public/icons/sort-numeric-up-solid.svg'; ?>
														</span>
														<span><?php esc_html_e( 'Sort & Filter', 'sheetstowptable' ); ?></span>
													</label>
												</li>
												<li title="Table Tools">
													<label for="tab3" role="button">
														<span><?php require SWPTLS_BASE_PATH . 'assets/public/icons/tools-solid.svg'; ?></span>
														<span><?php esc_html_e( 'Table Tools', 'sheetstowptable' ); ?></span>
													</label>
												</li>
											</ul>

											<div class="slider">
												<div class="indicator"></div>
											</div>
											<div class="content">
												<section class="display_settings">
													<div class="feature-container">
														<?php $settings_class->display_settings(); ?>
													</div>
												</section>
												<section class="sort_filter">
													<div class="feature-container">
														<?php $settings_class->sort_and_filter_settings(); ?>
													</div>
												</section>
												<section class="table_tools">
													<div class="feature-container">
														<?php $settings_class->table_tools_settings(); ?>
													</div>
												</section>
											</div>
										</div>
									</div>
								</div>
							</div>
							`;
							}
							})
							#>
						<?php
	}

					/**
					 * Displays table container.
					 *
					 * @since 2.13.1
					 */
	public function table_container() {
		?>
							<div class="gswpts_create_table_container gswpts_table_{{{ settings.choose_table }}}" id="{{{ settings.choose_table }}}" class="col-12 d-flex justify-content-center align-content-center p-relative p-0 position-relative">
								<div id="spreadsheet_container">
									<div class="ui segment gswpts_table_loader" style="z-index: -1;">
										<div class="ui active inverted dimmer">
											<div class="ui large text loader">Loading</div>
										</div>
										<p></p>
										<p></p>
										<p></p>
									</div>
								</div>
							</div>
		<?php
	}

					/**
					 * Initialize content.
					 *
					 * @since 2.13.1
					 */
	public function init_content() {
		?>
							<div class="gswpts_create_table_container" style="margin-right: 0px;">
								<div class="block_initializer">
									<div class="ui green message" style="width:70%; margin: 0 auto;text-align: center; font-weight: bold;"><?php esc_html_e( 'Choose any saved table to load data', 'sheetstowptable' ); ?></div>
								</div>
							</div>
						<?php
	}

					/**
					 * Displays table settings.
					 *
					 * @since 2.13.1
					 */
	public function show_table_settings() {
		?>
							<div class="gswpts_table_settings" style="margin-right: 0px;">
								<div class="block_initializer">
									<div class="ui green message" style="width:70%; margin: 0 auto;text-align: center; font-weight: bold;"><?php esc_html_e( 'Choose any saved table to load data', 'sheetstowptable' ); ?></div>
								</div>
							</div>
					<?php
	}
}
