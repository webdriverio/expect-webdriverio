import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived } from '../../__fixtures__/utils.js'
import { toHaveHeight } from '../../../src/matchers/element/toHaveHeight.js'

vi.mock('@wdio/globals')

describe('toHaveHeight', () => {
    test('wait for success', async () => {
        const el: any = await $('sel')
        el._attempts = 2
        el._size = function (property?: 'width' | 'height') {
            if (this._attempts > 0) {
                this._attempts--
                return null
            }
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const result = await toHaveHeight.call({}, el, 32, { beforeAssertion, afterAssertion })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveHeight',
            expectedValue: 32,
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveHeight',
            expectedValue: 32,
            options: { beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el: any = await $('sel')
        el._size = function () {
            throw new Error('some error')
        }

        await expect(() => toHaveHeight.call({}, el, 10, {}))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._size = function (property?: 'width' | 'height') {
            this._attempts++
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }

        const result = await toHaveHeight.call({}, el, 32, {})
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._size = function (property?: 'width' | 'height') {
            this._attempts++
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }

        const result = await toHaveHeight.call({}, el, 10, { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._size = function (property?: 'width' | 'height') {
            this._attempts++
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }

        const result = await toHaveHeight.call({}, el, 32, { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('gte and lte', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._size = function (property?: 'width' | 'height') {
            this._attempts++
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }

        const result = await toHaveHeight.call({}, el, { gte: 31, lte: 33 }, { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el: any = await $('sel')
        el._size = function (property?: 'width' | 'height') {
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }
        const result = await toHaveHeight.call({}, el, 32, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test("should return false if sizes don't match", async () => {
        const el: any = await $('sel')
        el._size = function (property?: 'width' | 'height') {
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }

        const result = await toHaveHeight.bind({})(el, 10, { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if sizes match', async () => {
        const el: any = await $('sel')
        el._size = function (property?: 'width' | 'height') {
            if (property === 'width') {
                return 50
            }
            if (property === 'height') {
                return 32
            }
            return { width: 50, height: 32 }
        }

        const result = await toHaveHeight.bind({})(el, 32, { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el: any = await $('sel')
        el._size = function () {
            return null
        }
        const result = await toHaveHeight.call({}, el, 50)
        expect(getExpectMessage(result.message())).toContain('to have height')
    })
})
