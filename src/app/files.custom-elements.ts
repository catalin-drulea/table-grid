import { Injector } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { SlActionMenuComponent } from './components/action-menu/sl-action-menu.component';


/**
 * Add typings for custom elements
 * See https://angular.io/guide/elements#typings-for-custom-elements
 */
declare global {
    interface HTMLElementTagNameMap {
        'sl-action-menu': NgElement & WithProperties<SlActionMenuComponent>;
    }
}

/**
 * Defines and registers Angular components as custom elements.
 * @param injector The injector to use when resolving angular components
 */
export function defineCustomElements(injector: Injector): void {
    defineCustomElement('sl-action-menu', SlActionMenuComponent, injector);
}

function defineCustomElement(name: string, component: any, injector: Injector): void {
    if (!customElements.get(name)) {
        const componentCustomElement = createCustomElement(component, { injector });
        customElements.define(name, componentCustomElement);
    }
}
