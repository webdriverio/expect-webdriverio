import { beforeEach, describe, expect, test, vi } from 'vitest'
import { $ } from '@wdio/globals'
import stripAnsi from 'strip-ansi'
import { oneOf } from '../../src/matchers/asymmetrics/oneOf.js'
import { validateNumberMatcher } from '../../src/util/numberOptionsUtil.js'
import { toHaveWidth } from '../../src/matchers/element/toHaveWidth.js'
import { toHaveSize } from '../../src/matchers/element/toHaveSize.js'
import { toHaveElementProperty } from '../../src/matchers/element/toHaveElementProperty.js'
import { toBeElementsArrayOfSize } from '../../src/matchers/elements/toBeElementsArrayOfSize.js'
import { elementArrayFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

/**
 * `expect.oneOf()` with numbers: one of these values, e.g. a width of 100 (desktop) or 200 (mobile), and nothing between,
 * which a range (`{ gte: 100, lte: 200 }`) cannot say.
 */
describe('expect.oneOf() with numbers', () => {
    test('matches a number of the list, and prints the numbers without quotes', () => {
        const matcher = oneOf(100, 200)

        expect(matcher.asymmetricMatch(200)).toBe(true)
        expect(matcher.asymmetricMatch(150)).toBe(false)
        expect(matcher.asymmetricMatch('200')).toBe(false)
        expect(matcher.toAsymmetricMatcher()).toBe('oneOf<100, 200>')
    })

    test('is a NumberMatcher of the number matchers', () => {
        const matcher = validateNumberMatcher(oneOf(100, 200) as never)

        expect(matcher.asymmetricMatch(100)).toBe(true)
        expect(matcher.asymmetricMatch(150)).toBe(false)
        expect(matcher.toAsymmetricMatcher()).toBe('oneOf<100, 200>')
    })

    test.each([
        { name: 'a string', values: [100, '200'] },
        { name: 'no value', values: [] },
    ])('is an invalid NumberMatcher with $name', ({ values }) => {
        expect(() => validateNumberMatcher(oneOf(...values as never[]) as never)).toThrow('Invalid NumberMatcher')
    })

    describe('in the matchers', () => {
        let el: WebdriverIO.Element

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getSize).mockImplementation(async (property?: string) => (property === 'width' ? 200 : { width: 200, height: 20 }) as never)
            vi.mocked(el.getProperty).mockResolvedValue(2 as never)
        })

        test.each([
            { name: 'toHaveWidth', run: (isNot: boolean, values: number[]) => toHaveWidth.call({ isNot }, el as never, oneOf(...values) as never, { wait: 0 }) },
            { name: 'toHaveSize, on a field', run: (isNot: boolean, values: number[]) => toHaveSize.call({ isNot }, el as never, { width: oneOf(...values), height: 20 } as never, { wait: 0 }) },
            { name: 'toHaveElementProperty, on a number property', run: (isNot: boolean, values: number[]) => toHaveElementProperty.call({ isNot }, el as never, 'count', oneOf(...values.map((value) => value / 100)) as never, { wait: 0 }) },
            { name: 'toBeElementsArrayOfSize', run: (isNot: boolean, values: number[]) => toBeElementsArrayOfSize.call({ isNot }, elementArrayFactory('sel', 2) as never, oneOf(...values.map((value) => value / 100)) as never, { wait: 0 }) },
        ])('$name', async ({ run }) => {
            expect((await run(false, [100, 200])).pass).toBe(true)
            expect((await run(false, [100, 300])).pass).toBe(false)
            expect((await run(true, [100, 200])).pass).toBe(true) // failure, inverted later because of `.not`
        })

        test('shows the numbers in the failure message', async () => {
            const result = await toHaveWidth.call({}, el as never, oneOf(100, 300) as never, { wait: 0 })

            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have width

Expected: oneOf<100, 300>
Received: 200`)
        })
    })
})
