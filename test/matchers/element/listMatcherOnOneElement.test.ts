import { afterEach, describe, expect, test, vi } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { expect as wdioExpect } from '../../../src/index.js'
import { jasmine } from '../../__fixtures__/jasmine.js'

vi.mock('@wdio/globals')

/**
 * A list matcher compares the values of the elements of `$$()`. The value of one element is not a list (a string, a size),
 * so a list matcher can never match it: the matcher throws, also with `.not`, which would else always pass.
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
        { matcherName: 'toHaveSize', getter: 'getSize', run: (e: Expectation, m: unknown, o: ExpectWebdriverIO.CommandOptions = { wait: 0 }) => e.toHaveSize(m as never, o) },
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

/** The list of the sizes of `$$()`, as the list of the texts of `toHaveText` */
describe('toHaveSize with a list matcher on $$()', () => {
    const sizes = [{ width: 100, height: 50 }, { width: 150, height: 50 }]
    const elements = async () => {
        const list = await $$('.box')
        list.forEach((element, index) => vi.mocked(element.getSize).mockResolvedValue(sizes[index] as never))
        return list
    }

    test('compares the list of the sizes', async () => {
        await wdioExpect(await elements()).toHaveSize(wdioExpect.arrayContaining([{ width: 100, height: 50 }]), { wait: 0 })
        await wdioExpect(await elements()).toHaveSize(wdioExpect.arrayOf(wdioExpect.objectContaining({ height: 50 })), { wait: 0 })
        await wdioExpect(await elements()).toHaveSize(jasmine.arrayWithExactContents([{ width: 150, height: 50 }, { width: 100, height: 50 }]), { wait: 0 })
        await wdioExpect(await elements()).not.toHaveSize(wdioExpect.arrayContaining([{ width: 1, height: 50 }]), { wait: 0 })
    })

    test('fails when the list does not match, also with .not', async () => {
        await expect(wdioExpect(await elements()).toHaveSize(wdioExpect.arrayContaining([{ width: 1, height: 50 }]), { wait: 0 })).rejects.toThrow('Expect $$(`.box`) to have size')
        await expect(wdioExpect(await elements()).not.toHaveSize(wdioExpect.arrayContaining([{ width: 100, height: 50 }]), { wait: 0 })).rejects.toThrow('Expect $$(`.box`) not to have size')
    })
})

/**
 * A style is read only for the CSS properties that the expected value names: with a list matcher, there is no style of an
 * element to put in the list. `toHaveStyle` throws, also on `$$()` and with `.not`, which would else always pass.
 */
describe('toHaveStyle with a list matcher', () => {
    const error = 'toHaveStyle does not support a list matcher (arrayContaining, arrayWithExactContents or arrayOf): give one style, or an array with one style for each element'
    const listMatchers = [
        { name: 'expect.arrayContaining()', matcher: () => wdioExpect.arrayContaining([{ color: 'red' }]) },
        { name: 'expect.arrayOf()', matcher: () => wdioExpect.arrayOf({ color: 'red' }) },
        { name: 'jasmine.arrayWithExactContents()', matcher: () => jasmine.arrayWithExactContents([{ color: 'red' }]) },
    ]

    test.each(listMatchers)('throws with $name on one element and on a list, also with .not, without reading the style', async ({ matcher }) => {
        const element = await $('p')
        const list = await $$('p')

        await expect(wdioExpect(element).toHaveStyle(matcher() as never, { wait: 0 })).rejects.toThrow(error)
        await expect(wdioExpect(element).not.toHaveStyle(matcher() as never, { wait: 0 })).rejects.toThrow(error)
        await expect(wdioExpect(list).toHaveStyle(matcher() as never, { wait: 0 })).rejects.toThrow(error)
        await expect(wdioExpect(list).not.toHaveStyle(matcher() as never, { wait: 0 })).rejects.toThrow(error)
        expect(element.getCSSProperty).not.toHaveBeenCalled()
        list.forEach((item) => expect(item.getCSSProperty).not.toHaveBeenCalled())
    })

    test('still compares one style for each element of $$()', async () => {
        const list = await $$('p')
        list.forEach((item, index) => vi.mocked(item.getCSSProperty).mockResolvedValue({ property: 'color', value: ['red', 'blue'][index] } as never))

        await wdioExpect(list).toHaveStyle([{ color: 'red' }, { color: 'blue' }], { wait: 0 })
    })
})
