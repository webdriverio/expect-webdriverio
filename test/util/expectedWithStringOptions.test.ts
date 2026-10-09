import { describe, expect, test } from 'vitest'
import { StringOptionsMatcher, withStringOptions } from '../../src/util/expectedWithStringOptions.js'
import { expect as wdioExpect } from '../../src/index.js'
import { jasmine } from '../__fixtures__/jasmine.js'
import { OneOfMatcher } from '../../src/matchers/asymmetrics/oneOf.js'

describe(StringOptionsMatcher, () => {
    test('gives the verdict of the matcher and never compares again', () => {
        expect(new StringOptionsMatcher('Foo', {}, true).asymmetricMatch()).toBe(true)
        expect(new StringOptionsMatcher('Foo', {}, false).asymmetricMatch()).toBe(false)
    })

    test.each([
        { sample: 'Foo', options: {}, printed: '"Foo"' },
        { sample: 'a "quoted" text', options: {}, printed: '"a \\"quoted\\" text"' },
        { sample: 'Foo', options: { ignoreCase: true, containing: true }, printed: 'containingIgnoringCase<"Foo">' },
        { sample: /foo/, options: {}, printed: '/foo/' },
        { sample: /foo/g, options: { ignoreCase: true }, printed: '/foo/gi' },
        { sample: /foo/i, options: { ignoreCase: true }, printed: '/foo/i' },
        { sample: /foo/, options: { trim: false, atStart: true }, printed: 'untrimmed</foo/>' },
        { sample: new OneOfMatcher('a', 'b').withOptions({ ignoreCase: true }), options: { ignoreCase: true }, printed: 'ignoringCaseOneOf<"a", "b">' },
        { sample: wdioExpect.stringContaining('Foo'), options: { ignoreCase: true }, printed: 'StringContaining "Foo"' },
        { sample: jasmine.stringMatching(/Foo/), options: {}, printed: '<jasmine.stringMatching(/Foo/)>' },
    ])('prints $sample with $options as $printed', ({ sample, options, printed }) => {
        expect(new StringOptionsMatcher(sample as never, options, true).toAsymmetricMatcher()).toBe(printed)
    })
})

describe(withStringOptions, () => {
    const options = { ignoreCase: true }
    const printed = (value: unknown): unknown => {
        if (value instanceof StringOptionsMatcher) {
            return `${value.toAsymmetricMatcher()}:${value.asymmetricMatch()}`
        }
        if (Array.isArray(value)) {
            return value.map(printed)
        }
        if (typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, printed(item)]))
        }
        return value
    }

    test('wraps one expected value with the verdict of one element or browser', () => {
        expect(printed(withStringOptions('Foo', true, options))).toBe('ignoringCase<"Foo">:true')
    })

    test('wraps each expected value of $$() with the verdict of its element, also the padded ones', () => {
        expect(printed(withStringOptions(['Foo', 'Bar', 'Baz'], [true, false, false], options)))
            .toEqual(['ignoringCase<"Foo">:true', 'ignoringCase<"Bar">:false', 'ignoringCase<"Baz">:false'])
    })

    test('wraps the per-instance values with the verdict of each instance, for $() and $$()', () => {
        expect(printed(withStringOptions({ chrome: 'Foo', firefox: ['Foo', 'Bar'] }, { chrome: true, firefox: [true, false] }, options)))
            .toEqual({ chrome: 'ignoringCase<"Foo">:true', firefox: ['ignoringCase<"Foo">:true', 'ignoringCase<"Bar">:false'] })
    })

    test.each([
        { name: 'no verdict (a structural failure)', expected: 'Foo', verdict: undefined },
        { name: 'a number', expected: 42, verdict: true },
        { name: 'null', expected: null, verdict: false },
        { name: 'a list matcher', expected: wdioExpect.arrayContaining(['Foo']), verdict: true },
        { name: 'expect.arrayOf()', expected: wdioExpect.arrayOf('Foo'), verdict: true },
        { name: 'expect.multiRemote()', expected: wdioExpect.multiRemote({ chrome: 'Foo' }), verdict: true },
        { name: 'an array without a verdict for each element', expected: ['Foo'], verdict: true },
    ])('does not change $name', ({ expected, verdict }) => {
        expect(withStringOptions(expected, verdict, options)).toBe(expected)
    })

    test('does not wrap a value twice', () => {
        const wrapped = withStringOptions('Foo', true, options)

        expect(withStringOptions(wrapped, false, options)).toBe(wrapped)
    })
})
