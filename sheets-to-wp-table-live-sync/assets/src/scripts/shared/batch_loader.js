/**
 * Server-side pagination (batch loading) client.
 *
 * The first batch is rendered and turned into a DataTable by the regular
 * table code. This loader then fetches the remaining rows in the background
 * and appends them with the DataTables API, keeping the user's page, sorting,
 * search and filters. Pro sheet features (styles, merges, images, links) that
 * were not ready yet are fetched on a separate, low priority queue and patched
 * into rows that are already visible, so slow Apps Script calls never block rows.
 *
 * Framework agnostic: used by the frontend, the React editor and the
 * Gutenberg / Elementor / Divi previews (exposed as window.SwptlsBatchLoader).
 */

const MAX_BACKGROUND_BATCH = 2000;
const FAST_RESPONSE_MS = 400;
const SLOW_RESPONSE_MS = 1500;
const MAX_RETRIES = 3;
const BUSY_RETRY_MS = 2500;
// Feature (Apps Script) requests per table that run at the same time as the data batches.
const FEATURE_CONCURRENCY = 2;
// Delay before re-measuring column widths, so several patches cause one resize.
const ADJUST_DELAY_MS = 120;

const STYLE_ID = 'swptls-batch-indicator-style';

const DEFAULT_STRINGS = {
    'batch-loading-rows': 'Loading rows',
    'batch-of': 'of',
    'batch-remaining': 'remaining',
    'batch-all-loaded': 'All rows loaded',
    'batch-load-failed': 'Some rows could not be loaded.',
    'batch-retry': 'Retry',
};

const scheduleIdle = (callback) => {
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(callback, { timeout: 300 });
    } else {
        setTimeout(callback, 16);
    }
};

const formatNumber = (value) => {
    try {
        return Number(value).toLocaleString();
    } catch (e) {
        return String(value);
    }
};

/**
 * Parse <tr> markup into detached row nodes. A <template> keeps the markup
 * inert, so images only start loading once rows are added to the table.
 */
const parseRows = (html) => {
    const template = document.createElement('template');
    template.innerHTML = `<table><tbody>${html || ''}</tbody></table>`;

    return Array.from(template.content.querySelectorAll('tbody > tr')).map((row) => document.importNode(row, true));
};

