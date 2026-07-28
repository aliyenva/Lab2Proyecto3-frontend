import * as fc from 'fast-check';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProductsComponent } from './products.component';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Producto } from '../../models/producto.model';
import { Categoria } from '../../models/categoria.model';

/**
 * Feature: crud-frontend-angular, Property 8: Role-Based CRUD Button Visibility
 *
 * **Validates: Requirements 11.1, 11.2**
 *
 * For any authenticated user with USER role, the Product_Page shall NOT render
 * create, edit, or delete buttons in the DOM. Conversely, for any authenticated
 * user with SUPER-ADMIN-ROLE, all those buttons shall be rendered.
 */
describe('Feature: crud-frontend-angular, Property 8: Role-Based CRUD Button Visibility', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;

  // Generator for a random Categoria
  const categoriaArb: fc.Arbitrary<Categoria> = fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    nombre: fc.stringOf(
      fc.char().filter(c => c !== '\0' && c.trim().length > 0),
      { minLength: 1, maxLength: 30 }
    ),
    descripcion: fc.option(
      fc.stringOf(fc.char().filter(c => c !== '\0'), { minLength: 1, maxLength: 30 }),
      { nil: null }
    )
  });

  // Generator for a random Producto
  const productoArb: fc.Arbitrary<Producto> = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    nombre: fc.stringOf(
      fc.char().filter(c => c !== '\0' && c.trim().length > 0),
      { minLength: 1, maxLength: 30 }
    ),
    descripcion: fc.option(
      fc.stringOf(fc.char().filter(c => c !== '\0'), { minLength: 1, maxLength: 30 }),
      { nil: null }
    ),
    precio: fc.double({ min: 0.01, max: 9999.99, noNaN: true, noDefaultInfinity: true }),
    cantidadStock: fc.integer({ min: 0, max: 999999 }),
    categoria: categoriaArb
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProductoService, useValue: { getAll: () => of([]) } },
        { provide: CategoriaService, useValue: { getAll: () => of([]) } },
        {
          provide: AuthService,
          useValue: {
            hasRole: (role: string) => false,
            isAuthenticated: () => true,
            getRole: () => 'USER',
            getToken: () => 'fake-token'
          }
        },
        NotificationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    // Trigger initial ngOnInit and subscribe completion
    fixture.detectChanges();
  });

  it('USER role never sees create/edit/delete buttons', () => {
    fc.assert(
      fc.property(
        fc.array(productoArb, { minLength: 1, maxLength: 5 }),
        (products: Producto[]) => {
          component.products = products;
          component.loading = false;
          component.errorMessage = '';
          component.isSuperAdmin = false;
          fixture.detectChanges();

          const createBtn = fixture.nativeElement.querySelector('.btn-primary');
          const editBtns = fixture.nativeElement.querySelectorAll('.btn-edit');
          const deleteBtns = fixture.nativeElement.querySelectorAll('.btn-delete');

          // No create button should exist in the DOM
          expect(createBtn).toBeNull();
          // No edit buttons should exist in the DOM
          expect(editBtns.length).toBe(0);
          // No delete buttons should exist in the DOM
          expect(deleteBtns.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('SUPER-ADMIN-ROLE always sees create/edit/delete buttons', () => {
    fc.assert(
      fc.property(
        fc.array(productoArb, { minLength: 1, maxLength: 5 }),
        (products: Producto[]) => {
          component.products = products;
          component.loading = false;
          component.errorMessage = '';
          component.isSuperAdmin = true;
          fixture.detectChanges();

          const createBtn = fixture.nativeElement.querySelector('.btn-primary');
          const editBtns = fixture.nativeElement.querySelectorAll('.btn-edit');
          const deleteBtns = fixture.nativeElement.querySelectorAll('.btn-delete');

          // Create button must be present
          expect(createBtn).not.toBeNull();
          // One edit button per product row
          expect(editBtns.length).toBe(products.length);
          // One delete button per product row
          expect(deleteBtns.length).toBe(products.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
