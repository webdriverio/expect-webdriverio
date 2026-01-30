import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

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
        const el = await $('sel')
        el.isDisplayed = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

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
        const el = await $('sel')

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
        const el = await $('sel')

        el.isDisplayed = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toBeDisplayed.call({}, el))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')

        const result = await toBeDisplayed.call({}, el)
        expect(result.pass).toBe(true)
        expect(el.isDisplayed).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el.isDisplayed = vi.fn().mockResolvedValue(false)

        const result = await toBeDisplayed.call({}, el, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(el.isDisplayed).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')

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
        expect(el.isDisplayed).toHaveBeenCalledTimes(1)
    })

    test('not - failure - pass must be true', async () => {
        const el = await $('sel')
        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
    })

    test('not - success - pass should be false', async () => {
        const el = await $('sel')

        el.isDisplayed = vi.fn().mockResolvedValue(false)

        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 0 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('not - failure (with wait) - pass should be true', async () => {
        const el = await $('sel')
        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 1 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to be displayed

Expected [not]: "not displayed"
Received      : "displayed"`
        )
    })

    test('not - success (with wait) - pass should be false', async () => {
        const el = await $('sel')

        el.isDisplayed = vi.fn().mockResolvedValue(false)

        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 1 })

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
        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('message', async () => {
        const el = await $('sel')

        el.isDisplayed = vi.fn().mockResolvedValue(false)

        const result = await toBeDisplayed.call({}, el, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) to be displayed

Expected: "displayed"
Received: "not displayed"`
        )
    })
})
