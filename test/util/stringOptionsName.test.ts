import { describe, expect, test } from 'vitest'
import { stringOptionsName } from '../../src/util/stringOptionsName.js'

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
        { options: { trim: false }, name: 'untrimmed' },
        { options: { ignoreCase: true }, name: 'ignoringCase' },
        { options: { replace: ['a', 'b'] as [string, string] }, name: 'replacing' },
        { options: { replace: [['a', 'b'], [/c/, () => 'd']] as Array<[string | RegExp, string | Function]> }, name: 'replacing' },
        { options: { replace: [] as unknown as [string, string] }, name: '' },
        { options: { containing: true, ignoreCase: true }, name: 'containingIgnoringCase' },
        { options: { atStart: true, trim: false }, name: 'startingWithUntrimmed' },
        { options: { atIndex: 2, ignoreCase: true }, name: 'matchingAtIndex<2>IgnoringCase' },
        { options: { ignoreCase: true, replace: ['a', 'b'] as [string, string] }, name: 'ignoringCaseReplacing' },
    ])('names $options as "$name"', ({ options, name }) => {
        expect(stringOptionsName(options)).toBe(name)
    })

    test.each([
        { options: { containing: true, atIndex: 1 }, name: '' },
        { options: { ignoreCase: true }, name: '' },
        { options: { trim: false, ignoreCase: true }, name: 'untrimmed' },
        { options: { containing: true, replace: ['a', 'b'] as [string, string] }, name: 'replacing' },
    ])('names only the modifiers that apply to a RegExp: $options as "$name"', ({ options, name }) => {
        expect(stringOptionsName(options, { forRegExp: true })).toBe(name)
    })
})