const copyAttributes = (target, source) => {
    Array.from(target.attributes).forEach((attr) => target.removeAttribute(attr.name));
    Array.from(source.attributes).forEach((attr) => target.setAttribute(attr.name, attr.value));
};

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.swptls-batch-indicator{--swptls-batch-color:#2F80ED;display:flex;flex-direction:column;gap:6px;width:100%;max-width:360px;margin:10px 0 4px;font-size:12px;line-height:1.4;color:#6b7280;box-sizing:border-box;transition:opacity .4s ease}
.swptls-batch-indicator.is-centered{margin-left:auto;margin-right:auto}
.swptls-batch-indicator__text{display:flex;align-items:center;flex-wrap:wrap;gap:4px}
.swptls-batch-indicator__text strong{color:#374151;font-weight:600}
.swptls-batch-indicator__spinner{width:10px;height:10px;border:2px solid #e5e7eb;border-top-color:var(--swptls-batch-color);border-radius:50%;animation:swptls-batch-spin .8s linear infinite;flex:0 0 auto}
.swptls-batch-indicator__bar{position:relative;height:4px;border-radius:4px;background:#e5e7eb;overflow:hidden}
.swptls-batch-indicator__bar span{position:absolute;inset:0 auto 0 0;width:0;border-radius:4px;background:var(--swptls-batch-color);transition:width .3s ease}
.swptls-batch-indicator.is-complete .swptls-batch-indicator__spinner{display:none}
.swptls-batch-indicator.is-hidden{opacity:0}
.swptls-batch-indicator__retry{background:none;border:0;padding:0;color:var(--swptls-batch-color);cursor:pointer;text-decoration:underline;font:inherit}
@keyframes swptls-batch-spin{to{transform:rotate(360deg)}}
@media (max-width:600px){.swptls-batch-indicator{max-width:100%}}
`;
    document.head.appendChild(style);
};

export default class SwptlsBatchLoader {
    /**
     * @param {Object}   options
     * @param {Object}   options.table        DataTables API instance of the table.
     * @param {Element}  options.container    Element the indicator is appended to (after the DataTables wrapper).
     * @param {Object}   options.batch        `batch` meta returned with the first batch.
     * @param {number}   options.tableId      Table id.
     * @param {string}   options.ajaxUrl      admin-ajax.php url.
     * @param {string}   options.nonce        Nonce (frontend sheet nonce or admin nonce).
     * @param {Object}   [options.params]     Extra POST params (editor previews send table_settings, table_name).
     * @param {Object}   [options.strings]    Translated strings.
     * @param {boolean}  [options.indicator]  Show the loading indicator (defaults to batch.indicator).
     * @param {Function} [options.onRowsPrepared] Called with a detached <tbody> holding new or enriched rows, before they are added.
     * @param {Function} [options.onRowsAdded]    Called with the added row nodes after drawing.
     * @param {Function} [options.onHeaderPatched] Called after header styles/merges were patched.
     * @param {Function} [options.onBeforeAdjust]  Called before column widths are re-measured.
     * @param {Function} [options.onComplete]     Called once every row is loaded.
     */
    constructor(options) {
        this.options = options || {};
        this.table = this.options.table;
        this.batch = this.options.batch || {};
        this.strings = Object.assign({}, DEFAULT_STRINGS, this.options.strings || {});

        this.snapshotId = this.batch.snapshot_id;
        this.total = parseInt(this.batch.total_rows, 10) || 0;
        this.loaded = parseInt(this.batch.loaded, 10) || 0;
        this.nextOffset = parseInt(this.batch.next_offset, 10) || this.loaded;
        this.hasMore = !!this.batch.has_more;
        this.batchSize = Math.max(1, parseInt(this.batch.batch_size, 10) || 25);
        this.nextSize = this.batchSize;
        this.featureChunk = parseInt(this.batch.feature_chunk, 10) || 1000;
        this.showIndicator = typeof this.options.indicator === 'boolean' ? this.options.indicator : !!this.batch.indicator;

        this.rowMap = new Map();
        this.featureQueue = [];
        this.featureActive = 0;
        this.requests = new Set();
        this.retries = 0;
        this.stopped = false;
        this.complete = !this.hasMore;
        this.indicator = null;

        this.indexExistingRows();

        if (this.batch.features && !this.batch.enriched && this.loaded > 0) {
            this.queueFeatures(0, this.loaded);
        }
    }

    /**
     * Start loading. Safe to call once.
     */
    start() {
        if (!this.table || !this.snapshotId) {
            return this;
        }

        if (this.showIndicator && this.hasMore) {
            this.renderIndicator();
        }

        if (this.hasMore) {
            scheduleIdle(() => this.loadNext());
        } else {
            this.finish();
        }

        this.processFeatures();

        // A newly shown page can have wider content, and its images may still be loading.
        this.onDraw = () => {
            this.watchImages(this.table.rows({ page: 'current' }).nodes().toArray());
            this.realignHeader();
        };
        this.table.on('draw.dt', this.onDraw);

        return this;
    }

    /**
     * Stop all background work (table removed, settings changed, ...).
     */
    destroy() {
        this.stopped = true;
        this.requests.forEach((xhr) => xhr && xhr.abort && xhr.abort());
        this.requests.clear();
        clearTimeout(this.adjustTimer);

        if (this.onDraw) {
            try {
                this.table.off('draw.dt', this.onDraw);
            } catch (e) {
                // The table may already be gone.
            }
            this.onDraw = null;
        }

        if (this.indicator && this.indicator.parentNode) {
            this.indicator.parentNode.removeChild(this.indicator);
        }

        this.indicator = null;
    }

    isAlive() {
        if (this.stopped) {
            return false;
        }

        try {
            const node = this.table.table().node();
            if (!node || !document.body.contains(node)) {
                this.destroy();
                return false;
            }
        } catch (e) {
            this.destroy();
            return false;
        }

        return true;
    }

    indexExistingRows() {
        this.table.rows().every((rowIdx) => {
            const node = this.table.row(rowIdx).node();
            const index = node ? parseInt(node.getAttribute('data-index'), 10) : NaN;

            if (!Number.isNaN(index)) {
                this.rowMap.set(index, rowIdx);
            }
        });
    }

    post(action, data) {
        const $ = window.jQuery;

        return new Promise((resolve, reject) => {
            const xhr = $.ajax({
                url: this.options.ajaxUrl,
                type: 'post',
                dataType: 'json',
                data: Object.assign(
                    {
                        action,
                        id: this.options.tableId,
                        nonce: this.options.nonce,
                        snapshot_id: this.snapshotId,
                        load_id: this.batch.load_id || '',
                    },
                    this.options.params || {},
                    data
                ),
            });

            this.requests.add(xhr);

            xhr.done((res) => resolve(res))
                .fail((err) => reject(err))
                .always(() => this.requests.delete(xhr));
        });
    }

    loadNext() {
        if (!this.isAlive() || !this.hasMore) {
            return;
        }

        const limit = Math.min(this.nextSize, Math.max(1, this.total - this.nextOffset));
        const offset = this.nextOffset;
        const startedAt = Date.now();

        this.post('gswpts_sheet_fetch_batch', { offset, limit })
            .then((res) => {
                if (!this.isAlive()) {
                    return;
                }

                if (!res || !res.success) {
                    throw new Error((res && res.data && res.data.type) || 'batch_failed');
                }

                this.retries = 0;
                this.adaptBatchSize(Date.now() - startedAt);

                const data = res.data;
                const nodes = this.appendRows(data.rows_html);

                this.loaded += nodes.length;
                this.nextOffset = data.next_offset;
                this.total = parseInt(data.total_rows, 10) || this.total;
                this.hasMore = !!data.has_more && nodes.length > 0;

                if (this.batch.features && !data.enriched && nodes.length) {
                    this.queueFeatures(offset, nodes.length);
                    this.processFeatures();
                }

                this.updateIndicator();

                if (this.hasMore) {
                    scheduleIdle(() => this.loadNext());
                } else {
                    this.finish();
                }
            })
            .catch((error) => {
                if (this.stopped || (error && error.statusText === 'abort')) {
                    return;
                }

                // An expired snapshot cannot be resumed; keep what is loaded.
                if (error && error.message === 'snapshot_expired') {
                    this.fail();
                    return;
                }

                if (this.retries < MAX_RETRIES) {
                    this.retries += 1;
                    setTimeout(() => this.loadNext(), 1000 * Math.pow(3, this.retries - 1));
                } else {
                    this.fail();
                }
            });
    }

    /**
     * Grow background batches while the server answers quickly, shrink them
     * when it slows down. The first batch keeps the configured size.
     */
    adaptBatchSize(duration) {
        if (duration < FAST_RESPONSE_MS) {
            this.nextSize = Math.min(this.nextSize * 2, Math.max(MAX_BACKGROUND_BATCH, this.batchSize));
        } else if (duration > SLOW_RESPONSE_MS) {
            this.nextSize = Math.max(this.batchSize, Math.floor(this.nextSize / 2));
        }
    }

    prepare(html) {
        const nodes = parseRows(html);

        if (!nodes.length) {
            return nodes;
        }

        // Let integrations run their row features (cell format, links, merges) on a detached copy.
        const tbody = document.createElement('tbody');
        nodes.forEach((node) => tbody.appendChild(node));

        if (typeof this.options.onRowsPrepared === 'function') {
            try {
                this.options.onRowsPrepared(tbody, nodes);
            } catch (e) {
                // Row features are cosmetic, never stop loading because of them.
            }
        }

        return nodes;
    }

    appendRows(html) {
        const nodes = this.prepare(html);

        if (!nodes.length) {
            return nodes;
        }

        const added = this.table.rows.add(nodes);

        added.indexes().each((rowIdx) => {
            const node = this.table.row(rowIdx).node();
            const index = node ? parseInt(node.getAttribute('data-index'), 10) : NaN;

            if (!Number.isNaN(index)) {
                this.rowMap.set(index, rowIdx);
            }
        });

        // draw(false) keeps the current page, order, search and filters.
        this.table.draw(false);

        if (typeof this.options.onRowsAdded === 'function') {
            try {
                this.options.onRowsAdded(nodes);
            } catch (e) {
                // Cosmetic only.
            }
        }

        // New rows can be wider than the first batch (rows arriving already enriched).
        this.watchImages(nodes);
        this.scheduleAdjust();

        return nodes;
    }

    /**
     * Queue rows for features, split along the server's feature blocks
     * (feature_chunk rows each), so parallel requests never wait on the same block.
     */
    queueFeatures(start, count) {
        while (count > 0) {
            const block = Math.floor(start / this.featureChunk);
            const part = Math.min(count, (block + 1) * this.featureChunk - start);
            const waiting = this.featureQueue.find((item) => item.block === block && item.start + item.count === start);

            if (waiting) {
                waiting.count += part;
            } else {
                this.featureQueue.push({ block, start, count: part });
            }

            start += part;
            count -= part;
        }
    }

    processFeatures() {
        // Feature requests run next to the data batches, a few at a time.
        while (this.featureActive < FEATURE_CONCURRENCY && this.featureQueue.length && this.isAlive()) {
            // Take the range off the queue now, so rows arriving meanwhile start a new range.
            this.requestFeatures(this.featureQueue.shift());
        }
    }

    requestFeatures(item) {
        this.featureActive += 1;

        this.post('gswpts_sheet_fetch_features', { start: item.start, count: item.count })
            .then((res) => {
                if (!this.isAlive()) {
                    return;
                }

                const data = res && res.success ? res.data : null;

                if (data && data.status === 'busy') {
                    // Another request is fetching the same rows; ask again shortly.
                    setTimeout(() => {
                        this.featureActive -= 1;
                        this.featureQueue.unshift(item);
                        this.processFeatures();
                    }, BUSY_RETRY_MS);
                    return;
                }

                if (data && data.status === 'none') {
                    this.featureQueue = [];
                } else if (data && data.rows_html) {
                    this.patchRows(data.rows_html);

                    if (data.head_html) {
                        this.patchHeader(data.head_html);
                    }
                }

                this.featureActive -= 1;
                scheduleIdle(() => this.processFeatures());
            })
            .catch(() => {
                // Leave these rows plain and move on.
                this.featureActive -= 1;

                if (!this.stopped) {
                    setTimeout(() => this.processFeatures(), BUSY_RETRY_MS);
                }
            });
    }

    /**
     * Replace plain rows with their enriched version. Existing nodes are kept
     * (DataTables holds references to them); only attributes and content change.
     */
    patchRows(html) {
        const nodes = this.prepare(html);
        const patched = [];

        nodes.forEach((source) => {
            const index = parseInt(source.getAttribute('data-index'), 10);
            const rowIdx = this.rowMap.get(index);

            if (rowIdx === undefined) {
                return;
            }

            const row = this.table.row(rowIdx);
            const target = row.node();

            if (!target) {
                return;
            }

            // Keep DataTables' own odd/even classes until the next draw.
            const keep = ['odd', 'even'].filter((cls) => target.classList.contains(cls));
            copyAttributes(target, source);
            keep.forEach((cls) => target.classList.add(cls));

            // Every cell node of the row, including cells of hidden columns.
            const rowData = this.table.settings()[0].aoData[rowIdx];
            const cells = rowData && rowData.anCells ? Array.from(rowData.anCells) : Array.from(target.children);
            const sourceCells = Array.from(source.children);

            cells.forEach((cell, i) => {
                if (sourceCells[i]) {
                    copyAttributes(cell, sourceCells[i]);
                    cell.innerHTML = sourceCells[i].innerHTML;
                }
            });

            row.invalidate('dom');
            patched.push(target);
        });

        if (patched.length) {
            this.table.draw(false);

            if (typeof this.options.onRowsAdded === 'function') {
                try {
                    this.options.onRowsAdded(patched);
                } catch (e) {
                    // Cosmetic only.
                }
            }

            // Images and links make columns wider: realign the header now and once images load.
            this.watchImages(patched);
            this.scheduleAdjust();
        }
    }

    /**
     * Realign the header when content changed. With horizontal scrolling
     * DataTables draws the header in a separate table sized at init, so
     * content patched in later (images, links, styles) can leave it out of
     * line. Columns are only re-measured when they really are out of line,
     * so loading batches never makes a correct header move.
     * columns.adjust() only resizes; it keeps the page, order and search.
     */
    scheduleAdjust() {
        clearTimeout(this.adjustTimer);
        this.adjustTimer = setTimeout(() => this.realignHeader(), ADJUST_DELAY_MS);
    }

    /**
     * Realign right away. Called from the table's draw event, so it runs in the
     * same frame as the change and the misaligned header is never painted.
     */
    realignHeader() {
        if (!this.isAlive() || this.isHeaderAligned()) {
            return;
        }

        try {
            // Let integrations drop widths they remembered from the first batch.
            if (typeof this.options.onBeforeAdjust === 'function') {
                this.options.onBeforeAdjust();
            }

            this.table.columns.adjust();
        } catch (e) {
            // Cosmetic only.
        }
    }

    /**
     * Whether the visible header cells line up with the body columns. The body
     * table keeps a hidden copy of the header row (DataTables' sizing row), with
     * the same cells and colspans as the visible header, so merged header cells
     * are compared like any other.
     */
    isHeaderAligned() {
        const scrollHead = this.table.settings()[0].nScrollHead;

        // Without horizontal/vertical scrolling the header is part of the body table.
        if (!scrollHead) {
            return true;
        }

        const visible = scrollHead.querySelectorAll('thead tr:first-child > th');
        const sizing = this.table.table().node().querySelectorAll('thead tr:first-child > th');

        if (!visible.length || visible.length !== sizing.length) {
            return true;
        }

        for (let i = 0; i < visible.length; i++) {
            const a = visible[i].getBoundingClientRect();
            const b = sizing[i].getBoundingClientRect();

            // Hidden cells (e.g. covered by a merged header cell) have no box to compare.
            if (!a.width || !b.width) {
                continue;
            }

            if (Math.abs(a.left - b.left) > 1 || Math.abs(a.width - b.width) > 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Realign the header when images inside these rows finish loading.
     */
    watchImages(rows) {
        rows.forEach((row) => {
            row.querySelectorAll('img').forEach((img) => {
                if (!img.complete) {
                    img.addEventListener('load', () => this.scheduleAdjust(), { once: true });
                    img.addEventListener('error', () => this.scheduleAdjust(), { once: true });
                }
            });
        });
    }

    patchHeader(html) {
        const template = document.createElement('template');
        template.innerHTML = `<table><thead>${html}</thead></table>`;
        const sources = Array.from(template.content.querySelectorAll('thead th'));

        sources.forEach((source, i) => {
            let header;

            try {
                header = this.table.column(i).header();
            } catch (e) {
                header = null;
            }

            if (!header) {
                return;
            }

            ['style', 'data-merge'].forEach((name) => {
                if (source.hasAttribute(name)) {
                    header.setAttribute(name, source.getAttribute(name));
                }
            });
        });

        if (typeof this.options.onHeaderPatched === 'function') {
            try {
                this.options.onHeaderPatched();
            } catch (e) {
                // Cosmetic only.
            }
        }

        this.realignHeader();
    }

    finish() {
        this.complete = true;
        this.hasMore = false;
        this.updateIndicator();

        if (typeof this.options.onComplete === 'function') {
            try {
                this.options.onComplete(this);
            } catch (e) {
                // Ignore.
            }
        }
    }

    fail() {
        this.hasMore = false;

        if (!this.indicator && this.showIndicator) {
            this.renderIndicator();
        }

        if (!this.indicator) {
            return;
        }

        const text = this.indicator.querySelector('.swptls-batch-indicator__text');
        this.indicator.classList.add('is-complete');
        text.textContent = `${this.strings['batch-load-failed']} `;

        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'swptls-batch-indicator__retry';
        retry.textContent = this.strings['batch-retry'];
        retry.addEventListener('click', () => {
            this.retries = 0;
            this.hasMore = this.nextOffset < this.total;
            this.indicator.classList.remove('is-complete');
            this.updateIndicator();
            this.loadNext();
        });
        text.appendChild(retry);
    }

    renderIndicator() {
        if (this.indicator || !this.options.container) {
            return;
        }

        injectStyles();

        const indicator = document.createElement('div');
        indicator.className = 'swptls-batch-indicator';
        indicator.setAttribute('role', 'status');
        indicator.setAttribute('aria-live', 'polite');
        indicator.innerHTML = '<div class="swptls-batch-indicator__text"></div><div class="swptls-batch-indicator__bar"><span></span></div>';

        // Follow the table theme's pagination color and alignment.
        try {
            const tableNode = this.table.table().node();
            const color = tableNode && tableNode.style.getPropertyValue('--pagination-colors');
            if (color && color.trim()) {
                indicator.style.setProperty('--swptls-batch-color', color.trim());
            }
            if (tableNode && tableNode.style.getPropertyValue('--pagination_center').trim() === '1') {
                indicator.classList.add('is-centered');
            }
        } catch (e) {
            // Defaults are fine.
        }

        const wrapper = this.table.table().container ? this.table.table().container() : null;
        if (wrapper && wrapper.parentNode && this.options.container.contains(wrapper)) {
            wrapper.parentNode.insertBefore(indicator, wrapper.nextSibling);
        } else {
            this.options.container.appendChild(indicator);
        }

        this.indicator = indicator;
        this.updateIndicator();
    }

    updateIndicator() {
        if (!this.indicator) {
            return;
        }

        const text = this.indicator.querySelector('.swptls-batch-indicator__text');
        const bar = this.indicator.querySelector('.swptls-batch-indicator__bar span');
        const percent = this.total > 0 ? Math.min(100, Math.round((this.loaded / this.total) * 100)) : 100;

        bar.style.width = `${percent}%`;

        if (this.complete) {
            this.indicator.classList.add('is-complete');
            text.textContent = `${this.strings['batch-all-loaded']} (${formatNumber(this.total)})`;

            const indicator = this.indicator;
            setTimeout(() => indicator.classList.add('is-hidden'), 1500);
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
                if (this.indicator === indicator) {
                    this.indicator = null;
                }
            }, 2000);
            return;
        }

        const remaining = Math.max(0, this.total - this.loaded);
        text.innerHTML = '';

        const spinner = document.createElement('span');
        spinner.className = 'swptls-batch-indicator__spinner';
        text.appendChild(spinner);

        const label = document.createElement('span');
        label.innerHTML = `${this.strings['batch-loading-rows']} <strong>${formatNumber(this.loaded)}</strong> ${this.strings['batch-of']} <strong>${formatNumber(this.total)}</strong> · ${formatNumber(remaining)} ${this.strings['batch-remaining']}`;
        text.appendChild(label);
    }
}

/**
 * Hide the cells covered by merged cells inside `root` (same rules as the
 * frontend handleMergedCells), for integrations without jQuery helpers.
 */
export const hideMergedCells = (root) => {
    if (!root || !root.querySelectorAll) {
        return;
    }

    root.querySelectorAll('td.parentCellstart[data-merge][data-index]').forEach((parent) => {
        let merge;
        let index;

        try {
            merge = JSON.parse(parent.getAttribute('data-merge'));
            index = JSON.parse(parent.getAttribute('data-index'));
        } catch (e) {
            return;
        }

        for (let i = 0; i < merge[0]; i++) {
            for (let j = 0; j < merge[1]; j++) {
                const target = root.querySelector(`[data-index="[${index[0] + i},${index[1] + j}]"]`);

                if (!target) {
                    continue;
                }

                const content = target.querySelector('.cell_div');

                if (!content || content.textContent.trim() === '') {
                    target.classList.add('merged-cell');
                    target.style.display = 'none';
                    parent.style.textAlign = 'center';
                    parent.style.verticalAlign = 'middle';
                } else {
                    target.classList.add('normal-cell');
                }
            }
        }
    });
};

/**
 * Attach a loader to a table rendered from a batch response.
 * Returns null when the response is not a batch response.
 */
export const attachBatchLoader = (options) => {
    if (!options || !options.batch || !options.table) {
        return null;
    }

    return new SwptlsBatchLoader(options).start();
};

if (typeof window !== 'undefined') {
    window.SwptlsBatchLoader = SwptlsBatchLoader;
    window.swptlsAttachBatchLoader = attachBatchLoader;
    window.swptlsHideMergedCells = hideMergedCells;
}
