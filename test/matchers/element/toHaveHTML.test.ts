import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { toHaveHTML } from '../../../src/matchers/element/toHaveHTML.js'

vi.mock('@wdio/globals')

describe(toHaveHTML, () => {

    let thisContext: { 'toHaveHTML': typeof toHaveHTML }
    let thisNotContext: { 'toHaveHTML': typeof toHaveHTML, isNot: boolean }

    beforeEach(() => {
        thisContext = { 'toHaveHTML': toHaveHTML }
        thisNotContext = { 'toHaveHTML': toHaveHTML, isNot: true }
    })

    describe('given single element', () => {
        let element: ChainablePromiseElement

        beforeEach(async () => {
            element = await $('sel')

            vi.mocked(element.getHTML).mockResolvedValue('<div>foo</div>')
        })

        test('wait for success', async () => {
            vi.mocked(element.getHTML)
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce('')
                .mockResolvedValue('<div>foo</div>')

            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveHTML(element, '<div>foo</div>', { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(3)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveHTML',
                expectedValue: '<div>foo</div>',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveHTML',
                expectedValue: '<div>foo</div>',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but error', async () => {
            vi.mocked(element.getHTML).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveHTML(element, '<div>foo</div>', { ignoreCase: true, wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveHTML(element, '<div>foo</div>', { wait: 1, ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure', async () => {
            const result = await thisContext.toHaveHTML(element, 'foo', { wait: 0 })

            expect(result.pass).toBe(false)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveHTML(element, '<div>foo</div>', { wait: 0 })

            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveHTML(element, '<div>foo</div>')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have HTML

Expected [not]: "<div>foo</div>"
Received      : "<div>foo</div>"`
            )
        })

        test('not - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveHTML(element, 'foobar')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('should return true if actual html + single replacer matches the expected html', async () => {
            const result = await thisContext.toHaveHTML(element, '<div>bar</div>', { wait: 1, replace: ['foo', 'bar'] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual html + replace (string) matches the expected html', async () => {
            const result = await thisContext.toHaveHTML(element, '<div>bar</div>', { wait: 1, replace: [['foo', 'bar']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual html + replace (regex) matches the expected html', async () => {
            const result = await thisContext.toHaveHTML(element, '<div>bar</div>', { wait: 1, replace: [[/foo/, 'bar']] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual html starts with expected html', async () => {
            const result = await thisContext.toHaveHTML(element, '<div>', { wait: 1, atStart: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual html ends with expected html', async () => {
            const result = await thisContext.toHaveHTML(element, '</div>', { wait: 1, atEnd: true })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual html contains the expected html at the given index', async () => {
            const result = await thisContext.toHaveHTML(element, 'iv>foo', { wait: 1, atIndex: 2 })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual html equals the expected html with includeSelectorTag set to false', async () => {
            vi.mocked(element.getHTML).mockImplementation(async ({ includeSelectorTag}: { includeSelectorTag: boolean }) => {
                return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
            })

            const result = await thisContext.toHaveHTML(element, '<div>foo</div>', { wait: 1, includeSelectorTag: false })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual html equals the expected html with includeSelectorTag set to true', async () => {
            vi.mocked(element.getHTML).mockImplementation(async ({ includeSelectorTag}: { includeSelectorTag: boolean }) => {
                return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
            })

            const result = await thisContext.toHaveHTML(element, '<div><div>foo</div></div>', {
                wait: 1,
                includeSelectorTag: true,
            })
            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            vi.mocked(element.getHTML).mockResolvedValue('')
            const result = await thisContext.toHaveHTML(element, '<div>foo</div>')

            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have HTML

Expected: "<div>foo</div>"
Received: ""`)
        })

        test('success if array matches with html and ignoreCase', async () => {
            const result = await thisContext.toHaveHTML(element, ['div', '<div>foo</div>'], { wait: 1, ignoreCase: true })

            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with html and trim', async () => {
            vi.mocked(element.getHTML).mockResolvedValue('   <div>foo</div>   ')

            const result = await thisContext.toHaveHTML(element, ['div', '<div>foo</div>', 'toto'], { wait: 1, trim: true })
            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with html and replace (string)', async () => {
            const result = await thisContext.toHaveHTML(element, ['div', '<div>foo</div>', 'toto'], {
                wait: 1,
                replace: [['Web', 'Browser']],
            })

            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with html and replace (regex)', async () => {
            const result = await thisContext.toHaveHTML(element, ['div', '<div>foo</div>', 'toto'], {
                wait: 1,
                replace: [[/Web/g, 'Browser']],
            })

            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('success if array matches with html and multiple replacers and one of the replacers is a function', async () => {
            const result = await thisContext.toHaveHTML(element, ['div', '<p>foo</p>', 'toto'], {
                wait: 1,
                replace: [
                    [/div/g, 'p'],
                    [/[A-Z]/g, (match: string) => match.toLowerCase()],
                ],
            })

            expect(result.pass).toBe(true)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        test('failure if array does not match with html', async () => {
            const result = await thisContext.toHaveHTML(element, ['div', 'foo'])

            expect(result.pass).toBe(false)
            expect(element.getHTML).toHaveBeenCalledTimes(1)
        })

        describe('with RegExp', () => {
            beforeEach(async () => {
                vi.mocked(element.getHTML).mockResolvedValue('This is example HTML')
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveHTML(element, /ExAmplE/i)
                expect(result.pass).toBe(true)
            })

            test('success if array matches with RegExp', async () => {
                const result = await thisContext.toHaveHTML(element, ['div', /ExAmPlE/i])
                expect(result.pass).toBe(true)
            })

            test('success if array matches with html', async () => {
                const result = await thisContext.toHaveHTML(element, ['This is example HTML', /Webdriver/i])
                expect(result.pass).toBe(true)
            })

            test('success if array matches with html and ignoreCase', async () => {
                const result = await thisContext.toHaveHTML(element, ['ThIs Is ExAmPlE HTML', /Webdriver/i], {
                    wait: 1,
                    ignoreCase: true,
                })
                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveHTML(element, /Webdriver/i)
                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have HTML

Expected: /Webdriver/i
Received: "This is example HTML"`
                )
            })

            test('failure if array does not match with html', async () => {
                const result = await thisContext.toHaveHTML(element, ['div', /Webdriver/i])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have HTML

Expected: ["div", /Webdriver/i]
Received: "This is example HTML"`
                )
            })
        })
    })

    describe('given multiple elements', () => {
        let elements: ChainablePromiseArray

        beforeEach(async () => {
            elements = await $$('sel')

            expect(elements).toHaveLength(2)
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

        })

        test('wait for success', async () => {
            elements.forEach(el => vi.mocked(el.getHTML)
                .mockResolvedValueOnce('')
                .mockResolvedValueOnce('')
                .mockResolvedValue('<div>foo</div>')
            )

            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveHTML(elements, '<div>foo</div>', { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getHTML).toHaveBeenCalledTimes(3))
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveHTML',
                expectedValue: '<div>foo</div>',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveHTML',
                expectedValue: '<div>foo</div>',
                options: { ignoreCase: true, beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but failure', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockRejectedValue(new Error('some error')))

            await expect(() => thisContext.toHaveHTML(elements, '<div>foo</div>', { ignoreCase: true, wait: 1 }))
                .rejects.toThrow('some error')
        })

        test('success on the first attempt', async () => {
            const result = await thisContext.toHaveHTML(elements, '<div>foo</div>', { ignoreCase: true })

            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getHTML).toHaveBeenCalledTimes(1))
        })

        test('no wait - failure', async () => {
            const result = await thisContext.toHaveHTML(elements, 'foo', { wait: 0 })

            expect(result.pass).toBe(false)
            elements.forEach(el => expect(el.getHTML).toHaveBeenCalledTimes(1))
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveHTML(elements, '<div>foo</div>', { wait: 0 })

            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getHTML).toHaveBeenCalledTimes(1))
        })

        test('not - failure on all elements - pass should be true', async () => {
            const result = await thisNotContext.toHaveHTML(elements, '<div>foo</div>')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have HTML

Expected [not]: ["<div>foo</div>", "<div>foo</div>"]
Received      : ["<div>foo</div>", "<div>foo</div>"]`
            )
        })

        test('not - failure on first element - pass should be true', async () => {
            vi.mocked(elements[0].getHTML).mockResolvedValue('<div>foo</div>')
            vi.mocked(elements[1].getHTML).mockResolvedValue('<div>fii</div>')

            const result = await thisNotContext.toHaveHTML(elements, '<div>foo</div>')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) not to have HTML

Expected [not]: ["<div>foo</div>", "<div>foo</div>"]
Received      : ["<div>foo</div>", "<div>fii</div>"]`
            )
        })

        test('not - succcess - pass should be false', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div></div>'))

            const result = await thisNotContext.toHaveHTML(elements, '<div>foo</div>')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        test('should return true if actual html + single replacer matches the expected html', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

            const result = await thisContext.toHaveHTML(elements, '<div>bar</div>', { replace: ['foo', 'bar'] })

            expect(result.pass).toBe(true)
        })

        test('should return true if actual html + replace (string) matches the expected html', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

            const result = await thisContext.toHaveHTML(elements, '<div>bar</div>', { replace: [['foo', 'bar']] })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual html + replace (regex) matches the expected html', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

            const result = await thisContext.toHaveHTML(elements, '<div>bar</div>', { replace: [[/foo/, 'bar']] })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual html starts with expected html', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

            const result = await thisContext.toHaveHTML(elements, '<div>', { atStart: true })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual html ends with expected html', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

            const result = await thisContext.toHaveHTML(elements, '</div>', { atEnd: true })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual html contains the expected html at the given index', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

            const result = await thisContext.toHaveHTML(elements, 'iv>foo', { atIndex: 2 })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual html equals the expected html with includeSelectorTag set to false', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockImplementation(async ({ includeSelectorTag}: { includeSelectorTag: boolean }) => {
                return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
            }))

            const result = await thisContext.toHaveHTML(elements, '<div>foo</div>', { includeSelectorTag: false })
            expect(result.pass).toBe(true)
        })

        test('should return true if actual html equals the expected html with includeSelectorTag set to true', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockImplementation(async ({ includeSelectorTag}: { includeSelectorTag: boolean }) => {
                return includeSelectorTag ? '<div><div>foo</div></div>' : '<div>foo</div>'
            }))

            const result = await thisContext.toHaveHTML(elements, '<div><div>foo</div></div>', {
                includeSelectorTag: true,
            })
            expect(result.pass).toBe(true)
        })

        test('message', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue(''))

            const result = await thisContext.toHaveHTML(elements, '<div>foo</div>')

            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have HTML

- Expected  - 2
+ Received  + 2

  Array [
-   "<div>foo</div>",
-   "<div>foo</div>",
+   "",
+   "",
  ]`
            )
        })

        test('fails if not an array exact match even if one element matches - not supporting any array value match', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>foo</div>'))

            const result = await thisContext.toHaveHTML(elements, ['div', '<div>foo</div>'])
            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have HTML

- Expected  - 1
+ Received  + 1

  Array [
-   "div",
+   "<div>foo</div>",
    "<div>foo</div>",
  ]`
            )
        })

        test('fails if expect and actual array length do not match', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('   <div>foo</div>   '))

            const result = await thisContext.toHaveHTML(elements, ['div', '<div>foo</div>', 'toto'], { trim: true, wait: 0 })
            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have HTML

