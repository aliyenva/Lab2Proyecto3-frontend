import * as fc from 'fast-check';
import { FormControl, Validators } from '@angular/forms';
import { noWhitespaceOnlyValidator } from './entity-form.component';

/**
 * Feature: crud-frontend-angular
 * Property 9: Nombre Validation
 *
 * For any input string, the nombre field validator shall accept it if and only if
 * it has at least 1 character, at most 255 characters, and is not composed entirely
 * of whitespace. All other strings shall be rejected.
 *
 * **Validates: Requirements 14.1**
 */
describe('Feature: crud-frontend-angular, Property 9: Nombre Validation', () => {
  const validators = [Validators.required, Validators.maxLength(255), noWhitespaceOnlyValidator()];

  it('should accept strings with 1-255 non-whitespace-only characters and reject all others', () => {
    // Valid strings: 1-255 chars, not all whitespace
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0),
        (validName) => {
          const control = new FormControl(validName, validators);
          expect(control.valid).toBeTrue();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: empty string
    const emptyControl = new FormControl('', validators);
    expect(emptyControl.valid).toBeFalse();

    // Invalid: strings longer than 255 characters
    fc.assert(
      fc.property(
        fc.string({ minLength: 256, maxLength: 500 }),
        (longName) => {
          const control = new FormControl(longName, validators);
          expect(control.valid).toBeFalse();
        }
      ),
      { numRuns: 100 }
    );

    // Invalid: whitespace-only strings
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 255 }),
        (wsOnly) => {
          const control = new FormControl(wsOnly, validators);
          expect(control.valid).toBeFalse();
        }
      ),
      { numRuns: 100 }
    );
  });
});
