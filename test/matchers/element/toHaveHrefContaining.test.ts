import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveHrefContaining } from '../../../src/matchers/element/toHaveHrefContaining';

describe('toHaveHrefContaining', () => {
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

    describe('success', () => {
        test('exact passes', async () => {
            const result = await toHaveHrefContaining(el, "https://www.example.com");
            expect(result.pass).toBe(true)
        });

        test('part passes', async () => {
            const result = await toHaveHrefContaining(el, "example");
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveHrefContaining(el, "webdriver");
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute href containing')
            })
            test('expected message', () => {
                const re = /webdriver/i
                expect(getExpected(result.message())).toMatch(re)
            })
            test('received message', () => {
                const re = /https:////www.example.com/i
                expect(getReceived(result.message())).toMatch(re)
            })
        })
    });
    
});