import { waitUntil, enhanceError, compareNumbers, numberError, updateElementsArray } from '../../utils'
import { refetchElements } from '../../util/refetchElements'
import { runExpect } from '../../util/expectAdapter'

function toBeElementsArrayOfSizeFn(received: WebdriverIO.ElementArray, size: number | ExpectWebdriverIO.NumberOptions, options: ExpectWebdriverIO.NumberOptions = {}): any {
    const isNot = this.isNot
    const { expectation = 'elements array of size', verb = 'be' } = this

    // type check
    if (typeof size === 'number') {
        options.eq = size
    } else if (!size || (typeof size.eq !== 'number' && typeof size.gte !== 'number' && typeof size.lte !== 'number')) {
        throw new Error('Invalid params passed to toBeElementsArrayOfSize.')
    } else {
        options = size
    }

    const eq = options.eq
    const gte = options.gte || 1
    const lte = options.lte || 0

    return browser.call(async () => {
        let elements = await received
        const arrLength = elements.length

        const pass = await waitUntil(async () => {
            elements = await refetchElements(elements, options.wait, true)
            return compareNumbers(elements.length, gte, lte, eq)
        }, isNot, options)

        updateElementsArray(pass, received, elements, true)

        const error = numberError(gte, lte, eq)
        const message = enhanceError(elements, error, arrLength, this, verb, expectation, '', options)

        return {
            pass,
            message: (): string => message
        }
    })
}

export function toBeElementsArrayOfSize(...args: any): any {
    return runExpect.call(this, toBeElementsArrayOfSizeFn, args)
}
