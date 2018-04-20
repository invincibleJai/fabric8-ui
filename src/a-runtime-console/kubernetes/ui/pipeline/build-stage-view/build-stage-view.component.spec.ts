/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { BaseRequestOptions, Http, HttpModule, RequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MomentModule } from 'angular2-moment';
import { StackDetailsModule } from 'fabric8-stack-analysis-ui';
import { ModalModule } from 'ngx-modal';

import { FABRIC8_FORGE_API_URL } from 'app/shared/runtime-console/fabric8-ui-forge-api';
import { AUTH_API_URL, REALM, SSO_API_URL } from 'ngx-login-client';

import { InputActionDialog } from '../input-action-dialog/input-action-dialog.component';
import { TestAppModule } from './../../../../app.test.module';
import { BuildStatusIconComponent } from './../../../components/build-status-icon/build-status-icon.component';
import { PipelineStatusComponent } from './../../../components/pipeline-status/pipeline-status.component';
import { BuildStageViewComponent } from './build-stage-view.component';
import { StageTimePipe } from './stage-time.pipe';

describe('BuildStageViewComponent', () => {
  let component: BuildStageViewComponent;
  let fixture: ComponentFixture<BuildStageViewComponent>;
  let buildData: any = {
      'statusPhase': 'Complete',
      'logURL': 'https://jenkins.openshift.io/job/invinciblejai/job/app-test-apr-18-10-43/job/master/1/console',
      'name': 'app-test-apr-18-10-43-1',
      'namespace': 'jakumar',
      'icon': '',
      'iconStyle': 'pficon-ok',
      'id': 'app-test-apr-18-10-43-1',
      'buildConfigName': 'app-test-apr-18-10-43',
      'buildNumber': 1,
      'buildNumberInt': 1,
      'pipelineStages': [{
        'durationMillis': 172579,
        'id': '20',
        'name': 'Build Release',
        'pauseDurationMillis': 0,
        'status': 'SUCCESS'
    },
    {
        'durationMillis': 172579,
        'environmentName': 'Stage',
        'id': '60',
        'name': 'Rollout to Stage',
        'pauseDurationMillis': 0,
        'serviceUrl': 'http://app-test-apr-12-11-jakumar-stage.8a09.starter-us-east-2.openshiftapps.com',
        'serviceUrlMap': {
            'app-test-apr-12-11': 'http://app-test-apr-12-11-jakumar-stage.8a09.starter-us-east-2.openshiftapps.com'
        },
        'status': 'SUCCESS'
    },
    {
        'durationMillis': 172579,
        'id': '20',
        'name': 'Approve',
        'pauseDurationMillis': 0,
        'status': 'FAILED'
    }
    ]
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ModalModule,
        MomentModule,
        RouterTestingModule.withRoutes([]),
        StackDetailsModule,
        TestAppModule
      ],
      declarations: [
        BuildStatusIconComponent,
        BuildStageViewComponent,
        InputActionDialog,
        PipelineStatusComponent,
        StageTimePipe
      ],
      providers: [
        MockBackend,
        { provide: RequestOptions, useClass: BaseRequestOptions },
        {
          provide: Http, useFactory: (backend, options) => {
            return new Http(backend, options);
          }, deps: [MockBackend, RequestOptions]
        },
        {
            provide: AUTH_API_URL, useValue: 'http://example.com/'
        },
        {
            provide: SSO_API_URL, useValue: 'http://example.com/'
        },
        {
            provide: REALM, useValue: 'http://example.com/'
        },
        {
            provide: FABRIC8_FORGE_API_URL, useValue: 'http://example.com/'
        }
       ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildStageViewComponent);
    component = fixture.componentInstance;
    component.build = buildData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
