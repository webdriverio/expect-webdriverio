import { waitUntil, enhanceError, compareText, executeCommand, wrapExpectedWithArray, updateElementsArray } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toHaveText(received: WebdriverIO.Element | WebdriverIO.ElementArray, text: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveTextFn, arguments)
}

export function toHaveTextFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, text: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'text', verb = 'have' } = this

    return browser.call(async () => {
        let el = await received
        let actualText

        const pass = await waitUntil(async () => {
            const result = await executeCommand.call(this, el, condition, options, [text, options])
            el = result.el
            actualText = result.values

            return result.success
        }, isNot, options)

        updateElementsArray(pass, received, el)

        const message = enhanceError(el, wrapExpectedWithArray(el, actualText, text), actualText, this, verb, expectation, '', options)

        return {
            pass,
            message: () => message
        }
    })
}

async function condition(el: WebdriverIO.Element, text: string, options: ExpectWebdriverIO.StringOptions) {
    let actualText = await el.getText()

    return compareText(actualText, text, options)
}
