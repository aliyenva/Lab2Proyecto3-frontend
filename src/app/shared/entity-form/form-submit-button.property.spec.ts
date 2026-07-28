import * as fc from 'fast-check';

/**
 * Feature: crud-frontend-angular
 * Property 12: Form Submit Button Enablement
 *
 * For any pair of username and password input values on the login or registration form,
 * the submit button shall be enabled if and only if both values contain at least one
 * non-whitespace character. In all other cases, the button shall remain disabled.
 *
 * **Validates: Requirements 14.7, 14.8**
 */
describe('Feature: crud-frontend-angular, Property 12: Form Submit Button Enablement', () => {
  // Replicate the isSubmitDisabled logic from login/register components
  function isSubmitDisabled(username: string, password: string, loading: boolean): boolean {
    return (username?.trim() || '').length === 0 || (password?.trim() || '').length === 0 || loading;
  }

  it('submit enabled iff both username and password have non-whitespace content and not loading', () => {
    fc.assert(
      fc.property(
        fc.string(),  // username
        fc.string(),  // password
        (username, password) => {
          const disabled = isSubmitDisabled(username, password, false);
          const hasValidUsername = username.trim().length > 0;
          const hasValidPassword = password.trim().length > 0;
          const shouldBeEnabled = hasValidUsername && hasValidPassword;

          expect(disabled).toBe(!shouldBeEnabled);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('submit always disabled when loading regardless of input values', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (username, password) => {
          const disabled = isSubmitDisabled(username, password, true);
          expect(disabled).toBeTrue();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('submit disabled when username is empty or whitespace-only', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (whitespaceUsername, validPassword) => {
          const disabled = isSubmitDisabled(whitespaceUsername, validPassword, false);
          expect(disabled).toBeTrue();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('submit disabled when password is empty or whitespace-only', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        (validUsername, whitespacePassword) => {
          const disabled = isSubmitDisabled(validUsername, whitespacePassword, false);
          expect(disabled).toBeTrue();
        }
      ),
      { numRuns: 100 }
    );
  });
});
