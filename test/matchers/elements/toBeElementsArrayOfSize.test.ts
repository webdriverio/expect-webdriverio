import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $$ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected} from '../../__fixtures__/utils.js';
import { toBeElementsArrayOfSize } from '../../../src/matchers/elements/toBeElementsArrayOfSize.js';

vi.mock('@wdio/globals')

describe('toBeElementsArrayOfSize', () => {
    let els: WebdriverIO.ElementArray

    describe('success', () => {
        test('array of size 2', async () => {
            // Create an element array of length 2
            els = await $$('parent');
            const result = await toBeElementsArrayOfSize.call({}, els, 2, {});
            expect(result.pass).toBe(true)
        })
        test('array of size 5', async () => {
            // Create an element array of length 2
            els = await $$('parent');
            // @ts-ignore
            els.parent._length = 5;
            const result = await toBeElementsArrayOfSize.call({}, els, 5, {});
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any;

        beforeEach(async () => {
            // Create an element array of length 2
            els = await $$('parent');
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
            // Create an element array of length 2
            els = await $$('parent');
            let error;
            try {
                // @ts-expect-error param check
                await toBeElementsArrayOfSize.call({}, els, '5')
            } catch (e) {
                error = e;
            }
            expect(error).toEqual(new Error('Invalid params passed to toBeElementsArrayOfSize.'));
        })

        test('works if size contains options', async () => {
            // Create an element array of length 2
            els = await $$('parent');
            const result = await toBeElementsArrayOfSize.call({}, els, {lte: 5});
            expect(result.pass).toBe(true);
        })
    })

    describe('number options', () => {
        describe('lte', () => {
            test('should pass if lte', async () => {
                // Create an element array of length 2
                els = await $$('parent');
                const result = await toBeElementsArrayOfSize.call({}, els, {lte: 10});
                expect(result.pass).toBe(true);
            })

            test('should fail if not lte', async () => {
                // Create an element array of length 2
                els = await $$('parent');
                const result = await toBeElementsArrayOfSize.call({}, els, {lte: 1});
                expect(result.pass).toBe(false);
            })
        })

        describe('gte', () => {
            test('should pass if gte', async () => {
                // Create an element array of length 2
                els = await $$('parent');
                const result = await toBeElementsArrayOfSize.call({}, els, {gte: 1});
                expect(result.pass).toBe(true);
            })

            test('should fail if not gte', async () => {
                // Create an element array of length 2
                els = await $$('parent');
                const result = await toBeElementsArrayOfSize.call({}, els, {gte: 10});
                expect(result.pass).toBe(false);
            })
        })

        describe('gte && lte', () => {
            test('should pass if gte and lte', async () => {
                // Create an element array of length 2
                els = await $$('parent');
                const result = await toBeElementsArrayOfSize.call({}, els, {gte: 1, lte: 10});
                expect(result.pass).toBe(true);
            })

            test('should fail if not gte but is lte', async () => {
                // Create an element array of length 2
                els = await $$('parent');
                const result = await toBeElementsArrayOfSize.call({}, els, {gte: 10, lte: 10});
                expect(result.pass).toBe(false);
            })

            test('should fail if not lte but is gte', async () => {
                // Create an element array of length 2
                els = await $$('parent');
                const result = await toBeElementsArrayOfSize.call({}, els, {gte: 1, lte: 1});
                expect(result.pass).toBe(false);
            })
        })
    })
})
