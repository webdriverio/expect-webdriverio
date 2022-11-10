import { getBrowserObject, executeCommandBe } from '../../utils'
import { runExpect, getContext } from '../../util/expectAdapter'

async function toBeSelectedFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'selected'

    const browser = getBrowserObject(received)

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isSelected(), options)
        return result
    })
}

export function toBeSelected(...args: any): any {
    return runExpect.call(this || {}, toBeSelectedFn, args)
}

export function toBeChecked (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions): any {
    const context = getContext(this)
    context.expectation = 'checked'
    return toBeSelected.call(context, el, options)
}
