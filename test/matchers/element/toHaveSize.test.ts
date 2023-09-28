import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived } from '../../__fixtures__/utils.js'
import { toHaveSize } from '../../../src/matchers/element/toHaveSize.js'

vi.mock('@wdio/globals')

describe('toHaveSize', () => {
    test('wait for success', async () => {
        const el: any = await $('sel')
        el._attempts = 2
        el._size = function () {
            if (this._attempts > 0) {
                this._attempts--
                return null
            }
            return { width: 32, height: 32 }
        }

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, {})
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    test('wait but failure', async () => {
        const el: any = await $('sel')
        el._size = function () {
            throw new Error('some error')
        }

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, {})
        expect(result.pass).toBe(false)
    })

    test('success on the first attempt', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._size = function () {
            this._attempts++
            return { width: 32, height: 32 }
        }

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, {})
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._size = function () {
            this._attempts++
            return { width: 32, height: 32 }
        }

        const result = await toHaveSize.call({}, el, { width: 15, height: 32 }, { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._size = function () {
            this._attempts++
            return { width: 32, height: 32 }
        }

        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el: any = await $('sel')
        el._size = function () {
            return { width: 32, height: 32 }
        }
        const result = await toHaveSize.call({}, el, { width: 32, height: 32 }, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test("should return false if sizes don't match", async () => {
        const el: any = await $('sel')
        el._size = function () {
            return { width: 32, height: 32 }
        }

        const result = await toHaveSize.bind({})(el, { width: 15, height: 32 }, { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if sizes match', async () => {
        const el: any = await $('sel')
        el._size = function () {
            return { width: 32, height: 32 }
        }

        const result = await toHaveSize.bind({})(el, { width: 32, height: 32 }, { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el: any = await $('sel')
        el._size = function () {
            return null
        }
        const result = await toHaveSize.call({}, el, { width: 32, height: 32 })
        expect(getExpectMessage(result.message())).toContain('to have size')
    })
})
