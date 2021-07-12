import { waitUntil, enhanceError, compareNumbers, numberError, executeCommand, wrapExpectedWithArray, updateElementsArray } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function condition(el: WebdriverIO.Element, options: ExpectWebdriverIO.NumberOptions): Promise<any> {
    const children = await el.$$('./*')

    // If no options passed in + children exists
    if(!options.lte && !options.gte && !options.eq) {
        return {
            result: children != null, 
            value: children?.length
        }
    }

    return {
        result: compareNumbers(children?.length, options),
        value: children?.length
    }
}

function toHaveChildrenFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, expected?: number | ExpectWebdriverIO.NumberOptions, options: ExpectWebdriverIO.StringOptions = {}): any {
    const isNot = this.isNot
    const { expectation = 'children', verb = 'have' } = this

    // type check
    let numberOptions: ExpectWebdriverIO.NumberOptions;
    if (typeof expected === 'number') {
        numberOptions = { eq: expected } as ExpectWebdriverIO.NumberOptions
    } else if (typeof expected === 'object') {
        numberOptions = expected
    }

    return browser.call(async () => {
        let el = await received
        let children
        const pass = await waitUntil(async () => {
            const result = await executeCommand.call(this, el, condition, numberOptions, [numberOptions])
            el = result.el
            children = result.values

            return result.success
        }, isNot, {...numberOptions, ...options})

        updateElementsArray(pass, received, el)

        const error = numberError(numberOptions)
        const expected = wrapExpectedWithArray(el, children, error)
        const message = enhanceError(el, expected, children, this, verb, expectation, '', numberOptions)

        return {
            pass,
            message: (): string => message
        }
    })
}

export function toHaveChildren(...args: any): any {
    return runExpect.call(this, toHaveChildrenFn, args)
}
