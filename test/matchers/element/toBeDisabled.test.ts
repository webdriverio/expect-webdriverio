import { getExpectMessage, getReceived } from '../../__fixtures__/utils';
import { toBeDisabled } from '../../../src/matchers/element/toBeDisabled'

describe('toBeDisabled', () => {
    /**
     * result is inverted for toBeDisplayed because it inverts isEnabled result
     * `!await el.isEnabled()`
     */
    test('wait for success', async () => {
        const el = await $('sel')
        el._attempts = 2
        el._value = function () {
            if (this._attempts > 0) {
                this._attempts--
                return true
            }
            return false
        }

        const result = await toBeDisabled(el)
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el._value = function () {
            throw new Error('some error')
        }

        const result = await toBeDisabled(el)
        expect(result.pass).toBe(false)
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function () {
            this._attempts++
            return false
        }

        const result = await toBeDisabled(el)
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function () {
            this._attempts++
            return true
        }

        const result = await toBeDisabled(el, { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function () {
            this._attempts++
            return false
        }

        const result = await toBeDisabled(el, { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el = await $('sel')
        el._value = function () {
            return false
        }
        const result = await toBeDisabled.call({ isNot: true }, el, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test('not - success', async () => {
        const el = await $('sel')
        el._value = function () {
            return true
        }
        const result = await toBeDisabled.call({ isNot: true }, el, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).toContain('not')
        expect(result.pass).toBe(false)
    })

    test('message', async () => {
        const el = await $('sel')
        el._value = function () {
            return false
        }
        const result = await toBeDisabled(el)
        expect(getExpectMessage(result.message())).toContain('to be disabled')
    })
})
