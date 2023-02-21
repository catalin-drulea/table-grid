import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, TableModule } from 'smart-webcomponents-angular/table';

import {  CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SlGridComponent } from './components/table-wrapper/sl-grid.component';
import { AppComponent } from './app.component';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AmIconComponent } from './components/am-icon/am-icon.component';
import { createCustomElement } from '@angular/elements';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('App Component', () => {
    let hostComponent: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent, SlGridComponent, TableComponent, AmIconComponent],
            imports: [CommonModule, BrowserModule, BrowserAnimationsModule, TableModule, MatIconModule, MatTooltipModule],
            providers: [
                DatePipe,
                DecimalPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        hostComponent = fixture.componentInstance;
        
        if (!customElements.get('am-icon')) {
            const slIconComponent = createCustomElement(AmIconComponent, { injector: fixture.componentRef.injector });
            customElements.define('am-icon', slIconComponent);
        }

    });

    describe('Tree Mode', () => {
        
    });
});
