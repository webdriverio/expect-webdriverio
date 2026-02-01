/**
 * Global mocks on root only as vitest support
 * Re-exporting from test folder to benefit from typed mocks
 */
import { browser } from '../../test/__mocks__/@wdio/globals'

export function $(selector: string) {
    return browser.$(selector)
}

export function $$(selector: string) {
    return browser.$$(selector)
}

export { browser }

export default {
    browser,
    $: browser.$,
    $$: browser.$$,
}
