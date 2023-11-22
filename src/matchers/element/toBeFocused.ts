import { executeCommandBe } from '../../utils.js'

export async function toBeFocused(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'focused'

    await options.beforeAssertion?.({
        matcherName: 'toBeFocused',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el.isFocused(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeFocused',
        options,
        result
    })

    return result
}
