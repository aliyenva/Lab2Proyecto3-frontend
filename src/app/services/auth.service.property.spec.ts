import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

/**
 * Feature: crud-frontend-angular
 * Property 1: Auth Session Round-Trip
 *
 * For any valid login response containing a token, username, and role,
 * storing the session data via AuthService login flow and then retrieving
 * it via getToken(), getUsername(), getRole() returns the exact same values.
 *
 * **Validates: Requirements 2.4**
 */
describe('Feature: crud-frontend-angular, Property 1: Auth Session Round-Trip', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should store and retrieve identical session data for any valid login response', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),  // token
        fc.string({ minLength: 1 }),  // username
        fc.string({ minLength: 1 }),  // role
        (token, username, role) => {
          // Simulate the login flow: subscribe to login observable
          service.login(username, 'password').subscribe();

          // Flush the HTTP request with the generated response
          const req = httpMock.expectOne('/api/auth/login');
          req.flush({ token, username, role });

          // Verify round-trip: retrieved values must be identical to stored values
          expect(service.getToken()).toBe(token);
          expect(service.getUsername()).toBe(username);
          expect(service.getRole()).toBe(role);

          // Clean up localStorage for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
