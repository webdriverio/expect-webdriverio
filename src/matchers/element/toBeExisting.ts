import { executeCommandBe } from '../../utils'

export function toExist(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isExisting().catch(() => false), options)
        return result
    })
}

export const toBeExisting = toExist
export const toBePresent = toExist
