import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils';
import { toHaveValue } from '../../../src/matchers/element/toHaveValue'

describe('toHaveValue', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => { 
        el = await $('sel')
        el._value = jest.fn().mockImplementation(() => {
            return "This is an example value"
        })
    })    

    describe('success', () => {
        test('exact passes', async () => {
            const result = await toHaveValue(el, "This is an example value");
            expect(result.pass).toBe(true)
        });
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveValue(el, "webdriver");
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have property value')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('webdriver')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is an example value')
            })
        })
    });
    
});