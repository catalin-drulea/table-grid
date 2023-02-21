import { Component, Input } from '@angular/core';

/**
 * An enumeration that defines the type of status that an asset
 * can have.
 */
enum IAssetStatusType {
    Progress = 'progress',
    Icon = 'icon'
};

/**
 * The component is responsible for rendering the status of an asset based on a
 * status type to an icon or a spinner with a tooltip.
 */
@Component({
    selector: 'am-asset-status',
    templateUrl: './asset-status.component.html',
    styleUrls: ['./asset-status.component.scss']
})
export class AssetStatusComponent {
    // Declare a class variable used for the imported enums so that the HTML template
    // can reference the enum.
    eAssetStatusType = IAssetStatusType;

    matTooltip: string;
    colorClass: string;
    icon: string;
    statusType: IAssetStatusType;

    @Input() set tooltip(value: string) {
        this.matTooltip = value;
    }

    get tooltip() {
        if (!this.matTooltip) {
            this.matTooltip = '';
        }
        return this.matTooltip;
    }

    @Input() set colorclass(value: string) {
        this.colorClass = value;
    }

    get colorclass() {
        if (!this.colorClass) {
            this.colorClass = '';
        }
        return this.colorClass;
    }

    @Input() set maticon(value: string) {
        this.icon = value;
    }

    get maticon() {
        if (!this.icon) {
            this.icon = '';
        }
        return this.icon;
    }

    @Input() set statustype(value: IAssetStatusType) {
        this.statusType = value;
    }

    get statustype() {
        if (!this.statusType) {
            this.statusType = IAssetStatusType.Icon;
        }
        return this.statusType;
    }
}
