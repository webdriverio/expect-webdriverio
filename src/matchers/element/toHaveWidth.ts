import {
    waitUntil,
    enhanceError,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, width: number): Promise<any> {
    const actualWidth = await el.getSize('width')

    return {
        value: actualWidth,
        result: actualWidth === width,
    }
}

export async function toHaveWidth(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    width: number,
    options: ExpectWebdriverIO.CommandOptions = {}
) {
    const isNot = this.isNot
    const { expectation = 'width', verb = 'have' } = this

    let el = await received
    let actualWidth

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [width, options])

            el = result.el
            actualWidth = result.values

            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualWidth, width),
        actualWidth,
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
