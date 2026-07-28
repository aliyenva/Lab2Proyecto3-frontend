import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { EntityFormComponent, EntityFormConfig, FieldConfig } from '../../shared/entity-form/entity-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Producto, ProductoPayload } from '../../models/producto.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, EntityFormComponent, ConfirmDialogComponent],
  template: `
    <div class="products-page">
      <div class="page-header">
        <h1>🍱 Productos</h1>
        @if (isSuperAdmin) {
          <button class="btn btn-primary" (click)="openCreateForm()">+ Create Product</button>
        }
      </div>

      @if (loading) {
        <div class="loading-indicator">
          <span class="spinner"></span>
          <span>Loading products...</span>
        </div>
      }

      @if (errorMessage) {
        <div class="error-message" role="alert">
          {{ errorMessage }}
        </div>
      }

      @if (!loading && !errorMessage && products.length === 0) {
        <div class="empty-state">
          <span class="empty-emoji">🍙</span>
          <p>No products available yet!</p>
          <p class="empty-sub">Start by adding your first product ✨</p>
        </div>
      }

      @if (!loading && !errorMessage && products.length > 0) {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Cantidad Stock</th>
                <th>Categoría</th>
                @if (isSuperAdmin) {
                  <th>Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (product of products; track product.id) {
                <tr>
                  <td>{{ product.nombre }}</td>
                  <td>{{ product.descripcion }}</td>
                  <td>{{ product.precio }}</td>
                  <td>{{ product.cantidadStock }}</td>
                  <td>{{ product.categoria.nombre }}</td>
                  @if (isSuperAdmin) {
                    <td class="actions-cell">
                      <button class="btn btn-edit" (click)="openEditForm(product)">Edit</button>
                      <button class="btn btn-delete" (click)="openDeleteDialog(product)">Delete</button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <app-entity-form
        [config]="formConfig"
        [visible]="formVisible"
        (formSubmit)="onFormSubmit($event)"
        (formCancel)="onFormCancel()"
      ></app-entity-form>

      <app-confirm-dialog
        [entityName]="productToDelete?.nombre || ''"
        [visible]="confirmDialogVisible"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="onDeleteCancelled()"
      ></app-confirm-dialog>
    </div>
  `,
  styles: [`
    .products-page {
      padding: 2rem;
      position: relative;
      z-index: 1;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: #6b4a7a;
    }

    .btn {
      padding: 0.5rem 1.25rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: 'Nunito', sans-serif;
      transition: all 0.25s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #B5EAD7 0%, #8fd4b8 100%);
      color: #3a6b55;
      box-shadow: 0 3px 10px rgba(181, 234, 215, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(181, 234, 215, 0.5);
    }

    .btn-edit {
      background: linear-gradient(135deg, #E8D5F5 0%, #d4bfe8 100%);
      color: #5a4a6b;
      margin-right: 8px;
    }

    .btn-edit:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(232, 213, 245, 0.5);
    }

    .btn-delete {
      background: linear-gradient(135deg, #FFB7C5 0%, #ff9aad 100%);
      color: #6b3a4a;
    }

    .btn-delete:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(255, 183, 197, 0.5);
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 2rem;
      color: #9b8aa8;
      font-weight: 500;
      justify-content: center;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid #E8D5F5;
      border-top-color: #FFB7C5;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      background: #FFF0F5;
      border: 1px solid #FFB7C5;
      color: #d4708a;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #9b8aa8;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 16px;
      border: 2px dashed #E8D5F5;
    }

    .empty-emoji {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .empty-state p {
      margin: 0.25rem 0;
      font-weight: 600;
    }

    .empty-sub {
      font-size: 0.9rem;
      font-weight: 400 !important;
      color: #b8a5c8;
    }

    .table-wrapper {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(232, 213, 245, 0.2);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(255, 255, 255, 0.95);
    }

    .data-table th {
      background: linear-gradient(135deg, #FFDAC1 0%, #FFE8D0 100%);
      padding: 14px 16px;
      text-align: left;
      font-size: 0.8rem;
      font-weight: 700;
      color: #6b5a4a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #FFD0B0;
    }

    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f5eef8;
      font-size: 0.9rem;
      color: #5a4a6b;
    }

    .data-table tbody tr:nth-child(even) {
      background: rgba(232, 213, 245, 0.1);
    }

    .data-table tbody tr:nth-child(odd) {
      background: rgba(255, 245, 186, 0.1);
    }

    .data-table tbody tr:hover {
      background: rgba(255, 183, 197, 0.1);
    }

    .actions-cell {
      white-space: nowrap;
    }
  `]
})
export class ProductsComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  products: Producto[] = [];
  loading = false;
  errorMessage = '';
  isSuperAdmin = false;

  formVisible = false;
  formConfig: EntityFormConfig = { title: '', fields: [], submitLabel: '' };
  selectedProduct: Producto | null = null;

  confirmDialogVisible = false;
  productToDelete: Producto | null = null;

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.hasRole('SUPER-ADMIN-ROLE');
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productoService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 401) {
          this.errorMessage = 'Could not load products. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.selectedProduct = null;
    this.formConfig = this.buildFormConfig('Create Product', 'Create');
    this.formVisible = true;
  }

  openEditForm(product: Producto): void {
    this.selectedProduct = product;
    this.formConfig = this.buildFormConfig('Edit Product', 'Update', {
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio,
      cantidadStock: product.cantidadStock,
      categoria: product.categoria?.id
    });
    this.formVisible = true;
  }

  onFormSubmit(formValues: Record<string, any>): void {
    const payload: ProductoPayload = {
      nombre: formValues['nombre'],
      descripcion: formValues['descripcion'] || null,
      precio: Number(formValues['precio']),
      cantidadStock: Number(formValues['cantidadStock']),
      categoria: { id: Number(formValues['categoria']) }
    };

    if (this.selectedProduct) {
      this.productoService.update(this.selectedProduct.id, payload).subscribe({
        next: () => {
          this.formVisible = false;
          this.notificationService.showSuccess('Product updated successfully');
          this.loadProducts();
        },
        error: (error: HttpErrorResponse) => {
          this.handleFormError(error);
        }
      });
    } else {
      this.productoService.create(payload).subscribe({
        next: () => {
          this.formVisible = false;
          this.notificationService.showSuccess('Product created successfully');
          this.loadProducts();
        },
        error: (error: HttpErrorResponse) => {
          this.handleFormError(error);
        }
      });
    }
  }

  onFormCancel(): void {
    this.formVisible = false;
    this.selectedProduct = null;
  }

  openDeleteDialog(product: Producto): void {
    this.productToDelete = product;
    this.confirmDialogVisible = true;
  }

  onDeleteConfirmed(): void {
    if (!this.productToDelete) return;

    const productId = this.productToDelete.id;
    this.confirmDialogVisible = false;

    this.productoService.delete(productId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Product deleted successfully');
        this.loadProducts();
        this.productToDelete = null;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.notificationService.showError('Product no longer exists');
          this.loadProducts();
        } else {
          this.notificationService.showError('Failed to delete product. Please try again.');
        }
        this.productToDelete = null;
      }
    });
  }

  onDeleteCancelled(): void {
    this.confirmDialogVisible = false;
    this.productToDelete = null;
  }

  private buildFormConfig(title: string, submitLabel: string, initialValues?: Record<string, any>): EntityFormConfig {
    const fields: FieldConfig[] = [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 255 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: false, maxLength: 255 },
      { name: 'precio', label: 'Precio', type: 'number', required: true, min: 0.01, max: 999999999.99 },
      { name: 'cantidadStock', label: 'Cantidad Stock', type: 'number', required: true, min: 0, max: 999999999 },
      {
        name: 'categoria',
        label: 'Categoría',
        type: 'select',
        required: true,
        options$: this.categoriaService.getAll().pipe(
          map(cats => cats.map(c => ({ value: c.id, label: c.nombre })))
        )
      }
    ];

    return { title, fields, submitLabel, ...(initialValues ? { initialValues } : {}) };
  }

  private handleFormError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.formVisible = false;
      this.notificationService.showError('Product not found. It may have been deleted.');
      this.loadProducts();
    } else if (error.status === 400 || error.status === 422) {
      const message = error.error?.message || error.error?.error || 'Validation error. Please check your input.';
      this.notificationService.showError(message);
    } else if (error.status === 0) {
      this.notificationService.showError('Network error. Please check your connection.');
    } else {
      this.notificationService.showError('An unexpected error occurred. Please try again.');
    }
  }
}
