import {
    waitUntil, enhanceError, compareText, compareTextWithArray, executeCommand,
    wrapExpectedWithArray, updateElementsArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, html: string | RegExp | Array<string | RegExp>, options: ExpectWebdriverIO.HTMLOptions) {
    const actualHTML = await el.getHTML(options.includeSelectorTag)
    if (Array.isArray(html)) {
        return compareTextWithArray(actualHTML, html, options)
    }
    return compareText(actualHTML, html, options)
}

export async function toHaveHTML(received: WebdriverIO.Element | WebdriverIO.ElementArray, html: string | RegExp | Array<string | RegExp>, options: ExpectWebdriverIO.HTMLOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'HTML', verb = 'have' } = this

    let el = await received
    let actualHTML

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [html, options])
        el = result.el
        actualHTML = result.values

        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)

    const message = enhanceError(el, wrapExpectedWithArray(el, actualHTML, html), actualHTML, this, verb, expectation, '', options)

    return {
        pass,
        message: (): string => message
    }
}
