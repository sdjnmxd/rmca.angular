/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {CallbackService} from '../../services/callback.service';

@Component({
  selector: 'ngx-oauth-weibo',
  templateUrl: './oauth-weibo.component.html',
})
export class OauthWeiboComponent implements OnInit {

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private callbackService: CallbackService) {
  }

  error: any;
  message: any;

  ngOnInit(): void {
    this.error = {title: '', message: ''};
    this.message = {title: '', message: ''};

    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.callbackService.oauthWeiboCallback(queryParams.accessToken, queryParams.expiresIn)
        .then(oauthState => {
          this.message.title = '授权成功';
          this.message.message = '即将跳转到社交账户管理页';

          setTimeout(() => {
            this.router.navigate(['/pages/user/socials']);
          }, 3e3);
        })
        .catch(error => {
          this.error.title = '授权失败';
          this.error.message = `message: ${error.error.message || '未知'} | code: ${error.status || '未知'}`;
        });
    });
  }

  goToSocials() {
    this.router.navigate(['/pages/user/socials']);
  }

  hasError(): boolean {
    return this.error.title.length !== 0 || this.error.message.length !== 0;
  }

  hasMessage(): boolean {
    return this.message.title.length !== 0 || this.message.message.length !== 0;
  }
}