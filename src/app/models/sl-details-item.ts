/**
 * Defines information about a resource detail in term of its name,
 * type and value.
 */
 export class SlDetailsItem {
    itemClass: string;
    name: string;
    type: SlDetailsItemType;
    value: any;
    initialValue: any;
    icon: string;
    iconHighlight: SlDetailsItemIconHighlight;

    constructor(name: string, type: SlDetailsItemType, value: any, itemClass: string, icon: string, iconHighlight: SlDetailsItemIconHighlight) {
        this.itemClass = itemClass;
        this.name = name;
        this.type = type;
        this.value = value;
        this.initialValue = value;
        this.icon = icon;
        this.iconHighlight = iconHighlight;
    }

    revertValue(): void {
        this.value = this.initialValue;
    }

    isValueDirty(): boolean {
        return this.value !== this.initialValue;
    }

    hasIcon(): boolean {
        return this.icon !== null || this.icon !== undefined;
    }
};

/**
 * Defines possible types for a @see ISlDetailsItem
 */
export enum SlDetailsItemType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    DATE = 'DATE',
    LONG_DATE = 'LONG_DATE',
    EDITABLE_STRING = 'EDITABLE_STRING',
    ICON_STRING = 'ICON_STRING',
    TEMPERATURE = 'TEMPERATURE',
    KEYWORDS = 'KEYWORDS'
};

export enum SlDetailsItemIconHighlight {
    NONE = 'NONE',
    POSITIVE = 'POSITIVE',
    NEGATIVE = 'NEGATIVE'
};