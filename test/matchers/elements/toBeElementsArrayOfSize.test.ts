import { getExpectMessage, getReceived } from '../../__fixtures__/utils';
import { toHaveElementClass } from '../../../src/matchers/element/toHaveElementClass';

describe('toBeElementsArrayOfSize', () => {
    let els: WebdriverIO.ElementArray

    beforeEach(async () => { 
        els = [await $('sel1'), await $('sel2'), await $('sel3')]
    })    

    test('wait for success', async () => {
        el._attempts = 2
        el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
            if(el._attempts > 0) {
                el._attempts --;
                return "wrong-class"
            }
            return "correct-class"
        })
        const result = await toHaveElementClass(el, "correct-class", { ignoreCase: true });
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    // test('wait but failure', async () => {
    //     el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
    //         throw new Error('some error');
    //     })
    //     const result = await toHaveAttribute(el, "attribute_name", "Correct Value");
    //     expect(result.pass).toBe(false)
    // })

    // test('success on the first attempt', async () => {
    //     el._attempts = 0
    //     el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
    //         el._attempts ++
    //         return "Correct Value"
    //     })
    //     const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
    //     expect(result.pass).toBe(true)
    //     expect(el._attempts).toBe(1)
    // })

    // test('failure with non-string attribute value as actual', async () => {
    //     el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
    //         return 123
    //     })
    //     const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true });
    //     expect(result.pass).toBe(false)
    // })

    // test('success with non-string attribute value as expected', async () => {
    //     el.getAttribute = jest.fn().mockImplementation((attribute: string) => {
    //         return "Correct Value"
    //     })
    //     const result = await toHaveAttribute(el, "attribute_name", 123, { ignoreCase: true });
    //     expect(result.pass).toBe(true)
    // })

    // test('no wait - failure', async () => {
    //     const el = await $('sel')
    //     el._attempts = 0
    //     let counter = 0;
    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         counter ++;
    //         if(counter == Object.keys(mockStyle).length) {
    //             counter = 0;
    //             el._attempts ++;
    //         }
    //         return { value: "Wrong Value" }
    //     })

    //     const result = await toHaveStyle(el, mockStyle, { wait: 0 })
    //     expect(result.pass).toBe(false)
    //     expect(el._attempts).toBe(1)
    // })

    // test('no wait - success', async () => {
    //     const el = await $('sel')
    //     el._attempts = 0;
    //     let counter = 0;
    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         counter ++;
    //         if(counter == Object.keys(mockStyle).length) {
    //             counter = 0;
    //             el._attempts ++;
    //         }
    //         return { value: mockStyle[property] }
    //     })

    //     const result = await toHaveStyle(el, mockStyle, { wait: 0 })
    //     expect(result.pass).toBe(true)
    //     expect(el._attempts).toBe(1)
    // })

    // test('not - failure', async () => {
    //     const el = await $('sel')
    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         return { value: mockStyle[property] }
    //     })
    //     const result = await toHaveStyle.call({ isNot: true }, el, mockStyle, { wait: 0 })
    //     const received = getReceived(result.message())

    //     expect(received).not.toContain('not')
    //     expect(result.pass).toBe(true)
    // })

    // test('should return false if styles dont match', async () => {
    //     const el = await $('sel')
    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         return { value: mockStyle[property] }
    //     })

    //     const wrongStyle: { [key: string]: string; } = {
    //         "font-family": "Incorrect Font",
    //         "font-size": "100px",
    //         "color": "#fff"
    //     } 

    //     const result = await toHaveStyle.bind({ isNot: true })(el, wrongStyle, { wait: 1 })
    //     expect(result.pass).toBe(false)
    // })

    // test('should return true if styles match', async () => {
    //     const el = await $('sel')
    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         return { value: mockStyle[property] }
    //     })

    //     const result = await toHaveStyle.bind({ isNot: true })(el, mockStyle, { wait: 1 })
    //     expect(result.pass).toBe(true)
    // })

    // test('message shows correctly', async () => {
    //     const el = await $('sel')
    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         return { value: "Wrong Value" }
    //     })
    //     const result = await toHaveStyle(el, 'WebdriverIO')
    //     expect(getExpectMessage(result.message())).toContain('to have style')
    // })

    // test('success if style matches with ignoreCase', async () => {
    //     const el = await $('sel')
    //     el._attempts = 0
    //     let counter = 0;

    //     const actualStyle: { [key: string]: string; } = {
    //         "font-family": "Faktum",
    //         "font-size": "26px",
    //         "color": "#fff"
    //     } 

    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         counter ++;
    //         if(counter == Object.keys(mockStyle).length) {
    //             counter = 0;
    //             el._attempts ++;
    //         }
    //         return { value: actualStyle[property] }
    //     })

    //     const alteredCaseStyle: { [key: string]: string; } = {
    //         "font-family": "FaKtum",
    //         "font-size": "26px",
    //         "color": "#FFF"
    //     } 

    //     const result = await toHaveStyle(el, alteredCaseStyle, { ignoreCase: true })
    //     expect(result.pass).toBe(true)
    //     expect(el._attempts).toBe(1)
    // })
    
    // test('success if style matches with trim', async () => {
    //     const el = await $('sel')
    //     el._attempts = 0
    //     let counter = 0;

    //     const actualStyle: { [key: string]: string; } = {
    //         "font-family": "   Faktum   ",
    //         "font-size": "   26px   ",
    //         "color": "    #fff     "
    //     } 

    //     el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
    //         counter ++;
    //         if(counter == Object.keys(mockStyle).length) {
    //             counter = 0;
    //             el._attempts ++;
    //         }
    //         return { value: actualStyle[property] }
    //     })

    //     const alteredSpaceStyle: { [key: string]: string; } = {
    //         "font-family": "Faktum",
    //         "font-size": "26px",
    //         "color": "#fff"
    //     } 

    //     const result = await toHaveStyle(el, alteredSpaceStyle, {   trim: true })
    //     expect(result.pass).toBe(true)
    //     expect(el._attempts).toBe(1)
    // })
})
