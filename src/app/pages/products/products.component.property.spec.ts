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
 * Feature: crud-frontend-angular, Property 5: Product Table Rendering Completeness
 *
 * **Validates: Requirements 4.2**
 *
 * For any non-empty list of products, the Product_Page table renders exactly one
 * row per product, and each row displays the product's nombre, descripcion, precio,
 * cantidadStock, and associated categoria name.
 */
describe('Feature: crud-frontend-angular, Property 5: Product Table Rendering Completeness', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;

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
            hasRole: () => true,
            isAuthenticated: () => true,
            getRole: () => 'SUPER-ADMIN-ROLE',
            getToken: () => 'fake-token'
          }
        },
        NotificationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    // Initial detectChanges to trigger ngOnInit
    fixture.detectChanges();
  });

  // Generator for a non-empty string without leading/trailing whitespace
  // Using alphanumeric-like chars to avoid HTML entity issues in textContent
  const safeStringArb = (minLen: number, maxLen: number) =>
    fc.stringOf(
      fc.char().filter(c => c.trim().length > 0 && c !== '<' && c !== '>' && c !== '&' && c !== '\0'),
      { minLength: minLen, maxLength: maxLen }
    ).map(s => s.trim()).filter(s => s.length >= minLen);

  // Generator for a random Categoria
  const categoriaArb: fc.Arbitrary<Categoria> = fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    nombre: safeStringArb(1, 20),
    descripcion: fc.option(safeStringArb(1, 20), { nil: null })
  });

  // Generator for a random Producto
  const productoArb: fc.Arbitrary<Producto> = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    nombre: safeStringArb(1, 20),
    descripcion: fc.option(safeStringArb(1, 20), { nil: null }),
    precio: fc.double({ min: 0.01, max: 9999.99, noNaN: true, noDefaultInfinity: true }),
    cantidadStock: fc.integer({ min: 0, max: 999999 }),
    categoria: categoriaArb
  });

  it('should render exactly one row per product with all fields displayed', () => {
    fc.assert(
      fc.property(
        fc.array(productoArb, { minLength: 1, maxLength: 10 }),
        (products: Producto[]) => {
          // Set the component state directly to simulate loaded products
          component.products = products;
          component.loading = false;
          component.errorMessage = '';
          component.isSuperAdmin = true;
          fixture.detectChanges();

          const rows = fixture.nativeElement.querySelectorAll('tbody tr');

          // Property: exactly one row per product
          expect(rows.length).toBe(products.length);

          // Property: each row contains all expected fields
          products.forEach((product: Producto, i: number) => {
            const cells = rows[i].querySelectorAll('td');

            // Column 0: nombre
            expect(cells[0].textContent.trim()).toBe(product.nombre);

            // Column 1: descripcion (null renders as empty string in Angular)
            const expectedDescripcion = product.descripcion ?? '';
            expect(cells[1].textContent.trim()).toBe(expectedDescripcion);

            // Column 2: precio
            expect(cells[2].textContent.trim()).toBe(String(product.precio));

            // Column 3: cantidadStock
            expect(cells[3].textContent.trim()).toBe(String(product.cantidadStock));

            // Column 4: categoria nombre
            expect(cells[4].textContent.trim()).toBe(product.categoria.nombre);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
