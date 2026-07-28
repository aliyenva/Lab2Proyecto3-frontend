import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

export function noWhitespaceOnlyValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (control.value && typeof control.value === 'string' && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  };
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  validators?: ValidatorFn[];
  options$?: Observable<{ value: any; label: string }[]>;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface EntityFormConfig {
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  submitLabel: string;
}

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (visible) {
      <div class="form-overlay">
        <div class="form-dialog">
          <h2>{{ config.title }}</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            @for (field of config.fields; track field.name) {
              <div class="form-field">
                <label [for]="field.name">{{ field.label }}</label>

                @if (field.type === 'text') {
                  <input
                    [id]="field.name"
                    type="text"
                    [formControlName]="field.name"
                    [attr.maxlength]="field.maxLength || null"
                  />
                }

                @if (field.type === 'number') {
                  <input
                    [id]="field.name"
                    type="number"
                    [formControlName]="field.name"
                    [attr.min]="field.min !== undefined ? field.min : null"
                    [attr.max]="field.max !== undefined ? field.max : null"
                  />
                }

                @if (field.type === 'select' && field.options$) {
                  <select [id]="field.name" [formControlName]="field.name">
                    <option value="" disabled>-- Seleccione --</option>
                    @for (option of (field.options$ | async) || []; track option.value) {
                      <option [value]="option.value">{{ option.label }}</option>
                    }
                  </select>
                }

                @if (isFieldInvalid(field.name)) {
                  <div class="field-errors">
                    @if (form.get(field.name)?.hasError('required')) {
                      <span class="error-message">{{ field.label }} es requerido</span>
                    }
                    @if (form.get(field.name)?.hasError('maxlength')) {
                      <span class="error-message">Máximo {{ field.maxLength }} caracteres</span>
                    }
                    @if (form.get(field.name)?.hasError('min')) {
                      <span class="error-message">El valor mínimo es {{ field.min }}</span>
                    }
                    @if (form.get(field.name)?.hasError('max')) {
                      <span class="error-message">El valor máximo es {{ field.max }}</span>
                    }
                    @if (form.get(field.name)?.hasError('whitespace')) {
                      <span class="error-message">No se permiten solo espacios en blanco</span>
                    }
                    @if (form.get(field.name)?.hasError('notNumeric')) {
                      <span class="error-message">Se requiere un valor numérico</span>
                    }
                  </div>
                }
              </div>
            }

            <div class="form-actions">
              <button type="submit" [disabled]="form.invalid" class="btn-submit">
                {{ config.submitLabel }}
              </button>
              <button type="button" (click)="onCancel()" class="btn-cancel">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .form-dialog {
      background: white;
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    h2 {
      margin: 0 0 16px 0;
      font-size: 1.25rem;
    }

    .form-field {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      font-size: 0.875rem;
    }

    input, select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.875rem;
      box-sizing: border-box;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }

    .field-errors {
      margin-top: 4px;
    }

    .error-message {
      display: block;
      color: #dc2626;
      font-size: 0.75rem;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .btn-submit {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-submit:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }
  `]
})
export class EntityFormComponent implements OnChanges {
  @Input() config!: EntityFormConfig;
  @Input() visible: boolean = false;
  @Output() formSubmit = new EventEmitter<Record<string, any>>();
  @Output() formCancel = new EventEmitter<void>();

  form: FormGroup = new FormGroup({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildForm();
    }
    if (changes['visible'] && this.visible && this.config) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const controls: Record<string, FormControl> = {};

    for (const field of this.config.fields) {
      const validators: ValidatorFn[] = [];

      if (field.required) {
        validators.push(Validators.required);
        if (field.type === 'text') {
          validators.push(noWhitespaceOnlyValidator());
        }
      }

      if (field.maxLength) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }

      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }

      if (field.validators) {
        validators.push(...field.validators);
      }

      const initialValue = this.config.initialValues?.[field.name] ?? '';
      controls[field.name] = new FormControl(initialValue, validators);
    }

    this.form = new FormGroup(controls);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      this.markAllFieldsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markAllFieldsTouched(): void {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
