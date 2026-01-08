import { numberError } from './formatMessage'

export function validateNumberOptions(expectedValue: number | ExpectWebdriverIO.NumberOptions): ExpectWebdriverIO.NumberOptions {
    let numberOptions: ExpectWebdriverIO.NumberOptions
    if (typeof expectedValue === 'number') {
        numberOptions = { eq: expectedValue } satisfies ExpectWebdriverIO.NumberOptions
    } else if (!expectedValue || (typeof expectedValue.eq !== 'number' && typeof expectedValue.gte !== 'number' && typeof expectedValue.lte !== 'number')) {
        throw new Error(`Invalid NumberOptions. Received: ${JSON.stringify(expectedValue)}`)
    } else {
        numberOptions = expectedValue
    }
    return numberOptions
}

export function validateNumberOptionsArray(expectedValues: MaybeArray<number | ExpectWebdriverIO.NumberOptions>) {
    return Array.isArray(expectedValues) ? expectedValues.map(validateNumberOptions) : validateNumberOptions(expectedValues)
}

export function toNumberError(expected: MaybeArray<ExpectWebdriverIO.NumberOptions>) {
    return Array.isArray(expected) ? expected.map(numberError) : numberError(expected)
}
