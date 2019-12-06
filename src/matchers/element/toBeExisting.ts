import { executeCommandBe, runExpect } from '../../utils'

export function toExist(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toExistFn, arguments)
}

export function toExistFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => {
            try {
                return el.isExisting()
            } catch {
                return false
            }
        }, options)
        return result
    })
}

export const toBeExisting = toExist
export const toBePresent = toExist
