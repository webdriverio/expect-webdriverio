import { $ } from '@wdio/globals'
import { describe, expect, test, vi } from 'vitest'
import type { ChainablePromiseElement } from 'webdriverio'
import { toBeDisplayed, toExist, toHaveText } from '../../src/matchers.js'
import { expect as wdioExpect } from '../../src/index.js'
import { browserFactory, multiRemoteBrowserFactory, StrictSelectorError } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

// WebdriverIO v10: `$()` rejects when the selector matches several elements
const strict$ = (selector: string, matches = 2) => Promise.reject(new StrictSelectorError(selector, matches)) as unknown as ChainablePromiseElement

describe('strict selectors (WebdriverIO v10)', () => {
    const strictError = new StrictSelectorError('li', 2)

    test.for([0, 50])('reports the WebdriverIO error, not a failed assertion, with wait %i', async (wait) => {
        const result = toBeDisplayed.call({}, strict$('li'), { wait, interval: 10 })

        await expect(result).rejects.toThrow(strictError.message)
        await expect(result).rejects.toBeInstanceOf(StrictSelectorError)
    })

    test('does not pass with `.not`', async () => {
        await expect(toExist.call({ isNot: true }, strict$('li'), { wait: 0 })).rejects.toThrow(strictError.message)
    })

    test('toHaveText', async () => {
        await expect(toHaveText.call({}, strict$('li'), 'Coffee', { wait: 0 })).rejects.toThrow(strictError.message)
    })

    test('through expect()', async () => {
        await expect(wdioExpect(strict$('li')).toBeDisplayed({ wait: 0 })).rejects.toThrow(strictError.message)
    })

    test('an element command re-fetching with a strict `$()`', async () => {
        const el = await $('li')
        vi.mocked(el.isDisplayed).mockRejectedValue(strictError)

        await expect(toBeDisplayed.call({}, el, { wait: 0 })).rejects.toThrow(strictError.message)
    })

    test('multi-remote: one instance matching several elements', async () => {
        const firefox = browserFactory()
        vi.mocked(firefox.$).mockImplementation((selector) => strict$(selector as string, 3))
        const multiRemoteBrowser = multiRemoteBrowserFactory({ chrome: browserFactory(), firefox })

        await expect(toBeDisplayed.call({}, multiRemoteBrowser.$('li'), { wait: 0 })).rejects.toThrow(new StrictSelectorError('li', 3).message)
    })
})
