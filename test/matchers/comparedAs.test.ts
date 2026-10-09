import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { createRequire } from 'node:module'
import stripAnsi from 'strip-ansi'
import { printDiffOrStringify, stringify } from 'jest-matcher-utils'
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
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock, elementArrayFactory, multiRemoteBrowserFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

/**
 * When the string options change the actual value, the failure message also shows the value that the matcher compared:
 * after `Received` for one element or one browser, and after each received value that failed in the diff of `$$()` and
 * multi-remote values.
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

describe('the diff of $$() and multi-remote values shows the compared value after each received value that failed', () => {
    const thisContext = {}
    const thisNotContext = { isNot: true }
    const options = { wait: 0, ignoreCase: true }

    const elementsWithTexts = (...texts: string[]) => {
        const elements = elementArrayFactory('items', texts.length)
        elements.forEach((element, index) => vi.mocked(element.getText).mockResolvedValue(texts[index]))
        return elements
    }

    test('on $$(), not after an element that passed', async () => {
        const result = await toHaveText.call(thisContext, elementsWithTexts('  Foo  ', '  Baz  '), ['foo', 'qux'], options)

        expect(stripAnsi(result.message())).toEqual(`\
Expect $$(\`items\`) to have text

- Expected  - 1
+ Received  + 1

  Array [
    trimmedIgnoringCase<"foo">,
-   trimmedIgnoringCase<"qux">,
+   "  Baz  ", (compared as "baz")
  ]`)
    })

    test('on $$(), after each element that failed', async () => {
        const result = await toHaveText.call(thisContext, elementsWithTexts('  Foo  ', '  Bar  '), 'qux', options)

        expect(stripAnsi(result.message())).toContain(`\
+   "  Foo  ", (compared as "foo")
+   "  Bar  ", (compared as "bar")
  ]`)
    })

    test('on $$() with more expected values than elements', async () => {
        const result = await toHaveText.call(thisContext, elementsWithTexts('  Foo  ', '  Baz  '), ['foo', 'qux', 'other'], options)

        expect(stripAnsi(result.message())).toContain(`\
-   trimmedIgnoringCase<"qux">,
-   ignoringCase<"other">,
+   "  Baz  ", (compared as "baz")
+   undefined,
  ]`)
    })

    test('on a multi-remote browser', async () => {
        const chrome = browserFactory()
        const firefox = browserFactory()
        vi.mocked(chrome.getTitle).mockResolvedValue(' Hello ')
        vi.mocked(firefox.getTitle).mockResolvedValue('  Bye  ')

        const result = await toHaveTitle.call(thisContext, multiRemoteBrowserFactory({ chrome, firefox }), 'hello', options)

        expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": trimmedIgnoringCase<"hello">,
-   "firefox": trimmedIgnoringCase<"hello">,
+   "firefox": "  Bye  ", (compared as "bye")
  }`)
    })

    test('on a multi-remote $()', async () => {
        const element = createMultiRemoteElementMock({ chrome: browserFactory(), firefox: browserFactory() }, 'sel')
        vi.mocked(element.getInstance('chrome').getText).mockResolvedValue(' Hello ')
        vi.mocked(element.getInstance('firefox').getText).mockResolvedValue('  Bye  ')

        const result = await toHaveText.call(thisContext, element, 'hello', options)

        expect(stripAnsi(result.message())).toContain(`\
    "chrome": trimmedIgnoringCase<"hello">,
-   "firefox": trimmedIgnoringCase<"hello">,
+   "firefox": "  Bye  ", (compared as "bye")
  }`)
    })

    test('on a multi-remote $$()', async () => {
        const elements = createMultiRemoteElementArrayMock({ chrome: browserFactory(), firefox: browserFactory() }, 'sel', 2)
        const texts = { chrome: [' A ', ' B '], firefox: [' A ', '  C  '] }
        elements.forEach((element) => {
            for (const [name, [first, second]] of Object.entries(texts)) {
                vi.mocked(element.getInstance(name).getText).mockResolvedValue(element === elements[0] ? first : second)
            }
        })

        const result = await toHaveText.call(thisContext, elements, ['a', 'b'], options)

        expect(stripAnsi(result.message())).toContain(`\
    "firefox": Array [
      trimmedIgnoringCase<"a">,
-     trimmedIgnoringCase<"b">,
+     "  C  ", (compared as "c")
    ],
  }`)
    })

    test('on $$() with .not, after each element that matched', async () => {
        const result = await toHaveText.call(thisNotContext, elementsWithTexts('  Foo  ', 'Bar'), ['foo', 'qux'], options)

        expect(result.pass).toBe(true) // failure, inverted later because of `.not`
        expect(stripAnsi(result.message())).toMatch(/\nReceived +: \["  Foo  " \(compared as "foo"\), "Bar"\]$/)
    })

    test('with the quotes and backslashes that Jest escapes', async () => {
        const result = await toHaveText.call(thisContext, elementsWithTexts('ok', ' Say "Hi" \\o/ '), ['ok', 'other'], options)

        expect(stripAnsi(result.message())).toContain('+   " Say \\"Hi\\" \\\\o/ ", (compared as "say \\"hi\\" \\\\o/")')
    })

    test.each([
        { name: 'the options do not change the value', texts: ['foo', 'bar'], expected: ['foo', 'qux'] as unknown },
        { name: 'the same text was compared in 2 ways (a string and a RegExp)', texts: ['  BAR  ', '  BAR  '], expected: ['qux', /qux/] as unknown },
    ])('not when $name', async ({ texts, expected }) => {
        const result = await toHaveText.call(thisContext, elementsWithTexts(...texts), expected as string[], options)

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).not.toContain('compared as')
    })

    test('not for a multiline value', async () => {
        const elements = elementArrayFactory('items', 2)
        vi.mocked(elements[0].getHTML).mockResolvedValue('<b>ok</b>')
        vi.mocked(elements[1].getHTML).mockResolvedValue('  <ul>\n  <li>Tea</li>\n</ul>  ')

        const result = await toHaveHTML.call(thisContext, elements, ['<b>ok</b>', '<ul></ul>'], options)

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).not.toContain('compared as')
    })
})

/**
 * The compared value is added to the text of Jest's diff. These tests fail when a Jest upgrade changes what it depends
 * on: a received value that failed is one `+` line, `<indentation><"key": >?<stringify(value)>,`, in one color.
 */
