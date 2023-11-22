import { executeCommandBe } from '../../utils.js'

export async function toBeSelected(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'selected'

    await options.beforeAssertion?.({
        matcherName: 'toBeSelected',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el.isSelected(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeSelected',
        options,
        result
    })

    return result
}

export async function toBeChecked (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'checked'

    await options.beforeAssertion?.({
        matcherName: 'toBeChecked',
        options,
    })

    const result = await toBeSelected.call(this, el, options)

    await options.afterAssertion?.({
        matcherName: 'toBeChecked',
        options,
        result
    })

    return result
}
