import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveHTML } from '../../../src/matchers/element/toHaveHTML.js'

vi.mock('@wdio/globals')

describe('toHaveHTML', () => {

    test('wait for success', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn()
            .mockResolvedValueOnce('')
            .mockResolvedValueOnce('')
            .mockResolvedValue('<div>foo</div>')

        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveHTML.call({}, element, '<div>foo</div>', { ignoreCase: true, beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(3)
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
        const element = await $('sel')
        element.getHTML = vi.fn().mockRejectedValue(new Error('some error'))

        await expect(() => toHaveHTML.call({}, element, '<div>foo</div>', { ignoreCase: true }))
            .rejects.toThrow('some error')
    })

    test('success on the first attempt', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({}, element, '<div>foo</div>', { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('no wait - failure', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({}, element, 'foo', { wait: 0 })
        expect(result.pass).toBe(false)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('no wait - success', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({}, element, '<div>foo</div>', { wait: 0 })
        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('not - failure - pass should be true', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({ isNot: true }, element, '<div>foo</div>', { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have HTML

Expected [not]: "<div>foo</div>"
Received      : "<div>foo</div>"`
        )
    })

    test('not - success - pass should be false', async () => {
        const el = await $('sel')
        el.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({ isNot: true }, el, '<div>Notfoo</div>', { wait: 0 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test("should return false if htmls don't match", async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, 'foobar', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test("should suceeds (false) if htmls don't match when isNot is true", async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockReturnValue('<div>foo</div>')

        const result = await toHaveHTML.bind({ isNot: true })(element, 'foobar', { wait: 1 })
        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('should fails (pass=true) if htmls match when isNot is true', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockReturnValue('<div>foo</div>')

        const result = await toHaveHTML.bind({ isNot: true })(element, '<div>foo</div>', { wait: 1 })
        expect(result.pass).toBe(true) // success, boolean is inverted later because of `.not`
    })

    test('should return true if htmls match', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, '<div>foo</div>', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html + single replacer matches the expected html', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, '<div>bar</div>', { replace: ['foo', 'bar'] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html + replace (string) matches the expected html', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, '<div>bar</div>', { replace: [['foo', 'bar']] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html + replace (regex) matches the expected html', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, '<div>bar</div>', { replace: [[/foo/, 'bar']] })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html starts with expected html', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, '<div>', { atStart: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html ends with expected html', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, '</div>', { atEnd: true })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html contains the expected html at the given index', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.bind({})(element, 'iv>foo', { atIndex: 2 })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html equals the expected html with includeSelectorTag set to false', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockImplementation(async ({ includeSelectorTag}: { includeSelectorTag: boolean }) => {
            return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
        })

        const result = await toHaveHTML.bind({})(element, '<div>foo</div>', { includeSelectorTag: false })
        expect(result.pass).toBe(true)
    })

    test('should return true if actual html equals the expected html with includeSelectorTag set to true', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockImplementation(async ({ includeSelectorTag}: { includeSelectorTag: boolean }) => {
            return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
        })

        const result = await toHaveHTML.bind({})(element, '<div><div>foo</div></div>', {
            includeSelectorTag: true,
        })
        expect(result.pass).toBe(true)
    })

    test('message', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('')
        const result = await toHaveHTML.call({}, element, '<div>foo</div>')
        expect(getExpectMessage(result.message())).toContain('to have HTML')
    })

    test('success if array matches with html and ignoreCase', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({}, element, ['div', '<div>foo</div>'], { ignoreCase: true })
        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with html and trim', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('   <div>foo</div>   ')

        const result = await toHaveHTML.call({}, element, ['div', '<div>foo</div>', 'toto'], { trim: true })
        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with html and replace (string)', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({}, element, ['div', '<div>foo</div>', 'toto'], {
            replace: [['Web', 'Browser']],
        })
        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with html and replace (regex)', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({}, element, ['div', '<div>foo</div>', 'toto'], {
            replace: [[/Web/g, 'Browser']],
        })
        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('success if array matches with html and multiple replacers and one of the replacers is a function', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>FOO</div>')

        const result = await toHaveHTML.call({}, element, ['div', '<p>foo</p>', 'toto'], {
            replace: [
                [/div/g, 'p'],
                [/[A-Z]/g, (match: string) => match.toLowerCase()],
            ],
        })
        expect(result.pass).toBe(true)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    test('failure if array does not match with html', async () => {
        const element = await $('sel')
        element.getHTML = vi.fn().mockResolvedValue('<div>foo</div>')

        const result = await toHaveHTML.call({}, element, ['div', 'foo'], { wait: 1 })
        expect(result.pass).toBe(false)
        expect(element.getHTML).toHaveBeenCalledTimes(1)
    })

    describe('with RegExp', () => {
        let element: ChainablePromiseElement

        beforeEach(async () => {
            element = await $('sel')
            element.getHTML = vi.fn().mockResolvedValue('This is example HTML')
        })

        test('success if match', async () => {
            const result = await toHaveHTML.call({}, element, /ExAmplE/i)
            expect(result.pass).toBe(true)
        })

        test('success if array matches with RegExp', async () => {
            const result = await toHaveHTML.call({}, element, ['div', /ExAmPlE/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with html', async () => {
            const result = await toHaveHTML.call({}, element, ['This is example HTML', /Webdriver/i])
            expect(result.pass).toBe(true)
        })

        test('success if array matches with html and ignoreCase', async () => {
            const result = await toHaveHTML.call({}, element, ['ThIs Is ExAmPlE HTML', /Webdriver/i], {
                ignoreCase: true,
            })
            expect(result.pass).toBe(true)
        })

        test('failure if no match', async () => {
            const result = await toHaveHTML.call({}, element, /Webdriver/i)
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have HTML')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getReceived(result.message())).toContain('This is example HTML')
        })

        test('failure if array does not match with html', async () => {
            const result = await toHaveHTML.call({}, element, ['div', /Webdriver/i])
            expect(result.pass).toBe(false)
            expect(getExpectMessage(result.message())).toContain('to have HTML')
            expect(getExpected(result.message())).toContain('/Webdriver/i')
            expect(getExpected(result.message())).toContain('div')
        })
    })
})
