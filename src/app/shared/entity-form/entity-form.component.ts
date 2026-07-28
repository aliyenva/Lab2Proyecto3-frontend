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
      background: rgba(107, 74, 122, 0.3);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .form-dialog {
      background: rgba(255, 255, 255, 0.97);
      border-radius: 20px;
      padding: 2rem;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(232, 213, 245, 0.3), 0 2px 8px rgba(255, 183, 197, 0.15);
      border: 2px solid rgba(232, 213, 245, 0.3);
    }

    h2 {
      margin: 0 0 1.25rem 0;
      font-size: 1.3rem;
      font-weight: 800;
      color: #6b4a7a;
      text-align: center;
    }

    .form-field {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 600;
      font-size: 0.875rem;
      color: #6b4a7a;
    }

    input, select {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 2px solid #E8D5F5;
      border-radius: 12px;
      font-size: 0.9rem;
      font-family: 'Nunito', sans-serif;
      box-sizing: border-box;
      background: #FFFEF2;
      color: #5a4a6b;
      transition: all 0.25s ease;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #FFB7C5;
      box-shadow: 0 0 0 3px rgba(255, 183, 197, 0.2);
      background: #fff;
    }

    input::placeholder {
      color: #c4b5d0;
    }

    select {
      cursor: pointer;
    }

    .field-errors {
      margin-top: 0.35rem;
    }

    .error-message {
      display: block;
      color: #d4708a;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn-submit {
      background: linear-gradient(135deg, #B5EAD7 0%, #8fd4b8 100%);
      color: #3a6b55;
      border: none;
      padding: 0.6rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      transition: all 0.25s ease;
      box-shadow: 0 3px 10px rgba(181, 234, 215, 0.3);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 5px 15px rgba(181, 234, 215, 0.4);
    }

    .btn-submit:disabled {
      background: #e0e0e0;
      color: #999;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-cancel {
      background: rgba(232, 213, 245, 0.4);
      color: #6b4a7a;
      border: 2px solid #E8D5F5;
      padding: 0.6rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Nunito', sans-serif;
      transition: all 0.25s ease;
    }

    .btn-cancel:hover {
      background: rgba(232, 213, 245, 0.6);
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
