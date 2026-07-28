import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">🏷️ Categorías</h1>
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
    /* No component-specific styles needed — all handled by global styles */
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
