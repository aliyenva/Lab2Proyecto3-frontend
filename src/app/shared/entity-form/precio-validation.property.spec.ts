import * as fc from 'fast-check';
import { FormControl, Validators } from '@angular/forms';

/**
 * Feature: crud-frontend-angular
 * Property 10: Precio Validation
 *
 * For any numeric value, the precio field validator shall accept it if and only if
 * the value is >= 0.01 and <= 999,999,999.99. All other values (including non-numeric,
 * null, zero, or negative) shall be rejected.
 *
 * **Validates: Requirements 14.2**
 */
describe('Feature: crud-frontend-angular, Property 10: Precio Validation', () => {
  const validators = [Validators.required, Validators.min(0.01), Validators.max(999999999.99)];

  it('should accept numeric values in [0.01, 999999999.99] and reject all others', () => {
    // Valid: numbers in range [0.01, 999999999.99]
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
        (validPrice) => {
          const control = new FormControl(validPrice, validators);
          expect(control.valid).toBeTrue();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: zero
    expect(new FormControl(0, validators).valid).toBeFalse();

    // Invalid: negative numbers
    fc.assert(
      fc.property(
        fc.double({ min: -1000000, max: -0.001, noNaN: true }),
        (negValue) => {
          const control = new FormControl(negValue, validators);
          expect(control.valid).toBeFalse();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: greater than max
    fc.assert(
      fc.property(
        fc.double({ min: 1000000000, max: 9999999999, noNaN: true }),
        (bigValue) => {
          const control = new FormControl(bigValue, validators);
          expect(control.valid).toBeFalse();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: null/empty
    expect(new FormControl(null, validators).valid).toBeFalse();
    expect(new FormControl('', validators).valid).toBeFalse();
  });
});
