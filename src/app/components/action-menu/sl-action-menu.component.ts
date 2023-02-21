import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';

/**
 * Represents a definition of a displayed button. The definition contains support for hiding, disabling
 * and displaying an icon for the button. The definition also allows users to configure the button with
 * a handler that will be executed when the button is clicked.
 */
 export class SlActionButton {
    constructor(
            readonly id: string,
            public label: string,
            public clickHandler?: (...args: any[]) => any,
            public disabled?: boolean,
            public hidden?: boolean,
            public tooltipText?: string,
            public icon?: SlActionButtonIcon,
            public innerButtons?: SlActionButton[]) {
    }
}

/**
 * The icon to be displayed, aligned on to the left of the label.
 * Currently Angular material icons (`type = 'mat'`) and
 * Skyline Theme Icons (`type = 'sti'`) are supported.
 */
export interface SlActionButtonIcon {
    type: 'mat' | 'sti';
    name: string;
}

/**
 * Component that is used to display a menu containing action buttons that can be used in any system
 */
@Component({
    selector: 'sl-action-menu',
    templateUrl: './sl-action-menu.component.html',
    styleUrls: ['./sl-action-menu.component.scss']
})
export class SlActionMenuComponent implements OnDestroy {
    /**
     * @public
     *  The id of the resource for which the button applies to. Not setting this input will trigger the clicked
     * button clickHandler with an undefined string parameter.
     */
    @Input() resourceId: string;

    /**
     * @public
     *  The maximum length (in number of buttons) that the menu should display. The default number of displayed
     * buttons is 5.
     */
    @Input() maxMenuSize = 5;

    /**
     * @public
     *  An event that gets triggered when the user clicks the menu icon. The event will contain the 'resourceId'
     * associated with the clicked menu.
     */
    @Output() menuOpened: EventEmitter<string> = new EventEmitter();

    // tslint:disable-next-line: member-ordering - To place this definition under the @Input definitions
    buttonsList: SlActionButton[];

    /**
     * @public
     *  The list of buttons to be displayed by the menu.
     */
    @Input() set buttons(buttonsList: SlActionButton[]) {
        let buttonsCount = 0;
        const buttonList: SlActionButton[] = [];
        this.moreItemMenuButton.innerButtons = [];
        for (const button of buttonsList) {
            if (!button.hidden) {
                if (this.isAtLeastOneButtonVisible(button.innerButtons)) {
                    if (buttonsCount < this.maxMenuSize) {
                        buttonList.push(button);
                        buttonsCount++;
                    } else {
                        this.moreItemMenuButton.innerButtons.push(button);
                    }
                }
            }
        }
        if (this.moreItemMenuButton.innerButtons.length > 0) {
            this.moreItemMenuButton.innerButtons = [buttonList[this.maxMenuSize - 1]].concat(this.moreItemMenuButton.innerButtons);
            buttonList[this.maxMenuSize - 1] = this.moreItemMenuButton;
        }
        this.buttonsList = buttonList;
    }

    private subscription: Subscription = new Subscription();
    @ViewChild(MatMenuTrigger) private trigger: MatMenuTrigger;

    private moreItemMenuButton: SlActionButton = {
        id: 'sl-menu-more-button',
        label: $localize`More`,
        innerButtons: [],
        icon: {
            type: 'sti',
            name: 'sti-menu-horizontal'
        }
    };

    onIconClick(event: Event): void {
        // stop propagation so grid selection doesn't change
        event.stopPropagation();

        this.menuOpened.emit(this.resourceId);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private isAtLeastOneButtonVisible(buttons: SlActionButton[]): boolean {
        if (!buttons) {
            return true;
        }
        return buttons.some(b => !b.hidden);
    }
}
