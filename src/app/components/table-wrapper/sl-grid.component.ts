import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TableColumn, TableColumnSizeMode } from 'smart-webcomponents-angular';
import { TableComponent } from 'smart-webcomponents-angular/table';

export class SlGridRow {
    id: string;
    [property: string]: any;
}

export interface IGroupFormatSettings {
    value: any;
    row: string | number;
    column: string;
    template?: any;
}

export class SlCellClickEvent {
    dataField: string;
    resourceId: string;

    constructor(dataField: string, resourceId: string) {
        this.dataField = dataField;
        this.resourceId = resourceId;
    }
}

export const SlGridTranslations = {
    EMPTY: $localize`Empty`,
    UNDEFINED: $localize`Undefined`
};

export interface ISlGridConfiguration {
    visibleColumns: string[];
    columnWidths: ISlGridColumnWidth[];
    groupingProperties: string[];
    sortingProperties?: ISlGridSortingProperties[];
}

/**
 * An interface that defines type information for defining column width information in a @see ISlGridConfiguration
 */
export interface ISlGridColumnWidth {
    dataField: string;
    columnWidth: number | string;
}

/**
 * An interface that defines type information for defining sorting information in a @see ISlGridConfiguration
 */
export interface ISlGridSortingProperties {
    propertyName: string;
    direction: string;
}

/**
 * SlGridComponent provides a generic grid and interface with a selection service
 * that can be consumed in other apps to display data in a grid. The caller must supply
 * a dataSource and columns.
 */
@Component({
    selector: 'sl-grid',
    templateUrl: './sl-grid.component.html',
    styleUrls: ['./sl-grid.component.scss']
})
export class SlGridComponent implements OnChanges, OnInit, AfterViewInit {
    /**
     * @public
     * The ID of the grid as it appears in the DOM.
     */
    @Input() gridId: string;

    /**
     * @public
     * A list of @see SlGridRow objects that define information about the resources to be displayed.
     */
    @Input() dataSource: SlGridRow[];

    /**
     * @public
     * Defines a field name that represents the fingerprint that is used to track the update revision of an
     * item in the data source.
     *
     * If omitted the all rows are always updated.
     *
     * The value of the property needs to be a primitive (number, boolean, string, date)
     * since the table is not able to distinguish equality for more complex structure values like objects,or arrays.
     */
    @Input() dataSourceFingerprint: string;

    /**
     * @public
     * A list of @see TableColumn objects that define information about the columns to be displayed by the table.
     */
    @Input() columns: TableColumn[];

    /**
     * @public
     * Sets or gets the column sizing behavior. Defaults to 'auto'
     */
    @Input() columnSizeMode: TableColumnSizeMode = 'auto';

    /**
     * @public
     * Specifies whether the grid should load a previously saved state from the browser's local storage.
     */
    @Input() autoLoadState = true;

    /**
     * @public
     * Specifies whether the grid should automatically save its state into the browser's local storage.
     */
    @Input() autoSaveState = true;

    /**
     * @public
     * Specifies if the grouping feature should be enabled for the grid.
     */
    @Input() grouping = false;

    /**
     * @public
     * A callback function that is called whenever the name of a group needs to be rendered by the table and allows users to set the name of the group being rendered.
     */
    @Input() groupingFormatFunction: (settings: IGroupFormatSettings) => void;

    /**
     * @public
     * Specifies if virtualization should be enabled for the grid.
     */
    @Input() virtualization = false;

    /**
     * @public
     * Specifies the settings in regards to the grid state that should be saved by the grid. By default, the settings
     * that are in regards to the grid state that are persisted are the "columns" and "sorted" settings.
     */
    @Input() stateSettings = ['columns', 'sorted'];

    /**
     * @public
     * Sets the behavior when loading column settings via the "loadState" @see setTableState method. This is applicable only
     * when the @see stateSettings property contains 'columns'. By default, this property is set to "implementationOnly".
     */
    @Input() loadColumnStateBehavior = 'implementationOnly';

    /**
     * @public
     *  Specifies whether the grid should be displayed as a tree. Setting this property to "true" will require setting the
     * @see parentDataField property.
     */
    @Input() treeMode = false;

    /**
     * @public
     *  Specifies the data field that acts as the "parent" field. The underlying table component will build the tree based
     * on this data field. This field will only be taken into consideration if @see treeMode is set to "true".
     */
    @Input() parentDataField: string;

    /**
     * @public
     * The language to be used within the query builder. By default, the language is set to "en-us".
     */
    @Input() language = 'en-us';

    /**
     * @public
     * Overrides the sorting callback.
     */
    @Input() sort: (dataSource: SlGridRow[], sortColumns: string[], directions: string[], defaultCompareFunctions: ((firstRecord: SlGridRow, secondRecord: SlGridRow) => number)[]) => any;

    /**
     * @public
     * Sets the behavior of group selection. Setting this property to "true" will make the selection of a group header select
     * all items in that group, and the selection of all items in a group will also select the group header.
     * By default, the property is set to "true".
     */
    @Input() selectionByHierarchy = true;

