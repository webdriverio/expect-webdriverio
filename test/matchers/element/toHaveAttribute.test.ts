import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute';

describe('toHaveAttribute', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => { 
        el = await $('sel')
    })    

    describe('attribute exists', () => {
        test('success when present', async () => {
            el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name");
            expect(result.pass).toBe(true)
        })

        test('failure when not present', async () => {
            el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
                return null
            })
            const result = await toHaveAttribute(el, "attribute_name");
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', async () => {
            let result: any

            beforeEach(async () => {
                el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
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
            el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
            expect(result.pass).toBe(true)
        })
        test('failure with wrong value', async () => {
            el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
                return "Wrong Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
            expect(result.pass).toBe(false)
        })
        test('failure with non-string attribute value as actual', async () => {
            el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
                return 123
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
            expect(result.pass).toBe(false)
        })
        test('failure with non-string attribute value as expected', async () => {
            el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", 123, { ignoreCase: true });
            expect(result.pass).toBe(false)
        })
        describe('message shows correctly', async () => {
            let result: any

            beforeEach(async () => {
                el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
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
