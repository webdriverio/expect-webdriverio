import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveComputedRole } from '../../../src/matchers/element/toHaveComputedRole.js'

vi.mock('@wdio/globals')

describe('toHaveComputedcomputed role', () => {
    test('wait for success', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('').mockResolvedValueOnce('').mockResolvedValueOnce('WebdriverIO')
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveComputedRole.call({}, el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(3)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveComputedRole',
            expectedValue: 'WebdriverIO',
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveComputedRole',
            expectedValue: 'WebdriverIO',
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el = await $('sel')

        el.getComputedRole = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toHaveComputedRole.call({}, el, 'WebdriverIO', { ignoreCase: true }))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, 'WebdriverIO', { ignoreCase: true })

        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, 'foo', { wait: 0 })

        expect(result.pass).toBe(false)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, 'WebdriverIO', { wait: 0 })

        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('not - failure', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({ isNot: true }, el, 'WebdriverIO', { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test("should return false if computed roles don't match", async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({ isNot: true })(el, 'foobar', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if computed roles match', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({ isNot: true })(el, 'WebdriverIO', { wait: 1 })

        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed role + single replacer matches the expected computed role', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({})(el, 'BrowserdriverIO', {
            replace: ['Web', 'Browser'],
        })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed role + replace (string) matches the expected computed role', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({})(el, 'BrowserdriverIO', {
            replace: [['Web', 'Browser']],
        })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed role + replace (regex) matches the expected computed role', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({})(el, 'BrowserdriverIO', {
            replace: [[/Web/, 'Browser']],
        })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed role starts with expected computed role', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({})(el, 'Webd', { atStart: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed role ends with expected computed role', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({})(el, 'erIO', { atEnd: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed role contains the expected computed role at the given index', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.bind({})(el, 'iver', { atIndex: 5 })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('')

        const result = await toHaveComputedRole.call({}, el, 'WebdriverIO')

        expect(getExpectMessage(result.message())).toContain('to have computed role')
    })

    test('success if array matches with computed role and ignoreCase', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, ['div', 'WebdriverIO'], { ignoreCase: true })

        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with computed role and trim', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('   WebdriverIO   ')

        const result = await toHaveComputedRole.call({}, el, ['div', 'WebdriverIO', 'toto'], {
            trim: true,

        })

        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with computed role and replace (string)', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, ['div', 'BrowserdriverIO', 'toto'], {
            replace: [['Web', 'Browser']],
        })

        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with computed role and replace (regex)', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, ['div', 'BrowserdriverIO', 'toto'], {
            replace: [[/Web/g, 'Browser']],
        })
        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with computed role and multiple replacers and one of the replacers is a function', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, ['div', 'browserdriverio', 'toto'], {
            replace: [
                [/Web/g, 'Browser'],
                [/[A-Z]/g, (match: string) => match.toLowerCase()],
            ],
        })
        expect(result.pass).toBe(true)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    test('failure if array does not match with computed role', async () => {
        const el = await $('sel')
        el.getComputedRole = vi.fn().mockResolvedValueOnce('WebdriverIO')

        const result = await toHaveComputedRole.call({}, el, ['div', 'foo'], { wait: 1 })
        expect(result.pass).toBe(false)
        expect(el.getComputedRole).toHaveBeenCalledTimes(1)
    })

    describe('with RegExp', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            el.getComputedRole = vi.fn().mockResolvedValue('This is example computed role')
        })

        test('success if match', async () => {
            const result = await toHaveComputedRole.call({}, el, /ExAmplE/i)
            expect(result.pass).toBe(true)
        })

        test('success if array matches with RegExp', async () => {
            const result = await toHaveComputedRole.call({}, el, ['div', /ExAmPlE/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with computed role', async () => {
            const result = await toHaveComputedRole.call({}, el, [
                'This is example computed role',
                /Webdriver/i,
            ])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with computed role and ignoreCase', async () => {
            const result = await toHaveComputedRole.call(
                {},
                el,
                ['ThIs Is ExAmPlE computed role', /Webdriver/i],
                {
                    ignoreCase: true,
                }
            )
            expect(result.pass).toBe(true)
        })

        test('failure if no match', async () => {
            const result = await toHaveComputedRole.call({}, el, /Webdriver/i)
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have computed role')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getReceived(result.message())).toContain('This is example computed role')
        })

        test('failure if array does not match with computed role', async () => {
            const result = await toHaveComputedRole.call({}, el, ['div', /Webdriver/i])
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have computed role')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getExpected(result.message())).toContain('div')
        })
    })
})
