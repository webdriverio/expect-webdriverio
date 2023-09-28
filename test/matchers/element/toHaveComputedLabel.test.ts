import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveComputedLabel } from '../../../src/matchers/element/toHaveComputedLabel.js'

vi.mock('@wdio/globals')

describe('toHaveComputedLabel', () => {
    test('wait for success', async () => {
        const el: any = await $('sel')
        el._attempts = 2
        el._computed_label = function (): string {
            if (this._attempts > 0) {
                this._attempts--
                return ''
            }
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(0)
    })

    test('wait but failure', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            throw new Error('some error')
        }

        const result = await toHaveComputedLabel.call({}, el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(false)
    })

    test('success on the first attempt', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, 'WebdriverIO', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('no wait - failure', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, 'foo', { wait: 0 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    test('no wait - success', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, 'WebdriverIO', { wait: 0 })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('not - failure', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }
        const result = await toHaveComputedLabel.call({ isNot: true }, el, 'WebdriverIO', { wait: 0 })
        const received = getReceived(result.message())

        expect(received).not.toContain('not')
        expect(result.pass).toBe(true)
    })

    test("should return false if computed labels don't match", async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({ isNot: true })(el, 'foobar', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test('should return true if computed labels match', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({ isNot: true })(el, 'WebdriverIO', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed label + single replacer matches the expected computed label', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({})(el, 'BrowserdriverIO', {
            replace: ['Web', 'Browser'],
        })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed label + replace (string) matches the expected computed label', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({})(el, 'BrowserdriverIO', {
            replace: [['Web', 'Browser']],
        })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed label + replace (regex) matches the expected computed label', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({})(el, 'BrowserdriverIO', {
            replace: [[/Web/, 'Browser']],
        })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed label starts with expected computed label', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({})(el, 'Webd', { atStart: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed label ends with expected computed label', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({})(el, 'erIO', { atEnd: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual computed label contains the expected computed label at the given index', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.bind({})(el, 'iver', { atIndex: 5 })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const el: any = await $('sel')
        el._computed_label = function (): string {
            return ''
        }
        const result = await toHaveComputedLabel.call({}, el, 'WebdriverIO')
        expect(getExpectMessage(result.message())).toContain('to have computed label')
    })

    test('success if array matches with computed label and ignoreCase', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, ['div', 'WebdriverIO'], { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with computed label and trim', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return '   WebdriverIO   '
        }

        const result = await toHaveComputedLabel.call({}, el, ['div', 'WebdriverIO', 'toto'], {
            trim: true,
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with computed label and replace (string)', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, ['div', 'BrowserdriverIO', 'toto'], {
            replace: [['Web', 'Browser']],
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with computed label and replace (regex)', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, ['div', 'BrowserdriverIO', 'toto'], {
            replace: [[/Web/g, 'Browser']],
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('success if array matches with computed label and multiple replacers and one of the replacers is a function', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, ['div', 'browserdriverio', 'toto'], {
            replace: [
                [/Web/g, 'Browser'],
                [/[A-Z]/g, (match) => match.toLowerCase()],
            ],
        })
        expect(result.pass).toBe(true)
        expect(el._attempts).toBe(1)
    })

    test('failure if array does not match with computed label', async () => {
        const el: any = await $('sel')
        el._attempts = 0
        el._computed_label = function (): string {
            this._attempts++
            return 'WebdriverIO'
        }

        const result = await toHaveComputedLabel.call({}, el, ['div', 'foo'], { wait: 1 })
        expect(result.pass).toBe(false)
        expect(el._attempts).toBe(1)
    })

    describe('with RegExp', () => {
        let el: any

        beforeEach(async () => {
            el = await $('sel')
            el._computed_label = vi.fn().mockImplementation(() => {
                return 'This is example computed label'
            })
        })

        test('success if match', async () => {
            const result = await toHaveComputedLabel.call({}, el, /ExAmplE/i)
            expect(result.pass).toBe(true)
        })

        test('success if array matches with RegExp', async () => {
            const result = await toHaveComputedLabel.call({}, el, ['div', /ExAmPlE/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with computed label', async () => {
            const result = await toHaveComputedLabel.call({}, el, [
                'This is example computed label',
                /Webdriver/i,
            ])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with computed label and ignoreCase', async () => {
            const result = await toHaveComputedLabel.call(
                {},
                el,
                ['ThIs Is ExAmPlE computed label', /Webdriver/i],
                {
                    ignoreCase: true,
                }
            )
            expect(result.pass).toBe(true)
        })

        test('failure if no match', async () => {
            const result = await toHaveComputedLabel.call({}, el, /Webdriver/i)
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have computed label')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getReceived(result.message())).toContain('This is example computed label')
        })

        test('failure if array does not match with computed label', async () => {
            const result = await toHaveComputedLabel.call({}, el, ['div', /Webdriver/i])
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have computed label')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getExpected(result.message())).toContain('div')
        })
    })
})