- Expected  - 3
+ Received  + 1

  Array [
-   "div",
-   "<div>foo</div>",
-   "toto",
+   "Received array length 2, expected 3",
  ]`
            )
        })

        test('success if array matches with html and ignoreCase', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>FOO</div>'))

            const result = await thisContext.toHaveHTML(elements, ['<div>foo</div>', '<div>foo</div>'], { ignoreCase: true })
            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getHTML).toHaveBeenCalledTimes(1))
        })

        test('success if array matches with html and trim', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('   <div>foo</div>   '))

            const result = await thisContext.toHaveHTML(elements, ['<div>foo</div>', '<div>foo</div>'], { trim: true })
            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getHTML).toHaveBeenCalledTimes(1))
        })

        test('success if array matches with html and multiple replacers and one of the replacers is a function', async () => {
            elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('<div>FOO</div>'))

            const result = await thisContext.toHaveHTML(elements, ['<p>foo</p>', '<p>foo</p>'], {
                replace: [
                    [/div/g, 'p'],
                    [/[A-Z]/g, (match: string) => match.toLowerCase()],
                ],
            })
            expect(result.pass).toBe(true)
            elements.forEach(el => expect(el.getHTML).toHaveBeenCalledTimes(1))
        })

        describe('with RegExp', () => {
            beforeEach(async () => {
                elements.forEach(el => vi.mocked(el.getHTML).mockResolvedValue('This is example HTML'))
            })

            test('success if match', async () => {
                const result = await thisContext.toHaveHTML(elements, /ExAmplE/i)
                expect(result.pass).toBe(true)
            })

            test('success if array matches with RegExp', async () => {
                const result = await thisContext.toHaveHTML(elements, ['This is example HTML', /ExAmPlE/i])
                expect(result.pass).toBe(true)
            })

            test('success if array matches with html and ignoreCase', async () => {
                const result = await thisContext.toHaveHTML(elements, ['ThIs Is ExAmPlE HTML', /ExAmPlE/i], {
                    ignoreCase: true,
                })
                expect(result.pass).toBe(true)
            })

            test('failure if no match', async () => {
                const result = await thisContext.toHaveHTML(elements, /Webdriver/i)

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have HTML

- Expected  - 2
+ Received  + 2

  Array [
-   /Webdriver/i,
-   /Webdriver/i,
+   "This is example HTML",
+   "This is example HTML",
  ]`
                )
            })

            test('failure if array does not match with html', async () => {
                const result = await thisContext.toHaveHTML(elements, ['div', /Webdriver/i])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`sel\`) to have HTML

- Expected  - 2
+ Received  + 2

  Array [
-   "div",
-   /Webdriver/i,
+   "This is example HTML",
+   "This is example HTML",
  ]`
                )
            })
        })
    })
})
