import {
    waitUntil, enhanceError, compareNumbers, numberError, executeCommand,
    wrapExpectedWithArray, updateElementsArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, options: ExpectWebdriverIO.NumberOptions) {
    const children = await el.$$('./*')

    // If no options passed in + children exists
    if (
        typeof options.lte !== 'number' &&
        typeof options.gte !== 'number' &&
        typeof options.eq !== 'number'
    ) {
        return {
            result: children.length > 0,
            value: children?.length
        }
    }

    return {
        result: compareNumbers(children?.length, options),
        value: children?.length
    }
}

export async function toHaveChildren(received: WebdriverIO.Element | WebdriverIO.ElementArray, expected?: number | ExpectWebdriverIO.NumberOptions, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'children', verb = 'have' } = this

    const numberOptions: ExpectWebdriverIO.NumberOptions = typeof expected === 'number'
        ? { eq: expected } as ExpectWebdriverIO.NumberOptions
        : expected || {}

    let el = await received
    let children
    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, numberOptions, [numberOptions])
        el = result.el
        children = result.values

        return result.success
    }, isNot, { ...numberOptions, ...options })

    updateElementsArray(pass, received, el)

    const error = numberError(numberOptions)
    const expectedArray = wrapExpectedWithArray(el, children, error)
    const message = enhanceError(el, expectedArray, children, this, verb, expectation, '', numberOptions)

    return {
        pass,
        message: (): string => message
    }
}
