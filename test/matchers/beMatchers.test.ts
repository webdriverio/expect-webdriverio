import { getExpectMessage, getReceived, matcherNameToString } from '../__fixtures__/utils';
import Matchers from '../../src/matchers'

const ignoredMatchers = ['toBeElementsArrayOfSize', 'toBeDisabled', 'toBeRequested', 'toBeRequestedTimes', 'toBeRequestedWithResponse', 'toBeRequestedWith']
const beMatchers = [
    ...Object.keys(Matchers).filter(name => name.startsWith('toBe') && !ignoredMatchers.includes(name)),
    'toExist'
]

describe('be* matchers', () => {
    beMatchers.forEach((name) => {
        const fn = Matchers[name] // .bind({})

        describe(name, () => {
            test('wait for success', async () => {
                const el = await $('sel')
                el._attempts = 2
                el._value = function (): boolean {
                    if (this._attempts > 0) {
                        this._attempts--
                        return false
                    }
                    return true
                }

                const result = await fn.call({}, el)
                expect(result.pass).toBe(true)
                expect(el._attempts).toBe(0)
            })

            test('wait but failure', async () => {
                const el = await $('sel')
                el._value = function (): boolean {
                    throw new Error('some error')
                }

                const result = await fn.call({}, el)
                expect(result.pass).toBe(false)
            })

            test('success on the first attempt', async () => {
                const el = await $('sel')
                el._attempts = 0
                el._value = function (): boolean {
                    this._attempts++
                    return true
                }

                const result = await fn.call({}, el)
                expect(result.pass).toBe(true)
                expect(el._attempts).toBe(1)
            })

            test('no wait - failure', async () => {
                const el = await $('sel')
                el._attempts = 0
                el._value = function (): boolean {
                    this._attempts++
                    return false
                }

                const result = await fn.call({}, el, { wait: 0 })
                expect(result.pass).toBe(false)
                expect(el._attempts).toBe(1)
            })

            test('no wait - success', async () => {
                const el = await $('sel')
                el._attempts = 0
                el._value = function (): boolean {
                    this._attempts++
                    return true
                }

                const result = await fn.call({}, el, { wait: 0 })
                expect(result.pass).toBe(true)
                expect(el._attempts).toBe(1)
            })

            test('not - failure', async () => {
                const el = await $('sel')
                el._value = function (): boolean {
                    return true
                }
                const result = await fn.call({ isNot: true }, el, { wait: 0 })
                const received = getReceived(result.message())

                expect(received).toContain('not')
                expect(result.pass).toBe(false)
            })

            test('not - success', async () => {
                const el = await $('sel')
                el._value = function (): boolean {
                    return false
                }
                const result = await fn.call({ isNot: true }, el, { wait: 0 })
                const received = getReceived(result.message())

                expect(received).not.toContain('not')
                expect(result.pass).toBe(true)
            })

            test('not - failure (with wait)', async () => {
                const el = await $('sel')
                el._value = function (): boolean {
                    return true
                }
                const result = await fn.call({ isNot: true }, el, { wait: 1 })
                const received = getReceived(result.message())

                expect(received).toContain('not')
                expect(result.pass).toBe(false)
            })

            test('not - success (with wait)', async () => {
                const el = await $('sel')
                el._value = function (): boolean {
                    return false
                }
                const result = await fn.call({ isNot: true }, el, { wait: 1 })
                const received = getReceived(result.message())

                expect(received).not.toContain('not')
                expect(result.pass).toBe(true)
            })

            test('message', async () => {
                const result = await fn.call({}, $('sel'))
                expect(getExpectMessage(result.message()))
                    .toContain(matcherNameToString(name))
            })
        })
    })
})

