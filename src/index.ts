type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface ValidatorOptions {
    validateImmediately: boolean,
    cssClasses: {
        'errorContainer' : string,
    },
    translations: {
        'defaultError' : string,
        'valueMissing' : string,
        'badInput' : string,
        'patternMismatch' : string,
        'rangeOverflow' : string,
        'rangeUnderflow' : string,
        'stepMismatch' : string,
        'tooLong' : string,
        'tooShort' : string,
        'typeMismatch' : string,
        [key: string] : string,
    },
}

interface ValidityStateDux extends ValidityState {
    [key: string] : boolean,
}

interface ValidatorFunction {
    (
        field : FormField,
        form : HTMLFormElement
    ) : string | null;
}

const DEFAULT_OPTIONS : ValidatorOptions = {
    validateImmediately: true,
    cssClasses: {
        errorContainer: 'errors',
    },
    translations: {
        'defaultError': 'Field is invalid',
        'valueMissing': 'Field cannot be empty',
        'badInput' : 'Value is not a ${type}',
        'patternMismatch' : 'Value does not match a pattern ${title}',
        'rangeOverflow' : 'Value is too big, maximum allowed is ${max}',
        'rangeUnderflow' : 'Value is too small, minimum allowed is ${min}',
        'stepMismatch' : 'Please select proper value',
        'tooLong' : 'Value is too long, maximum allowed is ${maxlength}',
        'tooShort' : 'Value is too short, minimum allowed is ${minLength}',
        'typeMismatch' : 'Bad value for ${type}',
    }
};

const FIELDS_TO_IGNORE = [
    'file',
    'reset',
    'submit',
    'button',
];

const VALIDITY_CHECKS = [
    'valueMissing',
    'badInput',
    'patternMismatch',
    'rangeOverflow',
    'rangeUnderflow',
    'stepMismatch',
    'tooLong',
    'tooShort',
    'typeMismatch',
];


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

        window.requestAnimationFrame(() => {
            this.__hideErrors(field);
            if (errors.length) {
                this.__showErrors(field, errors);
            }
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

        if (field.disabled || FIELDS_TO_IGNORE.indexOf(field.type) !== -1) {
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
                VALIDITY_CHECKS
                    .forEach((check : string) => {
                        if (validity[check]) {
                            errors.push(this.__fillPlaceholder(
                                this.__options.translations[check],
                                placeholders
                            ));
                        }
                    });

                    if (!VALIDITY_CHECKS.some((check => validity[check]))) {
                        errors.push(this.__fillPlaceholder(
                            this.__options.translations.defaultError,
                            placeholders
                        ));
                    }
            }
            return errors;
        }
    }

    private __hasField(name : string) : boolean {
        return Object.keys(this.__form.elements).indexOf(name) !== -1;
    }

    public addValidator(name : string, validator : ValidatorFunction) : void {
        if (this.__hasField(name)) {
            const validators = this.__validators.get(name) || [];
            validators.push(validator);
            this.__validators.set(name, validators)
        } else {
            throw new Error(`FieldDoesNotExists : no field named "${name}" in the form.`)
        }
    }
}
