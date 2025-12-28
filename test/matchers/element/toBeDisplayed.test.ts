import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived } from '../../__fixtures__/utils.js'
import { toBeDisplayed } from '../../../src/matchers/element/toBeDisplayed.js'
import { executeCommandBe } from '../../../src/utils.js'
import { DEFAULT_OPTIONS } from '../../../src/constants.js'

vi.mock('@wdio/globals')
vi.mock('../../../src/utils.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../../../src/utils.js')>()
    return {
        ...actual,
        executeCommandBe: vi.fn(actual.executeCommandBe)
    }
})

describe('toBeDisplayed', () => {
    /**
     * result is inverted for toBeDisplayed because it inverts isEnabled result
     * `!await el.isEnabled()`
     */
    test('wait for success', async () => {
        const el: any = await $('sel')
        el._attempts = 2
        el._value = function (): boolean {
            if (this._attempts > 0) {
                this._attempts--
                return false
            }
            return true
        }

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toBeDisplayed.call({}, el, { beforeAssertion, afterAssertion })

        expect(el.isDisplayed).toHaveBeenCalledWith(
            {
                withinViewport: false,
                contentVisibilityAuto: true,
                opacityProperty: true,
                visibilityProperty: true
            }
        )
        expect(executeCommandBe).toHaveBeenCalledWith(el, expect.anything(), expect.objectContaining({
            wait: DEFAULT_OPTIONS.wait,
            interval: DEFAULT_OPTIONS.interval
        }))
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toBeDisplayed',
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toBeDisplayed',
            options: { beforeAssertion, afterAssertion },
            result
        })
    })

    test('success with ToBeDisplayed and command options', async () => {
        const el: any = await $('sel')
        el._value = function (): boolean {
            return true
        }
        const result = await toBeDisplayed.call({}, el, { wait: 1, withinViewport: true })

        expect(el.isDisplayed).toHaveBeenCalledWith(
            {
                withinViewport: true,
                contentVisibilityAuto: true,
                opacityProperty: true,
                visibilityProperty: true
            }
        )
        expect(executeCommandBe).toHaveBeenCalledWith(el, expect.anything(), expect.objectContaining({
            wait: 1,
            interval: DEFAULT_OPTIONS.interval
        }))
        expect(result.pass).toBe(true)
    })

    test('wait but failure', async () => {
        const el: any = await $('sel')
        el._value = function (): boolean {
            throw new Error('some error')
        }

        await expect(() => toBeDisplayed.call({}, el))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._value = function (): boolean {
            this._attempts++
            return true
        }

        const result = await toBeDisplayed.call({}, el)
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._value = function (): boolean {
            this._attempts++
            return false
        }

        const result = await toBeDisplayed.call({}, el, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._value = function (): boolean {
            this._attempts++
            return true
        }

        const result = await toBeDisplayed.call({}, el, { wait: 0 })

        expect(el.isDisplayed).toHaveBeenCalledWith(
            {
                withinViewport: false,
                contentVisibilityAuto: true,
                opacityProperty: true,
                visibilityProperty: true
            }
        )
        expect(executeCommandBe).toHaveBeenCalledWith(el, expect.anything(), expect.objectContaining({
            wait: 0,
            interval: DEFAULT_OPTIONS.interval
        }))

        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el: any = await $('sel')
        el._value = function (): boolean {
            return true
        }
        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test('not - success', async () => {
        const el: any = await $('sel')
        el._value = function (): boolean {
            return false
        }
        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).toContain('not')
        expect(result.pass).toBe(false)
    })

    test('not - failure (with wait)', async () => {
        const el: any = await $('sel')
        el._value = function (): boolean {
            return true
        }
        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 1 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test('not - success (with wait)', async () => {
        const el: any = await $('sel')
        el._value = function (): boolean {
            return false
        }
        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 1 })
        const received = getReceived(result.message())

        expect(el.isDisplayed).toHaveBeenCalledWith(
            {
                withinViewport: false,
                contentVisibilityAuto: true,
                opacityProperty: true,
                visibilityProperty: true
            }
        )
        expect(executeCommandBe).toHaveBeenCalledWith(el, expect.anything(), expect.objectContaining({
            wait: 1,
            interval: DEFAULT_OPTIONS.interval
        }))
        expect(received).toContain('not')
        expect(result.pass).toBe(false)
    })

    test('message', async () => {
        const el: any = await $('sel')
        el._value = function (): boolean {
            return false
        }
        const result = await toBeDisplayed.call({}, el)
        expect(getExpectMessage(result.message())).toContain('to be displayed')
    })
})
