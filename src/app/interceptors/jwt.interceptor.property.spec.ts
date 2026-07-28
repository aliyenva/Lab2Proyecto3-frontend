import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { jwtInterceptor } from './jwt.interceptor';
import { provideRouter } from '@angular/router';

/**
 * Feature: crud-frontend-angular
 * Property 4: Interceptor Token Attachment Decision
 *
 * Token is attached if and only if the URL is not excluded AND token exists in storage.
 * Excluded URLs are those containing '/api/auth/login' or '/api/auth/register'.
 *
 * **Validates: Requirements 12.1, 12.2, 12.4**
 */
describe('Feature: crud-frontend-angular, Property 4: Interceptor Token Attachment Decision', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should attach token iff URL is not excluded AND token exists', () => {
    const excludedUrls = ['/api/auth/login', '/api/auth/register'];

    const nonExcludedUrl = fc.constantFrom(
      '/api/productos',
      '/api/categorias',
      '/api/users',
      '/api/productos/1',
      '/api/categorias/5',
      '/api/users/profile'
    );
    const excludedUrl = fc.constantFrom(...excludedUrls);
    const url = fc.oneof(nonExcludedUrl, excludedUrl);
    const token = fc.option(fc.string({ minLength: 1 }), { nil: null });

    fc.assert(
      fc.property(url, token, (testUrl, testToken) => {
        localStorage.clear();
        if (testToken) {
          localStorage.setItem('jwt_token', testToken);
        }

        http.get(testUrl).subscribe({ error: () => {} });
        const req = httpMock.expectOne(testUrl);

        const isExcluded = excludedUrls.some(e => testUrl.includes(e));
        const shouldHaveAuth = !isExcluded && testToken !== null;

        if (shouldHaveAuth) {
          expect(req.request.headers.has('Authorization')).toBeTrue();
          expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
        } else {
          expect(req.request.headers.has('Authorization')).toBeFalse();
        }

        req.flush({});
      }),
      { numRuns: 100 }
    );
  });
});
