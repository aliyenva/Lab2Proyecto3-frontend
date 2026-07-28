import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { EntityFormComponent, EntityFormConfig } from '../../shared/entity-form/entity-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Categoria, CategoriaPayload } from '../../models/categoria.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, EntityFormComponent, ConfirmDialogComponent],
  template: `
    <div class="categories-page">
      <div class="page-header">
        <h1>Categories</h1>
        @if (isSuperAdmin) {
          <button class="btn btn-primary" (click)="openCreateForm()">Create Category</button>
        }
      </div>

      @if (loading) {
        <div class="loading-indicator">
          <span>Loading categories...</span>
        </div>
      }

      @if (errorMessage) {
        <div class="error-message" role="alert">
          {{ errorMessage }}
        </div>
      }

      @if (!loading && !errorMessage && categories.length === 0) {
        <div class="empty-state">
          <p>No categories available</p>
        </div>
      }

      @if (!loading && !errorMessage && categories.length > 0) {
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              @if (isSuperAdmin) {
                <th>Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (category of categories; track category.id) {
              <tr>
                <td>{{ category.nombre }}</td>
                <td>{{ category.descripcion }}</td>
                @if (isSuperAdmin) {
                  <td class="actions-cell">
                    <button class="btn btn-edit" (click)="openEditForm(category)">Edit</button>
                    <button class="btn btn-delete" (click)="openDeleteDialog(category)">Delete</button>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      }

      <app-entity-form
        [config]="formConfig"
        [visible]="showForm"
        (formSubmit)="onFormSubmit($event)"
        (formCancel)="onFormCancel()"
      ></app-entity-form>

      <app-confirm-dialog
        [entityName]="categoryToDelete?.nombre || ''"
        [visible]="showDeleteDialog"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="onDeleteCancelled()"
      ></app-confirm-dialog>
    </div>
  `,
  styles: [`
    .categories-page {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #1f2937;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-primary {
      background: #4f46e5;
      color: white;
    }

    .btn-primary:hover {
      background: #4338ca;
    }

    .btn-edit {
      background: #f59e0b;
      color: white;
      margin-right: 8px;
    }

    .btn-edit:hover {
      background: #d97706;
    }

    .btn-delete {
      background: #dc2626;
      color: white;
    }

    .btn-delete:hover {
      background: #b91c1c;
    }

    .loading-indicator {
      text-align: center;
      padding: 40px;
      color: #6b7280;
      font-size: 1rem;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #6b7280;
      font-size: 1rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .data-table th {
      background: #f9fafb;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .actions-cell {
      white-space: nowrap;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  categories: Categoria[] = [];
  loading = false;
  errorMessage = '';
  isSuperAdmin = false;

  showForm = false;
  formConfig: EntityFormConfig = this.getCreateFormConfig();
  editingCategory: Categoria | null = null;

  showDeleteDialog = false;
  categoryToDelete: Categoria | null = null;

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.hasRole('SUPER-ADMIN-ROLE');
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.categoriaService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 401) {
          this.errorMessage = 'Could not load categories. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.editingCategory = null;
    this.formConfig = this.getCreateFormConfig();
    this.showForm = true;
  }

  openEditForm(category: Categoria): void {
    this.editingCategory = category;
    this.formConfig = this.getEditFormConfig(category);
    this.showForm = true;
  }

  openDeleteDialog(category: Categoria): void {
    this.categoryToDelete = category;
    this.showDeleteDialog = true;
  }

  onFormSubmit(values: Record<string, any>): void {
    const payload: CategoriaPayload = {
      nombre: values['nombre'],
      descripcion: values['descripcion'] || null
    };

    if (this.editingCategory) {
      this.updateCategory(this.editingCategory.id, payload);
    } else {
      this.createCategory(payload);
    }
  }

  onFormCancel(): void {
    this.showForm = false;
    this.editingCategory = null;
  }

  onDeleteConfirmed(): void {
    if (this.categoryToDelete) {
      this.deleteCategory(this.categoryToDelete.id);
    }
    this.showDeleteDialog = false;
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog = false;
    this.categoryToDelete = null;
  }

  private createCategory(payload: CategoriaPayload): void {
    this.categoriaService.create(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.notificationService.showSuccess('Category created successfully');
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        this.handleFormError(error);
      }
    });
  }

  private updateCategory(id: number, payload: CategoriaPayload): void {
    this.categoriaService.update(id, payload).subscribe({
      next: () => {
        this.showForm = false;
        this.editingCategory = null;
        this.notificationService.showSuccess('Category updated successfully');
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.showForm = false;
          this.editingCategory = null;
          this.notificationService.showError('Category no longer exists');
          this.loadCategories();
        } else {
          this.handleFormError(error);
        }
      }
    });
  }

  private deleteCategory(id: number): void {
    this.categoriaService.delete(id).subscribe({
      next: () => {
        this.categoryToDelete = null;
        this.notificationService.showSuccess('Category deleted successfully');
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        this.categoryToDelete = null;
        if (error.status === 404) {
          this.notificationService.showError('Category no longer exists');
          this.loadCategories();
        } else if (this.hasAssociatedProductsError(error)) {
          this.notificationService.showError('Cannot delete category with assigned products');
        } else if (error.status === 0) {
          this.notificationService.showError('Network error. Please check your connection and try again.');
        } else {
          this.notificationService.showError('An error occurred while deleting the category');
        }
      }
    });
  }

  private handleFormError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.notificationService.showError('Network error. Please check your connection and try again.');
    } else {
      const message = error.error?.message || error.error?.error || 'An error occurred. Please try again.';
      this.notificationService.showError(message);
    }
  }

  private hasAssociatedProductsError(error: HttpErrorResponse): boolean {
    const errorMessage = error.error?.message || error.error?.error || '';
    return error.status === 400 && (
      errorMessage.toLowerCase().includes('product') ||
      errorMessage.toLowerCase().includes('asociad') ||
      errorMessage.toLowerCase().includes('assigned')
    );
  }

  private getCreateFormConfig(): EntityFormConfig {
    return {
      title: 'Create Category',
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 255 },
        { name: 'descripcion', label: 'Descripción', type: 'text', required: false, maxLength: 255 }
      ],
      submitLabel: 'Create'
    };
  }

  private getEditFormConfig(category: Categoria): EntityFormConfig {
    return {
      title: 'Edit Category',
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 255 },
        { name: 'descripcion', label: 'Descripción', type: 'text', required: false, maxLength: 255 }
      ],
      initialValues: {
        nombre: category.nombre,
        descripcion: category.descripcion
      },
      submitLabel: 'Update'
    };
  }
}
