import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {AuthUtilService} from '../services/auth-util.service';
import {NoticeService} from '../../@system/notice/notice.service';

import {UserCacheService} from '../../@system/cache/service/user-cache.service';
import {UserService} from '../../pages/user/user.service';
import {User} from '../../@model/user/user.interface';

@Injectable()
export class NeedLoginGuard implements CanActivate {
  constructor(private router: Router,
              private authUtilService: AuthUtilService,
              private userService: UserService,
              private userCacheService: UserCacheService,
              private noticeService: NoticeService) {
  }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const isUserAuthenticated = await this.authUtilService.isUserAuthenticated();

      if (isUserAuthenticated.isLogin) {
        this.userCacheService.setCache(await this.userService.getUserProfile() as User);

        if (isUserAuthenticated.user.impersonate) {
          this.noticeService.warning('替身模式装弹成功!', `当前正处于替身模式, 替身用户为${isUserAuthenticated.user.username}`);
        } else {
          this.noticeService.info('不要变成发抖的小喵喵', '|･ω･｀)');
        }

        return true;
      } else {
        this.userCacheService.deleteUser();

        this.noticeService.warning('Auth Router Guard (needLogin)', '你还未登陆');
        this.router.navigate(['/auth/login']);

        return false;
      }

    } catch (error) {
      this.noticeService.error('[NeedLoginGuard] canActivate', error);
      console.trace(error);
    }
  }
}
