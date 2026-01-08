import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'
import { toHaveComputedLabel } from '../../../src/matchers/element/toHaveComputedLabel.js'

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

            const result = await thisContext.toHaveComputedLabel(el, 'WebdriverIO', { ignoreCase: true, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(3)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveComputedLabel',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveComputedLabel',
                expectedValue: 'WebdriverIO',
                options: { ignoreCase: true, beforeAssertion, afterAssertion },
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

        test('not - failure', async () => {
            const result = await thisNotContext.toHaveComputedLabel(el, 'WebdriverIO', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have computed label

Expected [not]: "WebdriverIO"
Received      : "WebdriverIO"`
            )
        })

        test('not - success', async () => {
            const result = await thisNotContext.toHaveComputedLabel(el, 'foobar', { wait: 1 })

            expect(result.pass).toBe(true)
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

            const result = await thisContext.toHaveComputedLabel(el, 'WebdriverIO', { wait: 1 })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have computed label

Expected: "WebdriverIO"
Received: ""`)
        })

        test('success if array matches with computed label and ignoreCase', async () => {
            const result = await thisContext.toHaveComputedLabel(el, ['div', 'WebdriverIO'], { ignoreCase: true, wait: 1 })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed label and trim', async () => {
            vi.mocked(el.getComputedLabel).mockResolvedValue('   WebdriverIO   ')

            const result = await thisContext.toHaveComputedLabel(el, ['div', 'WebdriverIO', 'toto'], {
                trim: true,
                wait: 1,
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed label and replace (string)', async () => {
            const result = await thisContext.toHaveComputedLabel(el, ['div', 'BrowserdriverIO', 'toto'], {
                replace: [['Web', 'Browser']],
                wait: 1,
            })
            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed label and replace (regex)', async () => {
            const result = await thisContext.toHaveComputedLabel(el, ['div', 'BrowserdriverIO', 'toto'], {
                replace: [[/Web/g, 'Browser']],
                wait: 1,
            })

            expect(result.pass).toBe(true)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with computed label and multiple replacers and one of the replacers is a function', async () => {
            const result = await thisContext.toHaveComputedLabel(el, ['div', 'browserdriverio', 'toto'], {
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
            const result = await thisContext.toHaveComputedLabel(el, ['div', 'foo'], { wait: 1 })

            expect(result.pass).toBe(false)
            expect(el.getComputedLabel).toHaveBeenCalledTimes(1)
        })

        describe('with RegExp', () => {
            beforeEach(async () => {
                vi.mocked(el.getComputedLabel).mockResolvedValue('This is example computed label')
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveComputedLabel(el, /ExAmplE/i, { wait: 1 })
                expect(result.pass).toBe(true)
            })

            test('success if array matches with RegExp', async () => {
                const result = await thisContext.toHaveComputedLabel(el, ['div', /ExAmPlE/i], { wait: 1 })
                expect(result.pass).toBe(true)
            })

            test('success if array matches with computed label', async () => {
                const result = await thisContext.toHaveComputedLabel(el, [
                    'This is example computed label',
                    /Webdriver/i,
                ], { wait: 1 })
                expect(result.pass).toBe(true)
            })

            test('success if array matches with computed label and ignoreCase', async () => {
                const result = await toHaveComputedLabel.call(
                    {},
                    el,
                    ['ThIs Is ExAmPlE computed label', /Webdriver/i],
                    {
                        ignoreCase: true,
                        wait: 1,
                    }
                )
                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveComputedLabel(el, /Webdriver/i, { wait: 1 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have computed label

Expected: /Webdriver/i
Received: "This is example computed label"`
                )
            })

            test('failure if array does not match with computed label', async () => {
                const result = await thisContext.toHaveComputedLabel(el, ['div', /Webdriver/i], { wait: 1 })

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have computed label

Expected: ["div", /Webdriver/i]
Received: "This is example computed label"`
                )
            })
        })
    })
})
