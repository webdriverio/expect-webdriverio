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
            result = await toHaveHref(el, "an href");
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute href')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('an href')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('https://www.example.com')
            })
        })
    });
    
});