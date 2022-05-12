import { executeCommandBe } from '../../utils'

export function toBeSelected(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}): any {
    this.expectation = this.expectation || 'selected'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isSelected(), options)
        return result
    })
}

export function toBeChecked (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions): any {
    this.expectation = 'checked'
    return toBeSelected.call(this, el, options)
}
