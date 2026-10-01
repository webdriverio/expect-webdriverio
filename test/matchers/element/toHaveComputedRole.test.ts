import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { toHaveComputedRole } from '../../../src/matchers/element/toHaveComputedRole.js'
import stripAnsi from 'strip-ansi'

import { multiRemote } from '../../../src/api/index.js'
import { oneOf } from '../../../src/matchers/asymmetrics/oneOf.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { mockMultiRemoteElementsCommand, mockMultiRemoteInstanceCommand } from '../../__fixtures__/utils.js'
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

        test('success if oneOf matches with computed role and ignoreCase', async () => {
            const result = await thisContext.toHaveComputedRole(el, oneOf('div', 'WebdriverIO'), { ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed role and trim', async () => {
            vi.mocked(el.getComputedRole).mockResolvedValue('   WebdriverIO   ')

            const result = await thisContext.toHaveComputedRole(el, oneOf('div', 'WebdriverIO', 'toto'), {
                trim: true,

            })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed role and replace (string)', async () => {
            const result = await thisContext.toHaveComputedRole(el, oneOf('div', 'BrowserdriverIO', 'toto'), {
                replace: [['Web', 'Browser']],
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed role and replace (regex)', async () => {
            const result = await thisContext.toHaveComputedRole(el, oneOf('div', 'BrowserdriverIO', 'toto'), {
                replace: [[/Web/g, 'Browser']],
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedRole).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed role and multiple replacers and one of the replacers is a function', async () => {
            const result = await thisContext.toHaveComputedRole(el, oneOf('div', 'browserdriverio', 'toto'), {
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

            test('success if oneOf matches with RegExp', async () => {
                const result = await thisContext.toHaveComputedRole(el, oneOf('div', /ExAmPlE/i))

                expect(result.pass).toBe(true)
            })

            test('success if oneOf matches with computed role', async () => {
                const result = await thisContext.toHaveComputedRole(el, oneOf(
                    'This is example computed role',
                    /Webdriver/i,
                ))

                expect(result.pass).toBe(true)
            })

            test('success if oneOf matches with computed role and ignoreCase', async () => {
                const result = await thisContext.toHaveComputedRole(
                    el,
                    oneOf('ThIs Is ExAmPlE computed role', /Webdriver/i),
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

    describe('given multiple elements', () => {
        let elements: ChainablePromiseArray

        beforeEach(async () => {
            elements = await $$('sel')
        })

        test('checks the same computed role or one computed role per element', async () => {
            const same = await thisContext.toHaveComputedRole(elements, 'Computed Role', { wait: 0 })
            const perElement = await thisContext.toHaveComputedRole(elements, ['Computed Role', 'Computed Role'], { wait: 0 })

            expect(same.pass).toBe(true)
            expect(perElement.pass).toBe(true)
        })

        test('fails with the computed role of every element', async () => {
            vi.mocked(elements[1].getComputedRole).mockResolvedValue('Other Role')

            const result = await thisContext.toHaveComputedRole(elements, 'Computed Role', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have computed role

- Expected  - 1
+ Received  + 1

  Array [
    "Computed Role",
-   "Computed Role",
+   "Other Role",
  ]`)
        })
    })

    describe('given multi-remote elements', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

        test.each([
            { name: '$()', subject: () => createMultiRemoteElementMock(browsers(), 'sel'), message: `\
Expect multi-remote<chrome, firefox>.$(\`sel\`) to have computed role

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "Computed Role",
-   "firefox": "Computed Role",
+   "firefox": "Other Role",
  }` },
            { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2), message: `\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to have computed role

- Expected  - 2
+ Received  + 2

  Multi-remote values {
    "chrome": Array [
      "Computed Role",
      "Computed Role",
    ],
    "firefox": Array [
-     "Computed Role",
-     "Computed Role",
+     "Other Role",
+     "Other Role",
    ],
  }` },
        ])('checks the same computed role or one computed role per instance with expect.multiRemote() on $name', async ({ subject, message }) => {
            const element = subject()
            mockMultiRemoteInstanceCommand(element, 'firefox', 'getComputedRole', 'Other Role')

            const same = await thisContext.toHaveComputedRole(element, 'Computed Role', { wait: 0 })
            const perInstance = await thisContext.toHaveComputedRole(element, multiRemote({ chrome: 'Computed Role', firefox: 'Other Role' }), { wait: 0 })

            expect(same.pass).toBe(false)
            expect(stripAnsi(same.message())).toEqual(message)
            expect(perInstance.pass).toBe(true)
        })

        test('checks one array per instance, as the plain object shorthand, element by element on $$()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
            mockMultiRemoteElementsCommand(elements, 'getComputedRole', { chrome: ['Computed Role', 'Second Role'], firefox: ['Other Role', 'Another Role'] })

            const result = await thisContext.toHaveComputedRole(elements, { chrome: ['Computed Role', 'Second Role'], firefox: ['Other Role', 'Another Role'] }, { wait: 0 })
            const swapped = await thisContext.toHaveComputedRole(elements, { chrome: ['Second Role', 'Computed Role'], firefox: ['Another Role', 'Other Role'] }, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(swapped.pass).toBe(false)
        })
    })
})
