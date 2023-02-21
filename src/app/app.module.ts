import { BrowserModule } from '@angular/platform-browser';
import { ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, Inject, Injector, LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AmIconComponent } from './components/am-icon/am-icon.component';
import { environment } from 'src/environments/environment';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { TableModule } from 'smart-webcomponents-angular/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { SlGridComponent } from './components/table-wrapper/sl-grid.component';
import { AssetStatusComponent } from './components/asset-status/asset-status.component';
import { SlProgressSpinnerComponent } from './components/sl-progress-spinner/sl-progress-spinner.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { SlActionMenuComponent } from 'src/app/components/action-menu/sl-action-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { defineCustomElements } from './files.custom-elements';


@NgModule({
  declarations: [
    AppComponent,
    AmIconComponent,
    SlGridComponent,
    AssetStatusComponent,
    SlProgressSpinnerComponent,
    SlActionMenuComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    TableModule, // JQX Table
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatSidenavModule,
    MatSidenavModule,
    MatGridListModule,
    MatTableModule,
    MatMenuModule,
    MatButtonModule
  ],
  providers: [
    DatePipe,
    DecimalPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]

})
// export class AppModule {
//   constructor(private injector: Injector) {
//   }

//   ngDoBootstrap(appRef: ApplicationRef): void {
//     defineCustomElements(this.injector);

//     // If environment is local dev, bootstrap the main app component
//     // and only create the development required custom elements.
//     if (!environment.production) {
//       appRef.bootstrap(AppComponent);
//     }
//   }
// }

// /**
//  * Defines and registers Angular components as custom elements for this application.
//  * @param injector The injector to use when resolving angular components
//  */
// function defineCustomElements(injector: Injector): void {
//   // Define customElements that are required on any build.
//   defineCustomElement('am-icon', AmIconComponent, injector);
//   defineCustomElement('am-in-use-spinner', SlProgressSpinnerComponent, injector);
//   defineCustomElement('am-asset-status', AssetStatusComponent, injector);
//   defineCustomElement('am-asset-status', AssetStatusComponent, injector);
//   defineCustomElement('am-action-menu', SlActionMenuComponent, injector);
// }

// function defineCustomElement(name: string, component: any, injector: Injector): void {
//   if (!customElements.get(name)) {
//     const customElement = createCustomElement(component, { injector });
//     customElements.define(name, customElement);
//   }
// }

// declare global {
//   // tslint:disable-next-line: no-unused-declaration
//   interface HTMLElementTagNameMap {
//       'my-custom-icon': NgElement & WithProperties<AmIconComponent>;
//       'am-in-use-spinner': NgElement & WithProperties<SlProgressSpinnerComponent>;
//       'am-asset-status': NgElement & WithProperties<AssetStatusComponent>;
//       'am-action-menu': NgElement & WithProperties<SlActionMenuComponent>;
//   }
// }
export class AppModule {    constructor(injector: Injector) {
  defineCustomElements(injector);
}
}