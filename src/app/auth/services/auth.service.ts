import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {
  }

  login(username, password) {
    return this.http.post('/api/user/login', {
      username,
      password,
    });
  }

  logout() {
    return this.http.get('');
  }

  register(username, password, email) {
    return this.http.post('', {
      username,
      password,
      email,
    });
  }

  resetPassword(email) {
    return this.http.post('', {
      email,
    });
  }
}