describe("the format of Jest's diff that the compared value depends on", () => {
    const requireFromHere = createRequire(import.meta.url)
    const requireFromJest = createRequire(requireFromHere.resolve('jest-matcher-utils'))
    // The colors of jest-matcher-utils and jest-diff, off in the tests unless forced
    const jestChalks = [requireFromJest('chalk'), createRequire(requireFromJest.resolve('jest-diff'))('chalk')]
    const levels = jestChalks.map((chalk) => chalk.level)
    beforeAll(() => jestChalks.forEach((chalk) => chalk.level = 1))
    afterAll(() => jestChalks.forEach((chalk, index) => chalk.level = levels[index]))

    const red = (text: string) => `\u001b[31m${text}\u001b[39m`
    const diffLines = (expected: unknown, received: unknown) => printDiffOrStringify(expected, received, 'Expected', 'Received', true).split('\n')
    const value = '  a "b" \\c  '

    test('prints a received value of a list on one line, in red, as stringify() prints it, with a comma', () => {
        expect(diffLines(['x', 'y'], ['x', value])).toContain(red(`+   ${stringify(value)},`))
    })

    test('prints a received value of per-instance values after its quoted key', () => {
        expect(diffLines({ chrome: 'x', firefox: 'y' }, { chrome: 'x', firefox: value })).toContain(red(`+   "firefox": ${stringify(value)},`))
    })

    test('prints a received value of a nested list with more indentation', () => {
        expect(diffLines({ firefox: ['x', 'y'] }, { firefox: ['x', value] })).toContain(red(`+     ${stringify(value)},`))
    })

    test('prints the change counts of the header without a comma', () => {
        expect(diffLines(['x'], ['y']).slice(0, 2)).toEqual(['\u001b[32m- Expected  - 1\u001b[39m', red('+ Received  + 1')])
    })

    test('the colored message of $$() has the compared value after the red line', async () => {
        const elements = elementArrayFactory('items', 2)
        vi.mocked(elements[0].getText).mockResolvedValue('Foo')
        vi.mocked(elements[1].getText).mockResolvedValue('  Baz  ')

        const result = await toHaveText.call({}, elements, ['foo', 'qux'], { wait: 0, ignoreCase: true })

        expect(result.message().split('\n')).toContain(`${red('+   "  Baz  ",')} (compared as ${red('"baz"')})`)
    })

    test('the colored message of a multi-remote browser has the compared value after the red line', async () => {
        const chrome = browserFactory()
        const firefox = browserFactory()
        vi.mocked(chrome.getTitle).mockResolvedValue('hello')
        vi.mocked(firefox.getTitle).mockResolvedValue('  Bye  ')

        const result = await toHaveTitle.call({}, multiRemoteBrowserFactory({ chrome, firefox }), 'hello', { wait: 0, ignoreCase: true })

        expect(result.message().split('\n')).toContain(`${red('+   "firefox": "  Bye  ",')} (compared as ${red('"bye"')})`)
    })
})
