import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { toHaveComputedLabel } from '../../../src/matchers/element/toHaveComputedLabel.js'
import stripAnsi from 'strip-ansi'

import { multiRemote } from '../../../src/api/index.js'
import { oneOf } from '../../../src/matchers/asymmetrics/oneOf.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { mockMultiRemoteElementsCommand, mockMultiRemoteInstanceCommand } from '../../__fixtures__/utils.js'
vi.mock('@wdio/globals')

describe(toHaveComputedLabel, () => {
    let thisContext: { toHaveComputedLabel: typeof toHaveComputedLabel }
    let thisNotContext: { isNot: true; toHaveComputedLabel: typeof toHaveComputedLabel }

    beforeEach(async () => {
        thisContext = { toHaveComputedLabel }
        thisNotContext = { isNot: true, toHaveComputedLabel }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getComputedLabel).mockResolvedValue('WebdriverIO')
        })

        test('wait for success', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValueOnce('')
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce('WebdriverIO')
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveComputedLabel(el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(3)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveComputedLabel',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveComputedLabel',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but failure', async () => {
            vi.mocked(el.getComputedLabel).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveComputedLabel(el, 'WebdriverIO', { ignoreCase: true, wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveComputedLabel(el, 'WebdriverIO', { ignoreCase: true, wait: 1 })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            const result = await thisContext.toHaveComputedLabel(el, 'foo', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveComputedLabel(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveComputedLabel(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have computed label

Expected [not]: "WebdriverIO"
Received      : "WebdriverIO"`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveComputedLabel(el, 'foobar')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('should return true if actual computed label + single replacer matches the expected computed label', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveComputedLabel(el, 'BrowserdriverIO', {
                replace: ['Web', 'Browser'],
                wait: 1,
            })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed label + replace (string) matches the expected computed label', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveComputedLabel(el, 'BrowserdriverIO', {
                replace: [['Web', 'Browser']],
                wait: 1,
            })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed label + replace (regex) matches the expected computed label', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveComputedLabel(el, 'BrowserdriverIO', {
                replace: [[/Web/, 'Browser']],
                wait: 1,
            })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed label starts with expected computed label', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValue('WebdriverIO')

            const result = await thisContext.toHaveComputedLabel(el, 'Webd', { atStart: true, wait: 1 })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed label ends with expected computed label', async () => {
            const result = await thisContext.toHaveComputedLabel(el, 'erIO', { atEnd: true, wait: 1 })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual computed label contains the expected computed label at the given index', async () => {
            const result = await thisContext.toHaveComputedLabel(el, 'iver', { atIndex: 5, wait: 1 })

            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValue('')

            const result = await thisContext.toHaveComputedLabel(el, 'WebdriverIO')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have computed label

Expected: "WebdriverIO"
Received: ""`)
        })

        test('success if oneOf matches with computed label and ignoreCase', async () => {
            const result = await thisContext.toHaveComputedLabel(el, oneOf('div', 'WebdriverIO'), { ignoreCase: true, wait: 1 })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed label and trim', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValue('   WebdriverIO   ')

            const result = await thisContext.toHaveComputedLabel(el, oneOf('div', 'WebdriverIO', 'toto'), {
                trim: true,
                wait: 1,
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed label and replace (string)', async () => {
            const result = await thisContext.toHaveComputedLabel(el, oneOf('div', 'BrowserdriverIO', 'toto'), {
                replace: [['Web', 'Browser']],
                wait: 1,
            })
            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed label and replace (regex)', async () => {
            const result = await thisContext.toHaveComputedLabel(el, oneOf('div', 'BrowserdriverIO', 'toto'), {
                replace: [[/Web/g, 'Browser']],
                wait: 1,
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if oneOf matches with computed label and multiple replacers and one of the replacers is a function', async () => {
            const result = await thisContext.toHaveComputedLabel(el, oneOf('div', 'browserdriverio', 'toto'), {
                replace: [
                    [/Web/g, 'Browser'],
                    [/[A-Z]/g, (match: string) => match.toLowerCase()],
                ],
                wait: 1,
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('failure if array does not match with computed label', async () => {
            const result = await thisContext.toHaveComputedLabel(el, ['div', 'foo'], { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        describe('with RegExp', () => {
            beforeEach(async () => {
                vi.mocked(el.getComputedLabel).mockResolvedValue('This is example computed label')
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveComputedLabel(el, /ExAmplE/i)
                expect(result.pass).toBe(true)
            })

            test('success if oneOf matches with RegExp', async () => {
                const result = await thisContext.toHaveComputedLabel(el, oneOf('div', /ExAmPlE/i))
                expect(result.pass).toBe(true)
            })

            test('success if oneOf matches with computed label', async () => {
                const result = await thisContext.toHaveComputedLabel(el, oneOf(
                    'This is example computed label',
                    /Webdriver/i,
                ))
                expect(result.pass).toBe(true)
            })

            test('success if oneOf matches with computed label and ignoreCase', async () => {
                const result = await thisContext.toHaveComputedLabel(
                    el,
                    oneOf('ThIs Is ExAmPlE computed label', /Webdriver/i),
                    {
                        ignoreCase: true,
                        wait: 1,
                    }
                )
                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveComputedLabel(el, /Webdriver/i)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have computed label

Expected: /Webdriver/i
Received: "This is example computed label"`
                )
            })

            test('failure if array does not match with computed label', async () => {
                const result = await thisContext.toHaveComputedLabel(el, ['div', /Webdriver/i])

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have computed label

Expected: ["div", /Webdriver/i]
Received: "This is example computed label"`
                )
            })
        })
    })

    describe('given multiple elements', () => {
        let elements: ChainablePromiseArray

        beforeEach(async () => {
            elements = await $$('sel')
        })

        test('checks the same computed label or one computed label per element', async () => {
            const same = await thisContext.toHaveComputedLabel(elements, 'Computed Label', { wait: 0 })
            const perElement = await thisContext.toHaveComputedLabel(elements, ['Computed Label', 'Computed Label'], { wait: 0 })

            expect(same.pass).toBe(true)
            expect(perElement.pass).toBe(true)
        })

        test('fails with the computed label of every element', async () => {
            vi.mocked(elements[1].getComputedLabel).mockResolvedValue('Other Label')

            const result = await thisContext.toHaveComputedLabel(elements, 'Computed Label', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`sel\`) to have computed label

- Expected  - 1
+ Received  + 1

  Array [
    "Computed Label",
-   "Computed Label",
+   "Other Label",
  ]`)
        })
    })

    describe('given multi-remote elements', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

        test.each([
            { name: '$()', subject: () => createMultiRemoteElementMock(browsers(), 'sel'), message: `\
Expect multi-remote<chrome, firefox>.$(\`sel\`) to have computed label

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "Computed Label",
-   "firefox": "Computed Label",
+   "firefox": "Other Label",
  }` },
            { name: '$$()', subject: () => createMultiRemoteElementArrayMock(browsers(), 'sel', 2), message: `\
Expect multi-remote<chrome, firefox>.$$(\`sel\`) to have computed label

- Expected  - 2
+ Received  + 2

  Multi-remote values {
    "chrome": Array [
      "Computed Label",
      "Computed Label",
    ],
    "firefox": Array [
-     "Computed Label",
-     "Computed Label",
+     "Other Label",
+     "Other Label",
    ],
  }` },
        ])('checks the same computed label or one computed label per instance with expect.multiRemote() on $name', async ({ subject, message }) => {
            const element = subject()
            mockMultiRemoteInstanceCommand(element, 'firefox', 'getComputedLabel', 'Other Label')

            const same = await thisContext.toHaveComputedLabel(element, 'Computed Label', { wait: 0 })
            const perInstance = await thisContext.toHaveComputedLabel(element, multiRemote({ chrome: 'Computed Label', firefox: 'Other Label' }), { wait: 0 })

            expect(same.pass).toBe(false)
            expect(stripAnsi(same.message())).toEqual(message)
            expect(perInstance.pass).toBe(true)
        })

        test('checks one array per instance, as the plain object shorthand, element by element on $$()', async () => {
            const elements = createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
            mockMultiRemoteElementsCommand(elements, 'getComputedLabel', { chrome: ['Computed Label', 'Second Label'], firefox: ['Other Label', 'Another Label'] })

            const result = await thisContext.toHaveComputedLabel(elements, { chrome: ['Computed Label', 'Second Label'], firefox: ['Other Label', 'Another Label'] }, { wait: 0 })
            const swapped = await thisContext.toHaveComputedLabel(elements, { chrome: ['Second Label', 'Computed Label'], firefox: ['Another Label', 'Other Label'] }, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(swapped.pass).toBe(false)
        })
    })
})
