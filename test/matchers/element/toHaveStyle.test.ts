import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'
import { toHaveStyle } from '../../../src/matchers/element/toHaveStyle.js'
import type { ParsedCSSValue } from 'webdriverio'

vi.mock('@wdio/globals')

describe(toHaveStyle, () => {

    let thisContext: { toHaveStyle: typeof toHaveStyle }
    let thisNotContext: { isNot: true; toHaveStyle: typeof toHaveStyle }

    beforeEach(() => {
        thisContext = { toHaveStyle }
        thisNotContext = { isNot: true, toHaveStyle }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        const mockStyle: { [key: string]: string; } = {
            'font-family': 'Faktum',
            'font-size': '26px',
            'color': '#000'
        }

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getCSSProperty).mockImplementation(async (property: string) =>
                ({ value: mockStyle[property], parsed: {} } satisfies ParsedCSSValue)
            )
        })

        test('wait for success', async () => {
            vi.mocked(el.getCSSProperty).mockResolvedValueOnce({ value: 'Wrong Value', parsed: {} })
                .mockImplementation(async (property: string) => {
                    return { value: mockStyle[property], parsed: {} }
                })
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveStyle(el, mockStyle, { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(el.getCSSProperty).toHaveBeenCalledTimes(6)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveStyle',
                expectedValue: mockStyle,
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveStyle',
                expectedValue: mockStyle,
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but failure', async () => {
            vi.mocked(el.getCSSProperty).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveStyle(el, mockStyle, { ignoreCase: true, wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveStyle(el, mockStyle, { wait: 1, ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
        })

        test('no wait - failure', async () => {
            vi.mocked(el.getCSSProperty).mockResolvedValue({ value: 'Wrong Value', parsed: {} })

            const result = await thisContext.toHaveStyle(el, mockStyle, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveStyle(el, mockStyle, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveStyle(el, mockStyle)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have style

Expected [not]: {"color": "#000", "font-family": "Faktum", "font-size": "26px"}
Received      : {"color": "#000", "font-family": "Faktum", "font-size": "26px"}`
            )
        })

        test('not - success - pass should be false', async () => {
            const wrongStyle: { [key: string]: string; } = {
                'font-family': 'Incorrect Font',
                'font-size': '100px',
                'color': '#fff'
            }

            const result = await thisNotContext.toHaveStyle(el, wrongStyle)

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('message shows correctly', async () => {
            vi.mocked(el.getCSSProperty).mockResolvedValue({ value: 'Wrong Value', parsed: {} })

            const result = await thisContext.toHaveStyle(el, 'WebdriverIO' as any)

            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have style

Expected: "WebdriverIO"
Received: {"0": "Wrong Value", "1": "Wrong Value", "10": "Wrong Value", "2": "Wrong Value", "3": "Wrong Value", "4": "Wrong Value", "5": "Wrong Value", "6": "Wrong Value", "7": "Wrong Value", "8": "Wrong Value", "9": "Wrong Value"}`
            )
        })

        test('success if style matches with ignoreCase', async () => {
            const actualStyle: { [key: string]: string; } = {
                'font-family': 'Faktum',
                'font-size': '26px',
                'color': '#fff'
            }

            vi.mocked(el.getCSSProperty).mockImplementation(async (property: string) =>({ value: actualStyle[property], parsed: {} }))

            const alteredCaseStyle: { [key: string]: string; } = {
                'font-family': 'FaKtum',
                'font-size': '26px',
                'color': '#FFF'
            }

            const result = await thisContext.toHaveStyle(el, alteredCaseStyle, { wait: 0, ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
        })

        test('success if style matches with trim', async () => {
            const actualStyle: { [key: string]: string; } = {
                'font-family': '   Faktum   ',
                'font-size': '   26px   ',
                'color': '    #fff     '
            }

            vi.mocked(el.getCSSProperty).mockImplementation(async (property: string) => ({ value: actualStyle[property], parsed: {} }))

            const alteredSpaceStyle: { [key: string]: string; } = {
                'font-family': 'Faktum',
                'font-size': '26px',
                'color': '#fff'
            }

            const result = await thisContext.toHaveStyle(el, alteredSpaceStyle, { wait: 0, trim: true })
            expect(result.pass).toBe(true)
            expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
        })

        test('sucess if style matches with containing', async () => {
            const result = await thisNotContext.toHaveStyle(
                el,
                {
                    'font-family': 'Faktum',
                    'font-size': '26',
                    color: '000',
                },
                { wait: 1, containing: true }
            )
            expect(result.pass).toBe(true)
            expect(el.getCSSProperty).toHaveBeenCalledTimes(3)
        })

        test('sucess if style matches with atStart', async () => {
            const actualStyle: { [key: string]: string } = {
                'font-family': 'Faktum Lorem ipsum dolor sit amet',
                'text-rendering': 'optimizeLegibility',
                'overflow-wrap': 'break-word',
            }
            vi.mocked(el.getCSSProperty).mockImplementation(async (property: string) => ({ value: actualStyle[property], parsed: {} }))

            const result = await thisContext.toHaveStyle(
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
            const actualStyle: { [key: string]: string } = {
                'font-family': 'Faktum Lorem ipsum dolor sit amet',
                'text-rendering': 'optimizeLegibility',
                'overflow-wrap': 'break-word',
            }
            vi.mocked(el.getCSSProperty).mockImplementation(async (property: string) => ({ value: actualStyle[property], parsed: {} }))

            const result = await thisContext.toHaveStyle(
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
            const actualStyle: { [key: string]: string } = {
                'font-family': 'Faktum Lorem ipsum dolor sit amet',
                'text-rendering': 'optimizeLegibility',
                'overflow-wrap': 'break-word',
            }
            vi.mocked(el.getCSSProperty).mockImplementation(async (property: string) => ({ value: actualStyle[property], parsed: {} }))

            const result = await thisContext.toHaveStyle(el,
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
})
