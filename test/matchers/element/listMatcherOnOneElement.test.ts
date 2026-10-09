import { afterEach, describe, expect, test, vi } from 'vitest'
import { $ } from '@wdio/globals'
import { expect as wdioExpect } from '../../../src/index.js'
import { jasmine } from '../../__fixtures__/jasmine.js'

vi.mock('@wdio/globals')

/**
 * A list matcher compares the values of the elements of `$$()`. The value of one element is a string, so a list matcher
 * can never match it: the matcher throws, also with `.not`, which would else always pass.
 */
describe('a list matcher on one element', () => {
    const listMatchers = [
        { name: 'expect.arrayContaining()', matcher: () => wdioExpect.arrayContaining(['Home']) },
        { name: 'expect.arrayOf()', matcher: () => wdioExpect.arrayOf(wdioExpect.any(String)) },
        { name: 'jasmine.arrayWithExactContents()', matcher: () => jasmine.arrayWithExactContents(['Home']) },
    ]

    type Expectation = ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.Element>
    const matchers = [
        { matcherName: 'toHaveText', getter: 'getText', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveText(m as never, o) },
        { matcherName: 'toHaveHTML', getter: 'getHTML', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveHTML(m as never, o) },
        { matcherName: 'toHaveAttribute', getter: 'getAttribute', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveAttribute('data-x', m as never, o) },
        { matcherName: 'toHaveId', getter: 'getAttribute', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveId(m as never, o) },
        { matcherName: 'toHaveHref', getter: 'getAttribute', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveHref(m as never, o) },
        { matcherName: 'toHaveLink', getter: 'getAttribute', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveLink(m as never, o) },
        { matcherName: 'toHaveElementClass', getter: 'getAttribute', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveElementClass(m as never, o) },
        { matcherName: 'toHaveComputedLabel', getter: 'getComputedLabel', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveComputedLabel(m as never, o) },
        { matcherName: 'toHaveComputedRole', getter: 'getComputedRole', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveComputedRole(m as never, o) },
        { matcherName: 'toHaveValue', getter: 'getProperty', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveValue(m as never, o) },
    ] as const

    describe.each(matchers)('$matcherName', ({ matcherName, getter, run }) => {
        test.each(listMatchers)('throws with $name, also with .not, without reading the value', async ({ matcher }) => {
            const element = await $('#menu')
            const error = `${matcherName} with a list matcher (arrayContaining, arrayWithExactContents or arrayOf) requires an array of elements`

            await expect(run(wdioExpect(element), matcher())).rejects.toThrow(error)
            await expect(run(wdioExpect(element).not, matcher())).rejects.toThrow(error)
            expect(element[getter]).not.toHaveBeenCalled()
        })

        test('throws at once, without waiting until the end of wait', async () => {
            vi.useFakeTimers()
            const element = await $('#menu')
            const start = Date.now()

            await Promise.all([
                expect(run(wdioExpect(element).not, listMatchers[0].matcher(), { wait: 2000, interval: 100 })).rejects.toThrow(`${matcherName} with a list matcher`),
                vi.runAllTimersAsync(),
            ])
            expect(Date.now()).toBe(start)
        })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    test('toHaveElementProperty still compares a list matcher with a property whose value is an array', async () => {
        const element = await $('#menu')
        vi.mocked(element.getProperty).mockResolvedValue(['Home', 'About'] as never)

        await wdioExpect(element).toHaveElementProperty('labels', wdioExpect.arrayContaining(['Home']), { wait: 0 })
        await expect(wdioExpect(element).not.toHaveElementProperty('labels', wdioExpect.arrayContaining(['Home']), { wait: 0 })).rejects.toThrow()
    })

    test('toHaveElementProperty compares a list matcher with a property that is undefined, and does not throw', async () => {
        const element = await $('#menu')
        vi.mocked(element.getProperty).mockResolvedValue(undefined as never)

        await wdioExpect(element).not.toHaveElementProperty('labels', wdioExpect.arrayContaining(['Home']), { wait: 0 })
        await expect(wdioExpect(element).toHaveElementProperty('labels', wdioExpect.arrayContaining(['Home']), { wait: 0 })).rejects.toThrow('Expect $(`#menu`) to have property labels')
    })
})
