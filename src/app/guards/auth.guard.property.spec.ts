import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

/**
 * Feature: crud-frontend-angular, Property 2: Auth Guard Denies Unauthenticated Access
 *
 * **Validates: Requirements 2.7, 13.4**
 *
 * For any protected route with no JWT token in localStorage,
 * the authGuard should return a UrlTree redirecting to /login (never returns true).
 */
describe('Feature: crud-frontend-angular, Property 2: Auth Guard Denies Unauthenticated Access', () => {
  let router: Router;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: {} },
        {
          provide: Router,
          useValue: {
            createUrlTree: (commands: string[]) => {
              const urlTree = { toString: () => commands.join('/') } as unknown as UrlTree;
              (urlTree as any).__commands = commands;
              return urlTree;
            }
          }
        }
      ]
    });

    router = TestBed.inject(Router);
    injector = TestBed.inject(EnvironmentInjector);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect to /login for any route when no JWT token is present', () => {
    // Generator for random route paths - produces valid URL path segments
    const routePathArb = fc.array(
      fc.stringOf(
        fc.char().filter(c => /[a-zA-Z0-9\-_]/.test(c)),
        { minLength: 1, maxLength: 20 }
      ),
      { minLength: 1, maxLength: 5 }
    ).map(segments => '/' + segments.join('/'));

    fc.assert(
      fc.property(
        routePathArb,
        (routePath: string) => {
          // Ensure no token in localStorage
          localStorage.removeItem('jwt_token');

          const result = runInInjectionContext(injector, () => {
            return authGuard(
              {} as any,
              { url: routePath } as any
            );
          });

          // Should never return true (allow access)
          expect(result).not.toBe(true);

          // Should be a UrlTree that redirects to /login
          expect(result instanceof Object).toBe(true);
          expect((result as any).__commands).toEqual(['/login']);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should deny access regardless of route state parameters when unauthenticated', () => {
    // Generator for random route state URLs with query-like patterns
    const urlWithParamsArb = fc.tuple(
      fc.stringOf(
        fc.char().filter(c => /[a-zA-Z0-9\-_]/.test(c)),
        { minLength: 1, maxLength: 15 }
      ),
      fc.stringOf(
        fc.char().filter(c => /[a-zA-Z0-9]/.test(c)),
        { minLength: 0, maxLength: 10 }
      )
    ).map(([path, param]) => param ? `/${path}?key=${param}` : `/${path}`);

    fc.assert(
      fc.property(
        urlWithParamsArb,
        (routeUrl: string) => {
          // Ensure no token
          localStorage.removeItem('jwt_token');

          const result = runInInjectionContext(injector, () => {
            return authGuard(
              {} as any,
              { url: routeUrl } as any
            );
          });

          // Must always redirect, never allow
          expect(result).not.toBe(true);
          expect((result as any).__commands).toEqual(['/login']);
        }
      ),
      { numRuns: 100 }
    );
  });
});
