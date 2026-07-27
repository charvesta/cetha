export interface DataTableColumn<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => Node | string;
}

export interface DataTableOptions<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  filter?: (row: T, query: string) => boolean;
}

export class DataTableController<T extends Record<string, unknown>> {
  #root: HTMLElement;
  #options: DataTableOptions<T>;
  #query = '';
  #page = 1;
  #sortKey?: keyof T & string;
  #sortDirection: 'asc' | 'desc' = 'asc';

  constructor(root: HTMLElement, options: DataTableOptions<T>) {
    this.#root = root;
    this.#options = options;
    this.#bind();
    this.render();
  }

  setData(data: T[]): void {
    this.#options.data = data;
    this.#page = 1;
    this.render();
  }

  setQuery(query: string): void {
    this.#query = query.trim().toLocaleLowerCase();
    this.#page = 1;
    this.render();
  }

  #bind(): void {
    this.#root.querySelector<HTMLInputElement>('[data-cetha-table-search]')?.addEventListener('input', (event) => {
      this.setQuery((event.currentTarget as HTMLInputElement).value);
    });
    this.#root.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cetha-table-sort], [data-cetha-table-page]') : null;
      if (!target) return;
      if (target.dataset.cethaTableSort) {
        const key = target.dataset.cethaTableSort as keyof T & string;
        this.#sortDirection = this.#sortKey === key && this.#sortDirection === 'asc' ? 'desc' : 'asc';
        this.#sortKey = key;
      } else if (target.dataset.cethaTablePage) {
        this.#page = Number(target.dataset.cethaTablePage) || 1;
      }
      this.render();
    });
  }

  #rows(): T[] {
    const filter = this.#options.filter ?? ((row: T, query: string) => Object.values(row).some((value) => String(value ?? '').toLocaleLowerCase().includes(query)));
    const rows = this.#query ? this.#options.data.filter((row) => filter(row, this.#query)) : [...this.#options.data];
    if (!this.#sortKey) return rows;
    const key = this.#sortKey;
    const direction = this.#sortDirection === 'asc' ? 1 : -1;
    return rows.sort((a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, { numeric: true }) * direction);
  }

  render(): void {
    const body = this.#root.querySelector<HTMLTableSectionElement>('[data-cetha-table-body]');
    const empty = this.#root.querySelector<HTMLElement>('[data-cetha-table-empty]');
    const pager = this.#root.querySelector<HTMLElement>('[data-cetha-table-pages]');
    if (!body) return;

    const rows = this.#rows();
    const pageSize = this.#options.pageSize ?? 10;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    this.#page = Math.min(this.#page, pageCount);
    const visible = rows.slice((this.#page - 1) * pageSize, this.#page * pageSize);
    body.replaceChildren();
    visible.forEach((row) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-cetha-line last:border-0';
      this.#options.columns.forEach((column) => {
        const td = document.createElement('td');
        td.className = 'px-4 py-3 text-sm text-cetha-text';
        const value = row[column.key];
        const rendered = column.render?.(value, row) ?? String(value ?? '');
        if (rendered instanceof Node) td.append(rendered);
        else td.textContent = rendered;
        tr.append(td);
      });
      body.append(tr);
    });
    empty?.toggleAttribute('hidden', rows.length > 0);

    if (pager) {
      pager.replaceChildren();
      for (let page = 1; page <= pageCount; page += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.cethaTablePage = String(page);
        button.className = 'cetha-focus min-h-8 min-w-8 rounded-cetha-sm px-2 text-xs font-medium';
        button.textContent = String(page);
        button.setAttribute('aria-current', page === this.#page ? 'page' : 'false');
        if (page === this.#page) button.classList.add('bg-cetha-brand', 'text-white');
        else button.classList.add('text-cetha-text', 'hover:bg-cetha-control');
        pager.append(button);
      }
    }
  }
}
