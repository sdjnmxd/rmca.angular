import {NgModule} from '@angular/core';

import {AuthRoutingModule} from './auth-routing.module';
import {ThemeModule} from '../@theme/theme.module';

import {NbAuthComponent} from './auth.component';
import {NbAuthBlockComponent} from './components/auth-block/auth-block.component';
import {NbLoginComponent} from './components/login/login.component';
import {NbLogoutComponent} from './components/logout/logout.component';
import {NbRegisterComponent} from './components/register/register.component';
import {NbRequestPasswordComponent} from './components/request-password/request-password.component';
import {NbResetPasswordComponent} from './components/reset-password/reset-password.component';

const AUTH_COMPONENTS = [
  NbAuthComponent,
  NbAuthBlockComponent,
  NbLoginComponent,
  NbLogoutComponent,
  NbRegisterComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
];

@NgModule({
  imports: [
    AuthRoutingModule,
    ThemeModule,
  ],
  declarations: [
    ...AUTH_COMPONENTS,
  ],
  providers: [],
})
export class AuthModule {
}
