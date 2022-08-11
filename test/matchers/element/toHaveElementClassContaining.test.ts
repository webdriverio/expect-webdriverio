import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveClassContaining, toHaveElementClassContaining } from '../../../src/matchers/element/toHaveClassContaining';

describe('toHaveElementClassContaining', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
        el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
            if(attribute === 'class') {
                return 'some-class another-class'
            }
            return null
        })
    })

    test('success when whole class name is present', async () => {
        const result = await toHaveElementClassContaining(el, "some-class");
        expect(result.pass).toBe(true)
    });

    test('success when part of class name is present', async () => {
        const result = await toHaveElementClassContaining(el, "other");
        expect(result.pass).toBe(true)
    });

    describe('failure when class name is not present', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveElementClassContaining(el, "test");
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute class')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('test')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('some-class another-class')
            })
        })
    });
});

global.console.warn = jest.fn()

describe('toHaveClassContaining', () => {
    let el: WebdriverIO.Element

    test('warning message in console', async () => {
        await toHaveClassContaining(el, "test");
        expect(console.warn).toHaveBeenCalledWith('expect(...).toHaveClassContaining is deprecated and will be removed in next release. Use toHaveElementClassContaining instead.')
    })
})
