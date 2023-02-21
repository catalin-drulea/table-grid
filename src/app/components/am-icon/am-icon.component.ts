import { Component, Input, OnInit } from '@angular/core';

/**
 * This is just a simple icon component that we need to export as a custom element so that we 
 * can render it in the grid.
 */
@Component({
  selector: 'app-am-icon',
  templateUrl: './am-icon.component.html',
  styleUrls: ['./am-icon.component.scss']
})
export class AmIconComponent implements OnInit {

  // iconClass: string;

  //   @Input() mattooltip: string;
  //   @Input() rotateicon: boolean;
  //   @Input() colorclass: string;

  //   ngOnInit(): void {
  //       if (this.rotateicon) {
  //           this.iconClass = `${this.colorclass} rotate`;
  //       } else {
  //           this.iconClass = this.colorclass;
  //       }

  //   }

  iconClass: string;

  @Input() mattooltip: string;
  @Input() rotateicon: boolean;
  _colorclass: string;

  ngOnInit(): void {
    if (this.rotateicon) {
      this.iconClass = `${this.colorclass} rotate`;
    } else {
      this.iconClass = this.colorclass;
    }
  }

  get colorclass() {
    if (!this._colorclass) {
      this._colorclass = "";
    }

    return this._colorclass;
  }

  @Input()
  set colorclass(value) {
    this._colorclass = value;
    this.iconClass = value;
  }
}
