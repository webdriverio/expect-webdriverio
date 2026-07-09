import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'
import { toHaveComputedRole } from '../../../src/matchers/element/toHaveComputedRole.js'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

describe(toHaveComputedRole, () => {
    let thisContext: { toHaveComputedRole: typeof toHaveComputedRole }
    let thisNotContext: { isNot: true; toHaveComputedRole: typeof toHaveComputedRole }

    beforeEach(async () => {
        thisContext = { toHaveComputedRole }
        thisNotContext = { isNot: true, toHaveComputedRole }
    })

    describe('given single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getComputedRole).mockResolvedValue('WebdriverIO')
        })

        test('wait for success', async () => {
            vi.mocked(el.getComputedRole).mockResolvedValueOnce('').mockResolvedValueOnce('WebdriverIO')
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveComputedRole(el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(2)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveComputedRole',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveComputedRole',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but failure', async () => {
            vi.mocked(el.getComputedRole).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveComputedRole(el, 'WebdriverIO', { ignoreCase: true, wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'WebdriverIO', { ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'foo', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveComputedRole(el, 'WebdriverIO')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have computed role

Expected [not]: "WebdriverIO"
Received      : "WebdriverIO"`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveComputedRole(el, 'foobar')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('should return true if actual computed role + single replacer matches the expected computed role', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'BrowserdriverIO', {
                replace: ['Web', 'Browser'],
            })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed role + replace (string) matches the expected computed role', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'BrowserdriverIO', {
                replace: [['Web', 'Browser']],
            })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed role + replace (regex) matches the expected computed role', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'BrowserdriverIO', {
                replace: [[/Web/, 'Browser']],
            })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed role starts with expected computed role', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'Webd', { atStart: true })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed role ends with expected computed role', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'erIO', { atEnd: true })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed role contains the expected computed role at the given index', async () => {
            const result = await thisContext.toHaveComputedRole(el, 'iver', { atIndex: 5 })
            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            vi.mocked(el.getComputedRole).mockResolvedValue('')

            const result = await thisContext.toHaveComputedRole(el, 'WebdriverIO')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have computed role

Expected: "WebdriverIO"
Received: ""`)
        })

        test('success if array matches with computed role and ignoreCase', async () => {
            const result = await thisContext.toHaveComputedRole(el, ['div', 'WebdriverIO'], { ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed role and trim', async () => {
            vi.mocked(el.getComputedRole).mockResolvedValue('   WebdriverIO   ')

            const result = await thisContext.toHaveComputedRole(el, ['div', 'WebdriverIO', 'toto'], {
                trim: true,

            })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed role and replace (string)', async () => {
            const result = await thisContext.toHaveComputedRole(el, ['div', 'BrowserdriverIO', 'toto'], {
                replace: [['Web', 'Browser']],
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed role and replace (regex)', async () => {
            const result = await thisContext.toHaveComputedRole(el, ['div', 'BrowserdriverIO', 'toto'], {
                replace: [[/Web/g, 'Browser']],
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed role and multiple replacers and one of the replacers is a function', async () => {
            const result = await thisContext.toHaveComputedRole(el, ['div', 'browserdriverio', 'toto'], {
                replace: [
                    [/Web/g, 'Browser'],
                    [/[A-Z]/g, (match: string) => match.toLowerCase()],
                ],
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('failure if array does not match with computed role', async () => {
            const result = await thisContext.toHaveComputedRole(el, ['div', 'foo'])

            expect(result.pass).toBe(false)
        })

        describe('with RegExp', () => {
            let el: ChainablePromiseElement

            beforeEach(async () => {
                el = await $('sel')
                vi.mocked(el.getComputedRole).mockResolvedValue('This is example computed role')
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveComputedRole(el, /ExAmplE/i)

                expect(result.pass).toBe(true)
            })

            test('success if array matches with RegExp', async () => {
                const result = await thisContext.toHaveComputedRole(el, ['div', /ExAmPlE/i])

                expect(result.pass).toBe(true)
            })

            test('success if array matches with computed role', async () => {
                const result = await thisContext.toHaveComputedRole(el, [
                    'This is example computed role',
                    /Webdriver/i,
                ])

                expect(result.pass).toBe(true)
            })

            test('success if array matches with computed role and ignoreCase', async () => {
                const result = await thisContext.toHaveComputedRole(
                    el,
                    ['ThIs Is ExAmPlE computed role', /Webdriver/i],
                    {
                        wait: 1,
                        ignoreCase: true,
                    }
                )

                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveComputedRole(el, /Webdriver/i)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have computed role

Expected: /Webdriver/i
Received: "This is example computed role"`
                )
            })

            test('failure if array does not match with computed role', async () => {
                const result = await thisContext.toHaveComputedRole(el, ['div', /Webdriver/i])

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have computed role

Expected: ["div", /Webdriver/i]
Received: "This is example computed role"`
                )
            })
        })
    })
})
