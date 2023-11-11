import { toHaveComputedRole } from './toHaveComputedRole.js'

export function toHaveComputedRoleContaining(el: WebdriverIO.Element, role: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveComputedRole.call(this, el, role, {
        ...options,
        containing: true
    })
}
