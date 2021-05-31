import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveHref } from '../../../src/matchers/element/toHaveHref';

describe('toHaveHref', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => { 
        el = await $('sel')
        el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
            if(attribute === 'href') {
                return "https://www.example.com"
            }
            return null
        })
    })    

    test('success when contains', async () => {
        const result = await toHaveHref(el, "https://www.example.com");
        expect(result.pass).toBe(true)
    });

    describe('failure when doesnt contain', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveHref(el, "https://webdriver.io");
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                let re = /https:////webdriver.io/i
                expect(getExpected(result.message())).toMatch(re)
            })
            test('received message', () => {
                let re = /https:////www.example.com/i
                expect(getReceived(result.message())).toMatch(re)
            })
        })
    });
    
});