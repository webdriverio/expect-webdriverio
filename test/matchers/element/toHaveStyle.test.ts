import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveStyle } from '../../../src/matchers/element/toHaveStyle.js'

vi.mock('@wdio/globals')

describe('toHaveStyle', () => {
    let el: ChainablePromiseElement
    const mockStyle: { [key: string]: string; } = {
        'font-family': 'Faktum',
        'font-size': '26px',
        'color': '#000'
    }

    test('wait for success', async () => {
        el = await $('sel')
        el.getCSSProperty = vi.fn().mockResolvedValueOnce({ value: 'Wrong Value' })
            .mockResolvedValueOnce({ value: 'Wrong Value' })
            .mockImplementation((property: string) => {
                return { value: mockStyle[property] }
            })
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveStyle.call({}, el, mockStyle, { ignoreCase: true, beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(6)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveStyle',
            expectedValue: mockStyle,
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveStyle',
            expectedValue: mockStyle,
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        el = await $('sel')
        el.getCSSProperty = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toHaveStyle.call({}, el, mockStyle, { ignoreCase: true }))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })

        const result = await toHaveStyle.call({}, el, mockStyle, { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockResolvedValue({ value: 'Wrong Value' })

        const result = await toHaveStyle.call({}, el, mockStyle, { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })

        const result = await toHaveStyle.call({}, el, mockStyle, { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('not - failure - pass should be true', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })
        const result = await toHaveStyle.call({ isNot: true }, el, mockStyle, { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have style

Expected [not]: {"color": "#000", "font-family": "Faktum", "font-size": "26px"}
Received      : {"color": "#000", "font-family": "Faktum", "font-size": "26px"}`
        )
    })

    test('not - success - pass should be false', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })
        const wrongStyle: { [key: string]: string; } = {
            'font-family': 'Incorrect Font',
            'font-size': '100px',
            'color': '#fff'
        }

        const result = await toHaveStyle.bind({ isNot: true })(el, wrongStyle, { wait: 1 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('should return false if styles dont match', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })

        const wrongStyle: { [key: string]: string; } = {
            'font-family': 'Incorrect Font',
            'font-size': '100px',
            'color': '#fff'
        }

        const result = await toHaveStyle.bind({ })(el, wrongStyle, { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if styles match', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })

        const result = await toHaveStyle.bind({})(el, mockStyle, { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('message shows correctly', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockResolvedValue({ value: 'Wrong Value' })

        const result = await toHaveStyle.call({}, el, 'WebdriverIO' as any)

        expect(result.pass).toBe(false)
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have style

Expected: "WebdriverIO"
Received: {"0": "Wrong Value", "1": "Wrong Value", "10": "Wrong Value", "2": "Wrong Value", "3": "Wrong Value", "4": "Wrong Value", "5": "Wrong Value", "6": "Wrong Value", "7": "Wrong Value", "8": "Wrong Value", "9": "Wrong Value"}`
        )

    })

    test('success if style matches with ignoreCase', async () => {
        const el = await $('sel')

        const actualStyle: { [key: string]: string; } = {
            'font-family': 'Faktum',
            'font-size': '26px',
            'color': '#fff'
        }

        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: actualStyle[property] }
        })

        const alteredCaseStyle: { [key: string]: string; } = {
            'font-family': 'FaKtum',
            'font-size': '26px',
            'color': '#FFF'
        }

        const result = await toHaveStyle.call({}, el, alteredCaseStyle, { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('success if style matches with trim', async () => {
        const el = await $('sel')

        const actualStyle: { [key: string]: string; } = {
            'font-family': '   Faktum   ',
            'font-size': '   26px   ',
            'color': '    #fff     '
        }

        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: actualStyle[property] }
        })

        const alteredSpaceStyle: { [key: string]: string; } = {
            'font-family': 'Faktum',
            'font-size': '26px',
            'color': '#fff'
        }

        const result = await toHaveStyle.call({}, el, alteredSpaceStyle, {   trim: true })
        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('sucess if style matches with containing', async () => {
        const el = await $('sel')
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: mockStyle[property] }
        })

        const result = await toHaveStyle.call(
            {},
            el,
            {
                'font-family': 'Faktum',
                'font-size': '26',
                color: '000',
            },
            { containing: true }
        )
        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('sucess if style matches with atStart', async () => {
        const el = await $('sel')

        const actualStyle: { [key: string]: string } = {
            'font-family': 'Faktum Lorem ipsum dolor sit amet',
            'text-rendering': 'optimizeLegibility',
            'overflow-wrap': 'break-word',
        }
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: actualStyle[property] }
        })

        const result = await toHaveStyle.call(
            {},
            el,
            {
                'font-family': 'Faktum',
                'text-rendering': 'optimize',
                'overflow-wrap': 'break',
            },
            { atStart: true }
        )
        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('sucess if style matches with atEnd', async () => {
        const el = await $('sel')
        const actualStyle: { [key: string]: string } = {
            'font-family': 'Faktum Lorem ipsum dolor sit amet',
            'text-rendering': 'optimizeLegibility',
            'overflow-wrap': 'break-word',
        }
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: actualStyle[property] }
        })

        const result = await toHaveStyle.call(
            {},
            el,
            {
                'font-family': 'sit amet',
                'text-rendering': 'Legibility',
                'overflow-wrap': '-word',
            },
            { atEnd: true }
        )
        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

    test('sucess if style matches with atIndex', async () => {
        const el = await $('sel')
        const actualStyle: { [key: string]: string } = {
            'font-family': 'Faktum Lorem ipsum dolor sit amet',
            'text-rendering': 'optimizeLegibility',
            'overflow-wrap': 'break-word',
        }
        el.getCSSProperty = vi.fn().mockImplementation((property: string) => {
            return { value: actualStyle[property] }
        })

        const result = await toHaveStyle.call({}, el,
            {
                'font-family': 'tum Lorem ipsum dolor sit amet',
                'text-rendering': 'imizeLegibility',
                'overflow-wrap': 'ak-word',
            },
            { atIndex: 3 })

        expect(result.pass).toBe(true)
        expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
    })

})
