import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $$ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected} from '../../__fixtures__/utils.js';
import { toBeElementsArrayOfSize } from '../../../src/matchers/elements/toBeElementsArrayOfSize.js';

const createMockElementArray = (length: number): WebdriverIO.ElementArray => {
    const array = Array.from({ length }, () => ({}));
    const mockArray = {
        selector: 'parent',
        get length() { return array.length; },
        set length(newLength: number) { array.length = newLength; },
        parent: {
            $: vi.fn(),
            $$: vi.fn().mockReturnValue(array),
        },
        foundWith: '$$',
        props: [],
        [Symbol.iterator]: array[Symbol.iterator].bind(array),
        filter: vi.fn().mockReturnThis(),
        map: vi.fn().mockReturnThis(),
        find: vi.fn().mockReturnThis(),
        forEach: vi.fn(),
        some: vi.fn(),
        every: vi.fn(),
        slice: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockReturnThis(),
    };
    return Object.assign(array, mockArray) as unknown as WebdriverIO.ElementArray;
};

vi.mock('@wdio/globals', () => ({
    $$: vi.fn().mockImplementation(() => createMockElementArray(2))
}))

describe('toBeElementsArrayOfSize', () => {
    let els: WebdriverIO.ElementArray

    beforeEach(() => {
        els = $$('parent') as unknown as WebdriverIO.ElementArray;
    })

    describe('success', () => {
        test('array of size 2', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()
            const result = await toBeElementsArrayOfSize.call({}, els, 2, { beforeAssertion, afterAssertion })
            expect(result.pass).toBe(true)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toBeElementsArrayOfSize',
                expectedValue: 2,
                options: { beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toBeElementsArrayOfSize',
                expectedValue: 2,
                options: { beforeAssertion, afterAssertion },
                result
            })
        })
        test('array of size 5', async () => {
            els = createMockElementArray(5);
            const result = await toBeElementsArrayOfSize.call({}, els, 5, {});
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any;

        beforeEach(async () => {
            result = await toBeElementsArrayOfSize.call({}, els, 5, {});
        })

        test('fails', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to be elements array of size')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('5')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('2')
            })
        })
    })

    describe('error catching', () => {
        test('throws error with incorrect size param', async () => {
            await expect(toBeElementsArrayOfSize.call({}, els, '5' as any)).rejects.toThrow('Invalid params passed to toBeElementsArrayOfSize.')
        })

        test('works if size contains options', async () => {
            const result = await toBeElementsArrayOfSize.call({}, els, {lte: 5});
            expect(result.pass).toBe(true);
        })
    })

    describe('number options', () => {
        test.each([
            ['lte', 10, true],
            ['lte', 1, false],
            ['gte', 1, true],
            ['gte', 10, false],
            ['gte and lte', { gte: 1, lte: 10 }, true],
            ['not gte but is lte', { gte: 10, lte: 10 }, false],
            ['not lte but is gte', { gte: 1, lte: 1 }, false],
        ])('should handle %s correctly', async (_, option, expected) => {
            const result = await toBeElementsArrayOfSize.call({}, els, typeof option === 'object' ? option : { [_ as string]: option });
            expect(result.pass).toBe(expected);
        })
    })

    describe('array update', () => {
        test('updates the received array when assertion passes', async () => {
            const receivedArray = createMockElementArray(2);
            (receivedArray.parent as any)._length = 5;
            (receivedArray.parent as any).$$ = vi.fn().mockReturnValue(createMockElementArray(5));
            
            const result = await toBeElementsArrayOfSize.call({}, receivedArray, 5);
            
            expect(result.pass).toBe(true);
            expect(receivedArray.length).toBe(5);
        });

        test('does not update the received array when assertion fails', async () => {
            const receivedArray = createMockElementArray(2);
            
            const result = await toBeElementsArrayOfSize.call({}, receivedArray, 10);
            
            expect(result.pass).toBe(false);
            expect(receivedArray.length).toBe(2);
        });

        test('does not modify non-array received values', async () => {
            const nonArrayEls = {
                selector: 'parent',
                length: 2,
                parent: {
                    $: vi.fn(),
                    $$: vi.fn().mockReturnValue(createMockElementArray(5)),
                },
                foundWith: '$$',
                props: [],
            } as unknown as WebdriverIO.ElementArray;
            
            const result = await toBeElementsArrayOfSize.call({}, nonArrayEls, 5);
            
            expect(result.pass).toBe(true);
            expect(nonArrayEls.length).toBe(2);
        });
    });
})
