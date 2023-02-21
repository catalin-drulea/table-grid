/**
 * Page Object for the @see SlGridComponent component. Exposes APIs
 * that interact with component HTML elements during tests.
 */
 export class SlGridPageObject {
    grid: HTMLElement;

    constructor(element: HTMLElement) {
        this.grid = element;
    }

    getRows(): NodeListOf<Element> {
        return this.grid.querySelectorAll('smart-table table tbody tr');
    }

    getCellText(rowIndex: number, columnIndex: number): string {
        const row = this.getRow(rowIndex);
        return row.querySelectorAll('td')[columnIndex].textContent;
    }

    getRow(rowIndex: number): HTMLElement {
        return this.getRows()[rowIndex] as HTMLElement;
    }

    getColumn(columnIndex: number): HTMLTableHeaderCellElement {
        return this.grid.querySelectorAll<HTMLTableHeaderCellElement>('smart-table table thead th')[columnIndex];
    }

    getColumnWidth(columnIndex: number): number {
        return this.getColumn(columnIndex).clientWidth;
    }

    getHeaderText(columnIndex: number): string {
        const headers = this.grid.querySelectorAll('smart-table table thead th');
        return headers[columnIndex]?.textContent;
    }

    clickHeader(index: number): void {
        const header = this.grid.querySelectorAll('smart-table table thead th')[index] as HTMLElement;
        header.click();
    }

    clickCell(rowIndex: number, columnIndex: number): void {
        const row = this.getRow(rowIndex);
        row.querySelectorAll('td')[columnIndex].click();
    }

    getAllHeadersText(): string[] {
        const headersText = [];
        const headers = this.grid.querySelectorAll('smart-table table thead th');
        headers.forEach(header => {
            if (header.textContent) {
                headersText.push(header.textContent);
            }
        });
        return headersText;
    }

    getGroupExpandButton(groupIndex: number): HTMLElement {
        return this.grid.querySelectorAll('.smart-arrow-down')[groupIndex] as HTMLElement;
    }

    clickGroupExpandButton(groupIndex: number): void {
        (this.grid.querySelectorAll('.smart-arrow-down')[groupIndex] as HTMLElement).click();
    }

    getGroupHeader(groupIndex: number): string {
        const groupHeaderName = this.grid.querySelectorAll('.group-header .group-label-name')[groupIndex].textContent;
        const groupHeaderValue = this.grid.querySelectorAll('.group-header .group-label-value')[groupIndex].textContent;
        const groupHeaderCount = this.grid.querySelectorAll('.group-header .group-label-count')[groupIndex].textContent;

        return `${groupHeaderName}${groupHeaderValue}${groupHeaderCount}`;
    }

    isGroupExpanded(groupIndex: number): boolean {
        const groupHeaderRow = (this.grid.querySelectorAll('.group-header')[groupIndex] as HTMLElement).parentElement;
        return groupHeaderRow.classList.contains('expanded');
    }

    isTreeNodeExpanded(rowIndex: number): boolean {
        return this.getRow(rowIndex).classList.contains('expanded');
    }

    getGroupsHeaderNumber(): number {
        return this.grid.querySelectorAll('.group-header').length;
    }

    getSelection(): string[] {
        const ids: string[] = [];
        this.grid.querySelectorAll('smart-table table tbody tr td.selected').forEach((element: Element) => ids.push(element.parentElement.getAttribute('row-id')));
        return ids;
    }
}