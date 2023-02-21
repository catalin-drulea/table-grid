import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TableColumn, TableComponent, TableModule } from 'smart-webcomponents-angular/table';

import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, ViewChild } from '@angular/core';
import { SlCellClickEvent, SlGridRow } from './sl-grid.component';
import { IGroupFormatSettings } from './sl-grid.component';
import { SlGridComponent } from './sl-grid.component';
import { SlGridPageObject } from './sl-grid.pageobject';

/**
 * Host component for testing @see SlGridComponent
 */
@Component({
    template: `
        <sl-grid #table [dataSource]="dataSource" [columns]="columns" [locale]="language" [virtualization]="virtualization"
            [grouping]="grouping" [treeMode]="treeMode" [parentDataField]="parentDataField"
            [selectionByHierarchy]="selectionByHierarchy"> </sl-grid>`
})
class SlGridTestHostComponent {
    @Input() dataSource: SlGridRow[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() virtualization = false;
    @Input() grouping = false;
    @Input() treeMode = false;
    @Input() parentDataField: string;
    @Input() language: string;
    @Input() selectionByHierarchy = true;

    @ViewChild('table', { read: SlGridComponent, static: true }) table: SlGridComponent;
}

describe('SL Grid Component', () => {
    let hostComponent: SlGridTestHostComponent;
    let component: SlGridComponent;
    let fixture: ComponentFixture<SlGridTestHostComponent>;
    let page: SlGridPageObject;
    let smartTable: TableComponent;

    /**
     * This class defines mock data for the component's table to render
     * for the purposes of testing grid component features.
     */
    // tslint:disable-next-line: max-classes-per-file
    class SlGridDataSourceMock extends SlGridRow {
        id: string;
        name: string;
        description: string;
        reportsTo?: string;
    }

    const slGridMockColumns = [
        { label: 'Name', dataField: 'name' },
        { label: 'Description', dataField: 'description' }
    ] as TableColumn[];

    const slGridMockDataSource = [
        {
            id: '123',
            name: 'TestItem1',
            description: 'I am a test item',
            lastUpdatedTimestamp: new Date(2010, 1, 2).toISOString(),
            reportsTo: null
        },
        {
            id: '456',
            name: 'TestItem2',
            description: 'I am a test item also',
            lastUpdatedTimestamp: new Date(2010, 1, 2).toISOString(),
            reportsTo: '123'
        }
    ] as SlGridDataSourceMock[];

    async function refreshComponent(): Promise<void> {
        removeStyleObserver(fixture.nativeElement);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function removeStyleObserver(jqxElement: HTMLElement): void {
        const elements = jqxElement.querySelectorAll('.smart-element');
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element['hasStyleObserver']) {
                element['hasStyleObserver'] = false;
            }
        }
    }

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [SlGridTestHostComponent, SlGridComponent, TableComponent],
            imports: [TableModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SlGridTestHostComponent);
        hostComponent = fixture.componentInstance;
        component = hostComponent.table;
        page = new SlGridPageObject(fixture.nativeElement);
        fixture.detectChanges();
        smartTable = component['table'] as TableComponent;
    });

    describe('Basic', () => {
        beforeEach(() => {
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = slGridMockDataSource;
            fixture.detectChanges();
        });

        it('should render rows', () => {
            // There is an extra row at the end (class="last-visible") -> JQX specific probably
            expect(page.getRows().length).toEqual(3);
        });

        it('should render item property cell', () => {
            expect(page.getCellText(0, 1)).toEqual(slGridMockDataSource[0].name);
        });

        it('should render header cell', () => {
            // Header with index 0 is the checkbox header
            expect(page.getHeaderText(1)).toEqual('Name');
        });

        xit('should sanitize html values', () => {
            hostComponent.dataSource = [
                {
                    id: '7165786237542',
                    name: '<b>new data</b>',
                    description: '<marquee> my description</marquee>'
                }
            ];
            fixture.detectChanges();

            expect(page.getCellText(0, 1)).toEqual('<b>new data</b>');
            expect(page.getCellText(0, 2)).toEqual('<marquee> my description</marquee>');
        });

        it('should add rows when data source is updated with new data', () => {
            hostComponent.dataSource = [
                slGridMockDataSource[0],
                slGridMockDataSource[1],
                {
                    id: '789',
                    name: 'new data item',
                    description: 'wow, what a neat description',
                    lastUpdatedTimestamp: new Date().toISOString()
                }
            ];
            fixture.detectChanges();

            expect(page.getRows().length).toEqual(4);
        });

        it('should remove rows when data source is updated without existing data', () => {
            hostComponent.dataSource = hostComponent.dataSource = [
                slGridMockDataSource[0],
                slGridMockDataSource[1],
                {
                    id: '789',
                    name: 'new data item',
                    description: 'wow, what a neat description',
                    lastUpdatedTimestamp: new Date().toISOString()
                }
            ];
            fixture.detectChanges();
            // Remove the middle row
            hostComponent.dataSource = hostComponent.dataSource = [
                slGridMockDataSource[0],
                {
                    id: '789',
                    name: 'new data item',
                    description: 'wow, what a neat description',
                    lastUpdatedTimestamp: new Date().toISOString()
                }
            ];
            fixture.detectChanges();

            expect(page.getRows().length).toEqual(3);
            expect(page.getCellText(0, 1)).toEqual(slGridMockDataSource[0].name);
            expect(page.getCellText(1, 1)).toEqual('new data item');
        });

        it('should not update rows if fingerprint has not changed', () => {
            component.dataSourceFingerprint = 'lastUpdatedTimestamp';
            hostComponent.dataSource = [
                {
                    id: slGridMockDataSource[0].id,
                    name: 'An updated test item',
                    description: 'This should not be updated',
                    lastUpdatedTimestamp: slGridMockDataSource[0].lastUpdatedTimestamp
                }
            ];
            fixture.detectChanges();

            expect(page.getCellText(0, 1)).toEqual(slGridMockDataSource[0].name);
        });

        it('should always update rows if fingerprint was not set', () => {
            hostComponent.dataSource = [
                {
                    id: slGridMockDataSource[0].id,
                    name: 'An updated test item',
                    description: 'This should be updated even if it has the same timestamp',
                    lastUpdatedTimestamp: slGridMockDataSource[0].lastUpdatedTimestamp
                }
            ];
            fixture.detectChanges();

            expect(page.getCellText(0, 1)).toEqual('An updated test item');
        });

        it('should update rows if fingerprint has changed', () => {
            const updatedName = 'An updated test item';
            component.dataSourceFingerprint = 'lastUpdatedTimestamp';
            hostComponent.dataSource = [
                {
                    id: slGridMockDataSource[0].id,
                    name: updatedName,
                    description: 'This should be updated',
                    lastUpdatedTimestamp: new Date().toISOString()
                }
            ];
            fixture.detectChanges();

            expect(page.getCellText(0, 1)).toEqual(updatedName);
        });

        it('should set single selection', () => {
            const id = slGridMockDataSource[0].id;
            page.clickCell(0, 0);
            page.clickCell(1, 0);
            fixture.detectChanges();

            expect(page.getSelection()).toEqual([
                slGridMockDataSource[0].id,
                slGridMockDataSource[1].id
            ]);

            component.setSelection(id);
            fixture.detectChanges();

            expect(page.getSelection()).toEqual([
                id
            ]);
        });

        it('should set multi selection', () => {
            const ids = [
                slGridMockDataSource[0].id,
                slGridMockDataSource[1].id
            ];
            expect(page.getSelection()).toEqual([]);

            component.setSelection(ids);
            fixture.detectChanges();

            expect(page.getSelection()).toEqual(ids);
        });
    });

    describe('grid settings', () => {
        it('should not display data if columns are not configured', () => {
            hostComponent.dataSource = slGridMockDataSource;
            fixture.detectChanges();

            expect(component.dataSource.length).toBe(2);

            // no columns yet, so data is not visible
            expect(page.getHeaderText(1)).not.toContain(slGridMockColumns[0].label);
            expect(page.getHeaderText(2)).not.toContain(slGridMockColumns[1].label);

            hostComponent.columns = slGridMockColumns;
            fixture.detectChanges();

            // data becomes visible
            expect(page.getHeaderText(1)).toContain(slGridMockColumns[0].label);
            expect(page.getHeaderText(2)).toContain(slGridMockColumns[1].label);
        });

        it('headers should be visible even if no data is configured', () => {
            hostComponent.columns = slGridMockColumns;
            fixture.detectChanges();

            expect(page.getHeaderText(1)).toContain(slGridMockColumns[0].label);
            expect(page.getHeaderText(2)).toContain(slGridMockColumns[1].label);
        });

        it('should display data if virtualization is enabled', () => {
            hostComponent.dataSource = slGridMockDataSource;
            hostComponent.columns = slGridMockColumns;
            hostComponent.virtualization = true;
            fixture.detectChanges();

            expect(page.getHeaderText(1)).toContain(slGridMockColumns[0].label);
            expect(page.getHeaderText(2)).toContain(slGridMockColumns[1].label);
        });
    });

    describe('grid events', () => {
        beforeEach(() => {
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = slGridMockDataSource;
            fixture.detectChanges();
        });

        it('should fire selectedRowsChanged event when selection changes', fakeAsync(() => {
            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);

            smartTable.select(slGridMockDataSource[0].id);
            tick();

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.first().args[0]).toEqual([slGridMockDataSource[0].id]);
        }));

        it('should fire selectedRowsChanged event when a selected item is removed', fakeAsync(() => {
            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);

            smartTable.select([slGridMockDataSource[0].id, slGridMockDataSource[1].id]);
            tick();

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.first().args[0]).toEqual([slGridMockDataSource[0].id, slGridMockDataSource[1].id]);

            spy.calls.reset();

            hostComponent.dataSource = [slGridMockDataSource[0]];
            fixture.detectChanges();

            expect(spy).toHaveBeenCalled();
            expect(spy.calls.first().args[0]).toEqual([slGridMockDataSource[0].id]);
        }));

        it('should not fire selectedRowsChanged event when a selected item is changed', fakeAsync(() => {
            smartTable.select([slGridMockDataSource[0].id, slGridMockDataSource[1].id]);
            tick();

            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);

            const updatedItem = {
                id: slGridMockDataSource[0].id,
                name: 'updated name',
                description: 'updatedDescription',
                lastUpdatedTimestamp: new Date().toISOString()
            };
            hostComponent.dataSource = [updatedItem, slGridMockDataSource[1]];
            fixture.detectChanges();
            tick();

            expect(spy).not.toHaveBeenCalled();
        }));

        it('should not fire selectedRowsChanged event when an item is added', fakeAsync(() => {
            smartTable.select([slGridMockDataSource[0].id, slGridMockDataSource[1].id]);
            tick();

            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);

            hostComponent.dataSource = [
                slGridMockDataSource[0],
                slGridMockDataSource[1],
                {
                    id: '789',
                    name: 'new data item',
                    description: 'wow, what a neat description',
                    lastUpdatedTimestamp: new Date().toISOString()
                }
            ];
            fixture.detectChanges();
            tick();

            expect(spy).not.toHaveBeenCalled();
        }));

        it('should output (headerClick) event when clicking a header', () => {
            const spy = spyOn(component.headerClick, 'emit');

            page.clickHeader(1);

            expect(spy).toHaveBeenCalledWith(slGridMockColumns[0].dataField);
        });

        it('should fire (onCellClick) event when clicking a cell', () => {
            const spy = spyOn(component.cellClick, 'emit');
            const columnName = 'name';

            page.clickCell(0, 1);

            expect(spy).toHaveBeenCalledWith(new SlCellClickEvent(columnName, slGridMockDataSource[0].id));
        });
    });

    describe('tableState methods', () => {
        beforeEach(() => {
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = slGridMockDataSource;
            fixture.detectChanges();
        });

        it('should return tableState object from getTableState method with all columns from configuration', async () => {
            const expectedColumns = slGridMockColumns.map(column => column.dataField);

            const tableState = await component.getTableState();

            const receivedColumns = tableState.columns.map(column => column.dataField);
            expect(receivedColumns).toEqual(expectedColumns);
        });

        it('should display columns from the tableState object used on setTableState method', async () => {
            component.loadColumnStateBehavior = 'stateOnly';
            const tableState = await component.getTableState();
            tableState.columns = [slGridMockColumns[0]];
            fixture.detectChanges();

            component.setTableState(tableState);
            fixture.detectChanges();

            const allHeaders = page.getAllHeadersText();
            const expectedColumns = [slGridMockColumns[0].label];
            expect(allHeaders).toEqual(expectedColumns);
        });
    });

    describe('grouping support', () => {
        it('should place "Empty" groups last in the table', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: '', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'ZZZ', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-2', name: 'AAA', description: 'Description 2' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;

            fixture.detectChanges();
            component.setTableGrouping(['name'], false);
            await refreshComponent();

            expect(page.getGroupHeader(0)).toEqual('Name: ZZZ(1)');
            expect(page.getGroupHeader(1)).toEqual('Name: AAA(1)');
            expect(page.getGroupHeader(2)).toEqual('Name: Empty(1)');
        });

        it('should group by property name', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: 'Name 1', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: 'Name 1', description: 'Description 3' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;

            fixture.detectChanges();
            component.setTableGrouping(['name'], false);
            await refreshComponent();

            // Verify the group header to validate that there are 2 items in the group as well as the group name.
            expect(page.isGroupExpanded(0)).toBeFalse();
            expect(page.getGroupHeader(0)).toEqual('Name: Name 1(2)');
            // Table header is considered a row
            // Each group name is considered a row
            // Collapsed groups are still present in the DOM -> Cannot test collapse/expand behavior
            expect(page.getRows().length).toEqual(6);
        });

        it('should be localized when language is provided', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: '', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: '', description: 'Description 3' };
            hostComponent.language = 'de';
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;

            fixture.detectChanges();
            component.setTableGrouping(['name'], false);
            await refreshComponent();

            // Verify the group header to validate that there are 2 items in the group as well as the group name.
            expect(page.isGroupExpanded(0)).toBeFalse();
            // Only checking that the messages pass through the localization file and the messages marked with 'localize' are displayed
            expect(page.getGroupHeader(1)).toEqual('Name: Empty(2)');
            expect(page.getRows().length).toEqual(6);
        });

        it('should display the given name as group header', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: 'Name 1', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: 'Name 1', description: 'Description 3' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;
            // Set the group title of one property
            component.groupingFormatFunction = (settings: IGroupFormatSettings) => {
                if (settings.column === 'name') {
                    settings.value = 'Given Name';
                }
            };

            fixture.detectChanges();
            component.setTableGrouping(['name', 'description'], false);
            await refreshComponent();

            expect(page.isGroupExpanded(0)).toBeFalse();
            expect(page.getGroupHeader(0)).toEqual('Name: Given Name(2)');
            expect(page.getGroupHeader(1)).toEqual('Description: Description 1(1)');
            expect(page.getGroupHeader(2)).toEqual('Description: Description 3(1)');
            expect(page.getGroupHeader(3)).toEqual('Name: Given Name(1)');
            expect(page.getGroupHeader(4)).toEqual('Description: Description 2(1)');
            expect(page.getRows().length).toEqual(9);
        });

        it('should expand group when clicking the expand button', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: 'Name 1', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: 'Name 1', description: 'Description 3' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;
            fixture.detectChanges();
            component.setTableGrouping(['name'], false);
            await refreshComponent();

            page.clickGroupExpandButton(0);
            fixture.detectChanges();

            expect(page.isGroupExpanded(0)).toBeTrue();
        });

        it('should collapse group when clicking the collapse button', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: 'Name 1', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: 'Name 1', description: 'Description 3' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;
            fixture.detectChanges();
            component.setTableGrouping(['name'], false);
            await refreshComponent();

            page.clickGroupExpandButton(0);
            fixture.detectChanges();
            page.clickGroupExpandButton(0);
            fixture.detectChanges();

            expect(page.isGroupExpanded(0)).toBeFalse();
        });

        it('should select all items from within the group when selecting the group', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: 'Name 1', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: 'Name 1', description: 'Description 3' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;
            fixture.detectChanges();
            component.setTableGrouping(['name'], false);
            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);
            await refreshComponent();

            page.clickGroupExpandButton(0);
            page.clickCell(0, 0);
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith([firstItem.id, thirdItem.id]);
        });

        it('should keep selection when data source changes', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: 'Name 1', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: 'Name 1', description: 'Description 3' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;
            fixture.detectChanges();
            component.setTableGrouping(['name'], false);
            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);
            await refreshComponent();

            page.clickGroupExpandButton(0);
            page.clickCell(0, 0);
            fixture.detectChanges();

            // Replace one of the existing dataSource items (the one that is single in the group)
            const fourthItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 4', description: 'Description 4' };
            hostComponent.dataSource = [firstItem, fourthItem, thirdItem];
            fixture.detectChanges();

            expect(smartTable.selected).toEqual([firstItem.id, thirdItem.id]);
        });

        it('should expand groups by default when setting grouping properties', async () => {
            const firstItem: SlGridDataSourceMock = { id: 'id-1', name: 'Name 1', description: 'Description 1' };
            const secondItem: SlGridDataSourceMock = { id: 'id-2', name: 'Name 2', description: 'Description 2' };
            const thirdItem: SlGridDataSourceMock = { id: 'id-3', name: 'Name 1', description: 'Description 3' };
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = [firstItem, secondItem, thirdItem];
            hostComponent.grouping = true;

            fixture.detectChanges();
            component.setTableGrouping(['name']);
            await refreshComponent();

            // Verify the group header to validate that there are 2 items in the group as well as the group name.
            expect(page.isGroupExpanded(0)).toBeTrue();
            expect(page.getGroupHeader(0)).toEqual('Name: Name 1(2)');
            // Table header is considered a row
            // Each group name is considered a row
            // Collapsed groups are still present in the DOM -> Cannot test collapse/expand behavior
            expect(page.getRows().length).toEqual(6);
        });
    });

    describe('Tree Mode', () => {
        it('should render rows when treeMode is true', () => {
            hostComponent.columns = slGridMockColumns;
            hostComponent.treeMode = true;
            hostComponent.parentDataField = 'reportsTo';
            hostComponent.dataSource = [
                slGridMockDataSource[0],
                slGridMockDataSource[1],
                {
                    id: '554',
                    name: 'TestItem3',
                    description: 'I am a test item',
                    lastUpdatedTimestamp: new Date(2010, 1, 2).toISOString(),
                    reportsTo: slGridMockDataSource[1].id
                }
            ];

            fixture.detectChanges();

            expect(page.isTreeNodeExpanded(0)).toBeTrue();
            expect(page.isTreeNodeExpanded(1)).toBeTrue();
            page.clickGroupExpandButton(1);
            expect(page.isTreeNodeExpanded(1)).toBeFalse();
        });

        it('should disable grouping when treeMode changes to false', () => {
            hostComponent.columns = slGridMockColumns;
            hostComponent.dataSource = slGridMockDataSource;
            hostComponent.treeMode = true;
            hostComponent.parentDataField = 'reportsTo';
            fixture.detectChanges();

            hostComponent.treeMode = false;
            fixture.detectChanges();

            expect(page.getGroupExpandButton(0)).toBeFalsy();
            expect(page.getGroupExpandButton(1)).toBeFalsy();
        });

        it('should not select any children when you select a parent when the "selectionByHierarchy" property is false', async () => {
            hostComponent.columns = slGridMockColumns;
            hostComponent.treeMode = true;
            hostComponent.parentDataField = 'reportsTo';
            hostComponent.dataSource = [
                slGridMockDataSource[0],
                slGridMockDataSource[1],
                {
                    id: '554',
                    name: 'TestItem3',
                    description: 'I am a test item',
                    lastUpdatedTimestamp: new Date(2010, 1, 2).toISOString(),
                    reportsTo: slGridMockDataSource[0].id
                }
            ];
            hostComponent.selectionByHierarchy = false;
            fixture.detectChanges();
            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);
            await refreshComponent();

            page.clickCell(0, 0);
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith([slGridMockDataSource[0].id]);
        });

        it('should not select the parent if all of its children have been selected when the "selectionByHierarchy" property is false', async () => {
            hostComponent.columns = slGridMockColumns;
            hostComponent.treeMode = true;
            hostComponent.parentDataField = 'reportsTo';
            hostComponent.dataSource = [
                slGridMockDataSource[0],
                slGridMockDataSource[1]
            ];
            hostComponent.selectionByHierarchy = false;
            fixture.detectChanges();
            const spy = jasmine.createSpy();
            component.selectedRowsChanged.subscribe(spy);
            await refreshComponent();

            page.clickCell(1, 0);
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith([slGridMockDataSource[1].id]);
        });
    });
});
