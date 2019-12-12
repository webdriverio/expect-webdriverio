import { toBeDisplayed, toBeVisible } from '../../../src/matchers/element/toBeDisplayed'

// TODO how to import it once for every matcher?
require('../../__fixtures__/wdio.js')

describe('toBeDisplayed', () => {
    // TODO need to have global beforeAll hook
    beforeAll(() => {
        expect._expectWebdriverio.options.wait = 50
        expect._expectWebdriverio.options.interval = 10
    })

    test('wait for success', async () => {
        const el = await $('sel')
        el._attempts = 2
        el._value = function () {
            if (this._attempts > 0) {
                this._attempts--
                return false
            }
            return true
        }

        const result = await toBeDisplayed(el)
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el._value = function () {
            throw new Error('some error')
        }

        const result = await toBeDisplayed(el)
        expect(result.pass).toBe(false)
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function () {
            this._attempts++
            return true
        }

        const result = await toBeDisplayed(el)
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function () {
            this._attempts++
            return false
        }

        const result = await toBeDisplayed(el, { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._value = function () {
            this._attempts++
            return true
        }

        const result = await toBeDisplayed(el, { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const result = await toBeDisplayed.call({ isNot: true }, $('sel'), { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test('not - success', async () => {
        const el = await $('sel')
        el._value = function () {
            return false
        }
        const result = await toBeDisplayed.call({ isNot: true }, el, { wait: 0 })
        const received = getReceived(result.message())

        expect(received).toContain('not')
        expect(result.pass).toBe(false)
    })

    test('message', async () => {
        const result = await toBeDisplayed($('sel'))
        expect(getExpectMessage(result.message())).toContain('to be displayed')
    })

    test('alias message', async () => {
        const result = await toBeVisible($('sel'))
        expect(getExpectMessage(result.message())).toContain('to be visible')
    })
})

function getExpectMessage(msg: string) {
    return msg.split('\n')[0]
}

function getExpected(msg: string) {
    return getReceivedOrExpected(msg, 'Expected')
}

function getReceived(msg: string) {
    return getReceivedOrExpected(msg, 'Received')
}

function getReceivedOrExpected(msg: string, type: string) {
    return msg.split('\n').find((line, idx) => idx > 1 && line.startsWith(type))
}
