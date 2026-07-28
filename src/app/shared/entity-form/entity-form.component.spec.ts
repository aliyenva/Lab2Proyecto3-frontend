import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityFormComponent, EntityFormConfig, FieldConfig } from './entity-form.component';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';

describe('EntityFormComponent', () => {
  let component: EntityFormComponent;
  let fixture: ComponentFixture<EntityFormComponent>;

  const textFieldConfig: FieldConfig = {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    maxLength: 255
  };

  const numberFieldConfig: FieldConfig = {
    name: 'precio',
    label: 'Precio',
    type: 'number',
    required: true,
    min: 0.01,
    max: 999999999.99
  };

  const selectFieldConfig: FieldConfig = {
    name: 'categoria',
    label: 'Categoría',
    type: 'select',
    required: true,
    options$: of([
      { value: 1, label: 'Category A' },
      { value: 2, label: 'Category B' }
    ])
  };

  const basicConfig: EntityFormConfig = {
    title: 'Crear Producto',
    fields: [textFieldConfig, numberFieldConfig, selectFieldConfig],
    submitLabel: 'Guardar'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    component.config = basicConfig;
    component.visible = false;
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.form-overlay');
    expect(overlay).toBeNull();
  });

  it('should render when visible is true', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.form-overlay');
    expect(overlay).not.toBeNull();
  });

  it('should build a FormGroup with fields from config', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    expect(component.form.contains('nombre')).toBeTrue();
    expect(component.form.contains('precio')).toBeTrue();
    expect(component.form.contains('categoria')).toBeTrue();
  });

  it('should patch initial values into the form', () => {
    const configWithInitial: EntityFormConfig = {
      ...basicConfig,
      initialValues: { nombre: 'Test Product', precio: 9.99, categoria: '1' }
    };
    component.config = configWithInitial;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: configWithInitial, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    expect(component.form.get('nombre')?.value).toBe('Test Product');
    expect(component.form.get('precio')?.value).toBe(9.99);
    expect(component.form.get('categoria')?.value).toBe('1');
  });

  it('should emit formSubmit with form values when form is valid', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    component.form.patchValue({ nombre: 'Product', precio: 10, categoria: '1' });

    spyOn(component.formSubmit, 'emit');
    component.onSubmit();

    expect(component.formSubmit.emit).toHaveBeenCalledWith({
      nombre: 'Product',
      precio: 10,
      categoria: '1'
    });
  });

  it('should NOT emit formSubmit when form is invalid', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    // Leave form empty (required fields invalid)
    spyOn(component.formSubmit, 'emit');
    component.onSubmit();

    expect(component.formSubmit.emit).not.toHaveBeenCalled();
  });

  it('should mark all fields as touched when submitting an invalid form', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    component.onSubmit();

    expect(component.form.get('nombre')?.touched).toBeTrue();
    expect(component.form.get('precio')?.touched).toBeTrue();
    expect(component.form.get('categoria')?.touched).toBeTrue();
  });

  it('should emit formCancel when cancel is called', () => {
    spyOn(component.formCancel, 'emit');
    component.onCancel();
    expect(component.formCancel.emit).toHaveBeenCalled();
  });

  it('should disable submit button when form is invalid', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('.btn-submit') as HTMLButtonElement;
    expect(submitBtn.disabled).toBeTrue();
  });

  it('should enable submit button when form is valid', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });

    component.form.patchValue({ nombre: 'Product', precio: 10, categoria: '1' });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('.btn-submit') as HTMLButtonElement;
    expect(submitBtn.disabled).toBeFalse();
  });

  it('should show validation errors for touched invalid fields', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });

    const nombreControl = component.form.get('nombre');
    nombreControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessages = fixture.nativeElement.querySelectorAll('.error-message');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should render text input for text fields', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const textInput = fixture.nativeElement.querySelector('input[type="text"]');
    expect(textInput).not.toBeNull();
  });

  it('should render number input for number fields', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const numberInput = fixture.nativeElement.querySelector('input[type="number"]');
    expect(numberInput).not.toBeNull();
  });

  it('should render select for select fields', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select');
    expect(select).not.toBeNull();
  });

  it('should render select options from options$ observable', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('select option');
    // 1 placeholder + 2 real options
    expect(options.length).toBe(3);
  });

  it('should apply min validator for number fields', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    component.form.get('precio')?.setValue(0);
    expect(component.form.get('precio')?.hasError('min')).toBeTrue();
  });

  it('should apply max validator for number fields', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    component.form.get('precio')?.setValue(9999999999);
    expect(component.form.get('precio')?.hasError('max')).toBeTrue();
  });

  it('should apply custom validators from field config', () => {
    const configWithCustomValidator: EntityFormConfig = {
      title: 'Test',
      fields: [{
        name: 'test',
        label: 'Test',
        type: 'text',
        required: false,
        validators: [Validators.minLength(3)]
      }],
      submitLabel: 'Submit'
    };

    component.config = configWithCustomValidator;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: configWithCustomValidator, previousValue: undefined, firstChange: true, isFirstChange: () => true }
    });

    component.form.get('test')?.setValue('ab');
    expect(component.form.get('test')?.hasError('minlength')).toBeTrue();
  });

  it('should display the config title', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h2');
    expect(title.textContent).toBe('Crear Producto');
  });

  it('should display the submit label on the button', () => {
    component.config = basicConfig;
    component.visible = true;
    component.ngOnChanges({
      config: { currentValue: basicConfig, previousValue: undefined, firstChange: true, isFirstChange: () => true },
      visible: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('.btn-submit');
    expect(submitBtn.textContent.trim()).toBe('Guardar');
  });
});
