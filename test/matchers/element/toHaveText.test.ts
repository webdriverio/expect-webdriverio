import { $, $$ } from '@wdio/globals'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveText } from '../../../src/matchers/element/toHaveText.js'
import type { ChainablePromiseArray } from 'webdriverio'

vi.mock('@wdio/globals')

describe('toHaveText', () => {
    describe('when receiving an element array', () => {
        let els: ChainablePromiseArray

        beforeEach(async () => {
            els = await $$('parent')

            const el1: ChainablePromiseElement = await $('sel')
            el1.getText = vi.fn().mockResolvedValue('WebdriverIO')

            const el2: ChainablePromiseElement = await $('dev')
            el2.getText = vi.fn().mockResolvedValue('Get Started')

            els[0] = el1
            els[1] = el2
        })

        test('should return true if the received element array matches the expected text array', async () => {
            const result = await toHaveText.bind({})(els, ['WebdriverIO', 'Get Started'])
            expect(result.pass).toBe(true)
        })

        test('should return true if the received element array matches the expected text array & ignoreCase', async () => {
            const result = await toHaveText.bind({})(els, ['webdriverio', 'get started'], { ignoreCase: true })
            expect(result.pass).toBe(true)
        })

        test('should return false if the received element array does not match the expected text array', async () => {
            const result = await toHaveText.bind({})(els, ['webdriverio', 'get started'])
            expect(result.pass).toBe(false)
        })

        test('should return true if the expected message shows correctly', async () => {
            const result = await toHaveText.bind({})(els, ['webdriverio', 'get started'], { message: 'Test' })
            expect(getExpectMessage(result.message())).toContain('Test')
        })
    })

    test('wait for success', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValueOnce('').mockResolvedValueOnce('').mockResolvedValueOnce('webdriverio')
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveText.call({}, el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(3)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveText',
            expectedValue: 'WebdriverIO',
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveText',
            expectedValue: 'WebdriverIO',
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toHaveText.call({}, el, 'WebdriverIO', { ignoreCase: true }))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({}, el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('webdriverio')

        const result = await toHaveText.call({}, el, 'WebdriverIO', { wait: 0 })

        expect(result.pass).toBe(false)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({}, el, 'WebdriverIO', { wait: 0 })

        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('not - failure - pass should be true', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({ isNot: true }, el, 'WebdriverIO', { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have text

Expected [not]: "WebdriverIO"
Received      : "WebdriverIO"`
        )
    })

    test('not - success - pass should be false', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({ isNot: true }, el, 'not WebdriverIO', { wait: 0 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('not with no trim - failure - pass should be true', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue(' WebdriverIO ')

        const result = await toHaveText.call({ isNot: true }, el, ' WebdriverIO ', { trim: false, wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have text

Expected [not]: " WebdriverIO "
Received      : " WebdriverIO "`
        )
    })

    test('not - success - pass should be false', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({ isNot: true }, el, 'not WebdriverIO', { wait: 0 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('should return true if texts match', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, 'WebdriverIO', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual text + single replacer matches the expected text', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, 'BrowserdriverIO', { replace: ['Web', 'Browser'] })

        expect(result.pass).toBe(true)
    })

    test('should return true if actual text + replace (string) matches the expected text', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, 'BrowserdriverIO', { replace: [['Web', 'Browser']] })

        expect(result.pass).toBe(true)
    })

    test('should return true if actual text + replace (regex) matches the expected text', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, 'BrowserdriverIO', { replace: [[/Web/, 'Browser']] })

        expect(result.pass).toBe(true)
    })

    test('should return true if actual text starts with expected text', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, 'Web', { atStart: true })

        expect(result.pass).toBe(true)
    })

    test('should return true if actual text ends with expected text', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, 'IO', { atEnd: true })

        expect(result.pass).toBe(true)
    })

    test('should return true if actual text contains the expected text at the given index', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, 'iverIO', { atIndex: 5 })

        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('')

        const result = await toHaveText.call({}, el, 'WebdriverIO')

        expect(getExpectMessage(result.message())).toContain('to have text')
    })

    test('success if array matches with text and ignoreCase', async () => {
        const el = await $('sel')

        el.getText = vi.fn().mockResolvedValue('webdriverio')

        const result = await toHaveText.call({}, el, ['WDIO', 'Webdriverio'], { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with text and trim', async () => {
        const el = await $('sel')

        el.getText = vi.fn().mockResolvedValue('   WebdriverIO   ')

        const result = await toHaveText.call({}, el, ['WDIO', 'WebdriverIO', 'toto'], { trim: true })

        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with text and replace (string)', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({}, el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [['Web', 'Browser']] })

        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with text and replace (regex)', async () => {
        const el = await $('sel')

        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({}, el, ['WDIO', 'BrowserdriverIO', 'toto'], { replace: [[/Web/g, 'Browser']] })

        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with text and multiple replacers and one of the replacers is a function', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.call({}, el, ['WDIO', 'browserdriverio', 'toto'], {
            replace: [
                [/Web/g, 'Browser'],
                [/[A-Z]/g, (match: string) => match.toLowerCase()],
            ],
        })

        expect(result.pass).toBe(true)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('failure if array does not match with text', async () => {
        const el = await $('sel')

        el.getText = vi.fn().mockResolvedValue('WebdriverIO')
        const result = await toHaveText.call({}, el, ['WDIO', 'Webdriverio'], { wait: 1 })

        expect(result.pass).toBe(false)
        expect(el.getText).toHaveBeenCalledTimes(1)
    })

    test('should return true if actual text contains the expected text', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, expect.stringContaining('iverIO'), {})

        expect(result.pass).toBe(true)
    })

    test('should return false if actual text does not contain the expected text', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, expect.stringContaining('WDIO'), {})

        expect(result.pass).toBe(false)
    })

    test('should return true if actual text contains one of the expected texts', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, [expect.stringContaining('iverIO'), expect.stringContaining('WDIO')], {})

        expect(result.pass).toBe(true)
    })

    test('should return false if actual text does not contain the expected texts', async () => {
        const el = await $('sel')
        el.getText = vi.fn().mockResolvedValue('WebdriverIO')

        const result = await toHaveText.bind({})(el, [expect.stringContaining('EXAMPLE'), expect.stringContaining('WDIO')], {})

        expect(result.pass).toBe(false)
    })

    describe('with RegExp', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            el.getText = vi.fn().mockResolvedValue('This is example text')
        })

        test('success if match', async () => {
            const result = await toHaveText.call({}, el, /ExAmplE/i)

            expect(result.pass).toBe(true)
        })

        test('success if array matches with RegExp', async () => {
            const result = await toHaveText.call({}, el, ['WDIO', /ExAmPlE/i])

            expect(result.pass).toBe(true)
        })

        test('success if array matches with text', async () => {
            const result = await toHaveText.call({}, el, ['This is example text', /Webdriver/i])

            expect(result.pass).toBe(true)
        })

        test('success if array matches with text and ignoreCase', async () => {
            const result = await toHaveText.call({}, el, ['ThIs Is ExAmPlE tExT', /Webdriver/i], {
                ignoreCase: true,
            })

            expect(result.pass).toBe(true)
        })

        test('failure if no match', async () => {
            const result = await toHaveText.call({}, el, /Webdriver/i)

            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have text')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getReceived(result.message())).toContain('This is example text')
        })

        test('failure if array does not match with text', async () => {
            const result = await toHaveText.call({}, el, ['WDIO', /Webdriver/i])

            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have text')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getExpected(result.message())).toContain('WDIO')
        })
    })
})
