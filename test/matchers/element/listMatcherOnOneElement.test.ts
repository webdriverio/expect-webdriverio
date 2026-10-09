import { describe, expect, test, vi } from 'vitest'
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
        { matcherName: 'toHaveText', getter: 'getText', run: (e: Expectation, m: unknown) => e.toHaveText(m as never, { wait: 0 }) },
        { matcherName: 'toHaveHTML', getter: 'getHTML', run: (e: Expectation, m: unknown) => e.toHaveHTML(m as never, { wait: 0 }) },
        { matcherName: 'toHaveAttribute', getter: 'getAttribute', run: (e: Expectation, m: unknown) => e.toHaveAttribute('data-x', m as never, { wait: 0 }) },
        { matcherName: 'toHaveId', getter: 'getAttribute', run: (e: Expectation, m: unknown) => e.toHaveId(m as never, { wait: 0 }) },
        { matcherName: 'toHaveHref', getter: 'getAttribute', run: (e: Expectation, m: unknown) => e.toHaveHref(m as never, { wait: 0 }) },
        { matcherName: 'toHaveLink', getter: 'getAttribute', run: (e: Expectation, m: unknown) => e.toHaveLink(m as never, { wait: 0 }) },
        { matcherName: 'toHaveElementClass', getter: 'getAttribute', run: (e: Expectation, m: unknown) => e.toHaveElementClass(m as never, { wait: 0 }) },
        { matcherName: 'toHaveComputedLabel', getter: 'getComputedLabel', run: (e: Expectation, m: unknown) => e.toHaveComputedLabel(m as never, { wait: 0 }) },
        { matcherName: 'toHaveComputedRole', getter: 'getComputedRole', run: (e: Expectation, m: unknown) => e.toHaveComputedRole(m as never, { wait: 0 }) },
        { matcherName: 'toHaveValue', getter: 'getProperty', run: (e: Expectation, m: unknown) => e.toHaveValue(m as never, { wait: 0 }) },
    ] as const

    describe.each(matchers)('$matcherName', ({ matcherName, getter, run }) => {
        test.each(listMatchers)('throws with $name, also with .not, without reading the value', async ({ matcher }) => {
            const element = await $('#menu')
            const error = `${matcherName} with a list matcher (arrayContaining, arrayWithExactContents or arrayOf) requires an array of elements`

            await expect(run(wdioExpect(element), matcher())).rejects.toThrow(error)
            await expect(run(wdioExpect(element).not, matcher())).rejects.toThrow(error)
            expect(element[getter]).not.toHaveBeenCalled()
        })
    })

    test('toHaveElementProperty still compares a list matcher with a property whose value is an array', async () => {
        const element = await $('#menu')
        vi.mocked(element.getProperty).mockResolvedValue(['Home', 'About'] as never)

        await wdioExpect(element).toHaveElementProperty('labels', wdioExpect.arrayContaining(['Home']), { wait: 0 })
        await expect(wdioExpect(element).not.toHaveElementProperty('labels', wdioExpect.arrayContaining(['Home']), { wait: 0 })).rejects.toThrow()
    })
})
