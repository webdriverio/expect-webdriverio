import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveAttrContaining } from '../../../src/matchers/element/toHaveAttributeContaining';

describe('toHaveAttributeContaining', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
    })

    test('success when contains', async () => {
        el.getAttribute = jest.fn().mockImplementation(() => {
            return "An example phrase"
        })
        const result = await toHaveAttrContaining(el, "attribute_name", "example");
        expect(result.pass).toBe(true)
    });

    test('success when contains with custom driver', async () => {
        el.getAttribute = jest.fn().mockImplementation(() => {
            return "An example phrase"
        })
        const result = await toHaveAttrContaining(el, "attribute_name", "example", {}, browser);
        expect(result.pass).toBe(true)
    });

    describe('failure when doesnt contain', () => {
        let result: any

        beforeEach(async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "An example phrase"
            })
            result = await toHaveAttrContaining(el, "attribute_name", "donkey");
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('donkey')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('An example phrase')
            })
        })
    });

});
