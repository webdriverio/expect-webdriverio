import {
    waitUntil,
    enhanceError,
    compareText,
    compareTextWithArray,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
} from '../../utils.js'

async function condition(
    el: WebdriverIO.Element,
    label: string | RegExp | Array<string | RegExp>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualLabel = await el.getComputedLabel()
    if (Array.isArray(label)) {
        return compareTextWithArray(actualLabel, label, options)
    }
    return compareText(actualLabel, label, options)
}

export async function toHaveComputedLabel(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    label: string | RegExp | Array<string | RegExp>,
    options: ExpectWebdriverIO.StringOptions = {}
) {
    const isNot = this.isNot
    const { expectation = 'computed label', verb = 'have' } = this

    let el = await received
    let actualLabel

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [label, options])
            el = result.el
            actualLabel = result.values

            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualLabel, label),
        actualLabel,
        this,
        verb,
        expectation,
        '',
        options
    )

    return {
        pass,
        message: (): string => message,
    }
}
