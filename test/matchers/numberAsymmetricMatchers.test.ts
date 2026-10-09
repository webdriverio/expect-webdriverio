import { beforeEach, describe, expect, test, vi } from 'vitest'
import { $ } from '@wdio/globals'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../src/index.js'
import { multiRemote } from '../../src/api/index.js'
import { toHaveWidth } from '../../src/matchers/element/toHaveWidth.js'
import { toHaveHeight } from '../../src/matchers/element/toHaveHeight.js'
import { toHaveChildren } from '../../src/matchers/element/toHaveChildren.js'
import { toBeElementsArrayOfSize } from '../../src/matchers/elements/toBeElementsArrayOfSize.js'
import { toBeRequestedTimes } from '../../src/matchers/mock/toBeRequestedTimes.js'
import { toHaveSize } from '../../src/matchers/element/toHaveSize.js'
import { chainableElementArrayFactory, elementArrayFactory, setWdioKind } from '../__mocks__/@wdio/globals.js'
import { jasmine } from '../__fixtures__/jasmine.js'

vi.mock('@wdio/globals')

/**
 * An asymmetric matcher in the number matchers, as in `toEqual`, e.g. `expect.closeTo()` for a size that the browser
 * rounds: `toHaveWidth(expect.closeTo(150.2, 0))`.
 */
/** A custom matcher of Jasmine, which compares with the `matchersUtil` that `equals()` gives as the second argument */
const equalsWithMatchersUtil = (expected: number) => ({
    asymmetricMatch: (actual: unknown, matchersUtil: { equals: (a: unknown, b: unknown) => boolean }) => matchersUtil.equals(actual, expected),
})

describe('asymmetric matchers in the number matchers', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
        vi.mocked(el.getSize).mockResolvedValue(150 as never)
        vi.mocked(el.$$).mockReturnValue(chainableElementArrayFactory('./*', 150))
    })

    // Each number matcher, with an actual value of 150
    const matchers = [
        { name: 'toHaveWidth', run: (isNot: boolean, expected: unknown) => toHaveWidth.call({ isNot }, el as never, expected as never, { wait: 0 }) },
        { name: 'toHaveHeight', run: (isNot: boolean, expected: unknown) => toHaveHeight.call({ isNot }, el as never, expected as never, { wait: 0 }) },
        { name: 'toHaveChildren', run: (isNot: boolean, expected: unknown) => toHaveChildren.call({ isNot }, el as never, expected as never, { wait: 0 }) },
        { name: 'toBeElementsArrayOfSize', run: (isNot: boolean, expected: unknown) => toBeElementsArrayOfSize.call({ isNot }, elementArrayFactory('sel', 150) as never, expected as never, { wait: 0 }) },
        { name: 'toBeRequestedTimes', run: (isNot: boolean, expected: unknown) => toBeRequestedTimes.call({ isNot }, setWdioKind({ calls: Array(150).fill({}) }, 'mock') as never, expected as never, { wait: 0 }) },
    ]

    describe.each(matchers)('$name', ({ run }) => {
        test.each([
            { name: 'expect.closeTo() near', expected: () => wdioExpect.closeTo(150.2, 0), pass: true },
            { name: 'expect.closeTo() far', expected: () => wdioExpect.closeTo(152, 0), pass: false },
            { name: 'expect.not.closeTo()', expected: () => wdioExpect.not.closeTo(152, 0), pass: true },
            { name: 'expect.any(Number)', expected: () => wdioExpect.any(Number), pass: true },
            { name: 'jasmine.any(Number)', expected: () => jasmine.any(Number), pass: true },
            { name: 'a custom matcher that uses its matchersUtil', expected: () => equalsWithMatchersUtil(150), pass: true },
        ])('compares with $name', async ({ expected, pass }) => {
            expect((await run(false, expected())).pass).toBe(pass)
            expect((await run(true, expected())).pass).toBe(pass) // inverted later because of `.not`
        })

        // Not a comparison of one number: a wrong use, which throws, also with `.not`
        test('throws on a list matcher', async () => {
            await expect(run(false, wdioExpect.arrayContaining([150]))).rejects.toThrow('Invalid NumberMatcher')
            await expect(run(true, wdioExpect.arrayContaining([150]))).rejects.toThrow('Invalid NumberMatcher')
        })
    })

    test('shows the asymmetric matcher in the failure message', async () => {
        const result = await toHaveWidth.call({}, el as never, wdioExpect.closeTo(152, 0) as never, { wait: 0 })

        expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have width

Expected: NumberCloseTo 152 (0 digits)
Received: 150`)
    })

    test('gives the matchersUtil to a custom matcher in a field of toHaveSize', async () => {
        vi.mocked(el.getSize).mockResolvedValue({ width: 150, height: 50 } as never)

        const result = await toHaveSize.call({}, el as never, { width: equalsWithMatchersUtil(150), height: 50 } as never, { wait: 0 })

        expect(result.pass).toBe(true)
    })

    test('in the values of $$() and of expect.multiRemote()', async () => {
        const elements = elementArrayFactory('sel', 2)
        elements.forEach((element) => vi.mocked(element.getSize).mockResolvedValue(150 as never))

        const result = await toHaveWidth.call({}, elements as never, [wdioExpect.closeTo(150.4, 0), 150] as never, { wait: 0 })
        const perInstance = await toBeRequestedTimes.call({}, setWdioKind({ calls: [{}] }, 'mock') as never, multiRemote({ chrome: wdioExpect.closeTo(1, 0) }) as never, { wait: 0 })

        expect(result.pass).toBe(true)
        // Per-instance values on a single mock stay a failure
        expect(perInstance.pass).toBe(false)
    })
})
