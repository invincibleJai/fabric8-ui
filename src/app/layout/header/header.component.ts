import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Observable, Subscription } from 'rxjs';

import { Broadcaster, Logger } from 'ngx-base';
import { Context, Contexts } from 'ngx-fabric8-wit';
import { AuthenticationService, User, UserService } from 'ngx-login-client';

import { removeAction } from '../../app-routing.module';

import { FeatureTogglesService } from 'ngx-feature-flag';
import { Navigation } from '../../models/navigation';
import { LoginService } from '../../shared/login.service';
import { MenuedContextType } from './menued-context-type';

interface MenuHiddenCallback {
  (headerComponent: HeaderComponent): Observable<boolean>;
}

@Component({
  selector: 'alm-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  providers: []
})
export class HeaderComponent implements OnInit, OnDestroy {
  imgLoaded: Boolean = false;
  isIn = false;   // store state
  isChatbotOn = false;

  toggleState() { // click handler
      let bool = this.isIn;
      this.isIn = bool === false ? true : false;
  }

  menuCallbacks = new Map<String, MenuHiddenCallback>([
    [
      '_settings', function(headerComponent) {
        return headerComponent.checkContextUserEqualsLoggedInUser();
      }
    ],
    [
      '_resources', function(headerComponent) {
        return headerComponent.checkContextUserEqualsLoggedInUser();
      }
    ],
    [
      'settings', function(headerComponent) {
        return headerComponent.checkContextUserEqualsLoggedInUser();
      }
    ]
  ]);

  recent: Context[];
  appLauncherEnabled: boolean = false;
  loggedInUser: User;
  private _context: Context;
  private _defaultContext: Context;
  private _loggedInUserSubscription: Subscription;
  private plannerFollowQueryParams: Object = {};
  private eventListeners: any[] = [];
  private selectedFlow: string;
  private space: string;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private userService: UserService,
    private logger: Logger,
    public loginService: LoginService,
    private broadcaster: Broadcaster,
    private contexts: Contexts,
    private authentication: AuthenticationService,
    private featureTogglesService: FeatureTogglesService
  ) {
    this.space = '';
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.broadcaster.broadcast('navigate', { url: val.url } as Navigation);
        this.updateMenus();
      }
    });
    contexts.current.subscribe(val => {
      this._context = val;
      this.updateMenus();
    });
    contexts.default.subscribe(val => {
      this._defaultContext = val;
    });
    contexts.recent.subscribe(val => this.recent = val);

    // Currently logged in user
    this.userService.loggedInUser.subscribe(
      val => {
        if (val.id) {
          this.loggedInUser = val;
        } else {
          this.resetData();
          this.loggedInUser = null;
        }
      }
    );
  }

  ngOnInit(): void {
    this.listenToEvents();
  }

  ngOnDestroy() {
    this.eventListeners.forEach(e => e.unsubscribe());
  }

  listenToEvents() {
    this.eventListeners.push(
      this.route.queryParams.subscribe(params => {
        this.plannerFollowQueryParams = {};
        if (Object.keys(params).indexOf('iteration') > -1) {
          this.plannerFollowQueryParams['iteration'] = params['iteration'];
        }
      })
    );
  }

  login() {
    this.loginService.redirectUrl = this.router.url;
    this.broadcaster.broadcast('login');
    this.loginService.redirectToAuth();
  }

  logout() {
    this.loginService.logout();

  }

  //trigger chatbot
  openChatBot() {
    // this.loginService.logout();
    this.isChatbotOn = !this.isChatbotOn;
  }

  // Chat bot status handler
  chatBotStatusHandler(chatBotStatus: boolean) {
    this.isChatbotOn = chatBotStatus;
  }

  onImgLoad() {
    this.imgLoaded = true;
  }

  resetData(): void {
    this.imgLoaded = false;
  }

  showAddSpaceOverlay(): void {
    this.broadcaster.broadcast('showAddSpaceOverlay', true);
  }

  get context(): Context {
    if (this.router.url.startsWith('/_home') || this.router.url.startsWith('/_featureflag')) {
      return this._defaultContext;
    } else if (this.router.url.startsWith('/_error')) {
      return null;
    } else {
      return this._context;
    }
  }

  get isGettingStartedPage(): boolean {
    return (this.router.url.indexOf('_gettingstarted') !== -1);
  }

  get isAppLauncherPage(): boolean {
    return (this.router.url.indexOf('applauncher') !== -1);
  }

  formatUrl(url: string) {
    url = this.stripQueryFromUrl(url);
    url = removeAction(url);
    return url;
  }

  private stripQueryFromUrl(url: string) {
    if (url.indexOf('?q=') !== -1) {
      url = url.substring(0, url.indexOf('?q='));
    }
    return url;
  }

  private updateMenus() {
    if (this.context && this.context.type && this.context.type.hasOwnProperty('menus')) {
      let foundPath = false;
      let url = this.formatUrl(this.router.url);
      let menus = (this.context.type as MenuedContextType).menus;
      for (let n of menus) {
        // Clear the menu's active state
        n.active = false;
        if (this.menuCallbacks.has(n.path)) {
          this.menuCallbacks.get(n.path)(this).subscribe(val => n.hide = val);
        }
        // lets go in reverse order to avoid matching
        // /namespace/space/create instead of /namespace/space/create/pipelines
        // as the 'Create' page matches to the 'Codebases' page
        let subMenus = (n.menus || []).slice().reverse();
        if (subMenus && subMenus.length > 0) {
          for (let o of subMenus) {
            // Clear the menu's active state
            o.active = false;
            if (!foundPath && o.fullPath === decodeURIComponent(url)) {
              foundPath = true;
              o.active = true;
              n.active = true;
            }
            if (this.menuCallbacks.has(o.path)) {
              this.menuCallbacks.get(o.path)(this).subscribe(val => o.hide = val);
            }
          }
          if (!foundPath) {
            // lets check if the URL matches part of the path
            for (let o of subMenus) {
              if (!foundPath && decodeURIComponent(url).startsWith(o.fullPath + '/')) {
                foundPath = true;
                o.active = true;
                n.active = true;
              }
              if (this.menuCallbacks.has(o.path)) {
                this.menuCallbacks.get(o.path)(this).subscribe(val => o.hide = val);
              }
            }
          }
          if (!foundPath && this.router.routerState.snapshot.root.firstChild) {
            // routes that can't be correctly matched based on the url should use the parent path
            for (let o of subMenus) {
              let parentPath = decodeURIComponent('/' + this.router.routerState.snapshot.root.firstChild.url.join('/'));
              if (!foundPath && o.fullPath === parentPath) {
                foundPath = true;
                o.active = true;
                n.active = true;
              }
              if (this.menuCallbacks.has(o.path)) {
                this.menuCallbacks.get(o.path)(this).subscribe(val => o.hide = val);
              }
            }
          }
        } else if (!foundPath && n.fullPath === url) {
          n.active = true;
          foundPath = true;
        }
      }
    }
  }

  private checkContextUserEqualsLoggedInUser(): Observable<boolean> {
    return Observable.combineLatest(
      Observable.of(this.context).map(val => val.user.id),
      this.userService.loggedInUser.map(val => val.id),
      (a, b) => (a !== b)
    );
  }

}
