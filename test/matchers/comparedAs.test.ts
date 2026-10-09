import { describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { toHaveText } from '../../src/matchers/element/toHaveText.js'
import { toHaveHTML } from '../../src/matchers/element/toHaveHTML.js'
import { toHaveAttribute } from '../../src/matchers/element/toHaveAttribute.js'
import { toHaveElementProperty } from '../../src/matchers/element/toHaveElementProperty.js'
import { toHaveComputedLabel } from '../../src/matchers/element/toHaveComputedLabel.js'
import { toHaveComputedRole } from '../../src/matchers/element/toHaveComputedRole.js'
import { toHaveElementClass } from '../../src/matchers/element/toHaveElementClass.js'
import { toHaveTitle } from '../../src/matchers/browser/toHaveTitle.js'
import { toHaveUrl } from '../../src/matchers/browser/toHaveUrl.js'
import { toHaveClipboardText } from '../../src/matchers/browser/toHaveClipboardText.js'
import { toHaveLocalStorageItem } from '../../src/matchers/browser/toHaveLocalStorageItem.js'
import { expect as wdioExpect } from '../../src/index.js'
import { browserFactory, elementArrayFactory, multiRemoteBrowserFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

/**
 * When the string options change the actual value, the failure message also shows the value that the matcher compared,
 * after `Received`, for one element or one browser.
 */
describe('Received shows the compared value when the string options changed it', () => {
    const thisContext = {}
    const thisNotContext = { isNot: true }
    const wait = { wait: 0 }

    const elementWithText = (text: string) => {
        const [element] = elementArrayFactory('items', 1)
        vi.mocked(element.getText).mockResolvedValue(text)
        return element
    }

    test('with trim and ignoreCase', async () => {
        const result = await toHaveText.call(thisContext, elementWithText('  Hello World  '), 'Other', { ...wait, ignoreCase: true })

        expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`)[0] to have text

Expected (trimmedIgnoringCase): "Other"
Received:                       "  Hello World  " (compared as "hello world")`)
    })

    test('with replace', async () => {
        const result = await toHaveText.call(thisContext, elementWithText('Hello World'), 'Other', { ...wait, replace: ['World', 'There'] })

        expect(stripAnsi(result.message())).toMatch(/\nReceived: +"Hello World" \(compared as "Hello There"\)$/)
    })

    test('with .not', async () => {
        const result = await toHaveText.call(thisNotContext, elementWithText('  Hello  '), 'hello', { ...wait, ignoreCase: true })

        expect(result.pass).toBe(true) // failure, inverted later because of `.not`
        expect(stripAnsi(result.message())).toMatch(/\nReceived +: "  Hello  " \(compared as "hello"\)$/)
    })

    test('with a RegExp and ignoreCase: the value is only trimmed, the RegExp gets the i flag', async () => {
        const result = await toHaveText.call(thisContext, elementWithText('  Hello  '), /other/, { ...wait, ignoreCase: true })

        expect(stripAnsi(result.message())).toContain('Received: "  Hello  " (compared as "Hello")')
    })

    test.each([
        { name: 'the options do not change the value', text: 'Hello', expected: 'Other' as unknown, options: {} },
        { name: 'trim: false', text: '  Hello  ', expected: 'Other' as unknown, options: { trim: false } },
        { name: 'expect.oneOf(), which compares each value with its own options', text: '  Hello  ', expected: wdioExpect.oneOf('a', /b/), options: { ignoreCase: true } },
    ])('not when $name', async ({ text, expected, options }) => {
        const result = await toHaveText.call(thisContext, elementWithText(text), expected as string, { ...wait, ...options })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).not.toContain('compared as')
    })

    test.each([
        { name: 'a string, where Jest shows a line diff', expected: '<ul>\n  <li>Milk</li>\n</ul>' as string | RegExp },
        { name: 'a RegExp, where Received is one label with several lines', expected: /Milk/ as string | RegExp },
    ])('not for a multiline value, with $name', async ({ expected }) => {
        const [element] = elementArrayFactory('items', 1)
        vi.mocked(element.getHTML).mockResolvedValue('  <ul>\n  <li>Tea</li>\n</ul>  ')

        const result = await toHaveHTML.call(thisContext, element, expected, { ...wait, ignoreCase: true })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).not.toContain('compared as')
    })

    test('not on $$(), where Received is in the diff', async () => {
        const elements = elementArrayFactory('items', 2)
        elements.forEach((element) => vi.mocked(element.getText).mockResolvedValue('  Hello  '))

        const result = await toHaveText.call(thisContext, elements, 'Other', { ...wait, ignoreCase: true })

        expect(stripAnsi(result.message())).not.toContain('compared as')
    })

    test('not on a multi-remote browser, where Received is in the diff', async () => {
        const chrome = browserFactory()
        const firefox = browserFactory()
        vi.mocked(chrome.getTitle).mockResolvedValue('  Hello  ')
        vi.mocked(firefox.getTitle).mockResolvedValue('  Hello  ')

        const result = await toHaveTitle.call(thisContext, multiRemoteBrowserFactory({ chrome, firefox }), 'Other', { ...wait, ignoreCase: true })

        expect(stripAnsi(result.message())).not.toContain('compared as')
    })

    test('not with toHaveElementClass, which compares each class', async () => {
        const [element] = elementArrayFactory('items', 1)
        vi.mocked(element.getAttribute).mockResolvedValue('  BTN  ')

        const result = await toHaveElementClass.call(thisContext, element, 'other', { ...wait, ignoreCase: true })

        expect(stripAnsi(result.message())).not.toContain('compared as')
    })

    describe('in every matcher that compares one string', () => {
        const options = { ...wait, ignoreCase: true }
        const value = '  BAR  '
        const shown = new RegExp(`\\nReceived: +"${value}" \\(compared as "bar"\\)$`)

        test.each([
            { name: 'toHaveText', getter: 'getText', run: (e: WebdriverIO.Element) => toHaveText.call(thisContext, e, 'foo', options) },
            { name: 'toHaveHTML', getter: 'getHTML', run: (e: WebdriverIO.Element) => toHaveHTML.call(thisContext, e, 'foo', options) },
            { name: 'toHaveAttribute', getter: 'getAttribute', run: (e: WebdriverIO.Element) => toHaveAttribute.call(thisContext, e as never, 'data-x', 'foo', options) },
            { name: 'toHaveElementProperty', getter: 'getProperty', run: (e: WebdriverIO.Element) => toHaveElementProperty.call(thisContext, e as never, 'value', 'foo', options) },
            { name: 'toHaveComputedLabel', getter: 'getComputedLabel', run: (e: WebdriverIO.Element) => toHaveComputedLabel.call(thisContext, e, 'foo', options) },
            { name: 'toHaveComputedRole', getter: 'getComputedRole', run: (e: WebdriverIO.Element) => toHaveComputedRole.call(thisContext, e, 'foo', options) },
        ] as const)('$name on one element', async ({ getter, run }) => {
            const [element] = elementArrayFactory('items', 1)
            vi.mocked(element[getter]).mockResolvedValue(value as never)

            const result = await run(element)

            expect(stripAnsi(result.message())).toMatch(shown)
        })

        test.each([
            { name: 'toHaveTitle', mock: (b: WebdriverIO.Browser) => vi.mocked(b.getTitle).mockResolvedValue(value), run: (b: WebdriverIO.Browser) => toHaveTitle.call(thisContext, b as never, 'foo', options) },
            { name: 'toHaveUrl', mock: (b: WebdriverIO.Browser) => vi.mocked(b.getUrl).mockResolvedValue(value), run: (b: WebdriverIO.Browser) => toHaveUrl.call(thisContext, b as never, 'foo', options) },
            { name: 'toHaveClipboardText', mock: (b: WebdriverIO.Browser) => vi.mocked(b.execute).mockResolvedValue(value), run: (b: WebdriverIO.Browser) => toHaveClipboardText.call(thisContext, b as never, 'foo', options) },
            { name: 'toHaveLocalStorageItem', mock: (b: WebdriverIO.Browser) => vi.mocked(b.execute).mockResolvedValue(value), run: (b: WebdriverIO.Browser) => toHaveLocalStorageItem.call(thisContext, b as never, 'key', 'foo', options) },
        ])('$name on one browser', async ({ mock, run }) => {
            const browser = browserFactory()
            mock(browser)

            const result = await run(browser)

            expect(stripAnsi(result.message())).toMatch(shown)
        })
    })
})