    /**
     * @public
     * Fired when a sortable header cell was clicked
     */
    @Output() columnSorted: EventEmitter<any> = new EventEmitter();

    /**
     * @public
     * Fired when a column is resized
     */
    @Output() columnResized: EventEmitter<any> = new EventEmitter();

    /**
     * @public
     * An event that gets triggered when the user clicks any of the table headers. The event will contain the 'dataField'
     * associated with the clicked header.
     */
    @Output() headerClick: EventEmitter<string> = new EventEmitter<string>();

    /**
     * @public
     * An event that gets triggered when the user clicks a cell within the table. The event will contain the 'dataField' and
     * the ID of the clicked row.
     */
    @Output() cellClick: EventEmitter<SlCellClickEvent> = new EventEmitter<SlCellClickEvent>();

    /**
     * @public
     * An event that gets triggered when the user selects one or more rows in the table. The event will contain the IDs of the
     * selected rows.
     */
    @Output() selectedRowsChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

    @ViewChild('table', { read: TableComponent, static: true }) private table: TableComponent;

    private readonly smartTableTranslations = {
        EMPTY: $localize`Empty`,
        UNDEFINED: $localize`Undefined`
    };

    private columnSpreadWidthDataField = 'column-spread-width';

    /**
     * Signal the table that an update is starting. This stops refreshes until endUpdate() is called.
     */
    beginUpdate(): void {
        this.table.beginUpdate();
    }

    /**
     * Signal the table that the update has been completed. This restarts refreshes and rendering.
     */
    endUpdate(): void {
        this.table.endUpdate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.treeMode || changes.parentDataField) {
            this.reviseTreeSettings();
            let dataSource = this.dataSource;
            if (changes.dataSource) {
                dataSource = changes.dataSource.currentValue;
            }
            this.table.dataSource = dataSource;
            this.expandRows();
            return;
        }

