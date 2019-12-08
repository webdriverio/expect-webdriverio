import { executeCommandBe } from '../../utils'
import { runExpect, getContext } from '../../util/expectAdapter'

export function toBeSelected(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toBeSelectedFn, arguments)
}

function toBeSelectedFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'selected'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isSelected(), options)
        return result
    })
}

export function toBeChecked (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions) {
    const context = getContext(this)
    context.expectation = 'checked'
    return toBeSelected.call(context, el, options)
}
