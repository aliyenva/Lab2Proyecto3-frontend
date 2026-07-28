import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

/**
 * **Validates: Requirements 10.5, 10.7**
 *
 * Property 3: Role Guard Denies Unauthorized Role
 * For any route requiring SUPER-ADMIN-ROLE, if the authenticated user has USER role,
 * the role guard should return a URL tree redirecting to /products and never return true.
 */
describe('Feature: crud-frontend-angular, Property 3: Role Guard Denies Unauthorized Role', () => {
  let injector: EnvironmentInjector;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);
    mockRouter.createUrlTree.and.callFake((commands: string[]) => {
      return { toString: () => commands.join('/') } as unknown as UrlTree;
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    injector = TestBed.inject(EnvironmentInjector);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect USER role to /products for any route requiring SUPER-ADMIN-ROLE', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map(s => '/' + s.replace(/\s/g, '')),
        (routePath) => {
          // Set up localStorage with USER role (not SUPER-ADMIN-ROLE)
          localStorage.setItem('role', 'USER');
          localStorage.setItem('jwt_token', 'some-token');
          localStorage.setItem('username', 'testuser');

          const guard = roleGuard('SUPER-ADMIN-ROLE');
          const result = runInInjectionContext(injector, () => {
            return guard({} as any, { url: routePath } as any);
          });

          // The guard should never return true for USER role
          expect(result).not.toBe(true);
          // The guard should return a UrlTree (redirect to /products)
          expect(result instanceof Object).toBe(true);
          expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/products']);
        }
      ),
      { numRuns: 100 }
    );
  });
});
