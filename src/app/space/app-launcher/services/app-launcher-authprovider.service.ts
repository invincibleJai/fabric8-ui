import { Inject, Injectable, OpaqueToken } from '@angular/core';

import { AuthHelperService } from 'ngx-forge';
import { AUTH_API_URL } from 'ngx-login-client';

@Injectable()
export class AuthAPIProvider extends AuthHelperService {

  constructor(private apiUrl: string) {
    super();
  }

  getAuthApiURl(): any {
    return this.apiUrl;
  }
}
