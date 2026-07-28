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
        <h1>🏷️ Categorías</h1>
        @if (isSuperAdmin) {
          <button class="btn btn-primary" (click)="openCreateForm()">+ Create Category</button>
        }
      </div>

      @if (loading) {
        <div class="loading-indicator">
          <span class="spinner"></span>
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
          <span class="empty-emoji">🏷️</span>
          <p>No categories available yet!</p>
          <p class="empty-sub">Create your first category to get started ✨</p>
        </div>
      }

      @if (!loading && !errorMessage && categories.length > 0) {
        <div class="table-wrapper">
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
        </div>
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

    h1 {
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
      font-weight: 700;
      color: #6b5a4a;
      border-bottom: 2px solid #FFD0B0;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f5eef8;
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
