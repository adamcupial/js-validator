import { ValidatorOptions, DEFAULT_OPTIONS } from 'options';
type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;


interface ValidityStateDux extends ValidityState {
    [key: string] : boolean,
}

interface ValidatorFunction {
    (
        field : FormField,
        form : HTMLFormElement
    ) : string | null;
}


export default class FormValidator {
    private __form : HTMLFormElement;
    private __validators : Map<string, Array<ValidatorFunction>>;
    private __options : ValidatorOptions;

    public constructor(form : HTMLFormElement, options = {}) {
        this.__form = form;
        this.__validators = new Map();
        this.__options = Object.assign({}, DEFAULT_OPTIONS, options) as ValidatorOptions;

        this.__form.setAttribute('novalidate', 'true');

        if (this.__options.validateImmediately) {
            this.__form.addEventListener('blur', (event) => {
                this.__validateField(event.target as FormField);
            }, true);
        }

        this.__form.addEventListener('submit', (event) => {
            const target = event.target as HTMLFormElement;
            const elements = Array.prototype.slice.call(target.elements) as FormField[];
            let allValid = true;
            let firstErrorField = null as FormField | null;

            elements
                .forEach((field) => {
                    const currentValid = this.__validateField(field);
                    allValid = allValid && currentValid;
                    if (!currentValid && firstErrorField === null) {
                        firstErrorField = field;
                    }
                });

            if (!allValid) {
                event.preventDefault();

                if (firstErrorField) {
                    firstErrorField.focus();
                }
            }
        });
    }

    private __validateField(field: FormField) : boolean {
        const errors = this.__getErrors(field);

        field.setCustomValidity(errors.length ? 'errors' : '');

        window.requestAnimationFrame(() => {
            this.__hideErrors(field);
            if (errors.length) {
                this.__showErrors(field, errors);
            }
            this.__form.checkValidity();
        });

        return !errors.length;
    }

    private __hideErrors(field : FormField) : void {
        const next = field.nextElementSibling;
        if (next && next.classList.contains(this.__options.cssClasses.errorContainer)) {
            next.parentNode!.removeChild(next);
        }
    }

    private __showErrors(field : FormField, errors : string[]) : void {
        const errorList = document.createElement('ul');
        errorList.classList.add(this.__options.cssClasses.errorContainer);
        errors.forEach((error) => {
            const li = document.createElement('li');
            li.innerText = error;
            errorList.appendChild(li);
        });
        field.parentNode!.insertBefore(errorList, field.nextSibling);
    }

    private __fillPlaceholder(translation : string, placeholders? : object) : string {
        if (!placeholders) {
            return translation;
        } else {
            return Object
                .entries(placeholders)
                .reduce((previous, [key, value]) : string => {
                    return previous.replace(`$\{${key}}`, value);
                }, translation);
        }
    }

    private __getErrors(field : FormField) : string[] {
        const errors = [] as string[];

        if (field.disabled || this.__options.formFieldsToIgnore.indexOf(field.type) !== -1) {
            return errors;
        } else {
            const validity = field.validity as ValidityStateDux;
            const customValidators = this.__validators.get(field.name) || [];
            const placeholders = {
                value: field.value,
                name: field.name,
                type: field.type,
                pattern: field.getAttribute('pattern') || '',
                max: field.getAttribute('max') || '',
                min: field.getAttribute('min') || '',
                maxLength: field.getAttribute('maxlength') || '',
                minLength: field.getAttribute('minLength') || '',
                title: field.getAttribute('title') || '',
                step: field.getAttribute('step') || '',
            };

            customValidators
                .forEach((func : ValidatorFunction) => {
                    let message = func(field, this.__form);

                    if (message !== null) {
                        message = message || this.__options.translations.defaultError;

                        errors.push(this.__fillPlaceholder(message, placeholders));
                    }
                });

            if (!validity.valid) {
                this.__options.validationChecks
                    .forEach((check : string) => {
                        if (validity[check]) {
                            errors.push(this.__fillPlaceholder(
                                this.__options.translations[check] || this.__options.translations['defaultError'],
                                placeholders
                            ));
                        }
                    });
            }
            return errors;
        }
    }

    public addValidator(name : string, validator : ValidatorFunction) : void {
        if (this.__form.elements.namedItem(name)) {
            const validators = this.__validators.get(name) || [];
            validators.push(validator);
            this.__validators.set(name, validators)
        } else {
            throw new Error(`FieldDoesNotExists : no field named "${name}" in the form.`)
        }
    }
}
