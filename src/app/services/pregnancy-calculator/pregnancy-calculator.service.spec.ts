import { TestBed } from '@angular/core/testing';

import { PregnancyCalculatorService } from './pregnancy-calculator.service';

describe('PregnancyCalculatorService', () => {
  let service: PregnancyCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PregnancyCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
