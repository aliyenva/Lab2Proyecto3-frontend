import * as fc from 'fast-check';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriesComponent } from './categories.component';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Categoria } from '../../models/categoria.model';

/**
 * Feature: crud-frontend-angular
 * Property 6: Category Table Rendering Completeness
 *
 * For any non-empty list of categories, the Category_Page table shall render
 * exactly one row per category, and each row shall display the category's
 * nombre and descripcion.
 *
 * **Validates: Requirements 5.2**
 */
describe('Feature: crud-frontend-angular, Property 6: Category Table Rendering Completeness', () => {
  let fixture: ComponentFixture<CategoriesComponent>;
  let component: CategoriesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CategoriaService, useValue: { getAll: () => of([]) } },
        { provide: AuthService, useValue: { hasRole: () => true, isAuthenticated: () => true } },
        NotificationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  const categoriaArb = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    nombre: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), { minLength: 1, maxLength: 50 }),
    descripcion: fc.option(
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), { minLength: 1, maxLength: 50 }),
      { nil: null }
    )
  });

  it('should render exactly one row per category with nombre and descripcion', () => {
    fc.assert(
      fc.property(
        fc.array(categoriaArb, { minLength: 1, maxLength: 10 }),
        (categories: Categoria[]) => {
          component.categories = categories;
          component.loading = false;
          component.errorMessage = '';
          component.isSuperAdmin = true;
          fixture.detectChanges();

          const rows = fixture.nativeElement.querySelectorAll('tbody tr');

          // Exactly one row per category
          expect(rows.length).toBe(categories.length);

          // Each row displays nombre and descripcion
          categories.forEach((cat, i) => {
            const cells = rows[i].querySelectorAll('td');
            expect(cells[0].textContent.trim()).toBe(cat.nombre);
            expect(cells[1].textContent.trim()).toBe(cat.descripcion ?? '');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
