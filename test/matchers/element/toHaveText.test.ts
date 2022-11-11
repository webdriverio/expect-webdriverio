import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils'
import { toHaveText } from '../../../src/matchers/element/toHaveText'

describe('toHaveText', () => {
    test('wait for success', async () => {
        const el = await $('sel')
        el._attempts = 2
        el._text= function (): string {
            if (this._attempts > 0) {
                this._attempts--
                return ''
            }
            return 'webdriverio'
        }

        const result = await toHaveText(el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    test('can deal with chained elements', async () => {
        const el = await $('sel')
        el._attempts = 2
        el._text= function (): string {
            if (this._attempts > 0) {
                this._attempts--
                return ''
            }
            return 'webdriverio'
        }

        const result = await toHaveText(Promise.resolve(el), 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    test('wait but failure', async () => {
        const el = await $('sel')
        el._text = function (): string {
            throw new Error('some error')
        }

        const result = await toHaveText(el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(false)
    })

    test('success on the first attempt', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText(el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._text = function ():string {
            this._attempts++
            return 'webdriverio'
        }

        const result = await toHaveText(el, 'WebdriverIO', { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText(el, 'WebdriverIO', { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }
        const result = await toHaveText.call({ isNot: true }, el, 'WebdriverIO', { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test('should return false if texts dont match', async () => {
        const el = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({ isNot: true })(el, 'foobar', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if texts match', async () => {
        const el = await $('sel')
        el._text = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveText.bind({ isNot: true })(el, 'WebdriverIO', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el = await $('sel')
        el._text = function (): string {
            return ''
        }
        const result = await toHaveText(el, 'WebdriverIO')
        expect(getExpectMessage(result.message())).toContain('to have text')
    })

    test('success if array matches with text and ignoreCase', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText(el, ['WDIO', 'Webdriverio'], { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with text and trim', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return '   WebdriverIO   '
        }

        const result = await toHaveText(el, ['WDIO', 'WebdriverIO', 'toto'], { trim: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('failure if array does not match with text', async () => {
        const el = await $('sel')
        el._attempts = 0
        el._text = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveText(el, ['WDIO', 'Webdriverio'], { wait: 1 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    describe('with RegExp', () => {
        let el: WebdriverIO.Element

        beforeEach(async () => {
            el = await $('sel')
            el._text = jest.fn().mockImplementation(() => {
                return "This is example text"
            })
        })

        test('success if match', async () => {
            const result = await toHaveText(el, /ExAmplE/i)
            expect(result.pass).toBe(true)
        })

        test('success if array matches with RegExp', async () => {
            const result = await toHaveText(el, ['WDIO', /ExAmPlE/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with text', async () => {
            const result = await toHaveText(el, ['This is example text', /Webdriver/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with text and ignoreCase', async () => {
            const result = await toHaveText(el, ['ThIs Is ExAmPlE tExT', /Webdriver/i], { ignoreCase: true })
            expect(result.pass).toBe(true)
        })

        test('failure if no match', async () => {
            const result = await toHaveText(el, /Webdriver/i)
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have text')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getReceived(result.message())).toContain('This is example text')
        })

        test('failure if array does not match with text', async () => {
            const result = await toHaveText(el, ['WDIO', /Webdriver/i])
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have text')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getExpected(result.message())).toContain('WDIO')
        })
    })
})
