import { executeCommandBe } from '../../utils.js'

export function toBeSelected(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'selected'
    return executeCommandBe.call(this, received, el => el.isSelected(), options)
}

export function toBeChecked (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions): any {
    this.expectation = 'checked'
    return toBeSelected.call(this, el, options)
}
