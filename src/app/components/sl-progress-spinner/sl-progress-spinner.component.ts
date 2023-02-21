import { Component, Input } from '@angular/core';

/**
 * Sl Spinner exposes functionality to show a continuous loading spinner indicating that a resource is currently in use
 */
@Component({
  selector: 'sl-spinner',
  templateUrl: './sl-progress-spinner.component.html',
  styleUrls: ['./sl-progress-spinner.component.scss']
})
export class SlProgressSpinnerComponent {
  /**
   * @public
   *  A string to be displayed as a tooltip when the user hovers over the spinner element.
   */
  @Input() tooltip: string;
}