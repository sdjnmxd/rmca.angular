import {Component, OnInit} from '@angular/core';

import {NoticeService} from '../../../@system/notice/notice.service';

import {UserService} from '../user.service';

import {User} from '../../../@model/user/user.interface';
import {DefaultUser} from '../../../@model/user/user.const';
import {UserCacheService} from '../../../@system/cache/service/user-cache.service';

@Component({
  styleUrls: ['./yggdrasil.component.scss'],
  templateUrl: './yggdrasil.component.html',
})
export class YggdrasilComponent implements OnInit {
  user: User;

  constructor(private noticeService: NoticeService,
              private userService: UserService,
              private userCacheService: UserCacheService) {
    this.user = DefaultUser;
  }

  ngOnInit() {
    this.user = this.userCacheService.getCache();
  }

  public async getUserProfile(): Promise<void> {
    try {
      const user = await this.userService.getUserProfile();

      this.userCacheService.setCache(user as User);
      this.user = user as User;
    } catch (error) {
      this.noticeService.error('获取用户信息失败, 请刷新页面重试', `message: ${error.error.message || '未知'} | code: ${error.status || '未知'}`);
      console.trace(error);
    }
  }
}
