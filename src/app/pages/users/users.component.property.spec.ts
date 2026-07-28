import * as fc from 'fast-check';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { UserService } from '../../services/user.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UserResponse } from '../../models/user.model';

/**
 * **Validates: Requirements 10.3**
 *
 * Property 7: User Table Rendering Completeness
 * For any non-empty user list, the table renders exactly one row per user
 * with username and role.
 */
describe('Feature: crud-frontend-angular, Property 7: User Table Rendering Completeness', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: { getAll: () => of([]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    // Trigger initial lifecycle (ngOnInit calls loadUsers which gets empty array)
    fixture.detectChanges();
  });

  const userArb = fc.record({
    username: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789_-.'.split('')), { minLength: 1, maxLength: 30 }),
    role: fc.constantFrom('SUPER-ADMIN-ROLE', 'USER')
  });

  it('should render exactly one row per user with username and role', () => {
    fc.assert(
      fc.property(
        fc.array(userArb, { minLength: 1, maxLength: 10 }),
        (users: UserResponse[]) => {
          component.users = users;
          component.loading = false;
          component.errorMessage = '';
          fixture.detectChanges();

          const rows = fixture.nativeElement.querySelectorAll('tbody tr');
          expect(rows.length).toBe(users.length);

          users.forEach((user, i) => {
            const cells = rows[i].querySelectorAll('td');
            expect(cells[0].textContent.trim()).toBe(user.username);
            expect(cells[1].textContent.trim()).toBe(user.role);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
