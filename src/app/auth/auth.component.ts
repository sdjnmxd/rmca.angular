/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import {Component, OnDestroy} from '@angular/core';

@Component({
  selector: 'ngx-auth',
  styleUrls: ['./auth.component.scss'],
  template: `
    <nb-layout>
      <nb-layout-column>
        <nb-card>
          <nb-card-body>
            <div class="col-xl-4 col-lg-6 col-md-8 col-sm-12">
              <router-outlet></router-outlet>
            </div>
          </nb-card-body>
        </nb-card>
      </nb-layout-column>
    </nb-layout>
  `,
})
export class NbAuthComponent implements OnDestroy {
  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
}
