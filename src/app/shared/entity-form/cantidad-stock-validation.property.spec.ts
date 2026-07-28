import * as fc from 'fast-check';
import { FormControl, Validators } from '@angular/forms';

/**
 * Feature: crud-frontend-angular
 * Property 11: CantidadStock Validation
 *
 * For any numeric value, the cantidadStock field validator shall accept it if and only if
 * the value is an integer >= 0 and <= 999,999,999. Non-integer numbers, negative values,
 * and values exceeding the maximum shall be rejected.
 *
 * **Validates: Requirements 14.3**
 */
describe('Feature: crud-frontend-angular, Property 11: CantidadStock Validation', () => {
  const validators = [Validators.required, Validators.min(0), Validators.max(999999999)];

  it('should accept integers in [0, 999999999] and reject out-of-range values', () => {
    // Valid: integers in range [0, 999999999]
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999999999 }),
        (validStock) => {
          const control = new FormControl(validStock, validators);
          expect(control.valid).toBeTrue();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: negative integers
    fc.assert(
      fc.property(
        fc.integer({ min: -1000000, max: -1 }),
        (negValue) => {
          const control = new FormControl(negValue, validators);
          expect(control.valid).toBeFalse();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: integers > max
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000000, max: 2000000000 }),
        (bigValue) => {
          const control = new FormControl(bigValue, validators);
          expect(control.valid).toBeFalse();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: null/empty (required validator)
    expect(new FormControl(null, validators).valid).toBeFalse();
    expect(new FormControl('', validators).valid).toBeFalse();
  });
});
