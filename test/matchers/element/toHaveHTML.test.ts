import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveHTML } from '../../../src/matchers/element/toHaveHTML.js'

vi.mock('@wdio/globals')

describe('toHaveHTML', () => {
    test('wait for success', async () => {
        const el: any = await $('sel')
        el._attempts = 2
        el._html = function (): string {
            if (this._attempts > 0) {
                this._attempts--
                return ''
            }
            return '<div>foo</div>'
        }

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const result = await toHaveHTML.call({}, el, '<div>foo</div>', { ignoreCase: true, beforeAssertion, afterAssertion })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveHTML',
            expectedValue: '<div>foo</div>',
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveHTML',
            expectedValue: '<div>foo</div>',
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('wait but failure', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            throw new Error('some error')
        }

        await expect(() => toHaveHTML.call({}, el, '<div>foo</div>', { ignoreCase: true }))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.call({}, el, '<div>foo</div>', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.call({}, el, 'foo', { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.call({}, el, '<div>foo</div>', { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }
        const result = await toHaveHTML.call({ isNot: true }, el, '<div>foo</div>', { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test("should return false if htmls don't match", async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({ isNot: true })(el, 'foobar', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if htmls match', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({ isNot: true })(el, '<div>foo</div>', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html + single replacer matches the expected html', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, '<div>bar</div>', { replace: ['foo', 'bar'] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html + replace (string) matches the expected html', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, '<div>bar</div>', { replace: [['foo', 'bar']] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html + replace (regex) matches the expected html', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, '<div>bar</div>', { replace: [[/foo/, 'bar']] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html starts with expected html', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, '<div>', { atStart: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html ends with expected html', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, '</div>', { atEnd: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html contains the expected html at the given index', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, 'iv>foo', { atIndex: 2 })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html equals the expected html with includeSelectorTag set to false', async () => {
        const el: any = await $('sel')
        el._html = function (includeSelectorTag: boolean): string {
            return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, '<div>foo</div>', { includeSelectorTag: false })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html equals the expected html with includeSelectorTag set to false', async () => {
        const el: any = await $('sel')
        el._html = function (includeSelectorTag: boolean): string {
            return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
        }

        const result = await toHaveHTML.bind({})(el, '<div><div>foo</div></div>', {
            includeSelectorTag: true,
        })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el: any = await $('sel')
        el._html = function (): string {
            return ''
        }
        const result = await toHaveHTML.call({}, el, '<div>foo</div>')
        expect(getExpectMessage(result.message())).toContain('to have HTML')
    })

    test('success if array matches with html and ignoreCase', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.call({}, el, ['div', '<div>foo</div>'], { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with html and trim', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '   <div>foo</div>   '
        }

        const result = await toHaveHTML.call({}, el, ['div', '<div>foo</div>', 'toto'], { trim: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with html and replace (string)', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.call({}, el, ['div', '<div>foo</div>', 'toto'], {
            replace: [['Web', 'Browser']],
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with html and replace (regex)', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.call({}, el, ['div', '<div>foo</div>', 'toto'], {
            replace: [[/Web/g, 'Browser']],
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with html and multiple replacers and one of the replacers is a function', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>FOO</div>'
        }

        const result = await toHaveHTML.call({}, el, ['div', '<p>foo</p>', 'toto'], {
            replace: [
                [/div/g, 'p'],
                [/[A-Z]/g, (match: string) => match.toLowerCase()],
            ],
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('failure if array does not match with html', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._html = function (): string {
            this._attempts++
            return '<div>foo</div>'
        }

        const result = await toHaveHTML.call({}, el, ['div', 'foo'], { wait: 1 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    describe('with RegExp', () => {
        let el: any

        beforeEach(async () => {
            el = await $('sel')
            el._html = vi.fn().mockImplementation(() => {
                return 'This is example HTML'
            })
        })

        test('success if match', async () => {
            const result = await toHaveHTML.call({}, el, /ExAmplE/i)
            expect(result.pass).toBe(true)
        })

        test('success if array matches with RegExp', async () => {
            const result = await toHaveHTML.call({}, el, ['div', /ExAmPlE/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with html', async () => {
            const result = await toHaveHTML.call({}, el, ['This is example HTML', /Webdriver/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with html and ignoreCase', async () => {
            const result = await toHaveHTML.call({}, el, ['ThIs Is ExAmPlE HTML', /Webdriver/i], {
                ignoreCase: true,
            })
            expect(result.pass).toBe(true)
        })

        test('failure if no match', async () => {
            const result = await toHaveHTML.call({}, el, /Webdriver/i)
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have HTML')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getReceived(result.message())).toContain('This is example HTML')
        })

        test('failure if array does not match with html', async () => {
            const result = await toHaveHTML.call({}, el, ['div', /Webdriver/i])
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have HTML')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getExpected(result.message())).toContain('div')
        })
    })
})
