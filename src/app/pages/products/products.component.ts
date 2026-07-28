import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">🍱 Productos</h1>
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
    /* No component-specific styles needed — all handled by global styles */
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
