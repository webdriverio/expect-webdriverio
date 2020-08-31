import { waitUntil, enhanceError, compareNumbers, numberError, executeCommand, wrapExpectedWithArray, updateElementsArray } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function condition(el: WebdriverIO.Element, gte: number, lte: number, eq?: number): Promise<any> {
    const children = await el.$$('./*')
    return {
        result: compareNumbers(children.length, gte, lte, eq),
        value: children.length
    }
}

function toHaveChildrenFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, size?: number | ExpectWebdriverIO.NumberOptions, options: ExpectWebdriverIO.NumberOptions = {}): any {
    const isNot = this.isNot
    const { expectation = 'children', verb = 'have' } = this

    // type check
    if (typeof size === 'number') {
        options.eq = size
    } else if (typeof size === 'object') {
        options = { ...options, ...size }
    }

    const eq = options.eq
    const gte = options.gte || 1
    const lte = options.lte || 0

    return browser.call(async () => {
        let el = await received
        let children
        const pass = await waitUntil(async () => {
            const result = await executeCommand.call(this, el, condition, options, [gte, lte, eq])
            el = result.el
            children = result.values

            return result.success
        }, isNot, options)

        updateElementsArray(pass, received, el)

        const error = numberError(gte, lte, eq)
        const expected = wrapExpectedWithArray(el, children, error)
        const message = enhanceError(el, expected, children, this, verb, expectation, '', options)

        return {
            pass,
            message: (): string => message
        }
    })
}

export function toHaveChildren(...args: any): any {
    return runExpect.call(this, toHaveChildrenFn, args)
}
