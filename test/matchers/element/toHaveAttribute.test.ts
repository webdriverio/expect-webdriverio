import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute';

describe('toHaveAttribute', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
    })

    describe('attribute exists', () => {
        test('success when present', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name");
            expect(result.pass).toBe(true)
        })

        test('success when present with custom driver', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", browser);
            expect(result.pass).toBe(true)
        })

        test('failure when not present', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return null
            })
            const result = await toHaveAttribute(el, "attribute_name");
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            let result: any

            beforeEach(async () => {
                el.getAttribute = jest.fn().mockImplementation(() => {
                    return null
                })
                result = await toHaveAttribute(el, "attribute_name");
            })
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('true')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('false')
            })
        })
    })

    describe('attribute has value', () => {
        test('success with correct value', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
            expect(result.pass).toBe(true)
        })
        test('success with correct value and custom driver', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true }, browser);
            expect(result.pass).toBe(true)
        })
        test('failure with wrong value', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "Wrong Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
            expect(result.pass).toBe(false)
        })
        test('failure with non-string attribute value as actual', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return 123
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
            expect(result.pass).toBe(false)
        })
        test('failure with non-string attribute value as expected', async () => {
            el.getAttribute = jest.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", 123, { ignoreCase: true });
            expect(result.pass).toBe(false)
        })
        describe('message shows correctly', () => {
            let result: any

            beforeEach(async () => {
                el.getAttribute = jest.fn().mockImplementation(() => {
                    return "Wrong"
                })
                result = await toHaveAttribute(el, "attribute_name", "Correct");
            })
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('Correct')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('Wrong')
            })
        })
    })
})
