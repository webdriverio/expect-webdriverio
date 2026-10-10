import { vi, expect, describe, it } from 'vitest'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../../src/index.js'
import { multiRemote } from '../../../src/api/index.js'
import { toHaveCookie } from '../../../src/matchers/browser/toHaveCookie.js'
import { browserFactory, browsingContextFactory, multiRemoteBrowserFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

/** A browser, or a browsing context, whose cookies are these name and value pairs */
const withCookies = <T extends WebdriverIO.Browser | WebdriverIO.BrowsingContext>(target: T, cookies: Record<string, string>): T => {
    vi.mocked(target.getCookies).mockImplementation(async (filter?: { name?: string }) =>
        Object.entries(cookies).filter(([name]) => !filter?.name || name === filter.name).map(([name, value]) => ({ name, value })) as never)
    return target
}
const message = (result: { message: () => string }) => stripAnsi(result.message())

describe(toHaveCookie, () => {
    it('reads the cookie by its name', async () => {
        const browser = withCookies(browserFactory(), { lang: 'en' })

        await toHaveCookie.call({}, browser, 'lang', 'en', { wait: 0 })

        expect(browser.getCookies).toHaveBeenCalledWith({ name: 'lang' })
    })

    it('compares the value as a string value, with the string options', async () => {
        const browser = withCookies(browserFactory(), { lang: '  EN  ' })

        expect((await toHaveCookie.call({}, browser, 'lang', 'en', { wait: 0, ignoreCase: true })).pass).toBe(true)
        expect((await toHaveCookie.call({}, browser, 'lang', wdioExpect.oneOf('fr', 'en'), { wait: 0, ignoreCase: true })).pass).toBe(true)
        expect((await toHaveCookie.call({}, browser, 'lang', /^ *EN/, { wait: 0 })).pass).toBe(true)
        expect((await toHaveCookie.call({}, browser, 'lang', 'fr', { wait: 0 })).pass).toBe(false)
    })

    it('with no value, checks that the cookie exists', async () => {
        const browser = withCookies(browserFactory(), { lang: 'en' })

        expect((await toHaveCookie.call({}, browser, 'lang', undefined, { wait: 0 })).pass).toBe(true)
        expect((await toHaveCookie.call({}, browser, 'session', undefined, { wait: 0 })).pass).toBe(false)
        // `.not`: Jest inverts the result later
        expect((await toHaveCookie.call({ isNot: true }, browser, 'session', undefined, { wait: 0 })).pass).toBe(false)
    })

    it('shows a missing cookie as "no cookie", not as null', async () => {
        const browser = withCookies(browserFactory(), {})

        const result = await toHaveCookie.call({}, browser, 'lang', 'en', { wait: 0 })

        expect(message(result)).toEqual(`\
Expect browser to have cookie lang

Expected: "en"
Received: no cookie`)
        // A missing cookie never matches: also not `expect.anything()`, nor a matcher that accepts no value
        expect((await toHaveCookie.call({}, browser, 'lang', wdioExpect.anything(), { wait: 0 })).pass).toBe(false)
        expect((await toHaveCookie.call({}, browser, 'lang', wdioExpect.not.stringContaining('fr'), { wait: 0 })).pass).toBe(false)
        // `.not`: no cookie, or a cookie with another value
        expect((await toHaveCookie.call({ isNot: true }, browser, 'lang', wdioExpect.stringContaining('fr'), { wait: 0 })).pass).toBe(false)
    })

    it('shows the actual value when the cookie has another value', async () => {
        const browser = withCookies(browserFactory(), { lang: 'fr' })

        expect(message(await toHaveCookie.call({}, browser, 'lang', 'en', { wait: 0 }))).toEqual(`\
Expect browser to have cookie lang

Expected: "en"
Received: "fr"`)
    })

    it('gives the hooks the name and the value of the user', async () => {
        const browser = withCookies(browserFactory(), { lang: 'en' })
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        await toHaveCookie.call({}, browser, 'lang', undefined, { wait: 0, beforeAssertion, afterAssertion })

        expect(beforeAssertion).toHaveBeenCalledWith(expect.objectContaining({ matcherName: 'toHaveCookie', expectedValue: ['lang', undefined] }))
        expect(afterAssertion).toHaveBeenCalledWith(expect.objectContaining({ matcherName: 'toHaveCookie', expectedValue: ['lang', undefined] }))
    })

    it('works on a browsing context', async () => {
        const context = withCookies(browsingContextFactory(), { lang: 'en' })

        expect((await toHaveCookie.call({}, context, 'lang', 'en', { wait: 0 })).pass).toBe(true)
        expect(message(await toHaveCookie.call({}, context, 'lang', 'fr', { wait: 0 }))).toContain('to have cookie lang')
    })

    it('works on a multi-remote browser, with one value for all or one per instance', async () => {
        const chrome = withCookies(browserFactory(), { lang: 'en' })
        const firefox = withCookies(browserFactory(), {})
        const browser = multiRemoteBrowserFactory({ chrome, firefox })

        expect((await toHaveCookie.call({}, browser, 'lang', 'en', { wait: 0 })).pass).toBe(false)
        const result = await toHaveCookie.call({}, browser, 'lang', multiRemote({ chrome: 'en', firefox: wdioExpect.anything() }), { wait: 0 })
        expect(result.pass).toBe(false)
        expect(message(result)).toContain('"firefox": no cookie')
    })

    it('waits for the cookie', async () => {
        vi.useFakeTimers()
        const browser = browserFactory()
        vi.mocked(browser.getCookies).mockResolvedValueOnce([] as never).mockResolvedValue([{ name: 'lang', value: 'en' }] as never)

        const assertion = toHaveCookie.call({}, browser, 'lang', 'en', { wait: 500, interval: 100 })
        await vi.advanceTimersByTimeAsync(200)

        expect((await assertion).pass).toBe(true)
        vi.useRealTimers()
    })
})
