
export interface ValidatorOptions {
    validateImmediately: boolean,
    cssClasses: {
        'errorContainer' : string,
    },
    formFieldsToIgnore: string[],
    validationChecks: string[],
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

export const DEFAULT_OPTIONS : ValidatorOptions = {
    validateImmediately: true,
    cssClasses: {
        errorContainer: 'errors',
    },
    formFieldsToIgnore: [
        'file',
        'reset',
        'submit',
        'button',
    ],
    validationChecks: [
        'valueMissing',
        'badInput',
        'patternMismatch',
        'rangeOverflow',
        'rangeUnderflow',
        'stepMismatch',
        'tooLong',
        'tooShort',
        'typeMismatch',
    ],
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
