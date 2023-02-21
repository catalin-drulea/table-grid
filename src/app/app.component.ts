import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { AssetStatusComponent } from './components/asset-status/asset-status.component';
import { SlGridComponent } from './components/table-wrapper/sl-grid.component';

import * as DataGenerator from './data-generator';

import { AssetGridCollection } from '../app/asset-collection'
import { TableColumn } from 'smart-webcomponents-angular';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    columns = [];

    gridId = 'grid-123';
    enableAutoState = false;
    locale = 'en-US';
    virtualization = true;
    treeModeEnabled = false;
    groupingEnabled = false;
    selectionByHierarchy = false;
    parentResourceId = 'assetParentId';
    stateSettings = ['columns', 'sorted', 'grouped'];
    data: any[];
    rawData: any[];
    gridIsActiveTab = true;
    selectedAssetIds: string[];

    defaultColumnWidth = '10%';

    @ViewChild('slGrid', { read: SlGridComponent, static: true }) private table: SlGridComponent;

    constructor(private cdRef: ChangeDetectorRef, private datePipe: DatePipe, private decimalPipe: DecimalPipe) { }

    buttonsList = [];
    provider = new AssetGridCollection();

    ngOnInit(): void {
        this.treeModeEnabled = true;

        // this.groupingEnabled = true;
        // this.table.setTableGrouping(['name', 'modelName'], true);

        this.columns = this.getColumns();
        this.data = DataGenerator.getDataSource().slice(0, 25);
    }

    private startDataSourceUpdate(): void {
        setTimeout(() => {
            this.data = DataGenerator.getDataSource();
        }, 2000);
    }

    onHeaderClick(header): void {
    }

    onCellClick(cell): void {
    }

    onColumnResized(): void {
        
    }

    onSelectionChanged(selection): void {
        this.selectedAssetIds = selection;
    }

    getColumns(): TableColumn[] {
        return [
            {
                label: $localize`Name`,
                dataField: 'name',
                visible: true,
                templateElement: '<a style="cursor: pointer"></a>',
                templateElementSettings: (value, id, element: any) => {
                    element.innerHTML = value;
                    element._id = id;
                    if (!element.hasClickListener) {
                        element.addEventListener('click', () => {
                        });

                        element.hasClickListener = true;
                    }
                },
                width: '10%'
            },
            { label: $localize`Location`, dataField: 'systemName', visible: true, width: '10%' },
            { label: `Workspace`, dataField: 'workspace', visible: true, width: '10%' },
            {
                label: '',
                dataField: 'rowContextMenu',
                templateElement: '<div></div>',
                templateElementSettings: (value, assetId: string, element: any) => {
                    if (element) {
                        element._id = assetId;
                        if (!element.hasClickListener) {
                            console.log("TEMPLATE ELEMENT RE-RENDERED");
                            this.updateContextMenuButtons(element, assetId);
                            element.hasClickListener = true;
                        }
                    }
                },
                width: '100px',
                allowSort: false,
                allowResize: false,
                visible: true
            },
            { label: $localize`Model`, visible: true, dataField: 'modelName', width: this.defaultColumnWidth },
            { label: $localize`Serial number`, visible: true, dataField: 'serialNumber', width: this.defaultColumnWidth },
            {
                label: $localize`Calibration due date`,
                dataField: 'externalCalibrationDueDate',
                visible: true,
                formatFunction: (settings: any) => {
                    const formattedDate = this.datePipe.transform(settings.value);
                    settings.template = formattedDate;
                },
                width: this.defaultColumnWidth
            },
            { label: $localize`Calibration status`, visible: true, dataField: 'calibrationStatus', width: this.defaultColumnWidth, cellsalign: 'right' },
            { label: $localize`Self calibration temperature`, dataField: 'selfCalibrationTemperature', visible: true, width: this.defaultColumnWidth },
            { label: $localize`Current temperature`, dataField: 'currentTemperature', visible: true, width: this.defaultColumnWidth },
            { label: $localize`Presence`, visible: true, dataField: 'assetPresence', width: this.defaultColumnWidth },
            {
                label: $localize`Status`,
                dataField: 'status',
                visible: true,
                dataType: 'any',
                allowSort: false,
                templateElement: `<am-asset-status></am-asset-status>`,
                templateElementSettings: (value, id, element: NgElement & WithProperties<AssetStatusComponent>) => {
                    if (value) {
                        element.style.display = '';
                        element.style.cursor = 'pointer';
                        element.tooltip = value.tooltip;
                        element.colorclass = value.color;
                        element.maticon = value.icon;
                        element.statustype = value.statusType;
                    } else {
                        element.style.display = 'none';
                    }
                },
                width: this.defaultColumnWidth
            },
            {
                label: $localize`Alarms`,
                dataField: 'assetAlarm',
                visible: true,
                dataType: 'any',
                allowSort: false,
                templateElement: '<am-icon></am-icon>',
                templateElementSettings: (value, id, element: NgElement & WithProperties<any>) => {
                    if (value) {
                        const matIcon = element.querySelector('mat-icon') ?? element;

                        element.style.display = '';
                        element.style.cursor = 'pointer';
                        element.mattooltip = value.mattooltip;
                        element.colorclass = value.color;
                        matIcon.innerHTML = 'notifications';
                    } else {
                        element.style.display = 'none';
                    }
                }
            },
            { label: $localize`Vendor`, visible: true, dataField: 'vendorName', width: this.defaultColumnWidth },
            { label: $localize`Parent`, visible: true, dataField: 'assetParent', width: this.defaultColumnWidth },
            { label: $localize`Firmware version`, visible: true, dataField: 'firmwareVersion', width: this.defaultColumnWidth },
            { label: $localize`Hardware version`, visible: true, dataField: 'hardwareVersion', width: this.defaultColumnWidth },
            { label: $localize`Bus type`, dataField: 'busType', visible: true, width: this.defaultColumnWidth },
            { label: $localize`VISA resource name`, visible: true, dataField: 'visaResourceName', width: this.defaultColumnWidth },
            { label: $localize`Resource uri`, visible: true, dataField: 'resourceUri', width: this.defaultColumnWidth },
            { label: $localize`Slot number`, dataField: 'slotNumber', visible: true, width: this.defaultColumnWidth },
            { label: $localize`Supports self test`, dataField: 'supportsSelfTest', visible: true, width: this.defaultColumnWidth },
            { label: $localize`Supports reset`, dataField: 'supportsReset', visible: true, width: this.defaultColumnWidth },
            { label: $localize`Supports calibration`, dataField: 'supportsCalibration', visible: true, width: this.defaultColumnWidth },
            { label: $localize`Supports self calibration`, dataField: 'supportsSelfCalibration', visible: true, width: this.defaultColumnWidth },
            {
                label: $localize`Last self calibration date`,
                dataField: 'selfCalibrationDate',
                visible: true,
                formatFunction: (settings: any) => {
                    const formattedDate = this.datePipe.transform(settings.value);
                    settings.template = formattedDate;
                },
                width: this.defaultColumnWidth
            },
            { label: $localize`Supports external calibration`, dataField: 'supportsExternalCalibration', visible: true, width: this.defaultColumnWidth },
            {
                label: $localize`Last external calibration date`,
                dataField: 'externalCalibrationDate',
                visible: true,
                formatFunction: (settings: any) => {
                    const formattedDate = this.datePipe.transform(settings.value);
                    settings.template = formattedDate;
                },
                width: this.defaultColumnWidth
            },
            { label: $localize`External calibration recommended interval (months)`, dataField: 'externalCalibrationRecommendedInterval', visible: true, width: this.defaultColumnWidth },
            {
                label: $localize`Last updated`,
                dataField: 'lastUpdatedTimestamp',
                visible: true,
                formatFunction: (settings: any) => {
                    const formattedDate = this.datePipe.transform(settings.value);
                    settings.template = formattedDate;
                },
                width: this.defaultColumnWidth
            },
            { id: 'edit-grid', dataField: 'edit-grid', label: 'edit', width: '10%', allowSort: false, allowResize: false, visible: true },
            { dataField: '', label: '', visible: true, allowSort: false }
        ] as TableColumn[];
    }

    private updateContextMenuButtons(element: any, assetId: string): void {
        if (!this.shouldShowContextMenuForAsset(assetId)) {
            return;
        }
        const child = document.createElement('am-action-menu') as NgElement & WithProperties<any>;
        child.resourceId = assetId;
        child.maxMenuSize = 6;
        child.addEventListener('menuOpened', (event: CustomEvent) => {
            if (!this.selectedAssetIds?.includes(element._id)) {
                this.table.setSelection(element._id);
            }
            child.buttons = this.getContextMenuButtonsForSelection();
        });
        element.appendChild(child);
    }

    i = 0;

    private shouldShowContextMenuForAsset(assetId: string): boolean {
       this.i++;
       return this.i % 2 !== 0;
    }

    private getContextMenuButtonsForSelection(): any[] {
       return [{
            id: 'some-button-id',
            clickHandler: () => null,
            label: 'Menu button',
            icon: {
                type: 'mat',
                name: 'visibility'
            }
        }];
    }
}