        if (changes.dataSource) {
            this.reviseDataSource(changes.dataSource.currentValue);
        }
    }

    private reviseTreeSettings(): void {
        if (this.treeMode) {
            this.table.dataSourceSettings = {
                id: 'id',
                keyDataField: 'id',
                parentDataField: this.parentDataField,
                dataFields: this.getTreeDataFields(),
                sanitizeHTML: 'all'
            };
        } else {
            this.table.dataSourceSettings.id = '';
            this.table.dataSourceSettings.keyDataField = '';
            this.table.dataSourceSettings.parentDataField = '';
            this.table.dataSourceSettings.dataFields = [];
            this.table.dataSourceSettings.sanitizeHTML = 'all';
        }
    }

    private expandRows(): void {
        if (this.treeMode) {
            this.table.expandAllRows();
        } else {
            this.table.expandAllGroups();
        }
    }

    private getTreeDataFields(): any {
        const fields = [];
        if (!this.columns) {
            return fields;
        }

        let parentFieldFoundInColumnsDefinition = false;
        for (const col of this.columns) {
            const dataType = col.dataType || 'string';
            fields.push({
                name: col.dataField,
                dataType
            });
            if (col.dataField === this.parentDataField) {
                parentFieldFoundInColumnsDefinition = true;
            }
        }

        // It's safe to assume that we do not display the ID of the resource anywhere in the product
        fields.push({
            name: 'id',
            dataType: 'string'
        });
        // The parentDataField is not required in the columns definition, but it is always
        // required in the "dataFields" configuration of the table.dataSourceSettings configuration
        if (!parentFieldFoundInColumnsDefinition) {
            fields.push({
                name: this.parentDataField,
                dataType: 'string'
            });
        }
        return fields;
    }

    private reviseDataSource(updatedDataSourceItems: SlGridRow[]): void {
        const existingDataSource = this.table?.dataSource;
        if (!updatedDataSourceItems || !existingDataSource) {
            return;
        }

        if (existingDataSource.length === 0) {
            this.table.dataSource = updatedDataSourceItems;
            this.expandRows();
            return;
        }

        if (!this.dataSourceFingerprint) {
            this.table.dataSource = updatedDataSourceItems;
            return;
        }

        // Copy the data source to avoid updating the @Input data source when splicing
        const updatedDataSource = updatedDataSourceItems.map(a => Object.assign({}, a));

        // Signal the table that an update is starting -> cancels refreshes
        this.table.beginUpdate();

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < existingDataSource.length; i++) { // this.table.dataSource is not iterable
            let existingItemFound = false;
            const existingElement = existingDataSource[i];
            for (let j = 0, len = updatedDataSource.length; j < len; ++j) {
                const updatedElement = updatedDataSource[j];
                if (existingElement.id !== updatedElement.id) {
                    continue;
                }
                existingItemFound = true;
                if (existingElement[this.dataSourceFingerprint] !== updatedElement[this.dataSourceFingerprint]) {
                    this.table.updateRow(existingElement.id, updatedElement);
                }
                // Remove the updated element from the array since the remaining ones will be used to add them to the table
                // data source. The remaining elements are the ones that were added since the last update.
                updatedDataSource.splice(j, 1);
                break;
            }

            if (!existingItemFound) {
                this.table.removeRow(existingElement.id);
                // Decrement the index since the "existingDataSource" length will decrement after removal.
                i--;
            }
        }

        // The remaining "updateDataSource" elements need to be added to the dataSource
        for (const remaining of updatedDataSource) {
            this.table.addRow(remaining);
        }

        // Signal the table that the update has been completed -> restart refreshes & rendering
        this.table.endUpdate();
    }

    /**
     * @public
     * Returns an object containing the table settings that are stored based on the configured @see stateSettings
     * property.
     */
    async getTableState(): Promise<any> {
        return await this.table.getState();
    }

    /**
     * @public
     * Sets the table settings, information about columns, expanded rows, etc. Note that only the settings configured via
     * the @see stateSettings property will be taken into account.
     * @param tableState (any)
     *  The state settings with which the grid should be configured.
     */
    setTableState(tableState: any): void {
        this.table.loadState(tableState);
    }

    /**
     * @public
     * Gets a column width.
     * @param dataField The `dataField` value of the column.
     */
    getColumnWidth(dataField: string): Promise<string | number> {
        return this.table.getColumnProperty(dataField, 'width');
    }

    /**
     * @public
     * Sets a column width .
     * @param dataField The `dataField` value of the column.
     * @param value Property value (e.g. 50, '50px' or '10%').
     */
    setColumnWidth(dataField: string, value: string | number): void {
        return this.table.setColumnProperty(dataField, 'width', value);
    }

    /**
     * @public
     * Sets the data fields based on which the table should be grouped.
     * @param groupingFields A list of strings containing the data fields based on which grouping should be enabled.
     * @param expandGroups A boolean value that states whether the groups should be expanded, set true by default.
     * @param atomicUpdate A boolean value that states whether the table must be refreshed, set true by default.
     */
    setTableGrouping(groupingFields: string[], expandGroups: boolean = true, atomicUpdate: boolean = true): void {
        if (atomicUpdate) {
            this.table.beginUpdate();
        }
        this.table.clearGrouping();
        groupingFields.forEach(groupingField => this.table.addGroup(groupingField));

        if (expandGroups && groupingFields.length) {
            this.table.expandAllGroups();
        }
        if (atomicUpdate) {
            this.table.endUpdate();
        }
    }

    /**
     * @public
     * Selects a row or rows in the grid. Previous selections will be cleared.
     * @param id The id of a row or ids of rows to select.
     */
    setSelection(id: string | string[]): void {
        this.clearSelection();
        this.table.select(id);
    }

    /**
     * @public
     * Clears the selection from the grid.
     */
    clearSelection(): void {
        this.table.clearSelection();
    }

    /**
     * @public
     * Clears the grouping from the grid.
     */
    clearGrouping(): void {
        this.table.clearGrouping();
    }

    /**
     * @public
     *  Returns an object that consists in the current grid configuration in terms of:
     *      - visible columns
     *      - column widths
     *      - grouping properties
     *      - sorting properties
     * @returns A @see ISelGridConfiguration object that contains the grid configuration settings.
     */
    async getCurrentGridConfiguration(): Promise<ISlGridConfiguration> {
        const visibleColumnNames = this.getVisibleColumnNames();
        const tableState = await this.getTableState();
        return {
            visibleColumns: visibleColumnNames,
            columnWidths: this.getExistingColumnWidths(tableState),
            groupingProperties: tableState.grouped || []
        };
    }

    private getVisibleColumnNames(): string[] {
        const visibleColumnNames = [];
        for (const column of this.columns) {
            if (column.visible) {
                visibleColumnNames.push(column.dataField);
            }
        }

        return visibleColumnNames;
    }

    private getExistingColumnWidths(tableState: any): ISlGridColumnWidth[] {
        const columns = tableState.columns;
        const columnWidths = [];
        for (const column of columns) {
            const columnPercentageWidth = column._manualPercentageWidth + '%';
            columnWidths.push({
                dataField: column.dataField,
                columnWidth: column.dataField !== this.columnSpreadWidthDataField ? column.width || columnPercentageWidth : null
            });
        }
        return columnWidths;
    }

    ngAfterViewInit(): void {
        this.table.dataSource = this.dataSource || [];
    }

    ngOnInit(): void {
        this.initializeLocalization();
        this.table.dataSourceSettings.sanitizeHTML = 'all';
    }

    private initializeLocalization(): void {
        const localizationMessages = {};
        localizationMessages[this.language] = this.smartTableTranslations;
        this.table.messages = localizationMessages;
    }

    // Private methods -> Used for bindings
    onSelectionChange(): void {
        this.selectedRowsChanged.emit(this.table.selected);
    }

    onTableColumnClick(event: CustomEvent): void {
        this.headerClick.emit(event.detail.dataField);
    }

    onCellClick(event: CustomEvent): void {
        this.cellClick.emit(new SlCellClickEvent(event.detail.dataField, event.detail.row.id));
    }
}
