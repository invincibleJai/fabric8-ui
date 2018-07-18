import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { Broadcaster } from 'ngx-base';

import { Che } from '../services/che';
import { CodebasesItemHeadingComponent } from './codebases-item-heading.component';

describe('Codebases Item Heading Component', () => {
  let broadcasterMock: any;
  let fixture;
  let component: CodebasesItemHeadingComponent;
  let element: HTMLElement;

  beforeEach(() => {
    broadcasterMock = jasmine.createSpyObj('Broadcaster', ['on']);

    TestBed.configureTestingModule({
      imports: [FormsModule, HttpModule],
      declarations: [CodebasesItemHeadingComponent],
      providers: [
        {
          provide: Broadcaster, useValue: broadcasterMock
        }
      ],
      // Tells the compiler not to error on unknown elements and attributes
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CodebasesItemHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('Che starting message', async(() => {
    let comp = fixture.componentInstance;
    comp.cheState = { running: false } as Che;
    fixture.detectChanges();

    expect(comp.getNotificationMessage()).toEqual(comp.cheStartingMessage);
  }));

  it('Che running message', async(() => {
    let comp = fixture.componentInstance;
    comp.cheState = { running: true } as Che;
    fixture.detectChanges();

    expect(comp.getNotificationMessage()).toEqual(comp.cheRunningMessage);
  }));

  it('Che performing multi-tenant migration message', async(() => {
    let comp = fixture.componentInstance;
    comp.cheState = { running: false, multiTenant: true } as Che;
    fixture.detectChanges();

    expect(comp.getNotificationMessage()).toEqual(comp.chePerformingMultiTenantMigrationMessage);
  }));

  it('Che finished multi-tenant migration message', async(() => {
    let comp = fixture.componentInstance;
    comp.cheState = { running: true, multiTenant: true } as Che;
    fixture.detectChanges();

    expect(comp.getNotificationMessage()).toEqual(comp.cheFinishedMultiTenantMigrationMessage);
  }));

  it('Show Security alert in heading', async(() => {
    let comp = fixture.componentInstance;
    comp.cveNotify = true;
    fixture.detectChanges();

    let cveElementTag = element.querySelector('.security-alert-heading');
    expect(cveElementTag).toBeDefined();
  }));

  it('Should not show Security alert in heading', async(() => {
    let comp = fixture.componentInstance;
    comp.cveNotify = false;
    fixture.detectChanges();

    let cveElementTag = element.querySelector('.security-alert-heading');
    expect(cveElementTag).toBeNull();
  }));
});
