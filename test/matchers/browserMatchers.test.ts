import { getExpectMessage, getReceived, matcherNameToString, getExpected } from '../__fixtures__/utils';
import Matchers from '../../src/matchers'

const browserMatchers = ['toHaveUrl', 'toHaveTitle', 'toHaveTitleContaining', 'toHaveUrlContaining']

const validText = ' Valid Text '
const wrongText = ' Wrong Text '

describe('browser matchers', () => {
    browserMatchers.forEach((name) => {
        const fn = Matchers[name]

        describe(name, () => {
            test('wait for success', async () => {
                browser._attempts = 2
                browser._value = function (): string {
                    if (this._attempts > 0) {
                        this._attempts--
                        return wrongText
                    }
                    return validText
                }

                const result = await fn.call({}, browser, validText, { trim: false })
                expect(result.pass).toBe(true)
                expect(browser._attempts).toBe(0)
            })

            test('wait but failure', async () => {
                browser._value = function (): string {
                    throw new Error('some error')
                }

                const result = await fn.call({}, browser, validText, { trim: false })
                expect(result.pass).toBe(false)
            })

            test('success on the first attempt', async () => {
                browser._attempts = 0
                browser._value = function (): string {
                    this._attempts++
                    return validText
                }

                const result = await fn.call({}, browser, validText, { trim: false })
                expect(result.pass).toBe(true)
                expect(browser._attempts).toBe(1)
            })

            test('no wait - failure', async () => {
                browser._attempts = 0
                browser._value = function (): string {
                    this._attempts++
                    return wrongText
                }

                const result = await fn.call({}, browser, validText, { wait: 0, trim: false })
                expect(result.pass).toBe(false)
                expect(browser._attempts).toBe(1)
            })

            test('no wait - success', async () => {
                browser._attempts = 0
                browser._value = function (): string {
                    this._attempts++
                    return validText
                }

                const result = await fn.call({}, browser, validText, { wait: 0, trim: false })

                expect(result.pass).toBe(true)
                expect(browser._attempts).toBe(1)
            })

            test('not - failure', async () => {
                browser._attempts = 0
                browser._value = function (): string {
                    this._attempts++
                    return validText
                }

                const result = await fn.call({ isNot: true }, browser, validText, { wait: 0, trim: false })

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('not')

                expect(result.pass).toBe(false)
            })

            test('not - success', async () => {
                browser._value = function (): string {
                    return wrongText
                }
                const result = await fn.call({ isNot: true }, browser, validText, { wait: 0 })

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('Valid')
                expect(getReceived(result.message())).toContain('Wrong')

                expect(result.pass).toBe(true)
            })

            test('not - failure (with wait)', async () => {
                browser._attempts = 0
                browser._value = function (): string {
                    this._attempts++
                    return validText
                }
                const result = await fn.call({ isNot: true }, browser, validText, { wait: 1, trim: false })

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('not')

                expect(result.pass).toBe(false)
            })

            test('not - success (with wait)', async () => {
                browser._value = function (): string {
                    return wrongText
                }
                const result = await fn.call({ isNot: true }, browser, validText, { wait: 1 })

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('Valid')
                expect(getReceived(result.message())).toContain('Wrong')

                expect(result.pass).toBe(true)
            })

            test('message', async () => {
                const result = await fn.call({}, browser)
                expect(getExpectMessage(result.message())).toContain(matcherNameToString(name))
            })
        })
    })
})

