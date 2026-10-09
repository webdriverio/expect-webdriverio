import { describe, expect, test } from 'vitest'
import { isTrimmedByOptions, stringOptionsName } from '../../src/util/stringOptionsName.js'

describe(stringOptionsName, () => {
    test.each([
        { options: {}, name: '' },
        { options: { trim: true, ignoreCase: false, containing: false, atStart: false, atEnd: false, asString: true }, name: '' },
        { options: { containing: true }, name: 'containing' },
        { options: { atStart: true }, name: 'startingWith' },
        { options: { atEnd: true }, name: 'endingWith' },
        { options: { atIndex: 0 }, name: 'matchingAtIndex<0>' },
        // Only one position applies, in the order of `compareText`
        { options: { containing: true, atStart: true }, name: 'containing' },
        { options: { trim: false }, name: '' },
        { options: { ignoreCase: true }, name: 'ignoringCase' },
        { options: { replace: ['a', 'b'] as [string, string] }, name: 'replacing' },
        { options: { replace: [['a', 'b'], [/c/, () => 'd']] as Array<[string | RegExp, string | Function]> }, name: 'replacing' },
        { options: { replace: [] as unknown as [string, string] }, name: '' },
        { options: { containing: true, ignoreCase: true }, name: 'containingIgnoringCase' },
        { options: { atIndex: 2, ignoreCase: true }, name: 'matchingAtIndex<2>IgnoringCase' },
        { options: { ignoreCase: true, replace: ['a', 'b'] as [string, string] }, name: 'ignoringCaseReplacing' },
    ])('names $options as "$name"', ({ options, name }) => {
        expect(stringOptionsName(options)).toBe(name)
    })

    test.each([
        { options: {}, name: 'trimmed' },
        { options: { trim: false }, name: '' },
        { options: { containing: true, ignoreCase: true }, name: 'containingTrimmedIgnoringCase' },
        { options: { atStart: true, replace: ['a', 'b'] as [string, string] }, name: 'startingWithTrimmedReplacing' },
    ])('names trimmed when the default trim changed the actual value: $options as "$name"', ({ options, name }) => {
        expect(stringOptionsName(options, { trimmed: true })).toBe(name)
    })

    test.each([
        { options: { containing: true, atIndex: 1 }, trimmed: false, name: '' },
        { options: { ignoreCase: true }, trimmed: false, name: '' },
        { options: { ignoreCase: true }, trimmed: true, name: 'trimmed' },
        { options: { trim: false, ignoreCase: true }, trimmed: true, name: '' },
        { options: { containing: true, replace: ['a', 'b'] as [string, string] }, trimmed: false, name: 'replacing' },
    ])('names only the modifiers that apply to a RegExp: $options, trimmed $trimmed, as "$name"', ({ options, trimmed, name }) => {
        expect(stringOptionsName(options, { forRegExp: true, trimmed })).toBe(name)
    })

    test.each([
        { actual: '  foo  ', options: {}, trimmed: true },
        { actual: 'foo', options: {}, trimmed: false },
        { actual: '  foo  ', options: { trim: false }, trimmed: false },
        { actual: 42, options: {}, trimmed: false },
        { actual: undefined, options: {}, trimmed: false },
    ])('knows if the default trim changes $actual with $options: $trimmed', ({ actual, options, trimmed }) => {
        expect(isTrimmedByOptions(actual, options)).toBe(trimmed)
    })
})
