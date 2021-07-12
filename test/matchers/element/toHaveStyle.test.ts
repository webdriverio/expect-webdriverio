import { getExpectMessage, getReceived } from '../../__fixtures__/utils';
import { toHaveStyle } from '../../../src/matchers/element/toHaveStyle'

describe('toHaveStyle', () => {
    let el: WebdriverIO.Element
    const mockStyle: { [key: string]: string; } = {
        "font-family": "Faktum",
        "font-size": "26px",
        "color": "#000"
    } 

    test('wait for success', async () => {
        el = await $('sel')
        el._attempts = 2
        let counter = 0;
        el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
            if(el._attempts > 0) {
                counter ++;
                if(counter == Object.keys(mockStyle).length) {
                    counter = 0;
                    el._attempts --;
                }
                return {value: "Wrong Value"};
            }
            return { value: mockStyle[property] }
        })
        const result = await toHaveStyle(el, mockStyle, { ignoreCase: true });
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    test('wait but failure', async () => {
        el = await $('sel')
        el._attempts = 0
        let counter = 0
        el.getCSSProperty = jest.fn().mockImplementation(() => {
            counter ++;
            if(counter == Object.keys(mockStyle).length) {
                counter = 0;
                el._attempts ++;
            }
            throw new Error('some error');
        })
        const result = await toHaveStyle(el, mockStyle, { ignoreCase: true });
        expect(result.pass).toBe(false)
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el._attempts = 0
        let counter = 0
        el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
            counter ++;
            if(counter == Object.keys(mockStyle).length) {
                counter = 0;
                el._attempts ++;
            }
            return { value: mockStyle[property] }
        })
        const result = await toHaveStyle(el, mockStyle, { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el._attempts = 0
        let counter = 0;
        el.getCSSProperty = jest.fn().mockImplementation(() => {
            counter ++;
            if(counter == Object.keys(mockStyle).length) {
                counter = 0;
                el._attempts ++;
            }
            return { value: "Wrong Value" }
        })

        const result = await toHaveStyle(el, mockStyle, { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el._attempts = 0;
        let counter = 0;
        el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
            counter ++;
            if(counter == Object.keys(mockStyle).length) {
                counter = 0;
                el._attempts ++;
            }
            return { value: mockStyle[property] }
        })

        const result = await toHaveStyle(el, mockStyle, { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('should return false if styles match and isNot=true', async () => {
        const el = await $('sel')
        el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })
        const result = await toHaveStyle.call({ isNot: true }, el, mockStyle, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(false)
    })

    test('should return true if styles dont match and isNot=true', async () => {
        const el = await $('sel')
        el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })

        const wrongStyle: { [key: string]: string; } = {
            "font-family": "Incorrect Font",
            "font-size": "100px",
            "color": "#fff"
        } 

        const result = await toHaveStyle.bind({ isNot: true })(el, wrongStyle, { wait: 0 })
        expect(result.pass).toBe(true)
    })

    test('message shows correctly', async () => {
        const el = await $('sel')
        el.getCSSProperty = jest.fn().mockImplementation(() => {
            return { value: "Wrong Value" }
        })
        const result = await toHaveStyle(el, 'WebdriverIO')
        expect(getExpectMessage(result.message())).toContain('to have style')
    })

    test('success if style matches with ignoreCase', async () => {
        const el = await $('sel')
        el._attempts = 0
        let counter = 0;

        const actualStyle: { [key: string]: string; } = {
            "font-family": "Faktum",
            "font-size": "26px",
            "color": "#fff"
        } 

        el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
            counter ++;
            if(counter == Object.keys(mockStyle).length) {
                counter = 0;
                el._attempts ++;
            }
            return { value: actualStyle[property] }
        })

        const alteredCaseStyle: { [key: string]: string; } = {
            "font-family": "FaKtum",
            "font-size": "26px",
            "color": "#FFF"
        } 

        const result = await toHaveStyle(el, alteredCaseStyle, { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })
    
    test('success if style matches with trim', async () => {
        const el = await $('sel')
        el._attempts = 0
        let counter = 0;

        const actualStyle: { [key: string]: string; } = {
            "font-family": "   Faktum   ",
            "font-size": "   26px   ",
            "color": "    #fff     "
        } 

        el.getCSSProperty = jest.fn().mockImplementation((property: string) => {
            counter ++;
            if(counter == Object.keys(mockStyle).length) {
                counter = 0;
                el._attempts ++;
            }
            return { value: actualStyle[property] }
        })

        const alteredSpaceStyle: { [key: string]: string; } = {
            "font-family": "Faktum",
            "font-size": "26px",
            "color": "#fff"
        } 

        const result = await toHaveStyle(el, alteredSpaceStyle, {   trim: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })
})
