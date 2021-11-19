import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { waitUntil, enhanceError, compareText, compareTextWithArray, executeCommand, wrapExpectedWithArray, updateElementsArray } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function condition(el: WebdriverIO.Element, text: string | Array<string>, options: ExpectWebdriverIO.StringOptions): Promise<any> {
    const actualText = await el.getText()
    if (Array.isArray(text)) {
        return compareTextWithArray(actualText, text, options)
    }
    return compareText(actualText, text, options)
}

export function toHaveTextFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, text: string | Array<string>, options: ExpectWebdriverIO.StringOptions = {}, driver?: WebdriverIO.Browser): any {
    const isNot = this.isNot
    const { expectation = 'text', verb = 'have' } = this

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
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
            message: (): string => message
        }
    })
}

export function toHaveText(...args: any): any {
    return runExpect.call(this, toHaveTextFn, args)
}
