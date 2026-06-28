import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toBeSelected(
    received: ChainablePromiseElement | WebdriverIO.Element,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'selected'
    const matcherName = this.matcherName || 'toBeSelected'

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isSelected(), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}

export async function toBeChecked (
    received: WebdriverIO.Element,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = 'checked'
    this.matcherName = 'toBeChecked'

    return await toBeSelected.call(this, received, options)
}
