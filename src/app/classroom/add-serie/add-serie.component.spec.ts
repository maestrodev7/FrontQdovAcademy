/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddSerieComponent } from './add-serie.component';

describe('AddSerieComponent', () => {
  let component: AddSerieComponent;
  let fixture: ComponentFixture<AddSerieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSerieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
